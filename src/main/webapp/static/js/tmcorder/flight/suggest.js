$(document).ready(function () {
    var defaultConfig = {container: 'body', placement: 'auto'};

    var vm = new Vue({
        el: '#suggestFlightModal',
        data: {
            suggestFlights: [],
            orderData: {goFlightConfirm: {}},
            sameRefund: [],
            sameAirRefund: [],
            otherRefund: [],
            bookPersonAndPassengers
        },
        methods: {
            order: function (cabin, type, index) {
                $('#suggestFlightModal').modal('hide');

                var params = _.cloneDeep(window.orderData);
                var paramCabin = _.cloneDeep(cabin);

                var refund = {};
                if (type === 'same') {
                    refund = vm.sameRefund[index];
                }
                if (type === 'sameAir') {
                    refund = vm.sameAirRefund[index];
                }
                if (type === 'other') {
                    refund = vm.otherRefund[index];
                }

                paramCabin.changeInfo = refund.changeInfo;
                paramCabin.refundInfo = refund.refundInfo;
                paramCabin.signInfo = refund.signInfo;
                params.goFlightConfirm.cabin = paramCabin;
                params.goFlightConfirm.violationContents = null;

                var lowestPrices = [];
                _.forEach(params.goFlightConfirm.flightLowestPrices, function (item) {
                    if (item.priceType == 1) {
                        lowestPrices.push(item);
                    }
                });
                var flightLeast = genLowestPriceDTO(paramCabin, 2, paramCabin);
                lowestPrices.push(flightLeast);

                params.goFlightConfirm.flightLowestPrices = lowestPrices;
                params.goFlightConfirm.violationReasons = transferReasons([], [], params.goFlightConfirm.cabin.flightData.travelPolicys);

                vm.orderData = params;

                if (!violationReasonVM.checked()) {
                    $('#suggestFlightViolationReasonModal').modal('show');
                    return;
                }

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + '/flights/order',
                    data: JSON.stringify(params),
                    dataType: "json",
                    timeout: 60000,
                    success: function (data) {
                        if (data.result) {
                            toastr.success("订单创建成功, 马上跳转到行程详情页", "", toastrConfig);
                            location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo=" + data.obj;
                            return;
                        }
                        $('#suggestFlightErrorModal').modal('show');
                    },
                    error: function () {
                        toastr.error("网络出现问题，请稍后再试", "", toastrConfig);
                    }
                });
            }
        }
    });

    var violationReasonVM = new Vue({
        el: '#suggestFlightViolationReasonModal',
        data: {
            violationPassengers: {go: [{}], back: [{}]},
            checkedViolationReasons: {
                go: [{}],
                back: [{}]
            },
            checkedViolationReasonNotes: {
                go: [{reason: {}, note: ''}],
                back: [{reason: {}, note: ''}]
            },
            basic: {
                violationReasons: []
            }
        },
        ready: function () {
            initReasons(window.bookPersonAndPassengers.bookPerson.bookCompanyId);
        },
        methods: {
            reasonChange: function (index, reasonId, type) {
                var reason = _.find(violationReasonVM.basic.violationReasons, {id: parseInt(reasonId)});

                if (type === 'go') {
                    violationReasonVM.checkedViolationReasonNotes.go.$set(index, {
                        reason: _.cloneDeep(reason),
                        note: ''
                    });
                }
                if (type === 'back') {
                    violationReasonVM.checkedViolationReasonNotes.back.$set(index, {
                        reason: _.cloneDeep(reason),
                        note: ''
                    });
                }
            },
            suggestOrder: function () {

                if (!validReason()) {
                    toastr.error("请选择违反差旅政策的原因", "", toastrConfig);
                    return;
                }

                if (!$('#suggestFlightReasonForm').valid()) {
                    toastr.error("请输入合法的数据", "", toastrConfig);
                    return;
                }

                $('#suggestFlightViolationReasonModal').modal('hide');

                var params = _.cloneDeep(vm.orderData);
                params.goFlightConfirm.violationReasons = transferReasons(violationReasonVM.checkedViolationReasons.go, violationReasonVM.checkedViolationReasonNotes.go, params.goFlightConfirm.cabin.flightData.travelPolicys);

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + '/flights/order',
                    data: JSON.stringify(params),
                    dataType: "json",
                    timeout: 60000,
                    success: function (data) {
                        if (data.result) {
                            toastr.success("订单创建成功, 马上跳转到行程详情页", "", toastrConfig);
                            location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo=" + data.obj;
                            return;
                        }
                        $('#suggestFlightErrorModal').modal('show');
                    },
                    error: function () {
                        toastr.error("网络出现问题，请稍后再试", "", toastrConfig);
                    }
                });
            },
            checked: function () {
                var go = initViolationPassenger(vm.bookPersonAndPassengers.passengers, vm.orderData.goFlightConfirm.cabin.flightData.travelPolicys, vm.orderData.goFlightConfirm.violationContents);

                setTimeout(function () {
                    initPassengerViolatePolicies('goViolatePolicies', go, vm.orderData.goFlightConfirm.cabin, vm.orderData.goFlightConfirm.violationContents);
                }, 500);
                violationReasonVM.violationPassengers.go = go;

                violationReasonVM.checkedViolationReasons.go = initCheckedViolationReasons(violationReasonVM.violationPassengers.go);

                return tc.arr.isEmpty(violationReasonVM.checkedViolationReasons.go);
            }
        }
    });

    var suggestFlightErrorVM = new Vue({
        el: '#suggestFlightErrorModal',
        methods: {
            reSelect: function () {
                $('#suggestFlightErrorModal').modal('hide');

                var goOrderFormSelector$ = $('#goListForm');
                goOrderFormSelector$.find('input[name=bookPersonAndPassengersDTOStr]').val(JSON.stringify(vm.bookPersonAndPassengers));
                goOrderFormSelector$.find('input[name=depCode]').val(window.goFlightConfirm.depCityCode);
                goOrderFormSelector$.find('input[name=depName]').val(window.goFlightConfirm.depCityName);
                goOrderFormSelector$.find('input[name=arrCode]').val(window.goFlightConfirm.arrCityCode);
                goOrderFormSelector$.find('input[name=arrName]').val(window.goFlightConfirm.arrCityName);
                goOrderFormSelector$.find('input[name=depDate]').val(window.goFlightConfirm.date);
                goOrderFormSelector$.find('input[name=backDate]').val(!!window.backFlightConfirm.cabin ? window.backFlightConfirm.date : '');
                goOrderFormSelector$.find('input[name=travelType]').val(!!window.backFlightConfirm.cabin ? 'comeAndGo' : 'single');
                goOrderFormSelector$.submit();
            }
        }
    });

    var genTrs = function (trs) {
        var html = '';
        _.forEach(trs, function (tds) {
            html += '<tr>';
            _.forEach(tds, function (val) {
                html += '<td style="min-width: 50px;text-align: left;">' + val + '</td>';
            });
            html += '</tr>';
        });
        return html;
    };

    var genTable = function (trs) {
        var template = '<table class="flightTipTable"><tbody>';
        template += genTrs(trs);
        template += '</tbody></table>';
        return template;
    };

    var genRefundChangeParams = function (flight, item) {
        var params = {
            airlineCode: flight.airlineCode,
            fltNo: flight.fltNo,
            depDate: item.flightData.depDate,
            cabinCode: item.flightData.cabinCode,
            baseCabinCode: item.flightData.baseCabinCode,
            baseCabinFare: item.flightData.baseCabinFare,
            fdFare: item.flightData.fdFare,
            fbc: item.flightData.fbc,
            discount: item.flightData.discount,
            startPort: item.flightData.depPortCode,
            endPort: item.flightData.arrPortCode,
            depTime: item.flightData.depTime,
            shareFltCode: item.flightData.shareFltCode,
            shareFltNo: item.flightData.shareFltNo,
            flightAmount: item.flightData.fare,
            flightQueryResultKey: flight.flightQueryResultKey,
            flightInfoKey: flight.flightInfoKey,
            cabinInfoKey: item.flightData.cabinInfoKey,
            resourceType: flight.channelType,
            priceType: item.flightData.isAgreeFare === 'Y' ? '1' : '0'
        };
        return params;
    };

    var refundChanges = function (flights, selector$, refund) {
        var events = $._data(selector$[0], 'events');
        if (!!events) {
            return;
        }
        var index = selector$.data('index');
        var flight = flights[index];
        if (!flight) {
            return;
        }
        var item = flight.cabins[0];
        if (!item) {
            return;
        }
        var url = __ctx + '/flights/refundChange';

        var params = genRefundChangeParams(flight, item);

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: url,
            data: JSON.stringify(params),
            dataType: "json",
            success: function (data) {
                if (!data.obj) {
                    return;
                }
                var refundRules = _.map(data.obj.refundRule, function (val) {
                    return ['&nbsp;', val];
                });
                var changeRules = _.map(data.obj.changeRule, function (val) {
                    return ['&nbsp;', val];
                });
                if (!refundRules[0]) {
                    return;
                }
                refundRules[0][0] = '退票：';
                changeRules[0][0] = '改期：';
                var template = genTable(refundRules.concat(changeRules).concat([['签转：', data.obj.signTransferRule]]));

                var placement = index == 0 ? 'bottom' : 'auto';
                selector$.tooltip(_.assign({container: '#suggestFlightModalBody', placement: placement}, {title: template, html: true}));

                refund[index] = {};
                refund[index].changeInfo = !!data.obj.changeRule ? data.obj.changeRule.toString() : '';
                refund[index].refundInfo = !!data.obj.refundRule ? data.obj.refundRule.toString() : '';
                refund[index].signInfo = !!data.obj.signTransferRule ? data.obj.signTransferRule.toString() : '';
            }
        });
    };

    var violatePolicies = function (flights, selector$) {
        var index = selector$.data('index');
        var flight = flights[index];
        if (!flight) {
            return;
        }
        var cabin = flight.cabins[0];
        if (!cabin) {
            return;
        }

        var trs = _.filter(_.map(cabin.flightData.travelPolicys, function (item) {
            if (!item.policyContent) {
                return null;
            }
            var arr = [[item.passengerName + ' 违反了如下差旅政策规定：']];
            arr = arr.concat(_.map(item.policyContent, function (str, i) {
                return [(parseInt(i) + 1) + '、' + str.violateContent];
            }));
            return [genTable(arr)];
        }));

        var template = genTable(trs);

        var placement = index == 0 ? 'bottom' : 'auto';
        selector$.tooltip(_.assign({container: '#suggestFlightModalBody', placement: placement}, {title: template, html: true}));

    };

    function initTips() {
        $('.sameViolatePolicies').each(function () {
            violatePolicies(vm.suggestFlights.sameFlts, $(this));
        });
        $('.sameRefundChanges').each(function () {
            refundChanges(vm.suggestFlights.sameFlts, $(this), vm.sameRefund);
        });

        $('.sameAirViolatePolicies').each(function () {
            violatePolicies(vm.suggestFlights.sameCodeflts, $(this));
        });
        $('.sameAirRefundChanges').each(function () {
            refundChanges(vm.suggestFlights.sameCodeflts, $(this), vm.sameAirRefund);
        });

        $('.otherViolatePolicies').each(function () {
            violatePolicies(vm.suggestFlights.otherflts, $(this));
        });
        $('.otherRefundChanges').each(function () {
            refundChanges(vm.suggestFlights.otherflts, $(this), vm.otherRefund);
        });
    }

    function initViolationPassenger(passengers, policys, violationContents) {
        var arr = [];

        _.forEach(passengers, function (passenger) {
            if (_.find(arr, {passengerId: parseInt(passenger.passengerEmployeeId)})) {
                return;
            }
            if (_.find(arr, {passengerId: passenger.passengerEmployeeId + ""})) {
                return;
            }

            var flag = false;
            _.forEach(violationContents, function (item) {
                if (item.passengerEmployeeIds.indexOf(passenger.passengerEmployeeId) >= 0) {
                    flag = true
                }
            });

            var hasReasons = _.find(window.orderData.goFlightConfirm.violationReasons, {passengerId: parseInt(passenger.passengerEmployeeId)});

            if ((flag || !!_.find(policys, {passengerId: parseInt(passenger.passengerEmployeeId)})) && !hasReasons) {
                arr.push({
                    passengerId: passenger.passengerEmployeeId,
                    passengerName: passenger.passengerName || passenger.passengerEnlishName
                });
            }
        });

        return arr;
    }

    function initPassengerViolatePolicies(selectorClass, violationPassengers, cabin, violationContents) {
        if (!cabin) {
            return;
        }

        var trs = _.filter(_.map(cabin.flightData.travelPolicys, function (item) {
            if (!item.policyContent) {
                return null;
            }
            var arr = [[item.passengerName + ' 违反了如下差旅政策规定：']];
            arr = arr.concat(_.map(item.policyContent, function (str, i) {
                return [(parseInt(i) + 1) + '、' + str.violateContent];
            }));
            return [genTable(arr)];
        }));

        var template = genTable(trs);

        $('.goViolatePolicies').tooltip(_.assign({container: '#suggestFlightViolationReasonModalBody', placement: 'bottom'}, {title: template, html: true}));
    }

    function initCheckedViolationReasons(passengers) {
        var arr = [];
        _.forEach(passengers, function (item) {
            arr.push({
                passengerId: item.passengerId,
                passengerName: item.passengerName
            });
        });
        return arr;
    }

    function initReasons(companyId) {
        $.getJSON(__ctx + '/resource/getFlightViolationReason', {corporationId: companyId}, function (data) {
            violationReasonVM.basic.violationReasons = data;
        });
    }

    function transferReasons(reasons, notes, travelPolicys) {
        var reasons = _.map(reasons, function (item, index) {
            var reason = {};
            if (!!item.violationReasonId) {
                reason = _.find(violationReasonVM.basic.violationReasons, {id: parseInt(item.violationReasonId)});
            }
            return {
                passengerId: item.passengerId,
                passengerName: item.passengerName,
                violationReason: (reason.reasonChinese || '') + notes[index].note,
                violationReasonCode: reason.code
            };
        });

        _.forEach(vm.bookPersonAndPassengers.passengers, function (item) {
            var policy = _.find(travelPolicys, {passengerId: parseInt(item.passengerEmployeeId)});
            var hasReason = _.find(window.orderData.goFlightConfirm.violationReasons, {passengerId: parseInt(item.passengerEmployeeId)});
            if (!!hasReason && !!policy) {
                reasons.push(hasReason);
            }
        });

        return reasons;
    }

    var validReason = function () {
        var flag = true;

        if (!!vm.orderData.goFlightConfirm.cabin.flightData.isViolatePolicy || tc.arr.isNotEmpty(vm.orderData.goFlightConfirm.violationContents)) {
            _.forEach(violationReasonVM.checkedViolationReasons.go, function (item) {
                if (!item.violationReasonId) {
                    flag = false;
                }
            });
        }
        return flag;
    };

    function genLowestPriceDTO(cabin, priceType, selectCabin, hourNum) {
        return {
            priceType: priceType,
            hourNum: hourNum || 0,
            flightNo: cabin.flightData.airlineCode + cabin.flightData.fltNo,
            flightCabinClass: cabin.flightData.cabinSpecailName,
            flightDiscount: cabin.flightData.discount,
            planModel: cabin.flightData.equipmentCode,
            flightBeginDate: genPlanDate(cabin.flightData.depTime, cabin.flightData.depDate),
            flightEndDate: genPlanDate(cabin.flightData.arrTime, cabin.flightData.depDate),
            flightNoTaxPrice: cabin.flightData.fare,
            flightLossAmount: parseFloat(selectCabin.flightData.fare) - parseFloat(cabin.flightData.fare)
        };
    }

    function genPlanDate(time, date) {
        return date + ' ' + time + ':00';
    }

    tc.ns('tc.flight.suggest', function (bookPersonAndPassengers, cabin) {
        vm.suggestFlights = {};
        violationReasonVM.checkedViolationReasons = {
            go: [{}],
            back: [{}]
        };
        violationReasonVM.checkedViolationReasonNotes = {
            go: [{reason: {}, note: ''}],
            back: [{reason: {}, note: ''}]
        };

        var params = {bookPersonAndPassengers: bookPersonAndPassengers, cabin: cabin};

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: __ctx + '/flights/suggest',
            data: JSON.stringify(params),
            dataType: "json",
            timeout: 60000,
            success: function (data) {
                if (!data.obj) {
                    toastr.error("订单创建失败", "", toastrConfig);
                    return;
                }
                if (tc.arr.isEmpty(data.obj.sameFlts) && tc.arr.isEmpty(data.obj.sameCodeflts) && tc.arr.isEmpty(data.obj.otherflts)) {
                    toastr.error("订单创建失败", "", toastrConfig);
                    return;
                }

                $('#suggestFlightModal').modal('show');

                vm.suggestFlights = data.obj;
                vm.bookPersonAndPassengers = bookPersonAndPassengers;

                setTimeout(initTips, 500);
            }
        })
    });
});