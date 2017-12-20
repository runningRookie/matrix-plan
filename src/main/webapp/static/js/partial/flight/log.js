$(document).ready(function () {

    var vm = new Vue({
        el: '#orderLogVM',
        data: {
            logs: [],
            isShow: false
        }
    });

    var init = function () {
        $.getJSON(__ctx + "/orders/" + window.orderNo + "/logs", function (data) {
            vm.logs = data.obj;
        });
    };

    init();

    tc.ns('tc.flight.change.toggleLogs', function () {
        vm.isShow = !vm.isShow;
    });

    tc.ns('tc.flight.logs.refresh', function () {
        init();
    });
});