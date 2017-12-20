$(document).ready(function () {

    var vm = new Vue({
        el: '#checkinDealVM',
        data: {
            order: {},
            passengers: [],
            flights: [],
            seats: [],
            selectSeat: '',
            currentOrderItemId: ''
        },
        ready: function () {
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                if (!result.obj || !result.obj.flightOrderDTO) {
                    window.location.href = __ctx + "/common/pageNotFound";
                }
                vm.order = result.obj;
            });

            $.getJSON(__ctx + "/orderdetails/searchPassengerSegmentInfos", data, function (result) {
                vm.passengers = result.obj;
            });

            $.getJSON(__ctx + "/orderdetails/searchFlightSegment", data, function (result) {
                vm.flights = result.obj;
            });
        },
        methods: {
            showCheckin: function (orderItemId) {
                vm.currentOrderItemId = orderItemId;
                var params = {
                    checkInCommonRequest: {
                        orderItemId: orderItemId
                    }
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + '/checkInCore/getSeatMap',
                    data: JSON.stringify(params),
                    dataType: "json",
                    success: function (data) {
                        if (!data.result) {
                            $('#CheckinDealErrorModal').modal('show');
                            return;
                        }
                        vm.seats = data.obj.rowSeatList;
                        $('#confirmCheckinDealModal').modal('show');
                    },
                    error: function () {
                        $('#CheckinDealErrorModal').modal('show');
                    }
                });
            },
            continueDeal: function () {
                $('#confirmCheckinDealModal').modal('hide');
                $('#checkinDealModal').modal('show');
            },
            choose: function (seat) {
                vm.selectSeat = seat;
            },
            checkin: function () {

            },
            cancelCheckin: function (orderItemId) {
                var params = {
                    orderItemId: orderItemId
                };
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + '/checkInCore/cancelCheckIn',
                    data: JSON.stringify(params),
                    dataType: "json",
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", toastrConfig);
                            return;
                        }
                        toastr.info("取消值机成功", "", toastrConfig);
                    }
                });
            }
        }
    });
});