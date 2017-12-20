$(document).ready(function () {

    $('#innerTextSubmitBtn').click(function () {
        var innerText = $('#flightOnChangeInnerText').val();
        if (!innerText) {
            toastr.error("请输入内部注释", "", toastrConfig);
            return;
        }
        var params = {
            innerText: innerText
        };
        $.post(__ctx + "/orders/" + window.orderNo + "/log", params, function (result) {
            if (!result.result) {
                toastr.error("提交失败", "", toastrConfig);
                return;
            }
            toastr.success("提交成功", "", toastrConfig);
            tc.flight.logs.refresh();
        });
    });

});