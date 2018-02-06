$(function() {
    $("#reset_confirm").click(function(e) {
        //var old_password = $("#old_password").val();
        var new_password = $("#new_password").val();
        var confirm_password = $("#confirmed_password").val();
        if (new_password != confirm_password) {
            alert("密码不匹配，请重新输入！")
        } else {
            $.post('password-reset.html', { 'new_password': hex_md5(new_password) },
                function(data, status) {
                    alert("密码设置成功！");
                    setTimeout(function(){ 
                        window.location.href = "/index.html";
                    },50); 
                });
        }
    });

    $("#reset_cancel").click(function(e) {
        window.location.href = "index.html"
    });
});
