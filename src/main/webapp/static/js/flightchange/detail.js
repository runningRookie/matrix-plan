var changeInfoVM;
$(document).ready(function () {
    var defaultConfig = {container: 'body'};

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
    
    var changeInfoVM = new Vue({
        el: '#changeInfoVM',
        data: {
            orderNo: window.orderNo,
            info: {
                ticketAccountDtoList: []
            },
            bookCompanyName: "",
            bookPerson: "",
            refundApplys:[],
            servicePeoples: [],
            contactPersons: [],
            refundApplys:[],
            ticketAccount: ''
        },
        methods: {
            manualAccount: function (ticketNo, orderNo, applyNo, paymentType) {
                $.ajax({
                    url: __ctx + "/flights/manualAccountSync/" + ticketNo + "/" + orderNo + "/" + applyNo + "/" + paymentType,
                    type: "POST",
                    data: {
                        ticketNo: ticketNo,
                        orderNo: orderNo,
                        applyNo: applyNo,
                        paymentType: paymentType
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("手工登账失败!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        if (data.result) {
                            toastr.info("手工登账成功!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            toastr.error(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                        }
                        $.getJSON(__ctx + "/flights/change/detail", {applyNo: window.applyNo}, function (result) {
                            changeInfoVM.info = _.cloneDeep(result.obj.flightChangeApplyDTO);
                            newChangInfoVM.info = _.cloneDeep(result.obj.flightChangeApplyDTO);
                            newChangInfoVM.segments = _.cloneDeep(result.obj.segmentMap.flightSegments);
                            newChangInfoVM.passengers = _.cloneDeep(result.obj.segmentMap.passengers);
                        });
                    }
                });
            },
            toValidate: function (billNo) {
                var href = changeInfoVM.info.billsCancelUrl + billNo;
                window.open(href);
            },
            financeNote: function (ticketAccount) {
                this.ticketAccount = ticketAccount;
                $("#formModal").modal({
                    show: true,
                    remote: __ctx + "/orderdetails/toFinanceNote",
                    backdrop: 'static',
                })
            }
        }
    });

    var newChangInfoVM = new Vue({
        el: '#newChangInfoVM',
        data: {
            segments: [],
            info: {},
            passengers: [],
            logs: [],
            originRefund: {},
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
            var thisVM = this;
            $.getJSON(__ctx + "/flights/change/" + window.applyNo + "/logs", function (data) {
                thisVM.logs = data.obj;
            });
        },
        methods: {
            showStopSite: function (flightStopSites, index) {
                var stopsites = "";
                stopsites += "<table style='width:100%;padding:0px;' class='table table-bordered'>";
                stopsites += "<thead>";
                stopsites += "<tr>";
                stopsites += "<th></th>";
                stopsites += "<th>经停机场</th>";
                stopsites += "<th>到达时间</th>";
                stopsites += "<th>起飞时间</th>";
                stopsites += "</tr>";
                stopsites += "</thead>";
                stopsites += "<tbody>";
                $(flightStopSites).each(function (i, stopSite) {
                    stopsites += "<tr>";
                    stopsites += "<th>" + (i + 1) + "</th>";
                    stopsites += "<th>" + stopSite.stopPort + "</th>";
                    stopsites += "<th>" + stopSite.arriveTime + "</th>";
                    stopsites += "<th>" + stopSite.leaveTime + "</th>";
                    stopsites += "</tr>";
                });
                stopsites += "</tbody>";
                stopsites += "</table>";
                var option = {
                    template: "<div class='popover' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content' style='padding:0px;'></div></div>",
                    content: stopsites,
                    container: 'body',
                    html: true
                };

                $('#newStopSites' + index).popover(option).popover('show');
            },
            getTicketStatus: function (index, ticketNo, passengerName) {
                var startPortCode = this.segments[index].newSegment.startPortCode;
                var endPortCode = this.segments[index].newSegment.endPortCode;
                var airlineCompanyCode = this.segments[index].newSegment.airlineCompanyCode;
                $.ajax({
                    url: __ctx + "/flightOrder/getTicketLastStatus",
                    type: "POST",
                    data: {
                        ticketNo: ticketNo,
                        startPortCode: startPortCode,
                        endPortCode: endPortCode,
                        airlineCode: airlineCompanyCode,
                        passengerName: passengerName
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("获取票号状态失败!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        if (data.result) {
                            $("#newTicketNo" + index + "_" + ticketNo).text("(" + data.obj + ")").css("color", "red");
                        } else {
                            toastr.error(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                        }
                    }
                });
            },
            //切换手机号
            changePhoneSelected: function (phoneNum) {
                $("#phoneNum").val(phoneNum);
            },
        }
    });
    
    tc.ns('tc.change.logs.refresh', function () {
    	  $.getJSON(__ctx + "/flights/change/" + window.applyNo + "/logs", function (data) {
    		  newChangInfoVM.logs = data.obj;
          });
    });

    var flightVM = tc.flight.change.segments(null, null, function (refund) {
        newChangInfoVM.originRefund = refund;
    }, window.applyNo);

    (function () {
        var data = {orderNo: window.orderNo};
        var param = {applyNo: window.applyNo};
        if (window.orderNo == '') {
            window.location.href = __ctx + "/common/pageNotFound";
        }

        $.getJSON(__ctx + "/orderdetails/getBookCompanyName", data, function (result) {
            changeInfoVM.bookCompanyName = result.obj;
        });

        $.getJSON(__ctx + "/orderdetails/bookpersons", data, function (result) {
            changeInfoVM.bookPerson = result.obj;
        });

        $.getJSON(__ctx + "/negativeprofits/serachservicepeople", data, function (result) {
        	changeInfoVM.servicePeoples = result.obj;
        });

        $.getJSON(__ctx + "/negativeprofits/serachcontactperson", data, function (result) {
        	changeInfoVM.contactPersons = result.obj;
        });
        
        $.getJSON(__ctx + "/flights/change/detail", {applyNo: window.applyNo}, function (result) {
            if (!result.obj || !result.obj.flightChangeApplyDTO) {
                window.location.href = __ctx + "/common/pageNotFound";
            } else {
                changeInfoVM.info = _.cloneDeep(result.obj.flightChangeApplyDTO);
                newChangInfoVM.info = _.cloneDeep(result.obj.flightChangeApplyDTO);
                newChangInfoVM.segments = _.cloneDeep(result.obj.segmentMap.flightSegments);
                newChangInfoVM.passengers = _.cloneDeep(result.obj.segmentMap.passengers);

                if (['03','05','08'].indexOf(changeInfoVM.info.changeStatus) > -1) {
                    $("#cancelChange").attr("disabled", false).removeClass("btn-not-allowed");
                }
                if (['05'].indexOf(changeInfoVM.info.changeStatus) > -1) {
                    $("#toPayment").attr("disabled", false).removeClass("btn-not-allowed");
                }
                if (['08'].indexOf(changeInfoVM.info.changeStatus) > -1) {
                    $("#confirmChange").attr("disabled", false).removeClass("btn-not-allowed");
                }

                _.forEach(newChangInfoVM.passengers, function (sub) {
                    _.forEach(sub, function (item) {
                        if (!item.ticket) {
                            return;
                        }
                        if (['A'].indexOf(item.ticket.ticketStatus) > -1) {
                            $("#toRefundOrder").attr("disabled", false).removeClass("btn-not-allowed");
                            $("#toChangeOrder").attr("disabled", false).removeClass("btn-not-allowed");
                            if(!!window.flightSegmentChangeId){
                                $("#toSegmentChangeOrder").attr("disabled", false).removeClass("btn-not-allowed");
                            }
                        }
                    });
                });

                setTimeout(function () {
                    $('.newPriceTypes').each(function () {
                        var selector$ = $(this);
                        var pIndex = selector$.data('pindex');
                        var index = selector$.data('index');
                        var item = newChangInfoVM.passengers[pIndex][index].segmentInfo;
                        var segment = newChangInfoVM.segments[index].newSegment;
                        if (!item || !segment) {
                            return;
                        }
                        if (item.priceType != 1) {
                            return;
                        }
                        var template = tc.flight.detail.utils.genTableTemplate([], [
                            ['协议号：', segment.airlineCompany + '：' + item.agreementCode],
                            ['协议价：', item.agreementPrice]
                        ]);

                        selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
                    });
                }, 500);
            }
        });

        $.getJSON(__ctx + "/flights/change/" + window.applyNo + "/prepnr", function (result) {
            flightVM.setFlightOrder({pnr: result.obj});
        });
        
        $.getJSON(__ctx + "/changeTicket/getChangeRefundApply", param, function (result) {
        	changeInfoVM.refundApplys = result.obj;
        });
    })();

    $('#cancelChangeBtn').click(function () {
        $.post(__ctx + "/flights/change/" + window.applyNo + "/cancel", function (data) {
            if (!data.result) {
                toastr.error("取消改期失败", "", toastrConfig);
                return;
            }
            toastr.info("取消改期成功!", "", toastrConfig);
            location.reload();
        });
    });

    $('#toPayment').click(function () {
        $.ajax({
            url: __ctx + "/change/payment/singlePay/check",
            data: {
                applyNo: window.applyNo
            },
            success: function (data) {
                if (!data.result) {
                    toastr.error(data.message, "", toastrConfig);
                    return;
                }
                window.location.href = __ctx + "/change/payment/singlePay/index?applyNo=" + window.applyNo
            }
        });
    });
    
    $('#toChangeOrder').click(function () {
        var href = __ctx + '/flights/launchchange?orderOrApplyNo=' + window.applyNo + '&sourceType=' + 2;
        window.open(href);
    });
    
    $('#toRefundOrder').click(function () {
        var href = __ctx + '/flights/refund?orderNo=' + window.applyNo+'&sourceType='+2;
        window.open(href);
    });

    $('.originFlightShowBtn').click(function () {
        var btn$ = $(this);
        var show$ = $('.originFlightShow');
        if (btn$.text() === '查看更多') {
            show$.slideDown(300);
            btn$.text('收起');
        } else {
            show$.slideUp(300);
            btn$.text('查看更多');
        }
    });

    $('#confirmChangeBtn').click(function () {
        $.post(__ctx + "/flights/change/" + window.applyNo + "/confirm", function (data) {
            if (!data.result) {
                toastr.error("确认改期失败", "", toastrConfig);
                return;
            }else{
            	if(data.obj == 1){
            		toastr.error("改期订单已过期，请重新申请改期", "", toastrConfig);
            	}else
            	if(data.obj == 2){
            		toastr.error("改期订单已过期，请重新申请改期", "", toastrConfig);
            	}else
            	if(data.obj == 3){
            		toastr.error("改期订单出票失败，请人工处理改期", "", toastrConfig);
            	}else{
            		toastr.info("确认改期成功!", "", toastrConfig);
            	}
            	location.reload();
            }
        });
    });
    
    $('#toSegmentChangeOrder').click(function () {
    	var href = __ctx + '/flights/involuntaryChange?orderOrApplyNo=' + window.applyNo + '&sourceType=' + 2 + '&flightSegmentChangeId=' + window.flightSegmentChangeId;
    	window.open(href);
    });

    //发送短信
    $('#sendMsgBtn').click(function () {
        if ($("#phoneNum").val()=="") {
            toastr.error("请输入手机号！", "", toastrConfig);
            return;
        }
        if (!newChangInfoVM.messageOpt) {
            toastr.error("请输入短信内容！", "", toastrConfig);
            return;
        }
        var mobile = $("#phoneNum").val();
        var message = newChangInfoVM.messageOpt;
        var receiverRole = newChangInfoVM.messageReceiverList[newChangInfoVM.selectedOpt].receiverRole;
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
                relateCode: window.applyNo
            }),
            success: function (result) {
                if (result.result) {
                    toastr.success("手工短信发送成功", "", toastrConfig);
                }else{
                    toastr.error(result.message, "", toastrConfig);
                }
                window.setTimeout(function () {
                    window.location.reload();
                },2000);
            }
        });
    });
    //获取短信接收人列表
    $('#sendMsg').click(function () {
    	newChangInfoVM.messageReceiverList = [];
        //1.旅客
        _.forEach(newChangInfoVM.passengers, function(sub){
            _.forEach(sub, function(segment){
                var oneReceiver = {};
                oneReceiver.receiverRole = 1;
                oneReceiver.receiver = segment.passenger.passengerName;
                oneReceiver.phone = segment.passenger.passengerPhone;
                newChangInfoVM.messageReceiverList.push(oneReceiver);
            })
        });
        //2.预订人
        var oneReceiver = {};
        oneReceiver.receiverRole = 2;
        oneReceiver.receiver = changeInfoVM.bookPerson.bookPersonName;
        oneReceiver.phone = changeInfoVM.bookPerson.bookPersonPhone;
        newChangInfoVM.messageReceiverList.push(oneReceiver);
        //3.联系人
        _.forEach(changeInfoVM.contactPersons, function(value){
            var oneReceiver = {};
            oneReceiver.receiverRole = 3;
            oneReceiver.receiver = value.personName;
            oneReceiver.phone = value.personMobile;
            newChangInfoVM.messageReceiverList.push(oneReceiver);
        });
        //4.抄送人
        _.forEach(changeInfoVM.servicePeoples, function(value){
            var oneReceiver = {};
            oneReceiver.receiverRole = 4;
            oneReceiver.receiver = value.servicePersonName;
            oneReceiver.phone = value.servicePersonPhone;
            newChangInfoVM.messageReceiverList.push(oneReceiver);
        });
        //8.其他
        var oneReceiver = {};
        oneReceiver.receiverRole = 8;
        oneReceiver.receiver = "其他";
        oneReceiver.phone = "";
        newChangInfoVM.messageReceiverList.push(oneReceiver);
    });
});