var list;
$(document).ready(function () {
    /**/
    function setOrResetSelect() {
        switch (list.insureStatus) {
            case -1 :
                list.params.insureStatus = '';
                $('#insureStatus').removeAttr("disabled");
                break;
            case 2 :
                list.params.insureStatus = '2';
                $('#insureStatus').attr("disabled", true);
                break;
            case 5 :
                list.params.insureStatus = '5';
                $('#insureStatus').attr("disabled", true);
                break;
            case 6 :
                list.params.insureStatus = '6';
                $('#insureStatus').attr("disabled", true);
                break;
        }
    }

    var a$ = $("#countNumByStatus").find(".J-status-btn");
    a$.each(function () {
        var this$ = $(this);
        var status = this$.data("status");
        if (status == 2 || status == 5) {
            $.getJSON(
                __ctx + "/insurance/countNumByStatus",
                {insuranceStatus: status},
                function (result) {
                    console.log(status);
                    console.log(JSON.stringify(result));
                    if (result.success) {
                        this$.find("span").text(result.data.num);
                    } else {
                    }
                }
            )
        }
    });

    a$.click(function () {
        $(this).css("backgroundColor", "#dae4e9");
        a$.not(this).css("backgroundColor", "#FFF");
        list.params = {
            insureStatus: '', /*设置默认为所有*/
            bindProductCode: '', /*设置默认为所有*/
            insuranceSupplierCode: ''/*设置默认为所有*/
        };
        list.insureStatus = $(this).data("status");
        setOrResetSelect();
        list.query();
    });

    $('#beginInsureDate,#endInsureDate,#beginReturnDate,#endReturnDate,#beginCreateDate,#endCreateDate').datetimepicker({
        minView: "month",
        format: "yyyy-mm-dd",
        language: 'zh-CN',
        autoclose: true
    });

    /*保险单状态过滤器*/
    Vue.filter('insureStatusFilter', {
        read: function (value) {
            switch (value) {
                case '0' :
                    return '待购';
                    break;
                case '1' :
                    return '已购';
                    break;
                case '2' :
                    return '投保失败';
                    break;
                case '4' :
                    return '已退';
                    break;
                case '5' :
                    return '退保失败';
                    break;
                case '6' :
                    return '已取消';
                    break;
                default:
                    return '';
                    break;
            }
        },
        write: function (value) {
            return value;
        }
    });

    /*供应商过滤器*/
    Vue.filter('insuranceSupplierCodeFilter', {
        read: function (value) {
            if (value == 'TYDF') {
                return '天圆地方';
            } else {
                return '';
            }
        },
        write: function (value) {
            return value;
        }
    });

    Vue.filter('hrefFilter', function (extenalOrderNo, bindProductCode) {
        if (bindProductCode == null || bindProductCode == '') {
            return '';
        }

        if (bindProductCode == 'DA1') {//国内机票
            if (extenalOrderNo != null && extenalOrderNo.indexOf('DAC') == 0) {
                //改期单
                return __ctx + '/flights/changes/' + extenalOrderNo;
            } else {
                //按非改期单处理
                return __ctx + '/orderdetails/flightorderdetail?orderNo=' + extenalOrderNo;
            }
        } else if (bindProductCode == 'DT1') {//国内火车票
            //火车票改期单暂时不做
            return __ctx + '/trainorder/detail?orderNo=' + extenalOrderNo;
        } else {
            return '';
        }
    });

    Vue.filter('toBindProductCode', function (value) {
        if (value == null || value == '') {
            return '';
        }

        if (value == 'DA1') {
            return '国内机票';
        } else if (value == 'DT1') {
            return '国内火车票';
        } else {
            return value;
        }
    });

    /*日期格式化*/
    Vue.filter('toDateString', {
        read: function (value, format) {
            if (value == null || value == '') {
                return '';
            } else if (moment(value).isValid()) {
                return moment(value, "YYYY-MM-DD HH:mm:ss").format(format);
            } else {
                return '';
            }
        }
    });

    list = new Vue({
        el: '#list',
        data: {
            /*查询条件*/
            params: {
                insureStatus: '', /*保险状态*/
                bindProductCode: '', /*关联产品*/
                insuranceSupplierCode: ''/*供应商*/
            },
            info: {},
            /*保险状态枚举*/
            insureStatusOptions: [
                {text: '所有', value: ''},
                {text: '待购', value: '0'},
                {text: '已购', value: '1'},
                {text: '投保失败', value: '2'},
                {text: '已退', value: '4'},
                {text: '退保失败', value: '5'},
                {text: '已取消', value: '6'}
            ],
            /*关联产品枚举*/
            bindProductCodeOptions: [
                {text: '所有', value: ''},
                {text: '国内机票', value: 'DA1'},
                {text: '国内火车票', value: 'DT1'},
                {text: '国际机票', value: 'IA'},
                {text: '国际酒店', value: 'IH1'}
            ],
            /*供应商枚举*/
            insuranceSupplierCodeOptions: [
                {text: '所有', value: ''},
                {text: '天圆地方', value: 'TYDF'}
            ],
            /*记录当前tab栏中选中的状态*/
            insureStatus: '-1'
        },
        methods: {
            query: function (event, pageInfo) {
                var params = this.params;
                if (pageInfo) {
                    $.extend(params, pageInfo);
                } else {
                    params.page = 1;//默认起始页为第一页
                    params.pageSize = 20;//默认单页显示20条记录
                }
                $.getJSON(__ctx + '/insurance/search', params, function (result) {
                    if (!result.data || result.data.length == 0) {
                        toastr.info("未查找到相关数据", "", toastrConfig);
                    }
                    list.info = result;
                });
            },
            clean: function () {
                this.params = {
                    insureStatus: '', /*设置默认为所有*/
                    bindProductCode: '', /*设置默认为所有*/
                    insuranceSupplierCode: ''/*设置默认为所有*/
                };
                setOrResetSelect();
            }
        }
    });
});