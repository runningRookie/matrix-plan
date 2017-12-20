$(document).ready(function () {
    Vue.filter('auditStatusFliter', {
        read: function (value, format) {
            if (value == 01) {
                return '待审批';
            }
            if (value == 02) {
                return '审批中';
            }
            if (value == 03) {
                return '审批不通过';
            }
            if (value == 04) {
                return '审批通过';
            }


        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('itineraryFliter', {
        read: function (value, format) {
            if (value == 1) {
                return '因公';
            }
            if (value == 2) {
                return '因私';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('productCodeFliter', {
        read: function (value, format) {
            if (value == 'DA1') {
                return '国内机票';
            }
            if (value == 'DT') {
                return '国内火车票';
            }
        },
        write: function (value, format) {
            return value;
        }
    });


    Vue.filter('orderStatusFliter', {
        read: function (value, format) {
            if (value == 01) {
                return '订单取消';
            }
            if (value == 02) {
                return '待提交';
            }
            if (value == 03) {
                return '待审批';
            }
            if (value == 04) {
                return '审批中';
            }
            if (value == 05) {
                return '审批不通过';
            }
            if (value == 06) {
                return '待支付';
            }
            if (value == 07) {
                return '出票中';
            }
            if (value == 08) {
                return '出票驳回';
            }
            if (value == 09) {
                return '出票驳回待审核';
            }
            if (value == 10) {
                return '出票驳回审核通过';
            }
            if (value == 11) {
                return '出票驳回审核不通过';
            }
            if (value == 12) {
                return '出票成功';
            }
            if (value == 13) {
                return '变更中';
            }
            if (value == 14) {
                return '部分改期';
            }
            if (value == 15) {
                return '部分退票';
            }
            if (value == 16) {
                return '已改期';
            }
            if (value == 17) {
                return '已退票';
            }
        },
        write: function (value, format) {
            return value;
        }
    });


    var vm_list = new Vue({
        el: "#itineraryproductlist",
        data: {
            model: {},
            infos: [],
            params: {},
            checked: [],
            orderNos: [],
            cancelReason: "",
            orderNo: "",
            allowedOrderStatus: ["02", "03", "04", "05", "06"]
        },
        ready: function () {
            // 页面初始化载入首页数据.
            this.loadGridData();
        },
        computed: {
            allowSubmit: function () {
                var thisVM = this;
                if (thisVM.checked.length == 0) {
                    return false;
                }
                var flag = true;
                _.forEach(thisVM.checked, function (index) {
                    index = parseInt(index);
                    var order = thisVM.infos[index];
                    if (order.flightOrderStatus != "02") {
                        flag = false;
                        return false;
                    }
                });
                if (!flag) {
                    toastr.error("请选择待提交订单！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                }
                return flag;
            }
        },
        methods: {
            loadGridData: function (pars) {
                $.ajax({
                    url: __ctx + "/itineraryproduct/detail?itineraryNo=" + itineraryNo,
                    data: pars,
                    success: function (data) {
                        vm_list.model = data.obj;
                    }
                });
            },
            goSms: function () {
                this.orderNos = [];
                for (var i = 0; i < vm_list.checked.length; i++) {
                    var index = vm_list.checked[i];
                    var info = vm_list.infos[index];
                    this.orderNos.push(info.orderNo);
                }
                $("#formModal").modal({
                    show: true,
                    remote: __ctx + "/itineraryproduct/tocommitaudit?orderNos=" + this.orderNos.toString() + "&itineraryNo=" + itineraryNo,
                    backdrop: 'static'
                });
            },
            cancelAudit: function () {
                this.orderNos = [];
                for (var i = 0; i < vm_list.checked.length; i++) {
                    var index = vm_list.checked[i];
                    var info = vm_list.infos[index];
                    this.orderNos.push(info.orderNo);
                }
                $("#formModal").modal({
                    show: true,
                    remote: __ctx + "/itineraryproduct/toordercancellation?orderNo=" + this.orderNos,
                    backdrop: 'static'
                });
            },
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
                this.params = {};
            },
            cancelOrder: function () {
                if (vm_list.cancelReason == '') {
                    toastr.error("订单取消原因不能为空！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $.ajax({
                    url: __ctx + "/flightOrder/cancelFlightOrder",
                    type: "POST",
                    data: {
                        orderNo: vm_list.orderNo,
                        cancelReason: vm_list.cancelReason
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        toastr.success(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                        location.reload();
                    }
                });
            }
        }
    });

    $('#confirmCancel').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var orderNo = button.data('orderno') // Extract info from data-* attributes
        vm_list.orderNo = orderNo;

    })
});
