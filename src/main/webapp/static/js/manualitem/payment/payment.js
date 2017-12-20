$(document).ready(function () {
    //设置单独支付tab选中
    if (window.type == 'singlePay') {
        $('#singlePay').tab('show');
        $("#togetherPay").css("background-color", "#9D9D9D");
        $("#togetherPay").css("color", "#FFFFFF");
    } else if (window.type == 'togetherPay') {
        $('#togetherPay').tab('show');
        $("#singlePay").css("background-color", "#9D9D9D");
        $("#singlePay").css("color", "#FFFFFF");
    }


    //处理预订人姓名
    Vue.filter('bookPersonNameFilter', {
        read: function ([bookPersonName, bookPersonEnlishName]) {
            if (bookPersonName) {
                return bookPersonName;
            }

            return bookPersonEnlishName;
        }
    });


    var vm_payment_list = new Vue({
        el: '#paymentVM',
        data: {
            bookPerson: [],
            payOrderList: [],
            s_msgcontent: "",
            t_msgcontent: "",
            errNoList: [],
            payType: "",
            params: {
                itineraryNo: "",
                bookPersonName: "",
                bookPersonPhone: "",
                orderNos: [],
                payType: "",
                content: "",
                orderList: []
            }
        }, methods: {
            init: function () {
                //加载独立支付
                //打包支付加载数据
                if (window.type == 'singlePay') {
                    vm_payment_list.singlePay();
                    //打包支付加载数据
                } else if (window.type == 'togetherPay') {
                    vm_payment_list.togetherPay();
                }
            },//独立支付
            singlePay: function () {
                //数据清空
                //数据清空
                vm_payment_list.s_msgcontent = "";
                $.ajax({
                    url: __ctx + "/manualPayment/singlePay/init",
                    data: {
                        orderNo: window.orderNo
                    },
                    success: function (data) {
                        if (data.success) {
                            vm_payment_list.bookPerson = data.data;
                        } else {
                            toastr.error(data.errorMessage, "", {
                                timeOut: 0,
                                positionClass: "toast-top-center",
                                extendedTimeOut: 0,
                                closeButton: true
                            });
                        }
                    }
                });
            },//打包支付
            togetherPay: function () {
                //数据清空
                vm_payment_list.t_msgcontent = "";
                vm_payment_list.errNoList = [];
                $.ajax({
                    url: __ctx + "/payment/togetherPay/init",
                    data: {
                        itineraryNo: window.itineraryNo
                    },
                    success: function (data) {
                        if (data.result) {
                            vm_payment_list.bookPerson = data.obj.bookPerson;
                            vm_payment_list.payOrderList = data.obj.payOrderList;
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
            },//获取新的支付链接
            createTrade: function (type) {
                //数据清空
                vm_payment_list.s_msgcontent = "";
                vm_payment_list.t_msgcontent = "";
                vm_payment_list.params.createTradeDTOs = [];
                // 处理前校验
                if (!vm_payment_list.getPayUrlCheck()) {
                    return false;
                }
                vm_payment_list.params.itineraryNo = window.itineraryNo;
                if (type == 'single') {
                    vm_payment_list.params.payType = "1";
                    var paymentOrderVO = new Object();
                    paymentOrderVO.orderNo = window.orderNo;
                    paymentOrderVO.amount = vm_payment_list.bookPerson.totalAmount;
                    paymentOrderVO.orderType = 6;

                    vm_payment_list.params.createTradeDTOs.push(paymentOrderVO);
                } else if (type == 'together') {
                    vm_payment_list.params.payType = "2";
                    var orderListLength = vm_payment_list.payOrderList.length;
                    var isExist = false;
                    for (var i = 0; i < orderListLength; i++) {
                        var _box = $("#checkbox_" + vm_payment_list.payOrderList[i].orderNo).prop("checked");
                        if (_box == true) {
                            isExist = true;
                            var paymentOrderVO = new Object();
                            paymentOrderVO.orderNo = vm_payment_list.payOrderList[i].orderNo;
                            paymentOrderVO.amount = vm_payment_list.payOrderList[i].totalAmount;
                            paymentOrderVO.orderType = 6;
                            vm_payment_list.params.createTradeDTOs.push(paymentOrderVO);
                        }
                    }
                    if (!isExist) {
                        toastr.error("请选择操作的订单。", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center",
                            extendedTimeOut: 0,
                            closeButton: true
                        });
                        return false;
                    }
                }


                if (vm_payment_list.bookPerson.bookPersonName) {
                    vm_payment_list.params.bookPersonName = vm_payment_list.bookPerson.bookPersonName;
                } else {
                    vm_payment_list.params.bookPersonName = vm_payment_list.bookPerson.bookPersonEnlishName;
                }

                vm_payment_list.params.bookPersonPhone = vm_payment_list.bookPerson.bookPersonPhone;

                var url = "/manualPayment/createTrade";
                if (vm_payment_list.payType == 1) {
                    url = "/manualPayment/createPCTrade";
                }

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + url,
                    data: JSON.stringify({
                        "itineraryNo": vm_payment_list.params.itineraryNo,
                        "bookPersonName": vm_payment_list.params.bookPersonName,
                        "bookPersonPhone": vm_payment_list.params.bookPersonPhone,
                        "payType": vm_payment_list.params.payType,
                        "createTradeDTOs": vm_payment_list.params.createTradeDTOs
                    }),
                    success: function (data) {
                        if (data.success) {
                            vm_payment_list.params.orderNos = data.data.createTradeDTOs;
                            $("#confirmTipPay").modal({
                                show: true,
                                backdrop: 'static'
                            });

                            if (vm_payment_list.payType == 1) {
                                $("#confirmTipBody").html("生成链接成功！");
                            } else {
                                $("#confirmTipBody").html("生成短信成功！");
                            }

                            $("#confirmTipClose").unbind();
                            $("#confirmTipClose").click(function () {
                                if (vm_payment_list.params.payType == "1") {
                                    vm_payment_list.s_msgcontent = data.data.content;
                                } else if (vm_payment_list.params.payType == "2") {
                                    vm_payment_list.t_msgcontent = data.data.content;
                                    //错误的订单号
                                    vm_payment_list.errNoList = data.errorOrderDTOs;
                                    //设置错误的订单号不能被选中
                                    vm_payment_list.setCheckBoxFun();
                                }

                                $("#confirmTipPay").modal('hide');
                            });
                        } else {
                            toastr.error(data.errorMessage, "", {
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
                if (!vm_payment_list.bookPerson.bookPersonName && !vm_payment_list.bookPerson.bookPersonEnlishName) {
                    toastr.error("预订人姓名不能为空。", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center",
                        extendedTimeOut: 0,
                        closeButton: true
                    });
                    return false;
                }

                if (vm_payment_list.payType == 1) {
                    //生成PC链接检验
                    if (vm_payment_list.bookPerson.bookPersonEmail == null || vm_payment_list.bookPerson.bookPersonEmail == "") {
                        toastr.error("预订人邮箱不能为空。", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center",
                            extendedTimeOut: 0,
                            closeButton: true
                        });
                        return false;
                    }
                } else {
                    //生成支付链接校验
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
                }
                return true;
            },
            //增值单发送短信 
            manualItemSendMsg: function () {
                // 处理前校验
                if (!vm_payment_list.getPayUrlCheck()) {
                    return false;
                }
                if (vm_payment_list.params.payType == "1") {
                    vm_payment_list.params.content = vm_payment_list.s_msgcontent;
                } else if (vm_payment_list.params.payType == "2") {
                    vm_payment_list.params.content = vm_payment_list.t_msgcontent;
                }
                //判断是否执行过生成短信
                if (vm_payment_list.params.orderNos == null || vm_payment_list.params.orderNos.length == 0) {
                    toastr.error("短信未生成无法发送。", "", {
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
                vm_payment_list.params.bookPersonName =
                    vm_payment_list.bookPerson.bookPersonName == null || vm_payment_list.bookPerson.bookPersonName == '' ?
                        vm_payment_list.bookPerson.bookPersonEnlishName == null || vm_payment_list.bookPerson.bookPersonName == '' ?
                            '-'
                            : vm_payment_list.bookPerson.bookPersonEnlishName
                        : vm_payment_list.bookPerson.bookPersonName;
                vm_payment_list.params.bookPersonPhone = vm_payment_list.bookPerson.bookPersonPhone;
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + "/manualitemsNotify/sendMsg",
                    data: JSON.stringify({
                        "itineraryNo": vm_payment_list.params.itineraryNo,
                        "bookPersonName": vm_payment_list.params.bookPersonName,
                        "bookPersonPhone": vm_payment_list.params.bookPersonPhone,
                        "payType": vm_payment_list.params.payType,
                        "content": vm_payment_list.params.content,
                        "createTradeDTOs": vm_payment_list.params.createTradeDTOs
                    }),
                    success: function (data) {
                        if (data.success) {
                            toastr.info("短信发送成功", "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center",
                                extendedTimeOut: 0,
                                closeButton: true
                            });
                            //页面关闭返回原来的页面
                            if (vm_payment_list.params.payType == "1") {
                                //页面关闭
                                setTimeout(function () {
                                    window.location.href = __ctx + "/manualOrder/detail?orderNo=" + window.orderNo;
                                }, 1000);
                            } else if (vm_payment_list.params.payType == "2") {
                                //页面关闭
                                setTimeout(function () {
                                    window.location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo=" + window.itineraryNo;
                                }, 1000);
                            }
                        } else {
                            toastr.error(data.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center",
                                extendedTimeOut: 0,
                                closeButton: true
                            });
                        }
                    }
                });
            },
            //关闭页面发送
            closeMsg: function () {
                if (window.type == 'singlePay') {
                    window.location.href = __ctx + "/manualOrder/detail?orderNo=" + window.orderNo;
                } else if (window.type == 'togetherPay') {
                    window.location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo=" + window.itineraryNo;
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
            },
            copy: function (element) {
                try {
                    var copytoclip = 1;
                    var d = document.getElementById(element);
                    if (!d.value || !d.value.trim()) {
                        toastr.error("未生成PC链接，请成功生成链接后重试！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }

                    d.select();
                    if (therange = void 0,
                        1 == copytoclip && (d.createTextRange && (therange = d.createTextRange()),
                            therange = therange ? therange : document,
                            therange.execCommand("Copy"))) {
                        toastr.success("内容已成功复制到粘贴板", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    }
                } catch (e) {
                    toastr.error("复制粘贴出错", "", {timeOut: 2000, positionClass: "toast-top-center"});
                }
            },
            clearData: function () {
                vm_payment_list.s_msgcontent = "";
                vm_payment_list.t_msgcontent = "";
            }
        }
    });

    vm_payment_list.init();
});