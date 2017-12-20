/**
 * Created by wj42134 on 2017/2/10.
 */
var vm_train_book2;
$(document).ready(function () {
    moment.locale("zh_cn"); // 国际化为中文
    // 格式化日期
    Vue.filter('formatDate', function (val) {
        return moment(val).format("YYYY-MM-DD (ddd) HH:mm");
    });
    Vue.filter('formatPassengerClass', function (value) {
        if (value == 'c') {
            return '儿童';
        } else if (value == 'b') {
            return '婴儿';
        } else {
            return "成人";
        }
    });
    Vue.filter('canAddLinkerClass', function (value) {
        if (value == '1') {
            return "能";
        } else if (value == '0') {
            return "否";
        }
        return "";
    });
    Vue.filter('isUserSelfClass', function (value) {
        if (value == 'Y') {
            return "是";
        } else if (value == 'N') {
            return '否';
        } else {
            return "";
        }
    });
    Vue.filter('canBuyNowClass', function (value) {
        if (value == 'Y') {
            return "可以";
        } else if (value == 'N') {
            return '不可以';
        } else {
            return "";
        }
    });
    Vue.filter('checkStatusClass', function (value) {
        if (value == '-1') {
            return '未通过';
        } else if (value == '0') {
            return '待校验';
        } else if (value == '1') {
            return '通过校验';
        } else if (value == '2') {
            return '预通过';
        } else if (value == '3') {
            return '请报验';
        } else {
            return "";
        }
    });

    // 计算票价
    var calPrice = function (serviceFee, passengers) {
        if (!passengers) {
            return 0;
        }
        var price = 0;
        var serviceCharge = parseFloat(serviceFee || 0);
        _.forEach(passengers, function (value) {
            price = price + value.ticketPrice;
        });
        return (((serviceCharge) * passengers.length) + price).toFixed(2);
    };
    // 校验
    var valid = function (data) {
        if (data.bookPerson.auditReferenceType == 'r') {
            if (data.auditReference == "") {
                toastr.error("请选择参照人", "", toastrConfig);
                return false;
            }
        } else {
            if (data.auditReference == "") {
                toastr.error("请设置参照人", "", toastrConfig);
                return false;
            }
        }
        if (!data.responsibleGroup || !data.responsiblePeople) {
            toastr.error("请选择责任组或责任人", "", toastrConfig);
            return false;
        }

        var flag = false;
        for (var b = 0; b < data.selectedViolationReason.length; b++) {
            if ((data.basic.checkedViolationReasons[b] != null && data.basic.checkedViolationReasons[b].protocolCode != null && data.basic.checkedViolationReasons[b].protocolCode != '')
                && (data.selectedViolationReason[b] == null || data.selectedViolationReason[b].id == null || data.selectedViolationReason[b].id == "")) {
                flag = true;
            }
        }
        if (data.bookInfo.isViolate != 0 && flag) {
            toastr.error("请选择违反差旅政策的原因", "", toastrConfig);
            return false;
        }
        var addBoxFlag = false;
        for (var b = 0; b < data.selectedViolationReason.length; b++) {
            if ((data.basic.checkedViolationReasons[b] != null && data.basic.checkedViolationReasons[b].protocolCode != null && data.basic.checkedViolationReasons[b].protocolCode != ''
                    && data.basic.checkedViolationReasons[b].travelProtocolViolationReasonWhetherAddBox == 1 &&  data.basic.checkedViolationReasons[b].travelProtocolViolationReasonAddBoxRequired == 1)
                && !(data.selectedViolationReason[b] == null || data.selectedViolationReason[b].id == null || data.selectedViolationReason[b].id == "")
                && ( data.selectedViolationReason[b].remark == null || data.selectedViolationReason[b].remark == "" || data.selectedViolationReason[b].remark.replace(/^[ ]*$/,"") == "" )
            ) {
                addBoxFlag = true;
            }
        }
        if (data.bookInfo.isViolate != 0 && addBoxFlag) {
            toastr.error("请填写违反差旅政策备注", "", toastrConfig);
            return false;
        }

        if (!data.settlementType) {
            toastr.error("请选择结算方式", "", toastrConfig);
            return false;
        }
        if (!data.bookType) {
            toastr.error("请选择预定方式", "", toastrConfig);
            return false;
        }
        return true;
    };


    // 初始化乘客违反政策原因
    var initCheckedViolationReasons = function (passengers, violateProtocolEmployees) {
        var arr = [];
        if (_.isEmpty(violateProtocolEmployees)) {
            _.forEach(passengers, function (passenger) {
                var obj = {
                    employeeId: passenger.passengerEmployeeId,
                    passengerName: passenger.passengerName == null || passenger.passengerName == '' ? passenger.englishName : passenger.passengerName,
                    protocolInfo: "",
                    protocolId: "",
                    protocolCode: "",
                    isViolation: 2
                };
                arr.push(obj);
            });
            return arr;
        }
        _.forEach(passengers, function (passenger) {
            _.forEach(violateProtocolEmployees, function (item) {
                var obj = {
                    employeeId: passenger.passengerEmployeeId,
                    passengerName: passenger.passengerName == null || passenger.passengerName == '' ? passenger.englishName : passenger.passengerName,
                    protocolInfo: item != null ? item.protocolInfo : "",
                    protocolId: item != null ? item.protocolId : "",
                    protocolCode: item != null && item.protolCode != null ? item.protolCode.replace(/[\r\n]/g, ",") : ""
                };

                if (item.protocolId != null) {
                    if (item.protolCode == null || item.protolCode == "") {
                        obj.isViolation = 0
                    } else {
                        obj.isViolation = 1;
                    }
                } else {
                    obj.isViolation = 2;
                }

                if (item.employeeId == passenger.passengerEmployeeId) {
                    arr.push(obj);
                }
            });
        });
        return arr;
    };

    var bindPassengerViolateReason = function (checkedViolationReasons, trainViolationReason, selectedViolationReason) {
        for (var i = 0; i < checkedViolationReasons.length; i++) {
            if (selectedViolationReason[i] != null && selectedViolationReason[i].id != null && selectedViolationReason[i].id != "") {
                checkedViolationReasons[i].travelProtocolViolationReasonId = selectedViolationReason[i].id;
                checkedViolationReasons[i].travelProtocolViolationReasonCode = "";
                checkedViolationReasons[i].travelProtocolViolationReasonContent = "";
                checkedViolationReasons[i].travelProtocolViolationReasonRemark = selectedViolationReason[i].remark;
            }
        }
        for (var m = 0; m < checkedViolationReasons.length; m++) {
            for (var n = 0; n < trainViolationReason.length; n++) {
                if (checkedViolationReasons[m].travelProtocolViolationReasonId == trainViolationReason[n].id) {
                    checkedViolationReasons[m].travelProtocolViolationReasonCode = trainViolationReason[n].code;
                    checkedViolationReasons[m].travelProtocolViolationReasonContent = trainViolationReason[n].reasonChinese;
                    checkedViolationReasons[m].travelProtocolViolationReasonWhetherAddBox = trainViolationReason[n].whetherAddBox;
                    checkedViolationReasons[m].travelProtocolViolationReasonAddBoxRequired = trainViolationReason[n].addBoxRequired;
                    break;
                }
            }
        }

        return checkedViolationReasons;
    };

// 审批参照人
    var genAuditReferences = function (passengers, bookPerson) {
        var flag = true;
        _.forEach(passengers, function (item) {
            if (item.passengerEmployeeId == bookPerson.bookPersonEmployeeId) {
                flag = false;
            }
        });

        var items = [];
        if (flag) {
            items.push({
                employeeId: parseInt(bookPerson.bookPersonEmployeeId),
                employeeName: bookPerson.bookPersonName != null && bookPerson.bookPersonName != "" ? bookPerson.bookPersonName : bookPerson.bookPersonEnlishName
            });
        }
        items = items.concat(_.filter(_.map(passengers, function (item) {
            if (item.passengerType == "i") {
                if (item.passengerEmployeeId == 0) {
                    return null;
                }
                return {
                    employeeId: parseInt(item.passengerEmployeeId),
                    employeeName: item.passengerName != null && item.passengerName != "" ? item.passengerName : item.passengerEnlishName
                };
            }
        })));
        return items;
    };

// 获取审批参照人
    var getAuditReference = function (passengers, bookPerson) {
        var type = bookPerson.auditReferenceType;
        // b.预订人，p.出行人，r.参照人
        switch (type) {
            case 'b':
                return [{
                    employeeId: bookPerson.bookPersonEmployeeId,
                    employeeName: bookPerson.bookPersonName == null || bookPerson.bookPersonName == ""
                        ? bookPerson.bookPersonEnlishName : bookPerson.bookPersonName
                }];
                break;
            case 'p':
                return genAuditReferences(passengers, bookPerson);
                break;
            case 'r':
                return genAuditReferences(passengers, bookPerson);
                break;
            default:
                break;
        }
    };

    var findCer = function (passenger, selectedCerId) {
        return _.find(passenger.certificates, {certificateType: selectedCerId})
    };

    vm_train_book2 = new Vue({
        el: '#trainBook2',
        data: {
            publicKey:'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJbR4c1qo11lZUuJi2s8fZcoJ4DddnSlkhRofQu2YJiSiucMlihd5JLLyBAKh7BgtMh9tFgsSM1pylApHb6Ez8kCAwEAAQ==',
            bookInfo: bookInfo, // 预定信息
            itineraryType: 1,
            itineraryNo: bookInfo.itineraryNo,
            confirmPassengers: bookInfo.trainReservedPassengerDTO.passengers, // 已选择乘客
            confirmPassengersTicket: bookInfo.employeeAndTicketDTOs, // 已选择乘客与票
            bookPerson: bookInfo.trainReservedPassengerDTO.bookPerson, // 预订人
            violateProtocolEmployees: bookInfo.employeeViolateProtocolDTOs,
            ccPersons: [], // 抄送人
            selectedCerIds: [], // 已选择的证件ID
            selectedNames: [], // 已选择姓名
            contactPersons: [], // 联系人
            settlementType: "", // 结算方式
            disableMonthSettlementType: false, // 授信结算方式是否禁用
            bookType: "", // 预定类型
            totalPrice: '',// 总价
            serviceGroups: [], // 服务组
            servicePeoples: [],
            responsibleGroup: '',//责任组
            responsiblePeople: '',
            sellerId: '', // 销售
            sellerName: '',
            managerId: '', // 经理
            managerName: '',
            selectedServicePersons: [],
            serviceFee: '', // 服务费
            basic: {
                checkedViolationReasons: [], // 违规的员工
                auditReferences: []
            },
            auditReference: "",
            innerText: '', // 内部备注,
            trainViolationReason: [], // 火车票违反原因
            selectedViolationReason: [{}],
            flag: false,
            countTime: 5,
            isToCreateNewItinerary:false,
            ticketModel: '0', //购票模式 0：代购模式  1：自购模式
            railwayAccount: {
                haveAccount: 'N',
                landingSuccess: 'N'
            }, //12306账户信息
            addTravelerRequest: [], //需要新增的12306常旅客
            addTravelerResponse: [], //新增12306常旅客结果
            accountNo: '', //12306账户
            accountPwd: '',
            errorMessage:'',
            switchCertificateNo:[],
            //判断乘客姓名下拉框是否展开
            isSelectedShow:[]
        },
        // 证件号码
        computed: {
            cerNum: function () {
                var thisVM = this;
                return _.map(thisVM.bookInfo.trainReservedPassengerDTO.passengers, function (item, index) {
                    var cer = findCer(item, thisVM.selectedCerIds[index]);
                    $("#switchCertificateNo"+index).html(cer.certificateCode);
                    return cer && cer.certificateCode;
                })
            }
        },

        ready: function () {
            var thisVM = this;
            _.forEach(thisVM.confirmPassengers, function (item, index) {
                thisVM.selectedNames.$set(index, item.passengerName == null || item.passengerName == '' ? item.passengerEnlishName : item.passengerName);
                thisVM.selectedCerIds.$set(index, item.certificates[0].certificateType);
                thisVM.isSelectedShow.$set(index, false);
            });
            thisVM.contactPersons = [{
                personName: thisVM.bookPerson.bookPersonName != null && thisVM.bookPerson.bookPersonName != ""
                    ? thisVM.bookPerson.bookPersonName : thisVM.bookPerson.bookPersonEnlishName,
                personTelephone: thisVM.bookPerson.bookPersonTelPhone,
                personMobile: thisVM.bookPerson.bookPersonPhone,
                personEmail: thisVM.bookPerson.bookPersonEmail
            }];
            _.forEach(thisVM.confirmPassengers, function (item, index) {
                if (thisVM.bookPerson.bookPersonEmployeeId != item.passengerEmployeeId) {
                    thisVM.contactPersons.push({
                        personName: item.passengerName != null ? item.passengerName : item.passengerEnlishName,
                        //personTelephone: item.passengerPhone,
                        personMobile: item.passengerPhone,
                        personEmail: item.passengerEmail
                    });
                }
            });
            initReasons(thisVM.bookPerson.bookCompanyId);

            //违规原因
            thisVM.basic.checkedViolationReasons = initCheckedViolationReasons(thisVM.confirmPassengers, thisVM.violateProtocolEmployees);
            thisVM.basic.checkedViolationReasons = bindPassengerViolateReason(thisVM.basic.checkedViolationReasons, thisVM.trainViolationReason, thisVM.selectedViolationReason);

            // 审批
            thisVM.basic.auditReferences = getAuditReference(bookInfo.trainReservedPassengerDTO.passengers, bookInfo.trainReservedPassengerDTO.bookPerson);
            if (thisVM.bookPerson.auditReferenceType == "b") {
                $("#auditInfo").hide();
                thisVM.auditReference = thisVM.basic.auditReferences[0].employeeId;
            }

            // 责任组
            $.getJSON(__ctx + '/resource/getResponsibleGroups', function (data) {
                thisVM.serviceGroups = data;
            });

            // 销售 客户经理
            $.getJSON(__ctx + '/basicinfo/corporations/' + thisVM.bookPerson.bookCompanyId, function (data) {
                thisVM.sellerId = data.obj.corporationDetail.sellerId;
                thisVM.sellerName = data.obj.corporationDetail.sellerName;
                thisVM.managerId = data.obj.corporationDetail.managerId;
                thisVM.managerName = data.obj.corporationDetail.managerName;
            });

            // 抄送人员
            thisVM.getAllServicePersons(thisVM.confirmPassengers);
            // $.getJSON(__ctx + '/train/' + thisVM.bookPerson.bookPersonEmployeeId + '/getAllServicePersons', function (data) {
            //     thisVM.ccPersons = data.obj;
            // });

            // TA服务费
            var feeData = {
                businesstripNature: 1, //出差类型，1：因公
                buyChannel: 1, //购买渠道 1：offline 2：APP 3：PC
                companyId: thisVM.bookPerson.bookCompanyId,
                tripType: 1, //行程类别 1：单程 2：往返
                ticketType: 2, //票类别 1：纸质票 2：电子票
                serviceType: 1 //服务类别1：订票 2：退票 3：改期
            };
            $.getJSON(__ctx + '/servicefee/ta', feeData, function (data) {
                thisVM.serviceFee = (data && data.obj && data.obj.amount) || 0;
                thisVM.totalPrice = calPrice(thisVM.serviceFee, thisVM.confirmPassengersTicket);
            });

            // 获取结算方式
            $.getJSON(__ctx + '/resource/getSettlementMethod', {
                employeeId: thisVM.bookPerson.bookPersonEmployeeId
            }, function (data) {
                if (data.result && data.obj) {
                    if (data.obj.trainMethod == 1) {
                        thisVM.settlementType = 'm'
                    } else if (data.obj.trainMethod == 2) {
                        thisVM.disableMonthSettlementType = true;
                        thisVM.settlementType = 'n'
                    }
                } else {
                    thisVM.disableMonthSettlementType = true;
                    thisVM.settlementType = 'n'
                }
            });
            thisVM.flag = true;

            // 审批参照人
            if (thisVM.bookInfo.itineraryNo != "") {
                $.getJSON(__ctx + '/serachitinerary/auditreference', {itineraryNo: thisVM.bookInfo.itineraryNo}, function (data) {
                    thisVM.basic.auditReferences.push(data.obj);
                    thisVM.auditReference = data.obj.employeeId;
                    $("#reference").attr("disabled", true);
                });
            };
            //乘客姓名从预订页获取
            for(var i = 0;i<thisVM.selectedNames.length;i++){
                thisVM.selectedNames[i] = thisVM.bookInfo.passengerNameSelected[i];
                thisVM.selectedCerIds[i] = thisVM.bookInfo.certificateSelected[i];
            };
        },
        methods: {

            //获取12306信息(静默登陆)
            getRailwayAccount: function () {
                $.ajax({
                    url: __ctx + "/trainRailway/getRailwayAccount",
                    data: JSON.stringify({
                        companyId: vm_train_book2.bookPerson.bookCompanyId,
                        bookPersonEmployeeId: vm_train_book2.bookPerson.bookPersonEmployeeId
                    }),
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    error: function (data1) {
                        toastr.error("获取预订人12306信息接口失败", "", toastrConfig);
                    },
                    success: function (data) {
                        if (data.result) {
                            vm_train_book2.railwayAccount = data.obj;
                            vm_train_book2.accountNo = data.obj.accountNo;
                            if (data.obj.haveAccount == 'Y' && data.obj.landingSuccess == 'Y') {
                                vm_train_book2.ticketModel = '1';
                                vm_train_book2.getAddTravelers();
                            }
                        } else {
                            toastr.error(data.message, "", toastrConfig);
                        }
                    }
                });
            },

            //登陆12306账户(主动登陆)
            landRailwayAccount: function () {
                if (vm_train_book2.accountNo.trim()=='' || vm_train_book2.accountPwd.trim()=='') {
                    toastr.error("12306账号或密码不能为空", "", toastrConfig);
                    return;
                }
                var encrypt=new JSEncrypt();
                encrypt.setPublicKey(vm_train_book2.publicKey);
                var accountNo = encrypt.encrypt(vm_train_book2.accountNo.trim());
                var accountPwd = encrypt.encrypt(vm_train_book2.accountPwd.trim());
                vm_train_book2.accountPwd = '';
                $.ajax({
                    url: __ctx + "/trainRailway/landRailwayAccount",
                    data: JSON.stringify({
                        companyId: vm_train_book2.bookPerson.bookCompanyId,
                        bookPersonEmployeeId: vm_train_book2.bookPerson.bookPersonEmployeeId,
                        bookPersonName: vm_train_book2.bookPerson.bookPersonName,
                        bookPersonEnglishName: vm_train_book2.bookPerson.bookPersonEnlishName,
                        accountNo: accountNo,
                        accountPwd: accountPwd
                    }),
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    error: function (data1) {
                        toastr.error("获取预订人12306信息接口失败", "", toastrConfig);
                    },
                    success: function (data) {
                        if (data.result) {
                            vm_train_book2.railwayAccount = data.obj;
                            vm_train_book2.accountNo = data.obj.accountNo;
                            if (data.obj.landingSuccess == 'N') {
                                //登陆失败
                                toastr.error(data.obj.landingErrorMessage, "", toastrConfig);
                                return;
                            }
                            //登陆后，标记自购模式
                            vm_train_book2.ticketModel = '1';
                            vm_train_book2.getAddTravelers();
                        } else {
                            toastr.error(data.message, "", toastrConfig);
                        }
                    }
                });
            },

            //刷新常旅客信息
            refreshTraveler: function () {
                $.ajax({
                    url: __ctx + "/trainRailway/refreshTraveler",
                    data: JSON.stringify({
                        companyId: vm_train_book2.bookPerson.bookCompanyId,
                        bookPersonEmployeeId: vm_train_book2.bookPerson.bookPersonEmployeeId
                    }),
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    error: function (data1) {
                        toastr.error("获取预订人12306信息接口失败", "", toastrConfig);
                    },
                    success: function (data) {
                        if (data.result) {
                            vm_train_book2.railwayAccount.traveler = data.obj;
                            if (data.obj.querySuccess == 'N') {
                                //刷新失败
                                toastr.error(data.obj.queryErrorMessage, "", toastrConfig);
                                return;
                            }
                            vm_train_book2.getAddTravelers();
                        } else {
                            toastr.error(data.message, "", toastrConfig);
                        }
                    }
                });
            },

            //新增12306常旅客信息
            modTraveler: function () {
                if (vm_train_book2.railwayAccount.traveler.canAddLinker != '1') {
                    toastr.error("当前12306账户，不能添加常旅客", "", toastrConfig);
                    return;
                }
                $.ajax({
                    url: __ctx + "/trainRailway/addTraveler",
                    data: JSON.stringify({
                        companyId: vm_train_book2.bookPerson.bookCompanyId,
                        bookPersonEmployeeId: vm_train_book2.bookPerson.bookPersonEmployeeId,
                        addTravelers: vm_train_book2.addTravelerRequest
                    }),
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    error: function (data1) {
                        toastr.error("新增12306常旅客信息接口失败", "", toastrConfig);
                    },
                    success: function (data) {
                        if (data.result) {
                            vm_train_book2.addTravelerResponse = data.obj;
                            vm_train_book2.refreshTraveler();
                            $("#addTravelerMsg").modal('show');
                        } else {
                            toastr.error(data.message, "", toastrConfig);
                        }
                    }
                });
            },

            //需要新增的12306常旅客信息
            getAddTravelers: function () {
                vm_train_book2.addTravelerRequest = [];
                for(var i = 0; i < vm_train_book2.confirmPassengers.length; i++) {
                    var cer = findCer(vm_train_book2.confirmPassengers[i], vm_train_book2.selectedCerIds[i]);
                    var memberLinkers = vm_train_book2.railwayAccount.traveler.memberLinkers;
                    for(var j = 0; j < memberLinkers.length; j++) {
                        if (memberLinkers[j].passengerName == vm_train_book2.selectedNames[i]
                            && memberLinkers[j].certType == vm_train_book2.changeCertType(cer.certificateTypeId+"")
                            && memberLinkers[j].certNo == cer.certificateCode) {
                            break;
                        }
                        if ((memberLinkers.length-1) == j) {
                            var traveler = {};
                            traveler.passengerName = vm_train_book2.selectedNames[i];
                            traveler.sexCode = vm_train_book2.confirmPassengers[i].passengerSex=="m" ? "M" : "F";
                            traveler.certNo = cer.certificateCode;
                            traveler.certType = vm_train_book2.changeCertType(cer.certificateTypeId);
                            traveler.passengeType = 1;
                            traveler.mobileNo = vm_train_book2.confirmPassengers[i].passengerPhone;
                            traveler.email = vm_train_book2.confirmPassengers[i].passengerEmail;
                            if (traveler.certType == '2') {
                                traveler.bornDate = moment(vm_train_book2.confirmPassengers[i].passengerBirthDate).format("YYYY-MM-DD HH:mm:ss");
                            }
                            vm_train_book2.addTravelerRequest.push(traveler);
                        }
                    }
                }
            },

            //退出登陆
            logoutRailwayAccount: function () {
                vm_train_book2.ticketModel = '0';
                vm_train_book2.railwayAccount = {
                    haveAccount: 'Y',
                    landingSuccess: 'logout'
                };
            },

            //更换账户登陆
            changeLogRailwayAccount: function () {
                vm_train_book2.railwayAccount = {
                    haveAccount: 'N',
                    landingSuccess: 'logout'
                };
            },

            //使用原有账户登陆
            oldLogRailwayAccount: function () {
                vm_train_book2.railwayAccount = {
                    haveAccount: 'Y',
                    landingSuccess: 'logout'
                };
            },

            //证件类型转换12306用
            changeCertType: function (value) {
                if (value == '1') {
                    //二代身份证
                    return '1';
                } else if (value == '2' || value == '3') {
                    //护照
                    return '2';
                } else if (value == '4') {
                    //港澳通行证
                    return '6';
                } else if (value == '5') {
                    //台胞通行证
                    return '7';
                }
            },

            // 删除乘客
            delPassenger: function (index) {
                if (vm_train_book2.confirmPassengers.length <= 1) {
                    toastr.error("乘客不得少于1个", "", toastrConfig);
                    return;
                }
                vm_train_book2.confirmPassengers.splice(index, 1);
                vm_train_book2.confirmPassengersTicket.splice(index, 1);
                vm_train_book2.violateProtocolEmployees.splice(index, 1);
                vm_train_book2.selectedViolationReason.splice(index, 1);
                vm_train_book2.selectedCerIds.splice(index, 1);
                vm_train_book2.selectedNames.splice(index, 1);
                vm_train_book2.totalPrice = calPrice(vm_train_book2.serviceFee, vm_train_book2.confirmPassengersTicket);
                vm_train_book2.basic.checkedViolationReasons = initCheckedViolationReasons(vm_train_book2.confirmPassengers, vm_train_book2.violateProtocolEmployees);
                vm_train_book2.basic.checkedViolationReasons = bindPassengerViolateReason(vm_train_book2.basic.checkedViolationReasons, vm_train_book2.trainViolationReason, vm_train_book2.selectedViolationReason);
                initReasons(vm_train_book2.bookPerson.bookCompanyId);
                vm_train_book2.getAllServicePersons(vm_train_book2.confirmPassengers);
                if (vm_train_book2.ticketModel == '1' && vm_train_book2.railwayAccount.landingSuccess=='Y' && vm_train_book2.railwayAccount.traveler.querySuccess == 'Y') {
                    vm_train_book2.getAddTravelers();
                }
                vm_train_book2.isSelectedShow.splice(index, 1);
            },
            // 增加联系人
            addContactPersons: function () {
                if (this.contactPersons.length >= 6) {
                    toastr.error("联系人不能超过6个", "", toastrConfig);
                    return;
                }
                this.contactPersons.push({});
            },
            // 删除联系人
            delContactPersons: function (index) {
                if (this.contactPersons.length <= 1) {
                    toastr.error("联系人不能少于1个", "", toastrConfig);
                    return;
                }
                this.contactPersons.splice(index, 1);
            },

            getAllServicePersons: function (passengers) {
                var passengerEmployeeIds = "";
                var num = passengers.length;
                $(passengers).each(function (i, e) {
                    if (e.passengerEmployeeId) {
                        passengerEmployeeIds += e.passengerEmployeeId;
                        if ((i + 1) != num) {
                            passengerEmployeeIds += ",";
                        }
                    }
                });

                $.ajax({
                    url: __ctx + "/train/getAllServicePersons",
                    data: {
                        passengerEmployeeIds: passengerEmployeeIds
                    },
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error("服务人员获取失败!", "", toastrConfig);
                    },
                    success: function (data) {
                        if (data == null) {
                            toastr.error("服务人员获取失败!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            vm_train_book2.ccPersons = data.obj;
                        }
                    }
                });
            },
            //获取公司预订产品权限
            getCorporationAuthority: function () {
                var _this = this;
                $.ajax({
                    url: __ctx + "/tmcCorporation/getCorporationAuthority?corporationId=" + _this.bookPerson.bookCompanyId,//vm_train_book2.bookPerson.bookCompanyId
                    contentType: "application/json",
                    datatype: "json",
                    async: false,
                    error: function (data1) {
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        if (data.result && data.obj) {
                            _this.train = data.obj.train;
                        }
                        ;
                    }
                });
            },
            // 预定
            order: function () {
                var _this = this;
                _this.getCorporationAuthority();
                if (_this.train != 1) {
                    toastr.error("贵司暂未开通此产品的预订服务，若有需要，请联系差旅负责人", "", toastrConfig);
                    return;
                }
                if (!$('#orderForm').valid()) {
                    $('body').animate({scrollTop: $('#contactPersonsInfo').offset().top}, 100);
                    toastr.error("请输入合法的数据", "", toastrConfig);
                    return;
                }
                var data = _.cloneDeep(vm_train_book2.$data);
                data.basic.checkedViolationReasons = bindPassengerViolateReason(data.basic.checkedViolationReasons, data.trainViolationReason, data.selectedViolationReason);
                if (!valid(data)) {
                    return;
                }
                // 乘客
                for (var i = 0; i < data.confirmPassengers.length; i++) {
                    var cer = findCer(data.confirmPassengers[i], data.selectedCerIds[i]);
                    data.confirmPassengers[i].certificateTypeCode = cer.certificateTypeId;
                    data.confirmPassengers[i].certificateCode = cer.certificateCode;
                    data.confirmPassengers[i].passengerName = data.selectedNames[i];
                    _.forEach(data.confirmPassengersTicket, function (value) {
                        if (value.employeeId == data.confirmPassengers[i].passengerEmployeeId) {
                            data.confirmPassengers[i].ticketPrice = value.ticketPrice;
                        }
                    });
                    data.confirmPassengers[i].serviceFee = data.serviceFee;
                    data.confirmPassengers[i].seatClass = data.bookInfo.seatClass;
                    data.confirmPassengers[i].seatName = data.bookInfo.seatName;
                    data.confirmPassengers[i].passengerWorkNo = data.confirmPassengers[i].passengerNo;
                }
                // 转换错误字段
                _.forEach(data.confirmPassengers, function (value) {
                    value.passengerEnglishName = value.passengerEnlishName;
                });

                // 责任人
                var responsibleGroup = data.responsibleGroup.split(',');
                var responsiblePeople = data.responsiblePeople.split(',');
                // 抄送人员
                var servicePersons = _.map(data.selectedServicePersons, function (i) {
                    var item = data.ccPersons[i];
                    return {
                        employeeId: item.employeeId,
                        servicePersonName: item.servicePersonName,
                        servicePersonPhone: item.servicePersonPhone,
                        servicePersonEmail: item.servicePersonEmail,
                        servicePersonType: item.servicePersonType,
                        servicePersonText: item.servicePersonText
                    };
                });

                var selectedAuditReference = _.filter(data.basic.auditReferences, ['employeeId', data.auditReference]);

                var countSexFlag = 0;
                for (var si = 0; si < data.confirmPassengers.length; si++) {
                    if (data.confirmPassengers[si].passengerSex != null && data.confirmPassengers[si].passengerSex != "") {
                        countSexFlag++;
                    }
                }

                var remarkFlag;
                var remarkErrorMsg = "";
                for (var x = 0; x < data.trainEmployeeViolateProtocolDTOS; x++) {
                    var e = data.trainEmployeeViolateProtocolDTOS[x];
                    if (e.isViolation == 1) {
                        if (e.travelProtocolViolationReasonRemark.length > 45) {
                            remarkErrorMsg = remarkErrorMsg + e.passengerName + " e.违反政策原因超过45字符!" + '<br>';
                            remarkFlag = true;
                        }
                    }
                }

                if (remarkFlag) {
                    toastr.error(remarkErrorMsg, "", toastrConfig);
                }

                if (countSexFlag != data.confirmPassengers.length) {
                    toastr.error("有乘客未设置性别", "", toastrConfig);
                    return;
                }

                var countBirthdayFlag = 0;
                for (var pc = 0; pc < data.confirmPassengers.length; pc++) {
                    if (_.indexOf([1, 2, 3, 4, 5], data.confirmPassengers[pc].certificateTypeCode) < 0) {
                    } else {
                        countBirthdayFlag++;
                    }
                }
                if (countBirthdayFlag != data.confirmPassengers.length) {
                    toastr.error("证件信息仅支持 [身份证,护照,台胞证,港澳通行证]", "有乘客存在不支持的证件类型", toastrConfig);
                    return;
                }

                var params = {
                    queryKey: data.bookInfo.queryKey,
                    trainServicePersonDTOS: servicePersons, // 抄送人
                    // itineraryType:data.itineraryType, // 行程类别 暂时不用
                    fromStationCode: data.bookInfo.fromStationCode,
                    trainNo: data.bookInfo.trainNo,
                    trainClass: data.bookInfo.trainClass,
                    auditReferenceModel: data.bookPerson.auditReferenceType,
                    responsiblePeopleName: responsiblePeople[1],
                    sellerName: data.sellerName,
                    trainPassengerDTOS: data.confirmPassengers,
                    toStationCode: data.bookInfo.toStationCode,
                    auditReferenceEmployeeId: selectedAuditReference[0].employeeId,
                    managerName: data.managerName,
                    bookEmployeeName: data.bookPerson.bookPersonName == null || data.bookPerson.bookPersonName == ""
                        ? data.bookPerson.bookPersonEnlishName : data.bookPerson.bookPersonName,
                    operator: "",
                    paymentType: data.settlementType,
                    tmcId: "",
                    sellerId: data.sellerId,
                    acceptNoSeat: 0, // 是否接受无座
                    bookEmployeeId: data.bookPerson.bookPersonEmployeeId,
                    responsiblePeopleId: responsiblePeople[0],
                    auditReferenceEmployeeName: selectedAuditReference[0].employeeName,
                    channelFrom: 5,//1：Online（PC）2：Online（APP）3：Online（WX） 4：Online（API） 5：Offline（白屏）,6：Offline（手工）
                    trainEndDate: data.bookInfo.planEndDate,
                    orderNo: "",
                    innerText: data.innerText,
                    ticketPrice: data.bookInfo.employeeAndTicketDTOs[0].ticketPrice,
                    accountType: "c", //c.公司，p.个人
                    managerId: data.managerId,
                    trainEmployeeViolateProtocolDTOS: data.basic.checkedViolationReasons,
                    trainContactPersonDTOS: data.contactPersons, //联系人
                    fromStation: data.bookInfo.fromStation,
                    toStation: data.bookInfo.toStation,
                    trainBeginDate: data.bookInfo.planBeginDate,
                    itineraryNo: (data.itineraryNo == "" || data.itineraryNo == "_") ? "" : data.itineraryNo,
                    bookType: data.bookType,
                    responsibleGroupId: responsibleGroup[0],
                    responsibleGroupName: responsibleGroup[1],
                    toCity: data.bookInfo.toCity,
                    fromCity: data.bookInfo.fromCity,
                    ticketModel: data.ticketModel
                    // serviceFee: data.serviceFee || 0
                };

                if(this.isToCreateNewItinerary){
                    // 新行程
                    params.itineraryNo = "";
                }

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + '/trainorder/book',
                    data: JSON.stringify(params),
                    dataType: "json",
                    timeout: 60000,
                    success: function (data) {
                        if (data.result) {
                            $('#toitinerarypage').modal('show');
                            sessionStorage.clear();
                            setTimeout(function () {
                                location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo=" + data.obj.itineraryNo;
                            }, 5000);
                        } else {
                            if (data.errorCode == "LY0522012119") {
                                $("#createOrderError").modal('show');
                                vm_train_book2.errorMessage = data.message;
                            } else if(data.errorCode === 'LY0522012121'){
                                // 不可继续添加
                                $('#continueBooking').modal('show');
                            }else{
                                toastr.error(data.message, "", toastrConfig);
                            }
                        }
                    },
                    error: function () {
                        toastr.error("网络出现问题，请稍后再试", "", toastrConfig);
                    }
                });
            },
            cancle:function () {
                // 取消，do nothing
                //location.reload();
            },
            continueBooking: function () {
                $('#continueBooking').modal('hide');

                this.isToCreateNewItinerary = true;
                // 继续预订
                this.order();// 创建新行程
                            
        },
            //根据乘客中英文名字切换证件类型
            switchCardByName: function (index, passengerName, isSelectedShowSingle) {
                if(!isSelectedShowSingle){
                    vm_train_book2.isSelectedShow[index] = true;
                    return;
                }else{
                    vm_train_book2.isSelectedShow[index] = false;
                }
                var isEnglishName = /[a-zA-Z]+\/[a-zA-Z]+/.test(passengerName);
                var certificates = vm_train_book2.confirmPassengers[index].certificates;
                if(isEnglishName){
                    for(var i = 0; i < certificates.length; i++){
                        if(certificates[i].certificateTypeId == 3 || certificates[i].certificateTypeId == 2){
                            vm_train_book2.selectedCerIds[index] = certificates[i].certificateType;
                            $("#switchCertificateType"+index).val(certificates[i].certificateType);
                            $("#switchCertificateNo"+index).html(certificates[i].certificateCode);
                        }
                    }
                }else{
                    for(var i = 0; i < certificates.length; i++){
                        if(certificates[i].certificateTypeId == 1){
                            vm_train_book2.selectedCerIds[index] = certificates[i].certificateType;
                            $("#switchCertificateType"+index).val(certificates[i].certificateType);
                            $("#switchCertificateNo"+index).html(certificates[i].certificateCode);
                        }
                    }
                }
            }
        },
        filters: {
            trim: function (value) {
                return value.trim();
            },
            formatPayment: function (val) {
                return val == "m" ? 1 : 0;
            }
        },
        watch: {
            'ticketModel':function(){
                $.uniform.update();
                if (vm_train_book2.ticketModel == '1' && vm_train_book2.railwayAccount.landingSuccess=='Y' && vm_train_book2.railwayAccount.traveler.querySuccess == 'Y') {
                    vm_train_book2.getAddTravelers();
                }
            },
            'selectedNames':function(){
                if (vm_train_book2.ticketModel == '1' && vm_train_book2.railwayAccount.landingSuccess=='Y' && vm_train_book2.railwayAccount.traveler.querySuccess == 'Y') {
                    vm_train_book2.getAddTravelers();
                }
            },
            'selectedCerIds':function(){
                if (vm_train_book2.ticketModel == '1' && vm_train_book2.railwayAccount.landingSuccess=='Y' && vm_train_book2.railwayAccount.traveler.querySuccess == 'Y') {
                    vm_train_book2.getAddTravelers();
                }
            }
        }
    });

    vm_train_book2.$watch('responsibleGroup', function (val) {
        if (!val) {
            return;
        }
        vm_train_book2.responsiblePeople = '';
        var id = val.split(',')[0];
        $.getJSON(__ctx + '/resource/getResponsiblePepoleByGroupId', {responsibleGroupId: id}, function (data) {
            vm_train_book2.servicePeoples = data;
        });
    });

    vm_train_book2.$watch('selectedViolationReason', function () {
        vm_train_book2.basic.checkedViolationReasons = bindPassengerViolateReason(vm_train_book2.basic.checkedViolationReasons, vm_train_book2.trainViolationReason, vm_train_book2.selectedViolationReason);
    });

    vm_train_book2.$watch('confirmPassengers', function () {
        vm_train_book2.basic.auditReferences = getAuditReference(vm_train_book2.confirmPassengers, vm_train_book2.bookPerson);
    });

    vm_train_book2.$watch('ticketModel', function () {
        if (vm_train_book2.ticketModel == '1' && vm_train_book2.railwayAccount.landingSuccess =='N') {
            vm_train_book2.getRailwayAccount();
        }
    });

    function initReasons(companyId) {
        $.getJSON(__ctx + "/resource" + "/getTrainViolationReason", {
                corporationId: companyId
            }, function (data) {
                vm_train_book2.trainViolationReason = data;
            }
        );
    }

    $('#toitinerarypage').hide();
});