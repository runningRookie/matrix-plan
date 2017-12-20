/**
 * Created by wj42134 on 2017/4/18.
 */

var vm_train_change;
$(document).ready(function () {
    vm_train_change = new Vue({
        el: '#trainChangeDetail',
        data: {
            order: {},
            trainTicketAccounts: [],
            trainConfirmChangeResult:{},
            trainOrderPaymentInformation: {},
            trainOrderLogs: [],
            stopOverStations: [],
            itinerary: {},
            cancelReasonCode: "1",
            cancelReason: "行程取消",
            showCancel: false,
            showStopStation: false,
            showDetails: false,
            refundDetails: {},
            popupId: 0,
            originPrice:{},
            needflush: false,
            step: 0,
            trainOrderItemVOS: [],
            financeUrl:window.location.host + '/finance/bussinessbillsdetail/billsdetail-op',
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
            this.loadData();
            this.loadTrainTicketAccountData();
            this.loadLogData();
            this.loadTrainOrderPaymentInformationData();
            this.loadOriginPrice();
            this.showCancel = true;
        },
        filters: {
            toPaymentTypeFilter: function (value) {
                if (value == 'n') {
                    return '现结';
                } else if (value == 'm') {
                    return '授信';
                } else {
                    return '';
                }
            },

            supplierCodeFilter: function (value) {
                if (value == 'CLTX') {
                    return '创旅天下';
                } else {
                    return '';
                }
            },

            logContentFilter: function (value, replaceFlag) {
                if (value && replaceFlag) {
                    value = value.replace(new RegExp(replaceFlag, 'g'), "<br>");
                }
                return value;
            },

            seatFilter: function (value) {
                if (value == 'hardseat')
                    return "硬座";
                else if (value == 'softseat')
                    return "软座";
                else if (value == 'firstseat')
                    return "一等座";
                else if (value == "secondseat")
                    return "二等座";
                else if (value == 'hardsleeperup')
                    return "硬卧上铺";
                else if (value == 'hardsleepermid')
                    return "硬卧中铺";
                else if (value == 'hardsleeperdown')
                    return "硬卧下铺";
                else if (value == 'softsleeperup')
                    return "软卧上铺";
                else if (value == 'softsleeperdown')
                    return "软卧下铺";
                else if (value == 'noseat')
                    return "无座";
                else if (value == 'businessseat')
                    return "商务座";
                else if (value == 'specialseat')
                    return "特等座";
                else if (value == 'advancedsoftsleeper')
                    return "高级软卧";
                else if (value == 'otherseat')
                    return "其他";
                else if(value == 'dsleeperup')
                    return "动卧";
                else if(value == 'dsleeperdown')
                    return "动卧";
                else if(value == 'adsleeperup')
                    return "高级动卧";
                else if(value == 'adsleeperdown')
                    return "高级动卧";
                else if(value == 'advancedsoftsleeperup')
                    return "高级软卧";
                else if(value == 'advancedsoftsleeperdown')
                    return "高级软卧";
                else
                    return value;
            },

            changeTypeFilter: function (value) {
                switch (value){
                    case "1": return "原价改签"; break;
                    case "2": return "高改低改签"; break;
                    case "3": return "低改高改签"; break;
                    default: return ""; break;
                }

            },

            changeStatusFilter: function (value) {
                switch (value){
                    case "N": return "占座中"; break;
                    case "A": return "待支付"; break;
                    case "R": return "改签中"; break;
                    case "E": return "待确认改签"; break;
                    case "F": return "出票成功"; break;
                    case "U": return "改签失败"; break;
                    case "T": return "退票成功"; break;
                    case "O": return "订单过期"; break;
                    case "C": return "订单已取消"; break;
                    default: return ""; break;
                }
            },

            operateTypeFilter: function (value) {
                switch (value){
                    case "1": return "出票"; break;
                    case "2": return "改签"; break;
                    case "3": return "退票"; break;
                    default: return ""; break;
                }
            },

            billIsSuccessFilter: function (value) {
                switch (value){
                    case "1": return "登账成功"; break;
                    case "0": return "登账失败"; break;
                    default: return "未登账"; break;
                }
            }

        },

        methods: {
            showViolation: function () {
                var $b = $('#violationBtn');
                var $t = $("#violationTab");
                var X = $b.position().top;
                var Y = $b.position().left;
                if ($t.css('display') == 'none') {
                    $t.css({'left': Y - $t.width() / 2 + 'px', 'top': X - $t.height() - 50 + 'px'});
                    $t.show();
                } else {
                    $t.hide();
                }
            },
            //加载订单数据
            loadData: function () {
                $.ajax({
                    url: __ctx + "/train/change/detail/" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result && result.obj) {
                            vm_train_change.order = result.obj;
                            if (vm_train_change.order.trainChangeApplyItemVO.orderStatus == 'A'
                                || vm_train_change.order.trainChangeApplyItemVO.orderStatus == 'E') {
                                $("#cancelChange").removeAttr("disabled");
                                $("#cancelChange").removeAttr("style");
                            } else {
                                $("#cancelChange").attr("disabled", "disabled");
                                $("#cancelChange").attr('style', 'background-color : #ccc');
                            }
                            if (vm_train_change.order.trainChangeApplyItemVO.orderStatus == 'E') {
                                $("#comfirmChange").removeAttr("disabled");
                                $("#comfirmChange").removeAttr("style");
                            } else {
                                $("#comfirmChange").attr("disabled", "disabled");
                                $("#comfirmChange").attr('style', 'background-color : #ccc');
                            }

                            if (vm_train_change.order.trainChangeApplyItemVO.orderStatus == 'A'
                                && vm_train_change.order.trainChangeApplyItemVO.paymentType == 'n') {
                                $("#toPayment").removeAttr("disabled");
                                $("#toPayment").removeAttr("style");
                            } else {
                                $("#toPayment").attr("disabled", "disabled");
                                $("#toPayment").attr('style', 'background-color : #ccc');
                            }

                            var itemNeedflush = false;
                            _.forEach(vm_train_change.order.trainOrderItemVOS, function(value){
                                value.itemNeedflush = false;
                                if (value.ticketStatus == 'C') {
                                    itemNeedflush = true;
                                    value.itemNeedflush = true;
                                }
                            });
                            // if (itemNeedflush || vm_train_change.order.trainChangeApplyItemVO.orderStatus == 'N'
                            //     || vm_train_change.order.trainChangeApplyItemVO.orderStatus == 'R'){
                            //     vm_train_change.needflush = true;
                            // }
                            if (vm_train_change.order.trainChangeApplyItemVO.orderStatus == 'N'
                                || vm_train_change.order.trainChangeApplyItemVO.orderStatus == 'R'){
                                vm_train_change.needflush = true;
                            }

                            setTimeout(function () {
                                $("[data-toggle='popover']").popover();
                            }, 1000);
                            vm_train_change.step = vm_train_change.step + 1;
                        } else {
                            window.location.href = __ctx + "/common/pageNotFound";
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                })
            },
            //加载登账单数据
            loadTrainTicketAccountData: function () {
                $.ajax({
                    url: __ctx + "/trainTicketAccount/changeTicketAccount?orderNo=" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                            vm_train_change.trainTicketAccounts = result.obj
                        } else {
                            toastr.error("获取登账数据失败", "", toastrConfig);
                        }
                        vm_train_change.step = vm_train_change.step + 1;
                    },
                    error: function (result) {
                        toastr.error("获取登账数据失败", "", toastrConfig);
                    }
                })
            },
            //加载日志数据
            loadLogData: function () {
                $.ajax({
                    url: __ctx + "/trainorder/log?orderNo=" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                            vm_train_change.trainOrderLogs = result.obj
                        } else {
                            // toastr.error("获取日志数据失败", "", toastrConfig);
                        }
                    },
                    error: function (result) {
                        toastr.error("获取日志数据失败", "", toastrConfig);
                    }
                })
            },
            // //加载行程数据
            // loadItineraryData: function () {
            //     $.ajax({
            //         url: __ctx + "/train/change/itinerary/" + window.orderNo,
            //         type: "GET",
            //         datatype: "json",
            //         success: function (result) {
            //             if (result.result) {
            //                 vm_train_change.itinerary = result.obj
            //             } else {
            //                 toastr.error("获取行程数据失败", "", toastrConfig);
            //             }
            //         },
            //         error: function (result) {
            //             toastr.error("获取行程数据失败", "", toastrConfig);
            //         }
            //     })
            // },
            refurbish: function() {
                window.location.reload();
                // vm_train_change.loadData();
                // vm_train_change.loadTrainTicketAccountData();
                // vm_train_change.loadLogData();
                // vm_train_change.loadTrainOrderPaymentInformationData();
                // vm_train_change.loadOriginPrice();
                // vm_train_change.showCancel = true;
                // vm_train_change.needflush = false;
            },

            //加载支付信息
            loadTrainOrderPaymentInformationData: function () {
                $.ajax({
                    url: __ctx + "/trainorder/payment/" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                            vm_train_change.trainOrderPaymentInformation = result.obj
                        }
                    },
                    error: function (result) {
                        toastr.error("获取支付数据失败", "", toastrConfig);
                    }
                })
            },

            loadOriginPrice: function (){
                $.ajax({
                    url: __ctx + "/train/change/originPrice/",
                    type: "POST",
                    datatype: "json",
                    data: {orderNo: window.orderNo},
                    success: function (result) {
                        if (result.result) {
                            vm_train_change.originPrice = result.obj
                        }
                    },
                    error: function (result) {
                        toastr.error("获取支付数据失败", "", toastrConfig);
                    }
                })
            },
            bindReason: function (event) {
                this.cancelReason = $(event.target).closest("p").text()
            },
            cancelChange: function () {
                if (!vm_train_change.cancelReason) {
                    toastr.error("改签单取消原因不能为空！", "", toastrConfig);
                    return;
                }
                $.ajax({
                    url: __ctx + "/train/change/cancelChange",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo,
                        cancelReasonCode: vm_train_change.cancelReasonCode,
                        cancelReason: vm_train_change.cancelReason
                    },
                    datatype: "json",
                    error: function (result) {
                        toastr.error("取消失败", "", toastrConfig);
                    },
                    success: function (result) {
                        if (result.result) {
                            toastr.success("取消成功", "", toastrConfig);
                            location.reload(true);
                        } else if (!result.result && result.errorCode == 'LY0522012105') {
                            toastr.success("该改签单不能取消：订单状态已变化！", "", toastrConfig);
                        } else {
                            toastr.error("取消失败", "", toastrConfig);
                        }
                    }
                });
            },

            //确认改签
            confirmChange: function () {
                $.ajax({
                    url: __ctx + "/train/change/confirmChange",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo
                    },
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                            vm_train_change.trainConfirmChangeResult = result.obj;
                            location.reload(true);
                        } else {
                            toastr.error("确认改签失败,失败原因：" + result.message, "", toastrConfig);
                        }
                    },
                    error: function (result) {
                        toastr.error("系统异常", "", toastrConfig);
                    }
                })
            },
            searchStopOverStation: function (trainNo) {
                $(".stopover-station").addClass("dn");
                if (!vm_train_change.showStopStation) {
                    $.ajax({
                        async: false,
                        url: __ctx + "/train/stopOver",
                        type: "get",
                        data: {
                            "trainNo": trainNo,
                            "fromStation": vm_train_change.order.trainChangeApplyItemVO.fromStation,
                            "toStation": vm_train_change.order.trainChangeApplyItemVO.toStation,
                            "date": moment(vm_train_change.order.trainChangeApplyItemVO.planBeginDate).format('YYYYMMDD')
                        },
                        success: function (data) {
                            vm_train_change.stopOverStations = data.obj;
                        }
                    });
                    $("div[data='" + trainNo + "']").children(".stopover-station").removeClass("dn");
                    vm_train_change.showStopStation = true
                } else if (vm_train_change.showStopStation) {
                    $("div[data='" + trainNo + "']").children(".stopover-station").addClass("dn");
                    vm_train_change.showStopStation = false
                }
            },
            searchRefundDetails: function (orderItem) {
                $(".refundDetail").addClass("dn");
                if (vm_train_change.popupId == orderItem.trainPassengerVO.id) {
                    vm_train_change.showDetails = true;
                    vm_train_change.popupId = 0;
                } else {
                    vm_train_change.popupId = orderItem.trainPassengerVO.id;
                }
                if (!vm_train_change.showDetails) {
                    $.ajax({
                        url: __ctx + "/train/refund/refundDetails",
                        type: "POST",
                        contentType: "application/json;charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify({
                            orderNo: orderItem.orderNo,
                            id: orderItem.id,
                            passengerName: orderItem.trainPassengerVO.passengerName,
                            passengerTicketNo: orderItem.trainTicketVO.passengerTicketNo
                        }),
                        success: function (data) {
                            vm_train_change.refundDetails = data.obj;
                            vm_train_change.refundDetails.orderItem = orderItem;
                        }
                    });
                    $("div[data='" + orderItem.trainPassengerVO.id + "']").children(".refundDetail").removeClass("dn");
                } else if (vm_train_change.showDetails) {
                    $("div[data='" + orderItem.trainPassengerVO.id + "']").children(".refundDetail").addClass("dn");
                    vm_train_change.showDetails = false
                }
            },
            toPayment: function () {
                $.ajax({
                    url: __ctx + "/trainpayment/singlePay/check",
                    data: {
                        orderNo: window.orderNo
                    },
                    success: function (data) {
                        if (data.result) {
                            window.location.href = __ctx + "/trainpayment/change/singlePay/index?orderNo=" + window.orderNo
                        } else {
                            toastr.error(data.message, "", {
                                timeOut: 0,
                                positionClass: "toast-top-center",
                                extendedTimeOut: 0,
                                closeButton: true
                            });
                        }
                    }
                });
            },
            
            manualBill: function (tmcId, itemId, operateTypeId) {
                $.ajax({
                    url: __ctx + "/trainTicketAccount/manualBill",
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        tmcId: tmcId,
                        itemId: itemId,
                        operateTypeId: operateTypeId,
                        itineraryType: 1
                    }),
                    success: function (result) {
                        if (result.result) {
                            toastr.success("手工登账成功", "", toastrConfig);
                        }else{
                            toastr.error(result.message, "", toastrConfig);
                        }
                        window.setTimeout(function () {
                            window.location.reload();
                        },2000);
                    }
                });
            },
            
            cancelBill: function (orderNo, billNo) {
                $.ajax({
                    url: __ctx + "/trainTicketAccount/cancelBill",
                    type: "POST",
                    dataType: "json",
                    data:{
                        orderNo: orderNo,
                        billNo: billNo
                    },
                    success: function (result) {
                        if (result.result) {
                            toastr.success("作废账单成功", "", toastrConfig);
                        }else{
                            toastr.error(result.message, "", toastrConfig);
                        }
                        window.setTimeout(function () {
                            window.location.reload();
                        },2000);
                    }
                });
            },
            
            addLog: function () {
                var innerText = $('#trainOnChangeInnerText').val();
                if (!innerText) {
                    toastr.error("请输入内部日志", "", toastrConfig);
                    return;
                }

                if (innerText.length > 200) {
                    toastr.error("输入超过200字符，请重新输入", "", toastrConfig);
                    return;
                }
                $.ajax({
                    url: __ctx + "/trainorder/addLog/" + window.orderNo,
                    type: "POST",
                    data: {
                        innerText: innerText
                    },
                    success: function (result) {
                        if (result.result) {
                            toastr.success("添加成功", "", toastrConfig);
                            vm_train_change.loadLogData();
                        } else {
                            toastr.error("添加失败", "", toastrConfig);
                        }
                    }
                })
            },
            applyRefundTicket: function (orderNo) {
            	$.ajax({
                    url: __ctx + "/train/change/checkRefund?orderNo=" + orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                        	window.location.href = __ctx + "/train/refund/change/apply/" + orderNo;
                        } else {
                            toastr.error(result.message, "", toastrConfig);
                        }
                    }
                })
            },
            regroup:function () {
                if (vm_train_change.step == 2) {
                    var trainTicketMap = {};
                    _.forEach(vm_train_change.trainTicketAccounts, function(value){
                        var key = value.passengerTicketNo;
                        var value = value;
                        trainTicketMap[key] = value;
                    });
                    _.forEach(vm_train_change.order.trainOrderItemVOS, function(value){
                        var key = value.trainTicketVO.passengerTicketNo;
                        value.ticketAccount = undefined;
                        var ticketAccount = trainTicketMap[key];
                        if (ticketAccount != undefined) {
                            value.ticketAccount = ticketAccount;
                        }
                        vm_train_change.trainOrderItemVOS.push(value);
                    });
                }
            },
            financeNote: function(ticketAccount) {
                vm_train_change.ticketAccount = ticketAccount;
                $("#refundBillAccount").modal('hide');
                $("#financeNote").modal({
                    show: true,
                    remote: __ctx + "/trainTicketAccount/toFinanceNote",
                    backdrop: 'static',
                })
            },
            //发送短信
            sendMsg: function () {
                if ($("#phoneNum").val()=="") {
                    toastr.error("请输入手机号！", "", toastrConfig);
                    return;
                }
                if (!vm_train_change.messageOpt) {
                    toastr.error("请输入短信内容！", "", toastrConfig);
                    return;
                }
                var mobile = $("#phoneNum").val();
                var message = vm_train_change.messageOpt;
                var receiverRole = vm_train_change.messageReceiverList[vm_train_change.selectedOpt].receiverRole;
                $.ajax({
                    url: __ctx + "/manualSendMsg/manualSendMsg",
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        mobile: mobile,
                        message: message,
                        productCode: 3,//火车票
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
                vm_train_change.messageReceiverList = [];
                //1.旅客
                _.forEach(vm_train_change.order.trainOrderItemVOS, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 1;
                    oneReceiver.receiver = value.trainPassengerVO.passengerName;
                    oneReceiver.phone = value.trainPassengerVO.passengerPhone;
                    vm_train_change.messageReceiverList.push(oneReceiver);
                });
                //2.预订人
                var oneReceiver = {};
                oneReceiver.receiverRole = 2;
                oneReceiver.receiver = vm_train_change.order.trainChangeApplyItemVO.bookPersonName;
                oneReceiver.phone = vm_train_change.order.trainChangeApplyItemVO.bookPersonPhone;
                vm_train_change.messageReceiverList.push(oneReceiver);
                //3.联系人
                _.forEach(vm_train_change.order.trainContactPersonVOS, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 3;
                    oneReceiver.receiver = value.personName;
                    oneReceiver.phone = value.personMobile;
                    vm_train_change.messageReceiverList.push(oneReceiver);
                });
                //4.抄送人
                _.forEach(vm_train_change.order.trainServicePersonVOS, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 4;
                    oneReceiver.receiver = value.servicePersonName;
                    oneReceiver.phone = value.servicePersonPhone;
                    vm_train_change.messageReceiverList.push(oneReceiver);
                });
                //8.其他
                var oneReceiver = {};
                oneReceiver.receiverRole = 8;
                oneReceiver.receiver = "其他";
                oneReceiver.phone = "";
                vm_train_change.messageReceiverList.push(oneReceiver);
            }
        }
    });
});