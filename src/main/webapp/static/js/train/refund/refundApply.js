/*
 * LY.com Inc.
 * Copyright (c) 2004-2016 All Rights Reserved.
 */
var vue_refund;
$(document).ready(function () {

    vue_refund = new Vue({
        el: '#refundApply',
        data: {
            order: {}
        },
        ready: function () {
            this.loadData();
        },
        methods: {
            loadData: function () {
                $.ajax({
                    url: __ctx + "/train/refund/apply/detail?itemId=" + window.itemId + "&flag=T",
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result && result.obj) {
                            vue_refund.order = result.obj
                        } else {
                            toastr.error(result.message, "", toastrConfig);
							setTimeout(function () {
								window.history.go(-1);
							}, 2000);
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
						setTimeout(function () {
							window.history.go(-1);
						}, 2000);
                    }
                })
            },
			checkRefund:function(){
				var reg_Fee = /^\d+(\.\d+)?$/;
				var trimStr = $.trim(vue_refund.order.serviceFee);
				if (trimStr === "" || !reg_Fee.test(trimStr)) {
                    toastr.error("服务费为空或格式不正确", null, {
                        timeOut: 3000,
                        positionClass: "toast-top-center"
                    });
                } else if (trimStr.indexOf(".") != -1 && trimStr.split(".")[1].length > 1) {
					toastr.error("服务费只允许1位小数", null, {
						timeOut: 3000,
						positionClass: "toast-top-center"
					});
                } else {
					$("#formModal").modal({
						show : true,
						backdrop : 'static',
						remote : __ctx + "/train/refund/check/"
					});
				}
            },
        }
    });

})
