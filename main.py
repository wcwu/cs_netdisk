import tornado.httpserver
import tornado.ioloop
import tornado.options
import os
import torndb
import logging
from login import *
from log_util import logging_config

from tornado.options import define, options
define("port", default=80, help="run on the given port", type=int)
define("mysql_host", default="127.0.0.1:3306", help="blog database host")
define("mysql_database", default="my_db", help="blog database name")
define("mysql_user", default="root", help="blog database user")
define("mysql_password", default="hello", help="blog database password")
define("access_log", default="logs/access_log", type=str)
define("debug_log", default="logs/debug_log", type=str)
define("info_log", default="logs/info_log", type=str)
define("warn_log", default="logs/warn_log", type=str)
define("err_log", default="logs/err_log", type=str)

define("log_level", default="info", type=str)

class DataBase():
    #def __init__(self):
    def connection(self):
        self.db = torndb.Connection(
            host=options.mysql_host, database=options.mysql_database,
            user=options.mysql_user, password=options.mysql_password)
    def authenticate(self, username, hashed_password):
        user_info = self.db.get("SELECT * FROM lp_user WHERE name = %s", username)
        #print user_info;
        if not user_info:
            return False
        if hashed_password == user_info.hashed_password: 
            return True
    def get_db(self):
        return self.db

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", IndexHandler),
            (r"/signin.html", LoginHandler),
            (r"/index.html", MainHandler),
            (r"/add_or_rename.html", AddOrRenameHandler),
            (r"/get_dir_list.html", DirListHandler),
            (r"/upload_file.html", UploadFileHandler),
            #(r"/entry/([^/]+)", EntryHandler),
            #(r"/compose", ComposeHandler),
            #(r"/auth/create", AuthCreateHandler),
            (r"/logout.html", LogoutHandler),
            (r"/preview_pdf.html", PreviewPdfHandler),
            (r"/delete_file.html", DeleteFileHandler),
            (r"/download_file.html", DownloadFileHandler),
            (r"/close_pdf.html", ClosePdfHandler),
            (r"/viewer.html", ViewTest),
            (r"/password-reset.html", PasswordResetHandler),
            (r"/get_user_log.html", UserlogHandler),
        ]
        settings = dict(
            #blog_title=u"Tornado Blog",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            #ui_modules={"Entry": EntryModule},
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            login_url="/signin.html",
            debug=True,
            #xsrf_cookies=True,
        )

        logging_config(
            options.access_log,
            options.debug_log,
            options.info_log,
            options.warn_log,
            options.err_log,
            options.log_level
        )

        super(Application, self).__init__(handlers, **settings)
        self.db = DataBase()
        self.db.connection()
        # Have one global connection to the blog DB across all handlers



if __name__ == "__main__":
    tornado.options.parse_command_line()
    #app = tornado.web.Application(handlers=[(r"/", LoginHandler)])
    logger = logging.getLogger("main")
    http_server = tornado.httpserver.HTTPServer(Application())
    #logger.info('port')
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
