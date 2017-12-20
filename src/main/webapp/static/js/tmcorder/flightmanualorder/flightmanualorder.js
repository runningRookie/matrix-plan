var vm;
$(document).ready(function () {

    var localCities = [];
    var localNationalitys = [];
    var num = 1;
    var tr = $("#flight_info tr:last");
    var flightOrderDetailVOBack = {};

    var passengerAndSegments_table = $("#passengerAndSegments_div table:last");

    $('.boot_date').datetimepicker({
        minView: "hour", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd hh:ii", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });

    $('#date-birth').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });

    Vue.filter('toDate', {
        read: function (value, format) {
            if (value == '' || value == null || value == '631123200000' || value == '1990-01-01 00:00:00') {
                return '';
            }
            return moment(value).format(format);
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('toSex', {
        read: function (value, format) {
            if (value == 'm') {
                return '男';
            } else {
                return '女';
            }

        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('toitineraryType', {
        read: function (value, format) {
            if (value == '1') {
                return '因公预订';
            } else {
                return '因私预订';
            }

        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('toAuditReferenceType', {
        read: function (value, format) {
            if (value == 'b') {
                return '审批都参照预订人的审批流';
            } else if (value == 'p') {
                return '审批都参照出行人的审批流';
            } else {
                return '审批都参照选定参照人的审批流';
            }

        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('ifCanBook', {
        read: function (value, format) {
            if (value == 2 || value == 3) {
                return '当前预订人有代订权限';
            } else {
                return '当前预订人没有代订权限';
            }

        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('filterPassengerClass', {
        read: function (value, format) {
            if (value == 'a') {
                return '成人';
            } else if (value == 'c') {
                return '儿童';
            } else {
                return '婴儿';
            }

        },
        write: function (value, format) {
            return value;
        }
    });

//    Vue.filter('toNumber', {
//        read: function(value, format) {
//                if(value == '' || value ==null){
//                    return 0;
//                }else{
//                    return parseFloat(value);
//                }
//
//        },
//        write: function (value, format) {
//                return value;
//        }
//    });


    vm = new Vue({
        el: '#flightManualOrder',
        data: {
            isToCreateNewItinerary:false,
            domesticAirport:0,
            initLater: false,
            itineraryNo: bookPersonAndPassengersDTOStr.itineraryNo,
            flag: false,
            pnr: "",
            checkPnr:true,
            paymentType: "",
            defaultPaymentType: "",
            agreementCodes: [],
            flightSuppliers: [],
            selectedAuditReference: {},
            bookPersonAndPassengers: bookPersonAndPassengersDTOStr,
            selectedPassengers: [],
            flightOrderDetailVO: {
                flightOrderSegments: [
                    {
                        flightSegmentVO: {
                            flightIndex: 1,
                            startCityName: "",
                            startPort: "",
                            startPortCode: "",
                            endCityName: "",
                            endPort: "",
                            endPortCode: "",
                            planBeginDate: "",
                            planEndDate: "",
                            startTerminal: "",
                            endTerminal: "",
                            flightNo: "",
                            carrierFlightNo: "",
                            airlineCompany: "",
                            airlineCompanyCode: "",
                            planModel: "",
                            isShare: 0,
                            bags: "",
                            flightStopSites: [
                                {
                                    stopCity: ""
                                }
                            ]
                        },
                        flightSegmentInfoVO: {
                            flightIndex: 1,
                            seatCode: "",
                            seatClassCode: "",
                            seatClass: "",
                            seatNo: "",
                            flightDiscount: "",
                            meals: 0,
                            priceType: "0",
                            agreementPrice: 0,
                            agreementCode: "",
                            sameSeatClassAmount: 0,
                            dayMinimumPrice: 0,
                            timeWindowMinimumPrice: 0,
                            currentWindowOpenPrice: 0,
                            serviceCharge: 0,
                            capitalCost: 0,
                            commissionAmount: 0,
                            commissionRate: 0,
                            flightAmount: 0,
                            purchasePrice: 0,
                            flightAmountType: "",
                            fuelCost: 0,
                            passengerCardNo: "",
                            certificateType: "",
                            certificateCode: "",
                            plusPrice: 0,
                            bigCode: "",
                            businessTravelPolicy: {
                                isViolation: "0",
                                violationReason: "",
                                violationContent: ""
                            }
                        }
                    }
                ],
                flightUseTimeInfoVO: {
                    effective: "",
                    effectiveUnit: "",
                    shortestStay: "",
                    shortestStayUnit: "",
                    longestStay: "",
                    longestStayUnit: ""
                },
                responsibleGroups: []
            },
            passengerSegments: [],
            order: {
                orderMain: {
                    accountType: "c",
                    channelFrom: "1",
                    currency: "CNY"
                },
                flightOrder: {
                    flightSource: "",
                    lastOutTicketTime: ""
                }
            },
            flightRefundInfo: {
                refundText: ""
            },
            flightChangeInfo: {
                changeText: ""
            },
            flightSignInfo: {
                signText: ""
            },
            ticketSupplierId: "",
            routeType: "",
            externalOrderNo: "",
            ticketType: "1",
            officeCode: "",
            contactPersons: [
                {
                    personName: "",
                    personMobile: "",
                    personTelephone: "",
                    personEmail: ""
                }
            ],
            servicePersons: [
                {
                    servicePersonName: "小王",
                    servicePersonPhone: "123456789",
                    servicePersonEmail: "gy22422@ly.com",
                    servicePersonType: "司机",
                    servicePersonText: ""
                }
            ],
            selectedServicePerson: [],
            responsibleInfo: {
                responsibleGroupId: 0,
                responsibleGroupName: "",
                responsiblePepoleId: 0,
                responsiblePepoleName: ""
            },
            seller: {
                sellerName: "李四",
                sellerId: 1
            },
            manager: {
                managerId: 1,
                managerName: "王二麻"
            },
            innerText: "",
            outerText: "",
            totalAmount: 0,
            totalCost: 0,
            searchPassengerList: {},
            commonPassengers: {},
            isChecked: [[]],
            selectedCommonPassengers: [],
            passengerSearchCondition: {
                condition: "",
                companyId: 0
            },
            selectedSearchPassenger: [],
            outerPassenger: {
                passengerName: "",
                passengerNationality: "",
                passengerClass: "",
                certificates: [{
                    certificateType: "",
                    certificateCode: ""
                }],
                passengerBirthDate: "",
                passengerPhone: "",
                passengerText: "",
                passengerSex: "m",
                passengerType: "o"
            },
            nationalitys: [],
            passengerProtocols: [],
            flightViolationReasons: [],
            cities: [],
            startCitys: [],
            endCitys: [],
            offices: [],
            protocolsIndex: 0,
            selectedProtocols: [],
            flightSegmentIndex: 0,//航段序号
            passengerOrders: [],
            overbookingDesc: '',
            continueBook: false,//是否是继续预定
            insuranceResources: {},
            selectedInsurancePrices: [],
            insurancePassengers: [],
            passengerInsuranceResources: [],
            serviceCharge:0,
            /*下单错误类型，0：没有错误，1：已有重复预订记录，2：已预订过类似航班，3：行程已经提交*/
            orderErrorType: 0
            // servicePerson:[
            //     {
            //         servicePersonName:"",
            //         servicePersonPhone:"",
            //         servicePersonEmail:"",
            //         servicePersonType:"",
            //         SERVICE_PERSON_TEXT:"",
            //     }
            // ]
        },
        computed: {
            totalAmount: function () {
                var thisVM = this;
                // return thisVM.outerText;
                var totalAmount = 0;
                if (thisVM.passengerSegments.length > 0) {
                    for (var i = 0; i < thisVM.passengerSegments.length; i++) {
                        for (var j = 0; j < thisVM.passengerSegments[i].flightSegments.length; j++) {
                            if (thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.flightAmount != "" && thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.flightAmount != 'undefined') {
                                totalAmount = (parseFloat(totalAmount) + parseFloat(thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.flightAmount)).toFixed(2);
                            }
                            if (thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.capitalCost != "" && thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.capitalCost != 'undefined') {
                                totalAmount = (parseFloat(totalAmount) + parseFloat(thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.capitalCost)).toFixed(2);
                            }
                            if (thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.fuelCost != "" && thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.fuelCost != 'undefined') {
                                totalAmount = (parseFloat(totalAmount) + parseFloat(thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.fuelCost)).toFixed(2);
                            }
                            if (thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.serviceCharge != "" && thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.serviceCharge != 'undefined') {
                                totalAmount = (parseFloat(totalAmount) + parseFloat(thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.serviceCharge)).toFixed(2);
                            }
                            if (thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.plusPrice != "" && thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.plusPrice != 'undefined') {
                                totalAmount = (parseFloat(totalAmount) + parseFloat(thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.plusPrice)).toFixed(2);
                            }

                            if (!!thisVM.selectedInsurancePrices[i] && !!thisVM.selectedInsurancePrices[i][j]) {
                                totalAmount = (parseFloat(totalAmount) + parseFloat(thisVM.selectedInsurancePrices[i][j])).toFixed(2);
                            }
                        }
                    }
                    return totalAmount;
                } else {
                    return 0;
                }

            }
            ,
            totalCost: function () {
                var thisVM = this;
                var totalCost = 0;
                if (thisVM.passengerSegments.length > 0) {
                    for (var i = 0; i < thisVM.passengerSegments.length; i++) {
                        for (var j = 0; j < thisVM.passengerSegments[i].flightSegments.length; j++) {
                            if (thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.purchasePrice != "" && thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.purchasePrice != 'undefined') {
                                totalCost = (parseFloat(totalCost) + parseFloat(thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.purchasePrice)).toFixed(2);
                            }
                            if (thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.capitalCost != "" && thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.capitalCost != 'undefined') {
                                totalCost = (parseFloat(totalCost) + parseFloat(thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.capitalCost)).toFixed(2);
                            }
                            if (thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.fuelCost != "" && thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.fuelCost != 'undefined') {
                                totalCost = (parseFloat(totalCost) + parseFloat(thisVM.passengerSegments[i].flightSegments[j].flightSegmentInfoVO.fuelCost)).toFixed(2);
                            }
                        }
                    }
                    return totalCost;
                } else {
                    return 0;
                }
            },
            selectedInsurancePrices: function () {
                var nowDate = moment();
                var thisVM = this;
                var arr = [[]];
                _.forEach(thisVM.passengerSegments, function (item, pIndex) {
                    arr[pIndex] = [];
                    _.forEach(item.flightSegments, function (item2, index) {
                        if (!thisVM.insurancePassengers[pIndex] || !thisVM.insurancePassengers[pIndex][index]) {
                            arr[pIndex][index] = 0;
                            return;
                        }
                        var sub = thisVM.insurancePassengers[pIndex][index];
                        var total = 0;
                        if (!!sub.ruleProduceIds[0]) {
                            _.forEach(thisVM.insuranceResources,function (res) {
                                if(item.passenger.passengerEmployeeId != res.employeeId){
                                    return;
                                }
                                _.forEach(res.ruleResponse.ruleProductLists,function (product) {

                                    var isGift = ['1', '2'].indexOf(product.buyType) >= 0
                                        && (tc.insurance.startTransfer(product.presentValidStartTime) <= nowDate
                                        && nowDate <= tc.insurance.endTransfer(product.presentValidEndTime));

                                    if (isGift) {
                                        return;
                                    }

                                    if(sub.ruleProduceIds.indexOf(product.ruleProduceId)>=0){
                                        total += parseFloat(product.salePrice);
                                    }
                                })
                            })
                        }
                        arr[pIndex][index] = total;
                    })
                });
                return arr;
            }
        }
        ,
        ready: function () {
            this.initLater = true;
            $("#refence_bookperon_div").hide();
            $("#refence_passenger_div").hide();
            $("#refence_one_person_div").hide();

            // $("#flight_div").hide();
            // $("#pnr_div").hide();

            $("#parsing_pnr").attr("disabled", true);


            setTimeout(function () {
                $('.boot_date').datetimepicker({
                    minView: "hour", // 选择日期后，不会再跳转去选择时分秒
                    format: "yyyy-mm-dd hh:ii", // 选择日期后，文本框显示的日期格式
                    language: 'zh-CN', // 汉化
                    autoclose: true // 选择日期后自动关闭
                });

                $('#date-birth').datetimepicker({
                    minView: "month", // 选择日期后，不会再跳转去选择时分秒
                    format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
                    language: 'zh-CN', // 汉化
                    autoclose: true // 选择日期后自动关闭
                });
            }, 300);


            if (bookPersonAndPassengersDTOStr.bookPerson.auditReferenceType == 'b') {
                $("#refence_bookperon_div").show();
            } else if (bookPersonAndPassengersDTOStr.bookPerson.auditReferenceType == 'p') {
                $("#refence_passenger_div").show();
            } else {
                $("#refence_one_person_div").show();
                var VM = this;
                if (bookPersonAndPassengersDTOStr.itineraryNo) {
                    $.ajax({
                        url: __ctx + "/flightOrder/getAuitReferenceByItineraryNo",
                        type: "POST",
                        data: {
                            itineraryNo: bookPersonAndPassengersDTOStr.itineraryNo
                        },
                        datatype: "json",
                        // async: false,
                        error: function (data1) {
                            alert(data1);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error("行程信息获取失败！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            } else {
                                VM.selectedAuditReference.auditReferenceEmployeeId = data.obj.auditReferenceEmployeeId;
                                VM.selectedAuditReference.auditReferenceEmployeeName = data.obj.auditReferenceEmployeeName;
                                $("#refence_one_person_div").hide();
                            }
                        }
                    });
                } else {
                    $("#referencePersons").empty();
                    var firstOption = $("<option>").text(bookPersonAndPassengersDTOStr.bookPerson.bookPersonName).val(bookPersonAndPassengersDTOStr.bookPerson.bookPersonEmployeeId);
                    $("#referencePersons").append(firstOption);
                    this.selectedAuditReference.auditReferenceEmployeeId = bookPersonAndPassengersDTOStr.bookPerson.bookPersonEmployeeId;
                    this.selectedAuditReference.auditReferenceEmployeeName = bookPersonAndPassengersDTOStr.bookPerson.bookPersonName;
                    var data = bookPersonAndPassengersDTOStr.passengers;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].passengerEmployeeId != null && data[i].passengerEmployeeId != 0) {
                            if (data[i].passengerEmployeeId != bookPersonAndPassengersDTOStr.bookPerson.bookPersonEmployeeId) {
                                var option = $("<option>").text(data[i].passengerName).val(data[i].passengerEmployeeId);
                                $("#referencePersons").append(option);
                            }
                        }

                    }
                }
            }
            if (bookPersonAndPassengersDTOStr.bookPerson.bookAuthority == 1) {
                $("#passenger-to-add").hide();
            } else {
                $("#passenger-to-add").show();
            }


            var VM = this;
            $.getJSON(__ctx + '/basicinfo/airports', function (data) {
                VM.cities = data.obj;
                localCities = _.cloneDeep(data.obj);
            });


            this.getResponsibleGroups();
            this.getAllCurrencyTypes();
            this.getPaymentType();
            this.getFlightSuppliers();
            this.getAgreementCodes();
            this.getNationalitys();
            this.getAirTravelProtocols();
            this.getFlightViolationReasons();
            this.getAllServicePersons();
            this.getCorporation();
            this.getOfficeCode();

            $("#refundChangeSignInfo_button").hide();
            // if(VM.flightOrderDetailVO.flightOrderSegments.length > 1){
            //     $("#refundChangeSignInfo_button").hide();
            // }
            var contactPerson = {};
            contactPerson.personName = bookPersonAndPassengersDTOStr.bookPerson.bookPersonName;
            contactPerson.personMobile = bookPersonAndPassengersDTOStr.bookPerson.bookPersonPhone;
            contactPerson.personTelephone = bookPersonAndPassengersDTOStr.bookPerson.bookPersonTelPhone;
            contactPerson.personEmail = bookPersonAndPassengersDTOStr.bookPerson.bookPersonEmail;
            this.contactPersons.$remove(this.contactPersons[0]);
            this.contactPersons.$set(this.contactPersons.length, contactPerson);

            flightOrderDetailVOBack = _.cloneDeep(this.flightOrderDetailVO);

            initInsuranceRules(VM, window.bookPersonAndPassengersDTOStr.passengers)
        }
        ,
        methods: {
            changeCertificateSelected: function (employeeId) {
                var certi = $("#selected_passengercerti" + employeeId).val();
                $("#selected_certiNo" + employeeId).text(certi);
            }
            ,
            selectPassenger: function (index, passenger) {
                if (passenger.passengerClass != "a" && this.selectedPassengers.length == 0) {
                    toastr.error("该旅客不是成人！，请先选择一个成人旅客！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    $("input:checkbox[name='selectedPassenger']:eq(" + index + ")").attr("checked", false);
                    return;
                }
                if ($("input:checkbox[name='selectedPassenger']:eq(" + index + ")").is(":checked")) {

                    if (bookPersonAndPassengersDTOStr.bookPerson.auditReferenceType == 'p') {
                        $("input:checkbox[name='selectedPassenger']").each(function (index2, element) {
                            if (index != index2) {
                                if (passenger.passengerClass == "a") {
                                    $("input:checkbox[name='selectedPassenger']:eq(" + index2 + ")").attr("checked", false);
                                }
                            }
                        });
                        if (passenger.passengerClass == "a") {
                            this.selectedPassengers = [];
                            $(vm.passengerSegments).each(function (i, e) {
                                vm.passengerSegments.$remove(vm.passengerSegments[i]);
                            });
                        }
                    }
                    this.selectedPassengers.$set(vm.selectedPassengers.length, passenger);
                    var passengerSegment = {};
                    passengerSegment.passenger = passenger;

                    passengerSegment.flightSegments = JSON.parse(JSON.stringify(vm.flightOrderDetailVO.flightOrderSegments));
                    vm.passengerSegments.$set(vm.passengerSegments.length, passengerSegment);
                    if (vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId != passenger.passengerEmployeeId) {
                        var contactPerson = {};
                        contactPerson.personName = passenger.passengerName;
                        contactPerson.personMobile = passenger.passengerPhone;
                        contactPerson.personTelephone = '';
                        contactPerson.personEmail = passenger.passengerEmail;
                        vm.contactPersons.$set(vm.contactPersons.length, contactPerson);
                    }
                } else {
                    this.selectedPassengers.$remove(passenger);
                    var insurancePassenger = vm.insurancePassengers[index];
                    vm.insurancePassengers.$remove(insurancePassenger);
                    var passengerSegments = [];
                    $(vm.passengerSegments).each(function (i, e) {
                        if (!_.isEqual(vm.passengerSegments[i].passenger, passenger)) {
                            passengerSegments.$set(passengerSegments.length, vm.passengerSegments[i]);
                        }
                    });
                    vm.passengerSegments = passengerSegments;
                    if (vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId != passenger.passengerEmployeeId) {
                        if (vm.contactPersons.length > 1) {
                            _.forEach(vm.contactPersons,function (contactPerson) {
                                if (contactPerson.personName == passenger.passengerName && contactPerson.personMobile == passenger.passengerPhone) {
                                    vm.contactPersons.$remove(contactPerson);
                                }
                            });
                        }
                    }
                }
                vm.passengerProtocols = [];
                this.getAirTravelProtocols();
                if (this.selectedPassengers.length > 0) {
                    // for(var i = 0;i< this.selectedPassengers.length;i++){
                    //     var passengerIndex = i+2;
                    //     var newTable = passengerAndSegments_table.clone(true);
                    //     $("#passengerAndSegments_div").append(newTable);
                    //     $("#passengerAndSegments_div").children().last().children().last().children().last().children().first().text("出行人"+passengerIndex);
                    // }
                    vm.flag = true;
                } else {
                    //隐藏
                    // $("#flight_div").hide();
                    // $("#pnr_div").hide();
                    vm.flag = false;
                }
                vm.checkPnr=true;
            }
            ,
            parsePnr: function () {
                var pnr = $("#pnr").val();
                if (pnr == '') {
                    toastr.error("请先输入PNR！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                vm.pnr = pnr;

                var VM = this;

                $.ajax({
                    url: __ctx + "/flightManualOrder/parsePnr/" + pnr,
                    contentType: "application/json",
                    type: "GET",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            var passengerNames = data.obj.passengerNames;
                            if (passengerNames.length != VM.selectedPassengers.length) {
                                toastr.error("该pnr不合法!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                                return;
                            }
                            for (var i = 0; i < VM.selectedPassengers.length; i++) {
                                var index = $.inArray(VM.selectedPassengers[i].passengerName, passengerNames);
                                var index2 = $.inArray(VM.selectedPassengers[i].passengerEnlishName, passengerNames);
                                if (index == -1 && index2 == -1) {
                                    toastr.error("该pnr不合法!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                                    return;
                                }
                            }
                            VM.passengerSegments = [];
                            $("#addManualFlightButton").attr("disabled", "true");
                            VM.flightOrderDetailVO = _.cloneDeep(data.obj);
                            num = VM.flightOrderDetailVO.flightOrderSegments.length;
                            for (var i = 0; i < VM.selectedPassengers.length; i++) {
                                var passengerSegment = {};
                                passengerSegment.passenger = VM.selectedPassengers[i];
                                passengerSegment.flightSegments = VM.flightOrderDetailVO.flightOrderSegments;
                                $(passengerSegment.flightSegments).each(function (cindex, segment) {
                                    segment.flightSegmentInfoVO.serviceCharge=VM.serviceCharge;
                                })
                                VM.passengerSegments.$set(VM.passengerSegments.length, _.cloneDeep(passengerSegment));
                            }
                            if (num > 1) {
                                $("#refundChangeSignInfo_button").hide();
                            } else {
                                $("#refundChangeSignInfo_button").show();
                            }
                            VM.cities = _.cloneDeep(localCities);
                            setTimeout(function () {
                                $('.boot_date').datetimepicker({
                                    minView: "hour", // 选择日期后，不会再跳转去选择时分秒
                                    format: "yyyy-mm-dd hh:ii", // 选择日期后，文本框显示的日期格式
                                    language: 'zh-CN', // 汉化
                                    autoclose: true // 选择日期后自动关闭
                                });

                                VM.cities = _.cloneDeep(localCities);
                            }, 300);
                            toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }
                    }
                });

            }
            ,
            addManualFlight: function () {
                // var newTr = tr.clone(true);
                // $("#flight_info").append(newTr);
                // var length = $("#flight_info").children().length;
                // $("#flight_info").children().last().children().first().text("航段"+ ++num);

                // for(var i=0;i<$("#passengerAndSegments_div").children().length;i++){
                //     $("#passengerAndSegments_div").children().last().children().last().children().last().children().first().text("出行人"+passengerIndex);
                // }

                var length = vm.flightOrderDetailVO.flightOrderSegments.length;
                if (length == 2) {
                    toastr.error("航段数量已达最大上限!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                var flightOrderSegment = JSON.parse(JSON.stringify(vm.flightOrderDetailVO.flightOrderSegments[length - 1]));
                flightOrderSegment.flightSegmentVO.flightIndex = length + 1,
                    flightOrderSegment.flightSegmentInfoVO.flightIndex = length + 1,
                    vm.flightOrderDetailVO.flightOrderSegments.$set(length, _.cloneDeep(flightOrderSegment));

                $(vm.passengerSegments).each(function (i, e) {
                    vm.passengerSegments[i].flightSegments.$set(vm.passengerSegments[i].flightSegments.length, _.cloneDeep(flightOrderSegment));
                });

                if (vm.flightOrderDetailVO.flightOrderSegments.length > 1) {
                    $("#refundChangeSignInfo_button").hide();
                } else {
                    $("#refundChangeSignInfo_button").show();
                }

                setTimeout(function () {
                    $('.boot_date').datetimepicker({
                        minView: "hour", // 选择日期后，不会再跳转去选择时分秒
                        format: "yyyy-mm-dd hh:ii", // 选择日期后，文本框显示的日期格式
                        language: 'zh-CN', // 汉化
                        autoclose: true // 选择日期后自动关闭
                    });

                    vm.cities = _.cloneDeep(localCities);
                }, 300);

            }
            ,
            removeFlight: function (index, flightOrderSegment) {
                if (vm.flightOrderDetailVO.flightOrderSegments.length == 1) {
                    toastr.error("最后一个航段不可移除", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                vm.flightOrderDetailVO.flightOrderSegments.$remove(flightOrderSegment);
                $(vm.passengerSegments).each(function (i, e) {
                    vm.passengerSegments[i].flightSegments.$remove(flightOrderSegment);
                });
            }
            ,
            removePassengerFlight: function (index, index2, item) {
                if (vm.passengerSegments[index].flightSegments.length == 1) {
                    toastr.error("最后一个航段不可移除!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $(vm.passengerSegments).each(function (i, e) {
                    $(vm.passengerSegments[i].flightSegments).each(function (j, e2) {
                        if (i == index && j == index2) {
                            vm.passengerSegments[i].flightSegments.$remove(e2);
                        }
                    });
                });

                vm.insurancePassengers[index].splice(index2, 1);
            }
            ,
            addContactPerson: function () {
                if (vm.contactPersons.length >= 10) {
                    toastr.error("联系人不能超过10个!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                var length = vm.contactPersons.length;
                var contactPerson = {};
                contactPerson.personName = '';
                contactPerson.personMobile = '';
                contactPerson.personTelephone = '';
                contactPerson.personEmail = '';
                vm.contactPersons.$set(length, contactPerson);
            }
            ,
            removeContactPerson: function (index, contactPerson) {
                if (vm.contactPersons.length == 1) {
                    toastr.error("最后一个抄送人不可移除!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                vm.contactPersons.$remove(contactPerson);
            }
            ,
            selectServicePerson: function (index, servicePerson) {
                if ($("input:checkbox[name='selectedServicePerson']:eq(" + index + ")").is(":checked")) {
                    vm.selectedServicePerson.$set(vm.selectedServicePerson.length, servicePerson);
                } else {
                    vm.selectedServicePerson.$remove(servicePerson);
                }
            }
            ,
            createItineraryAndOrder: function () {

                var itineraryDTO = {};
                itineraryDTO.itineraryNo = vm.itineraryNo;
                itineraryDTO.bookPersonDTO = vm.bookPersonAndPassengers.bookPerson;
                itineraryDTO.itineraryType = vm.bookPersonAndPassengers.itineraryType;
                itineraryDTO.companyName = vm.bookPersonAndPassengers.bookPerson.bookCompanyName;
                itineraryDTO.bookPersonName = vm.bookPersonAndPassengers.bookPerson.bookPersonName;
                itineraryDTO.itineraryPassengers = _.map(vm.bookPersonAndPassengers.passengers, function (item) {
                    var newItem = _.cloneDeep(item);
                    _.unset(newItem, 'orderItemId');
                    return newItem;
                });
                itineraryDTO.responsiblePepoleId = vm.responsibleInfo.responsiblePepoleId;
                itineraryDTO.responsiblePepoleName = vm.responsibleInfo.responsiblePepoleName;
                itineraryDTO.responsibleGroupId = vm.responsibleInfo.responsibleGroupId;
                itineraryDTO.responsibleGroupName = vm.responsibleInfo.responsibleGroupName;
                itineraryDTO.continueBook = vm.continueBook;
                var flightOrderDetailDTO = {};
                var flightSegments = [];
                for (var i = 0; i < vm.flightOrderDetailVO.flightOrderSegments.length; i++) {
                    var flightSegmentDTO = vm.flightOrderDetailVO.flightOrderSegments[i].flightSegmentVO;
                    if (flightSegmentDTO.startPortCode == "" || flightSegmentDTO.startPortCode == null) {
                        toastr.error("起飞城市不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (flightSegmentDTO.startTerminal == "" || flightSegmentDTO.startTerminal == null) {
                        toastr.error("起飞航站楼不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (flightSegmentDTO.planBeginDate == "" || flightSegmentDTO.planBeginDate == null) {
                        toastr.error("起飞日期不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (flightSegmentDTO.endPortCode == "" || flightSegmentDTO.endPortCode == null) {
                        toastr.error("抵达城市不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (flightSegmentDTO.endTerminal == "" || flightSegmentDTO.endTerminal == null) {
                        toastr.error("抵达航站楼不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (flightSegmentDTO.planEndDate == "" || flightSegmentDTO.planEndDate == null) {
                        toastr.error("抵达时间不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (new Date(flightSegmentDTO.planBeginDate).getTime() >= new Date(flightSegmentDTO.planEndDate).getTime()) {
                        toastr.error("起飞时间不能等于晚于抵达时间!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (flightSegmentDTO.airlineCompanyCode == "" || flightSegmentDTO.airlineCompanyCode == null) {
                        toastr.error("航司二字码不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (flightSegmentDTO.airlineCompanyCode.length > 2) {
                        toastr.error("航司二字码不合法!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (flightSegmentDTO.flightNo == "" || flightSegmentDTO.flightNo == null) {
                        toastr.error("航班号不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (flightSegmentDTO.planModel == "" || flightSegmentDTO.planModel == null) {
                        toastr.error("机型不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    flightSegmentDTO.planBeginDate = new Date(flightSegmentDTO.planBeginDate).getTime();
                    flightSegmentDTO.planEndDate = new Date(flightSegmentDTO.planEndDate).getTime();
                    //获取起飞城市
                    var text = $('.startCityName' + i).find('option:selected').text();
                    var startNames = text.split(",");
                    flightSegmentDTO.startCityName = startNames[1];
                    //获取抵达城市
                    var text = $('.endCityName' + i).find('option:selected').text();
                    var endCityNames = text.split(",");
                    flightSegmentDTO.endCityName = endCityNames[1];
                    flightSegmentDTO.isShare = 0;
                    // _.unset(flightSegmentDTO,'id');
                    // _.unset(flightSegmentDTO,'startCityId');
                    // _.unset(flightSegmentDTO,'endCityId');
                    // _.unset(flightSegmentDTO,'carrierFlightCompany');
                    // _.unset(flightSegmentDTO,'carrierFlightCompanyCode');
                    // _.unset(flightSegmentDTO,'gmtCreate');
                    // _.unset(flightSegmentDTO,'gmtModified');
                    // _.unset(flightSegmentDTO,'operator');
                    // _.unset(flightSegmentDTO,'carrierFlightCompanyCode');
                    // _.unset(flightSegmentDTO,'carrierFlightCompanyCode');
                    flightSegments.$set(flightSegments.length, flightSegmentDTO);
                }
                if (vm.pnr == "" || vm.pnr == null) {
                    toastr.error("pnr不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }

                flightOrderDetailDTO.flightSegments = flightSegments;
                var passengerSegmentItems = [];
                for (var j = 0; j < vm.passengerSegments.length; j++) {
                    var passengerSegmentItemDTO = {};
                    var passengers = _.cloneDeep(vm.passengerSegments[j].passenger);
                    _.unset(passengers, 'orderItemId');
                    passengerSegmentItemDTO.passenger = passengers;

                    if (passengerSegmentItemDTO.passenger.passengerName == "" || passengerSegmentItemDTO.passenger.passengerName == null) {
                        toastr.error("乘客名称不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if (passengerSegmentItemDTO.passenger.passengerClass == "" || passengerSegmentItemDTO.passenger.passengerClass == null) {
                        toastr.error("乘客类型不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    var flightSegmentInfos = [];
                    for (var t = 0; t < vm.passengerSegments[j].flightSegments.length; t++) {
                        var flightSegmentInfoDTO = {};
                        flightSegmentInfoDTO = vm.passengerSegments[j].flightSegments[t].flightSegmentInfoVO;
                        if (flightSegmentInfoDTO.certificateType == "" || flightSegmentInfoDTO.certificateType == null) {
                            toastr.error("证件不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.certificateCode == "" || flightSegmentInfoDTO.certificateCode == null) {
                            toastr.error("证件号码不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.seatClassCode == "" || flightSegmentInfoDTO.seatClassCode == null) {
                            toastr.error("舱等不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.seatClassCode == '1') {
                            flightSegmentInfoDTO.seatClass = '经济舱';
                        } else if (flightSegmentInfoDTO.seatClassCode == '2') {
                            flightSegmentInfoDTO.seatClass = '超值经济舱';
                        } else if (flightSegmentInfoDTO.seatClassCode == '3') {
                            flightSegmentInfoDTO.seatClass = '公务舱';
                        } else if (flightSegmentInfoDTO.seatClassCode == '4') {
                            flightSegmentInfoDTO.seatClass = '头等舱';
                        }
                        if (flightSegmentInfoDTO.seatCode == "" || flightSegmentInfoDTO.seatCode == null) {
                            toastr.error("舱位不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.flightDiscount == "" || flightSegmentInfoDTO.flightDiscount == null) {
                            toastr.error("折扣不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.flightDiscount < 0) {
                            toastr.error("折扣不能小于0!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.priceType == "" || flightSegmentInfoDTO.priceType == null) {
                            toastr.error("价格类型不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.agreementPrice < 0) {
                            toastr.error("协议价不能小于0!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.sameSeatClassAmount == "" || flightSegmentInfoDTO.sameSeatClassAmount == null) {
                            toastr.error("基准舱位全价不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.sameSeatClassAmount < 0) {
                            toastr.error("基准舱位全价不能小于0!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.currentWindowOpenPrice == "" || flightSegmentInfoDTO.currentWindowOpenPrice == null) {
                            toastr.error("当前公布运价不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.currentWindowOpenPrice < 0) {
                            toastr.error("当前公布运价不能小于0!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            return;
                        }
                        if (flightSegmentInfoDTO.businessTravelPolicy.isViolation == '0') {
                            flightSegmentInfoDTO.businessTravelPolicy.violationReason = '';
                            flightSegmentInfoDTO.businessTravelPolicy.violationContent = '';
                        }

                        if (!!vm.insurancePassengers[j] && !!vm.insurancePassengers[j][t] && tc.arr.isNotEmpty(vm.insurancePassengers[j][t].ruleProduceIds)) {
                            if (!passengerSegmentItemDTO.passenger.passengerBirthDate && flightSegmentInfoDTO.certificateType != '身份证' && !vm.insurancePassengers[j][t].birthDate) {
                                toastr.error("请选择出生日期", "", {timeOut: 2000, positionClass: "toast-top-center"});
                                return;
                            }

                            var ruleProducts = [];
                            _.forEach(vm.insuranceResources,function (item) {
                                if(item.employeeId != passengerSegmentItemDTO.passenger.passengerEmployeeId){
                                    return;
                                }
                                _.forEach(item.ruleResponse.ruleProductLists,function (ruleProduct) {
                                    if(vm.insurancePassengers[j][t].ruleProduceIds.indexOf(ruleProduct.ruleProduceId) < 0 ){
                                        return;
                                    }
                                    ruleProducts.push(ruleProduct);
                                })
                            });

                            flightSegmentInfoDTO.cctInsuranceSave = {};
                            flightSegmentInfoDTO.cctInsuranceSave.ruleProducts = ruleProducts;
                            flightSegmentInfoDTO.cctInsuranceSave.passengerEmployeeId = passengerSegmentItemDTO.passenger.passengerEmployeeId;
                            flightSegmentInfoDTO.cctInsuranceSave.birthDate = vm.insurancePassengers[j][t].birthDate;
                            flightSegmentInfoDTO.insuranceBirthDate = vm.insurancePassengers[j][t].birthDate;
                        }

                        flightSegmentInfos.$set(flightSegmentInfos.length, flightSegmentInfoDTO);
                    }
                    passengerSegmentItemDTO.flightSegmentInfos = flightSegmentInfos;
                    passengerSegmentItemDTO.flightChangeInfoDTO = vm.flightChangeInfo;
                    passengerSegmentItemDTO.flightRefundInfoDTO = vm.flightRefundInfo;
                    passengerSegmentItemDTO.flightSignInfoDTO = vm.flightSignInfo;
                    var flightTicketDTO = {};
                    flightTicketDTO.ticketSupplierId = vm.ticketSupplierId;
                    _.forEach(vm.flightSuppliers,function (supplier) {
                        if(flightTicketDTO.ticketSupplierId == supplier.supplierCode){
                            flightTicketDTO.ticketSupplier = supplier.supplierName;
                        }
                    })
                    flightTicketDTO.externalOrderNo = vm.externalOrderNo;
                    flightTicketDTO.ticketType = vm.ticketType;
                    passengerSegmentItemDTO.flightTicketDTO = flightTicketDTO;

                    passengerSegmentItems.$set(passengerSegmentItems.length, passengerSegmentItemDTO);
                }
                flightOrderDetailDTO.passengerSegmentItems = passengerSegmentItems;
                var flightOrder = {};
                flightOrder.pnr = vm.pnr;
                flightOrder.checkPnr=vm.checkPnr;
                flightOrder.productCode = "DA1";
                flightOrder.flightSource = vm.order.flightOrder.flightSource;
                flightOrder.channelType = "6";//渠道类型，原来offline
                flightOrder.channelFrom = vm.order.orderMain.channelFrom;
                flightOrder.accountType = vm.order.orderMain.accountType;
                flightOrder.currency = vm.order.orderMain.currency;
                flightOrder.responsiblePepoleId = vm.responsibleInfo.responsiblePepoleId;
                flightOrder.responsiblePepoleName = vm.responsibleInfo.responsiblePepoleName;
                flightOrder.responsibleGroupId = vm.responsibleInfo.responsibleGroupId;
                flightOrder.responsibleGroupName = vm.responsibleInfo.responsibleGroupName;
                flightOrder.auditReferenceEmployeeId = vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId;
                flightOrder.auditReferenceEmployeeName = vm.bookPersonAndPassengers.bookPerson.bookPersonName;
                if (flightOrder.responsibleGroupId == 0 || flightOrder.responsibleGroupId == '' || flightOrder.responsibleGroupId == null) {
                    toastr.error("责任人不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (flightOrder.responsiblePepoleId == 0 || flightOrder.responsiblePepoleId == '' || flightOrder.responsiblePepoleId == null) {
                    toastr.error("责任人不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                flightOrder.paymentType = vm.paymentType;//结算方式
                flightOrder.sellerId = vm.seller.sellerId;
                flightOrder.sellerName = vm.seller.sellerName;
                flightOrder.managerId = vm.manager.managerId;
                flightOrder.managerName = vm.manager.managerName;
                if (!vm.order.flightOrder.lastOutTicketTime) {
                    toastr.error("最晚出票时间为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                flightOrder.lastOutTicketTime = new Date(vm.order.flightOrder.lastOutTicketTime).getTime();
                flightOrder.totalAmount = vm.totalAmount;
                flightOrder.totalCost = vm.totalCost;
                flightOrder.bookType = "2";
                flightOrder.outerText = vm.outerText;
                flightOrder.innerText = vm.innerText;
                //判断office
                if (!vm.officeCode) {
                    toastr.error("office不能为空，请先选择office!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                flightOrder.officeCode = vm.officeCode;
                if (vm.bookPersonAndPassengers.bookPerson.auditReferenceType == 'b') {
                    flightOrder.auditReferenceEmployeeId = vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId;
                    flightOrder.auditReferenceEmployeeName = vm.bookPersonAndPassengers.bookPerson.bookPersonName;
                    flightOrder.auditModel = "b";
                    itineraryDTO.auditModel = "b";
                    itineraryDTO.auditReferenceEmployeeId = vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId;
                    itineraryDTO.auditReferenceEmployeeName = vm.bookPersonAndPassengers.bookPerson.bookPersonName;
                } else if (vm.bookPersonAndPassengers.bookPerson.auditReferenceType == 'p') {
                    flightOrder.auditModel = "p";
                    $(vm.passengerSegments).each(function (i, e) {
                        if (vm.selectedPassengers[i].passengerEmployeeId != 0 || vm.selectedPassengers[i].passengerEmployeeId != '' || vm.selectedPassengers[i].passengerEmployeeId != null) {
                            flightOrder.auditReferenceEmployeeId = vm.selectedPassengers[i].passengerEmployeeId;
                            flightOrder.auditReferenceEmployeeName = vm.selectedPassengers[i].passengerName;
                        }
                    });

                } else {
                    flightOrder.auditModel = "r";
                    flightOrder.auditReferenceEmployeeId = vm.selectedAuditReference.auditReferenceEmployeeId;
                    flightOrder.auditReferenceEmployeeName = vm.selectedAuditReference.auditReferenceEmployeeName;
                    itineraryDTO.auditModel = "r";
                    itineraryDTO.auditReferenceEmployeeId = vm.selectedAuditReference.auditReferenceEmployeeId;
                    itineraryDTO.auditReferenceEmployeeName = vm.selectedAuditReference.auditReferenceEmployeeName;
                }

                flightOrderDetailDTO.flightOrder = flightOrder;
                flightOrderDetailDTO.routeType = vm.routeType;
                flightOrderDetailDTO.contactPersons = _.cloneDeep(vm.contactPersons);
                var flag = true;
                $(flightOrderDetailDTO.contactPersons).each(function (i, e) {
                    if (e.personName == "" || e.personName == null || e.personMobile == '' || e.personMobile == null) {
                        flag = false;
                    }
                });
                if (!flag) {
                    toastr.error("联系人姓名及手机号码不能为空!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                flightOrderDetailDTO.servicePersons = vm.selectedServicePerson;
                itineraryDTO.flightOrderDetailDTO = flightOrderDetailDTO;

                if(vm.orderErrorType === 3 && vm.isToCreateNewItinerary === true){
                    // 原行程已经提交，继续预订创建新行程
                    itineraryDTO.itineraryNo = '';// 抹除行程单号
                }

                $.ajax({
                    url: __ctx + "/flightManualOrder/createItineraryAndManualFlightOrder",
                    contentType: "application/json",
                    data: JSON.stringify(itineraryDTO),
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        if (!data.result) {
                            if (data.errorCode == "LY0521014601") {
                                toastr.error("贵司暂未开通此产品的预订服务，若有需要，请联系差旅负责人", "", toastrConfig);
                                return;
                            }
                            if (data.obj !== null) {
                                var violation = data.obj;
                                var passengers = [];
                                var orderNos = [];
                                var passengerOrders = [];
                                var orderPs = [];
                                if (violation.hasSameOrder) {
                                    orderPs = violation.sameOrderPS;
                                    vm.overbookingDesc = "已有重复预订记录";
                                    vm.orderErrorType = 1;
                                } else if (violation.hasLikenessOrder) {
                                    orderPs = violation.likenessOrderPS;
                                    vm.overbookingDesc = "已预订过类似航班";
                                    vm.orderErrorType = 2;
                                }else if(data.errorCode === 'LY0522012232'){
                                    // 不可继续预订
                                    vm.orderErrorType = 3;
                                    vm.overbookingDesc = "您当前行程已提交，继续添加，则会创建新行程";
                                    $("#repeatModal").modal('hide');
                                    $("#promptModal1").modal({
                                        show: true,
                                        backdrop: 'static'
                                    });
                                    return ;
                                }
                                for (var i = 0; i < orderPs.length; i++) {
                                    var index = $.inArray(orderPs[i].passenger.name, passengers);
                                    var passengerSegment = orderPs[i];
                                    if (index == -1) {
                                        passengers.$set(passengers.length, orderPs[i].passenger.name);
                                        var passengerOrder = {};
                                        passengerOrder.passengerName = orderPs[i].passenger.name;
                                        passengerOrder.orderNos = [];
                                        passengerOrder.orderNos.$set(passengerOrder.orderNos.length, orderPs[i].orderDTO.orderNo);
                                        passengerOrders.$set(passengerOrders.length, passengerOrder);
                                    } else {
                                        var length = passengerOrders[index].orderNos.length;
                                        passengerOrders[index].orderNos.$set(length, passengerSegment.orderDTO.orderNo);
                                    }
                                }
                                vm.passengerOrders = passengerOrders;
                                $("#repeatModal").modal({
                                    show: true,
                                    //   remote : __ctx + "/itinerary/bookpersonlist",
                                    backdrop: 'static'
                                });
                            } else {
                                toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            }
                        } else {
                            vm.itineraryNo = data.obj;
                            toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            vm.flightOrderDetailVO = _.cloneDeep(flightOrderDetailVOBack);
                            vm.passengerSegments = [];
                            // for (var i = 0; i < vm.selectedPassengers.length; i++) {
                            //     var passengerSegment = {};
                            //     passengerSegment.passenger = vm.selectedPassengers[i];
                            //     passengerSegment.flightSegments = vm.flightOrderDetailVO.flightOrderSegments;
                            //     vm.passengerSegments.$set(vm.passengerSegments.length, _.cloneDeep(passengerSegment));
                            // }
                            for (var i = 0; i < vm.selectedPassengers.length; i++) {
                                $("#passenger" + i).attr("checked", false);
                            }
                            vm.selectedPassengers = [];
                            vm.pnr = "";
                            vm.innerText = "";
                            vm.outerText = "";
                            vm.flightRefundInfo.refundText = "";
                            vm.flightChangeInfo.changeText = "";
                            vm.flightSignInfo.signText = "";
                            var contactPerson = {};
                            contactPerson.personName = bookPersonAndPassengersDTOStr.bookPerson.bookPersonName;
                            contactPerson.personMobile = bookPersonAndPassengersDTOStr.bookPerson.bookPersonPhone;
                            contactPerson.personTelephone = bookPersonAndPassengersDTOStr.bookPerson.bookPersonTelPhone;
                            contactPerson.personEmail = bookPersonAndPassengersDTOStr.bookPerson.bookPersonEmail;
                            vm.contactPersons = [];
                            vm.contactPersons.$set(vm.contactPersons.length, contactPerson);

                            for (var i = 0; i < vm.selectedServicePerson.length; i++) {
                                $("#selectedServicePerson" + i).attr("checked", false);
                            }
                            vm.selectedServicePerson = [];
                            vm.order.flightOrder.flightSource = "";
                            vm.order.flightOrder.lastOutTicketTime = "";
                            vm.order.orderMain.accountType = "c";
                            vm.order.orderMain.channelFrom = "1";
                            vm.order.orderMain.currency = "CNY";
                            //vm.flag = false;
                            setTimeout(function () {
                                $('.boot_date').datetimepicker({
                                    minView: "hour", // 选择日期后，不会再跳转去选择时分秒
                                    format: "yyyy-mm-dd hh:ii", // 选择日期后，文本框显示的日期格式
                                    language: 'zh-CN', // 汉化
                                    autoclose: true // 选择日期后自动关闭
                                });

                                $('#date-birth').datetimepicker({
                                    minView: "month", // 选择日期后，不会再跳转去选择时分秒
                                    format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
                                    language: 'zh-CN', // 汉化
                                    autoclose: true // 选择日期后自动关闭
                                });

                                vm.cities = _.cloneDeep(localCities);
                            }, 300);
                            // window.location.href =  __ctx + 'itineraryproduct/itineraryproductlist?itineraryNo=' + data.obj;//行程详情
                        }
                    }
                });


            },
            //获取公司预订产品权限
            getCorporationAuthority:function () {
                var _this = this;
                $.ajax({
                    url:__ctx + "/tmcCorporation/getCorporationAuthority?corporationId=" + _this.bookPersonAndPassengers.bookPerson.bookCompanyId,
                    contentType: "application/json",
                    datatype:"json",
                    async:false,
                    error: function(data1){
                        toastr.error(data1.message, "", toastrConfig);
                    },
                    success:function(data){
                        if (data.result && data.obj) {
                            vm.domesticAirport = data.obj.domesticAirport;
                        };
                    }
                });
            },
            createOrder:function(){
                //判定公司预订产品权限
                vm.getCorporationAuthority();
                if (vm.domesticAirport !=1) {
                    toastr.error("贵司暂未开通此产品的预订服务，若有需要，请联系差旅负责人", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                };
                if(2 ==vm.order.flightOrder.flightSource && false ==vm.checkPnr){
                    //如果是机票来源是外购的情况，并且不需要校验PNR需要提示信息
                    promptFnc("请确认是否不验证PNR", function() {
                        vm.createItineraryAndOrder();
                    });
                }else{
                    vm.createItineraryAndOrder();
                }

            }
            ,
            bookContinue: function () {
                vm.continueBook = true;
                if(vm.orderErrorType === 3){
                    vm.isToCreateNewItinerary = true;
                }else{
                    vm.isToCreateNewItinerary = false;
                }
                this.createItineraryAndOrder();
                $("#promptModal1").modal('hide');
                $("#repeatModal").modal('hide');
                vm.continueBook = false;
            }
            ,
            getResponsibleGroups: function () {
                $.ajax({
                    url: __ctx + "/resource/getResponsibleGroups",
                    //data: parms,
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        for (var i = 0; i < data.length; i++) {
                            var option = $("<option>").text(data[i].name).val(data[i].id);
                            $("#responsibleGroup").append(option);
                        }
                    }
                });
            }
            ,
            getResponsiblePepole: function () {
                vm.responsibleInfo.responsibleGroupName = $('#responsibleGroup option:selected').text();
                var responsibleGroupId = vm.responsibleInfo.responsibleGroupId;
                $("#responsiblePepole").empty();
                $.ajax({
                    url: __ctx + "/resource/getResponsiblePepoleByGroupId",
                    data: {
                        responsibleGroupId: responsibleGroupId
                    },
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        var option = $("<option>").text("--请选择--").val(0);
                        $("#responsiblePepole").append(option);
                        for (var i = 0; i < data.length; i++) {
                            var option = $("<option>").text(data[i].chineseName).val(data[i].id);
                            $("#responsiblePepole").append(option);
                        }
                    }
                });
            }
            ,
            selectResponsiblePepole: function () {
                vm.responsibleInfo.responsiblePepoleName = $('#responsiblePepole option:selected').text();
            }
            ,
            getAllCurrencyTypes: function () {
                $.ajax({
                    url: __ctx + "/resource/getAllCurrencyTypes",
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        for (var i = 0; i < data.length; i++) {
                            var option = $("<option>").text(data[i].chineseName).val(data[i].currencyTypeCode);
                            $("#currency").append(option);
                        }
                    }
                });
            }
            ,
            getPaymentType: function () {
                var employeeId = this.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId;
                var VM = this;
                $.ajax({
                    url: __ctx + "/resource/getPaymentType",
                    data: {
                        employeeId: employeeId
                    },
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        VM.paymentType = data.obj;
                        VM.defaultPaymentType = VM.paymentType;
                    }
                });
            }
            ,
            getFlightSuppliers: function () {
                var VM = this;
                $.ajax({
                    url: __ctx + "/resource/getFlightSuppliers",
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        // for(var i=0;i<data.length;i++) {
                        //       var option = $("<option>").text(data[i].supplierName).val(data[i].supplierCode);
                        //       $("#flightSuppliers").append(option);
                        //   }
                        VM.flightSuppliers = data.obj || [];
                    }
                });
            }
            ,
            getAgreementCodes: function () {
                var bookCompanyId = this.bookPersonAndPassengers.bookPerson.bookCompanyId;
                var VM = this;
                $.ajax({
                    url: __ctx + "/resource/getAirProtocolByCorporationId",
                    type: "POST",
                    data: {
                        corporationId: bookCompanyId
                    },
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        VM.agreementCodes = data;
                    }
                });
            }
            ,
            selectPassengers: function () {

                getCommonPassengers(vm.bookPersonAndPassengers.bookPerson);

                vm.searchPassengerList = {};
                vm.nationalitys = _.cloneDeep(localNationalitys);
                $("#passengerModel").modal({
                    show: true,
                    //   remote : __ctx + "/itinerary/bookpersonlist",
                    backdrop: 'static'
                });
            }
            ,
            selectCommonPassenger: function (index, index2, passenger) {
                //添加常用乘客
                if (!this.isChecked[index][index2]) {
                    vm.selectedCommonPassengers.$set(vm.selectedCommonPassengers.length, passenger);
                } else {
                    $(vm.selectedCommonPassengers).each(function (i, e) {
                        if (vm.selectedCommonPassengers[i] != null && passenger.passengerName == vm.selectedCommonPassengers[i].passengerName) {
                            vm.selectedCommonPassengers.$remove(vm.selectedCommonPassengers[i]);
                        }

                    });
                }

            }
            ,
            deleteCommonPassenger: function () {
                if (vm.selectedCommonPassengers.length > 0) {
                    var data = {};
                    var commonPassengers = [];

                    commonPassengers = vm.selectedCommonPassengers;

                    data.commonPassengers = commonPassengers;
                    data.bookPerson = vm.bookPersonAndPassengers.bookPerson;
                    var selectedBookPerson = data.bookPerson;
                    $.ajax({
                        url: __ctx + "/itinerary/deletePassenger",
                        contentType: "application/json",
                        data: JSON.stringify(data),
                        type: "POST",
                        datatype: "json",
                        error: function (data1) {
                            alert(data1);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            } else {
                                toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                getCommonPassengers(selectedBookPerson);
                            }
                        }
                    });
                }
                vm.selectedCommonPassengers = [];
            }
            ,
            searchPassengers: function () {
                vm.passengerSearchCondition.companyId = vm.bookPersonAndPassengers.bookPerson.bookCompanyId;
                getPassengers(vm.passengerSearchCondition);
            }
            ,
            changeCertificate: function (employeeId) {
                var certi = $("#passengercerti" + employeeId).val();
                $("#certiNo" + employeeId).text(certi);
            }
            ,
            changeCertificate2: function (pIndex, index, employeeId, certificates) {
                var certi = $("#passegner_passengercerti" + pIndex + index + employeeId).val();
                var certiCode = '';
                var certiTypeCode = '';
                _.forEach(certificates, function (item) {
                    if (item.certificateType == certi) {
                        certiCode = item.certificateCode;
                        certiTypeCode = item.certificateTypeId;
                    }
                });
                $(vm.passengerSegments).each(function (i, e) {
                    if (i == pIndex) {
                        $(e.flightSegments).each(function (j, segment) {
                            if (index == j) {
                                segment.flightSegmentInfoVO.certificateTypeCode = certiTypeCode;
                            }
                        })
                    }
                })
                $("#passenger_certiNo" + pIndex + index + employeeId).val(certiCode);
                $("#passenger_certiNo" + pIndex + index + employeeId).text(certiCode);
                $("#passenger_certiNo" + pIndex + index + employeeId).focus();
            }
            ,
            selectSearchPassenger: function (index, passenger) {
                //添加搜索的乘客
                if ($("input:checkbox[name='searchPassenger']:eq(" + index + ")").is(":checked")) {
                    vm.selectedSearchPassenger.$set(vm.selectedSearchPassenger.length, passenger);
                } else {
                    vm.selectedSearchPassenger.$remove(passenger);
                }

            }
            ,
            queryData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.passengerSearchCondition, pageInfo);
                }
                else {
                    this.passengerSearchCondition.page = 1;
                    this.passengerSearchCondition.size = 20;
                }
                getPassengers(this.passengerSearchCondition);
            }
            ,
            getNationalitys: function () {
                var VM = this;
                $.ajax({
                    url: __ctx + "/resource/nationalitys",
                    //data: parms,
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        VM.nationalitys = data;
                        localNationalitys = _.cloneDeep(data);
                    }
                });
            }
            ,
            setPassengers: function () {
//                vm.outerPassenger.passengerNationality = $("#nationality").val();
                if (vm.bookPersonAndPassengers.bookPerson.bookAuthority != 3 && vm.outerPassenger.passengerName != '') {
                    toastr.error("没有预订非同事的权限!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (vm.outerPassenger.passengerName != '' && vm.outerPassenger.certificates[0].certificateTypeId != '1' && (vm.outerPassenger.passengerBirthDate == null || vm.outerPassenger.passengerBirthDate == '')) {
                    toastr.error("必须填出生日期!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (vm.outerPassenger.passengerName != '' && vm.outerPassenger.certificates[0].certificateCode == '') {
                    toastr.error("必须填证件号码!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (vm.outerPassenger.passengerName != '' && vm.outerPassenger.passengerSex == '') {
                    toastr.error("必须填出行人性别!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (vm.outerPassenger.certificates[0].certificateTypeId == '1') {
                    vm.outerPassenger.certificates[0].certificateType = '身份证';
                } else if (vm.outerPassenger.certificates[0].certificateTypeId == '2') {
                    vm.outerPassenger.certificates[0].certificateType = '护照';
                } else if (vm.outerPassenger.certificates[0].certificateTypeId == '0') {
                    vm.outerPassenger.certificates[0].certificateType = '其他';
                }
                $(vm.selectedCommonPassengers).each(function (i, e) {
                    if (e.passengerEmployeeId) {
                        //精确搜索出行人
                        $.ajax({
                            url: __ctx + "/itinerary/getPassengerDetailByEmployeeId/" + e.passengerEmployeeId,
                            contentType: "application/json",
                            type: "GET",
                            datatype: "json",
                            error: function (data1) {
                                alert(data1);
                            },
                            success: function (data) {
                                if (!data.result) {
                                    toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                } else {
                                    vm.bookPersonAndPassengers.passengers.$set(vm.bookPersonAndPassengers.passengers.length, data.obj);
                                    if (vm.bookPersonAndPassengers.bookPerson.auditReferenceType == 'r' && !vm.itineraryNo) {

                                        $("#referencePersons").empty();
                                        var firstOption = $("<option>").text(vm.bookPersonAndPassengers.bookPerson.bookPersonName).val(vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId);
                                        $("#referencePersons").append(firstOption);
                                        vm.selectedAuditReference.auditReferenceEmployeeId = vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId;
                                        vm.selectedAuditReference.auditReferenceEmployeeName = vm.bookPersonAndPassengers.bookPerson.bookPersonName;
                                        var data = vm.bookPersonAndPassengers.passengers;
                                        for (var i = 0; i < data.length; i++) {
                                            if (data[i].passengerEmployeeId != null && data[i].passengerEmployeeId != 0) {
                                                if (data[i].passengerEmployeeId != vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId) {
                                                    var option = $("<option>").text(data[i].passengerName).val(data[i].passengerEmployeeId);
                                                    $("#referencePersons").append(option);
                                                }
                                            }

                                        }

                                    }

                                }
                            }
                        });
                    } else {
                        vm.bookPersonAndPassengers.passengers.$set(vm.bookPersonAndPassengers.passengers.length, _.cloneDeep(e));
                    }


                });
                $(vm.selectedSearchPassenger).each(function (i, e) {
                    //精确搜索出行人
                    $.ajax({
                        url: __ctx + "/itinerary/getPassengerDetailByEmployeeId/" + e.passengerEmployeeId,
                        contentType: "application/json",
                        type: "GET",
                        datatype: "json",
                        error: function (data1) {
                            alert(data1);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            } else {
                                vm.bookPersonAndPassengers.passengers.$set(vm.bookPersonAndPassengers.passengers.length, data.obj);

                                if (vm.bookPersonAndPassengers.bookPerson.auditReferenceType == 'r' && !vm.itineraryNo) {

                                    $("#referencePersons").empty();
                                    var firstOption = $("<option>").text(vm.bookPersonAndPassengers.bookPerson.bookPersonName).val(vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId);
                                    $("#referencePersons").append(firstOption);
                                    vm.selectedAuditReference.auditReferenceEmployeeId = vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId;
                                    vm.selectedAuditReference.auditReferenceEmployeeName = vm.bookPersonAndPassengers.bookPerson.bookPersonName;
                                    var data = vm.bookPersonAndPassengers.passengers;
                                    for (var i = 0; i < data.length; i++) {
                                        if (data[i].passengerEmployeeId != null && data[i].passengerEmployeeId != 0) {
                                            if (data[i].passengerEmployeeId != vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId) {
                                                var option = $("<option>").text(data[i].passengerName).val(data[i].passengerEmployeeId);
                                                $("#referencePersons").append(option);
                                            }
                                        }

                                    }

                                }

                            }
                        }
                    });
                });

                if (vm.outerPassenger.passengerName != "") {
                    vm.bookPersonAndPassengers.passengers.$set(vm.bookPersonAndPassengers.passengers.length, _.cloneDeep(vm.outerPassenger));
                }
                $('#passengerModel').modal('hide');

                if (vm.selectedSearchPassenger.length > 0 || vm.outerPassenger.passengerName != "") {
                    var data = {};
                    var commonPassengers = [];
                    if (vm.selectedSearchPassenger.length > 0) {
                        commonPassengers = vm.selectedSearchPassenger;
                    }

                    if (vm.outerPassenger.passengerName != "") {
                        commonPassengers.$set(commonPassengers.length, _.cloneDeep(vm.outerPassenger));
                    }

                    data.commonPassengers = commonPassengers;
                    var bookPerson = {};
                    bookPerson.bookPersonEmployeeId = vm.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId;
                    data.bookPerson = bookPerson;
                    $.ajax({
                        url: __ctx + "/itinerary/addPassenger",
                        contentType: "application/json",
                        data: JSON.stringify(data),
                        type: "POST",
                        datatype: "json",
                        error: function (data1) {
                            alert(data1);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            } else {
                                toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            }
                        }
                    });
                }

                vm.selectedSearchPassenger = [];
                vm.selectedCommonPassengers = [];
                vm.outerPassenger.passengerName = "";
                vm.outerPassenger.passengerNationality = "";
                vm.outerPassenger.passengerClass = "";
                vm.outerPassenger.passengerBirthDate = "";
                vm.outerPassenger.passengerPhone = "";
                vm.outerPassenger.passengerText = "";
                vm.outerPassenger.passengerSex = "m";
                vm.outerPassenger.passengerType = "";

                vm.outerPassenger.certificates[0].certificateType = "";
                vm.outerPassenger.certificates[0].certificateCode = "";
            }
            ,
            removePassenger: function (index, passenger) {
                if (this.bookPersonAndPassengers.passengers.length <= 1) {
                    toastr.error("乘客不能少于1个", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                var cb = 0;
                var a = 0;
                $(this.selectedPassengers).each(function (i, e) {
                    if (e.passengerClass == 'a') {
                        a++;
                    } else {
                        cb++;
                    }
                })
                if (cb > 0 && a <= 1 && passenger.passengerClass == 'a') {
                    toastr.error("儿童或者婴儿必须有一名成人携带!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                this.bookPersonAndPassengers.passengers.$remove(passenger);
                this.selectedPassengers.$remove(passenger);
                $(vm.passengerSegments).each(function (i, e) {
                	if (e.passenger == passenger) {
                        vm.passengerSegments.$remove(e);
                    }
                });
                var insurancePassenger = vm.insurancePassengers[index];
                vm.insurancePassengers.$remove(insurancePassenger);
            }
            ,
            getAirTravelProtocols: function () {
                var VM = this;
                $(this.bookPersonAndPassengers.passengers).each(function (i, e) {
                    var passengerEmployeeId = e.passengerEmployeeId;
                    if (!e.passengerEmployeeId) {
                        passengerEmployeeId = VM.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId;
                    }
                    $.ajax({
                        url: __ctx + "/resource/getAirTravelProtocolByEmployeeId",
                        data: {
                            employeeId: passengerEmployeeId
                        },
                        type: "POST",
                        datatype: "json",
                        async: false,
                        error: function (data1) {
                            alert(data1);
                        },
                        success: function (data) {
                            if (data == null) {
                                toastr.error("差旅政策获取失败！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            } else {
                                VM.passengerProtocols[i] = data;
                            }
                        }
                    });
                });
            }
            ,
            getFlightViolationReasons: function () {
                var bookCompanyId = this.bookPersonAndPassengers.bookPerson.bookCompanyId;
                var VM = this;
                $.ajax({
                    url: __ctx + "/resource/getFlightViolationReason",
                    data: {
                        corporationId: bookCompanyId
                    },
                    type: "POST",
                    datatype: "json",
                    async: false,
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        if (data == null) {
                            toastr.error("差旅违规原因获取失败！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            VM.flightViolationReasons = data;
                        }
                    }
                });
            }
            ,
            getAllServicePersons: function () {
                var passengerEmployeeIds = "";
                var num = this.bookPersonAndPassengers.passengers.length;
                $(this.bookPersonAndPassengers.passengers).each(function (i, e) {
                    if (e.passengerEmployeeId) {
                        passengerEmployeeIds += e.passengerEmployeeId;
                        if ((i + 1) != num) {
                            passengerEmployeeIds += ",";
                        }
                    }
                });

                var VM = this;
                $.ajax({
                    url: __ctx + "/flightManualOrder/getAllServicePersons",
                    data: {
                        passengerEmployeeIds: passengerEmployeeIds
                    },
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        if (data == null) {
                            toastr.error("服务人员获取失败!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            VM.servicePersons = data.obj;
                        }
                    }
                });
            }
            ,
            getCorporation: function () {
                var bookCompanyId = this.bookPersonAndPassengers.bookPerson.bookCompanyId;
                var VM = this;
                $.ajax({
                    url: __ctx + "/basicinfo/corporations/" + bookCompanyId,
                    type: "POST",
                    datatype: "json",
                    async: false,
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        if (data == null) {
                            toastr.error("销售及客户经理信息获取失败！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            VM.seller.sellerId = data.obj.corporationDetail.sellerId;
                            VM.seller.sellerName = data.obj.corporationDetail.sellerName;
                            VM.manager.managerId = data.obj.corporationDetail.managerId;
                            VM.manager.managerName = data.obj.corporationDetail.managerName;

                        }
                    }
                });
            }
            ,
            getOfficeCode: function () {
                var VM = this;
                $.ajax({
                    url: __ctx + "/resource/getTmcOffice",
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error("office号信息获取失败！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        if (data == null) {
                            toastr.error("office号信息获取失败！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            VM.offices = data;
                        }
                    }
                });
            }
            ,
            toItineraryDetail: function () {
                if (!vm.itineraryNo) {
                    toastr.error("行程不存在,请先创建一个订单!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                window.location.href = __ctx + '/itineraryproduct/itineraryproductlist?itineraryNo=' + vm.itineraryNo;//行程详情
            }
            ,
            showProtocolsModel: function (index, index2) {
                this.protocolsIndex = index;
                this.flightSegmentIndex = index2;
                $("#protocolsModal").modal({
                    show: true,
                    //   remote : __ctx + "/itinerary/bookpersonlist",
                    backdrop: 'static'
                });
            }
            ,
            selectPassengerProtocols: function (index, protocol) {
                if ($("#protocols" + index).is(":checked")) {
                    this.selectedProtocols.$set(this.selectedProtocols.length, protocol);
                } else {
                    this.selectedProtocols.$remove(protocol);
                }
            }
            ,
            setProtocolsToPassenger: function () {
                var violationContent = '';
                var VM = this;
                if (VM.selectedProtocols.length == 0) {
                    toastr.error("必须选择一项违反的差旅政策内容！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $(VM.selectedProtocols).each(function (i, e) {
                    violationContent += e;
                    if ((i + 1) != VM.selectedProtocols.length) {
                        violationContent += TRAVELPOLICY_SPLITSYMBOL;
                    }
                })
                $(VM.passengerSegments).each(function (i, passenger) {
                    if (i == VM.protocolsIndex) {
                        $(passenger.flightSegments).each(function (j, flightSegment) {
                            if (VM.flightSegmentIndex == j) {
                                flightSegment.flightSegmentInfoVO.businessTravelPolicy.violationContent = violationContent;
                            }
                        });
                    }

                });
                VM.selectedProtocols = [];
                $("input:checkbox[name='protocolsContents']").each(function (index, element) {

                    $("input:checkbox[name='protocolsContents']:eq(" + index + ")").attr("checked", false);

                });
                $('#protocolsModal').modal('hide');
            }
            ,
            queryAirBrief: function (index, item) {
                //var briefQueryDTO = {};
                var airlineCode = item.flightSegmentVO.airlineCompanyCode;
                var fltNo = item.flightSegmentVO.flightNo;
                var planBeginDate = moment(item.flightSegmentVO.planBeginDate).format('YYYY-MM-DD HH:mm:ss');
                var depDate = planBeginDate.split(' ')[0];
                var startPortCode = item.flightSegmentVO.startPortCode;
                var endPortCode = item.flightSegmentVO.endPortCode;
                if (!airlineCode) {
                    toastr.error("先填写航司二字码！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (!fltNo) {
                    toastr.error("先填写航班号！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (!depDate) {
                    toastr.error("先填写起飞时间！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (!startPortCode || !endPortCode) {
                    toastr.error("请选择出发到达城市！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $.ajax({
                    url: __ctx + "/flightManualOrder/getAirBriefs",
                    data: {
                        airlineCode: airlineCode,
                        fltNo: fltNo,
                        depDate: depDate,
                        startPort: startPortCode,
                        endPort: endPortCode
                    },
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        if (data.result && data.obj.length > 0) {
                            $("#airBrief" + index).text("有");
                        } else {
                            $("#airBrief" + index).text("无");
                        }
                    }
                });
            }
            ,
            setViolationReasonCode: function (pIndex, index) {
                var VM = this;
                $(VM.passengerSegments).each(function (i, passenger) {
                    if (i == pIndex) {
                        $(passenger.flightSegments).each(function (j, flightSegment) {
                            if (VM.flightSegmentIndex == index) {
                                var text = $('#violationReason' + pIndex + index).find('option:selected').text();
                                flightSegment.flightSegmentInfoVO.businessTravelPolicy.violationReason = text;
                            }
                        });
                    }

                });
            }
            // ,
            // getRefundChangeSignInfo:function(){
            //     if (vm.flightOrderDetailVO.flightOrderSegments.length > 1) {
            //         toastr.error("多航段请手输退改签！", "",{timeOut: 2000, positionClass: "toast-top-center"});
            //         return;
            //     }
            //     var flightRefundRequestDTO = {};
            //     flightRefundRequestDTO.airlineCode = vm.flightOrderDetailVO.flightOrderSegments[0].flightSegmentVO.airlineCompanyCode;
            //     flightRefundRequestDTO.fltNo = vm.flightOrderDetailVO.flightOrderSegments[0].flightSegmentVO.flightNo;
            //     flightRefundRequestDTO.depDate = vm.flightOrderDetailVO.flightOrderSegments[0].flightSegmentVO.planBeginDate;
            //     flightRefundRequestDTO.cabinCode = vm.passengerSegments[0].flightSegments[0].flightSegmentInfoVO.seatCode;
            //     flightRefundRequestDTO.
            // }
        }
    })

    function initInsuranceRules(thisVM, oldPassengers) {
        var ids = _.union(_.map(oldPassengers, function (item) {
            return item.passengerEmployeeId;
        }));
        var params = {
            employeeIds: ids.toString(),
            orderChannel: 6 // 手工
        };
        $.getJSON(__ctx + '/insurance/flightresources', params, function (data) {
            thisVM.insuranceResources = data.obj;
        });
    }

    var getCommonPassengers = function (parms) {
        $.ajax({
            url: __ctx + "/itinerary/getCommonPassengers",
            data: {
                employeeId: parms.bookPersonEmployeeId
            },
            type: "POST",
            datatype: "json",
            error: function (data1) {
                alert(data1);
            },
            success: function (data) {
                vm.commonPassengers = data;
                var array1 = vm.commonPassengers.data;
                for (var i = 0; i < array1.length; i++) {
                    var arry = [];
                    var arry2 = array1[i].data;
                    for (var j = 0; j < arry2.length; j++) {
                        arry.$set(j, false);
                    }
                    vm.isChecked.$set(i, arry);
                }
            }
        });

    }

    var getPassengers = function (parms) {
        $.ajax({
            url: __ctx + "/itinerary/getPassengersByCondition",
            contentType: "application/json",
            data: JSON.stringify(parms),
            type: "POST",
            datatype: "json",
            error: function (data1) {
                alert(data1);
            },
            success: function (data) {
                vm.searchPassengerList = data;
            }
        });
    }


    $(".startCityName").change(function () {

    });

    $(".endCityName").change(function () {
        var text = $(this).find('option:selected').text();
        var index = $(this).data('index');
        vm.endCitys[index] = text;
    });

    $('#referencePersons').change(function () {
        var id = $(this).val();
        var name = $(this).find("option:selected").text();

        vm.selectedAuditReference.auditReferenceEmployeeId = id;
        vm.selectedAuditReference.auditReferenceEmployeeName = name;
    });

    vm.$watch('passengerSegments', function () {
        var nowDate = moment();
        _.forEach(vm.passengerSegments, function (item, index) {
            var subSelected = [];
            var ruleProducts = _.find(vm.insuranceResources, {employeeId: item.passenger.passengerEmployeeId});
            if (!ruleProducts.ruleResponse || tc.arr.isEmpty(ruleProducts.ruleResponse.ruleProductLists)) {
                vm.passengerInsuranceResources[index] = [];
            } else {
                var subInsResources = [];
                _.forEach(ruleProducts.ruleResponse.ruleProductLists, function (product) {
                    if (product.buyType == 2 && (tc.insurance.startTransfer(product.presentValidStartTime) >= nowDate && nowDate >= tc.insurance.endTransfer(product.presentValidEndTime))) {
                        return;
                    }
                    subInsResources.push(product);
                    if (product.buyType == 4
                        || (['1', '2'].indexOf(product.buyType) >= 0 && (tc.insurance.startTransfer(product.presentValidStartTime) <= nowDate && nowDate <= tc.insurance.endTransfer(product.presentValidEndTime)))
                        || product.defaultSelected == 1) {
                        subSelected.push(product.ruleProduceId);
                    }
                });

                vm.passengerInsuranceResources[index] = _.cloneDeep(subInsResources);
            }

            _.forEach(item.flightSegments, function (sub, index2) {
                if (!vm.insurancePassengers[index]) {
                    vm.insurancePassengers.$set(index, []);
                }
                if (!!vm.insurancePassengers[index][index2]) {
                    return;
                }
                vm.insurancePassengers[index].$set(index2, {ruleProduceIds: subSelected, birthDate: ''});
            });
        });

        setTimeout(function () {

            $('.insruancesTooltip').each(function () {
                var selector$ = $(this);
                var pIndex = selector$.data('pindex');
                var index = selector$.data('insuranceindex');
                var item = vm.passengerInsuranceResources[pIndex][index];
                if (!item || !item.resourceDTO.clause) {
                    return;
                }
                var str = item.resourceDTO.clause.replace(/\|/g, "<br>");
                selector$.tooltip({container: 'body', title: str, html: true});
            });

            $('.dateBirth').datetimepicker({
                minView: "month", // 选择日期后，不会再跳转去选择时分秒
                format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
                language: 'zh-CN', // 汉化
                autoclose: true // 选择日期后自动关闭
            });
        }, 500);
    }, {deep: true});

    vm.$watch('bookPersonAndPassengers.passengers', function () {
        initInsuranceRules(vm, vm.bookPersonAndPassengers.passengers);  
    },{deep: true});
    
    vm.$watch('selectedPassengers', function () {
    	if(vm.selectedPassengers.length > 0){
    		getServiceCharge(vm);
    	}
    },{deep: true});
    
})


function getServiceCharge(vm){
        var VM = vm;
        var serviceChargeData = {companyId:VM.bookPersonAndPassengers.bookPerson.bookCompanyId,serviceType:1,policyType:2};                          
        $.getJSON(__ctx + "/servicefee/da", serviceChargeData, function (result) {
            $(VM.passengerSegments).each(function (pindex, passenger) {
            	VM.serviceCharge = result.obj.amount;
                $(passenger.flightSegments).each(function (cindex, segment) {
                    segment.flightSegmentInfoVO.serviceCharge=result.obj.amount;
                })  
            })
        });
    }

function enableButton() {
    var pnrStr = $("#pnr").val();
    if (pnrStr != '') {
        $("#parsing_pnr").attr("disabled", false);
    }

}

$('#passengerModel').on('hidden.bs.modal', function () {
    vm.passengerSearchCondition.page = 1;
    vm.passengerSearchCondition.size = 20;
})

// function removeFlight(obj){
//     $(obj).parent("td").parent("tr").remove();
// }