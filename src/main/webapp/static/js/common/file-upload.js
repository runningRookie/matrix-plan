$(document).ready(function () {
    tc.ns('tc.utils.fileUpload', function (callback) {
        var template = '<input type="file" style="display: none"  id="uploadFileInput"/>';
        var toastrConfig = {
            timeOut: 2000,
            positionClass: "toast-top-center"
        };

        var getSelector = function () {
            return $('#uploadFileInput');
        };

        var fileSelector$ = getSelector();
        var templateRemove = function () {
            fileSelector$.remove();
        };

        templateRemove();

        $('body').append(template);

        fileSelector$ = getSelector();

        fileSelector$.click();

        fileSelector$.change(function () {
            var fileData = fileSelector$[0].files[0];
            var formData = new FormData();

            formData.append('file', fileData);    // 将文件转成二进制形式

            $.ajax({
                type: "post",
                url: __ctx + "/file/upload",
                contentType: false,    // 这个一定要写
                processData: false, // 这个也一定要写，不然会报错
                data: formData,
                dataType: 'json',    // 返回类型
                success: function (result) {
                    if (result.result) {
                        toastr.success(result.message, "上传成功", toastrConfig);
                        callback(result.obj);
                    } else {
                        toastr.error(result.message, "上传失败", toastrConfig);
                    }
                    templateRemove();
                },
                error: function (data) {
                    toastr.error("文件大小最大10M,文件类型只能是word、excel、pdf", "上传失败", toastrConfig);
                    templateRemove();
                }
            })
        });
    });
});