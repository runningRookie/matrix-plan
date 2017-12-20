$(document).ready(function () {

    var initDatePicker = function () {
        $('.dateInputPicker').datetimepicker({
            minView: "month", // 选择日期后，不会再跳转去选择时分秒
            format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
            language: 'zh-CN', // 汉化
            autoclose: true // 选择日期后自动关闭
        });

        $('.timeInputPicker').datetimepicker({
            startView: 'hour',
            maxView: "hour", // 选择日期后，不会再跳转去选择时分秒
            format: "hh:ii", // 选择日期后，文本框显示的日期格式
            language: 'zh-CN', // 汉化
            autoclose: true // 选择日期后自动关闭
        });
    };

    var refundchangesignVM = new Vue({
        el: '#refundchangesignVM',
        data: {
            refundChangeSign: {}
        },
        methods: {}
    });


    var refundAmountVM = new Vue({
        el: '#refundAmountVM',
        data: {
            refundType: 0,
            segmentInfos: [],
            passengerSegments: [],
            order: {}
        },
        ready: function () {
            this.getAllCurrencyTypes();
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                refundAmountVM.order = result.obj;
            });
        },
        methods: {
            getAllCurrencyTypes: function () {
                $.ajax({
                    url: __ctx + "/resource/getAllCurrencyTypes",
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        for (var i = 0; i < data.length; i++) {
                            var option = $("<option>").text(data[i].chineseName).val(data[i].currencyTypeCode);
                            $("#currency").append(option);
                        }
                    }
                });
            }
        }
    });

    var orderLogVM = new Vue({
        el: '#orderLogVM',
        data: {
            logs: [],
            isShow: true
        },
        ready: function () {
            $.getJSON(__ctx + "/orders/" + window.orderNo + "/logs", function (data) {
                orderLogVM.logs = data.obj;
            });
        }
    });

    tc.ns('tc.flight.logs.refresh', function () {
        $.getJSON(__ctx + "/orders/" + window.orderNo + "/logs", function (data) {
            orderLogVM.logs = data.obj;
        });
    });

    tc.flight.refund.segments(function (refundChangeSign, passengers) {
        refundchangesignVM.refundChangeSign = _.cloneDeep(refundChangeSign);
        refundAmountVM.passengerSegments = _.cloneDeep(passengers);
    });

    tc.flight.detail.order(function (order) {
        refundAmountVM.order = _.cloneDeep(order);
    });
});