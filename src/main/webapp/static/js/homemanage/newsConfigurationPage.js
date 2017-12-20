/**
 * Created by zyy43688 on 2017/9/4.
 */
var list;

$(document).ready(function () {
    /*设置时间控件属性*/
    $('#gmtCreateFrom,#gmtCreateTo').datetimepicker({
        minView: "month",
        format: "yyyy-mm-dd",
        language: 'zh-CN',
        todayBtn: true,
        autoclose: true
    });

    /*资讯类型枚举*/
    var newsTypeEnum = {
        TRAVEL_NEWS: {key: 'TRAVEL_NEWS', value: '商旅动态'},
        VISA_INFO: {key: 'VISA_INFO', value: '签证信息'}
    };

    list = new Vue({
        el: '#list',
        data: {
            /*查询条件*/
            params: {
                newsType: '', /*资讯类型*/
                creater: '', /*创建人*/
                gmtCreateFrom: '', /*创建开始时间*/
                gmtCreateTo: ''/*创建结束时间*/
            },
            info: {},

            /*资讯类型枚举*/
            newsTypeOptions: [
                {text: "全部", value: ''},
                {text: "商旅动态", value: newsTypeEnum.TRAVEL_NEWS.key},
                {text: "签证信息", value: newsTypeEnum.VISA_INFO.key}
            ]
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
                    url: __ctx + '/news/queryNewsPageList',
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
                if (this.params.gmtCreateFrom != null && this.params.gmtCreateFrom != ''
                    && this.params.gmtCreateTo != null && this.params.gmtCreateTo != ''
                    && this.params.gmtCreateFrom > this.params.gmtCreateTo) {
                    toastr.error("开始时间不能晚于结束时间！", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return false;
                }

                return true;
            },
            addNews: function () {
                window.location = __ctx + "/news/toAddNewsPage";
            },
            editNews: function (item) {
                window.location = __ctx + "/news/toEditNewsPage?id=" + item.id + "&newsType=" + item.newsType;
            },
            delNews: function (item) {

                if (!confirm("是否确认删除？")) {
                    return;
                }

                $.ajax({
                    url: __ctx + "/news/delNews",
                    contentType: "application/json",
                    type: "POST",
                    data: JSON.stringify(item),
                    dataType: "json",
                    success: function (result) {
                        if (!result || !(result.success)) {
                            toastr.error("删除失败！", "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        } else {
                            toastr.info("删除成功！", "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                            /*刷新页面*/
                            list.query(list.params);
                        }
                    }
                });
            }
        }
    });

    /*默认查询*/
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

    /*资讯类型过滤器*/
    Vue.filter('newsTypeFilter', {
        read: function (value) {
            for (var p in newsTypeEnum) {
                if (value == newsTypeEnum[p].key) {
                    return newsTypeEnum[p].value;
                }
            }
            return value;
        },
        write: function (value) {
            return value;
        }
    });
});