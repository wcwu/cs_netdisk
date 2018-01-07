#coding=utf-8
import tornado.web
import datetime
import os
import shutil
import urllib
from pdf_watermark import *
import logging

logger = logging.getLogger("login")
BASE_PATH = 'static/file/'
TMP_PATH = 'static/tmp/'
class BaseHandler(tornado.web.RequestHandler):
    @property
    def db(self):
        return self.application.db
    
    def get_db(self):
        return self.application.db.get_db()

    def get_login_url(self):
        return u"/signin.html"

    def get_current_user(self):
        user_json = self.get_secure_cookie("user")
        if user_json:
            #print tornado.escape.json_decode(user_json)
            return tornado.escape.json_decode(user_json)
        else:
            return None

class UserlogHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        resp = []
        with open('logs/warn_log', 'r') as rf:
            for line in rf:
                if ("WARNING" in line) and ("tornado" not in line):
                    resp.append(line)
        self.finish({'code':200, 'message': 'ok', 'content':resp})


class PasswordResetHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        #self.render("password-reset.html")
        username=self.get_current_user()
        info = self.get_db().get("SELECT * FROM lp_user WHERE name = %s", username)
        if info: #exist
            file_id = self.get_db().execute("UPDATE lp_user SET hashed_password='%s' WHERE name='%s'" % (self.get_argument('new_password'), username))    
        self.render("password-reset.html", username=username, hidden="")

    @tornado.web.authenticated
    def get(self):
        username=self.get_current_user()
        self.render("password-reset.html", username=username, hidden="")

class IndexHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.redirect("/index.html")

    @tornado.web.authenticated
    def post(self):
        pass

class ClosePdfHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        pass


class DirListHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        cur_id = self.get_argument('dir_id')
        resp = {'file':[], 'dir':[]}
        file_info = self.get_db().query("SELECT * FROM file_info WHERE parent_id = %s and is_deleted=false", cur_id)

        #path_names = []
        path_ids = []
        if cur_id != "0":
            paths = self.get_db().get("SELECT file_path FROM file_info WHERE file_id = %s and is_deleted=false", cur_id)
            ids = []
            ids.extend(paths.file_path[:-1].split('/'))#remove last /
            ids.append(cur_id)
            print ids
            for id in ids[1:]:#skip 0
                info = self.get_db().get('SELECT file_name FROM file_info WHERE file_id = %s', id)
                path_ids.append({id:info.file_name})
        #print file_info
        for file_dir in file_info:
            if file_dir.file_attr == 0:
                resp['dir'].append({'id':file_dir.file_id, 'name':file_dir.file_name, 'attr':file_dir.file_attr,'create_time':file_dir.create_time.strftime('%Y-%m-%d %H:%M:%S')})
            else:
                resp['file'].append({'id':file_dir.file_id, 'name':file_dir.file_name, 'attr':file_dir.file_attr,'create_time':file_dir.create_time.strftime('%Y-%m-%d %H:%M:%S')})
        resp['path_ids'] = path_ids
        print path_ids
        #print resp['create_time']

        self.finish({'code':200, 'message': 'ok', 'content':resp})



class MainHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        #self.set_cookie('_xsrf',self.xsrf_token)
        username=self.get_current_user()
        if username == 'admin':
            self.render("index.html", username=username, hidden="")
        else:
            self.render("index.html", username=username, hidden="display:none")

class AddOrRenameHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        pass
        #self.render("index.html", username=self.get_current_user())

    @tornado.web.authenticated
    def post(self):
        action_type = self.get_argument('action_type')
        file_name = self.get_argument('folder_name') 
        file_id = self.get_argument("file_id")
        create_time = self.get_argument('create_time')        
        parent_id = self.get_argument('parent_id')
        file_path = self.get_argument('parent_path')
        if action_type == "0":
            file_id = self.get_db().insert("INSERT INTO file_info(file_name, file_attr, create_time, parent_id, file_path) VALUES (%s,%s,%s,%s,%s)", file_name, 0, create_time, parent_id, file_path)
            if os.path.exists(BASE_PATH + file_path + str(file_id)):
                shutil.rmtree(BASE_PATH + file_path + str(file_id))
            os.mkdir(BASE_PATH + file_path + str(file_id))
        else:
            res  = self.get_db().get("SELECT file_attr, file_name, file_path FROM file_info WHERE file_id = %s",  file_id)
            print res.file_name, res.file_path, file_path 
            file_id = self.get_db().execute("UPDATE file_info SET file_name='%s' WHERE file_id='%s'" % (file_name, self.get_argument("file_id")))    
            if res.file_attr == 1: 
                os.rename(BASE_PATH + res.file_path + res.file_name, BASE_PATH + res.file_path + file_name)
        self.finish({'code':200, 'message': 'ok', 'content':{'dir_id':file_id}})

class UploadFileHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        path = self.get_argument('path');
        parent_id = self.get_argument('parent_id');
        create_time = self.get_argument('create_time');
	print path, parent_id, create_time
	for field_name, files in self.request.files.items():
            for info in files:
		print info.keys()
                filename, content_type = info['filename'], info['content_type']
                body = info['body']
		with open(BASE_PATH + path + filename, 'w') as wf:
                    wf.write(info['body'])
                #print filename.split('.')[-1]
                file_id = self.get_db().insert("INSERT INTO file_info(file_name, file_attr, create_time, parent_id, file_path, file_type) VALUES (%s,%s,%s,%s,%s,%s)", filename, 1, create_time, parent_id, path, content_type.split('/')[-1])
                print('POST "%s" "%s" %d bytes',filename, content_type, len(body))
        
class ClosePdfHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        if os.path.exists(TMP_PATH + user_cookie):
            shutil.rmtree(TMP_PATH + user_cookie)

class DownloadFileHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        path = self.get_argument("file_path")
        self.set_header("Content-Type", 'application/pdf; charset="utf-8"')
        self.set_header("Content-Disposition", "attachment; filename=" + urllib.quote_plus(path.split('/')[-1].encode('utf-8')))
   	try:
            with open(path, 'rb') as f:
                data = f.read()
                self.write(data)
        except:
            pass
        self.finish()
        logger.warn("[%s] download the pdf [%s]" % (self.get_current_user(), path))

class ViewTest(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render('viewer.html')


class DeleteFileHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        file_id = self.get_argument("file_id")
        file_info = self.get_db().get("SELECT file_path, file_name, file_attr  FROM file_info  WHERE file_id = %s", file_id)
        whole_path = file_info.file_path + file_info.file_name
        if os.path.exists(whole_path) and file_info.file_attr == 0:
            shutil.rmtree(whole_path)
        elif os.path.exists(whole_path) and file_info.file_attr == 1:
            os.remove(whole_path)
        self.get_db().execute("DELETE FROM file_info WHERE file_id='%s'"%file_id)
        self.finish({'code':200, 'message': 'ok', 'content':{}})

class PreviewPdfHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        file_id = self.get_argument("file_id")
        file_path = self.get_argument("file_path")
        xrsf = self.get_argument("file_id")
        file_info = self.get_db().get("SELECT file_path, file_name  FROM file_info  WHERE file_id = %s", file_id)
        user_cookie = self.get_cookie('user').split('|')[-1]
        print self.get_cookie('user')
        user = self.get_current_user()
        if os.path.exists(TMP_PATH + user_cookie):
            shutil.rmtree(TMP_PATH + user_cookie)
        os.mkdir(TMP_PATH + user_cookie)
        output_path = TMP_PATH + user_cookie +'/' + file_info.file_name 
        watermark_path = TMP_PATH + user_cookie + '/' + 'mark.pdf'
        create_watermark(watermark_path,  u"仅供 " + user + u" 审阅，请勿外传")
        #create_watermark(watermark_path,  "only for" + user + u"please not output")
        add_watermark(BASE_PATH + file_path + file_info.file_name, watermark_path, output_path)


        logger.warn("[%s] view the pdf [%s]" % (self.get_current_user(), file_info.file_name))
        self.finish({'code':200, 'message': 'ok', 'content':{'file_path':output_path}})

class ClosePdfHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        
        self.finish({'code':200, 'message': 'ok', 'content':{}})


class LoginHandler(BaseHandler):
    def get(self):
        #self.set_cookie('_xsrf',self.xsrf_token)
        self.render("signin.html", next=self.get_argument("next","/"))

    def post(self):
        username = self.get_argument("username", "")
        password = self.get_argument("password", "")
        # The authenticate method should match a username and password
        # to a username and password hash in the database users table.
        # Implementation left as an exercise for the reader.
        auth = self.db.authenticate(username, password)
        if auth:
            self.set_current_user(username)
            self.redirect(self.get_argument("next", u"/"))
            logger.warn("[%s] logined in" % username)
        else:
            error_msg = u"?error=" + tornado.escape.url_escape("Login incorrect.")
            self.redirect(u"/signin.html" + error_msg)

    def set_current_user(self, user):
        if user:
            self.set_secure_cookie("user", tornado.escape.json_encode(user))
        else:
            self.clear_cookie("user")

class LogoutHandler(BaseHandler):

    def get(self):
        logger.warn("[%s] logined out" % self.get_current_user())
        self.clear_cookie("user")
        self.redirect(u"/signin.html")
