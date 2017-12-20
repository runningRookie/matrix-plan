$(document).ready(function () {

	    var vm = new Vue({
	        el: '#hotelDetailPriceInfoVM',
	        data: {
				order:{},
	        	hotelDetailPriceInfo:{}
	        },
	        ready: function () {
	            var data = {orderNo: window.orderNo};
				$.getJSON(__ctx + "/hotel/getHotelOrderByOrderNo", data, function (result) {
	                vm.order = result.obj;
	            });
	            $.getJSON(__ctx + "/hotel/getHotelDetailPriceInfoByOrderNo", data, function (result) {
	                vm.hotelDetailPriceInfo = result.obj;
	            });            
	        }
	    });
		
});