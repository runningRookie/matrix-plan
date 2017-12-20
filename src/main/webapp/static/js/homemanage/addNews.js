/**
 * Created by zyy43688 on 2017/9/4.
 */
var news;
$(document).ready(function () {
    /*设置时间控件属性*/
    $('#submitDateTimeFrom,#submitDateTimeTo').datetimepicker({
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

    /*资讯类型过滤器*/
    Vue.filter("newsTypeFilter", {
        read: function (newsType) {
            if (newsTypeEnum[newsType.key]) {
                return newsTypeEnum[newsType.key].value;
            } else {
                return newsType;
            }
        }
    });

    news = new Vue({
        el: '#news',
        data: {
            images: [], /*图片*/
            imgNames: [], /*图片名称*/
            newsTypes: [newsTypeEnum.TRAVEL_NEWS, newsTypeEnum.VISA_INFO], /*资讯类型*/
            supportedSuffix: ['.jpg', '.png'], /*支持的文件格式*/
            supportedFileSize: 200 * 1024, /*最大可上传文件大小*/
            newsBodyMaxLength: 2000, /*最多输入2千字*/
            newsDTO: {
                newsType: '',
                newsBody: '',
                newsTitle: ''
            },
            fileValue: []
        },
        methods: {
            addPic: function (e) {
                e.preventDefault();
                $('input[type=file]').trigger('click');
                return false;
            },
            onFileChange: function (e) {

                var files = e.target.files;
                if (!files.length)return;

                // news.fileValue = files;
                $.extend(true, news.fileValue, files);

                var flag = true;
                _.forEach(files, function (file) {
                    var tag = false;
                    for (var i = 0; i < news.supportedSuffix.length; i++) {
                        if (file.name.toLowerCase().lastIndexOf(news.supportedSuffix[i]) >= 0) {
                            tag = true;
                            break;
                        }
                    }
                    if (!tag) {
                        flag = false;
                        return false;
                    }
                });

                if (!flag) {
                    toastr.error("图片类型必须是jpg,png中的一种!", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    $('input[type=file]').val('');
                    return;
                }

                this.createImage(files);
            },
            createImage: function (file) {
                //noinspection JSValidateTypes
                if (typeof FileReader === undefined) {
                    alert('您的浏览器不支持图片上传，请升级您的浏览器');
                    $('input[type=file]').val('');
                    return false;
                }
                for (var i = 0; i < file.length; i++) {
                    var fileSize = file[i].size;
                    if (fileSize > news.supportedFileSize) {
                        toastr.error("仅允许200kb以内文件!", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                        $('input[type=file]').val('');
                        return;
                    }
                }

                /*每次上传之前先移除原有图片*/
                this.images = [];
                this.imgNames = [];

                var vm = this;
                for (var i = 0; i < file.length; i++) {
                    var name = file[i].name;
                    vm.imgNames.push(name);
                    var reader = new FileReader();
                    reader.readAsDataURL(file[i]);
                    reader.onload = function (e) {
                        vm.images.push(e.target.result);
                    };
                }
                $('input[type=file]').val('');
                $('#addPic').text('重新上传');
            },
            backToNewsPageList: function () {
                if (confirm("是否确认返回，返回后当前编辑内容将失效！")) {
                    window.location = __ctx + "/news/toNewsConfigurationPage";
                }
            },
            addNews: function () {
                /*参数校验*/
                if (!this.check()) {
                    return;
                }

                /*文本框特殊处理*/

                this.uploadImgAndNews();
            },
            check: function () {
                if (this.newsDTO.newsType == null || this.newsDTO.newsType == '') {
                    toastr.error("请选择资讯类型！", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return false;
                }

                if (this.newsDTO.newsTitle == null || this.newsDTO.newsTitle.trim() == '') {
                    toastr.error("请输入标题！", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return false;
                }

                if (this.newsDTO.newsBody == null || this.newsDTO.newsBody.trim() == '') {
                    toastr.error("请输入正文！", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return false;
                }

                if (this.images == null || this.images.length == 0) {
                    toastr.error("请上传封面图！", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return false;
                }

                return true;
            },
            uploadImgAndNews: function () {
                var formData = new FormData();
                for (var i = 0; i < news.fileValue.length; i++) formData.append('files', news.fileValue[i]);

                $.ajax({
                    type: "post",
                    url: __ctx + "/news/upload",
                    contentType: false,    // 这个一定要写
                    processData: false,    // 这个也一定要写，不然会报错
                    data: formData,

                    success: function (result) {
                        if (!result || !(result.success)) {
                            toastr.error("图片上传失败！", "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        } else {
                            var urls = result.data;
                            if (!urls || urls.length == 0) {
                                toastr.error("图片上传失败！", "", {
                                    timeOut: 2000,
                                    positionClass: "toast-top-center"
                                });
                            } else {
                                news.newsDTO.coverUrl = urls[0];
                                var param = {};
                                $.extend(param, news.newsDTO);
                                param.newsBody = news.newsDTO.newsBody.replace(/ /g, '&nbsp;').replace(/[\n\r]/g, '<br />');
                                $.ajax({
                                    url: __ctx + "/news/addNews",
                                    contentType: "application/json",
                                    type: "POST",
                                    data: JSON.stringify(param),
                                    dataType: "json",
                                    success: function (result) {
                                        if (!result || !(result.success)) {
                                            toastr.error("新增失败！", "", {
                                                timeOut: 2000,
                                                positionClass: "toast-top-center"
                                            });
                                        } else {
                                            toastr.info("保存成功！", "", {
                                                timeOut: 2000,
                                                positionClass: "toast-top-center"
                                            });
                                            setTimeout(function () {
                                                /*跳转回列表页*/
                                                window.location = __ctx + "/news/toNewsConfigurationPage";
                                            }, 1000);
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            }
        }
    });
});
