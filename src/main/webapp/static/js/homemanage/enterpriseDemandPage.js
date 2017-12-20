/**
 * Created by zyy43688 on 2017/9/4.
 */
var list;
var detailsModal;

$(document).ready(function () {
    /*设置时间控件属性*/
    $('#submitDateTimeFrom,#submitDateTimeTo').datetimepicker({
        minView: "month",
        format: "yyyy-mm-dd",
        language: 'zh-CN',
        todayBtn: true,
        autoclose: true
    });

    /*将需求枚举值表示转换为文字*/
    Vue.filter('travelDemandFilter', {
        read: function (value) {
            if (value == null || value == '') {
                return '';
            } else {
                var items = value.split(',');
                var travelDemand = [];
                for (var i = 0; i < items.length; i++) {
                    travelDemand.push(travelDemandEnum[items[i]]);
                }
                return travelDemand.join('，');
            }
        }
    });
    /*将差旅人数范围转换为文字*/
    Vue.filter('travellerNumRangeFilter', {
        read: function (value) {
            if (value == null || value == '') {
                return '';
            } else {
                return travellerNumRangeEnum[value];
            }
        }
    });

    /*商旅需求枚举*/
    var travelDemandEnum = {
        '0': '机票',
        '1': '酒店',
        '2': '火车票'
    };
    /*差旅人范围枚举*/
    var travellerNumRangeEnum = {
        '0': '100人以下',
        '1': '101-500人',
        '2': '501-1000人',
        '3': '1000人以上'
    };

    list = new Vue({
        el: '#list',
        data: {
            /*查询条件*/
            params: {
                enterpriseName: '', /*企业名称*/
                submitDateTimeFrom: '', /*提交开始时间*/
                submitDateTimeTo: ''/*提交结束时间*/
            },
            info: {}
        },
        methods: {
            query: function (event, pageInfo) {
                if (!this.check()) {
                    return;
                }
                var params = this.params;
                if (pageInfo) {
                    params.page = pageInfo.page;
                    params.pageSize = pageInfo.size;
                } else {
                    params.page = 1;//默认起始页为第一页
                    params.pageSize = 20;//默认单页显示20条记录
                }
                $.ajax({
                    contentType: 'application/json',
                    dataType: 'json',
                    type: 'POST',
                    url: __ctx + '/enterpriseDemand/queryEnterpriseDemandPageList',
                    data: JSON.stringify(list.params),
                    success: function (result) {
                        if (result.success) {
                            list.info = result.data;
                            if (list.info.data.length == 0) {
                                // toastr.info('未找到满足条件记录！', '', toastrConfig);
                            }
                        } else {
                            toastr.error('查询异常！', '', toastrConfig)
                        }
                    }
                });
            },
            check: function () {
                if (this.params.submitDateTimeFrom != null && this.params.submitDateTimeFrom != ''
                    && this.params.submitDateTimeTo != null && this.params.submitDateTimeTo != ''
                    && this.params.submitDateTimeFrom > this.params.submitDateTimeTo) {
                    toastr.error("开始时间不能晚于结束时间！", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return false;
                }

                return true;
            },
            details: function (item) {
                $.ajax({
                    contentType: 'application/json',
                    dataType: 'json',
                    type: 'POST',
                    url: __ctx + '/enterpriseDemand/findCorporationById',
                    data: JSON.stringify({id: item.id}),
                    success: function (result) {
                        if (result.success) {
                            detailsModal.enterpriseDemand = result.data;
                            $("#detailsModal").modal({
                                show: true,
                                backdrop: 'static'
                            });
                        } else {
                            toastr.error('查询异常，查看失败！', '', toastrConfig)
                        }
                    }
                });
            }
        }
    });

    detailsModal = new Vue({
        el: '#detailsModal',
        data: {
            enterpriseDemand: {}
        }
    });

    /*默认查询所有*/
    list.query(list.params);

    /*日期格式化*/
    Vue.filter('toDateString', {
        read: function (value, format) {
            if (value == null || value == '') {
                return '';
            } else {
                return moment(value).format(format);
            }
        }
    });


    /*设置模态框上下，水平居中*/
    $('#detailsModal').on('show.bs.modal', function (e) {
        $(this).css('display', 'block');
        var modalHeight = $(window).height() / 2 - $('#detailsModal .modal-dialog').height() / 2;
        $(this).find('.modal-dialog').css({
            'margin-top': modalHeight
        });
    });
});