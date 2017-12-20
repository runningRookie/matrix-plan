$(document).ready(function () {

	//内部备注处理
    $('#innerTextSubmitBtn').click(function () {
        var innerText = $('#hotelOnChangeInnerText').val();
        if (!innerText) {
            toastr.error("请输入内部备注", "", toastrConfig);
            return;
        }
        var params = {
            remark: innerText,
            orderNo: window.orderNo,
            remarkType: 1
        };
        $.post(__ctx + "/hotel/insertRemark" , params, function (result) {
            if (!result.result) {
                toastr.error("保存失败", "", toastrConfig);
                return;
            }
            toastr.success("保存成功", "", toastrConfig);
			tc.hotel.logs.refresh();
        });
    });

});