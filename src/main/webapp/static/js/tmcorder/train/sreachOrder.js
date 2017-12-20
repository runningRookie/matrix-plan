var vm_list;
$(document).ready(function () {
    //创建时间精确到天
    $('#gmtCreateBegin,#gmtCreateEnd,#chnageGmtCreateBegin,#changeGmtCreateEnd').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });
    //创建时间精确到分
    $('#planBeginDate,#planEndDate,#changePlanBeginDate,#changePlanEndDate').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });
    //创建时间精确到分
    $('#refundGmtCreateBegin,#refundGmtCreateEnd,#refundTimeBegin,#refundTimeEnd').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });

    //tab页跳转
    $('#myTab li:first a').tab('show'); // 选择第一个标签
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })
    //跳转第一个tab页
    if (returnFlag != null || returnFlag != undefined || returnFlag == '' || returnFlag == '1') {
        $('#myTab li:first a').tab('show');
    }
    //跳转第二个tab页（改期单查询）
    if (returnFlag != null && returnFlag != undefined && returnFlag == '2') {
        $('#myTab li:nth-child(2) a').tab('show');
        vm_changeList.init();
        vm_changeList.loadGridData(vm_changeList.params);
    }

    Vue.filter('toDate', {
        read: function (value, format) {
            if (value == '' || value == null || value == '631123200000' || value == '1990-01-01 00:00:00') {
                return '';
            }
            return moment(value).format(format);
        },
        write: function (value, format) {
            return value;
        }
    });
    Vue.filter('orderStatusFliter', {
        read: function (value, format) {
            if (value == 'N') {
                return '占座中';
            }
            if (value == 'D') {
                return '待提交';
            }
            if (value == 'S') {
                return '待审批';
            }
            if (value == 'G') {
                return '审批中';
            }
            if (value == 'H') {
                return '审批不通过';
            }
            if (value == 'B') {
                return '购票失败';
            }
            if (value == 'A') {
                return '待支付';
            }
            if (value == 'O') {
                return '订单已过期';
            }
            if (value == 'E') {
                return '已申请出票';
            }
            if (value == 'U') {
                return '申请出票失败';
            }
            if (value == 'C') {
                return '订单已取消';
            }
            if (value == 'F') {
                return '出票成功';
            }
            if (value == 'P') {
                return '出票失败';
            }
            if (value == 'T') {
                return '已全部退票';
            }
            if (value == 'Q') {
                return '已全部改签';
            }
            if (value == 'X') {
                return '部分改签';
            }
            if (value == 'Y') {
                return '部分退票';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
    Vue.filter('toPassager', {
        read: function (value, vipFlag) {
            if (value != '' && vipFlag != null) {
                value = value.replace(new RegExp(vipFlag, 'g'), "<div class='vip-icon'></div>");
            }
            return value;
        },
        write: function (value, format) {
            return value;
        }
    });
    Vue.filter('orderTypeFliter', {
        read: function (value, format) {
            if (value == 'change') {
                return '改签单';
            }
            if (value == 'origin') {
                return '原单';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
    Vue.filter('refundTypeFliter', {
        read: function (value, format) {
            if (value == 'online') {
                return '线上';
            }
            if (value == 'offline') {
                return '线下';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    vm_list = new Vue({
        el: "#systemPageList",
        data: {
            infos: [],
            changeInfos:[],
            refundInfos:[],
            params: {
            	page: 1,
            	size: 20,
                companyName: ""
            },
            changeParams: {
                page: 1,
                size: 20,
                companyName: ""
            },
            refundParams: {
                page: 1,
                size: 20
            },
            trainOrderStatus: "",
            trainOrderChangeStatus: "",
            isShowReason: false,
            responsibleGroup: '',
            responsiblePeople: '',
            serviceGroups: [],
            servicePeoples: [],
            companys: []
        },
        ready: function () {
            var thisVM = this;
            // 责任组
            $.getJSON(__ctx + '/resource/getResponsibleGroups', function (data) {
                thisVM.serviceGroups = data;
            });
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
                        vm_list.companys = data;
                    }
                });
            };
            loadCompanysData();
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
                this.params = {};
                this.changeParams = {};
            },
            changeReset: function () {
                this.changeParams = {};
            },
            refundReset: function () {
                this.refundParams = {};
            },
            loadGridData: function (pars) {

                if((!!this.params.planBeginDate && !!this.params.planEndDate) && (new Date(this.params.planBeginDate) > new Date(this.params.planEndDate))){
                    toastr.error("出发时间不能大于到达时间", "", toastrConfig);
                    return;
                }

                pars.orderStatus = this.trainOrderStatus;
                $.ajax({
                    url: __ctx + "/trainorder/dosearchorder",
                    type : "POST",
                    data: pars,
                    success: function (data) {
                        vm_list.infos = data;
                    }
                });
            },
            queryChangeData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.changeParams, pageInfo);
                }
                else {
                    this.changeParams.page = 1;
                    this.changeParams.size = 20;
                }
                this.loadChangeData(this.changeParams);
            },
            loadChangeData: function (pars) {
                if((!!this.changeParams.planBeginDate && !!this.changeParams.planEndDate) && (new Date(this.changeParams.planBeginDate) > new Date(this.changeParams.planEndDate))){
                    toastr.error("出发时间不能大于到达时间", "", toastrConfig);
                    return;
                }

                pars.orderStatus = this.trainOrderChangeStatus;
                $.ajax({
                    url: __ctx + "/trainorder/dochangesearch",
                    type : "POST",
                    data: pars,
                    success: function (data) {
                        vm_list.changeInfos = data;
                    }
                });
            },
            queryRefundData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.refundParams, pageInfo);
                }
                else {
                    this.refundParams.page = 1;
                    this.refundParams.size = 20;
                }
                this.loadRefundData(this.refundParams);
            },
            loadRefundData: function (pars) {
                $.ajax({
                    url: __ctx + "/train/refund/getTrainRefundOrderList",
                    type : "POST",
                    data: pars,
                    success: function (data) {
                        vm_list.refundInfos = data;
                    }
                });
            },
            init: function () {
            	this.loadGridData(this.params);
            	this.loadChangeData(this.changeParams);
            	this.loadRefundData(this.refundParams);
            }
        }
    });
    var a$ = $("#getOrderStatusNum").find("a");
    a$.each(function () {
        var this$ = $(this);
        var status = this$.data("status");
        $.getJSON(
            __ctx + "/trainorder/serachorderstatus",
            {trainOrderStatus: status},
            function (data) {
                this$.find("span").text(data.obj || "");
            }
        )
    })

    a$.click(function () {
        $(this).css("backgroundColor", "#EEE");
        a$.not(this).css("backgroundColor", "#FFF");
        vm_list.trainOrderStatus = $(this).data("status");
        vm_list.params.page = 1;
        vm_list.params.size = 20;
//        vm_list.reset();
        vm_list.loadGridData(vm_list.params);
        
    });

    var b$ = $("#getChangeStatusNum").find("a");
    b$.each(function () {
        var this$ = $(this);
        var status = this$.data("status");
        $.getJSON(
            __ctx + "/trainorder/searchChangeStatus",
            {trainOrderChangeStatus: status},
            function (data) {
                this$.find("span").text(data.obj || "");
            }
        )
    })

    b$.click(function () {
        $(this).css("backgroundColor", "#EEE");
        b$.not(this).css("backgroundColor", "#FFF");
        vm_list.trainOrderChangeStatus = $(this).data("status");
        vm_list.changeParams.page = 1;
        vm_list.changeParams.size = 20;
//        vm_list.reset();
        vm_list.loadChangeData(vm_list.changeParams);

    });
    $('#myTab a[href="#orderPageList"]').tab('show');
    vm_list.init();


    vm_list.$watch('responsibleGroup', function (val) {
        if (!val) {
            return;
        }
        vm_list.responsiblePeople = '';
        var id = val.split(',')[0];
        $.getJSON(__ctx + '/resource/getResponsiblePepoleByGroupId', {responsibleGroupId: id}, function (data) {
            vm_train_book2.servicePeoples = data;
        });
    });
});