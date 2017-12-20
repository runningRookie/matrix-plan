$(document).ready(function () {
	/*
	Vue.filter('hotelTypeFilter', {
        read: function (value, format) {
            if (value == 1) {
                return '预付';
            }
            if (value == 2) {
                return '现付';
            }           
        },
        write: function (value, format) {
            return value;
        }
    });*/
	alert(1);
	
    var vm = new Vue({
        el: '#hotelOpOrderDetail',
        data: {           
            hotelOrder:{},
            hotelOrderMain:{},
            hotelBusinessTravelPolicy:{},
            hotelItem:{},
            hotelServicePerson:{},
            hotelDetailPriceInfo:{},
			test: $!hotelorder
        },
        ready: function () {
			alert('OK');
			alert(window.orderNo+'----');
            
            var data = {orderNo: window.orderNo};
			alert(data);
			/*
            $.ajax(__ctx + "/hotel/getHotelOrderByOrderNo", data, function (result) {
                vm.hotelOrder = result.obj;
            });
            $.ajax(__ctx + "/hotel/getHotelOrderMainByOrderNo", data, function (result) {
                vm.hotelOrderMain = result.obj;
            });
            $.ajax(__ctx + "/hotel/getHotelBusinessTravelPolicyByOrderNo", data, function (result) {
                vm.hotelBusinessTravelPolicy = result.obj;
            });
            $.ajax(__ctx + "/hotel/getHotelItemByOrderNo", data, function (result) {
                vm.hotelItem = result.obj;
            });
            $.ajax(__ctx + "/hotel/getHotelServicePersonByOrderNo", data, function (result) {
                vm.hotelServicePerson = result.obj;
            });
            $.ajax(__ctx + "/hotel/getHotelDetailPriceInfoByOrderNo", data, function (result) {
                vm.hotelDetailPriceInfo = result.obj;
            });
			*/
        },
        methods:{
        	save_remark( remark,  orderNo,  operator,  remarkType){
        		var param = {
            			'remark':remark,
            			'orderNo':orderNo,
            			'operator':operator,
            			'remarkType':remarkType
            		},
        		$.ajax({
                    type:"POST",
                    url:__ctx + "/hotel/insertRemark",
                    contentType:'application/json',
                    data:JSON.stringify(param),
                    success:function(result){
                        if (result.result){
                        	alert('操作成功');
                        }else{
                            toastr.error(result.message, "操作失败", {
                                timeOut : 2000,
                                positionClass : "toast-top-center"
                            });
                        }
                    },
                    error:function (result) {
                        toastr.error(result.message, "操作失败", {
                            timeOut : 2000,
                            positionClass : "toast-top-center"
                        });
                    }
                })
        	}
        	
        }
    });
});