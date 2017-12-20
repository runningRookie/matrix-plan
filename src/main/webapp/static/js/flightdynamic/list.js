var list;
$(document).ready(function () {
    var curDate = new Date();
    $('#subDateFrom,#subDateTo').datetimepicker({
        minView: 'month', // 选择日期后，不会再跳转去选择时分秒
        format: 'yyyy-mm-dd', // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true, // 选择日期后自动关闭
        endDate: curDate,//最大值为当天
    });

    curDate.setFullYear(curDate.getFullYear() + 1);
    $('#flyOffDateFrom, #flyOffDateTo').datetimepicker({
        minView: 'month', // 选择日期后，不会再跳转去选择时分秒
        format: 'yyyy-mm-dd', // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true, // 选择日期后自动关闭
        endDate: curDate,//最大值为当天+1年
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
    Vue.filter('status', {
        read: function (value) {
            if (value == 1) {
                return '订阅成功';
            }
            if (value == 2) {
                return '订阅失败';
            }
            if (value == 3) {
                return '取消成功';
            }
            if (value == 4) {
                return '取消失败';
            }
        }
    });

    list = new Vue({
        el: '#list',
        data: {
            params: {
                'subDateFrom': moment().format('YYYY-MM-DD'),//默认当天
                'subDateTo': moment().format('YYYY-MM-DD'),//默认当天
                'flyOffDateFrom': moment().format('YYYY-MM-DD'),//默认当天
                'flyOffDateTo': moment().add(1, 'years').format('YYYY-MM-DD')//默认当前时间一年之后
            },
            info: {},
            tempParams: {}
        },
        ready: function () {
        },
        methods: {
            querySubscriptionRecord: function (event, pageInfo) {
                if (pageInfo) {
                    this.params.page = pageInfo.page;
                    this.params.pageSize = pageInfo.size;
                } else {
                    this.params.page = 1;
                    this.params.pageSize = 20;
                }
                this.loadGridData(this.params)
            },
            loadGridData: function (params) {

                if (!(this.verifier(params))) {
                    return;
                }

                $.ajax({
                    contentType: 'application/json',
                    dataType: 'json',
                    type: 'POST',
                    url: __ctx + '/flightDynamic/querySubscriptionRecord',
                    data: JSON.stringify(list.tempParams),
                    success: function (result) {
                        if (result.success) {
                            list.info = result.data;
                            if (list.info.data.length == 0) {
                                toastr.info('未找到满足条件记录！', '', toastrConfig);
                            }

                            list.tempParams = {};
                        } else {
                            toastr.error('查询异常！', '', toastrConfig)
                        }
                    }
                });
            },
            verifier: function (params) {
                //
                $.extend(this.tempParams, params);
                var flag = 0;

                //订单号允许输入字母，数字
                var reg = /^[a-zA-Z0-9]+$/;
                var orderNo = $.trim(this.tempParams.orderNo);
                if (orderNo == '') {
                    flag += 1;
                }
                console.debug(flag);
                if (orderNo != '' && !(reg.test(orderNo))) {
                    toastr.error('订单号只能包含字母和数字', '', toastrConfig);
                    return false;
                }

                //只允许输入字母、汉字、符号(仅限'/')
                reg = /^[a-zA-Z\u4E00-\u9FA5/]+$/;
                var passengerName = $.trim(this.tempParams.passengerName);
                if (passengerName == '') {
                    flag += 1;
                }
                console.debug(flag);
                if (passengerName != '' && !(reg.test(passengerName))) {
                    toastr.error('姓名只能由字母数字及' / '组成', '', toastrConfig);
                    return false;
                }

                //“状态”选择全部时，删除“state”属性
                if (this.tempParams.status == '0') {
                    delete this.tempParams.status;
                    flag += 1;
                }

                //起飞机场三字码
                reg = /^[a-zA-Z]+$/;
                var depCode = ($.trim(this.tempParams.depCode)).toUpperCase();
                if (depCode != '' && !(reg.test(depCode))) {
                    toastr.error('起飞机场三字码只能输入字母', '', toastrConfig);
                    return false;
                }

                if (depCode.length != 0 && depCode.length != 3) {
                    toastr.error('起飞机场三字码为三位字母', '', toastrConfig);
                    return false;
                }

                //抵达机场三字码
                reg = /^[a-zA-Z]+$/;
                var arrCode = ($.trim(this.tempParams.arrCode)).toUpperCase();
                if (arrCode != '' && !(reg.test(arrCode))) {
                    toastr.error('抵达机场三字码只能输入字母', '', toastrConfig);
                    return false;
                }

                if (arrCode.length != 0 && arrCode.length != 3) {
                    toastr.error('抵达机场三字码为三位字母', '', toastrConfig);
                    return false;
                }

                //航班号
                reg = /^[a-zA-Z0-9]+$/;
                var flightNo = $.trim(this.tempParams.flightNo);
                if (flightNo != '' && !(reg.test(flightNo))) {
                    toastr.error('航班号只能由字母数字组成', '', toastrConfig);
                    return false;
                }

                //订阅日期
                if (this.tempParams.subDateFrom > this.tempParams.subDateTo) {
                    toastr.error('订阅日期起点不能晚于终点', '', toastrConfig);
                    return false;
                }

                if (moment(this.tempParams.subDateFrom).add(3, "months").format("YYYY-MM-DD") < this.tempParams.subDateTo) {
                    toastr.error('订阅日期跨度不能超过3个月', '', toastrConfig);
                    return false;
                }

                //给起订阅日期加上时，分，秒，并转换为Date对象
                this.tempParams.subDateFrom = new Date(this.tempParams.subDateFrom + " 00:00:00");
                this.tempParams.subDateTo = new Date(this.tempParams.subDateTo + " 23:59:59");

                //起飞日期
                if (this.tempParams.flyOffDateFrom > this.tempParams.flyOffDateTo) {
                    toastr.error('起飞日期起点不能晚于终点', '', toastrConfig);
                    return false;
                }

                if (moment(this.tempParams.flyOffDateFrom).add(1, "years").format("YYYY-MM-DD") < this.tempParams.flyOffDateTo) {
                    toastr.error('起飞日期跨度不能超过1年', '', toastrConfig);
                    return false;
                }

                //给起飞时间加上时、分、秒，并转换为Date对象
                this.tempParams.flyOffDateFrom = new Date(this.tempParams.flyOffDateFrom + " 00:00:00");
                this.tempParams.flyOffDateTo = new Date(this.tempParams.flyOffDateTo + " 23:59:59");

                return true;
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