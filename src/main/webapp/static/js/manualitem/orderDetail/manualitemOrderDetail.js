/**
 * Created by lf48082 on 2017/8/2.
 */
var vue_order;
$(document).ready(function () {

    //空白符
    Vue.filter('toBlank', {
        read: function (value) {
            if (!value || value == '' || value == null) {
                return '--';
            }
            return value;
        }
    });
    //状态
    Vue.filter('toStatus', {
        read: function (value) {
            if (value == '' || value == null) {
                return '';
            }
            if (value == '0') return "待提交";
            if (value == '5') return "待支付";
            if (value == '8') return "已登账";
            if (value == '9') return "待登账";
            if (value == '10') return "已取消";
            if (value == '11') return "有退单";
            return "";
        }
    });
    //结算方式
    Vue.filter('toSettlementMethod', {
        read: function (value) {
            if (value == '' || value == null) {
                return '';
            }
            if (value == 'n') return "现结";
            if (value == 'm') return "授信";
            return "";
        }
    });

    //乘客类型
    Vue.filter('passengerType', {
        read: function (value) {
            if (value == '' || value == null) {
                return '';
            }

            if (value == 'i' || value == '1') return "内部员工";
            if (value == 'o' || value == '2') return "客人";

            return "";
        }
    });

    //账单状态
    Vue.filter('billStatus', {
        read: function (value) {
            if (value == '' || value == null) {
                return '';
            }

            if (value == '0') return "登账成功";
            if (value == '1') return "未登账";
            if (value == '-1') return "登账失败";

            return "";
        }
    });
    //保留两位小数
    Vue.filter('toFixed2', {
        read: function (value) {
            if (!value || value == '' || value == null) {
                return 0;
            }
            return _.round(parseFloat(value), 2);
        }
    });

    //处理服务时间
    Vue.filter('serviceDateFilter', {
        read: function ([startServiceDate, productTypeName]) {
            if (startServiceDate && productTypeName) {
                if (productTypeName == "签证") {
                    var date = new Date(startServiceDate);
                    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                }

                return startServiceDate;
            }

            return "";
        }
    });

    //处理产品服务时间
    Vue.filter('productServiceDateFilter', {
        read: function ([startServiceDate, serviceTypeName]) {
            if (startServiceDate && serviceTypeName) {
                if (serviceTypeName.indexOf("签证") > -1) {
                    var date = new Date(startServiceDate);
                    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                }

                return startServiceDate;
            }

            return "";
        }
    });

    //处理账单号
    Vue.filter('billNoFilter', {
        read: function ([billNo, billStatus]) {
            if (billStatus == '1') {
                return "";
            }

            return billNo;
        }
    });


    vue_order = new Vue({
        el: '#manualitemOrderDetail',
        data: {
            order: {},
            product: {},
            passengers: [],
            settlement: {},
            contactPersons: [],
            servicePersons: [],
            orderMain: {},
            orderLogs: [],
            bills: [],
            cancelReason: "行程取消",
            cancelReasonCode: "1",
            tempRefundOrders: [],
            editOrSave: "edit",
            financeUrl: window.location.host + '/finance/bussinessbillsdetail/billsdetail-op',
            orderLogContent: ""
        },
        ready: function () {
            this.loadOrderDetailData();
            this.loadProductDetailData();
            this.loadPassengersDetailData();
            this.loadSettlementDetailData();
            this.loadContactPersonDetailData();
            this.loadServicePersonDetailData();
            this.loadOrderMainDetailData();
            this.loadOrderLogDetailData();
            this.loadBillsDetailData();

        },
        methods: {
            //加载订单数据
            loadOrderDetailData: function () {
                $.ajax({
                    url: __ctx + "/manualOrder/getOrderDetailByOrderNo",
                    data: {
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success) {
                            if (result.data) {
                                vue_order.order = result.data;
                                if (vue_order.order.refundOrderNo && vue_order.order.refundOrderNo != "") {
                                    vue_order.tempRefundOrders = vue_order.order.refundOrderNo.split(",");
                                }
                                //输入框默认只读
                                $("#operationTR").find("input").attr("disabled", true);

                                //初始化
                                $("#cancelOrder").attr("disabled", false);
                                $("#toPayment").attr("disabled", false);
                                $("#toRefund").attr("disabled", false);
                                $("#toManualShortMessage").attr("disabled", false);

                                //当订单状态为已取消时,已取消,发送短信,提交退单,发送链接不可用
                                if (vue_order.order.orderStatus == "10") {
                                    $("#cancelOrder").attr("disabled", true);
                                    $("#toPayment").attr("disabled", true);
                                    $("#toRefund").attr("disabled", true);
                                    $("#toManualShortMessage").attr("disabled", true);
                                }
                                //当订单状态为待提交时,提交退单,发送链接不可用
                                if (vue_order.order.orderStatus == "0") {
                                    $("#toPayment").attr("disabled", true);
                                    $("#toRefund").attr("disabled", true);
                                }
                                //待支付
                                if (vue_order.order.orderStatus == "5") {
                                    $("#toRefund").attr("disabled", true);
                                }
                                //已登账
                                if (vue_order.order.orderStatus == "8") {
                                    $("#cancelOrder").attr("disabled", true);
                                    $("#toPayment").attr("disabled", true);

                                    //可退数量为0时,不可再进行退单
                                    if (vue_order.order.refundAccount == vue_order.product.serviceAccount) {
                                        $("#toRefund").attr("disabled", true);
                                    }
                                }

                                //待登账
                                if (vue_order.order.orderStatus == "9") {
                                    $("#cancelOrder").attr("disabled", true);
                                    $("#toPayment").attr("disabled", true);
                                    $("#toRefund").attr("disabled", true);
                                }
                                //有退单
                                if (vue_order.order.orderStatus == "11") {
                                    $("#cancelOrder").attr("disabled", true);
                                    $("#toPayment").attr("disabled", true);
                                    //可退数量为0时,不可再进行退单
                                    if (vue_order.order.refundAccount == vue_order.product.serviceAccount) {
                                        $("#toRefund").attr("disabled", true);
                                    }
                                }

                            }
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //加载订单产品信息数据
            loadProductDetailData: function () {
                $.ajax({
                    url: __ctx + "/manualOrder/getProductDetailByOrderNo",
                    data: {
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success) {
                            if (result.data) {
                                vue_order.product = result.data;
                            }
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //加载订单乘客信息数据
            loadPassengersDetailData: function () {
                $.ajax({
                    url: __ctx + "/manualOrder/getPassengersDetailByOrderNo",
                    data: {
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success) {
                            if (result.values) {
                                vue_order.passengers = result.values;
                            }
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //加载订单结算信息数据
            loadSettlementDetailData: function () {
                $.ajax({
                    url: __ctx + "/manualOrder/getOrderFeeByOrderNo",
                    data: {
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success) {
                            if (result.data) {
                                vue_order.settlement = result.data;
                            }
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //加载订单联系人信息数据
            loadContactPersonDetailData: function () {
                $.ajax({
                    url: __ctx + "/manualOrder/getContactPersonInfo",
                    data: {
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success) {
                            if (result.values) {
                                vue_order.contactPersons = result.values;
                            }
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //加载订单抄送人信息数据
            loadServicePersonDetailData: function () {
                $.ajax({
                    url: __ctx + "/manualOrder/getServicePersonListByOrderNo",
                    data: {
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success) {
                            if (result.values) {
                                vue_order.servicePersons = result.values;
                            }
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //加载订单责任人信息数据
            loadOrderMainDetailData: function () {
                $.ajax({
                    url: __ctx + "/manualOrder/getOrderMainByOrderNo",
                    data: {
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success) {
                            if (result.data) {
                                vue_order.orderMain = result.data;
                            }
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //加载订单日志信息数据
            loadOrderLogDetailData: function () {
                $.ajax({
                    url: __ctx + "/manualOrder/getOrderLogByOrderNo",
                    data: {
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success) {
                            if (result.values) {
                                vue_order.orderLogs = result.values;
                            }
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //加载登账信息数据
            loadBillsDetailData: function () {
                $.ajax({
                    url: __ctx + "/bill/findBillByOrderNo",
                    data: {
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success) {
                            if (result.values) {
                                vue_order.bills = result.values;
                            }
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //作废登账
            voidedBills: function (billNo) {
                $.ajax({
                    url: __ctx + "/bill/voidedBills",
                    data: {
                        "billsNo": billNo,
                        "orderNo": window.orderNo
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success && result.data == "SUCCESS") {
                            vue_order.loadBillsDetailData();
                            toastr.success("作废成功", "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });

                            window.location.reload();
                        } else {
                            toastr.error(result.errorMessage, "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            //再登账
            createBills: function (orderNo) {
                $.ajax({
                    url: __ctx + "/bill/createBills",
                    data: {"orderNos": orderNo},
                    type: "POST",
                    datatype: "json",
                    success: function (result) {
                        if (result.success && result.data == "0") {
                            vue_order.loadBillsDetailData();
                            toastr.success("登账成功", "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });

                            window.location.reload();
                        } else {
                            toastr.error("登账失败", "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
                    }
                });
            },
            toManualShortMessage: function () {
                window.open(__ctx + '/manualOrder/manual/shortMessage?orderNo=' + window.orderNo);
            },
            toRefund: function () {
                window.open(__ctx + '/refundManualItem/gotoRefundEdit/' + window.orderNo);
            },
            download: function (filePath) {
                if (!filePath) {
                    toastr.error("该订单没上传附件", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }

                window.location.href = __ctx + "/file/download?" + filePath;
            },
            cancelOrder: function () {
                if (vue_order.cancelReason == '') {
                    toastr.error("订单取消原因不能为空！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }

                $('#confirmCancel').modal('hide');
                $.ajax({
                    url: __ctx + "/manualOrder/cancelOrder",
                    type: "POST",
                    data: JSON.stringify({
                        orderNo: window.orderNo,
                        cancelReasonCode: vue_order.cancelReasonCode,
                        cancelReason: vue_order.cancelReason
                    }),
                    datatype: "json",
                    contentType: "application/json",
                    error: function (data) {
                        toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        if (data.success) {
                            toastr.success("取消成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
                            location.reload();
                        } else {
                            toastr.error(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                        }
                    }
                });
            },
            bindReason: function (cancelReasonCode) {
                if (cancelReasonCode == '1') {
                    this.cancelReason = "行程取消";
                } else if (cancelReasonCode == '2') {
                    this.cancelReason = "重新预订";
                }
                else if (cancelReasonCode == '3') {
                    this.cancelReason = "价格有问题";
                }
                else if (cancelReasonCode == '4') {
                    this.cancelReason = "审批问题";
                }
                else if (cancelReasonCode == '5') {
                    this.cancelReason = "支付问题";
                }
                else if (cancelReasonCode == '6') {
                    this.cancelReason = "测试订单";
                }
                else if (cancelReasonCode == '7') {
                    this.cancelReason = "客人自主取消";
                }
            },
            toPayment: function () {
                $.ajax({
                    url: __ctx + "/manualPayment/singlePay/check",
                    data: {
                        orderNo: window.orderNo
                    },
                    success: function (data) {
                        if (data.success) {
                            window.location.href = __ctx + "/manualPayment/singlePay/index?orderNo=" + window.orderNo;
                        } else {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }
                    }
                });
            },
            calculateFee: function () {
                if ($.trim(vue_order.settlement.purchasePrice) != "" && $.trim(vue_order.settlement.comissionPrice) != ""
                    && $.trim(vue_order.settlement.adjustmentFee) != "" && $.trim(vue_order.settlement.serviceFee) != "") {
                    vue_order.settlement.purchasePrice = _.round(parseFloat(vue_order.settlement.purchasePrice), 2);
                    vue_order.settlement.comissionPrice = _.round(parseFloat(vue_order.settlement.comissionPrice), 2);
                    vue_order.settlement.adjustmentFee = _.round(parseFloat(vue_order.settlement.adjustmentFee), 2);
                    vue_order.settlement.serviceFee = _.round(parseFloat(vue_order.settlement.serviceFee), 2);

                    //净成本=采购价-佣金
                    vue_order.settlement.orderNetCostPrice = vue_order.settlement.purchasePrice - vue_order.settlement.comissionPrice;
                    vue_order.settlement.orderNetCostPrice = _.round(vue_order.settlement.orderNetCostPrice, 2);

                    //销售价=采购价+调整项
                    vue_order.settlement.salesPrice = parseFloat(vue_order.settlement.purchasePrice) + parseFloat(vue_order.settlement.adjustmentFee);
                    vue_order.settlement.salesPrice = _.round(vue_order.settlement.salesPrice, 2);

                    vue_order.settlement.orderTotalAmount = parseFloat(vue_order.settlement.salesPrice) + parseFloat(vue_order.settlement.serviceFee);
                    vue_order.settlement.orderTotalAmount = _.round(vue_order.settlement.orderTotalAmount, 2);

                    //利润
                    vue_order.settlement.orderTotalProfit = parseFloat(vue_order.settlement.orderTotalAmount) - parseFloat(vue_order.settlement.orderNetCostPrice);
                    vue_order.settlement.orderTotalProfit = _.round(vue_order.settlement.orderTotalProfit, 2);
                }

            },
            editAndSave: function (param) {
                if (param == 0) {
                    if (vue_order.order.orderStatus != "0") {
                        toastr.error("", "当前订单不是[待提交]状态,不能进行编辑!", {timeOut: 1000, positionClass: "toast-top-center"});
                        return;
                    }
                    vue_order.editOrSave = "save";
                }
                if (param == 1) {
                    vue_order.editOrSave = "edit";
                    $.ajax({
                        url: __ctx + "/manualOrder/updateOrderFeeByOrderNo",
                        contentType: "application/json",
                        type: "POST",
                        data: JSON.stringify({
                            "purchasePrice": vue_order.settlement.purchasePrice,
                            "comissionPrice": vue_order.settlement.comissionPrice,
                            "adjustmentFee": vue_order.settlement.adjustmentFee,
                            "salesPrice": vue_order.settlement.salesPrice,
                            "serviceFee": vue_order.settlement.serviceFee,
                            "orderTotalAmount": vue_order.settlement.orderTotalAmount,
                            "orderNetCostPrice": vue_order.settlement.orderNetCostPrice,
                            "orderTotalProfit": vue_order.settlement.orderTotalProfit,
                            "totalSalesPrice": vue_order.settlement.orderTotalAmount,
                            "orderNo": vue_order.settlement.orderNo
                        }),
                        datatype: "json",
                        success: function (data) {
                            if (data.success) {
                                toastr.success(data.errorMessage, "", {
                                    timeOut: 2000,
                                    positionClass: "toast-top-center"
                                });
                                window.location.reload();
                            } else {
                                toastr.error(data.errorMessage, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                vue_order.loadSettlementDetailData();
                            }
                        }
                    });
                }
            },
            openBillRemark: function (status) {
                if (status != 0) {
                    toastr.error("", "账单未登账,请先进行登账!", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $("#billRemark").modal({
                    show: true,
                    backdrop: 'static'
                });
            },
            updateBillRemark: function (billNo, remark) {
                if (remark == "") {
                    toastr.error("", "请填写账单备注!", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $.ajax({
                    type: "POST",
                    url: __ctx + "/bill/updateBillRemark",
                    data: {"billNo": billNo, "remark": remark},
                    success: function (result) {
                        if (result.success) {
                            toastr.info("更新账单备注成功!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            //刷新信息
                            vue_order.loadBillsDetailData();
                        } else {
                            toastr.error(result.errorMessage, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }
                    }
                });
            },
            //添加订单日志
            addOrderLog: function () {
                if (vue_order.orderLogContent == "") {
                    toastr.error("", "请输入内部备注!", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $.ajax({
                    type: "POST",
                    url: __ctx + "/manualOrder/saveOrderLog",
                    data: {"orderNo": vue_order.order.orderNo, "content": vue_order.orderLogContent},
                    success: function (result) {
                        if (result.success) {
                            toastr.info("添加订单日志成功!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            //刷新信息
                            vue_order.orderLogContent="";
                            vue_order.loadOrderDetailData();
                            vue_order.loadOrderLogDetailData();
                        } else {
                            toastr.error(result.errorMessage, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }
                    }
                });
            }
        }
    });

});