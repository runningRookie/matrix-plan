$(document).ready(function () {
    var currentDate = moment().format("YYYY-MM-DD");

    Vue.filter('calendarSelectClass', function (value) {
        var selected = 'time-li';
        if (resultVM.travelType === 'go' || resultVM.travelType === 'single') {
            return searchVM.params.depDate === value ? selected : '';
        }
        if (resultVM.travelType === 'back') {
            return searchVM.params.backDate === value ? selected : '';
        }
        return '';
    });


    var toastrConfig = {timeOut: 2000, positionClass: "toast-top-center"};
    var goOrderFormSelector$ = $('#goOrderForm');

    var orderBtnDescMap = {'single': '预订', 'go': '选择去程', 'back': '选择返程'};
    var takeoffTimes = ['上午06:00-11:59', '中午12:00-12:59', '下午13:00-17:59', '晚上18:00-05:59'];

    var baseUrl = __ctx + '/flights/';

    Vue.filter('orderBtnDesc', function (val) {
        return _.get(orderBtnDescMap, val);
    });

    var checkSelectedTakeoffTimes = function (selector, flight) {
        if (selector.length == 0) {
            return true;
        }
        var flag = false;
        _.forEach(selector, function (val) {
            var times = val.substring(2, val.length).split('-');
            if (times[0] == '18:00' && ((times[0] <= flight.depTime && flight.depTime <= '24:00') || ('00:00' <= flight.depTime && flight.depTime <= times[1]))) {
                flag = true;
                return false;
            }
            if (times[0] <= flight.depTime && flight.depTime <= times[1]) {
                flag = true;
                return false;
            }
        });
        return flag;
    };
    var checkSelectedAirports = function (selector, flight) {
        if (selector.length == 0) {
            return true;
        }
        return _.indexOf(selector, flight.depStationName) > -1;
    };
    var checkSelectedArrAirports = function (selector, flight) {
        if (selector.length == 0) {
            return true;
        }
        return _.indexOf(selector, flight.arrStationName) > -1;
    };
    var checkSelectedAirlines = function (selector, flight) {
        if (selector.length == 0) {
            return true;
        }
        return _.indexOf(selector, flight.airlineName) > -1;
    };
    var checkSelectedSeatLevels = function (selector, flight) {
        if (selector.length == 0) {
            return true;
        }

        var flag = false;
        _.forEach(flight.cabins, function (item) {
            if (_.indexOf(selector, item.flightData.cabinSpecailName) > -1) {
                flag = true;
                return false;
            }
        });

        return flag;
    };

    var genLeastCabinPrice = function (flight) {
        var price = 10000000;
        _.forEach(flight.cabins, function (item) {
            if (item.flightData.fare < price) {
                price = item.flightData.fare;
            }
        });
        return price;
    };

    var genHasAgreefee = function (flight) {
        var flag = false;
        _.forEach(flight.cabins, function (item) {
            if (item.flightData.isAgreeFare == 'Y') {
                flag = true;
                return false;
            }
        });
        return flag;
    };

    var goOrderConfirm = function (goFlightConfirm, travelType, backFlightConfirm) {
        goOrderFormSelector$.find('input[name=bookPersonAndPassengers]').val(JSON.stringify(window.bookPersonAndPassengers));
        goOrderFormSelector$.find('input[name=goFlightConfirm]').val(goFlightConfirm);
        goOrderFormSelector$.find('input[name=backFlightConfirm]').val(backFlightConfirm || "");
        goOrderFormSelector$.find('input[name=travelType]').val(travelType);
        goOrderFormSelector$.submit();
    };

    var genLeastHourNum = function (data) {
        var obj = null;

        _.forEach(data, function (item) {
            if (!item.airTravelProtocolDTO) {
                return;
            }
            if (item.airTravelProtocolDTO.enableRangeHour != 1) {
                return;
            }
            if (!item.airTravelProtocolDTO.allowRangeHourVar) {
                return;
            }

            if (!obj || obj.airTravelProtocolDTO.allowRangeHourVar < item.airTravelProtocolDTO.allowRangeHourVar) {
                obj = item;
            }
        });

        return obj && [obj];
    };

    var resultVM = new Vue({
        el: '#flightResultVM',
        data: {
            selectedTakeoffTimes: [],
            selectedAirports: [],
            selectedArrAirports: [],
            selectedAirlines: [],
            selectedSeatLevels: [],
            selectedComeAndGo: [],
            leastPrice: 100000,
            travelType: 'single',
            staticData: {
                allFlights: [],
                takeoffTimes: takeoffTimes,
                airports: [],
                arrAirports: [],
                airlines: [],
                seatLevels: []
            },
            refundChangeSigns: [[]],
            stoppings: [],
            calendarDays: [],
            serviceFee: 0,
            insuranceResources: [],
            selectedInsuranceResources: [],
            selectTravelType: 'single'
        },
        computed: {
            filterFlights: function () {
                var thisVM = this;
                return _.filter(_.map(thisVM.staticData.allFlights, function (flight) {
                    var item = _.cloneDeep(flight);

                    if (checkSelectedAirlines(thisVM.selectedAirlines, item)
                        && checkSelectedAirports(thisVM.selectedAirports, item)
                        && checkSelectedArrAirports(thisVM.selectedArrAirports, item)
                        && checkSelectedSeatLevels(thisVM.selectedSeatLevels, item)
                        && checkSelectedTakeoffTimes(thisVM.selectedTakeoffTimes, item)) {

                        var cabins = [];
                        _.forEach(item.cabins, function (cabin) {
                            if (tc.arr.isEmpty(thisVM.selectedSeatLevels)) {
                                cabins.push(cabin);
                            }
                            if (_.indexOf(thisVM.selectedSeatLevels, cabin.flightData.cabinSpecailName) >= 0) {
                                cabins.push(cabin);
                            }
                        });

                        item.cabins = cabins;
                        return item;
                    }
                    return null;
                }));
            },
            selectInsurancePrice: function () {
                var thisVM = this;
                return _.map(thisVM.selectedInsuranceResources, function (item) {
                    var price = 0;
                    if (!!item.flightAccidentId && !!item.flightAccidentId[0]) {
                        var insurance = _.find(thisVM.insuranceResources.flightAccidents, {id: item.flightAccidentId[0]});
                        price += parseFloat(insurance.insuranceCost || 0);
                    }
                    if (!!item.flightDelayedId && !!item.flightDelayedId[0]) {
                        var insurance = _.find(thisVM.insuranceResources.flightDelayeds, {id: item.flightDelayedId[0]});
                        price += parseFloat(insurance.insuranceCost || 0);
                    }
                    return price;
                });
            },
            backButtonValid: function () { // true - 可以点击左边按钮  , false - 不可点击左边按钮
                var thisVM = this;
                if (tc.arr.isEmpty(thisVM.calendarDays)) {
                    return false;
                }
                return currentDate !== thisVM.calendarDays[0].date;
            }
        },
        methods: {
            clearFilter: function () {
                this.selectedTakeoffTimes = [];
                this.selectedAirports = [];
                this.selectedArrAirports = [];
                this.selectedAirlines = [];
                this.selectedSeatLevels = [];
            },
            order: function (flight, cabin, isAllowBooking, pIndex, index) {
                if (undefined !== pIndex && undefined !== index) {
                    var first = resultVM.refundChangeSigns[pIndex];
                    if (!!first && !!first[index]) {
                        cabin.changeInfo = !!first[index].changeRule ? first[index].changeRule.toString() : '';
                        cabin.refundInfo = !!first[index].refundRule ? first[index].refundRule.toString() : '';
                        cabin.signInfo = !!first[index].signTransferRule ? first[index].signTransferRule.toString() : '';
                    }
                }

                var passengerHourNums = null;

                if (resultVM.travelType === 'done') {
                    goFlightConfirm();
                    return;
                }

                var flightLowestPrices = genLowestPrice(flight, cabin, passengerHourNums);
                var violationContents = genViolationContents(flightLowestPrices, cabin);
                var briefs = resultVM.stoppings[pIndex];
                var cctInsuranceSaveDTOS = _.filter(genCctInsuranceSaveDTOS(resultVM.selectedInsuranceResources, pIndex));

                goFlightConfirm(flight, cabin, briefs, passengerHourNums, null, cctInsuranceSaveDTOS);
            },
            change: function (travelType) {
                if (travelType == 'go') {
                    resultVM.selectedComeAndGo.splice(0, 1);
                    resultVM.travelType = 'go';
                    initResultVM();
                    search(searchVM.params);
                    return;
                }
                if (travelType == 'back') {
                    resultVM.selectedComeAndGo.splice(1, 1);
                    resultVM.travelType = 'back';
                    genGo();
                }
            },
            previousCalendar: function () {
                this.calendarDays = tc.flight.list.utils.calendarDays(this.calendarDays.shift().date)
            },
            afterCalendar: function () {
                this.calendarDays = tc.flight.list.utils.calendarDays(this.calendarDays.pop().date)
            },
            selectCalendar: function (date) {
                if (resultVM.travelType === 'single') {
                    searchVM.params.depDate = date;
                }
                if (resultVM.travelType === 'go') {
                    if (date > searchVM.params.backDate) {
                        toastr.error("返回日期不能早于出发日期", "", toastrConfig);
                        return;
                    }
                    searchVM.params.depDate = date;
                }
                if (resultVM.travelType === 'back') {
                    if (date < searchVM.params.depDate) {
                        toastr.error("返回日期不能早于出发日期", "", toastrConfig);
                        return;
                    }
                    searchVM.params.backDate = date;
                }
                initResultVM();
                search(searchVM.params);
            }
        }
    });

    var travelPolicyModalVM = new Vue({
        el: '#travelPolicyModalVM',
        data: {
            basic: {
                violationReasons: []
            },
            flight: {flight: {}, cabin: {flightData: {}}, briefs: []},
            violationContents: [],
            suggestFlight: [], // {flight: {}, cabin: {flightData: {}}, briefs: []}
            passengerHourNums: null,
            cctInsuranceSaveDTOS: [],
            flag: false,
            hourNum: 0,
            airTravelProtocols: null
        },
        computed: {
            violationPassengers: function () {
                var thisVM = this;
                return initViolationPassenger(window.bookPersonAndPassengers.passengers, thisVM.flight.cabin, thisVM.violationContents);
            },
            checkedViolationReasons: function () {
                var thisVM = this;
                return initCheckedViolationReasons(thisVM.violationPassengers);
            }
        },
        ready: function () {
            initReasons(window.bookPersonAndPassengers.bookPerson.bookCompanyId);
        },
        methods: {
            init: function (selectFlight, selectCabin, selectBriefs, violationContents, passengerHourNums, cctInsuranceSaveDTOS) {
                var thisVM = this;
                this.flag = false;
                this.flight = {
                    flight: _.cloneDeep(selectFlight),
                    cabin: _.cloneDeep(selectCabin),
                    briefs: _.cloneDeep(selectBriefs)
                };
                this.violationContents = violationContents;
                this.passengerHourNums = passengerHourNums;
                this.cctInsuranceSaveDTOS = _.cloneDeep(cctInsuranceSaveDTOS);

                var allFlights = _.cloneDeep(resultVM.staticData.allFlights);

                var hourNum = 0;
                if (tc.arr.isNotEmpty(this.passengerHourNums)) {
                    hourNum = this.passengerHourNums[0].airTravelProtocolDTO.allowRangeHourVar;
                }
                this.hourNum = hourNum;

                var filter = function (cabin) {
                    if (cabin.flightData.av < window.bookPersonAndPassengers.passengers.length) {
                        return true;
                    }
                    if (!cabin.flightData.allowBooking) {
                        return true;
                    }
                    return false;
                };
                var leastCabin = getTimeLeastCabin(allFlights, _.cloneDeep(selectCabin), hourNum, filter);

                this.suggestFlight = getLeastCabins(allFlights, _.cloneDeep(selectCabin), hourNum, filter, leastCabin.cabin.flightData.fare);

                _.forEach(this.suggestFlight, function (suggest, index) {
                    var params = tc.flight.list.utils.genRefundChangeParams(suggest.flight, suggest.cabin, searchVM, resultVM);
                    var url = baseUrl + (suggest.cabin.flightData.isAgreeFare === 'Y' ? 'protocolrefund' : 'flightrefund');
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
                            travelPolicyModalVM.suggestFlight[index].cabin.changeInfo = !!data.obj.changeRule ? data.obj.changeRule.toString() : '';
                            travelPolicyModalVM.suggestFlight[index].cabin.refundInfo = !!data.obj.refundRule ? data.obj.refundRule.toString() : '';
                            travelPolicyModalVM.suggestFlight[index].cabin.signInfo = !!data.obj.signTransferRule ? data.obj.signTransferRule : '';
                        }
                    });

                    var flight = suggest.flight;
                    var depDate = resultVM.travelType === 'back' ? searchVM.params.backDate : searchVM.params.depDate;
                    var params = {
                        airlineCode: flight.airlineCode,
                        fltNo: flight.fltNo,
                        depDate: depDate,
                        startPort: flight.depPortCode,
                        endPort: flight.arrPortCode
                    };
                    if (flight.isShareFlight === 'Y') {
                        params.airlineCode = flight.shareFltCode;
                        params.fltNo = flight.shareFltNo;
                    }
                    $.getJSON(baseUrl + 'stopping/', params, function (data) {
                        thisVM.flag = true;
                        travelPolicyModalVM.suggestFlight[index].briefs = data.obj;
                        setTimeout(function () {
                            tc.flight.list.utils.suggestTips(travelPolicyModalVM.suggestFlight[index].flight, data.obj, index);
                        }, 500);
                    });
                });
            },
            submit: function (suggestFlight) {
                // todo 这个版本差旅政策原因逻辑暂不更改
                // if (!validViolationReasons()) {
                //     toastr.error("请选择违反差旅政策原因", "", toastrConfig);
                //     return;
                // }
                $('#travelPolicyModalVM').hide();
                if (!!suggestFlight) {
                    this.flight = _.cloneDeep(suggestFlight);
                }
                // var violationReasons = transferReasons(this.checkedViolationReasons); todo 这个版本差旅政策原因逻辑暂不更改
                goFlightConfirm(this.flight.flight, this.flight.cabin, this.flight.briefs, this.passengerHourNums, null, this.cctInsuranceSaveDTOS);//todo 选择推荐航班后违反差旅政策怎么办
            },
            selectSuggest: function (index) {
                this.submit(this.suggestFlight[index]);
            }
        }
    });

    var genAirports = function (flights) {
        resultVM.staticData.airports = _.uniq(_.map(flights, function (item) {
            return item.depStationName;
        }));
    };
    var genArrAirports = function (flights) {
        resultVM.staticData.arrAirports = _.uniq(_.map(flights, function (item) {
            return item.arrStationName;
        }));
    };
    var genAirlines = function (flights) {
        resultVM.staticData.airlines = _.uniq(_.map(flights, function (item) {
            return item.airlineName;
        }));
    };
    var genSeatLevels = function (flights) {
        var arr = [];
        _.forEach(flights, function (flight) {
            _.forEach(flight.cabins, function (item) {
                arr.push(item.flightData.cabinSpecailName);
            });
        });
        resultVM.staticData.seatLevels = _.uniq(arr);
    };

    function initResultVM() {
        resultVM.selectedTakeoffTimes = [];
        resultVM.selectedAirports = [];
        resultVM.selectedArrAirports = [];
        resultVM.selectedAirlines = [];
        resultVM.selectedSeatLevels = [];
        resultVM.leastPrice = 100000;
        resultVM.staticData = {
            allFlights: [],
            takeoffTimes: takeoffTimes,
            airports: [],
            arrAirports: [],
            airlines: [],
            seatLevels: []
        };
    }

    var init = function () {
        tc.flight.list.utils.tips(resultVM, searchVM, baseUrl);
        tc.flight.list.utils.flightList(resultVM, searchVM, baseUrl);
        initSelectedInsuranceResources();

        $('.cabinTable').each(function () {
            $(this).find('.agreeFareDesc:first').text('协议价');
            $(this).find('.noAgreeFareDesc:first').text('商务优选');
        });
    };

    function initSelectedInsuranceResources() {
        resultVM.selectedInsuranceResources = _.map(resultVM.filterFlights, function () {
            return {flightAccidentId: [], flightDelayedId: []};
        });
    }

    var sort = function (flights) {
        return flights;
    };

    var genFilterFlag = function (name) {
        var arr = _.filter(searchVM.cities, function (city) {
            return city.cityName.indexOf(name) > -1;
        });
        return (arr.length > 1) ? 'N' : 'Y';
    };

    function search(params) {
        resultVM.calendarDays = tc.flight.list.utils.calendarDays(params.depDate);

        params = {
            depDate: params.depDate,
            depCode: params.depCode,
            depCodeFlag: genFilterFlag(params.depName),
            arrCode: params.arrCode,
            arrCodeFlag: genFilterFlag(params.arrName),
            stop: params.stop,
            shareFlight: params.shareFlight
        };
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: baseUrl + 'fastQuery',
            data: JSON.stringify(params),
            dataType: "json",
            timeout: 60000,
            success: function (data) {
                if (tc.arr.isEmpty(data.obj)) {
                    toastr.info("未查询到航班信息，请更换查询条件后重试", "", toastrConfig);
                }
                _.forEach(data.obj, function (flight) {
                    flight.leastPrice = genLeastCabinPrice(flight);
                    flight.hasAgreefee = genHasAgreefee(flight);
                    if (flight.leastPrice < resultVM.leastPrice) {
                        resultVM.leastPrice = flight.leastPrice;
                    }
                });
                resultVM.staticData.allFlights = sort(data.obj);
                genAirlines(resultVM.staticData.allFlights);
                genAirports(resultVM.staticData.allFlights);
                genSeatLevels(resultVM.staticData.allFlights);
                genArrAirports(resultVM.staticData.allFlights);
            },
            error: function () {
                toastr.error("网络出现问题，请稍后再试", "", toastrConfig);
            }
        });
    }

    var valid = function (params) {
        if (!params.depCode) {
            toastr.error("请选择出发城市", "", toastrConfig);
            return false;
        }
        if (!params.arrCode) {
            toastr.error("请选择到达城市", "", toastrConfig);
            return false;
        }
        if (!params.depDate) {
            toastr.error("请选择出发日期", "", toastrConfig);
            return false;
        }
        if (params.depCode === params.arrCode) {
            toastr.error("出发城市和到达城市不能相同", "", toastrConfig);
            return false;
        }
        if (params.travelType !== 'comeAndGo') {
            return true;
        }
        if (!params.backDate) {
            toastr.error("请选择返回日期", "", toastrConfig);
            return false;
        }
        if (new Date(params.backDate) < new Date(params.depDate)) {
            toastr.error("返回日期不能早于出发日期", "", toastrConfig);
            return false;
        }
        return true;
    };

    var searchVM = new Vue({
        el: '#flightSearchVM',
        data: {
            cities: [],
            params: {
                travelType: 'single',
                depCodeAndName: '',
                depCode: '',
                depName: '',
                arrCodeAndName: '',
                arrName: '',
                arrCode: '',
                depDate: moment().format('YYYY-MM-DD'),
                backDate: '',
                shareFlight: true,
                stop: true
            },
            flag: false
        },
        ready: function () {
            var thisVM = this;
            thisVM.flag = true;
            $.getJSON(__ctx + '/basicinfo/airports', function (data) {
                thisVM.cities = data.obj;
            });

        },
        methods: {
            search: function () {
                if (!valid(this.params)) {
                    return;
                }
                initResultVM();
                resultVM.selectedComeAndGo = [];
                resultVM.travelType = 'single';
                resultVM.selectTravelType = this.params.travelType;
                search(this.params);
                if (this.params.travelType === 'comeAndGo') {
                    resultVM.travelType = 'go';
                }
            },
            switchCity: function () {
                if (!searchVM.params.depCodeAndName || !searchVM.params.arrCodeAndName) {
                    toastr.error("请先选择出发和到达城市", "", toastrConfig);
                    return;
                }
                var dep = searchVM.params.depCodeAndName;
                searchVM.params.depCodeAndName = searchVM.params.arrCodeAndName;
                searchVM.params.arrCodeAndName = dep;
            },
            goBack: function () {
                window.history.back();
            }
        }
    });

    function genGo() {
        initResultVM();
        var params = {
            depCode: searchVM.params.arrCode,
            depName: searchVM.params.arrName,
            arrCode: searchVM.params.depCode,
            arrName: searchVM.params.depName,
            depDate: searchVM.params.backDate,
            shareFlight: searchVM.params.shareFlight,
            stop: searchVM.params.stop
        };
        search(params);
    }

    function genLowestPrice(originSelectedFlight, originSelectCabin, passengerHourNums) {
        var allFlights = _.cloneDeep(resultVM.staticData.allFlights);
        var selectFlight = _.cloneDeep(originSelectedFlight);
        var selectCabin = _.cloneDeep(originSelectCabin);
        var todayLeast = getTodayLeast(allFlights, selectCabin);
        var flightLeast = getFlightLeast(selectFlight, selectCabin);
        var timeLeast = getTimeLeast(allFlights, passengerHourNums, selectCabin);

        return _.filter([todayLeast, flightLeast, timeLeast]);
    }

    function getFlightLeast(selectFlight, selectCabin) {
        var flightLeast = {};
        _.forEach(selectFlight.cabins, function (cabin) {
            if (selectFlight.lowestFare == cabin.flightData.fare) {
                flightLeast = genLowestPriceDTO(cabin, 2, selectCabin);
                return false;
            }
        });
        return flightLeast;
    }

    function getTodayLeast(allFlights, selectCabin) {
        var todayLeast = {};
        _.forEach(allFlights, function (flight) {
            _.forEach(flight.cabins, function (cabin) {
                if (resultVM.leastPrice == cabin.flightData.fare) {
                    todayLeast = genLowestPriceDTO(cabin, 1, selectCabin);
                    return false;
                }
            });
        });
        return todayLeast;
    }

    function getTimeLeastCabin(allFlights, selectCabin, hourNum, filterFunc) {
        var leastPrice = 100000;
        var leastCabin = {};
        var before = moment(selectCabin.flightData.depTime, 'HH:mm').subtract(hourNum, 'h');
        var after = moment(selectCabin.flightData.depTime, 'HH:mm').add(hourNum, 'h');
        _.forEach(allFlights, function (flight) {
            var currentFlightDepTime = moment(flight.depTime, 'HH:mm');
            if (!hourNum || (before <= currentFlightDepTime && currentFlightDepTime <= after)) {
                _.forEach(flight.cabins, function (cabin) {
                    if (!!filterFunc && filterFunc(cabin)) {
                        return;
                    }
                    if (leastPrice > cabin.flightData.fare) {
                        leastPrice = cabin.flightData.fare;
                        leastCabin.cabin = cabin;
                        leastCabin.flight = flight;
                    }
                });
            }
        });
        return leastCabin;
    }

    function getLeastCabins(allFlights, selectCabin, hourNum, filterFunc, leastFare) {
        var leastCabin = [];
        var before = moment(selectCabin.flightData.depTime, 'HH:mm').subtract(hourNum, 'h');
        var after = moment(selectCabin.flightData.depTime, 'HH:mm').add(hourNum, 'h');
        _.forEach(allFlights, function (flight) {
            var currentFlightDepTime = moment(flight.depTime, 'HH:mm');
            if (!hourNum || (before <= currentFlightDepTime && currentFlightDepTime <= after)) {
                _.forEach(flight.cabins, function (cabin) {
                    if (!!filterFunc && filterFunc(cabin)) {
                        return;
                    }
                    if (leastFare == cabin.flightData.fare) {
                        leastCabin.push({cabin: cabin, flight: flight});
                    }
                });
            }
        });
        return leastCabin;
    }

    function getTimeLeast(allFlights, passengerHourNums, selectCabin) {
        if (!passengerHourNums) {
            return null;
        }

        var flag = false;
        _.forEach(passengerHourNums, function (item) {
            if (!item.airTravelProtocolDTO) {
                return;
            }
            if (item.airTravelProtocolDTO.enableRangeHour == 1) {
                flag = true;
            }
        });
        if (!flag) {
            return null;
        }

        var pass = passengerHourNums[0];
        var hourNum = pass.airTravelProtocolDTO.allowRangeHourVar;

        if (!hourNum) {
            return null;
        }

        var leastCabin = getTimeLeastCabin(allFlights, selectCabin, hourNum);
        var dto = genLowestPriceDTO(leastCabin.cabin, 3, selectCabin, hourNum);
        dto = _.assign(dto, {
            passengerIndex: 0,
            passengerName: ""
        });
        return dto;
    }

    function genLowestPriceDTO(cabin, priceType, selectCabin, hourNum) {
        return {
            priceType: priceType,
            hourNum: hourNum || 0,
            flightNo: cabin.flightData.airlineCode + cabin.flightData.fltNo,
            flightCabinClass: cabin.flightData.cabinSpecailName,
            flightDiscount: cabin.flightData.discount,
            planModel: cabin.flightData.equipmentCode,
            flightBeginDate: genPlanDate(cabin.flightData.depTime),
            flightEndDate: genPlanDate(cabin.flightData.arrTime),
            flightNoTaxPrice: cabin.flightData.fare,
            flightLossAmount: parseFloat(selectCabin.flightData.fare) - parseFloat(cabin.flightData.fare)
        };
    }

    function genPlanDate(time) {
        var date = searchVM.params.depDate;
        if (resultVM.travelType === 'back') {
            date = searchVM.params.backDate;
        }
        return date + ' ' + time + ':00';
    }

    resultVM.$watch('filterFlights', function (val) {
        if (val.length > 0) {
            setTimeout(init, 300);
        }
    });

    resultVM.$watch('selectedTakeoffTimes', function (val) {
        if (val.length == 0) {
            $('.dropdown-menu').find('.checked').removeClass('checked');
        }
    });

    searchVM.$watch('params.depCodeAndName', function (val) {
        var arr = val.split(',');
        searchVM.params.depCode = arr[0];
        searchVM.params.depName = arr[1];
    });

    searchVM.$watch('params.arrCodeAndName', function (val) {
        var arr = val.split(',');
        searchVM.params.arrCode = arr[0];
        searchVM.params.arrName = arr[1];
    });

    var datePickerConfig = {
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true, // 选择日期后自动关闭
        todayBtn: true,
        startDate: new Date()
    };
    $('.flightDatePicker').datetimepicker(datePickerConfig);


    function genViolationContents(flightLowestPrices, selectCabin) {
        var str = '';
        _.forEach(flightLowestPrices, function (item) {
            if (item.priceType != 3) {
                return;
            }
            if (item.flightNoTaxPrice != selectCabin.flightData.fare) {
                str = '预订所选航班前后' + item.hourNum + '小时内最低价格的机票';
            }
        });

        if (!str || tc.arr.isEmpty(travelPolicyModalVM.airTravelProtocols)) {
            return [];
        }

        var ids = [];
        _.forEach(travelPolicyModalVM.airTravelProtocols, function (item) {
            if (!item.airTravelProtocolDTO) {
                return;
            }
            if (item.airTravelProtocolDTO.enableRangeHour != 1) {
                return;
            }
            if (!item.airTravelProtocolDTO.allowRangeHourVar) {
                return
            }
            ids.push(item.employeeId);
        });

        return [{content: str, passengerEmployeeIds: ids}];
    }

    function goFlightConfirm(flight, cabin, briefs, passengerHourNums, violationReasons, cctInsuranceSaveDTOS) {
        if (resultVM.travelType === 'done') {
            var go = resultVM.selectedComeAndGo[0];
            var back = resultVM.selectedComeAndGo[1];
            goOrderConfirm(JSON.stringify({
                flight: go.flight,
                cabin: go.cabin,
                date: go.params.depDate,
                depCityName: searchVM.params.depName,
                depCityCode: searchVM.params.depCode,
                arrCityName: searchVM.params.arrName,
                arrCityCode: searchVM.params.arrCode,
                dayMinimumPrice: go.leastPrice,
                briefs: go.briefs,
                flightLowestPrices: go.flightLowestPrices,
                violationContents: go.violationContents,
                violationReasons: go.violationReasons,
                cctInsuranceSaveDTOS: go.cctInsuranceSaveDTOS
            }), searchVM.params.travelType, JSON.stringify({
                flight: back.flight,
                cabin: back.cabin,
                date: back.params.depDate,
                depCityName: searchVM.params.arrName,
                depCityCode: searchVM.params.arrCode,
                arrCityName: searchVM.params.depName,
                arrCityCode: searchVM.params.depCode,
                dayMinimumPrice: back.leastPrice,
                briefs: back.briefs,
                flightLowestPrices: back.flightLowestPrices,
                violationContents: back.violationContents,
                violationReasons: back.violationReasons,
                cctInsuranceSaveDTOS: back.cctInsuranceSaveDTOS
            }));
            return;
        }

        var flightLowestPrices = genLowestPrice(flight, cabin, passengerHourNums);
        var violationContents = genViolationContents(flightLowestPrices, cabin);
        if (resultVM.travelType === 'single') {
            goOrderConfirm(JSON.stringify({
                flight: flight,
                cabin: cabin,
                date: searchVM.params.depDate,
                depCityName: searchVM.params.depName,
                depCityCode: searchVM.params.depCode,
                arrCityName: searchVM.params.arrName,
                arrCityCode: searchVM.params.arrCode,
                dayMinimumPrice: resultVM.leastPrice,
                briefs: briefs,
                flightLowestPrices: flightLowestPrices,
                violationContents: violationContents,
                violationReasons: violationReasons,
                cctInsuranceSaveDTOS: cctInsuranceSaveDTOS
            }), searchVM.params.travelType);
            return;
        }
        if (resultVM.travelType === 'go') {
            resultVM.selectedComeAndGo.unshift({
                flight: _.cloneDeep(flight),
                cabin: _.cloneDeep(cabin),
                params: _.cloneDeep(searchVM.params),
                travelType: 'go',
                leastPrice: resultVM.leastPrice,
                briefs: briefs,
                flightLowestPrices: flightLowestPrices,
                violationContents: violationContents,
                violationReasons: violationReasons,
                cctInsuranceSaveDTOS: cctInsuranceSaveDTOS
            });
            if (!!resultVM.selectedComeAndGo[1]) {
                resultVM.travelType = 'done';
                return;
            }
            resultVM.travelType = 'back';
            genGo();
            return;
        }
        if (resultVM.travelType === 'back') {
            resultVM.selectedComeAndGo.push({
                flight: _.cloneDeep(flight),
                cabin: _.cloneDeep(cabin),
                params: {
                    depName: searchVM.params.arrName,
                    arrName: searchVM.params.depName,
                    depDate: searchVM.params.backDate
                },
                travelType: 'back',
                leastPrice: resultVM.leastPrice,
                briefs: briefs,
                flightLowestPrices: flightLowestPrices,
                violationContents: violationContents,
                violationReasons: violationReasons,
                cctInsuranceSaveDTOS: cctInsuranceSaveDTOS
            });
            resultVM.travelType = 'done';
        }
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

    function initViolationPassenger(passengers, cabin, violationContents) {
        var arr = [];
        if (!cabin || !cabin.flightData) {
            return arr;
        }
        var policys = cabin.flightData.travelPolicys;
        if (tc.arr.isEmpty(violationContents) && tc.arr.isEmpty(policys)) {
            return arr;
        }
        _.forEach(passengers, function (passenger) {
            if (tc.arr.isNotEmpty(violationContents)) {
                arr.push({
                    passengerId: passenger.passengerEmployeeId,
                    passengerName: passenger.passengerName
                });
                return;
            }
            _.forEach(policys, function (item) {
                if (item.passengerId == passenger.passengerEmployeeId && tc.arr.isNotEmpty(item.policyContents)) {
                    arr.push({
                        passengerId: item.passengerId,
                        passengerName: item.passengerName
                    });
                }
            });
        });
        return arr;
    }

    function initReasons(companyId) {
        $.getJSON(__ctx + '/resource/getFlightViolationReason', {corporationId: companyId}, function (data) {
            travelPolicyModalVM.basic.violationReasons = data;
        });
    }

    function validViolationReasons() {
        var flag = true;
        _.forEach(travelPolicyModalVM.checkedViolationReasons, function (item) {
            if (!item.violationReasonAndCode) {
                flag = false;
            }
        });
        return flag;
    }

    function transferReasons(reasons) {
        return _.map(reasons, function (item) {
            var arr = ["", ""];
            if (!!item.violationReasonAndCode) {
                arr = item.violationReasonAndCode.split(',');
            }
            return {
                passengerId: item.passengerId,
                passengerName: item.passengerName,
                violationReason: arr[0],
                violationReasonCode: arr[1]
            };
        });
    }

    function genCctInsuranceSaveDTOS(selectedInsuranceResources, index) {
        if (tc.arr.isEmpty(selectedInsuranceResources)) {
            return [];
        }
        var item = selectedInsuranceResources[index];
        if (!item) {
            return [];
        }
        var flightAccident = null;
        var flightDelayed = null;
        if (!!item.flightAccidentId && item.flightAccidentId.length > 0) {
            flightAccident = _.find(resultVM.insuranceResources.flightAccidents, {id: item.flightAccidentId[0]});
        }
        if (!!item.flightDelayedId && item.flightDelayedId.length > 0) {
            flightDelayed = _.find(resultVM.insuranceResources.flightDelayeds, {id: item.flightDelayedId[0]});
        }

        if (!flightDelayed && !flightAccident) {
            return [];
        }

        return _.map(window.bookPersonAndPassengers.passengers, function (item) {
            return {
                passengerEmployeeId: item.passengerEmployeeId,
                flightAccident: flightAccident,
                flightDelayed: flightDelayed
            };
        });
    }
});
