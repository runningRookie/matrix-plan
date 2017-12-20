var vm_list;
$(document).ready(function () {
    //创建时间精确到天
    $('#beginTime,#endTime').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });
    //创建时间精确到分
    $('#planBeginDate,#planEndDate').datetimepicker({
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
    $('#myTab li:nth-child(2) a').click(function (e) {
        vm_changeList.init();
        // 重新请求数据
        vm_changeList.loadGridData(vm_changeList.params);
    })
    //跳转第三个tab页（退票单查询）
    if (returnFlag != null && returnFlag != undefined && returnFlag == '3') {
        $('#myTab li:nth-child(3) a').tab('show');
        vm_refundList.init();
        vm_refundList.loadGridData(vm_refundList.params);
    }
    $('#myTab li:nth-child(3) a').click(function (e) {
        vm_refundList.init();
        vm_refundList.loadGridData(vm_refundList.params);
    })
    //跳转第四个tab页（负利润单查询）
    if (returnFlag != null && returnFlag != undefined && returnFlag == '4') {
        $('#myTab li:nth-child(4) a').tab('show');
        vm_minusProfitList.init();
        vm_minusProfitList.loadGridData(vm_minusProfitList.params);
    }
    $('#myTab li:nth-child(4) a').click(function (e) {
        vm_minusProfitList.init();
        vm_minusProfitList.loadGridData(vm_minusProfitList.params);
    })

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
    Vue.filter('auditStatusFliter', {
        read: function (value, format) {
            if (value == '01') {
                return '待审批';
            }
            if (value == '02') {
                return '审批中';
            }
            if (value == '03') {
                return '审批不通过';
            } 
            if(value == '04'){
            	return '审批通过'
            }else {
                return '';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
    Vue.filter('orderStatusFliter', {
        read: function (value, format) {
            if (value == '01') {
                return '订单取消';
            }
            if (value == '02') {
                return '待提交';
            }
            if (value == '03') {
                return '待审批';
            }
            if (value == '04') {
                return '审批中';
            }
            if (value == '05') {
                return '审批不通过';
            }
            if (value == '06') {
                return '待支付';
            }
            if (value == '07') {
                return '待人工出票';
            }
            if (value == '08') {
                return '出票驳回';
            }
            if (value == '09') {
                return '出票驳回待审核';
            }
            if (value == '10') {
                return '出票驳回审核通过';
            }
            if (value == '11') {
                return '出票驳回审核不通过';
            }
            if (value == '12') {
                return '出票成功';
            }
            if (value == '13') {
                return '变更中';
            }
            if (value == '14') {
                return '部分改期';
            }
            if (value == '15') {
                return '部分退票';
            }
            if (value == '16') {
                return '已改期';
            }
            if (value == '17') {
                return '已退票';
            }
            if(value=='18'){
            	return '待自动出票'
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
            params: {},
            flightOrderStatus: "",
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
                    this.params.size = 10;
                }
                this.loadGridData(this.params);
            },
            reset: function () {
                this.params = {};
            },
            btnClean: function () {
                vm_list.params.orderNo = "";
                vm_list.params.passengerPhones = "";
                vm_list.params.beginTime = "";
                vm_list.params.endTime = "";
                vm_list.params.pnr = "";
                vm_list.params.passengerNames = "";
                vm_list.params.startCityName = "";
                vm_list.params.flightNos = "";
                vm_list.params.ticketNos = "";
                vm_list.params.contactPersonNames = "";
                vm_list.params.passengerName = "";
                vm_list.params.passengerEmail = "";
                vm_list.params.contactPersonPhones = "";
                vm_list.params.planBeginDate = "";
                vm_list.params.planEndDate = "";
                vm_list.params.airlineCompany = "";
                vm_list.params.companyName = "";
                vm_list.params.outBeginDate = "";
                vm_list.params.outEndDate = "";
				vm_list.params.companyName = "";
            },
            loadGridData: function (pars) {
                if((!!this.params.planBeginDate && !!this.params.planEndDate) && (new Date(this.params.planBeginDate) > new Date(this.params.planEndDate))){
                    toastr.error("出发时间不能大于到达时间", "", toastrConfig);
                    return;
                }
                if((!!this.params.outBeginDate && !!this.params.outEndDate) && (new Date(this.params.outBeginDate) > new Date(this.params.outEndDate))){
                    toastr.error("出票开始时间大于结束时间", "", toastrConfig);
                    return;
                }
                pars.flightOrderStatus = this.flightOrderStatus;
                $.ajax({
                    url: __ctx + "/flightOrder/serachflightorder",
                    data: pars,
                    success: function (data) {
                        vm_list.infos = data;
                    }
                });
            },
            init: function () {
                $.ajax({
                    url: __ctx + "/flightOrder/index/init",
                    data: null,
                    success: function (data) {
                        var rtnObj = data.obj;
                        if (rtnObj != null) {
                            vm_minusProfitList.$watch(function () {
                                $("#myTab").find("li:nth-child(4) div span").text(rtnObj.drawering || "");
                            });
                        }
                    }
                });
            }
        }
    });
    var a$ = $("#getOrderStatusNum").find(".J-status-btn");
    a$.each(function () {
        var this$ = $(this);
        var status = this$.data("status");
        $.getJSON(
            __ctx + "/flightOrder/serachorderstatus",
            {flightOrderStatus: status},
            function (data) {
                this$.find("span").text(data.obj || "");
            }
        )
    })

    a$.click(function () {
        $(this).css("backgroundColor", "#dae4e9");
        a$.not(this).css("backgroundColor", "#FFF");
        vm_list.flightOrderStatus = $(this).data("status");
        vm_list.reset();
        vm_list.loadGridData(vm_list.params);
        vm_list.isShowReason = vm_list.flightOrderStatus == '08,11';
    });
    $('#myTab a[href="#orderPageList"]').tab('show');
    vm_list.init();
});