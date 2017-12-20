$(document).ready(function () {
    var vm = new Vue({
        el: '#orderVM',
        data: {
            settlements: {}
        },
        ready: function () {
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/searchFlightSegment", data, function (result) {
                vm.settlements = result.obj;
            })
        }
    });
});