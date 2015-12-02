(function ($) {
    var clearInter = null;
    var validate = function ($UserName, $PassWord, $divMsg) {
        if ($UserName.val().length == 0)
        { $divMsg.html("用户名不能为空").fadeIn(); $UserName.focus(); clearInter=setInterval(function () { $divMsg.fadeOut() }, 5000); return false; }
        if ($PassWord.val().length ==0)
        { $divMsg.html("密码不能为空").fadeIn(); $PassWord.focus();clearInter= setInterval(function () { $divMsg.fadeOut() }, 5000); return false; }
        return true;
    };
    $(function () {
        var $UserName = $("#UserCode") || null;
        var $PassWord = $("#PassWord") || null;
        var $divMsg = $("#divMsg") || null;
        var $btnSubmit = $("#btnSubmit") || null;
        var $mainForm = $("#mainForm") || null;
        var params = window.location.search;
        var submit = function () {
            if (validate($UserName, $PassWord, $divMsg))
            {
                window.clearInterval(clearInter);
                $btnSubmit.val("登录中...");
                $mainForm.submit();
                //return false;
            }
        };
        $btnSubmit.click(submit);
        $UserName.keyup(function (e) {
            if (e.keyCode === 13) submit();
        });
        $PassWord.keyup(function (e) {
            if (e.keyCode === 13) submit();
        });

        //if (params.indexOf('?login=error') > -1) {
        //    $msg.css("display", "block").html("用户名或密码有误!");
        //};
    });
})(jQuery);