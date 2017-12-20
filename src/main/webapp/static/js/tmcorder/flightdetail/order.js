var vm;
$(document).ready(function () {

	tc.ns('tc.flight.detail.order', function (orderFunc) {
	
		Vue.filter('toSegmentChangeDesc', {
	        read: function (value, format) {
	            if (value == '1') {
	                return '航班延迟';
	            }
	            if (value == '2') {
	                return '航班提前';
	            }
	            if (value == '3') {
	                return '航班取消';
	            }
	            if (value == '10') {
	                return '取消恢复';
	            }
	            return  '其他';
	        },
	        write: function (value, format) {
	            return value;
	        }
	    });
		
		vm = new Vue({
	        el: '#orderVM',
	        data: {
	            order: {flightOrderDTO: {}, orderMainDTO: {},bookPersonDTO:{}},
	            bookCompanyName: "",
	            bussinessTravelAim: "",
	            relationalOrderNum: 0,
	            travelType: '',
	            ticketAccounts:[],
	            refundApplys:[],
	            changeApplys:[],
	            orderPaymentInformation:{},
	            flightTicket:{},
                ticketAccount: ""
	        },
	        ready: function () {
	            var data = {orderNo: window.orderNo};
	            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
	                vm.order = result.obj;
	                if(!result.obj || !result.obj.flightOrderDTO){
	                	window.location.href = __ctx+"/common/pageNotFound";
	                }else{
	                	orderFunc && orderFunc(result.obj);
	                }	                
	            });
	
	            $.getJSON(__ctx + "/orderdetails/getBookCompanyName", data, function (result) {
	                vm.bookCompanyName = result.obj;
	            });
	
	            $.getJSON(__ctx + "/orderdetails/getBuessinessTravelAim", data, function (result) {
	                vm.bussinessTravelAim = result.obj;
	            });
	
	            $.getJSON(__ctx + "/orderdetails/getRelationalOrderNum", data, function (result) {
	                vm.relationalOrderNum = result.obj;
	            });
	            
	            $.getJSON(__ctx + "/orderdetails/travelType", data, function (result) {
	                vm.travelType = result.obj;
	            });
	            
	            $.getJSON(__ctx + "/orderdetails/getOutTicketAccount", data, function (result) {
	                vm.ticketAccounts = result.obj;
	            });
	            
	            $.getJSON(__ctx + "/orderdetails/getAllOrderRefundApply", data, function (result) {
	                vm.refundApplys = result.obj;
	            });
	            
	            $.getJSON(__ctx + "/orderdetails/getAllOrderChangeApply", data, function (result) {
	                vm.changeApplys = result.obj;
	            });
	            
	            $.getJSON(__ctx + "/orderdetails/getPaymentInfo", data, function (result) {
	                vm.orderPaymentInformation = result.obj;
	            });

	            $.getJSON(__ctx + "/orderdetails/getFlightTicketInfo", data, function (result) {
	                vm.flightTicket = result.obj;
	            });
	        },
	        methods:{
            	manualAccount:function(ticketNo, orderNo){
                    $.ajax({
                        url: __ctx + "/orderdetails/manualAccountSync/"+ticketNo+"/"+orderNo,
                        type : "POST",
                        data:{
                            ticketNo:ticketNo,
                            orderNo:orderNo
                        },
                        datatype:"json",
                        error:function(data){
                            toastr.error("手工登账失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success:function(data){
                            if(data.result){
                                toastr.info("手工登账成功!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                            }else{
                                toastr.error(data.message,"", {timeOut: 1000, positionClass: "toast-top-center"});
                            }
                            $.getJSON(__ctx + "/orderdetails/getOutTicketAccount", {orderNo: window.orderNo}, function (result) {
            	                vm.ticketAccounts = result.obj;
            	            });
                        }
                    });
            	},
            	toValidate:function(billNo, gmtCreate,flightOrderStatus){
            		var time1 = new Date(new Date(new Date().setDate(new Date(gmtCreate).getDate())).setHours(0,0,0,0)).getTime();
            		var time2 = new Date(new Date(new Date().setDate(new Date(gmtCreate).getDate()+1)).setHours(0,0,0,0)).getTime();
            		var gmtCreate = new Date(gmtCreate).getTime();
            		var nowTime = new Date().getTime();
            		if(nowTime>time2 || nowTime < time1){
            			toastr.info("作废登账需当天内有效！", "",{timeOut: 2000, positionClass: "toast-top-center"});
            			return false;
            		}
                	var href = vm.order.flightOrderDTO.billsCancelUrl + billNo;
                    window.open(href);
            	},
                financeNote: function (ticketAccount) {
            		this.ticketAccount = ticketAccount;
                    $("#formModal").modal({
                        show: true,
                        remote: __ctx + "/orderdetails/toFinanceNote",
                        backdrop: 'static',
                    });
                },
            }
	    });
	  
    
	}); 
});