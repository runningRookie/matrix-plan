$(document).ready(function () {
    var vm_payment_list = new Vue({
        el: '#changePaymentVM',
        data: {
        	bookPerson:[],
        	s_msgcontent:"",
            params : {
            	itineraryNo:"",
            	bookPersonName :"",
            	bookPersonPhone:"",
            	content:"",
            	payType:"",
            	orderList : []
			}
        },methods: {
            init: function () {
            	//加载独立支付
                vm_payment_list.singlePay();
            },//独立支付
            singlePay: function () {
            	//数据清空
            	vm_payment_list.s_msgcontent="";
                $.ajax({
                    url: __ctx + "/change/payment/singlePay/init",
                    data: {
                        applyNo: window.applyNo
                    },
                    success: function (data) {
                        if (data.result) {
                        	vm_payment_list.bookPerson=data.obj.bookPerson;
                        } else {
                            toastr.error(data.message, "", {timeOut: 0, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                        }
                    }
                });
            }, //获取支付链接
            getPayUrl:function(){
            	//数据清空
            	vm_payment_list.s_msgcontent="";
            	vm_payment_list.params.orderList=[];
            	// 处理前校验
				if (!vm_payment_list.getPayUrlCheck()) {
					return false;
				}
				vm_payment_list.params.itineraryNo=window.itineraryNo;
				vm_payment_list.params.payType="1";
        		var paymentOrderVO=new Object();
        		paymentOrderVO.applyNo=window.applyNo;
        		paymentOrderVO.productCode="DA1";
        		vm_payment_list.params.orderList.push(paymentOrderVO);	
            	vm_payment_list.params.bookPersonName=vm_payment_list.bookPerson.bookPersonName;
            	vm_payment_list.params.bookPersonPhone=vm_payment_list.bookPerson.bookPersonPhone;
            	$.ajax({
            		type : "POST",
					contentType : "application/json",
                    url: __ctx + "/change/payment/getPayUrl",
                    data : JSON.stringify(vm_payment_list.params),
                    success: function (data) {
                        if (data.result) {
                        	$("#confirmTipPay").modal({
                               show: true,
                               backdrop: 'static'
                        	});
                        	$("#confirmTipBody").html("");
                        	$("#confirmTipBody").html(data.obj.returnMsg);
                        	$("#confirmTipClose").unbind();
                        	$("#confirmTipClose").click(function(){
                			if(data.obj.result=='1'){
                				vm_payment_list.s_msgcontent=data.obj.content;
                			}else if(data.obj.result=='2'){
                				window.location.href = __ctx + "/orderdetails/flightorderdetail?orderNo="+window.orderNo;
                			}
                        	$("#confirmTipPay").modal('hide');
                        	});
                        } else {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                        }
                  }
              });
            },
            //获取支付链接校验
            getPayUrlCheck:function(){
            	if(vm_payment_list.bookPerson.bookPersonName== null || vm_payment_list.bookPerson.bookPersonName == ""){
            		toastr.error("预订人姓名不能为空。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
            		return false;
            	}
            	if(vm_payment_list.bookPerson.bookPersonPhone== null || vm_payment_list.bookPerson.bookPersonPhone == ""){
            		toastr.error("预订人手机号码不能为空。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
            		return false;
            	}
            	var reg = /^\d{11}$/;
            	if(!reg.test(vm_payment_list.bookPerson.bookPersonPhone)){
            		toastr.error("预订人手机号码不正确。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
            		return false;
            	}
            	return true;
            },
            //发送短信
            sendMsg:function(){
            	// 处理前校验
				if (!vm_payment_list.getPayUrlCheck()) {
					return false;
				}
				vm_payment_list.params.content=vm_payment_list.s_msgcontent;
				//校验内容是否为空
				if(vm_payment_list.params.content ==null || vm_payment_list.params.content==""){
					 toastr.error("短信内容不能为空。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
					 return false;
				}
				//判断是否执行过生成短信
				if(vm_payment_list.params.orderList==null || vm_payment_list.params.orderList.length==0){
					toastr.error("支付短信未生成无法发送。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
					 return false;
				}
				vm_payment_list.params.bookPersonName=vm_payment_list.bookPerson.bookPersonName;
				vm_payment_list.params.bookPersonPhone=vm_payment_list.bookPerson.bookPersonPhone;
            	$.ajax({
            		type : "POST",
					contentType : "application/json",
                    url: __ctx + "/change/payment/sendMsg",
                    data : JSON.stringify(vm_payment_list.params),
                    success: function (data) {
                        if (data.result) {
                        	 toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                    		 //页面关闭
 							setTimeout(function(){
 								window.location.href = __ctx + "/flights/changes/"+window.applyNo;
 							}, 1000);
                        } else {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                        }
                  }
            	})
            },//关闭页面发送
            closeMsg:function(){
            	window.location.href = __ctx + "/flights/changes/"+window.applyNo;
            }
        }
    });
    vm_payment_list.init();
});


