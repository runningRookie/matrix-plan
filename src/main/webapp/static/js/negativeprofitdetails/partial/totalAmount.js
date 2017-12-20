$(document).ready(function () {
    var vm = new Vue({
        el: '#totalAmount',
        data: {
            order: {}
        },
        ready: function () {
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                vm.order = result.obj;
            })
        }
    });
});