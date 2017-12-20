$(document).ready(function () {
    var vm_list = new Vue({
        el: '#fastoperationVM',
        data: {
            cancelReason: "行程取消",
            cancelReasonCode:"1",
            singleResult: {},
            emergencyApprovalQuery: {},
            radioView: false,
            showModel:false,
            messageReceiverList: [],
            selectedOpt: 0,
            messageOpt: ""
        },
        watch:{
            'selectedOpt': function(val){
                this.changePhoneSelected(this.messageReceiverList[val].phone);
            }
        },
        ready: function () {
            this.radioView = true;
            this.showModel = true;
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                vm_list.order = result.obj;
                $("#toUpdateOrder").attr("disabled", false).removeClass("btn-not-allowed");
                $("#toRefundOrder").attr("disabled", false).removeClass("btn-not-allowed");
                $("#toChangeOrder").attr("disabled", false).removeClass("btn-not-allowed");
                $("#cancelOrder").attr("disabled", false).removeClass("btn-not-allowed");
                $("#toPayment").attr("disabled", false).removeClass("btn-not-allowed");
                $("#toEmergencyApproval").attr("disabled", false).removeClass("btn-not-allowed");
                $("#cancellationOrder").attr("disabled", false).removeClass("btn-not-allowed");
                //已退票、已变更
                if (vm_list.order.flightOrderDTO.flightOrderStatus == '17' || vm_list.order.flightOrderDTO.flightOrderStatus == '13'
                    || vm_list.order.flightOrderDTO.flightOrderStatus == '09' || vm_list.order.flightOrderDTO.flightOrderStatus == '10'
                    || vm_list.order.flightOrderDTO.flightOrderStatus == '07'
                    || vm_list.order.flightOrderDTO.flightOrderStatus == '01'
                    || vm_list.order.flightOrderDTO.flightOrderStatus == '18') {
                    $("#toUpdateOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancelOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toEmergencyApproval").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancellationOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                }
                if(vm_list.order.flightOrderDTO.flightOrderStatus == '11'){
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancelOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toEmergencyApproval").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancellationOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                }
                //已改期
                if (vm_list.order.flightOrderDTO.flightOrderStatus == '16') {
                    $("#toUpdateOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancelOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toEmergencyApproval").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancellationOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                }
                //部分退票、部分改期、出票成功
                if (vm_list.order.flightOrderDTO.flightOrderStatus == '15' || vm_list.order.flightOrderDTO.flightOrderStatus == '14' || vm_list.order.flightOrderDTO.flightOrderStatus == '12') {
                    $("#toUpdateOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancelOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toEmergencyApproval").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancellationOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    if(!!window.flightSegmentChangeId){
                        $("#toSegmentChangeOrder").attr("disabled", false).removeClass("btn-not-allowed");
                    }
                }


                if (vm_list.order.flightOrderDTO.flightOrderStatus == '08') {
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancelOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toEmergencyApproval").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancellationOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                }

                if (vm_list.order.flightOrderDTO.flightOrderStatus == '06') {
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toEmergencyApproval").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancellationOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toUpdateOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                }

                if (vm_list.order.flightOrderDTO.flightOrderStatus == '05') {
                    $("#toUpdateOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toEmergencyApproval").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancellationOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                }

                if (vm_list.order.flightOrderDTO.flightOrderStatus == '04') {
                    $("#toUpdateOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancellationOrder").attr("disabled", "disabled");
                }
                if (vm_list.order.flightOrderDTO.flightOrderStatus == '03') {
                    $("#toUpdateOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                }
                if (vm_list.order.flightOrderDTO.flightOrderStatus == '02') {
                    $("#toUpdateOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");;
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toEmergencyApproval").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#cancellationOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                }

                if (vm_list.order.flightOrderDTO.flightOrderStatus == '13') {
                    $.ajax({
                        url: __ctx + "/orderdetails/judgeChangIngIfCanRefund",
                        type: "POST",
                        data: {
                            orderNo: window.orderNo
                        },
                        datatype: "json",
                        error: function (data) {
                            //toastr.error("查询是否可退失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success: function (data) {
                            if (data.result) {
                                if (data.obj) {
                                    $("#toRefundOrder").attr("disabled", false);
                                }
                            }
                        }
                    });
                }
                // if(vm_list.order.flightOrderDTO.flightOrderStatus != '08'){
                //     $("#toUpdateOrder").attr("disabled","disabled");
                // }
                // if(parseInt(vm_list.order.flightOrderDTO.flightOrderStatus) < 12){
                //     $("#toRefundOrder").attr("disabled","disabled");
                // }else if(parseInt(vm_list.order.flightOrderDTO.flightOrderStatus) == 16){
                //     $("#toRefundOrder").attr("disabled","disabled");
                // }
                // if(parseInt(vm_list.order.flightOrderDTO.flightOrderStatus) < 12){
                //     $("#toChangeOrder").attr("disabled","disabled");
                // }
            });

            $.getJSON(__ctx + "/orderdetails/searchPassengerSegmentInfos", data, function (result) {

                var flag = false;
                _.forEach(result.obj, function (sub) {
                    if (!sub.flightTicketDTO) {
                        return;
                    }
                    if (['A'].indexOf(sub.flightTicketDTO.ticketStatus) > -1) {
                        flag = true;
                    }
                });

                if (flag) {
                    $("#toChangeOrder").attr("disabled", false).removeClass("btn-not-allowed");
                    $("#toRefundOrder").attr("disabled", false).removeClass("btn-not-allowed");
                    if(!!window.flightSegmentChangeId){
                        $("#toSegmentChangeOrder").attr("disabled", false).removeClass("btn-not-allowed");
                    }
                } else {
                    $("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    $("#toRefundOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    if(!!window.flightSegmentChangeId){
                        $("#toSegmentChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    }
                }
            });

            /*if (!!window.flightSegmentChangeId) {
                $.getJSON(__ctx + "/orderdetails/searchSegmentChangeApply", data, function (result) {
                    if (!result.result || tc.arr.isEmpty(result.obj)) {
                        return;
                    }
                    var flag = false;
                    _.forEach(result.obj, function (item) {
                        if (!item.flightChangeApplyItem) {
                            flag = true;
                        }
                    });

                    if (flag) {
                        $("#toSegmentChangeOrder").attr("disabled", false).removeClass("btn-not-allowed");

                        $("#cancelOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                        $("#toPayment").attr("disabled", "disabled").addClass("btn-not-allowed");
                        //$("#toChangeOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                        $("#toUpdateOrder").attr("disabled", "disabled").addClass("btn-not-allowed");
                    }
                });
            }*/
        },
        methods: {
            //紧急审批TODO
            emergencyApproval: function () {
                var emergencyApprovalQuery = {};
                emergencyApprovalQuery.orderNo = window.orderNo;
                emergencyApprovalQuery.stopRadio = this.emergencyApprovalQuery.stopRadio;
                emergencyApprovalQuery.codeStop = this.emergencyApprovalQuery.stopRadio == 2 ? this.emergencyApprovalQuery.codeStop1 : this.emergencyApprovalQuery.codeStop2;

                if (!emergencyApprovalQuery.stopRadio) {
                    toastr.error("请选择审批方式", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }

                if (emergencyApprovalQuery.stopRadio == 2 && !emergencyApprovalQuery.codeStop) {
                    toastr.error("请输入特殊code", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }

                $.ajax({
                    url: __ctx + "/commitaudit/emergencyapproval",
                    contentType: "application/json",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(emergencyApprovalQuery),
                    success: function (data) {
                        if (!data.result) {
                            toastr.error("提交紧急审批失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            toastr.info("提交紧急审批成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            //刷新页面
                            window.location.reload();
                        }
                    }
                });
            },
            cancelOrderModal: function () {
                $("#confirmCancel").modal({
                    show: true,
                    //   remote : __ctx + "/itinerary/bookpersonlist",
                    backdrop: 'static'
                });
            },
            /*撤回审批*/
            cancellationOrder: function () {
                $.ajax({
                    url: __ctx + "/commitaudit/trminationapproval",
                    data: {
                        orderNo: window.orderNo
                    },
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "撤回审批失败", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            toastr.info(data.message, "撤回审批成功", {timeOut: 2000, positionClass: "toast-top-center"});
                            //刷新页面
                            window.location.reload();
                        }
                    }
                });
            },
            toRefundOrder: function () {
                // window.location.href = __ctx + '/flights/refund?orderNo=' + window.orderNo;
                var href = __ctx + '/flights/refund?orderNo=' + window.orderNo+'&sourceType='+1;
                window.open(href);
            },
            toUpdateOrder: function () {
                // window.location.href = __ctx + '/updateFlights/updateFlightOrderForm?orderNo=' + window.orderNo;
                var href = __ctx + '/updateFlights/updateFlightOrderForm?orderNo=' + window.orderNo;
                window.open(href);
            },
            toChangeOrder: function () {
                // window.location.href = __ctx + '/flights/change?orderNo=' + window.orderNo;
                var href = __ctx + '/flights/launchchange?orderOrApplyNo=' + window.orderNo+'&sourceType='+1;
                window.open(href);
            },
            cancelOrder: function () {
                if (!vm_list.cancelReason) {
                    toastr.error("订单取消原因不能为空！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $('#confirmCancel').modal('hide');
                $.ajax({
                    url: __ctx + "/flightOrder/cancelFlightOrder",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo,
                        cancelReasonCode: vm_list.cancelReasonCode,
                        cancelReason: vm_list.cancelReason
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                    	if(data.result){
                    		toastr.success(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                            //刷新页面
                            window.location.reload();
                    	}else{
                    		toastr.error(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                    	}
                        
                        // parms = order_list.parms;
                        // reloadGridData(parms);
                    }
                });
            },
            bindReason:function(cancelReasonCode){
            	if(cancelReasonCode == '1'){
            		this.cancelReason = "行程取消";
            	}
            	else if(cancelReasonCode == '2'){
            		this.cancelReason = "重新预订";
            	}
				else if(cancelReasonCode == '3'){
					this.cancelReason = "价格有问题";        		
            	}
				else if(cancelReasonCode == '4'){
					this.cancelReason = "审批问题";
				}
				else if(cancelReasonCode == '5'){
					this.cancelReason = "支付问题";
				}
				else if(cancelReasonCode == '6'){
					this.cancelReason = "测试订单";
				}
				else if(cancelReasonCode == '7'){
					this.cancelReason = "客人自主取消";
				}
            },//支付
            toPayment: function () {
                $.ajax({
                    url: __ctx + "/payment/singlePay/check",
                    data: {
                        orderNo: window.orderNo
                    },
                    success: function (data) {
                        if (data.result) {
                        	window.location.href = __ctx + "/payment/singlePay/index?orderNo="+window.orderNo
                        } else {
                            toastr.error(data.message, "", {timeOut: 0, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                        }
                    }
                });
            },
            toSegmentChangeOrder: function () {
            	var href = __ctx + '/flights/involuntaryChange?orderOrApplyNo=' + window.orderNo + '&sourceType=' + 1 + '&flightSegmentChangeId=' + window.flightSegmentChangeId;
            	window.open(href);
            },
            //发送短信
            sendMsg: function () {
                if ($("#phoneNum").val()=="") {
                    toastr.error("请输入手机号！", "", toastrConfig);
                    return;
                }
                if (!vm_list.messageOpt) {
                    toastr.error("请输入短信内容！", "", toastrConfig);
                    return;
                }
                var mobile = $("#phoneNum").val();
                var message = vm_list.messageOpt;
                var receiverRole = vm_list.messageReceiverList[vm_list.selectedOpt].receiverRole;
                $.ajax({
                    url: __ctx + "/manualSendMsg/manualSendMsg",
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        mobile: mobile,
                        message: message,
                        productCode: 1,//国内机票
                        receiverRole: receiverRole,
                        relateCode: window.orderNo
                    }),
                    success: function (result) {
                        if (result.result) {
                            toastr.success("手工短信发送成功", "", toastrConfig);
                            window.setTimeout(function () {
                                window.location.reload();
                            },2000);
                        }else{
                            toastr.error(result.message, "", toastrConfig);
                        }
                    }
                });
            },
            //切换手机号
            changePhoneSelected: function (phoneNum) {
                $("#phoneNum").val(phoneNum);
            },
            //获取短信接收人列表
            getReceiver:function () {
                vm_list.messageReceiverList = [];
                //1.旅客
                _.forEach(flightVM.__vue__.passengers, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 1;
                    oneReceiver.receiver = value.passenger.passengerName;
                    oneReceiver.phone = value.passenger.passengerPhone;
                    vm_list.messageReceiverList.push(oneReceiver);
                });
                //2.预订人
                var oneReceiver = {};
                oneReceiver.receiverRole = 2;
                oneReceiver.receiver = vm_list.order.bookPersonDTO.bookPersonName;
                oneReceiver.phone = vm_list.order.bookPersonDTO.bookPersonPhone;
                vm_list.messageReceiverList.push(oneReceiver);
                //3.联系人
                _.forEach(orderInformation.__vue__.contactPerson, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 3;
                    oneReceiver.receiver = value.personName;
                    oneReceiver.phone = value.personMobile;
                    vm_list.messageReceiverList.push(oneReceiver);
                });
                //4.抄送人
                _.forEach(orderInformation.__vue__.servicePeoples, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 4;
                    oneReceiver.receiver = value.servicePersonName;
                    oneReceiver.phone = value.servicePersonPhone;
                    vm_list.messageReceiverList.push(oneReceiver);
                });
                //8.其他
                var oneReceiver = {};
                oneReceiver.receiverRole = 8;
                oneReceiver.receiver = "其他";
                oneReceiver.phone = "";
                vm_list.messageReceiverList.push(oneReceiver);
            }
            ///////////////////////结束
            
        }
    });
});
