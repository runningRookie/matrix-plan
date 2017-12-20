$(document).ready(function () {
    var fastoperationVM = new Vue({
        el: '#fastoperationVM',
        data: {
            cancelReason: "",
            showModel:false,
			outOrderStatus:"",
			order:{},
			confirmOrderInfo:{},
			agreementCancelModel:{
				cancelCertificate:"",
				cancelPerson:"",
				remark:""
			},
			agreeHotelContactInfo:{}
        },
        ready: function () {
            this.showModel = true;
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/hotel/getHotelOrderByOrderNo", data, function (result) {
            	fastoperationVM.order = result.obj;
				$("#confirmOrder").attr("disabled", "disabled"); 
                $("#cancelOrder").attr("disabled", "disabled");  
				
				//判断是否为协议酒店
                if(fastoperationVM.order.supplierType == '3'){
                	$("#confirmPushAgain").attr("disabled", true);
                	$("#contactHotel").attr("disabled", false);
                	$('#fax').show();//显示发送传真按钮
                	$.getJSON(__ctx + "/agreementhotelcontact/queryhotelcontact", data, function (result) {
                		fastoperationVM.agreeHotelContactInfo = result.data;
                	})
                	if(fastoperationVM.order.orderStatus == '6'){
                		$("#confirmOrder").attr("disabled", false);
                	}
                	if (fastoperationVM.order.orderStatus != '14') {
    					$("#cancelOrder").attr("disabled", false);
    				}
                }else{
                	$("#contactHotel").attr("disabled", true);
                	//判断是否可以确认：外部订单状态是“10已确认”且本地订单状态是“6待供应商确认”或“7供应商不确认”
                    if (fastoperationVM.order.orderStatus == '6' || fastoperationVM.order.orderStatus == '7') {
                        $.ajax({
                            url: __ctx + "/hotel/getHotelOutOrderStatus",
                            type: "POST",
                            data: {
                                orderNo: window.orderNo
                            },
                            datatype: "json",
                            error: function (data) {
                                toastr.error("查询外部订单状态失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                            },
                            success: function (data) {
                                if (data.result) {
    								fastoperationVM.outOrderStatus=data.obj;
                                    if (data.obj=='10') { 
                                        $("#confirmOrder").attr("disabled", false);
                                    }
                                }
                            }
                        });
                    }
    				//判断是否可以取消: 本地订单状态是“7.供应商不确认”.
    				if (fastoperationVM.order.orderStatus == '7') {
    					$("#cancelOrder").attr("disabled", false);
    				}
    				//判断是否可以取消: 本地订单状态不是“14.已取消(全部退房)”，且外部订单状态是“2已取消”或“25全额退款结束”. //2：已取消 是现付订单才有的  25：全额退款结束 是预付订单
    				else if (fastoperationVM.order.orderStatus != '14') {
    					if(fastoperationVM.order.supplierType == '3'){
    						$("#cancelOrder").attr("disabled", false);
    					}else{
    						 $.ajax({
		                        url: __ctx + "/hotel/getHotelOutOrderStatus",
		                        type: "POST",
		                        data: {
		                            orderNo: window.orderNo
		                        },
		                        datatype: "json",
		                        error: function (data) {
		                            toastr.error("查询外部订单状态失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
		                        },
		                        success: function (data) {
		                            if (data.result) {
										fastoperationVM.outOrderStatus=data.obj;
		                                if (data.obj=='2' || data.obj=='25') {
		                                    $("#cancelOrder").attr("disabled", false);
		                                }
		                            }
		                        }
		                    });
    					}                   
                    }
                }
            });
        },
        methods: {
            //确认订单
			confirmOrder:function(){
				$.ajax({
                    url: __ctx + "/hotel/confirmOrder",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("确认订单失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        toastr.success("确认订单成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
						tc.hotel.logs.refresh();
						$("#confirmOrder").attr("disabled", "disabled");	//刷新按钮	                
                    }
                });
			},
			//快捷确认订单（协议酒店）
			confirmAgreeOrder:function(confirmOrderInfo){
				confirmOrderInfo.orderNo = window.orderNo;
				//校验
				if(this.checkData(confirmOrderInfo)){
					$.ajax({
	                    url: __ctx + "/hotel/confirmAgreeOrder",
	                    type: "POST",
	                    data: confirmOrderInfo,
	                    datatype: "json",
	                    error: function (data) {
	                        toastr.error("确认订单失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
	                    },
	                    success: function (data) {
	                    	if(data.result){
	                    		toastr.success("确认订单成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
								tc.hotel.logs.refresh();
								$("#confirmOrder").attr("disabled", "disabled");	//刷新按钮
								$("#confirmAgreementOrder").modal('hide');
								window.setTimeout(function () {
		                            window.location.reload();
		                        },500);
	                    	}else{
	                    		toastr.error("确认订单失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
	                    	}
	                        
	                    }
	                });
				}
			},
			//协议酒店添加
			confirmModel:function(supplierType){
				if(supplierType == '3'){
					$('#confirmAgreementOrder').modal({
						backdrop : 'static'
					});
					$("#confirmAgreementOrder").modal('show');
				}else{
					$('#confirmConfirm').modal({
						backdrop : 'static'
					});
					$("#confirmConfirm").modal('show');
				}
            },
          //取消
            confirmCancelModel:function(supplierType){
				if(supplierType == '3'){
					$('#confirmAgreementCancel').modal({
						backdrop : 'static'
					});
					$("#confirmAgreementCancel").modal('show');
				}else{
					$('#confirmCancel').modal({
						backdrop : 'static'
					});
					$("#confirmCancel").modal('show');
				}
            },
			//取消订单
            cancelOrder: function () {
				if (!fastoperationVM.cancelReason) {
                    toastr.error("订单取消原因不能为空！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $.ajax({
                    url: __ctx + "/hotel/cancelOrder",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo,
                        cancelReason: fastoperationVM.cancelReason
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("取消订单失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        toastr.success("取消订单成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
						tc.hotel.logs.refresh();
						$("#cancelOrder").attr("disabled", "disabled");	//刷新按钮
                    }
                });
            },
           //提交订单校验
            checkData:function(confirmOrderInfo){
				var hotelConfirmNo = confirmOrderInfo.hotelConfirmNo;
				var operator = confirmOrderInfo.operator;
				var remark = confirmOrderInfo.remark;
				if (hotelConfirmNo == null || hotelConfirmNo.trim() == "" ) {
					toastr.error("确认号不能为空！", "", {
						timeOut : 2000,
						positionClass : "toast-top-center"
					});
					return false;
				}
				
				return true;
			},
			
			//取消协议订单
            cancelAgreementOrder: function () {
                $.ajax({
                    url: __ctx + "/hotel/cancelAgreementOrder",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo,
                        cancelCertificate:fastoperationVM.agreementCancelModel.cancelCertificate,
        				cancelPerson:fastoperationVM.agreementCancelModel.cancelPerson,
        				remark:fastoperationVM.agreementCancelModel.remark
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("取消订单失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        toastr.success("取消订单成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
                        window.setTimeout(function () {
                            window.location.reload();
                        },500);
						$("#cancelOrder").attr("disabled", "disabled");	//刷新按钮
                    }
                });
            },
			//打开传真的页面
            openPrintPage:function(){
           	 window.open(__ctx + "/fax/viewfax?orderNo="+window.orderNo, "_blank");
           }
            
        }
    });
});