var list;
$(document).ready(function () {
    var curDate = new Date();
    $('#applyDateFrom, #applyDateTo').datetimepicker({
        minView: 'month', // 选择日期后，不会再跳转去选择时分秒
        format: 'yyyy-mm-dd', // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true, // 选择日期后自动关闭
        endDate: curDate,//最大值为当天
    });

    //日期时间过滤器
    Vue.filter('toDate', {
        read: function (value, format) {
            if (value == '' || value == null || value == '631123200000' || value == '1990-01-01 00:00:00') {
                return '';
            }
            return moment(value).format(format);
        }
    });

    //状态过滤器
    Vue.filter('refundTypeFliter', {
        read: function (value) {
            if (value == 0) {
                return '全部退款';
            }
            if (value == 1) {
                return '部分退款';
            }
        }
    });
    // 支付状态
    Vue.filter('paymentStatusFliter', {
        read: function (value) {
            if (value == 0) {
                return '未知';
            }
            if (value == 1) {
                return '未支付';
            }
            if (value == 2) {
                return '支付中';
            }
            if (value == 3) {
                return '支付成功';
            }
            if (value == 4) {
                return '支付失败';
            }
            if (value == 5) {
                return '交易关闭';
            }
            if (value == 6) {
                return '交易超时到期';
            }
            if (value == 7) {
                return '交易冲正';
            }
            if (value == 8) {
                return '预授权成功';
            }
        }
    });
    // 退款状态
    Vue.filter('tradeStatusFliter', {
        read: function (value) {
            if (value == 1) {
                return '退款成功';
            }
            if (value != 1) {
                return '退款失败';
            }
        }
    });

    list = new Vue({
        el: '#refundFailList',
        data: {
            params: {
                'applyDateFrom': moment().format('YYYY-MM-DD'),//申请开始日期默认当天
                'applyDateTo': moment().format('YYYY-MM-DD'),//申请接受日期默认当天
                'orderNo': $("#orderNo").val(),
                'productCode': $('input:radio:checked').val(),
            },
            info: {},
            isExport: 0,
            refundQueryRequestDTO: {},
            refundApplyAgain: {},
            reloadList: {}
        },
        ready: function () {
            var reloadList = {};
            if (sessionStorage.length == 0) {
                reloadList.orderNo = '';
                reloadList.startTime = this.params.applyDateFrom;
                reloadList.endTime = this.params.applyDateTo;
                reloadList.productCode = "DT1";
                reloadList.tradeStatus = '2';
                reloadList.applyStatus = '2';
                reloadList.pageNum = 1;
                reloadList.pageSize = 20;
                reloadList.isExport = 0;
            } else {
                reloadList.orderNo = sessionStorage.orderNo || '';
                reloadList.startTime = sessionStorage.startTime || this.params.applyDateFrom;
                reloadList.endTime = sessionStorage.endTime || this.params.applyDateTo;
                reloadList.productCode = sessionStorage.productCode || "DT1";
                reloadList.tradeStatus = sessionStorage.tradeStatus || '2';
                reloadList.applyStatus = sessionStorage.applyStatus || '2';
                reloadList.pageNum = sessionStorage.pageNum || 1;
                reloadList.pageSize = sessionStorage.pageSize || 20;
                reloadList.isExport = sessionStorage.isExport || 0;
                this.params.applyDateFrom = sessionStorage.startTime || this.params.applyDateFrom;
                this.params.applyDateTo = sessionStorage.endTime || this.params.applyDateTo;
                this.params.orderNo = sessionStorage.orderNo || '';
                $(":radio[value='" + sessionStorage.productCode + "']").prop("checked", "checked");
            }
            $.ajax({
                contentType: 'application/json',
                dataType: 'json',
                type: 'POST',
                data: JSON.stringify(reloadList),
                url: __ctx + '/refundFail/queryRefundFailList',
                success: function (result) {
                    if (result.result) {
                        list.info = result.obj;
                        if (list.info == 0) {
                            toastr.info('未找到满足条件记录！', '', toastrConfig);
                        }

                        list.refundQueryRequestDTO = {};
                    } else {
                        toastr.error('查询异常！', '', toastrConfig)
                    }
                }
            });
        },
        methods: {
            exportRefundFailList: function () {
                this.isExport = 1;
                this.queryRefundFailList(true, false, this.isExport);
            },
            
            queryRefundFailList: function (event, pageInfo, isExport) {
                if (pageInfo) {
                    this.params.pageNum = pageInfo.page;
                    this.params.pageSize = pageInfo.size;
                } else {
                    this.params.pageNum = 1;
                    this.params.pageSize = 20;
                }
                this.loadGridData(this.params, isExport)
            },
            loadGridData: function (params, isExport) {
                list.refundQueryRequestDTO.orderNo = $("#orderNo").val();
                list.refundQueryRequestDTO.startTime = params.applyDateFrom;
                list.refundQueryRequestDTO.endTime = params.applyDateTo;
                list.refundQueryRequestDTO.productCode = $('input:radio:checked').val();
                list.refundQueryRequestDTO.tradeStatus = '2';
                list.refundQueryRequestDTO.applyStatus = '2';
                list.refundQueryRequestDTO.pageNum = params.pageNum;
                list.refundQueryRequestDTO.pageSize = params.pageSize;
                list.refundQueryRequestDTO.isExport = isExport;
                sessionStorage.clear();
                sessionStorage.orderNo = list.refundQueryRequestDTO.orderNo;
                sessionStorage.startTime = params.applyDateFrom;
                sessionStorage.endTime = params.applyDateTo;
                sessionStorage.productCode = list.refundQueryRequestDTO.productCode;
                sessionStorage.tradeStatus = '2';
                sessionStorage.applyStatus = '2';
                sessionStorage.pageNum = params.pageNum;
                sessionStorage.pageSize = params.pageSize;
                sessionStorage.isExport = 0;
                $.ajax({
                    contentType: 'application/json',
                    dataType: 'json',
                    type: 'POST',
                    data: JSON.stringify(list.refundQueryRequestDTO),
                    url: __ctx + '/refundFail/queryRefundFailList',
                    success: function (result) {
                        if (result.result) {
                            list.info = result.obj;
                            if (list.info == 0) {
                                toastr.info('未找到满足条件记录！', '', toastrConfig);
                            }

                            list.refundQueryRequestDTO = {};
                            if (isExport) {
                                window.location.href =  __ctx + '/refundFail/download';
                            }
                            this.isExport = 0;
                            return;
                        } else {
                            toastr.error('查询异常！', '', toastrConfig)
                        }
                    }
                });
            },
            applyReundAgain: function (item) {
                list.refundApplyAgain = item;
                $("#formModal").modal({
                    show: true,
                    remote: __ctx + "/refundFail/toapplyrefundAgain",
                    backdrop: 'static',
                })
            },
            clean: function () {
                this.params = {
                    'status': 0,
                    'subDateFrom': moment().format('YYYY-MM-DD'),//默认当天
                    'subDateTo': moment().format('YYYY-MM-DD'),//默认当天
                    'flyOffDateFrom': moment().format('YYYY-MM-DD'),//默认当天
                    'flyOffDateTo': moment().add(1, 'years').format('YYYY-MM-DD')//默认当天
                };
            }
        }
    });
});