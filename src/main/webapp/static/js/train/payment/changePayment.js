$(document).ready(function () {
    //设置单独支付tab选中
    if (window.type == 'singlePay') {
        $('#singlePay').tab('show');
    }
    var vm_payment_list = new Vue({
        el: '#changePaymentVM',
        data: {
            bookPerson: [],
            payOrderList: [],
            s_msgcontent: "",
            t_msgcontent: "",
            errNoList: [],
            orderList: [],
            orderMap: {},
            params: {
                itineraryNo: "",
                bookPersonName: "",
                // bookPersonPhone: "",
                payType: "",
                // content: "",
                backUrl: ""
            },
            smsOrderList: []
        },
        methods: {
            init: function () {
                //加载独立支付
                if (window.type == 'singlePay') {
                    vm_payment_list.singlePay();
                }
            },//独立支付
            singlePay: function () {
                //数据清空
                vm_payment_list.s_msgcontent = "";
                var requestData = {
                    itineraryNo:window.itineraryNo,
                    orderNumberList: []
                };
                requestData.orderNumberList.push(window.orderNo);
                $.ajax({
                    url: __ctx + "/itineraryPayment/getPayOrderList",
                    data: JSON.stringify(requestData),
                    type: "POST",
                    contentType:"application/json",
                    datatype: "json",
                    success: function (data) {
                        if (data.result) {
                            vm_payment_list.bookPerson = data.obj.bookPerson;
                            vm_payment_list.orderList = data.obj.listResult.values;
                            _.forEach(vm_payment_list.orderList,function(order){
                                vm_payment_list.orderMap[order.orderNo] = order;
                            });
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
            }, //获取支付链接
            getPayUrl: function (type) {
                //数据清空
                vm_payment_list.s_msgcontent = "";
                vm_payment_list.t_msgcontent = "";
                vm_payment_list.params.orderList = [];
                // 处理前校验
                if (!vm_payment_list.getPayUrlCheck()) {
                    return false;
                }
                if (type == 'single') {
                    var payOrder = vm_payment_list.orderMap[window.orderNo];
                    var paymentOrderVO = {};
                    paymentOrderVO.orderNo = window.orderNo;
                    paymentOrderVO.productCode = payOrder.productCode;
                    paymentOrderVO.orderType = payOrder.orderType;
                    // vm_payment_list.params.itineraryNo = window.itineraryNo;
                    vm_payment_list.params.orderList.push(paymentOrderVO);
                }
                vm_payment_list.params.payType = "3";
                vm_payment_list.params.itineraryNo = window.itineraryNo;
                vm_payment_list.params.bookPersonName = vm_payment_list.bookPerson.bookPersonName;
                vm_payment_list.params.backUrl = __ctx + "/train/change/detail?orderNo=" + window.orderNo;
                // vm_payment_list.params.bookPersonPhone = vm_payment_list.bookPerson.bookPersonPhone;
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + "/itineraryPayment/createPayment",
                    data: JSON.stringify(vm_payment_list.params),
                    success: function (data) {
                        if (data.result) {
                            vm_payment_list.smsOrderList = data.obj.orderNos;
                            $("#confirmTipPay").modal({
                                show: true,
                                backdrop: 'static'
                            });
                            $("#confirmTipBody").html("");
                            $("#confirmTipBody").html(data.obj.returnMsg);
                            $("#confirmTipClose").unbind();
                            $("#confirmTipClose").click(function () {
                                if (vm_payment_list.params.payType == "3") {
                                    if (data.obj.result == '1') {
                                        vm_payment_list.s_msgcontent = data.obj.content;
                                    } else if (data.obj.result == '2') {
                                        window.location.href = __ctx + "/train/change/detail?orderNo=" + window.orderNo;
                                    }
                                } else if (vm_payment_list.params.payType == "2") {
                                    if (data.obj.result == '1') {
                                        vm_payment_list.t_msgcontent = data.obj.content;
                                    } else {
                                        //错误的订单号
                                        vm_payment_list.errNoList = data.obj.errNoList;
                                        //设置错误的订单号不能被选中
                                        vm_payment_list.setCheckBoxFun();
                                    }
                                }
                                $("#confirmTipPay").modal('hide');
                            });
                        } else {
                            toastr.error(data.message, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center",
                                extendedTimeOut: 0,
                                closeButton: true
                            });
                        }
                    }
                });
            },
            //获取支付链接校验
            getPayUrlCheck: function () {
                if (vm_payment_list.bookPerson.bookPersonName == null || vm_payment_list.bookPerson.bookPersonName == "") {
                    toastr.error("预订人姓名不能为空。", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center",
                        extendedTimeOut: 0,
                        closeButton: true
                    });
                    return false;
                }
                if (vm_payment_list.bookPerson.bookPersonPhone == null || vm_payment_list.bookPerson.bookPersonPhone == "") {
                    toastr.error("预订人手机号码不能为空。", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center",
                        extendedTimeOut: 0,
                        closeButton: true
                    });
                    return false;
                }
                var reg = /^\d{11}$/;
                if (!reg.test(vm_payment_list.bookPerson.bookPersonPhone)) {
                    toastr.error("预订人手机号码不正确。", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center",
                        extendedTimeOut: 0,
                        closeButton: true
                    });
                    return false;
                }
                return true;
            },
            //发送短信
            sendMsg: function () {
                // 处理前校验
                if (!vm_payment_list.getPayUrlCheck()) {
                    return false;
                }
                if (vm_payment_list.params.payType == "3") {
                    vm_payment_list.params.content = vm_payment_list.s_msgcontent;
                } else if (vm_payment_list.params.payType == "2") {
                    vm_payment_list.params.content = vm_payment_list.t_msgcontent;
                }
                //判断是否执行过生成短信
                if (vm_payment_list.smsOrderList == null || vm_payment_list.smsOrderList.length == 0) {
                    toastr.error("请选择操作的订单，或者点击生成短信按钮生成短信。", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center",
                        extendedTimeOut: 0,
                        closeButton: true
                    });
                    return false;
                }
                //校验内容是否为空
                if (vm_payment_list.params.content == null || vm_payment_list.params.content == "") {
                    toastr.error("短信内容不能为空。", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center",
                        extendedTimeOut: 0,
                        closeButton: true
                    });
                    return false;
                }
                vm_payment_list.params.bookPersonName = vm_payment_list.bookPerson.bookPersonName;
                vm_payment_list.params.bookPersonPhone = vm_payment_list.bookPerson.bookPersonPhone;
                var smsParam = vm_payment_list.params;
                smsParam.orderList = undefined;
                smsParam.orderNos = vm_payment_list.smsOrderList;
                smsParam.orderList = vm_payment_list.smsOrderList;
                _.forEach(smsParam.orderNos,function (order) {
                    order.orderType = undefined;
                    order.productCode = undefined;
                    order.productCode = "DT1";
                });
                smsParam.backUrl = undefined;
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + "/trainpayment/sendMsg",
                    data: JSON.stringify(smsParam),
                    success: function (data) {
                        if (data.result) {
                            toastr.info(data.message, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center",
                                extendedTimeOut: 0,
                                closeButton: true
                            });
                            //页面关闭
                            setTimeout(function () {
                                window.location.href = __ctx + "/train/change/detail?orderNo=" + window.orderNo;
                            }, 1000);
                        } else {
                            toastr.error(data.message, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center",
                                extendedTimeOut: 0,
                                closeButton: true
                            });
                        }
                    }
                })
            },//关闭页面发送
            closeMsg: function () {
                if (window.type == 'singlePay') {
                    window.location.href = __ctx + "/train/change/detail?orderNo=" + window.orderNo;
                }
            },//设置checkbox不能选中
            setCheckBoxFun: function () {
                var _errList = vm_payment_list.errNoList;
                if (_errList != null && _errList != "") {
                    for (var i = 0; i < _errList.length; i++) {
                        $("#checkbox_" + _errList[i]).prop("checked", false);
                        $("#checkbox_" + _errList[i]).prop("disabled", "disabled");
                    }
                }
            }
        }
    });
    vm_payment_list.init();
});


