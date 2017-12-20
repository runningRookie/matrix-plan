$(document).ready(function () {

    var vm = new Vue({
        el: '#orderVM',
        data: {
            order: {flightOrderDTO: {}, orderMainDTO: {}},
            bookCompanyName: "",
            bussinessTravelAim: "",
            relationalOrderNum: 0,
            travelType: '',
            ticketAccounts:[],
            refundApplys:[],
            changeApplys:[],
            orderPaymentInformation:{}
        },
        ready: function () {
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                vm.order = result.obj;
            });

            $.getJSON(__ctx + "/orderdetails/getBookCompanyName", data, function (result) {
                vm.bookCompanyName = result.obj;
            });

            $.getJSON(__ctx + "/orderdetails/getBuessinessTravelAim", data, function (result) {
                vm.bussinessTravelAim = result.obj;
            });

            $.getJSON(__ctx + "/orderdetails/getRelationalOrderNum", data, function (result) {
                vm.relationalOrderNum = result.obj;
            });

            $.getJSON(__ctx + "/orderdetails/travelType", data, function (result) {
                vm.travelType = result.obj;
            });
            
            $.getJSON(__ctx + "/orderdetails/getOutTicketAccount", data, function (result) {
                vm.ticketAccounts = result.obj;
            });
            
            $.getJSON(__ctx + "/orderdetails/getAllOrderRefundApply", data, function (result) {
                vm.refundApplys = result.obj;
            });
            
            $.getJSON(__ctx + "/orderdetails/getAllOrderChangeApply", data, function (result) {
                vm.changeApplys = result.obj;
            });
            
            $.getJSON(__ctx + "/orderdetails/getPaymentInfo", data, function (result) {
                vm.orderPaymentInformation = result.obj;
            });
        }
    });
    tc.ns('tc.flight.change.order', function () {
        return _.cloneDeep(vm.order);
    });
});