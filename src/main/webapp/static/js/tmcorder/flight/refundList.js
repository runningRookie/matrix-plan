var vm_refundList;
$(document).ready(function () {
    $('#date-end,#date-start').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });
    vm_refundList = new Vue({
        el: "#flightRefundApplyPageList",
        data: {
            showDeal: false,
            infos: [],
            params: {},
            companys: []
        },
        ready: function () {
            //加载公司数据
            var loadCompanysData = function () {
                $.ajax({
                    url: __ctx + "/resource/companys",
                    //data: parms,
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error("请先选择公司！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        vm_refundList.companys = data;
                    }
                });
            };
            loadCompanysData();
        },
        methods: {
            queryData: function (event, pageInfo) {
                var time1 = new Date(this.params.beginTime).getTime();
                var time2 = new Date(this.params.endTime).getTime();
                if (time1 > time2) {
                    toastr.error("开始时间大于结束时间", "", {timeOut: 2000, positionClass: "toast-top-center"});
                }
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
                this.params.refundType = "";
            },
            loadGridData: function (pars) {
                pars.refundStatus = this.refundStatus;
                $.ajax({
                    url: __ctx + "/refundApply/getFlightRefundApplyList",
                    data: pars,
                    success: function (data) {
                        vm_refundList.infos = data;
                    }
                });
            },
            refundRejectDeal: function (applyNo, refundStatusCode) {
                var VM = this;
                $.ajax({
                    url: __ctx + "/refundApply/judgeRefundApplyIfExist",
                    type: "GET",
                    async: false,
                    data: {
                        refundApplyNo: applyNo
                    },
                    datatype: "json",
                    error: function (data1) {
                        toastr.error("验证退票单是否存在失败!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        if (!data.obj) {
                            toastr.error("该退票单不存在，或已取消！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            VM.loadGridData(VM.params);
                        } else {
                            //驳回处理页
                            window.open(__ctx + "/flights/refundRejectDeal?applyNo=" + applyNo + "&refundStatusCode=" + refundStatusCode);
                        }
                    }
                });
            },
            refundDetail: function (applyNo) {
                var VM = this;
                $.ajax({
                    url: __ctx + "/refundApply/judgeRefundApplyIfExist",
                    type: "GET",
                    async: false,
                    data: {
                        refundApplyNo: applyNo
                    },
                    datatype: "json",
                    error: function (data1) {
                        toastr.error("验证退票单是否存在失败!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        if (!data.obj) {
                            toastr.error("该退票单不存在，或已取消！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            VM.loadGridData(VM.params);
                        } else {
                            //退票详情页
                            window.open(__ctx + "/flights/refundDetail?applyNo=" + applyNo);
                        }
                    }
                });

            },
            orderDetail: function (orderNo) {
                //订单详情页
                window.open(__ctx + "/orderdetails/flightorderdetail?orderNo=" + orderNo);
            }
        }
    });
    var a$ = $("#getRefundStatusNum").find(".J-status-btn");
    a$.click(function () {
        $(this).css("backgroundColor", "#dae4e9");
        a$.not(this).css("backgroundColor", "#FFF");
        vm_refundList.reset();
        vm_refundList.refundStatus = $(this).data("status");
        if (vm_refundList.refundStatus == '04' || vm_refundList.refundStatus == '05') {
            vm_refundList.showDeal = true;
        } else {
            vm_refundList.showDeal = false;
        }
        vm_refundList.loadGridData(vm_refundList.params);
    });

    function formatDate(date) {
        Y = date.getFullYear() + '-';
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
        return Y + M + D;
    }
});