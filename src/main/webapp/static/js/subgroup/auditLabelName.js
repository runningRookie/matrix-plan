
Vue.component('audit-label', {
    props:['data', 'binddata', 'labeldata'],
    template:
        "<div class='form-group text-center' v-if='textareaShow'>" +
            "<label class='col-sm-3 control-label' style='word-wrap: break-word;'>{{textareaLabelName}}<span v-if='textareaMust' style='color: red'>*</span>：</label>" +
            "<div class='col-sm-5'>" +
                "<textarea style='width: 93%;vertical-align: bottom' rows='3' placeholder='请填写备注，不超过50个字' maxlength='50' class='col-sm-10' v-model='binddata.remark'></textarea>" +
            "</div>"  +
        "</div>" +
        "<div class='form-group' v-if='imgShow'>" +
            "<label class='col-sm-3 control-label' style='word-wrap: break-word;'>{{imgLabelName}}<span v-if='imgMust' style='color: red'>*</span>：</label>" +
            "<div style='overflow: hidden;' class='col-sm-8'>" +
                "<a v-on:click='addAuditPic' href='javascript:;' v-if='binddata.images.length < 3'>上传图片附件</a>" +
                "<input type='file' id='auditFile' @change='onAuditFileChange' multiple style='display: none;'>" +
                "<ul>" +
                    "<li v-for='(key,image) in binddata.images' track-by='$index' class='li-more'>" +
                        "<div>" +
                            "<img style='width: 100px;height: 100px;margin: auto;display: inline;margin-bottom: 10px;' :src='image' @click='delAuditImage(key)'>" +
                            "<a href='#' style='position: absolute;' @click='delAuditImage(key)'>" +
                                "<span class='glyphicon glyphicon-remove'></span>" +
                            "</a>" +
                            "<br>" +
                            "{{ binddata.imgNames[key] }}" +
                        "</div>" +
                    "</li>" +
                "</ul>" +
                "<div v-if='binddata.images.length > 0' >" +
                    "<button type='button' @click='removeAuditImage' style='float: left'>移除全部图片</button>" +
                "</div>" +
            "</div>"  +
        "</div>",
    computed:{
        textareaShow:function () {
            var textareaShow = false;
            // 是否附加填写框
            var additionalFillinBox = this.data.additionalFillinBox;
            if (additionalFillinBox != undefined && additionalFillinBox != 0) {
                textareaShow = true;
            }
            return textareaShow;
        },
        textareaMust:function () {
            var textareaMust = false;
            // 是否附加填写框
            var additionalFillinBoxRequired = this.data.additionalFillinBoxRequired;
            if (additionalFillinBoxRequired != undefined && additionalFillinBoxRequired != 0) {
                textareaMust = true;
            }
            return textareaMust;
        },
        imgShow:function () {
            var imgShow = false;
            // 是否附加填写框
            var allowedUploadAttachments = this.data.allowedUploadAttachments;
            if (allowedUploadAttachments != undefined && allowedUploadAttachments != 0) {
                imgShow = true;
            }
            return imgShow;
        },
        imgMust:function () {
            var imgMust = false;
            // 是否附加填写框
            var allowedUploadAttachmentsRequired = this.data.allowedUploadAttachmentsRequired;
            if (allowedUploadAttachmentsRequired != undefined && allowedUploadAttachmentsRequired != 0) {
                imgMust = true;
            }
            return imgMust;
        },
        textareaLabelName:function () {
            return this.labeldata.labelChName + "填写框";
        },
        imgLabelName:function () {
            return this.labeldata.labelChName + "附件";
        }
    },
    methods: {
        addAuditPic: function () {
            $('#auditFile').trigger('click');
            return false;
        },
        onAuditFileChange: function(e) {
            var flag = true;
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            if (files.length > 3) {
                toastr.error("选择的图片不能超过3张!","", {
                    timeOut: 2000,
                    positionClass: "toast-top-center"
                });
                $('#auditFile').val('');
                return;
            };
            if ((files.length + this.binddata.images.length) > 3) {
                toastr.error("选择的图片总张数不能超过3张!","", {
                    timeOut: 2000,
                    positionClass: "toast-top-center"
                });
                $('#auditFile').val('');
                return;
            };
            _.forEach(files, function (file) {
                var fileName=file.name;
                var extStart = fileName.lastIndexOf(".") + 1;
                var ext = fileName.substring(extStart, fileName.length).toLowerCase();
                if (ext != "bmp" && ext != "png" && ext != "gif" && ext != "jpeg" && ext != "jpg" ){
                    flag = false;
                    return false;
                }
            });
            if(!flag){
                toastr.error("图片类型必须是.gif,jpeg,jpg,png,bmp中的一种!","", {
                    timeOut: 2000,
                    positionClass: "toast-top-center"
                });
                $('#auditFile').val('');
                return;
            }
            this.createAuditImage(files);
        },
        createAuditImage: function(files) {
            // debugger;
            var _self = this;
            if (typeof FileReader === undefined) {
                alert('您的浏览器不支持图片上传，请升级您的浏览器');
                return false;
            }
            for (var i = 0; i < files.length; i++) {
                var filesize = files[i].size;
                if (filesize > 5 * 1024 * 1024) {
                    toastr.error("仅允许5M以内文件,文件：" + files[i].name + "，大小超过限制", "",{
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return;
                }
            }
            var image = new Image();
            var leng = files.length;
            for (var i = 0; i < leng; i++) {
                var file = files[i];
                this.imageLoad(file, _self);
            }
            $('#auditFile').val('');
        },
        imageLoad: function (file, self) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                if ($.inArray(e.target.result, self.binddata.images) < 0) {
                    self.binddata.fileValue.push(file);
                    self.binddata.images.push(e.target.result);
                    self.binddata.imgNames.push(file.name);
                }
            };
        },
        delAuditImage: function (index) {
            this.binddata.images.splice(index, 1);
            this.binddata.imgNames.splice(index, 1);
            this.binddata.fileValue.splice(index, 1);
        },
        removeAuditImage: function (e) {
            this.binddata.images = [];
            this.binddata.imgNames = [];
            this.binddata.fileValue = [];
        }
    }
});