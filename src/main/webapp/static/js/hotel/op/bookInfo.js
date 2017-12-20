$(document).ready(function () {
	
	Vue.filter('servicePersonTypeFilter', {
        read: function (value, format) {
            if (value == 1) {
                return '老板';
            }
            if (value == 2) {
                return '秘书';
            }      
			if (value == 3) {
                return '司机';
            }    			
        },
        write: function (value, format) {
            return value;
        }
    });

	    var vm = new Vue({
	        el: '#bookInfoVM',
	        data: {
	        	hotelServicePerson:[],
	        	hotelBookPerson:{},
	        	hotelItem:[]
	        },
	        ready: function () {
	            var data = {orderNo: window.orderNo};
				$.getJSON(__ctx + "/hotel/getHotelServicePersonByOrderNo", data, function (result) {
	                vm.hotelServicePerson = result.obj;
	            });
				$.getJSON(__ctx + "/hotel/getHotelBookPersonByOrderNo", data, function (result) {
	                vm.hotelBookPerson = result.obj;
	            });
				$.getJSON(__ctx + "/hotel/getHotelItemByOrderNo", data, function (result) {
	                vm.hotelItem = result.obj;
	            });          
	        }
	    });
		
});