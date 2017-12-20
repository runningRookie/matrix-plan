$(document).ready(function () {

    tc.ns('tc.flight.refund.apply', function (applyFunc) {

        var refundApplyVM = new Vue({
            el: '#refundApplyVM',
            data: {
                refundApply:{},
                bookPerson:{}
            },
            ready: function () {
                var data = {refundApplyNo: window.refundApplyNo};
                $.getJSON(__ctx + "/flights/getRefundApplyInfo", data, function (result) {
                    applyFunc && applyFunc(result.obj);
                    refundApplyVM.refundApply = result.obj;
                    window.orderNo = result.obj.orderNo;
                });

                $.getJSON(__ctx + "/flights/getBookPersonByApplyNo", data, function (result) {
                    refundApplyVM.bookPerson = result.obj;
                });

            },
            methods:{
                
            }
        });

    });    

    

});