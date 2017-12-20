$(document).ready(function () {
    var defaultConfig = {container: 'body'};

    tc.ns('tc.flight.change.segments', function (passengersFunc, flightsFunc, refundFunc, applyNo) {

        var initRefund = function (passengers) {
            var refundChangeSign = {};
            refundChangeSign.refundInfo = passengers[0] && passengers[0].flightRefundInfoDTO;
            refundChangeSign.changeInfo = passengers[0] && passengers[0].flightChangeInfoDTO;
            refundChangeSign.signInfo = passengers[0] && passengers[0].flightSignInfoDTO;
            return refundChangeSign;
        };

        var initSelected = function (passengers) {
            return _.map(passengers, function () {
                return [];
            });
        };

        var vm = new Vue({
            el: '#flightVM',
            data: {
                flights: [],
                passengers: [],
                selected: [[]],
                flightOrder: {},
                order: {},
                flag: false
            },
            ready: function () {
                var data = {orderNo: window.orderNo};

                if (!!applyNo) {
                    data.applyNo = applyNo;
                }

                $.getJSON(__ctx + "/orderdetails/searchFlightSegment", data, function (result) {
                    flightsFunc && flightsFunc(result.obj);
                    vm.flights = result.obj;
                });

                $.getJSON(__ctx + "/orderdetails/searchPassengerSegmentInfos", data, function (result) {
                    refundFunc && refundFunc(initRefund(result.obj), result.obj);
                    vm.passengers = result.obj;
                    vm.selected = initSelected(result.obj);
                    window.setTimeout(function () {
                        $("[data-toggle='popover']").popover({html: true});

                        $('.originPriceTypes').each(function () {
                            var selector$ = $(this);
                            var pIndex = selector$.data('pindex');
                            var index = selector$.data('index');
                            var item = vm.passengers[pIndex].flightSegmentInfos[index];
                            var segment = vm.flights[index];
                            if (!item || !segment) {
                                return;
                            }
                            if (item.priceType != 1) {
                                return;
                            }
                            var template = tc.flight.detail.utils.genTableTemplate([], [
                                ['协议号：', segment.airlineCompany + '：' + item.agreementCode],
                                ['协议价：', item.agreementPrice]
                            ]);

                            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
                        });
                    }, 100);
                });

                $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                    vm.order = result.obj;
                    if (parseInt(vm.order.flightOrderDTO.flightOrderStatus) < 12) {
                        vm.flag = false;
                    } else {
                        vm.flag = true;
                    }
                });
            },
            methods: {
                getTicketStatus: function (index, ticketNo, passengerName) {
                    var startPortCode = this.flights[index].startPortCode;
                    var endPortCode = this.flights[index].endPortCode;
                    var airlineCompanyCode = this.flights[index].airlineCompanyCode;
                    $.ajax({
                        url: __ctx + "/flightOrder/getTicketLastStatus",
                        type: "POST",
                        data: {
                            ticketNo: ticketNo,
                            startPortCode: startPortCode,
                            endPortCode: endPortCode,
                            airlineCode: airlineCompanyCode,
                            passengerName: passengerName
                        },
                        datatype: "json",
                        error: function (data) {
                            toastr.error("获取票号状态失败!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success: function (data) {
                            if (data.result) {
                                $("#ticketNo" + index + "_" + ticketNo).text("(" + data.obj + ")");
                                $("#ticketNo" + index + "_" + ticketNo).css("color", "red");
                            } else {
                                toastr.error(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                            }
                        }
                    });
                },
                showStopSite: function (flightStopSites, index) {
                    var stopsites = "";
                    stopsites += "<table style='width:100%;padding:0px;' class='table table-bordered'>";
                    stopsites += "<thead>";
                    stopsites += "<tr>";
                    stopsites += "<th></th>";
                    stopsites += "<th>经停机场</th>";
                    stopsites += "<th>到达时间</th>";
                    stopsites += "<th>起飞时间</th>";
                    stopsites += "<th>经停时长</th>";
                    stopsites += "</tr>";
                    stopsites += "</thead>";
                    stopsites += "<tbody>";
                    $(flightStopSites).each(function (i, stopSite) {
                        stopsites += "<tr>";
                        stopsites += "<th>" + (i + 1) + "</th>";
                        stopsites += "<th>" + stopSite.stopPort + "</th>";
                        stopsites += "<th>" + stopSite.arriveTime + "</th>";
                        stopsites += "<th>" + stopSite.leaveTime + "</th>";
                        if (stopTime > 60) {
                            stopsites += "<th>" + stopSite.stopTime / 60 + "小时" + stopSite.stopTime % 60 + "分钟" + "</th>";
                        } else {
                            stopsites += "<th>" + stopSite.leaveTime + "分钟" + "</th>";
                        }
                        stopsites += "</tr>";
                    })
                    stopsites += "</tbody>";
                    stopsites += "</table>";
                    var option = {
                        template: "<div class='popover' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content' style='padding:0px;'></div></div>",
                        content: stopsites,
                        container: 'body',
                        html: true
                    }

                    $('#testButtton' + index).popover(option).popover('show');

                }
            }
        });

        vm.$watch('selected', function (val) {
            var arr = _.cloneDeep(val);
            var oldPassengers = _.cloneDeep(vm.passengers);
            var passengers = _.filter(_.map(arr, function (sub, pIndex) {
                sub = sub.sort();
                var passenger = oldPassengers[pIndex];
                passenger.flightSegmentInfos = _.map(sub, function (index) {
                    return _.assign(passenger.flightSegmentInfos[index], {flightIndex: index});
                });
                if (passenger.flightSegmentInfos.length == 0) {
                    return null;
                }
                return passenger;
            }));
            passengersFunc && passengersFunc(passengers);
        });

        return {
            setFlightOrder: function (flightOrder) {
                vm.flightOrder = flightOrder;
            }
        };
    });
});