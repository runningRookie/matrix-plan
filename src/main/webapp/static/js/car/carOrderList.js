var car_order_vm;
$(document).ready(function () {

    $('#createStartDate,#createEndDate').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });

    //过滤器
    //支付方式（m企业支付 n个人垫付）
    Vue.filter("payTypeFilter", {
        read: function (value) {
            if (value == "m") {
                return "企业支付";
            }
            if (value == "n") {
                return "个人垫付";
            }
            if (value == "b") {
                return "混合支付";
            }
        }
    });
    //订单类型(0:实时、1:预约)
    Vue.filter("typeFilter", {
        read: function (value) {
            if (value == 0) {
                return "实时";
            }
            if (value == 1) {
                return "预约";
            }
        }
    });
    //车型服务/用车方式（1:出租车，2:专车，3:快车，4:代驾）
    Vue.filter("useCarTypeFilter", {
        read: function (value) {
            if (value == 1) {
                return "出租车";
            }
            if (value == 2) {
                return "专车";
            }
            if (value == 3) {
                return "快车";
            }
            if (value == 4) {
                return "代驾";
            }
        }
    });
    //订单类型(0:实时、1:预约)
    Vue.filter("typeFilter", {
        read: function (value) {
            if (value == 0) {
                return "实时";
            }
            if (value == 1) {
                return "预约";
            }
        }
    });
    //订单状态（2-已支付 3-已退款 4-已取消 7-部分退款）
    Vue.filter("statusFilter", {
        read: function (value) {
            if (value == 2) {
                return "已支付";
            }
            if (value == 3) {
                return "已退款";
            }
            if (value == 4) {
                return "已取消";
            }
            if (value == 7) {
                return "部分退款";
            }
        }
    });

    Vue.filter('toDate', {
        read: function (value, format) {
            if (value) {
                if (value == '' || value == null || value == '-28800000' || value == '631123200000' || value == '-2209017600000' || value == '1970-01-01 00:00:00' || value == '1900-01-01 00:00:00' || value.substr(0,4) == '1970' ) {
                    return '';
                }
                return moment(value).format(format);
            } else {
                return value;
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    car_order_vm = new Vue({

        el: "#carOrderList",
        data: {
            infos: [],
            params: {
                orderNo: "",
                companyName: "",
                createStartDate: "",
                createEndDate: "",
                passengerName: "",
                passengerPhone: "",
                bookPersonName: "",
                bookPersonPhone: "",
                useCarType: "",
                type: "",
                status: "",
                payType: "",
                tmcId: null,
                pageSize: 20,
                page: 1
            }
        },
        ready: function () {
        },
        methods: {
            queryData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }
                else {
                    this.params.page = 1;
                    this.params.size = 20;
                }
                this.loadGridData(this.params);
            },
            reset: function () {
                car_order_vm.params.orderNo = "";
                car_order_vm.params.companyName = "";
                car_order_vm.params.createStartDate = "";
                car_order_vm.params.createEndDate = "";
                car_order_vm.params.passengerName = "";
                car_order_vm.params.passengerPhone = "";
                car_order_vm.params.bookPersonName = "";
                car_order_vm.params.bookPersonPhone = "";
                car_order_vm.params.useCarType = "";
                car_order_vm.params.type = "";
                car_order_vm.params.status = "";
                car_order_vm.params.payType = "";
                car_order_vm.params.tmcId = null;
                car_order_vm.params.pageSize = 20;
                car_order_vm.params.page = 1;
            },
            SynchronousOrder: function () {
                $("#SynchronousOrder").attr("disabled","disabled");
                $("#SynchronousOrder").setBtnTimer({
                    'time': 5
                });
                var param = {
                    date: ""
                }
                $.ajax({
                    url: __ctx + "/car/order/createDidiCarOrder",
                    type: "post",
                    contentType: 'application/json; charset=UTF-8',
                    datatype: 'json',
                    data: JSON.stringify(param),
                    success: function (result) {
                        if (result.success) {
                            toastr.info("操作成功", "", {
                                positionClass: "toast-top-center"
                            });
                            car_order_vm.queryData();
                        } else {
                            toastr.error("操作失败", "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                    },
                    error: function () {
                        toastr.error("操作失败", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    }
                });
            },
            showDetail: function(orderNo) {
                var url =__ctx+"/car/order/orderDetail?orderNo="+orderNo;
                window.open(url);
            },
            loadGridData: function (pars) {
                $.ajax({
                    url: __ctx + "/car/order/getOrders",
                    data: pars,
                    success: function (data) {
                        car_order_vm.infos = data;
                    }
                });
            }
        }
    });

    car_order_vm.queryData();

    $.fn.setBtnTimer = function(options) {
        "use strict";
        var defaults = {
            'time': 60
        };
        var settings = $.extend({},defaults, options);
        this.attr("disabled","disabled");
        this.css({"color":"green;"});
        var that = this,
            oldv = that.val(),
            timer,
            tick = function(){
                settings.time--;
                that.val(settings.time+'s后可在此操作');
                if(settings.time<1){
                    that.removeAttr("disabled");
                    window.clearInterval(timer);
                    that.val(oldv);
                }
            };
        return this.each(function(){
            timer = window.setInterval(tick, 1000);
        });
    }

});



