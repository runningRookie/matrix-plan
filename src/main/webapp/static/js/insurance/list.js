$(document).ready(function () {

    var vm = new Vue({
        el: '#insuranceListVM',
        data: {
            insurances: [],
            statuses: [],
            selectStatus: '',
            selectInsuranceItemId: '',
            logs: [],
            inputInsuranceOrderNo: []
        },
        ready: function () {
            var thisVM = this;
            $.getJSON(__ctx + '/insurance/findByOrderItemId', {orderItemId: window.orderItemId}, function (item) {
                thisVM.insurances = item.obj;

                setTimeout(initTip, 500)
            });

            $.getJSON(__ctx + '/insurance/statuses', function (item) {
                thisVM.statuses = item.obj;
            });
        },
        methods: {
            changeStatus: function () {
                if (!vm.selectStatus || !vm.selectInsuranceItemId) {
                    toastr.error("请选择需要修改的状态", "", toastrConfig);
                    return;
                }
                $.post(__ctx + '/insurance/changeStatus', {
                    status: vm.selectStatus,
                    insuranceItemId: vm.selectInsuranceItemId
                }, function (result) {
                    if (!result.result) {
                        toastr.error("状态修改失败", "", toastrConfig);
                        return;
                    }
                    toastr.success("状态修改成功", "", toastrConfig);
                    window.location.reload();
                });
            },
            showChangeStatus: function (selectInsuranceItemId) {
                vm.selectInsuranceItemId = selectInsuranceItemId;
                $('#changeStatusModel').modal('show');
            },
            showLog: function (insuranceOrderNo) {
                $.getJSON(__ctx + '/insurance/logs', {insuranceNo: insuranceOrderNo}, function (item) {
                    vm.logs = item.obj;
                });

                $('#logModel').modal('show');
            },
            save: function () {
                if (!valid()) {
                    return;
                }
                var param = [];
                _.forEach(vm.insurances, function (item, index) {
                    if (!item.insuranceNumber) {
                        param.push({
                            insuranceNumber: vm.inputInsuranceOrderNo[index],
                            insuranceItemId: item.id
                        });
                    }
                });

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + '/insurance/updateItems',
                    data: JSON.stringify({insuranceItemUpdates: param}),
                    dataType: "json",
                    timeout: 60000,
                    success: function (result) {
                        if (!result.result) {
                            toastr.error("投保单号修改失败", "", toastrConfig);
                            return;
                        }
                        toastr.success("投保单号修改成功", "", toastrConfig);
                        window.location.reload();
                    },
                    error: function () {
                        toastr.error("网络出现问题，请稍后再试", "", toastrConfig);
                    }
                });
            },
            close: function () {
                window.opener = null;
                window.open('', '_self');
                window.close();
            }
        }
    });

    function initTip() {
        $('.insuranceClause').each(function () {
            var selector$ = $(this);
            var index = selector$.data('index');
            var insurance = vm.insurances[index];
            if (!insurance || !insurance.insuranceSoldDTO || !insurance.insuranceSoldDTO.clause) {
                return;
            }
            var str = insurance.insuranceSoldDTO.clause.replace(/\|/g,"<br>");
            selector$.tooltip({container: 'body', title: str, html: true});
        });
    }

    function valid() {
        var flag = true;
        _.forEach(vm.insurances, function (item) {
            if (!item.insuranceNumber) {
                flag = false;
            }
        });

        if (flag) {
            toastr.error("无需修改保险内容", "", toastrConfig);
            return false;
        }

        flag = true;
        _.forEach(vm.insurances, function (item, index) {
            if (!item.insuranceNumber && !vm.inputInsuranceOrderNo[index]) {
                flag = false;
            }
        });
        if (!flag) {
            toastr.error("请输入投保单号", "", toastrConfig);
            return false;
        }
        return true;
    }
});