var car_order_detail_vm;
$(document).ready(function () {
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
    //订单来源(0-Web 1-滴滴出行App 2-H5 3-OpenAPI 4-企业APP 5-邀约券 6-SDK)
    Vue.filter("orderSourceFilter", {
        read: function (value) {
            if (value == 0) {
                return "Web";
            }
            if (value == 1) {
                return "滴滴出行App";
            }
            if (value == 2) {
                return "H5";
            }
            if (value == 3) {
                return "OpenAPI";
            }
            if (value == 4) {
                return "企业APP";
            }
            if (value == 5) {
                return "邀约券";
            }
            if (value == 6) {
                return "SDK";
            }
        }
    });
    //车型（100舒适型，400商务型, 200豪华型,500优选型,600快车）
    Vue.filter("requireLevelFilter", {
        read: function (value) {
            if (value == 100) {
                return "舒适型";
            }
            if (value == 400) {
                return "商务型";
            }
            if (value == 200) {
                return "豪华型";
            }
            if (value == 500) {
                return "优选型";
            }
            if (value == 600) {
                return "快车";
            }
            if (value == 900) {
                return "优享型";
            }
        }
    });
    //登帐状态: 是否成功(1：成功，0：失败)
    Vue.filter("BillIsSuccessFilter", {
        read: function (value) {
            if (value == '0') {
                return "登帐成功";
            }
            if (value == '1') {
                return "未登帐";
            }
            if (value == '') {
                return "登帐失败";
            }
        }
    });
    //登帐操作类型 (1：出，2：改，3：退）
    Vue.filter("BillOperateTypeFilter", {
        read: function (value) {
            if (value == '1') {
                return "出";
            }
            if (value == '2') {
                return "改";
            }
            if (value == '3') {
                return "退";
            }
        }
    });
    //是否拼车(0-不是 1-是)
    Vue.filter("carpoolFilter", {
        read: function (value) {
            if (value == '0') {
                return "不是";
            }
            if (value == '1') {
                return "是";
            }
        }
    });
    //渠道类型1, "Online（PC）\n2, "Online（APP）\n3, "Online（WX）\n4, "Online（API）\n5, "Offline（白屏）\n6, "Offline（手工）"
    Vue.filter("channelTypeFilter", {
        read: function (value) {
            if (value == 1) {
                return "Online（PC）";
            }
            if (value == 2) {
                return "Online（APP）";
            }
            if (value == 3) {
                return "Online（WX）";
            }
            if (value == 4) {
                return "Online（API）";
            }
            if (value == 5) {
                return "Offline（白屏）";
            }
            if (value == 6) {
                return "Offline（手工）";
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

    car_order_detail_vm = new Vue({
        el: "#orderDetailVM",
        data: {
            log: [],
            carOrderMainDTO: {},
            carOrderDTO: {},
            bookPersonDto: {},
            passengerDto: {},
            itineraryDto: {},
            account:[]
        },
        ready: function () {
            var data = {orderNo: window.orderNo};
            this.detail(data);
            this.getLog(data);
            this.queryBills(data);
            setTimeout(initTips, 500);
        },
        methods: {
            //跳转行程详情页面
            showItineraryDetail: function (itineraryNo) {
                window.location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo=" + itineraryNo;
            },
            detail: function (pars) {
                $.ajax({
                    url: __ctx + "/car/order/detail",
                    data: pars,
                    success: function (data) {
                        if (data) {
                            car_order_detail_vm.carOrderMainDTO = data.carOrderMainDTO;
                            car_order_detail_vm.carOrderDTO = data.carOrderDTO;
                            car_order_detail_vm.bookPersonDto = data.bookPersonDto;
                            car_order_detail_vm.passengerDto = data.passengerDto;
                            car_order_detail_vm.itineraryDto = data.itineraryDto;
                        }
                    }
                });
            },
            getLog: function (pars) {
                $.ajax({
                    url: __ctx + "/car/log/findCarOrderLog",
                    data: pars,
                    success: function (data) {
                        if (data && data.length >0 ) {
                            car_order_detail_vm.log = data;
                        }
                    }
                });
            },
            queryBills: function (pars) {
                $.getJSON(__ctx + "/car/bill/queryBills", pars, function (result) {
                    car_order_detail_vm.account = result.values;
                    car_order_detail_vm.financeUrl = window.location.host + '/finance/bussinessbillsdetail/billsdetail-op';
                });
            },
            confirmBill: function () {
                var order= {orderNo: window.orderNo};
                $.ajax({
                    url: __ctx + "/car/bill/recordBill",
                    type: "GET",
                    data: order,
                    success: function (data) {
                        if(data.success){
                            toastr.success("登账成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
                            setTimeout("window.location.reload()",500);
                            this.queryBills({orderNo: window.orderNo});
                        }else{
                            toastr.error("登账失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }

                    },
                    error: function (data) {
                        toastr.error("登账失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    }
                });
            },
            billsVoided: function (billNo) {
                var order= {billNo: billNo}
                $.ajax({
                    url: __ctx + "/car/bill/voidBill",
                    type: "GET",
                    data: order,
                    success: function (data) {
                        if(data.success) {
                            toastr.success("作废成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
                            setTimeout("window.location.reload()",500);
                            this.queryBills({orderNo: window.orderNo});
                        }else{
                            toastr.error("作废失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }

                    },
                    error: function (data) {
                        toastr.error("作废失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    }
                });
            },

        }
    });

    function initTips() {
        var defaultConfig = {container: 'body'};

        var genTrs = function (trs) {
            var html = '';
            _.forEach(trs, function (tds) {
                html += '<tr>';
                _.forEach(tds, function (val) {
                    html += '<td style="min-width: 50px;text-align: left;">' + val + '</td>';
                });
                html += '</tr>';
            });
            return html;
        };

        var genTableTemplate = function (ths, trs) {
            var template = '<div><table class="flightTipTable" style="background-color: #000"><thead><tr>';
            _.forEach(ths, function (val) {
                template += '<th>' + val + '</th>';
            });
            template += '</tr></thead><tbody>';
            template += genTrs(trs);
            template += '</tbody></table></div>';
            return template;
        };

        $('.feeDetail').each(function () {
            var selector$ = $(this);
            var template = genTableTemplate([], [
                ['公司实付金额：', car_order_detail_vm.carOrderDTO.companyRealPay],
                ['个人实付金额：', car_order_detail_vm.carOrderDTO.personalRealPay],
                ['公司实际退款金额：', car_order_detail_vm.carOrderDTO.companyRealRefund],
                ['个人实际退款金额：', car_order_detail_vm.carOrderDTO.personalRealRefund]
            ]);
            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });
    }
});