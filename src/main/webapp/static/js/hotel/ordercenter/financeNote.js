var vm_list2;
debugger;
vm_list2 = new Vue({
    el: '#financeNote',
    data: {
        infos: [],
        billNo: {}
    },
    ready: function () {
        this.billNo = vm.billNo;
    },
    methods: {
        confirm: function () {
            var billsOpRemarkRequestDTO = {};
            billsOpRemarkRequestDTO.billsNo = vm_list2.billNo;
            billsOpRemarkRequestDTO.billsOpRemark = $("#finance-note").val();
            $.ajax({
                url: __ctx + "/orderdetails/addBillsOpRemark",
                contentType: "application/json",
                type: "POST",
                data: JSON.stringify(billsOpRemarkRequestDTO),
                datatype: "json",
                success: function (data) {
                    if (!data.result) {
                        toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                    } else {
                        toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        setTimeout(function () {
                            // window.location.href = __ctx + '/refundFail/list';
                        }, 500);
                    }
                }
            });
        },
    }
});