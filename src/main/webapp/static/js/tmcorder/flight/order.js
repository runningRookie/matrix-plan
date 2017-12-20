$(document).ready(function () {

    var defaultConfig = {container: 'body'};

    Vue.filter('timeTransfer', function (val) {
        return (val < '12:00' ? '上午' : '下午') + ' ' + val;
    });

    var findCer = function (passenger, selectedCerId) {
        return _.find(passenger.certificates, {certificateType: selectedCerId})
    };

    var calPrice = function (confirm, serviceCharge, passengers, insuranceAllCost) {
        if (!confirm.cabin) {
            return 0;
        }
        var fare = parseFloat(confirm.cabin.flightData.fare || 0);
        var departureTax = parseFloat(confirm.cabin.flightData.departureTax || 0);
        var fule = parseFloat(confirm.cabin.flightData.fule || 0);
        serviceCharge = parseFloat(serviceCharge || 0);
        insuranceAllCost = parseFloat(insuranceAllCost || 0);
        return ((fare + departureTax + fule + serviceCharge) * passengers.length + insuranceAllCost).toFixed(2);
    };

    var validReason = function (data) {
        var flag = true;

        if (!!window.goFlightConfirm.cabin.flightData.isViolatePolicy || tc.arr.isNotEmpty(window.goFlightConfirm.violationContents)) {
            _.forEach(vm.checkedViolationReasons.go, function (item) {
                if (!item.violationReasonId) {
                    flag = false;
                }
            });
        }
        if (!!window.backFlightConfirm.cabin && (!!window.backFlightConfirm.cabin.flightData.isViolatePolicy || tc.arr.isNotEmpty(window.backFlightConfirm.violationContents))) {
            _.forEach(vm.checkedViolationReasons.back, function (item) {
                if (!item.violationReasonId) {
                    flag = false;
                }
            });
        }
        return flag;
    };

    var valid = function (data) {
        if (data.bookPersonAndPassengers.bookPerson.auditReferenceType == 'r' && !data.bookPersonAndPassengers.itineraryNo) {
            if (!data.auditReference.goId || !getAuditReference(data.basic.auditReferences, data.auditReference.goId).auditReferenceEmployeeId) {
                toastr.error("请选择参照人", "", toastrConfig);
                return false;
            }
            if (!!window.backFlightConfirm.cabin && !data.auditReference.goId) {
                toastr.error("请选择参照人", "", toastrConfig);
                return false;
            }
        }
        if (!data.responsibleGroup || !data.responsiblePeople) {
            toastr.error("请选择责任组和责任人", "", toastrConfig);
            return false;
        }
        if (!validReason(data)) {
            toastr.error("请选择违反差旅政策的原因", "", toastrConfig);
            return false;
        }
        if (!data.innerText || !data.outerText) {
            toastr.error("请输入内部备注和外部备注", "", toastrConfig);
            return false;
        }
        return true;
    };

    var initCheckedViolationReasons = function (passengers) {
        var arr = [];
        _.forEach(passengers, function (item) {
            arr.push({
                passengerId: item.passengerId,
                passengerName: item.passengerName
            });
        });
        return arr;
    };

    var initViolationPassenger = function (passengers, policys, violationContents) {
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

            if (flag || !!_.find(policys, {passengerId: parseInt(passenger.passengerEmployeeId)})) {
                arr.push({
                    passengerId: passenger.passengerEmployeeId,
                    passengerName: passenger.passengerName || passenger.passengerEnlishName
                });
            }
        });

        return arr;
    };

    var genAuditReferences = function (vm) {
        var flag = true;
        _.forEach(vm.bookPersonAndPassengers.passengers, function (item) {
            if (item.passengerEmployeeId == window.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId) {
                flag = false;
            }
        });

        var items = [];
        if (flag) {
            var bookPerson = window.bookPersonAndPassengers.bookPerson;
            items.push({
                employeeId: parseInt(bookPerson.bookPersonEmployeeId),
                employeeName: bookPerson.bookPersonName || bookPerson.bookPersonEnlishName || bookPerson.bookPersonNickname
            });
        }
        items = items.concat(_.filter(_.map(vm.bookPersonAndPassengers.passengers, function (item) {
            if (item.passengerEmployeeId == 0) {
                return null;
            }
            if (item.passengerType == 'o') {
                return null;
            }
            return {
                employeeId: parseInt(item.passengerEmployeeId),
                employeeName: item.passengerName || item.passengerEnlishName || item.passengerNickname
            };
        })));
        return items;
    };

    function getAuditReference(references, id, name) {
        if (!!id && !!name) {
            return {
                auditReferenceEmployeeId: id,
                auditReferenceEmployeeName: name
            };
        }
        var type = window.bookPersonAndPassengers.bookPerson.auditReferenceType;
        if (type != 'r') {
            return {};
        }
        var item = _.find(references, {employeeId: parseInt(id)});
        if (!item) {
            return {};
        }
        return {
            auditReferenceEmployeeId: item.employeeId,
            auditReferenceEmployeeName: item.employeeName
        };
    }

    var repeatVM = new Vue({
        el: '#repeatModal',
        data: {
            passengerOrders: [],
            orderData: {},
            overbookingDesc: '',
            /*下单错误类型，0：没有错误，1：已有重复预订记录，2：已预订过类似航班，3：行程已经提交*/
            orderErrorType: 0
        },
        methods: {
            bookContinue: function () {
                $('#repeatModal').modal({
                    show: false,
                    backdrop: 'static'
                });
                var params = _.cloneDeep(this.orderData);
                params.flag = 2;

                // 行程已经提交，继续预订
                if(repeatVM.orderErrorType === 3){
                    params.bookPersonAndPassengers.itineraryNo = '';// 抹除行程单号
                }
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + '/flights/order',
                    data: JSON.stringify(params),
                    dataType: "json",
                    timeout: 60000,
                    success: function (data) {
                        if (!data.result && data.errorCode == "LY0521014601") {
                            toastr.error("贵司暂未开通此产品的预订服务，若有需要，请联系差旅负责人", "", toastrConfig);
                            return;
                        }
                        if(data.errorCode === 'LY0522012232'){
                            // 行程已经提交
                            repeatVM.orderErrorType = 3;
                            repeatVM.overbookingDesc = "您当前行程已提交，继续添加，则会创建新行程";
                            //
                            $("#repeatModal").modal({
                                show: true,
                                backdrop: 'static'
                            });
                            return ;
                        }
                        if (!data.result) {
                            suggestFlights(data);
                            return;
                        }
                        toastr.success("订单创建成功, 马上跳转到行程详情页", "", toastrConfig);
                        location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo=" + data.obj;
                    },
                    error: function () {
                        toastr.error("网络出现问题，请稍后再试", "", toastrConfig);
                    }
                });
            }
        }
    });

    var vm = new Vue({
        el: '#flightConfirmVM',
        data: {
            bookPersonAndPassengers: window.bookPersonAndPassengers,
            ccPersons: [],
            selectedCerIds: [],
            selectedNames: [],
            contactPersons: [],
            settlementType: '',
            defaultSettlementType: '',
            clubCards: [{}],
            totalPrice: {go: '', back: ''},
            serviceGroups: [],
            servicePeoples: [],
            responsibleGroup: '',
            responsiblePeople: '',
            sellerId: '',
            sellerName: '',
            managerId: '',
            managerName: '',
            selectedServicePersons: [],
            goServiceFee: '',
            backServiceFee: '',
            basic: {
                violationReasons: [],
                auditReferences: [],
                insuranceResources: {}
            },
            checkedViolationReasons: {
                go: [{}],
                back: [{}]
            },
            checkedViolationReasonNotes: {
                go: [{reason: {}, note: ''}],
                back: [{reason: {}, note: ''}]
            },
            auditReference: {goId: ''},
            innerText: '',
            outerText: '',
            selectedInsuranceResources: {
                go: [{ruleProduceIds: []}],
                back: [{ruleProduceIds: []}]
            },
            violationPassengers: {go: [{}], back: [{}]},
            insuranceResources: {
                goTotalPrice: '',
                backTotalPrice: ''
            },
            insurancePassengers: [],
            passengerInsuranceResources: [],
            domesticAirport: 0 //国内机票预订权限
        },
        computed: {
            cerNum: function () {
                var thisVM = this;
                return _.map(thisVM.bookPersonAndPassengers.passengers, function (item, index) {
                    var cer = findCer(item, thisVM.selectedCerIds[index]);
                    return cer && cer.certificateCode;
                });
            },
            totalPrice: function () {
                var thisVM = this;
                var go = calPrice(window.goFlightConfirm, thisVM.goServiceFee, thisVM.bookPersonAndPassengers.passengers, thisVM.insuranceResources.goTotalPrice);
                var back = calPrice(window.backFlightConfirm, thisVM.backServiceFee, thisVM.bookPersonAndPassengers.passengers, thisVM.insuranceResources.backTotalPrice);
                return {go: go, back: back};
            },
            violationPassengers: function () {
                var thisVM = this;
                var go = initViolationPassenger(thisVM.bookPersonAndPassengers.passengers, window.goFlightConfirm.cabin && window.goFlightConfirm.cabin.flightData.travelPolicys, window.goFlightConfirm.violationContents);
                var back = initViolationPassenger(thisVM.bookPersonAndPassengers.passengers, window.backFlightConfirm.cabin && window.backFlightConfirm.cabin.flightData.travelPolicys, window.backFlightConfirm.violationContents);

                setTimeout(function () {
                    initPassengerViolatePolicies('goViolatePolicies', go, window.goFlightConfirm.cabin, window.goFlightConfirm.violationContents);
                    initPassengerViolatePolicies('backViolatePolicies', back, window.backFlightConfirm.cabin, window.backFlightConfirm.violationContents);
                }, 500);

                return {go: go, back: back};
            },
            checkedViolationReasons: function () {
                var thisVM = this;
                var go = initCheckedViolationReasons(thisVM.violationPassengers.go);
                var back = initCheckedViolationReasons(thisVM.violationPassengers.back);
                return {go: go, back: back};
            },
            insuranceResources: function () {
                var thisVM = this;
                return {
                    goTotalPrice: genTotalInsurancePrice(thisVM.selectedInsuranceResources.go),
                    backTotalPrice: genTotalInsurancePrice(thisVM.selectedInsuranceResources.back)
                };
            },
            insuranceCer: function () {
                var thisVM = this;
                return _.map(thisVM.insurancePassengers, function (item, index) {
                    var cer = findCer(item, thisVM.selectedCerIds[index]);
                    return cer && cer.certificateType;
                });
            }
        },
        ready: function () {
            var thisVM = this;
            var bookPerson = thisVM.bookPersonAndPassengers.bookPerson;
            _.forEach(thisVM.bookPersonAndPassengers.passengers, function (item, index) {
                thisVM.selectedCerIds.$set(index, item.certificates[0].certificateType);
                thisVM.selectedNames.$set(index, item.passengerName || item.englishFirstName + '/' + item.englishLastName);
            });
            thisVM.contactPersons = [{
                personName: bookPerson.bookPersonName || bookPerson.bookPersonEnlishName || bookPerson.bookPersonNickname,
                personTelephone: bookPerson.bookPersonTelPhone,
                personMobile: bookPerson.bookPersonPhone,
                personEmail: bookPerson.bookPersonEmail
            }];
            _.forEach(thisVM.bookPersonAndPassengers.passengers, function (item, index) {
                if (bookPerson.bookPersonEmployeeId != item.passengerEmployeeId) {
	                thisVM.contactPersons.push({
	                    personName: item.passengerName || item.englishFirstName + '/' + item.englishLastName,
	                    //personTelephone: item.passengerPhone,
	                    personMobile: item.passengerPhone,
	                    personEmail: item.passengerEmail
	                });
                }
            });


            thisVM.basic.auditReferences = genAuditReferences(thisVM);

            $.getJSON(__ctx + '/resource/getResponsibleGroups', function (data) {
                thisVM.serviceGroups = data;

                $.getJSON(__ctx + '/resource/employee/servicegroups', function (data) {
                    if (tc.arr.isNotEmpty(data.obj.serviceGroups)) {
                        var groupId = data.obj.serviceGroups[0].id;
                        var employeeId = data.obj.currentUserEmployeeId;

                        var group = _.find(thisVM.serviceGroups, {id: parseInt(groupId)});

                        if (!group) {
                            return;
                        }
                        thisVM.responsibleGroup = group.id + ',' + group.name;
                        getResponsiblePepoleByGroupId(thisVM, group.id, function (peoples) {
                            var people = _.find(peoples, {id: parseInt(employeeId)});
                            if (!people) {
                                return;
                            }
                            thisVM.responsiblePeople = people.id + ',' + people.chineseName;
                        });
                    }
                });
            });

            $.getJSON(__ctx + '/basicinfo/corporations/' + bookPerson.bookCompanyId, function (data) {
                thisVM.sellerId = data.obj.corporationDetail.sellerId;
                thisVM.sellerName = data.obj.corporationDetail.sellerName;
                thisVM.managerId = data.obj.corporationDetail.managerId;
                thisVM.managerName = data.obj.corporationDetail.managerName;
            });

            $.getJSON(__ctx + '/servicefee/da', {
                serviceType: 1,
                companyId: bookPerson.bookCompanyId,
                policyType: window.goFlightConfirm.cabin.flightData.policyType
            }, function (data) {
                thisVM.goServiceFee = (data.obj && data.obj.amount) || 0;
            });

            if (!!window.backFlightConfirm.cabin) {
                $.getJSON(__ctx + '/servicefee/da', {
                    serviceType: 1,
                    companyId: bookPerson.bookCompanyId,
                    policyType: window.backFlightConfirm.cabin.flightData.policyType
                }, function (data) {
                    thisVM.backServiceFee = (data.obj && data.obj.amount) || 0;
                });
            }

            initReasons(bookPerson.bookCompanyId);

            $.getJSON(__ctx + '/resource/getPaymentType', {employeeId: bookPerson.bookPersonEmployeeId}, function (data) {
                thisVM.settlementType = data.obj;
                thisVM.defaultSettlementType = data.obj;
            });

            if (!!thisVM.bookPersonAndPassengers.itineraryNo) {
                $.getJSON(__ctx + '/serachitinerary/auditreference', {itineraryNo: thisVM.bookPersonAndPassengers.itineraryNo}, function (data) {
                    thisVM.auditReference.goId = data.obj.employeeId;
                    thisVM.auditReference.goName = data.obj.employeeName;
                });
            }

            initInsuranceRules(thisVM, window.bookPersonAndPassengers.passengers);

            initCCPersons(thisVM);
        },
        methods: {
            //获取公司预订产品权限
            getCorporationAuthority:function () {
                var _this = this;
                $.ajax({
                    url:__ctx + "/tmcCorporation/getCorporationAuthority?corporationId=" + _this.bookPersonAndPassengers.bookPerson.bookCompanyId,
                    contentType: "application/json",
                    datatype:"json",
                    async:false,
                    error: function(data1){
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success:function(data){
                        if (data.result && data.obj) {
                            _this.domesticAirport = data.obj.domesticAirport;
                        };
                    }
                });
            },
            delPassenger: function (index) {
                if (this.bookPersonAndPassengers.passengers.length <= 1) {
                    toastr.error("乘客不得少于1个", "", toastrConfig);
                    return;
                }

                var passenger = _.cloneDeep(this.bookPersonAndPassengers.passengers[index]);
                var i = _.findIndex(vm.insurancePassengers, passenger);
                if (i > -1) {
                    vm.insurancePassengers.splice(i, 1);
                    vm.passengerInsuranceResources.splice(i, 1);
                    vm.selectedInsuranceResources.go.splice(i, 1);
                    vm.selectedInsuranceResources.back.splice(i, 1);
                }

                this.bookPersonAndPassengers.passengers.splice(index, 1);

                this.selectedCerIds.splice(index, 1);
                this.selectedNames.splice(index, 1);

                initReasons(this.bookPersonAndPassengers.bookPerson.bookCompanyId);

                this.basic.auditReferences = genAuditReferences(this);
            },
            addContactPersons: function () {
                if (this.contactPersons.length >= 10) {
                    toastr.error("联系人不能超过10个", "", toastrConfig);
                    return;
                }
                this.contactPersons.push({});
            },
            delContactPersons: function (index) {
                if (this.contactPersons.length <= 1) {
                    toastr.error("联系人不能少于1个", "", toastrConfig);
                    return;
                }
                this.contactPersons.splice(index, 1);
            },
            order: function () {
                var _this = this;
                _this.getCorporationAuthority()
                if (_this.domesticAirport != 1) {
                    $('body').animate({scrollTop: $('#tctipshead').offset().top}, 100);
                    toastr.error("贵司暂未开通此产品的预订服务，若有需要，请联系差旅负责人", "", toastrConfig);
                    return;
                }
                if (!$('#orderForm').valid()) {
                    $('body').animate({scrollTop: $('#tctipshead').offset().top}, 100);
                    toastr.error("请输入合法的数据", "", toastrConfig);
                    return;
                }
                var data = _.cloneDeep(vm.$data);
                if (!valid(data)) {
                    return;
                }
                for (var i = 0; i < data.bookPersonAndPassengers.passengers.length; i++) {
                    var cer = findCer(data.bookPersonAndPassengers.passengers[i], data.selectedCerIds[i]);
                    data.bookPersonAndPassengers.passengers[i].certificates = _.filter([cer]);
                    data.bookPersonAndPassengers.passengers[i].passengerName = data.selectedNames[i];
                }
                var responsibleGroup = data.responsibleGroup.split(',');
                var responsiblePeople = data.responsiblePeople.split(',');
                var servicePersons = _.filter(_.map(data.selectedServicePersons, function (i) {
                    var item = _.find(data.ccPersons, {id: parseInt(i)});
                    if (!item) {
                        return null;
                    }
                    return {
                        servicePersonName: item.name,
                        servicePersonPhone: item.mobile,
                        servicePersonEmail: item.email,
                        servicePersonType: item.servicePersonTypeName,
                        servicePersonText: item.remark,
                        passengerEmployeeId: item.employeeId
                    };
                }));
                var goFlightConfirm = _.assign(window.goFlightConfirm,
                    {violationReasons: transferReasons(vm.checkedViolationReasons.go, vm.checkedViolationReasonNotes.go)},
                    getAuditReference(data.basic.auditReferences, data.auditReference.goId, data.auditReference.goName),
                    {cctInsuranceSaveDTOS: _.filter(genCctInsuranceSaveDTOS(data.selectedInsuranceResources.go))});

                _.unset(goFlightConfirm, 'flight');
                var params = {
                    bookPersonAndPassengers: data.bookPersonAndPassengers,
                    contactPersons: data.contactPersons,
                    goFlightConfirm: goFlightConfirm,
                    settlementType: data.settlementType,
                    servicePersons: servicePersons,
                    travelType: window.travelType,
                    responsibleGroupId: responsibleGroup[0],
                    responsibleGroupName: responsibleGroup[1],
                    responsiblePepoleId: responsiblePeople[0],
                    responsiblePepoleName: responsiblePeople[1],
                    sellerId: data.sellerId,
                    sellerName: data.sellerName,
                    managerId: data.managerId,
                    managerName: data.managerName,
                    goServiceFee: data.goServiceFee || 0,
                    backServiceFee: data.backServiceFee || 0,
                    innerText: data.innerText,
                    outerText: data.outerText
                };
                if (!!window.backFlightConfirm.cabin) {
                    var backFlightConfirm = _.assign(window.backFlightConfirm,
                        {violationReasons: transferReasons(vm.checkedViolationReasons.back, vm.checkedViolationReasonNotes.back)},
                        getAuditReference(data.basic.auditReferences, data.auditReference.goId, data.auditReference.goName),
                        {cctInsuranceSaveDTOS: _.filter(genCctInsuranceSaveDTOS(data.selectedInsuranceResources.back))});

                    _.unset(backFlightConfirm, 'flight');
                    params.backFlightConfirm = backFlightConfirm;
                }

                repeatVM.orderData = _.cloneDeep(params);
                window.orderData = _.cloneDeep(params);

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
                        if (!data.result && data.errorCode == "LY0521014601") {
                            toastr.error("贵司暂未开通此产品的预订服务，若有需要，请联系差旅负责人", "", toastrConfig);
                            return;
                        }
                        if (data.obj === null) {
                            suggestFlights(data);
                            return;
                        }
                        var violation = data.obj;
                        var passengers = [];
                        var passengerOrders = [];
                        var orderPs = [];
                        if (violation.hasSameOrder) {
                            repeatVM.orderErrorType = 1;
                            orderPs = violation.sameOrderPS;
                            repeatVM.overbookingDesc = "已有重复预订记录";
                        } else if (violation.hasLikenessOrder) {
                            repeatVM.orderErrorType = 2;
                            orderPs = violation.likenessOrderPS;
                            repeatVM.overbookingDesc = "已预订过类似航班";
                        } else if(data.errorCode === 'LY0522012232'){
                            // 行程已经提交
                            repeatVM.orderErrorType = 3;
                            repeatVM.overbookingDesc = "您当前行程已提交，继续添加，则会创建新行程";
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
                        repeatVM.passengerOrders = passengerOrders;
                        $("#repeatModal").modal({
                            show: true,
                            backdrop: 'static'
                        });
                    },
                    error: function () {
                        toastr.error("网络出现问题，请稍后再试", "", toastrConfig);
                    }
                });
            },
            reSelect: function () {
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
            },
            reasonChange: function (index, reasonId, type) {
                var reason = _.find(vm.basic.violationReasons, {id: parseInt(reasonId)});

                if (type === 'go') {
                    vm.checkedViolationReasonNotes.go.$set(index, {reason: _.cloneDeep(reason), note: ''});
                }
                if (type === 'back') {
                    vm.checkedViolationReasonNotes.back.$set(index, {reason: _.cloneDeep(reason), note: ''});
                }
            }
        }
    });


    vm.$watch('responsibleGroup', function (val) {
        if (!val) {
            return;
        }
        vm.responsiblePeople = '';
        var id = val.split(',')[0];
        getResponsiblePepoleByGroupId(vm, id);
    });

    vm.$watch('bookPersonAndPassengers.passengers', function (val) {
        if (!val) {
            return;
        }
        initCCPersons(vm);
    });

    vm.$watch('checkedViolationReasons', function (val) {
        var go = initCheckedViolationReasonNotes(val.go);
        var back = initCheckedViolationReasonNotes(val.back);
        vm.checkedViolationReasonNotes = {go: go, back: back};
    });

    function initCCPersons(vm) {
        vm.ccPersons = [];
        _.forEach(vm.bookPersonAndPassengers.passengers, function (item) {
            $.getJSON(__ctx + '/employees/' + item.passengerEmployeeId + '/servicepersons', function (data) {
                vm.ccPersons = _.uniq(vm.ccPersons.concat(data.obj || []));
            });
        });
    }

    function initReasons(companyId) {
        $.getJSON(__ctx + '/resource/getFlightViolationReason', {corporationId: companyId}, function (data) {
            vm.basic.violationReasons = data;
        });
    }

    function transferReasons(reasons, notes) {
        return _.map(reasons, function (item, index) {
            var reason = {};
            if (!!item.violationReasonId) {
                reason = _.find(vm.basic.violationReasons, {id: parseInt(item.violationReasonId)});
            }
            return {
                passengerId: item.passengerId,
                passengerName: item.passengerName,
                violationReason: (reason.reasonChinese || '') + notes[index].note,
                violationReasonCode: reason.code
            };
        });
    }

    function genTotalInsurancePrice(selectedInsuranceResources) {
        var nowDate = moment();
        var total = 0;
        if (!selectedInsuranceResources) {
            return total;
        }
        _.forEach(selectedInsuranceResources, function (item, index) {
            var cost = 0;

            _.forEach(item.ruleProduceIds, function (id) {
                var insurance = _.find(vm.passengerInsuranceResources[index], {ruleProduceId: id});

                var isGift = ['1', '2'].indexOf(insurance.buyType) >= 0
                    && (tc.insurance.startTransfer(insurance.presentValidStartTime) <= nowDate
                        && nowDate <= tc.insurance.endTransfer(insurance.presentValidEndTime));

                if (isGift) {
                    return;
                }

                cost += parseFloat(insurance.salePrice);
            });

            total += cost;
        });
        return total.toFixed(2);
    }

    function genCctInsuranceSaveDTOS(selectedInsuranceResources) {
        if (!selectedInsuranceResources) {
            return [];
        }

        return _.map(selectedInsuranceResources, function (item, index) {
            var passenger = vm.insurancePassengers[index];

            var ruleProducts = [];
            _.forEach(item.ruleProduceIds, function (id) {
                var insurance = _.find(vm.passengerInsuranceResources[index], {ruleProduceId: id});
                ruleProducts.push(insurance);
            });

            if (tc.arr.isEmpty(ruleProducts)) {
                return null;
            }

            return {
                passengerEmployeeId: passenger.passengerEmployeeId,
                birthDate: item.birthDate,
                ruleProducts: ruleProducts
            };
        });
    }

    function getResponsiblePepoleByGroupId(thisVM, groupId, func) {
        $.getJSON(__ctx + '/resource/getResponsiblePepoleByGroupId', {responsibleGroupId: groupId}, function (data) {
            thisVM.servicePeoples = data;

            !!func && func(data);
        });
    }

    function initCheckedViolationReasonNotes(selectReasons) {
        return _.map(selectReasons, function (item) {
            if (!item.violationReasonId) {
                return {reason: {}, note: ''};
            }
            var reason = _.find(vm.basic.violationReasons, {id: parseInt(item.violationReasonId)});
            return {reason: _.cloneDeep(reason), note: ''};
        });
    }

    function initPassengerViolatePolicies(selectorClass, violationPassengers, cabin, violationContents) {
        if (tc.arr.isEmpty(violationPassengers) || !cabin) {
            return;
        }
        $('.' + selectorClass).each(function () {
            var selector$ = $(this);
            var index = selector$.data('index');

            var passenger = violationPassengers[index];
            if (!passenger) {
                return;
            }

            var item = _.find(cabin.flightData.travelPolicys, {passengerId: passenger.passengerId});

            var ths = [[passenger.passengerName + ' 违反了如下差旅政策规定：']];
            var trs = [];
            var preLength = 0;
            if (!!item && tc.arr.isNotEmpty(item.policyContent)) {
                trs = _.map(item.policyContent, function (str, i) {
                    return [(parseInt(i) + 1) + '、' + str.violateContent];
                });
                preLength = item.policyContent.length;
            }

            var next = [];
            if (tc.arr.isNotEmpty(violationContents)) {
                _.forEach(violationContents, function (str, i) {
                    if (str.passengerEmployeeIds.indexOf(passenger.passengerId) < 0) {
                        return;
                    }
                    next.push([(preLength + parseInt(i) + 1) + '、' + str.content]);
                });

            }

            trs = trs.concat(next);

            var template = tc.flight.utils.genTableTemplate(ths, trs);

            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });
    }

    function initInsuranceTips() {
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

        $('.insuranceDatePicker').datetimepicker({
            minView: "month", // 选择日期后，不会再跳转去选择时分秒
            format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
            language: 'zh-CN', // 汉化
            autoclose: true // 选择日期后自动关闭
        });
    }

    function initInsuranceRules(thisVM, oldPassengers) {
        var nowDate = moment();
        var passengers = _.cloneDeep(oldPassengers);
        var ids = _.map(passengers, function (item) {
            return item.passengerEmployeeId;
        });
        var params = {
            employeeIds: ids.toString(),
            orderChannel: 4 // 白屏
        };
        $.getJSON(__ctx + '/insurance/flightresources', params, function (data) {
            var insurancePassengers = [];
            var passengerInsuranceResources = [];
            var selectedInsurance = [];
            _.forEach(data.obj, function (item) {
                if (!item.ruleResponse || tc.arr.isEmpty(item.ruleResponse.ruleProductLists)) {
                    return;
                }
                var subInsResources = [];
                var subSelected = [];
                _.forEach(item.ruleResponse.ruleProductLists, function (product) {
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
                if (tc.arr.isEmpty(subInsResources)) {
                    return;
                }
                var passenger = _.find(passengers, {passengerEmployeeId: item.employeeId});
                insurancePassengers.push(passenger);
                passengerInsuranceResources.push(subInsResources);
                selectedInsurance.push({ruleProduceIds: subSelected});
            });

            thisVM.insurancePassengers = insurancePassengers;
            thisVM.passengerInsuranceResources = passengerInsuranceResources;
            thisVM.basic.insuranceResources = data.obj;
            thisVM.selectedInsuranceResources.go = _.cloneDeep(selectedInsurance);
            thisVM.selectedInsuranceResources.back = _.cloneDeep(selectedInsurance);

            setTimeout(initInsuranceTips, 500);
        });
    }

    function suggestFlights(result) {
        if (!!window.goFlightConfirm.cabin && !!window.backFlightConfirm.cabin) {
            toastr.error("订单创建失败", "", toastrConfig);
            return;
        }
        if (result.message !== 'LY0522011299') {
            toastr.error("订单创建失败", "", toastrConfig);
            return;
        }
        tc.flight.suggest(_.cloneDeep(window.bookPersonAndPassengers), _.cloneDeep(window.goFlightConfirm.cabin));
    }
});