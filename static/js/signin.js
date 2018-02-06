 $(function() {
     function getCookie(name) {
         var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
         return r ? r[1] : undefined;
     }

     function set_xsrf(data) {
         var secure_key = getCookie("__xsrf") || "";
         if (secure_key) {
             data["__xsrf"] = secure_key;
         }
         return data;
     }
     var data = { 'name': 'JianW' };
     set_xsrf(data);
     // body...
     var $login_btn = $("#login_button");
     $login_btn.click(function(e) {
         $.post('signin.html', { "username": $("#username").val(), "password": hex_md5($("#password").val()), "_xsrf": getCookie("_xsrf") }, function(data, status) {
             //alert("Data: " + data + "\nStatus: " + status);
             if(data.code==300)
                $("#error_hint").text('用户名或密码错误,请重新输入')
             else
                location.href = "index.html";
             //$("#")
         });
     });
 });
