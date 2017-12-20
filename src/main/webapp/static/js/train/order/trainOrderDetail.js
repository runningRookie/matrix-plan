/**
 * Created by csx22004 on 2017/2/13.
 */

var vue_order;
$(document).ready(function () {

    Vue.filter('toPaymentTypeFilter', function (value) {
        if (value == 'n') {
            return '现结';
        } else if (value == 'm') {
            return '授信';
        } else {
            return '';
        }
    });

    Vue.filter('logContentFilter', function (value, replaceFlag) {
        if (value && replaceFlag) {
            value = value.replace(new RegExp(replaceFlag, 'g'), "<br>");
        }
        return value;
    });

    Vue.filter('changeTypeFilter', function (value) {
        switch (value){
            case "1": return "原价改签"; break;
            case "2": return "高改低改签"; break;
            case "3": return "低改高改签"; break;
            default: return ""; break;
        }

    });

    Vue.filter('changeStatusFilter', function (value) {
        switch (value){
            case "N": return "占座中"; break;
            case "A": return "待支付"; break;
            case "E": return "待确认改签"; break;
            case "F": return "出票成功"; break;
            case "U": return "改签失败"; break;
            case "T": return "退票成功"; break;
            case "O": return "订单过期"; break;
            case "C": return "订单已取消"; break;
            default: return ""; break;
        }
    });

    Vue.filter('seatFilter',function(value){
        if(value == 'hardseat')
        return "硬座";
        else if(value == 'softseat')
        return "软座";
        else if(value == 'firstseat')
        return "一等座";
        else if(value == "secondseat")
        return "二等座";
        else if(value == 'hardsleeperup')
        return "硬卧上铺";
        else if(value == 'hardsleepermid')
        return "硬卧中铺";
        else if(value == 'hardsleeperdown')
        return "硬卧下铺";
        else if(value == 'softsleeperup')
        return "软卧上铺";
        else if(value == 'softsleeperdown')
        return "软卧下铺";
        else if(value == 'noseat')
        return "无座";
        else if(value == 'businessseat')
        return "商务座";
        else if(value == 'specialseat')
        return "特等座";
        else if(value == 'advancedsoftsleeper')
        return "高级软卧";
        else if(value == 'otherseat')
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

    });

    Vue.filter('operateTypeFilter', function (value) {
        switch (value){
            case "1": return "出票"; break;
            case "2": return "改签"; break;
            case "3": return "退票"; break;
            default: return ""; break;
        }

    });

    Vue.filter('billIsSuccessFilter', function (value) {
        switch (value){
            case "1": return "登账成功"; break;
            case "0": return "登账失败"; break;
            default: return "未登账"; break;
        }

    });

    vue_order = new Vue({
        el: '#trainOrderDetail',
        data: {
            order: {},
            trainTicketAccounts: [],
            trainOrderPaymentInformation: {},
            trainOrderLogs: [],
            stopOverStations: [],
            itinerary: {},
            relateOrderNum: 0,
            cancelReasonCode: "1",
            cancelReason: "行程取消",
            showCancel: false,
            showStopStation: false,
            showDetails: false,
            refundDetails: {},
            changeDetails: {},
            popupId: 0,
            isChanged:false,
            needflush: false,
            step: 0,
            trainOrderItemVOS: [],
            financeUrl:window.location.host + '/finance/bussinessbillsdetail/billsdetail-op',
            ticketAccount: '',
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
            this.loadRelateOrderNum();
            this.loadLogData();
            this.loadItineraryData();
            this.loadTrainOrderPaymentInformationData();
            this.showCancel = true;
        },
        methods: {
            showViolation: function (id) {
                var $b = $('#violationBtn_'+ id);
                var $t = $("#violationTab_" + id);
                var X = $b.position().top;
                var Y = $b.position().left;
                if($t.css('display') == 'none'){
                    $t.css({'left': Y - $t.width() / 2  +'px','top':X - $t.height() - 50  +'px'});
                    $t.show();
                } else {
                    $t.hide();
                }
            },
            //加载订单数据
            loadData: function () {
                $.ajax({
                    url: __ctx + "/trainorder/detail/" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result && result.obj) {
                            var itemNeedflush = false;
                            vue_order.order = result.obj;
                            _.forEach(vue_order.order.trainOrderItemVOS, function(value){
                                if (value.ticketStatus == 'G') {
                                    vue_order.isChanged = true
                                }
                                value.itemNeedflush = false;
                                if (value.ticketStatus == 'C') {
                                    itemNeedflush = true;
                                    value.itemNeedflush = true;
                                }
                                value.ticketAccount = undefined;
                            });
                            //D:待提交,S:待审批,G:审批中,A:待支付,H:审批不通过 时可取消订单
                            if (vue_order.order.trainOrderDetailVO.orderStatus == 'D'
                                || vue_order.order.trainOrderDetailVO.orderStatus == 'S'
                                || vue_order.order.trainOrderDetailVO.orderStatus == 'G'
                                || vue_order.order.trainOrderDetailVO.orderStatus == 'A'
                                || vue_order.order.trainOrderDetailVO.orderStatus == 'H') {
                                $("#cancelOrder").removeAttr("disabled");
                                $("#cancelOrder").removeAttr("style");
                            } else {
                                $("#cancelOrder").attr("disabled", "disabled");
                                $("#cancelOrder").attr('style', 'background-color : #ccc');
                            }
                            if (vue_order.order.trainOrderDetailVO.orderStatus == 'A' && vue_order.order.trainOrderMainVO.paymentType == 'n') {
                                $("#toPayment").removeAttr("disabled");
                                $("#toPayments").removeAttr("style");
                            } else {
                                $("#toPayment").attr("disabled", "disabled");
                                $("#toPayment").attr('style', 'background-color : #ccc');
                            }
                            // if (itemNeedflush || vue_order.order.trainOrderDetailVO.orderStatus == 'N'
                            //     || vue_order.order.trainOrderDetailVO.orderStatus == 'E'){
                            //     vue_order.needflush = true;
                            // }
                            if (vue_order.order.trainOrderDetailVO.orderStatus == 'N'
                                || vue_order.order.trainOrderDetailVO.orderStatus == 'E'){
                                vue_order.needflush = true;
                            }
                            setTimeout(function () {
                                $("[data-toggle='popover']").popover();
                            }, 1000);
                            vue_order.step = vue_order.step + 1;
                        } else {
                            window.location.href = __ctx+"/common/pageNotFound";
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
                    url: __ctx + "/trainTicketAccount/issueTicketAccount?orderNo=" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                            vue_order.trainTicketAccounts = result.obj
                        } else {
                            toastr.error("获取登账数据失败", "", toastrConfig);
                        }
                        vue_order.step = vue_order.step + 1;
                    },
                    error: function (result) {
                        toastr.error("获取登账数据失败", "", toastrConfig);
                    }
                })
            },
            //获取关联的行程单数量
            loadRelateOrderNum: function () {
                $.ajax({
                    url: __ctx + "/trainOrderDetail/relateOrder?orderNo=" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                            vue_order.relateOrderNum = result.obj - 1;
                        } else {
                            toastr.error("获取关联订单数失败", "", toastrConfig);
                        }
                    },
                    error: function (result) {
                        toastr.error("获取关联订单数失败", "", toastrConfig);
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
                            vue_order.trainOrderLogs = result.obj
                        } else {
                            // toastr.error("获取日志数据失败", "", toastrConfig);
                        }
                    },
                    error: function (result) {
                        toastr.error("获取日志数据失败", "", toastrConfig);
                    }
                })
            },
            //加载行程数据
            loadItineraryData: function () {
                $.ajax({
                    url: __ctx + "/trainorder/itinerary/" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                            vue_order.itinerary = result.obj
                        } else {
                            toastr.error("获取行程数据失败", "", toastrConfig);
                        }
                    },
                    error: function (result) {
                        toastr.error("获取行程数据失败", "", toastrConfig);
                    }
                })
            },
            //加载支付信息
            loadTrainOrderPaymentInformationData:function () {
                $.ajax({
                    url: __ctx + "/trainorder/payment/" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                            vue_order.trainOrderPaymentInformation = result.obj
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
            refurbish: function() {
                window.location.reload();
                // vue_order.loadData();
                // vue_order.loadTrainTicketAccountData();
                // vue_order.loadRelateOrderNum();
                // vue_order.loadLogData();
                // vue_order.loadItineraryData();
                // vue_order.loadTrainOrderPaymentInformationData();
                // vue_order.showCancel = true;
                // vue_order.needflush = false;
            },
            cancelOrder: function () {
                if (!vue_order.cancelReason) {
                    toastr.error("订单取消原因不能为空！", "", toastrConfig);
                    return;
                }
                $.ajax({
                    url: __ctx + "/trainOrderDetail/cancelOrder",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo,
                        cancelReasonCode: vue_order.cancelReasonCode,
                        cancelReason: vue_order.cancelReason
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
                            alert("该订单不能取消：订单状态已变化！");
                        } else {
                            toastr.error("取消失败", "", toastrConfig);
                        }
                    }
                });
            },
            searchStopOverStation: function (trainNo) {
                $(".stopover-station").addClass("dn");
                if (!vue_order.showStopStation) {
                    $.ajax({
                        async: false,
                        url: __ctx + "/train/stopOver",
                        type: "get",
                        data: {
                            "trainNo": trainNo,
                            "fromStation": vue_order.order.trainOrderDetailVO.fromStation,
                            "toStation": vue_order.order.trainOrderDetailVO.toStation,
                            "date": moment(vue_order.order.trainOrderDetailVO.planBeginDate).format('YYYYMMDD')
                        },
                        success: function (data) {
                            vue_order.stopOverStations = data.obj;
                        }
                    });
                    $("div[data='" + trainNo + "']").children(".stopover-station").removeClass("dn");
                    vue_order.showStopStation = true
                } else if (vue_order.showStopStation) {
                    $("div[data='" + trainNo + "']").children(".stopover-station").addClass("dn");
                    vue_order.showStopStation = false
                }
            },
            searchRefundDetails: function (orderItem) {
                $(".refundDetail").addClass("dn");
                if (vue_order.popupId == orderItem.trainPassengerVO.id) {
                    vue_order.showDetails = true;
                    vue_order.popupId = 0;
                } else {
                    vue_order.popupId = orderItem.trainPassengerVO.id;
                }
                if (!vue_order.showDetails) {
                    $.ajax({
                        url: __ctx + "/train/refund/refundDetails",
                        type: "POST",
                        contentType: "application/json;charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify({
                            orderNo: orderItem.orderNo,
                            id: orderItem.id,
                            passengerName: orderItem.trainPassengerVO.passengerName,
                            passengerTicketNo:orderItem.trainTicketVO.passengerTicketNo
                        }),
                        success: function (data) {
                            vue_order.refundDetails = data.obj;
                            vue_order.refundDetails.orderItem = orderItem;
                        }
                    });
                    $("div[data='" + orderItem.trainPassengerVO.id + "']").children(".refundDetail").removeClass("dn");
                } else if (vue_order.showDetails) {
                    $("div[data='" + orderItem.trainPassengerVO.id + "']").children(".refundDetail").addClass("dn");
                    vue_order.showDetails = false
                }
            },

            searchApplyChangeTicket: function (orderItemId, orderNo) {
                var top = $(event.target).position().top;
                var $c = $("#searchChangeTab");
                if($c.css('display') == 'none'){
                    $c.css("top", top + 20);
                    $c.show();
                } else {
                    $c.hide();
                    return;
                }
                $.ajax({
                    url: __ctx + "/train/change/changeList",
                    type: "POST",
                    data: {
                        orderItemId:orderItemId
                    },
                    success: function (data) {
                        if (data.result){
                            vue_order.changeDetails=data.obj;
                        } else {
                            toastr.warning("系统异常","", toastrConfig)
                        }
                    }
                });
            },

            toPayment: function () {
                $.ajax({
                    url: __ctx + "/trainpayment/singlePay/check",
                    data: {
                        orderNo: window.orderNo
                    },
                    success: function (data) {
                        if (data.result) {
                            window.location.href = __ctx + "/trainpayment/singlePay/index?orderNo="+window.orderNo
                        } else {
                            toastr.error(data.message, "", {timeOut: 0, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
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

            addLog:function () {
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
                    url: __ctx + "/trainorder/addLog/"+window.orderNo,
                    type: "POST",
                    data:{
                        innerText: innerText
                    },
                    success: function (result) {
                        if (result.result) {
                            toastr.success("添加成功", "", toastrConfig);
                            vue_order.loadLogData();
                        }else{
                            toastr.error("添加失败", "", toastrConfig);
                        }
                    }
                })
            },
            applyRefundTicket:function (itemId) {
                $.ajax({
                    url: __ctx + "/train/refund/checkRefund?itemId=" + itemId,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                            window.location.href = __ctx + "/train/refund/apply/"+itemId;
                        } else {
                            toastr.error(result.message, "", toastrConfig);
                        }
                    }
                })
            },
            applyChangeTicket:function (itemId) {
                window.location.href = __ctx + "/train/change/apply/"+itemId;
            },
            regroup:function () {
                if (vue_order.step == 2) {
                    var trainTicketMap = {};
                    _.forEach(vue_order.trainTicketAccounts, function(value){
                        var key = value.passengerTicketNo;
                        var value = value;
                        trainTicketMap[key] = value;
                    });
                    _.forEach(vue_order.order.trainOrderItemVOS, function(value){
                        var key = value.trainTicketVO.passengerTicketNo;
                        value.ticketAccount = undefined;
                        var ticketAccount = trainTicketMap[key];
                        if (ticketAccount != undefined) {
                            value.ticketAccount = ticketAccount;
                        }
                        vue_order.trainOrderItemVOS.push(value);
                    });
                }
            },
            financeNote: function(ticketAccount) {
                vue_order.ticketAccount = ticketAccount;
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
                if (!vue_order.messageOpt) {
                    toastr.error("请输入短信内容！", "", toastrConfig);
                    return;
                }
                var mobile = $("#phoneNum").val();
                var message = vue_order.messageOpt;
                var receiverRole = vue_order.messageReceiverList[vue_order.selectedOpt].receiverRole;
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
                vue_order.messageReceiverList = [];
                //1.旅客
                _.forEach(vue_order.order.trainOrderItemVOS, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 1;
                    oneReceiver.receiver = value.trainPassengerVO.passengerName;
                    oneReceiver.phone = value.trainPassengerVO.passengerPhone;
                    vue_order.messageReceiverList.push(oneReceiver);
                });
                //2.预订人
                var oneReceiver = {};
                oneReceiver.receiverRole = 2;
                oneReceiver.receiver = vue_order.order.trainOrderDetailVO.bookPersonName;
                oneReceiver.phone = vue_order.order.trainOrderDetailVO.bookPersonPhone;
                vue_order.messageReceiverList.push(oneReceiver);
                //3.联系人
                _.forEach(vue_order.order.trainContactPersonVOS, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 3;
                    oneReceiver.receiver = value.personName;
                    oneReceiver.phone = value.personMobile;
                    vue_order.messageReceiverList.push(oneReceiver);
                });
                //4.抄送人
                _.forEach(vue_order.order.trainServicePersonVOS, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 4;
                    oneReceiver.receiver = value.servicePersonName;
                    oneReceiver.phone = value.servicePersonPhone;
                    vue_order.messageReceiverList.push(oneReceiver);
                });
                //8.其他
                var oneReceiver = {};
                oneReceiver.receiverRole = 8;
                oneReceiver.receiver = "其他";
                oneReceiver.phone = "";
                vue_order.messageReceiverList.push(oneReceiver);
            }
        }
    });
});
