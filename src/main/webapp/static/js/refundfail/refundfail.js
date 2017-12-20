var vm_list2;
debugger;
Vue.filter('approvalModelFilter', {
    read: function (value, format) {
        if (value == 1) {
            return '按组织架构审批';
        }
        if (value == 2) {
            return '授权沿用';
        }
        if (value == 3) {
            return '直接线下审批';
        }
    },
    write: function (value, format) {
        return value;
    }
});
vm_list2 = new Vue({
    el: '#refundFailAgain',
    data: {
        infos: [],
        refundApplyData: {}
    },
    ready: function () {
        this.refundApplyData = list.refundApplyAgain;
        // 输入退款金额校验
        $("#refundAmount").keyup(function () {
            var reg = $(this).val().match(/\d+\.?\d{0,2}/);
            var txt = '';
            if (reg != null) {
                txt = reg[0];
            }
            $(this).val(txt);
        }).change(function () {
            $(this).keypress();
            var v = $(this).val();
            var flag = /^0/.test(v);
            if (/\.$/.test(v)) {
                $(this).val(v.substr(0, v.length - 1));
            }
            for(i=0;i<v.length;i++) {
                if (flag && /^[0-9]*$/.test($(this).val())) {
                    $(this).val($(this).val().substr(1, $(this).val().length));
                    flag = /^0/.test($(this).val());
                }
            }

        });
    },
    methods: {
        confirm: function () {
            if ($("#refundAmount").val() == '') {
                toastr.error("退款金额不能为空", "", toastrConfig);
                return;
            }

            if (parseFloat($("#refundAmount").val()) > parseFloat($("#incomeAmount").innerText)) {
                toastr.error("退款金额不能大于收款金额", "", toastrConfig);
                return;
            }

            var refundApplyRequestDTO = {};
            refundApplyRequestDTO.refundApplyNo = list.refundApplyAgain.refundDetailDTO.refundApplyNo;
            refundApplyRequestDTO.itemId = list.refundApplyAgain.refundDetailDTO.itemId;
            refundApplyRequestDTO.tmcId = list.refundApplyAgain.tmcId;
            refundApplyRequestDTO.companyId = list.refundApplyAgain.companyId;
            if (list.refundApplyAgain.orderDetailDTO.productCode == 'DA1') {
                refundApplyRequestDTO.orderNo = list.refundApplyAgain.refundDetailDTO.orderNo;
            } else {
                refundApplyRequestDTO.orderNo = list.refundApplyAgain.orderDetailDTO.orderNo;
            }
            refundApplyRequestDTO.newOrderNo = list.refundApplyAgain.refundDetailDTO.newOrderNo;
            refundApplyRequestDTO.type = list.refundApplyAgain.refundDetailDTO.type;
            refundApplyRequestDTO.refundType = $("#refundType").val();
            refundApplyRequestDTO.fullRefund = '1';
            refundApplyRequestDTO.productCode = list.refundApplyAgain.orderDetailDTO.productCode;
            refundApplyRequestDTO.refundAmount = $("#refundAmount").val();
            refundApplyRequestDTO.orderStatusCode = list.refundApplyAgain.orderDetailDTO.orderStatusCode;
            refundApplyRequestDTO.orderStatusName = list.refundApplyAgain.orderDetailDTO.orderStatusName;
            $.ajax({
                url: __ctx + "/refundFail/applyRefundAgain",
                contentType: "application/json",
                type: "POST",
                data: JSON.stringify(refundApplyRequestDTO),
                datatype: "json",
                success: function (data) {
                    if (!data.result) {
                        toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                    } else {
                        toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        setTimeout(function () {
                            window.location.href = __ctx + '/refundFail/list';
                        }, 500);
                    }
                }
            });
        },
    }
});