
var vm_hotelPassenger;
$(document).ready(function () {
    vm_hotelPassenger = new Vue({
        el: "#hotelPassenger",
        data: {
            employeeId : employeeId,
            params: {
                bookPersonEmail: "",
                bookPersonPhone: "",
                bookPersonName: "",
                bookPersonNumber: "",
                companyId: ""
            },
            corporationDTOs: {},
            bookPersonList: {},
            bookPerson: {},
            selectedBookPerson: {},
            allPassengers: [],
            searchPassengerList: {},
            passengerSearchCondition: {},
            itineraryType: 1,
            itineraryNo: iNo,
            companys: [],
            commonPassengers: [],
            selectedCommonPassengers: [],
            selectedSearchPassenger: [],
            isChecked: [],
            toggle: "更多",
            companyName: '',
            companyFlag: 0
        },
        filters: {
            empName: function (item) {
                if (item) {
                    if (item.passengerName && !item.passengerEnlishName) {
                        return item.passengerName;
                    } else if (!item.passengerName && item.passengerEnlishName) {
                        if (item.passengerEnlishName == "/") {
                            return "";
                        } else {
                            return item.passengerEnlishName;
                        }
                    } else if (item.passengerName && item.passengerEnlishName) {
                        if (item.passengerEnlishName == "/") {
                            return item.passengerName;
                        } else {
                            return item.passengerName + "(" + item.passengerEnlishName + ")";
                        }
                    }
                } else {
                    return "";
                }
            },

            bookPersonName: function (item) {
                if (item) {
                    if (item.bookPersonName && !item.bookPersonEnlishName) {
                        return item.bookPersonName;
                    } else if (!item.bookPersonName && item.bookPersonEnlishName) {
                        if (item.bookPersonEnlishName == "/") {
                            return "";
                        } else {
                            return item.bookPersonEnlishName;
                        }
                    } else if (item.bookPersonName && item.bookPersonEnlishName) {
                        if (item.bookPersonEnlishName == "/") {
                            return item.bookPersonName;
                        } else {
                            return item.bookPersonName + "(" + item.bookPersonEnlishName + ")";
                        }
                    }
                } else {
                    return "";
                }
            },

            sexFilter: function (value) {
                switch (value) {
                    case "m" :
                        return "男";
                        break;
                    case "w" :
                        return "女";
                        break;
                    default :
                        return "";
                        break;
                }
            },
            beautyTime: {
                read: function (value, format) {
                    if (value == '' || value == null || value == '631123200000' || value == '1990-01-01') {
                        return '';
                    }
                    return moment(value).format(format);
                },
                write: function (value, format) {
                    return value;
                }

            },
            booleanDef: function (value) {
                return (value == 1 || value == true );
            },
            formatPassengerClass: function (value) {
                if (value == 'c') {
                    return '儿童';
                } else if (value == 'b') {
                    return '婴儿';
                } else {
                    return "成人";
                }
            },
            passengerType: function (value) {
                return value == "1" || value == "i" ? "员工" : "客人";
            }
        },

        ready: function () {
            if (this.itineraryNo != "") {
                this.getBookPersonByItineraryNo();
                //this.getItineraryPassenger();
                $("#searchBookPerson").hide();
            } else {
                $("#searchBookPerson").show();
            }

            if(this.employeeId != "" && this.employeeId != null){
                this.selectedBookPerson.bookPersonEmployeeId = this.employeeId;
                this.setBookPerson();
            }

            var loadCompanysData = function () {
                $.ajax({
                    url: __ctx + "/resource/companys",
                    //data: parms,
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error("请先选择公司！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        vm_hotelPassenger.companys = data;
                    }
                });
            };
            loadCompanysData();
        },

        methods: {
            getCorporationAuthority:function(companyId){
                $.ajax({
                    url:__ctx + "/tmcCorporation/getCorporationAuthority?corporationId=" + companyId,
                    contentType: "application/json",
                    datatype:"json",
                    async:false,
                    error: function(data1){
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success:function(data){
                        if (data.result && data.obj) {
                            var obj = data.obj;
                            var array = [];
                            if(obj.domesticAirport==1) {
                                array.push("国内机票");
                            }
                            if (obj.internationalAirport==1) {
                                array.push("国际机票");
                            };
                            if(obj.domesticHotel==1) {
                                array.push("国内酒店");
                            }
                            if (obj.internationalHotel==1) {
                                array.push("国际酒店");
                            };
                            if(obj.train==1) {
                                array.push("火车票");
                            }
                            if (obj.car==1) {
                                array.push("用车");
                            };
                            if (array.length > 0) {
                                $("#corporationBookAuthority").text(array.toString().replace(new RegExp(",","gm"),"、"));
                            }else{
                                $("#corporationBookAuthority").text('');
                            };
                        };
                    }
                });
            },
            searchBookPerson: function () {
                if (vm_hotelPassenger.params.companyId == '' || vm_hotelPassenger.params.companyId == null) {
                    toastr.error("请先选择公司！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                vm_hotelPassenger.params.page = 1;
                vm_hotelPassenger.params.size = 10;
                this.searchPerson(vm_hotelPassenger.params);
                $("#bookPersonModal").modal({show: true, backdrop: 'static'});
            },

            searchPerson: function (params) {
                $.ajax({
                    url: __ctx + "/hotel/searchBookPerson",
                    data: params,
                    type: "POST",

                    datatype: "json",
                    error: function (data) {
                        toastr.error(data.message, "查询失败", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    },
                    success: function (data) {
                        vm_hotelPassenger.bookPersonList = data;
                    }
                });
            },

            // 分页查询
            queryData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }
                else {
                    this.params.page = 1;
                    this.params.size = 10;
                }
                this.searchPerson(this.params);
            },

            // 选择预定人
            selectBookPerson: function (index, person) {
                if ($("input[name='selectedPerson']:eq(" + index + ")").prop("checked")) {
                    this.selectedBookPerson = person;
                } else {
                    this.selectedBookPerson = {}
                }
            },

            // 设置预订人
            setBookPerson: function () {
                if (this.selectedBookPerson.bookPersonEmployeeId == '' || this.selectedBookPerson.bookPersonEmployeeId == null || this.selectedBookPerson.bookPersonEmployeeId == 'undefined') {
                    $('#bookPersonModal').modal('hide');
                    return;
                }
                //精确确定预定人信息
                $.ajax({
                    url: __ctx + "/hotel/getBookPersonDetailByEmployeeId/" + this.selectedBookPerson.bookPersonEmployeeId,
                    contentType: "application/json",
                    type: "GET",
                    datatype: "json",
                    error: function (data) {
                        toastr.error(data.message, "查询失败", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    },
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            vm_hotelPassenger.selectedBookPerson = data.obj;
                            vm_hotelPassenger.allPassengers = [];
                            vm_hotelPassenger.params.companyId = vm_hotelPassenger.bookPerson.companyId = vm_hotelPassenger.selectedBookPerson.bookCompanyId;
                            if(vm_hotelPassenger.selectedBookPerson.bookPersonName != "" && vm_hotelPassenger.selectedBookPerson.bookPersonName != null){
                                vm_hotelPassenger.params.bookPersonName = vm_hotelPassenger.bookPerson.bookPersonName = vm_hotelPassenger.selectedBookPerson.bookPersonName;
                            }else{
                                vm_hotelPassenger.params.bookPersonName = vm_hotelPassenger.bookPerson.bookPersonName = vm_hotelPassenger.selectedBookPerson.bookPersonEnlishName;
                            }
                            vm_hotelPassenger.params.bookPersonEmail = vm_hotelPassenger.bookPerson.bookPersonEmail = vm_hotelPassenger.selectedBookPerson.bookPersonEmail;
                            vm_hotelPassenger.params.bookPersonPhone = vm_hotelPassenger.bookPerson.bookPersonPhone = vm_hotelPassenger.selectedBookPerson.bookPersonPhone;
                            vm_hotelPassenger.params.bookPersonNumber = vm_hotelPassenger.bookPerson.bookPersonNumber = vm_hotelPassenger.selectedBookPerson.bookPersonNumber;

                            vm_hotelPassenger.judgeBookPersonBookAuthority(vm_hotelPassenger.selectedBookPerson);//判断权限

                            $("#selected-passenger").show();
                            $("#to-white-book").show();
                            //预订人转乘客
                            var passenger = {};
                            passenger.passengerName = vm_hotelPassenger.selectedBookPerson.bookPersonName;
                            passenger.passengerEnlishName = vm_hotelPassenger.selectedBookPerson.bookPersonEnlishName;
                            passenger.passengerNickname = vm_hotelPassenger.selectedBookPerson.bookPersonNickname;
                            passenger.passengerCompanyId = vm_hotelPassenger.selectedBookPerson.bookCompanyId;
                            passenger.passengerCompany = vm_hotelPassenger.selectedBookPerson.bookCompanyName;
                            passenger.passengerDepartmentId = vm_hotelPassenger.selectedBookPerson.bookDepartmentId;
                            passenger.passengerDepartmentName = vm_hotelPassenger.selectedBookPerson.bookDepartmentName;
                            passenger.passengerSex = vm_hotelPassenger.selectedBookPerson.bookPersonSex;
                            passenger.passengerPhone = vm_hotelPassenger.selectedBookPerson.bookPersonPhone;
                            passenger.passengerEmail = vm_hotelPassenger.selectedBookPerson.bookPersonEmail;
                            passenger.passengerBirthDate = vm_hotelPassenger.selectedBookPerson.bookPersonBirthDate;
                            passenger.passengerEmployeeId = vm_hotelPassenger.selectedBookPerson.bookPersonEmployeeId;
                            passenger.passengerNationality = vm_hotelPassenger.selectedBookPerson.bookPersonNationality;
                            passenger.passengerNo = vm_hotelPassenger.selectedBookPerson.bookPersonNumber;
                            passenger.passengerType = vm_hotelPassenger.selectedBookPerson.bookPersonType;
                            passenger.passengerClass = vm_hotelPassenger.selectedBookPerson.bookPersonClass;
                            passenger.isVip = (vm_hotelPassenger.selectedBookPerson.isVip == true || vm_hotelPassenger.selectedBookPerson.isVip == 1) ? 1 : 0;
                            passenger.passengerText = vm_hotelPassenger.selectedBookPerson.bookPersonText;
                            passenger.certificates = vm_hotelPassenger.selectedBookPerson.certificates;
                            //passenger.passengerBackupEmail = vm_hotelPassenger.selectedBookPerson.bookPersonBackupEmail;
                            passenger.passengerStructure = vm_hotelPassenger.selectedBookPerson.bookPersonStructure;
                            passenger.passengerStructureId = vm_hotelPassenger.selectedBookPerson.bookPersonStructureId;
                            //passenger.englishLastName = vm_hotelPassenger.selectedBookPerson.englishLastName;
                            //passenger.englishFirstName = vm_hotelPassenger.selectedBookPerson.englishFirstName;
                            vm_hotelPassenger.allPassengers.$set(vm_hotelPassenger.allPassengers.length, passenger);

                            $('#bookPersonModal').modal('hide');
                            vm_hotelPassenger.getCommonPassengers(vm_hotelPassenger.selectedBookPerson);
                        }
                    }
                });

            },

            // 查找旅客
            searchPassengers: function () {
                vm_hotelPassenger.passengerSearchCondition.companyId = vm_hotelPassenger.selectedBookPerson.bookCompanyId;
                vm_hotelPassenger.passengerSearchCondition.page = 1;
                vm_hotelPassenger.passengerSearchCondition.pageSize = 5;
                this.getPassengers(vm_hotelPassenger.passengerSearchCondition);
            },

            getPassengers: function (params) {
                $.ajax({
                    url: __ctx + "/hotel/getPassengersByCondition",
                    contentType: "application/json",
                    data: JSON.stringify(params),
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error(data1.message, "查询失败", toastrConfig);
                    },
                    success: function (data) {
                        vm_hotelPassenger.searchPassengerList = data;
                        //延迟加载
                        window.setTimeout(function () {
                            $(vm_hotelPassenger.searchPassengerList.data).each(function (index, passenger1) {
                                $(vm_hotelPassenger.allPassengers).each(function(index2,passenger2){
                                    if(passenger1.passengerEmployeeId == passenger2.passengerEmployeeId){
                                        $("input[id='selectedPassenger"+passenger2.passengerEmployeeId+"']").prop("checked",true);
                                    }
                                });
                            });
                        },100);
                    }
                });
            },

            queryPassengerData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.passengerSearchCondition, pageInfo);
                }
                else {
                    this.passengerSearchCondition.page = 1;
                    this.passengerSearchCondition.pageSize = 5;
                }
                this.getPassengers(this.passengerSearchCondition);
            },
            // 加载证件信息
            changeCertificateSelected: function (employeeId, target) {
                var certi = $("#" + target + "_passengercerti" + employeeId).val();
                $("#" + target + "_certiNo" + employeeId).text(certi);
            },

            refreshAllPassengers: function () {
                var ids = [];
                for (var i = 0; i < vm_hotelPassenger.allPassengers.length; i++) {
                    if (vm_hotelPassenger.allPassengers[i].passengerEmployeeId != 0) {
                        ids.push(vm_hotelPassenger.allPassengers[i].passengerEmployeeId);
                    } else {
                        toastr.error("非同事信息无法刷新", "", toastrConfig);
                    }
                }
                $.ajax({
                    url: __ctx + "/hotel/detailsByIds/",
                    data: {ids: ids.join()},
                    type: "POST",
                    error: function (data) {
                        toastr.error(data.message, "查询失败", toastrConfig);
                    },
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            vm_hotelPassenger.allPassengers = data.obj;
                        }
                    }
                });
            },

            outLinkAddPassenger: function (url) {
                window.open(url + vm_hotelPassenger.selectedBookPerson.bookCompanyId, "_blank");
            },

            outLinkCorporation: function (courl) {
                var outCoUrl = courl.replace('{0}', vm_hotelPassenger.params.companyId);
                window.open(outCoUrl, "_blank");
            },

            outLinkEditPassenger: function (editUrl, item) {
                if (item.passengerEmployeeId != 0) {
                    var outEditUrl = editUrl.replace('{0}', item.passengerEmployeeId).replace('{1}', item.passengerCompanyId);
                    window.open(outEditUrl, "_blank");
                } else {
                    toastr.error("非同事信息无法修改", "", toastrConfig);
                }
            },

            removePassenger: function (index, passenger) {
                if (vm_hotelPassenger.allPassengers.length <= 1) {
                    toastr.error("乘客不能少于1人", "", toastrConfig);
                    return;
                }
                vm_hotelPassenger.allPassengers.$remove(passenger);

                //清除选择并且移除当前对象所在数组
                $("input[id='commonPassengers"+passenger.passengerEmployeeId+"']").prop("checked",false);
                $(vm_hotelPassenger.selectedCommonPassengers).each(function (i, e) {
                    if(passenger.passengerEmployeeId == e.passengerEmployeeId){
                        vm_hotelPassenger.selectedCommonPassengers.$remove(e);
                    }
                });

                $("input[id='selectedPassenger"+passenger.passengerEmployeeId+"']").prop("checked",false);
                $(vm_hotelPassenger.selectedSearchPassenger).each(function (i, e) {
                    if(passenger.passengerEmployeeId == e.passengerEmployeeId){
                        vm_hotelPassenger.selectedSearchPassenger.$remove(e);
                    }
                });
            },

            addPassenger: function (passenger, index) {

                var flag = false;
                if ($("input[name='selectedPassenger']:eq(" + index + ")").prop("checked")) {
                    if (vm_hotelPassenger.allPassengers.length > 7) {
                        toastr.error("最多八名乘客！", "", toastrConfig);
                        $("input[name='selectedPassenger']:eq(" + index + ")").prop("checked",false);
                        return;
                    }
                    for (var m = 0; m < vm_hotelPassenger.allPassengers.length; m++) {
                        if (vm_hotelPassenger.allPassengers[m].passengerEmployeeId == passenger.passengerEmployeeId) {
                            toastr.warning("该乘客已选择", "", toastrConfig);
                            $("input[name='selectedPassenger']:eq(" + index + ")").prop("checked",false);
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        vm_hotelPassenger.selectedSearchPassenger.$set(vm_hotelPassenger.selectedSearchPassenger.length, passenger);
                        vm_hotelPassenger.allPassengers.$set(vm_hotelPassenger.allPassengers.length, vm_hotelPassenger.searchPassengerList.data[index]);
                        $("input[id='commonPassengers"+passenger.passengerEmployeeId+"']").prop("checked",true);
                    }
                } else {
                    /*vm_hotelPassenger.allPassengers = _.remove(vm_hotelPassenger.allPassengers, function (o) {
                     return o.passengerEmployeeId != passengerEmployeeId;
                     });*/
                    if (vm_hotelPassenger.allPassengers.length <= 1) {
                        toastr.error("乘客不能少于1人", "", toastrConfig);
                        $("input[name='selectedPassenger']:eq(" + index + ")").prop("checked",true);
                        return;
                    }
                    vm_hotelPassenger.selectedSearchPassenger = _.remove(vm_hotelPassenger.selectedSearchPassenger, function (o) {
                        return o.passengerEmployeeId != passenger.passengerEmployeeId;
                    });
                    vm_hotelPassenger.allPassengers = _.remove(vm_hotelPassenger.allPassengers, function (o) {
                        return o.passengerEmployeeId != passenger.passengerEmployeeId;
                    });
                    $("input[id='commonPassengers"+passenger.passengerEmployeeId+"']").prop("checked",false);
                }
            },

            getBirthdayFromIdCard: function (IdCardNo) {
                var birthday = "";
                var iIdNo = $.trim(IdCardNo);
                if (iIdNo.length == 15) {
                    birthday = iIdNo.substring(6, 12);
                    birthday = "19" + birthday;
                    birthday = birthday.substring(0, 4) + "-" + birthday.substring(4, 6) + "-" + birthday.substring(6);
                } else {
                    birthday = iIdNo.substring(6, 14);
                    birthday = birthday.substring(0, 4) + "-" + birthday.substring(4, 6) + "-" + birthday.substring(6);
                }
                var birthDate = new Date(birthday.replace(/-/g, '/'));
                return birthDate.getTime();
            },

            getBookPersonByItineraryNo: function () {
                var VM = this;
                $.ajax({
                        url: __ctx + "/hotel/getBookPersonByItineraryNo",
                        data: {
                            itineraryNo: VM.itineraryNo
                        },
                        type: "POST",
                        datatype: "json",
                        error: function (data1) {
                            toastr.error(data1.message, "查询失败", toastrConfig);
                        },
                        success: function (data) {
                            if (data.result) {
                                if (data.obj) {
                                    VM.selectedBookPerson = data.obj;
                                    VM.getCommonPassengers(VM.selectedBookPerson);

                                    VM.judgeBookPersonBookAuthority(VM.selectedBookPerson);//判断权限

                                    if(VM.selectedBookPerson.bookPersonName != "" && VM.selectedBookPerson.bookPersonName != null){
                                        VM.params.bookPersonName = VM.selectedBookPerson.bookPersonName;
                                    }else{
                                        VM.params.bookPersonName = VM.selectedBookPerson.bookPersonEnlishName;
                                    }
                                    VM.params.companyId = VM.selectedBookPerson.bookCompanyId;
                                    VM.params.bookPersonEmail = VM.selectedBookPerson.bookPersonEmail;
                                    VM.params.bookPersonPhone = VM.selectedBookPerson.bookPersonPhone;
                                    VM.params.bookPersonNumber = VM.selectedBookPerson.bookPersonNumber;

                                    //预订人转乘客
                                    var passenger = {};
                                    passenger.passengerName = VM.selectedBookPerson.bookPersonName;
                                    passenger.passengerEnlishName = VM.selectedBookPerson.bookPersonEnlishName;
                                    passenger.passengerNickname = VM.selectedBookPerson.bookPersonNickname;
                                    passenger.passengerCompanyId = VM.selectedBookPerson.bookCompanyId;
                                    passenger.passengerCompany = VM.selectedBookPerson.bookCompanyName;
                                    passenger.passengerDepartmentId = VM.selectedBookPerson.bookDepartmentId;
                                    passenger.passengerDepartmentName = VM.selectedBookPerson.bookDepartmentName;
                                    passenger.passengerSex = VM.selectedBookPerson.bookPersonSex;
                                    passenger.passengerPhone = VM.selectedBookPerson.bookPersonPhone;
                                    passenger.passengerEmail = VM.selectedBookPerson.bookPersonEmail;
                                    passenger.passengerBirthDate = VM.selectedBookPerson.bookPersonBirthDate;
                                    passenger.passengerEmployeeId = VM.selectedBookPerson.bookPersonEmployeeId;
                                    passenger.passengerNationality = VM.selectedBookPerson.bookPersonNationality;
                                    passenger.passengerNo = VM.selectedBookPerson.bookPersonNumber;
                                    passenger.passengerType = VM.selectedBookPerson.bookPersonType;
                                    passenger.passengerClass = VM.selectedBookPerson.bookPersonClass;
                                    passenger.isVip = VM.selectedBookPerson.isVip ? 1 : 0;
                                    passenger.passengerText = VM.selectedBookPerson.bookPersonText;
                                    passenger.certificates = VM.selectedBookPerson.certificates;
                                    //passenger.passengerBackupEmail = VM.selectedBookPerson.bookPersonBackupEmail;
                                    passenger.passengerStructure = VM.selectedBookPerson.bookPersonStructure;
                                    passenger.passengerStructureId = VM.selectedBookPerson.bookPersonStructureId;
                                    //passenger.englishLastName = VM.selectedBookPerson.englishLastName;
                                    //passenger.englishFirstName = VM.selectedBookPerson.englishFirstName;
                                    VM.allPassengers.$set(VM.allPassengers.length, passenger);
                                    $('#corporationSelect').val(VM.params.companyId).trigger('change');
                                    VM.getItineraryPassenger();//获取行程下的乘客
                                    VM.getCommonPassengers(VM.selectedBookPerson);
                                    VM.getCorporationAuthority(VM.params.companyId);
                                } else {
                                    toastr.error("预订人获取失败！,请重新确定预订人！", "", {
                                        timeOut: 2000,
                                        positionClass: "toast-top-center"
                                    });
                                }
                            }
                        }
                    }
                )
            },

            getItineraryPassenger: function () {
                var VM = this;
                if (VM.itineraryNo) {
                    $.ajax({
                        url: __ctx + "/hotel/getPassengersByItineraryNo",
                        data: {
                            itineraryNo: VM.itineraryNo
                        },
                        type: "POST",
                        datatype: "json",
                        error: function (data1) {
                            toastr.error("请求失败！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success: function (data) {
                            if (data.result) {
                                $(data.obj).each(function (index, passenger) {
                                    vm_hotelPassenger.allPassengers.$set(vm_hotelPassenger.allPassengers.length, passenger);
                                });
                            }
                            $("#selected-passenger").show();
                            $("#to-white-book").show();
                        }
                    });
                }
            },

            toBook: function () {
                if (vm_hotelPassenger.selectedBookPerson == null || vm_hotelPassenger.selectedBookPerson.bookPersonName == undefined) {
                    toastr.error("请先选择预订人！", "", toastrConfig);
                    return;
                }
                if (vm_hotelPassenger.allPassengers.length == 0) {
                    toastr.error("请添加乘客！", "", toastrConfig);
                    return;
                }
                if (vm_hotelPassenger.allPassengers.length > 8) {
                    toastr.error("最多八名乘客！", "", toastrConfig);
                    return;
                }
                var data = {};
                data.bookPerson = vm_hotelPassenger.selectedBookPerson;
                data.bookPerson.isVip ? data.bookPerson.isVip = 1 : data.bookPerson.isVip = 0;
                data.passengers = vm_hotelPassenger.allPassengers;
                data.itineraryType = vm_hotelPassenger.itineraryType;
                data.itineraryNo = vm_hotelPassenger.itineraryNo;
                var certieFlag = false;
                var errorMsg = '';
                $(data.passengers).each(function (i, e) {
                    if (!e.certificates) {
                        errorMsg = errorMsg + "请补全 " + (e.passengerName==null || e.passengerName==""?e.passengerEnglishName:e.passengerName) + " 乘客的证件信息" + '<br>' ;
                        certieFlag = true;
                    }
                });
                if (certieFlag) {
                    toastr.error(errorMsg, "", toastrConfig);
                    return;
                }

                var countBirthdayFlag = 0;
                var countCertificateFlag = 0;
                var birthErrorMsg = "";
                var nameErrorMsg = "";
                var countNameFlag = 0;
                var sexErrorMsg = "";
                var sexFlag = 0;
                var cerErrorMsg = "";
                var cerFlag = 0;
                for (var i = 0; i < data.passengers.length; i++) {
                    var p = data.passengers[i];
                    var c = p.certificates;
                    for (var j = 0; j < c.length; j++) {
                        if (_.indexOf([1,2,3,4,5,6,7,8,9], c[j].certificateTypeId) < 0) {
                            cerErrorMsg = cerErrorMsg + (p.passengerName==null || p.passengerName==""?p.passengerEnglishName:p.passengerName) + "乘客的 证件类型 不符" + '<br>' ;
                            cerFlag++;
                        } else {
                            countCertificateFlag++;
                            if (c[j].certificateTypeId == 1 && (p.passengerBirthDate == null || p.passengerBirthDate == "")) { // 身份证
                                p.passengerBirthDate = this.getBirthdayFromIdCard(p.certificates[j].certificateCode);
                            }
                            break;
                        }
                    }
                    if (p.passengerName == null && p.passengerName == "" && p.passengerEnlishName == null && p.passengerEnlishName == "") {
                        nameErrorMsg = nameErrorMsg + "请修改 " + (p.passengerName==null || p.passengerName==""?p.passengerEnglishName:p.passengerName) + "乘客的 姓名 信息" + '<br>' ;
                    } else {
                        countNameFlag++;
                    }

                    if (p.passengerSex == null || p.passengerSex == "") {
                        sexErrorMsg = sexErrorMsg + "请修改 " + (p.passengerName==null || p.passengerName==""?p.passengerEnglishName:p.passengerName) + "乘客的 性别 信息" + '<br>' ;
                    } else {
                        sexFlag++;
                    }

                    if (p.passengerBirthDate == null || p.passengerBirthDate == "") {
                        birthErrorMsg = birthErrorMsg + "请修改 " + (p.passengerName==null || p.passengerName==""?p.passengerEnglishName:p.passengerName) + "乘客的 生日 信息" + '<br>' ;
                    } else {
                        countBirthdayFlag++;
                    }
                }

                if (countCertificateFlag != data.passengers.length) {
                    toastr.error(cerErrorMsg, "证件信息仅支持 [身份证,公务护照,普通护照,港澳通行证,台胞证,回乡证,军人证,海员证,其它]", toastrConfig);
                    return;
                }

                if (countNameFlag != data.passengers.length) {
                    toastr.error(nameErrorMsg, "", toastrConfig);
                    return;
                }
                if (sexFlag != data.passengers.length) {
                    toastr.error(sexErrorMsg, "", toastrConfig);
                    return;
                }
                if (countBirthdayFlag != data.passengers.length) {
                    toastr.error(birthErrorMsg, "", toastrConfig);
                    return;
                }

                var action = '';
                var flag = false;
                $(data.passengers).each(function (i, e) {
                    if (e.passengerClass == 'b' || e.passengerClass == 'c') {
                        flag = true;
                    }
                });
                if (flag) {
                    toastr.error("乘客中存在儿童或者婴儿", "", toastrConfig);
                    return;
                }

                if (vm_hotelPassenger.allPassengers.length > 0) {
                    vm_hotelPassenger.addCommomPassenger();
                }

                action = __ctx + '/hotel/list';
                var form = $("<form></form>");
                form.attr('action', action);
                form.attr('method', 'post');
                var input = $("<input type='text' id='bookdate' name='bookPersonAndPassengersDTOStr'/>");
                form.append(input);
                form.appendTo("body");
                form.css('display', 'none');
                $("#bookdate").val(JSON.stringify(data));
                sessionStorage.clear();
                sessionStorage.bookPersonAndPassengers = JSON.stringify(data);
                form.submit();
            },

            reset: function () {
                vm_hotelPassenger.passengerSearchCondition = {};
            },

            addCommomPassenger: function () {
                if (vm_hotelPassenger.allPassengers.length > 0) {
                    var dataAdd = {};
                    var commonPassengers = [];
                    if (vm_hotelPassenger.allPassengers.length > 0) {
                        commonPassengers = vm_hotelPassenger.allPassengers;
                    }
                    dataAdd.commonPassengers = commonPassengers;
                    var bookPerson = {};
                    bookPerson.bookPersonEmployeeId = vm_hotelPassenger.selectedBookPerson.bookPersonEmployeeId;
                    dataAdd.bookPerson = bookPerson;
                    $.ajax({
                        url: __ctx + "/hotel/addPassenger",
                        contentType: "application/json",
                        data: JSON.stringify(dataAdd),
                        type: "POST",
                        datatype: "json",
                        error: function (data1) {
                            toastr.error(data1.message, "请求失败", toastrConfig);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "", {
                                    timeOut: 2000,
                                    positionClass: "toast-top-center"
                                });
                            } else {
                                toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            }
                        }
                    });
                }
            },

            deleteCommonPassenger: function () {
                if (vm_hotelPassenger.selectedCommonPassengers.length > 0) {
                    var dataDelete = {};
                    var commonPassengers = [];
                    commonPassengers = vm_hotelPassenger.selectedCommonPassengers;
                    dataDelete.commonPassengers = commonPassengers;
                    dataDelete.bookPerson = vm_hotelPassenger.selectedBookPerson;
                    var selectedBookPerson = vm_hotelPassenger.selectedBookPerson;
                    $.ajax({
                        url: __ctx + "/hotel/deletePassenger",
                        contentType: "application/json",
                        data: JSON.stringify(dataDelete),
                        type: "POST",
                        datatype: "json",
                        error: function (data) {
                            toastr.error(data.message, "", toastrConfig);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "删除失败", toastrConfig);
                            } else {
                                toastr.info(data.message, "", toastrConfig);
                                vm_hotelPassenger.getCommonPassengers(selectedBookPerson);
                            }
                        }
                    });
                }
                vm_hotelPassenger.selectedCommonPassengers = [];
            },

            getCommonPassengers: function (params) {
                $.ajax({
                    url: __ctx + "/hotel/getCommonPassengersBy",
                    data: {
                        employeeId: params.bookPersonEmployeeId
                    },
                    type: "POST",
                    datatype: "json",
                    error: function (data) {
                        toastr.error("查询常用旅客失败！", "", toastrConfig);
                    },
                    success: function (data) {
                        //预订人默认勾选
                        var array1 = data.obj;
                        for (var i = 0; i < array1.length; i++) {
                            var arry = false;
                            $(vm_hotelPassenger.allPassengers).each(function(index,e){
                                if(e.passengerEmployeeId == array1[i].passengerEmployeeId){
                                    arry = true;
                                }
                            });
                            vm_hotelPassenger.isChecked.$set(i, arry);
                        }

                        vm_hotelPassenger.commonPassengers = data.obj;
                    }
                });
            },
            showMoreCommonPassenger: function (val) {
                if (val == "更多") {
                    vm_hotelPassenger.toggle = "收起";
                    $("#moreCommomPassengers").css("height", "auto");
                } else {
                    vm_hotelPassenger.toggle = "更多";
                    $("#moreCommomPassengers").css("height", "32px");
                }
            },

            checkCommonPassengers: function (passengerEmployeeId, index) {
                var flag = false;
                if ($("input[name='commonPassengers']:eq(" + index + ")").prop("checked")) {
                    if (vm_hotelPassenger.allPassengers.length > 7) {
                        toastr.error("最多八名乘客！", "", toastrConfig);
                        $("input[name='commonPassengers']:eq(" + index + ")").prop("checked",false);
                        return;
                    }

                    $.ajax({
                        url: __ctx + "/hotel/detailsByIds/",
                        data: {ids: passengerEmployeeId},
                        type: "POST",
                        error: function (data) {
                            toastr.error(data.message, "查询失败", toastrConfig);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            } else {
                                if (data.obj.length > 0) {
                                    for (var m = 0; m < vm_hotelPassenger.allPassengers.length; m++) {
                                        //vm_hotelPassenger.selectedCommonPassengers.$set(vm_hotelPassenger.selectedCommonPassengers.length, data.obj[0]);
                                        if (vm_hotelPassenger.allPassengers[m].passengerEmployeeId == passengerEmployeeId) {
                                            toastr.warning("该乘客已选择", "", toastrConfig);
                                            $("input[name='commonPassengers']:eq(" + index + ")").prop("checked",false);
                                            flag = true;
                                            break;
                                        }
                                    }
                                }
                                if (!flag) {
                                    vm_hotelPassenger.selectedCommonPassengers.$set(vm_hotelPassenger.selectedCommonPassengers.length, vm_hotelPassenger.commonPassengers[index]);
                                    if (data.obj.length > 0) {
                                        vm_hotelPassenger.allPassengers.$set(vm_hotelPassenger.allPassengers.length, data.obj[0]);
                                    } else {
                                        vm_hotelPassenger.allPassengers.$set(vm_hotelPassenger.allPassengers.length, vm_hotelPassenger.commonPassengers[index]);
                                    }
                                    $("input[id='selectedPassenger"+passengerEmployeeId+"']").prop("checked",true);
                                }
                            }
                        }
                    });
                } else {
                    if (vm_hotelPassenger.allPassengers.length <= 1) {
                        toastr.error("乘客不能少于1人", "", toastrConfig);
                        $("input[name='commonPassengers']:eq(" + index + ")").prop("checked",true);
                        return;
                    }
                    vm_hotelPassenger.allPassengers = _.remove(vm_hotelPassenger.allPassengers, function (o) {
                        return o.passengerEmployeeId != passengerEmployeeId;
                    });
                    vm_hotelPassenger.selectedCommonPassengers = _.remove(vm_hotelPassenger.selectedCommonPassengers, function (o) {
                        return o.passengerEmployeeId != passengerEmployeeId;
                    });
                    $("input[id='selectedPassenger"+passengerEmployeeId+"']").prop("checked",false);
                }
            },

            judgeBookPersonBookAuthority:function(selectedBookPerson){
                //0默认全部选中，产品代订范围：国内机票:DA、国际机票:IA、国内酒店:DH、国际酒店:IH、火车票:TA、保险:DI、增值业务:DV
                if ((selectedBookPerson.bookAuthority == 2 || selectedBookPerson.bookAuthority == 3) && (selectedBookPerson.productTypeId == null || selectedBookPerson.productTypeId == "" || selectedBookPerson.productTypeId.indexOf("0") >=0 || selectedBookPerson.productTypeId.indexOf("DH") >=0)) {
                    $("#bookperson_bookForOthers_selected").text("当前预订人有代订权限");
                    $("#passenger-to-add").show();
                    $("#outLinkAddPassenger").show();
                    $("#commonPassenger").show();
                } else {
                    $("#bookperson_bookForOthers_selected").text("当前预订人无代订权限");
                    $("#passenger-to-add").hide();
                    $("#outLinkAddPassenger").hide();
                    $("#commonPassenger").hide();
                }
                if (selectedBookPerson.auditReferenceType == 'b') {
                    $("#bookperson_auditReferenceType_selected").text("审批流都参照预订人的审批流");
                } else if (selectedBookPerson.auditReferenceType == 'p') {
                    $("#bookperson_auditReferenceType_selected").text("审批流都参照出行人的审批流");
                } else {
                    $("#bookperson_auditReferenceType_selected").text("审批流都参照选定的参照人的审批流");
                }
            }

        },
        events: {
            'changeCompany': function(param) {
                vm_hotelPassenger.getCorporationAuthority(param.company.value);
                $.ajax({
                    url: __ctx + "/itinerary/monthlyOverDueJudge?companyId=" + param.company.value,
                    contentType: "application/json",
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        if (data.result) {
                            if (data.obj.canBookWithOverDue==1 && data.obj.hasOverDue=='Y') {
                                $("#cancellationOrder").modal('show');
                                vm_hotelPassenger.companyName = param.company.options[param.company.options.selectedIndex].text;
                                vm_hotelPassenger.companyFlag = 2;
                            } else if (data.obj.canBookWithOverDue==0 && data.obj.hasOverDue=='Y') {
                                $("#cancellationOrder").modal('show');
                                vm_hotelPassenger.companyName = param.company.options[param.company.options.selectedIndex].text;
                                vm_hotelPassenger.companyFlag = 1;
                            } else if (data.obj.hasOverDue=='N') {
                                vm_hotelPassenger.companyFlag = 0;
                            }
                        }
                    }
                });
            }
        }
    });

    $("#passenger-to-add").hide();
    $("#selected-passenger").hide();
    $("#commonPassenger").hide();
    $("#to-white-book").hide();
    $("#outLinkAddPassenger").hide();
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)return unescape(r[2]);
        return null;
    }

    if (getQueryString("flag") == 1 && getQueryString("flag") != 2) {
        if (sessionStorage.bookPersonAndPassengers != null) {
            var bookPersonAndPassengers = JSON.parse(sessionStorage.bookPersonAndPassengers);
            vm_hotelPassenger.params = vm_hotelPassenger.selectedBookPerson = bookPersonAndPassengers.bookPerson;
            vm_hotelPassenger.allPassengers = bookPersonAndPassengers.passengers;
            vm_hotelPassenger.itineraryType = bookPersonAndPassengers.itineraryType;
            vm_hotelPassenger.itineraryNo = bookPersonAndPassengers.itineraryNo;

            vm_hotelPassenger.getCommonPassengers(vm_hotelPassenger.selectedBookPerson);

            vm_hotelPassenger.judgeBookPersonBookAuthority(vm_hotelPassenger.selectedBookPerson);//判断权限

            $("#selected-passenger").show();
            $("#to-white-book").show();


        }
    } else {
        sessionStorage.clear();
    }


});