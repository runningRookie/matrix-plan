$(document).ready(function () {
    $("#loginBtn").click(function () {
        var username = $("#username").val().trim();
        var password = $("#password").val().trim();
        var tmccode = $("#tmccode").val().trim();
        if (!tmccode || !username || !password) {
            toastr.error("请正确输入登录信息", "", {timeOut: 3000, positionClass: "toast-top-center"});
            return false;
        }
        $("#j_username").val(tmccode + "," + username);
        $("#loginForm").submit();
    });
});
function keyLogin(){
    if (event.keyCode==13)  {
        $("#loginBtn").click();
    }
}


function hideTip(e) {
    $("#forgetTip").css("display", "none")
}
function showTip(e) {
    var x = e.pageX;
    var y = e.pageY;
    $("#forgetTip").css("left", x + 55);
    $("#forgetTip").css("top", y);
    $("#forgetTip").css("display", "block");
}