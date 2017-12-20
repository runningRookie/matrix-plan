/**
 * Created by wj42134 on 2017/1/12.
 */
var vm_trainPassenger;
$(document).ready(function () {
    vm_trainPassenger = new Vue({
        el: "#trainPassenger",
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
            selectedSearchPassenger:[],
            isChecked: [],
            toggle: "更多",
            companyFlag: 0,
            //选中的乘客姓名
            passengerNameSelected:[],
            //选中的乘客证件
            certificateSelected:[]

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
                        vm_trainPassenger.companys = data;
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
                if (vm_trainPassenger.params.companyId == '' || vm_trainPassenger.params.companyId == null) {
                    toastr.error("请先选择公司！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                vm_trainPassenger.params.page = 1;
                vm_trainPassenger.params.size = 10;
                this.searchPerson(vm_trainPassenger.params);
                $("#bookPersonModal").modal({show: true, backdrop: 'static'});
            },

            searchPerson: function (params) {
                $.ajax({
                    url: __ctx + "/train/searchBookPerson",
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
                        vm_trainPassenger.bookPersonList = data;
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
                    url: __ctx + "/train/getBookPersonDetailByEmployeeId/" + this.selectedBookPerson.bookPersonEmployeeId,
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
                            vm_trainPassenger.selectedBookPerson = data.obj;
                            vm_trainPassenger.allPassengers = [];
                            vm_trainPassenger.params.companyId = vm_trainPassenger.bookPerson.companyId = vm_trainPassenger.selectedBookPerson.bookCompanyId;
                            vm_trainPassenger.params.bookPersonName = vm_trainPassenger.bookPerson.bookPersonName = vm_trainPassenger.selectedBookPerson.bookPersonName;
                            vm_trainPassenger.params.bookPersonEmail = vm_trainPassenger.bookPerson.bookPersonEmail = vm_trainPassenger.selectedBookPerson.bookPersonEmail;
                            vm_trainPassenger.params.bookPersonPhone = vm_trainPassenger.bookPerson.bookPersonPhone = vm_trainPassenger.selectedBookPerson.bookPersonPhone;
                            vm_trainPassenger.params.bookPersonNumber = vm_trainPassenger.bookPerson.bookPersonNumber = vm_trainPassenger.selectedBookPerson.bookPersonNumber;

                            vm_trainPassenger.judgeBookPersonBookAuthority(vm_trainPassenger.selectedBookPerson);//判断权限

                            $("#selected-passenger").show();
                            $("#to-white-book").show();
                            //预订人转乘客
                            var passenger = {};
                            passenger.passengerName = vm_trainPassenger.selectedBookPerson.bookPersonName;
                            passenger.passengerEnlishName = vm_trainPassenger.selectedBookPerson.bookPersonEnlishName;
                            passenger.passengerNickname = vm_trainPassenger.selectedBookPerson.bookPersonNickname;
                            passenger.passengerCompanyId = vm_trainPassenger.selectedBookPerson.bookCompanyId;
                            passenger.passengerCompany = vm_trainPassenger.selectedBookPerson.bookCompanyName;
                            passenger.passengerDepartmentId = vm_trainPassenger.selectedBookPerson.bookDepartmentId;
                            passenger.passengerDepartmentName = vm_trainPassenger.selectedBookPerson.bookDepartmentName;
                            passenger.passengerSex = vm_trainPassenger.selectedBookPerson.bookPersonSex;
                            passenger.passengerPhone = vm_trainPassenger.selectedBookPerson.bookPersonPhone;
                            passenger.passengerEmail = vm_trainPassenger.selectedBookPerson.bookPersonEmail;
                            passenger.passengerBirthDate = vm_trainPassenger.selectedBookPerson.bookPersonBirthDate;
                            passenger.passengerEmployeeId = vm_trainPassenger.selectedBookPerson.bookPersonEmployeeId;
                            passenger.passengerNationality = vm_trainPassenger.selectedBookPerson.bookPersonNationality;
                            passenger.passengerNo = vm_trainPassenger.selectedBookPerson.bookPersonNumber;
                            passenger.passengerType = vm_trainPassenger.selectedBookPerson.bookPersonType;
                            passenger.passengerClass = vm_trainPassenger.selectedBookPerson.bookPersonClass;
                            passenger.isVip = (vm_trainPassenger.selectedBookPerson.isVip == true || vm_trainPassenger.selectedBookPerson.isVip == 1) ? 1 : 0;
                            passenger.passengerText = vm_trainPassenger.selectedBookPerson.bookPersonText;
                            passenger.certificates = vm_trainPassenger.selectedBookPerson.certificates;
                            //passenger.passengerBackupEmail = vm_trainPassenger.selectedBookPerson.bookPersonBackupEmail;
                            passenger.passengerStructure = vm_trainPassenger.selectedBookPerson.bookPersonStructure;
                            passenger.passengerStructureId = vm_trainPassenger.selectedBookPerson.bookPersonStructureId;
                            vm_trainPassenger.allPassengers.$set(vm_trainPassenger.allPassengers.length, passenger);

                            vm_trainPassenger.passengerNameSelected[0] = vm_trainPassenger.selectedBookPerson.bookPersonName;



                            $('#bookPersonModal').modal('hide');
                        }
                    }
                });

                this.getCommonPassengers(this.selectedBookPerson);
            },

            // 查找旅客
            searchPassengers: function () {
                vm_trainPassenger.passengerSearchCondition.companyId = vm_trainPassenger.selectedBookPerson.bookCompanyId;
                vm_trainPassenger.passengerSearchCondition.page = 1;
                vm_trainPassenger.passengerSearchCondition.pageSize = 5;
                this.getPassengers(vm_trainPassenger.passengerSearchCondition);
            },

            getPassengers: function (params) {
                $.ajax({
                    url: __ctx + "/train/getTrainPassengersByCondition",
                    contentType: "application/json",
                    data: JSON.stringify(params),
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error(data1.message, "查询失败", toastrConfig);
                    },
                    success: function (data) {
                        vm_trainPassenger.searchPassengerList = data;
                        //延迟加载
                        window.setTimeout(function () {
                            $(vm_trainPassenger.searchPassengerList.data).each(function (index, passenger1) {
                                $(vm_trainPassenger.allPassengers).each(function(index2,passenger2){
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
            changeCertificateSelected: function (employeeId, target, index) {
                var certi = $("#" + target + "_passengercerti" + employeeId).val();
                $("#" + target + "_certiNo" + employeeId).text(certi);
                vm_trainPassenger.certificateSelected[index] = $.trim($("#" + target + "_passengercerti" + employeeId).find("option:selected").text());
            },

            refreshAllPassengers: function () {
                var ids = [];
                for (var i = 0; i < vm_trainPassenger.allPassengers.length; i++) {
                    if (vm_trainPassenger.allPassengers[i].passengerEmployeeId != 0) {
                        ids.push(vm_trainPassenger.allPassengers[i].passengerEmployeeId);
                    } else {
                        toastr.error("非同事信息无法刷新", "", toastrConfig);
                    }
                }
                $.ajax({
                    url: __ctx + "/train/detailsByIds/",
                    data: {ids: ids.join()},
                    type: "POST",
                    error: function (data) {
                        toastr.error(data.message, "查询失败", toastrConfig);
                    },
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            vm_trainPassenger.allPassengers = data.obj;
                        }
                    }
                });
            },

            outLinkAddPassenger: function (url) {
                window.open(url + vm_trainPassenger.selectedBookPerson.bookCompanyId, "_blank");
            },

            outLinkCorporation: function (courl) {
                var outCoUrl = courl.replace('{0}', vm_trainPassenger.params.companyId);
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
                if (vm_trainPassenger.allPassengers.length <= 1) {
                    toastr.error("乘客不能少于1人", "", toastrConfig);
                    return;
                }
                vm_trainPassenger.allPassengers.$remove(passenger);

                //清除选择并且移除当前对象所在数组
                $("input[id='commonPassengers"+passenger.passengerEmployeeId+"']").prop("checked",false);
                $(vm_trainPassenger.selectedCommonPassengers).each(function (i, e) {
                    if(passenger.passengerEmployeeId == e.passengerEmployeeId){
                        vm_trainPassenger.selectedCommonPassengers.$remove(e);
                    }
                });

                $("input[id='selectedPassenger"+passenger.passengerEmployeeId+"']").prop("checked",false);
                $(vm_trainPassenger.selectedSearchPassenger).each(function (i, e) {
                    if(passenger.passengerEmployeeId == e.passengerEmployeeId){
                        vm_trainPassenger.selectedSearchPassenger.$remove(e);
                    }
                });
                vm_trainPassenger.passengerNameSelected.splice(index, 1);
                vm_trainPassenger.certificateSelected.splice(index, 1);
            },

            addPassenger: function (passenger, index) {
                if (vm_trainPassenger.allPassengers.length >= 5) {
                    toastr.error("最多五名乘客！", "", toastrConfig);
                    $("input[name='selectedPassenger']:eq(" + index + ")").prop("checked",false);
                    return;
                }

                var flag = false;
                if ($("input[name='selectedPassenger']:eq(" + index + ")").prop("checked")) {
                    for (var m = 0; m < vm_trainPassenger.allPassengers.length; m++) {
                        if (vm_trainPassenger.allPassengers[m].passengerEmployeeId == passenger.passengerEmployeeId) {
                            toastr.warning("该乘客已选择", "", toastrConfig);
                            $("input[name='selectedPassenger']:eq(" + index + ")").prop("checked",false);
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        vm_trainPassenger.selectedSearchPassenger.$set(vm_trainPassenger.selectedSearchPassenger.length, passenger);
                        vm_trainPassenger.allPassengers.$set(vm_trainPassenger.allPassengers.length, vm_trainPassenger.searchPassengerList.data[index]);
                        $("input[id='commonPassengers"+passenger.passengerEmployeeId+"']").prop("checked",true);
                    }
                    vm_trainPassenger.passengerNameSelected[vm_trainPassenger.passengerNameSelected.length] = passenger.passengerName;
                } else {
                    if (vm_trainPassenger.allPassengers.length <= 1) {
                        toastr.error("乘客不能少于1人", "", toastrConfig);
                        $("input[name='selectedPassenger']:eq(" + index + ")").prop("checked",true);
                        return;
                    }
                    vm_trainPassenger.selectedSearchPassenger = _.remove(vm_trainPassenger.selectedSearchPassenger, function (o) {
                        return o.passengerEmployeeId != passenger.passengerEmployeeId;
                    });
                    vm_trainPassenger.allPassengers = _.remove(vm_trainPassenger.allPassengers, function (o) {
                        return o.passengerEmployeeId != passenger.passengerEmployeeId;
                    });
                    $("input[id='commonPassengers"+passenger.passengerEmployeeId+"']").prop("checked",false);
                    for(var i = 0; i < vm_trainPassenger.passengerNameSelected.length; i++){
                        if(passenger.passengerName == vm_trainPassenger.passengerNameSelected[i]){
                            vm_trainPassenger.passengerNameSelected.splice(i, 1);
                            vm_trainPassenger.certificateSelected.splice(i, 1);
                        }
                    }
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
                        url: __ctx + "/itinerary/getBookPersonByItineraryNo",
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

                                    VM.judgeBookPersonBookAuthority(VM.selectedBookPerson);//判断权限

                                    $("#selected-passenger").show();
                                    $("#to-white-book").show();
                                    VM.params.bookPersonName = VM.selectedBookPerson.bookPersonName;
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
                        url: __ctx + "/itinerary/getPassengersByItineraryNo",
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
                                    vm_trainPassenger.allPassengers.$set(vm_trainPassenger.allPassengers.length, passenger);
                                });
                            }
                            $("#selected-passenger").show();
                            $("#to-white-book").show();
                        }
                    });
                }
            },

            toBook: function () {
                if (vm_trainPassenger.selectedBookPerson == null || vm_trainPassenger.selectedBookPerson.bookPersonName == undefined) {
                    toastr.error("请先选择预订人！", "", toastrConfig);
                    return;
                }
                if (vm_trainPassenger.allPassengers.length == 0) {
                    toastr.error("请添加乘客！", "", toastrConfig);
                    return;
                }
                if (vm_trainPassenger.allPassengers.length > 5) {
                    toastr.error("最多五名乘客！", "", toastrConfig);
                    return;
                }
                var data = {};
                data.bookPerson = vm_trainPassenger.selectedBookPerson;
                data.bookPerson.isVip ? data.bookPerson.isVip = 1 : data.bookPerson.isVip = 0;
                data.passengers = vm_trainPassenger.allPassengers;
                data.itineraryType = vm_trainPassenger.itineraryType;
                data.itineraryNo = vm_trainPassenger.itineraryNo;
                data.passengerNameSelected = vm_trainPassenger.passengerNameSelected;
                data.certificateSelected = vm_trainPassenger.certificateSelected;
                var certieFlag = false;
                var errorMsg = '';
                $(data.passengers).each(function (i, e) {
                    if (!e.certificates) {
                        errorMsg = errorMsg + "请修改 " + (e.passengerName==null || e.passengerName==""?e.passengerEnglishName:e.passengerName) + " 乘客的 证件 信息 " + '<br>';
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
                        if (_.indexOf([1, 2, 3, 4, 5], c[j].certificateTypeId) < 0) {
                            cerErrorMsg = cerErrorMsg + "" + (p.passengerName==null || p.passengerName==""?p.passengerEnglishName:p.passengerName) + "乘客的 证件类型 不符" + '<br>';
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
                        nameErrorMsg = nameErrorMsg + "请修改" + (p.passengerName==null || p.passengerName==""?p.passengerEnglishName:p.passengerName) + "乘客的 姓名 信息" + '<br>';
                    } else {
                        countNameFlag++;
                    }

                    if (p.passengerSex == null || p.passengerSex == "") {
                        sexErrorMsg = sexErrorMsg + "请修改" + (p.passengerName==null || p.passengerName==""?p.passengerEnglishName:p.passengerName) + "乘客的 性别 信息" + '<br>';
                    } else {
                        sexFlag++;
                    }

                    if (p.passengerBirthDate == null || p.passengerBirthDate == "") {
                        birthErrorMsg = birthErrorMsg + "请修改" + (p.passengerName==null || p.passengerName==""?p.passengerEnglishName:p.passengerName) + "乘客的 生日 信息" + '<br>';
                    } else {
                        countBirthdayFlag++;
                    }
                }

                if (countCertificateFlag != data.passengers.length) {
                    toastr.error(cerErrorMsg, "证件信息仅支持 [身份证,护照,台胞证,港澳通行证]", toastrConfig);
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

                if (vm_trainPassenger.allPassengers.length > 0) {
                    vm_trainPassenger.addCommomPassenger();
                }

                action = __ctx + '/train/queryIndex';
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
                vm_trainPassenger.passengerSearchCondition = {};
            },

            addCommomPassenger: function () {
                if (vm_trainPassenger.allPassengers.length > 0) {
                    var paramsData = {};
                    paramsData.commonPassengers = vm_trainPassenger.allPassengers;
                    paramsData.bookPerson = vm_trainPassenger.selectedBookPerson;
                    $.ajax({
                        url: __ctx + "/train/addCommonPassenger",
                        async: false,
                        data: {params: JSON.stringify(paramsData)},
                        type: "POST",
                        error: function (data1) {
                            toastr.error("查询失败", "", toastrConfig);
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
            },

            deleteCommonPassenger: function () {
                if (vm_trainPassenger.selectedCommonPassengers.length > 0) {
                    var data = {};
                    var commonPassengers = [];
                    commonPassengers = vm_trainPassenger.selectedCommonPassengers;
                    data.commonPassengers = commonPassengers;
                    data.bookPerson = vm_trainPassenger.selectedBookPerson;
                    var selectedBookPerson = vm_trainPassenger.selectedBookPerson;
                    $.ajax({
                        url: __ctx + "/train/deleteCommonPassenger",
                        data: {params: JSON.stringify(data)},
                        type: "POST",
                        error: function (data) {
                            toastr.error(data.message, "", toastrConfig);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "删除失败", toastrConfig);
                            } else {
                                toastr.info(data.message, "", toastrConfig);
                                vm_trainPassenger.getCommonPassengers(selectedBookPerson);
                            }
                        }
                    });
                }
                vm_trainPassenger.selectedCommonPassengers = [];
            },

            getCommonPassengers: function (params) {
                $.ajax({
                    url: __ctx + "/train/getCommonPassengers",
                    data: {
                        employeeId: params.bookPersonEmployeeId
                    },
                    type: "POST",
                    datatype: "json",
                    error: function (data) {
                        toastr.error("查询常用旅客失败！", "", toastrConfig);
                    },
                    success: function (data) {
                        //已有乘客默认勾选
                        var array1 = data.obj;
                        for (var i = 0; i < array1.length; i++) {
                            var arry = false;
                            $(vm_trainPassenger.allPassengers).each(function(index,e){
                                if(e.passengerEmployeeId == array1[i].passengerEmployeeId){
                                    arry = true;
                                }
                            });
                            vm_trainPassenger.isChecked.$set(i, arry);
                        }

                        vm_trainPassenger.commonPassengers = data.obj;
                    }
                });
            },
            showMoreCommonPassenger: function (val) {
                if (val == "更多") {
                    vm_trainPassenger.toggle = "收起";
                    $("#moreCommomPassengers").css("height", "auto");
                } else {
                    vm_trainPassenger.toggle = "更多";
                    $("#moreCommomPassengers").css("height", "32px");
                }
            },

            checkCommonPassengers: function (passengerEmployeeId, passengerName, index) {
                var flag = false;
                if ($("input[name='commonPassengers']:eq(" + index + ")").prop("checked")) {
                    if (vm_trainPassenger.allPassengers.length > 4) {
                        toastr.error("最多五名乘客！", "", toastrConfig);
                        $("input[name='commonPassengers']:eq(" + index + ")").prop("checked",false);
                        return;
                    }

                    $.ajax({
                        url: __ctx + "/train/detailsByIds/",
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
                                    for (var m = 0; m < vm_trainPassenger.allPassengers.length; m++) {
                                        //vm_trainPassenger.selectedCommonPassengers.$set(vm_trainPassenger.selectedCommonPassengers.length, data.obj[0]);
                                        if (vm_trainPassenger.allPassengers[m].passengerEmployeeId == passengerEmployeeId) {
                                            toastr.warning("该乘客已选择", "", toastrConfig);
                                            $("input[name='commonPassengers']:eq(" + index + ")").prop("checked",false);
                                            flag = true;
                                            break;
                                        }
                                    }
                                }
                                if (!flag) {
                                    if (data.obj.length > 0) {
                                        vm_trainPassenger.allPassengers.$set(vm_trainPassenger.allPassengers.length, data.obj[0]);
                                    } else {
                                        vm_trainPassenger.allPassengers.$set(vm_trainPassenger.allPassengers.length, vm_trainPassenger.commonPassengers[index]);
                                    }
                                    vm_trainPassenger.selectedCommonPassengers.$set(vm_trainPassenger.selectedCommonPassengers.length, vm_trainPassenger.commonPassengers[index]);
                                    $("input[id='selectedPassenger"+passengerEmployeeId+"']").prop("checked",true);
                                }
                            }
                        }
                    });
                    vm_trainPassenger.passengerNameSelected[vm_trainPassenger.passengerNameSelected.length] = passengerName;
                } else {
                    if (vm_trainPassenger.allPassengers.length <= 1) {
                        toastr.error("乘客不能少于1人", "", toastrConfig);
                        $("input[name='commonPassengers']:eq(" + index + ")").prop("checked",true);
                        return;
                    }
                    vm_trainPassenger.selectedCommonPassengers = _.remove(vm_trainPassenger.selectedCommonPassengers, function (o) {
                        return o.passengerEmployeeId != passengerEmployeeId;
                    });
                    vm_trainPassenger.allPassengers = _.remove(vm_trainPassenger.allPassengers, function (o) {
                        return o.passengerEmployeeId != passengerEmployeeId;
                    });
                    $("input[id='selectedPassenger"+passengerEmployeeId+"']").prop("checked",false);
                    for(var i = 0; i < vm_trainPassenger.passengerNameSelected.length; i++){
                        if(passengerName == vm_trainPassenger.passengerNameSelected[i]){
                            vm_trainPassenger.passengerNameSelected.splice(i, 1);
                            vm_trainPassenger.certificateSelected.splice(i, 1);
                        }
                    }
                }
            },

            judgeBookPersonBookAuthority:function(selectedBookPerson){
                //0默认全部选中，产品代订范围：国内机票:DA、国际机票:IA、国内酒店:DH、国际酒店:IH、火车票:TA、保险:DI、增值业务:DV
                if ((selectedBookPerson.bookAuthority == 2 || selectedBookPerson.bookAuthority == 3) && (selectedBookPerson.productTypeId == null || selectedBookPerson.productTypeId == "" || selectedBookPerson.productTypeId.indexOf("0") >=0 || selectedBookPerson.productTypeId.indexOf("TA") >=0)) {
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
                vm_trainPassenger.getCorporationAuthority(param.company.value);
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
                                vm_trainPassenger.companyName = param.company.options[param.company.options.selectedIndex].text;
                                vm_trainPassenger.companyFlag = 2;
                            } else if (data.obj.canBookWithOverDue==0 && data.obj.hasOverDue=='Y') {
                                $("#cancellationOrder").modal('show');
                                vm_trainPassenger.companyName = param.company.options[param.company.options.selectedIndex].text;
                                vm_trainPassenger.companyFlag = 1;
                            } else if (data.obj.hasOverDue=='N') {
                                vm_trainPassenger.companyFlag = 0;
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
            vm_trainPassenger.params = vm_trainPassenger.selectedBookPerson = bookPersonAndPassengers.bookPerson;
            vm_trainPassenger.allPassengers = bookPersonAndPassengers.passengers;
            vm_trainPassenger.itineraryType = bookPersonAndPassengers.itineraryType;
            vm_trainPassenger.itineraryNo = bookPersonAndPassengers.itineraryNo;
            vm_trainPassenger.getCommonPassengers(vm_trainPassenger.selectedBookPerson);

            vm_trainPassenger.judgeBookPersonBookAuthority(vm_trainPassenger.selectedBookPerson);//判断权限

            $("#selected-passenger").show();
            $("#to-white-book").show();
        }
    } else {
        sessionStorage.clear();
    }
});