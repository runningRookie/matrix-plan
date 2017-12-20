$(document).ready(function () {
    
    var hotelOrderLogVM = new Vue({
        el: '#hotelOrderLogVM',
        data: {
        	logs:[],
        	isShow: true
        },
        ready: function () {
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/hotel/getHotelOrderLogsByOrderNo", data, function (result) {
                hotelOrderLogVM.logs = result.obj;
            });			
        }
    });
	<!--new add-->
	var init = function () {
        var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/hotel/getHotelOrderLogsByOrderNo", data, function (result) {
                hotelOrderLogVM.logs = result.obj;
            });	
    };

    init();

    tc.ns('tc.hotel.change.toggleLogs', function () {
        hotelOrderLogVM.isShow = !hotelOrderLogVM.isShow;
    });

    tc.ns('tc.hotel.logs.refresh', function () {
        init();
    });
	
});