var vm_changeList;
$(document).ready(function () {
    $('#date-end,#date-start').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });
    //出票时间
    $('#outBeginDate,#outEndDate').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });
    Vue.filter('toOutDate', {
        read: function (value, format) {
            if (value == '' || value == null || value == '-28800000' || value == '1970-01-01 00:00:00') {
                return '';
            }
            return moment(value).format(format);
        },
        write: function (value, format) {
            return value;
        }
    });
    vm_changeList = new Vue({
        el: "#flightChangeApplyPageList",
        data: {
            infos: [],
            params: {},
            changeStatus: "",
            isShowReason: false,
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
                        vm_changeList.companys = data;
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
                var outtime1 = new Date(this.params.outBeginDate).getTime();
                var outtime2 = new Date(this.params.outEndDate).getTime();
                if (outtime1 > outtime2) {
                    toastr.error("出票开始时间大于结束时间", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
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
                this.params.rescheduledType = "";
            },
            changeDetail: function (applyNo) {
                //改期详情页
                window.open(__ctx + "/flights/changes/" + applyNo);
            },
            orderDetail: function (orderNo) {
                //订单详情页
                window.open(__ctx + "/orderdetails/flightorderdetail?orderNo=" + orderNo);
            },
            loadGridData: function (pars) {
                pars.changeStatus = this.changeStatus;
                $.ajax({
                    url: __ctx + "/flightChangeApply/getFlightChangeApplyList",
                    data: pars,
                    success: function (data) {
                        vm_changeList.infos = data;
                    }
                });
            }
        }
    });
    function formatDate(date) {
        Y = date.getFullYear() + '-';
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
        return Y + M + D;
    }

    var a$ = $("#getChangeStatusNum").find(".J-status-btn");
    a$.each(function () {
        var this$ = $(this);
        var status = this$.data("status");
        $.getJSON(
            __ctx + "/flightChangeApply/findchangestatus",
            {changeStatus: status},
            function (data) {
                this$.find("span").text(data.obj || "");
            }
        )
    })

    a$.click(function () {
        $(this).css("backgroundColor", "#dae4e9");
        a$.not(this).css("backgroundColor", "#FFF");
        vm_changeList.changeStatus = $(this).data("status");
        vm_changeList.reset();
        vm_changeList.loadGridData(vm_changeList.params);
    });
});