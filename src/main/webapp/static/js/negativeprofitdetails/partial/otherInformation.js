$(document).ready(function () {
    var vm = new Vue({
        el: '#orderInformation',
        data: {
            order: {},
            servicePeoples: {},
            contactPerson: {},
            flightOrderInfoDTO: {}
        },
        ready: function () {
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                vm.order = result.obj;
                if (!result.obj || !result.obj.flightOrderDTO) {
                    window.location.href = __ctx + "/common/pageNotFound";
                }
            });
            $.getJSON(__ctx + "/negativeprofits/serachservicepeople", data, function (result) {
                vm.servicePeoples = result.obj;
            });
            $.getJSON(__ctx + "/negativeprofits/serachcontactperson", data, function (result) {
                vm.contactPerson = result.obj;
            });
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                vm.flightOrderInfoDTO = result.obj;
            });
        }
    });
});