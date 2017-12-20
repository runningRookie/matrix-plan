var vm;
$(document).ready(function () {

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

    Vue.filter('toPassengerClass', {
        read: function (value, format) {
            if (value == 'a') {
                return '成人';
            } else if (value == 'c') {
                return '儿童';
            } else {
                return "婴儿";
            }

        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('toPassengerType', {
        read: function (value, format) {
            if (value == '1' || value == 'i') {
                return '员工';
            } else {
                return "客人";
            }

        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('passengerName', function (item) {
        if (item) {
            if (item.passengerChineseName && !item.passengerEnlishName) {
                return item.passengerChineseName;
            } else if (!item.passengerChineseName && item.passengerEnlishName) {
                if (item.passengerEnlishName == "/") {
                    return "";
                } else {
                    return item.passengerEnlishName;
                }
            } else if (item.passengerChineseName && item.passengerEnlishName) {
                if (item.passengerEnlishName == "/") {
                    return item.passengerChineseName;
                } else {
                    return item.passengerChineseName + "(" + item.passengerEnlishName + ")";
                }
            }
        } else {
            return "";
        }
    });

    // $('#passengerPhone').bootstrapValidator({
    //      message: 'This value is not valid',
    //      feedbackIcons: {/*input状态样式图片*/
    //          valid: 'glyphicon glyphicon-ok',
    //          invalid: 'glyphicon glyphicon-remove',
    //          validating: 'glyphicon glyphicon-refresh'
    //      },
    //      fields: {/*验证：规则*/
    //          phone: {
    //              message: 'The phone is not valid',
    //              validators: {
    //                  notEmpty: {
    //                      message: '手机号码不能为空'
    //                  },
    //                  stringLength: {
    //                      min: 11,
    //                      max: 11,
    //                      message: '请输入11位手机号码'
    //                  },
    //                  regexp: {
    //                      regexp: /^1[3|5|8]{1}[0-9]{9}$/,
    //                      message: '请输入正确的手机号码'
    //                  }
    //              }
    //          },

    //      }
    //  })

    vm = new Vue({
        el: '#bookform',
        data: {
            itineraryType: 1,
            itineraryNo: itineraryNo,
            employeeId: employeeId,
            companys: [],
            bookPerson: {
                companyId: '',
                bookPersonName: '',
                bookPersonEmail: '',
                bookPersonMobile: '',
                bookPersonNo: ''
            },
            bookPersonList: {},
            selectedBookPerson: {},
            commonPassengers: {},
            passengerSearchCondition: {
                condition: "",
                companyId: 0
            },
            searchPassengerList: {},
            selectedCommonPassengers: [],
            isChecked: [[]],
            selectedSearchPassenger: [],
            outerPassenger: {
                passengerEmployeeId: 0,
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
            allPassengers: [],
            nationalitys: [],
            companyName: '',
            companyFlag: 0
        },
        ready: function () {
            $("#bookperson_company_div").hide();
            $("#bookperson_phone_div").hide();
            $("#bookperson_email_div").hide();
            $("#bookperson_text_div").hide();
            $("#passenger-to-add").hide();
            $("#outLinkAddPassenger").hide();
            this.getNationalitys();
            if (this.itineraryNo != '') {
                this.getBookPersonByItineraryNo();
                //this.getItineraryPassenger();
                $("#searchBookPerson").hide();
            } else {
                $("#searchBookPerson").show();
            }

            if (this.employeeId != '' && this.employeeId != null) {
                this.selectedBookPerson.bookPersonEmployeeId = this.employeeId;
                console.log(this.selectedBookPerson.bookPersonEmployeeId);
                this.setBookPerson();
            }

            if (window.bookPersonAndPassengers) {
                this.selectedBookPerson = window.bookPersonAndPassengers.bookPerson;
                this.allPassengers = window.bookPersonAndPassengers.passengers;
                this.bookPerson.companyId = this.selectedBookPerson.bookCompanyId;
                if (this.selectedBookPerson.bookPersonName != "" && this.selectedBookPerson.bookPersonName != null) {
                    this.bookPerson.bookPersonName = this.selectedBookPerson.bookPersonName;
                } else {
                    this.bookPerson.bookPersonName = this.selectedBookPerson.bookPersonEnlishName;
                }
                this.bookPerson.bookPersonEmail = this.selectedBookPerson.bookPersonEmail;
                this.bookPerson.bookPersonMobile = this.selectedBookPerson.bookPersonPhone;
                this.bookPerson.bookPersonNo = this.selectedBookPerson.bookPersonNumber;

                this.judgeBookPersonBookAuthority(this.selectedBookPerson);
                $('#bookPersonModal').modal('hide');
                getCommonPassengers(this.selectedBookPerson);
            }

        },
        methods: {
            getCorporationAuthority: function (companyId) {
                $.ajax({
                    url: __ctx + "/tmcCorporation/getCorporationAuthority?corporationId=" + companyId,
                    contentType: "application/json",
                    datatype: "json",
                    async: false,
                    error: function (data1) {
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        if (data.result && data.obj) {
                            var obj = data.obj;
                            var array = [];
                            if (obj.domesticAirport == 1) {
                                array.push("国内机票");
                            }
                            if (obj.internationalAirport == 1) {
                                array.push("国际机票");
                            }
                            ;
                            if (obj.domesticHotel == 1) {
                                array.push("国内酒店");
                            }
                            if (obj.internationalHotel == 1) {
                                array.push("国际酒店");
                            }
                            ;
                            if (obj.train == 1) {
                                array.push("火车票");
                            }
                            if (obj.car == 1) {
                                array.push("用车");
                            }
                            ;
                            if (array.length > 0) {
                                $("#corporationBookAuthority").text(array.toString().replace(new RegExp(",", "gm"), "、"));
                            } else {
                                $("#corporationBookAuthority").text('');
                            }
                            ;
                        }
                        ;
                    }
                });
            },
            searchBookPersons: function () {
                if (vm.bookPerson.companyId == '' || vm.bookPerson.companyId == null) {
                    toastr.error("请先选择公司！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                searchPerson(vm.bookPerson);

                $("#bookPersonModal").modal({
                    show: true,
                    //   remote : __ctx + "/itinerary/bookpersonlist",
                    backdrop: 'static'
                });
            },
            queryData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.bookPerson, pageInfo);
                }
                else {
                    this.bookPerson.page = 1;
                    this.bookPerson.pageSize = 15;
                }
                searchPerson(this.bookPerson);
            },
            selectBookPerson: function (index, person) {
                if ($("input:radio:eq(" + index + ")").is(":checked")) {
                    this.selectedBookPerson = person;
                } else {
                    this.selectedBookPerson = {}
                }

            },
            setBookPerson: function () {
                if (this.selectedBookPerson.bookPersonEmployeeId == '' || this.selectedBookPerson.bookPersonEmployeeId == null || this.selectedBookPerson.bookPersonEmployeeId == 'undefined') {
                    $('#bookPersonModal').modal('hide');
                    return;
                }
                //精确确定预定人信息
                $.ajax({
                    url: __ctx + "/itinerary/getBookPersonDetailByEmployeeId/" + this.selectedBookPerson.bookPersonEmployeeId,
                    contentType: "application/json",
                    type: "GET",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            vm.selectedBookPerson = data.obj;
                            vm.allPassengers = [];
                            vm.bookPerson.companyId = vm.selectedBookPerson.bookCompanyId;
                            if (vm.selectedBookPerson.bookPersonName != "" && vm.selectedBookPerson.bookPersonName != null) {
                                vm.bookPerson.bookPersonName = vm.selectedBookPerson.bookPersonName;
                            } else {
                                vm.bookPerson.bookPersonName = vm.selectedBookPerson.bookPersonEnlishName;
                            }
                            vm.bookPerson.bookPersonEmail = vm.selectedBookPerson.bookPersonEmail;
                            vm.bookPerson.bookPersonMobile = vm.selectedBookPerson.bookPersonPhone;
                            vm.bookPerson.bookPersonNo = vm.selectedBookPerson.bookPersonNumber;
                            // $("#editable-select").val(this.bookPerson.companyName);
                            // $("#editable-select_sele").val(this.bookPerson.companyName);
                            // alert($("#editable-select").find("value"));
                            // $("#editable-select").find("option[text='公司1']").attr("selected",true);
                            $("#bookperson_company_sele").val(vm.selectedBookPerson.bookCompanyName);
                            //预订人转乘客
                            var passenger = {};
                            passenger.passengerChineseName = vm.selectedBookPerson.bookPersonName;
                            passenger.passengerEnlishName = vm.selectedBookPerson.bookPersonEnlishName;
                            passenger.passengerNickname = vm.selectedBookPerson.bookPersonNickname;
                            passenger.passengerCompanyId = vm.selectedBookPerson.bookCompanyId;
                            passenger.passengerCompany = vm.selectedBookPerson.bookCompanyName;
                            passenger.passengerDepartmentId = vm.selectedBookPerson.bookDepartmentId;
                            passenger.passengerDepartmentName = vm.selectedBookPerson.bookDepartmentName;
                            passenger.passengerSex = vm.selectedBookPerson.bookPersonSex;
                            passenger.passengerPhone = vm.selectedBookPerson.bookPersonPhone;
                            passenger.passengerEmail = vm.selectedBookPerson.bookPersonEmail;
                            passenger.passengerBirthDate = vm.selectedBookPerson.bookPersonBirthDate;
                            passenger.passengerEmployeeId = vm.selectedBookPerson.bookPersonEmployeeId;
                            passenger.passengerNationality = vm.selectedBookPerson.bookPersonNationality;
                            passenger.passengerNo = vm.selectedBookPerson.bookPersonNumber;
                            passenger.passengerType = vm.selectedBookPerson.bookPersonType;
                            passenger.passengerClass = vm.selectedBookPerson.bookPersonClass;
                            passenger.isVip = vm.selectedBookPerson.isVip;
                            passenger.passengerText = vm.selectedBookPerson.bookPersonText;
                            passenger.certificates = vm.selectedBookPerson.certificates;
                            //passenger.passengerBackupEmail = vm.selectedBookPerson.bookPersonBackupEmail;
                            passenger.passengerStructure = vm.selectedBookPerson.bookPersonStructure;
                            passenger.passengerStructureId = vm.selectedBookPerson.bookPersonStructureId;
                            passenger.englishLastName = vm.selectedBookPerson.englishLastName;
                            passenger.englishFirstName = vm.selectedBookPerson.englishFirstName;
                            vm.allPassengers.$set(vm.allPassengers.length, passenger);

                            $("#bookperson_company_div").show();
                            $("#bookperson_phone_div").show();
                            $("#bookperson_email_div").show();
                            $("#bookperson_text_div").show();
                            $("#bookperson_company_selected").text(vm.selectedBookPerson.bookCompanyName);
                            $("#bookperson_phone_selected").text(vm.selectedBookPerson.bookPersonPhone);
                            $("#bookperson_phone_selected").text(vm.selectedBookPerson.bookPersonPhone);
                            $("#bookperson_email_selected").text(vm.selectedBookPerson.bookPersonEmail);

                            vm.judgeBookPersonBookAuthority(vm.selectedBookPerson);//判断权限

                            $('#bookPersonModal').modal('hide');
                            getCommonPassengers(vm.selectedBookPerson);
                        }
                    }
                });

            },
            selectPassengers: function () {

                getCommonPassengers(vm.selectedBookPerson);

                vm.searchPassengerList = {};

                $("#passengerModel").modal({
                    show: true,
                    //   remote : __ctx + "/itinerary/bookpersonlist",
                    backdrop: 'static'
                });
            },
            searchPassengers: function () {
                if (!vm.selectedBookPerson.bookPersonEmployeeId) {
                    toastr.error("请选择预订人", "", toastrConfig);
                    return;
                }
                if (vm.selectedBookPerson.bookAuthority != 2 && vm.selectedBookPerson.bookAuthority != 3) {
                    toastr.error("当前预订人无代订权限", "", toastrConfig);
                    return;
                }
                vm.passengerSearchCondition.companyId = vm.selectedBookPerson.bookCompanyId;
                vm.passengerSearchCondition.page = 1;
                vm.passengerSearchCondition.pageSize = 5;
                getPassengers(vm.passengerSearchCondition);
            },
            selectCommonPassenger: function (index, index2, passenger) {

                if ($("input[id='commonPassengers" + passenger.passengerEmployeeId + "']").prop("checked")) {
                    if (vm.allPassengers.length > 8) {
                        toastr.error("最多九名乘客！", "", toastrConfig);
                        $("input[id='commonPassengers" + passenger.passengerEmployeeId + "']").prop("checked", false);
                        return;
                    }

                    //精确搜索出行人
                    if (passenger.passengerEmployeeId) {
                        $.ajax({
                            url: __ctx + "/itinerary/getPassengerDetailByEmployeeId/" + passenger.passengerEmployeeId,
                            contentType: "application/json",
                            type: "GET",
                            datatype: "json",
                            error: function (data1) {
                                toastr.error(data1.message, "请求失败", toastrConfig);
                            },
                            success: function (data) {
                                if (!data.result) {
                                    toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                } else {
                                    var flag = false;
                                    $(vm.allPassengers).each(function (i, e2) {
                                        if (e2.passengerEmployeeId == data.obj.passengerEmployeeId) {
                                            toastr.warning("该乘客已选择", "", toastrConfig);
                                            $("input[id='commonPassengers" + passenger.passengerEmployeeId + "']").prop("checked", false);
                                            flag = true;
                                        }
                                    });
                                    if (!flag) {
                                        vm.selectedCommonPassengers.$set(vm.selectedCommonPassengers.length, passenger);
                                        vm.allPassengers.$set(vm.allPassengers.length, data.obj);
                                        $("input[id='searchPassenger" + passenger.passengerEmployeeId + "']").prop("checked", true);
                                    }
                                }
                            }
                        });
                    } else {
                        toastr.error("员工ID信息异常", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        $("input[id='commonPassengers" + passenger.passengerEmployeeId + "']").prop("checked", false);
                    }
                } else {
                    /*_.forEach(vm.selectedCommonPassengers, function (item, i) {
                     if (vm.selectedCommonPassengers[i] != null && passenger.passengerName == vm.selectedCommonPassengers[i].passengerName) {
                     vm.selectedCommonPassengers.$remove(vm.selectedCommonPassengers[i]);
                     }
                     });*/
                    if (vm.allPassengers.length <= 1) {
                        toastr.error("乘客不能少于1人", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        $("input[id='commonPassengers" + passenger.passengerEmployeeId + "']").prop("checked", true);
                        return;
                    }
                    vm.allPassengers = _.remove(vm.allPassengers, function (o) {
                        return o.passengerEmployeeId != passenger.passengerEmployeeId;
                    });
                    vm.selectedCommonPassengers = _.remove(vm.selectedCommonPassengers, function (o) {
                        return o.passengerEmployeeId != passenger.passengerEmployeeId;
                    });
                    $("input[id='searchPassenger" + passenger.passengerEmployeeId + "']").prop("checked", false);
                }

            },
            selectSearchPassenger: function (index, passenger) {
                //添加搜索的乘客
                if ($("input:checkbox[name='searchPassenger']:eq(" + index + ")").prop("checked")) {
                    if (vm.allPassengers.length > 8) {
                        toastr.error("最多九名乘客！", "", toastrConfig);
                        $("input[name='searchPassenger']:eq(" + index + ")").prop("checked", false);
                        return;
                    }

                    //显示已选择乘客
                    //$(vm.selectedSearchPassenger).each(function (i, e) {
                    //精确搜索出行人
                    if (passenger.passengerEmployeeId) {
                        $.ajax({
                            url: __ctx + "/itinerary/getPassengerDetailByEmployeeId/" + passenger.passengerEmployeeId,
                            contentType: "application/json",
                            type: "GET",
                            datatype: "json",
                            error: function (data1) {
                                toastr.error(data.message, "查询失败", toastrConfig);
                            },
                            success: function (data) {
                                if (!data.result) {
                                    toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                } else {
                                    var flag = false;
                                    $(vm.allPassengers).each(function (i, e2) {
                                        if (e2.passengerEmployeeId == data.obj.passengerEmployeeId) {
                                            toastr.warning("该乘客已选择", "", toastrConfig);
                                            $("input[name='searchPassenger']:eq(" + index + ")").prop("checked", false);
                                            flag = true;
                                        }
                                    });
                                    if (!flag) {
                                        vm.selectedSearchPassenger.$set(vm.selectedSearchPassenger.length, passenger);
                                        vm.allPassengers.$set(vm.allPassengers.length, data.obj);
                                        $("input[id='commonPassengers" + passenger.passengerEmployeeId + "']").prop("checked", true);
                                    }
                                }
                            }
                        });
                    } else {
                        toastr.error("员工ID信息异常", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        $("input[name='searchPassenger']:eq(" + index + ")").prop("checked", false);
                        //vm.allPassengers.$set(vm.allPassengers.length, _.cloneDeep(passenger));
                    }
                    //});
                } else {
                    if (vm.allPassengers.length <= 1) {
                        toastr.error("乘客不能少于1人", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        $("input[name='searchPassenger']:eq(" + index + ")").prop("checked", true);
                        return;
                    }
                    vm.allPassengers = _.remove(vm.allPassengers, function (o) {
                        return o.passengerEmployeeId != passenger.passengerEmployeeId;
                    });
                    vm.selectedSearchPassenger = _.remove(vm.selectedSearchPassenger, function (o) {
                        return o.passengerEmployeeId != passenger.passengerEmployeeId;
                    });
                    $("input[id='commonPassengers" + passenger.passengerEmployeeId + "']").prop("checked", false);
                }

            },
            changeCertificate: function (employeeId) {
                var certi = $("#passengercerti" + employeeId).val();
                $("#certiNo" + employeeId).text(certi);
            },
            setPassengers: function () {
                //vm.outerPassenger.passengerNationality = $("#nationality").val();
                if (vm.selectedBookPerson.bookAuthority != 3 && vm.outerPassenger.passengerName != '') {
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
                    //精确搜索出行人
                    if (e.passengerEmployeeId) {
                        $.ajax({
                            url: __ctx + "/itinerary/getPassengerDetailByEmployeeId/" + e.passengerEmployeeId,
                            contentType: "application/json",
                            type: "GET",
                            datatype: "json",
                            error: function (data1) {
                                toastr.error(data.message, "查询失败", toastrConfig);
                            },
                            success: function (data) {
                                if (!data.result) {
                                    toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                } else {
                                    var flag = false;
                                    $(vm.allPassengers).each(function (i, e2) {
                                        if (e2.passengerEmployeeId == data.obj.passengerEmployeeId) {
                                            flag = true;
                                        }
                                    });
                                    if (!flag) {
                                        vm.allPassengers.$set(vm.allPassengers.length, data.obj);
                                    }
                                }
                            }
                        });
                    } else {
                        vm.allPassengers.$set(vm.allPassengers.length, _.cloneDeep(e));
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
                            toastr.error(data.message, "查询失败", toastrConfig);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            } else {
                                var flag = false;
                                $(vm.allPassengers).each(function (i, e2) {
                                    if (e2.passengerEmployeeId == data.obj.passengerEmployeeId) {
                                        flag = true;
                                    }
                                });
                                if (!flag) {
                                    vm.allPassengers.$set(vm.allPassengers.length, data.obj);
                                }
                            }
                        }
                    });
                });
                if (vm.outerPassenger.passengerName != "") {
                    $.ajax({
                        url: __ctx + "/itinerary/addEmployeeInfo",
                        contentType: "application/json",
                        type: "POST",
                        datatype: "json",
                        async: false,
                        data: {
                            passengerDTO: vm.outerPassenger
                        },
                        error: function (data1) {
                            toastr.error(data.message, "查询失败", toastrConfig);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            } else {
                                vm.outerPassenger.passengerEmployeeId = data.obj;
                            }
                        }
                    });
                    vm.allPassengers.$set(vm.allPassengers.length, _.cloneDeep(vm.outerPassenger));
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
                    bookPerson.bookPersonEmployeeId = vm.selectedBookPerson.bookPersonEmployeeId;
                    data.bookPerson = bookPerson;
                    $.ajax({
                        url: __ctx + "/itinerary/addPassenger",
                        contentType: "application/json",
                        data: JSON.stringify(data),
                        type: "POST",
                        datatype: "json",
                        error: function (data1) {
                            toastr.error(data1.message, "请求失败", toastrConfig);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error('添加成功，' + data.message, "", {
                                    timeOut: 2000,
                                    positionClass: "toast-top-center"
                                });
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

            },
            changeCertificateSelected: function (employeeId) {
                var certificateTypeId = $("#selected_passengercerti" + employeeId).val();
                $(vm.allPassengers).each(function (i, e) {
                    if(employeeId == e.passengerEmployeeId){
                        $(e.certificates).each(function (j,e2) {
                            if(e2.certificateTypeId == certificateTypeId){
                                $("#selected_certiNo" + employeeId).text(e2.certificateCode);
                            }
                        });
                    }
                });
            },
            changePassengerName: function (employeeId) {
                if($("#selected_passengername" + employeeId).find("option:selected").attr("passengernametype") == 'EN'){
                    $(vm.allPassengers).each(function (i, e) {
                        if(employeeId == e.passengerEmployeeId){
                            var find = e.certificates.filter(function (item) {
                                return item.certificateTypeId == 3;
                            });
                            if(find.length > 0){
                                $("#selected_passengercerti" + employeeId).val(3);
                            }
                        }
                    });
                }
                this.changeCertificateSelected(employeeId);
            },
            removePassenger: function (index, passenger) {
                if (vm.allPassengers.length <= 1) {
                    toastr.error("乘客不能少于1人", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                vm.allPassengers.$remove(passenger);
                //清除选择并且移除当前对象所在数组
                $("input[id='commonPassengers" + passenger.passengerEmployeeId + "']").prop("checked", false);
                $(vm.selectedCommonPassengers).each(function (i, e) {
                    if (passenger.passengerEmployeeId == e.passengerEmployeeId) {
                        vm.selectedCommonPassengers.$remove(e);
                    }
                });

                $("input[id='searchPassenger" + passenger.passengerEmployeeId + "']").prop("checked", false);
                $(vm.selectedSearchPassenger).each(function (i, e) {
                    if (passenger.passengerEmployeeId == e.passengerEmployeeId) {
                        vm.selectedSearchPassenger.$remove(e);
                    }
                });
            },
            createItinerary: function () {

                if (vm.selectedBookPerson == null || vm.selectedBookPerson.bookPersonName == undefined) {
                    toastr.error("请先选择预订人！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (vm.allPassengers.length == 0) {
                    toastr.error("请添加乘客！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                var data = {};
                data.bookPerson = vm.selectedBookPerson;
                data.passengers = vm.allPassengers;
                data.itineraryType = vm.itineraryType;
                $.ajax({
                    url: __ctx + "/itinerary/createItinerary",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error(data.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            window.location.href = __ctx + 'itinerary/addProduct?itineraryId=' + data.obj;
                        }
                    }
                });
            },
            addSearchPassenger: function (bookPersonEmployeeId) {
                //搜索乘客
                if (bookPersonEmployeeId) {
                    $.ajax({
                        url: __ctx + "/itinerary/getPassengerDetailByEmployeeId/" + bookPersonEmployeeId,
                        contentType: "application/json",
                        type: "GET",
                        datatype: "json",
                        async: false,
                        error: function (data1) {
                            toastr.error(data.message, "请求失败", toastrConfig);
                        },
                        success: function (data) {
                            if (!data.result) {
                                toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            } else {
                                vm.selectedSearchPassenger.$set(vm.selectedSearchPassenger.length, data.obj);
                            }
                        }
                    });
                }
            },
            addCommonPassenger: function () {
                if (vm.allPassengers.length > 0) {
                    var dataAdd = {};
                    var commonPassengers = [];
                    if (vm.allPassengers.length > 0) {
                        commonPassengers = vm.allPassengers;
                    }

                    // if (vm.outerPassenger.passengerName != "") {
                    //     commonPassengers.$set(commonPassengers.length, _.cloneDeep(vm.outerPassenger));
                    // }

                    dataAdd.commonPassengers = commonPassengers;
                    var bookPerson = {};
                    bookPerson.bookPersonEmployeeId = vm.selectedBookPerson.bookPersonEmployeeId;
                    dataAdd.bookPerson = bookPerson;
                    $.ajax({
                        url: __ctx + "/itinerary/addPassenger",
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
                if (vm.selectedCommonPassengers.length > 0) {
                    var dataDelete = {};
                    var commonPassengers = [];

                    commonPassengers = vm.selectedCommonPassengers;

                    dataDelete.commonPassengers = commonPassengers;
                    dataDelete.bookPerson = vm.selectedBookPerson;
                    var selectedBookPerson = vm.selectedBookPerson;
                    if (vm.selectedCommonPassengers.length == 1 && selectedBookPerson != null && selectedBookPerson.bookPersonEmployeeId == vm.selectedCommonPassengers[0].passengerEmployeeId) {
                        toastr.error("不允许删除预订人！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    $.ajax({
                        url: __ctx + "/itinerary/deletePassenger",
                        contentType: "application/json",
                        data: JSON.stringify(dataDelete),
                        type: "POST",
                        datatype: "json",
                        error: function (data1) {
                            toastr.error(data1.message, "请求失败", toastrConfig);
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
            },
            refreshAllPassengers: function () {
                var ids = [];
                for (var i = 0; i < vm.allPassengers.length; i++) {
                    if (vm.allPassengers[i].passengerEmployeeId != 0) {
                        ids.push(vm.allPassengers[i].passengerEmployeeId);
                    } else {
                        toastr.error("非同事信息无法刷新", "", toastrConfig);
                    }
                }
                $.ajax({
                    url: __ctx + "/itinerary/detailsByIds/",
                    data: {ids: ids.join()},
                    type: "POST",
                    error: function (data) {
                        toastr.error(data.message, "查询失败", toastrConfig);
                    },
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            vm.allPassengers = data.obj;
                        }
                    }
                });
            },
            outLinkAddPassenger: function (url) {
                window.open(url + vm.selectedBookPerson.bookCompanyId, "_blank");
            },

            outLinkCorporation: function (courl) {
                var outCoUrl = courl.replace('{0}', vm.selectedBookPerson.bookCompanyId);
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
            toBook: function (orderType) {
                if (vm.selectedBookPerson == null || vm.selectedBookPerson.bookPersonName == undefined) {
                    toastr.error("请先选择预订人！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (vm.allPassengers.length == 0) {
                    toastr.error("请添加乘客！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if (vm.allPassengers.length > 9) {
                    toastr.error("乘客不能多于9人！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                var data = {};
                data.bookPerson = vm.selectedBookPerson;
                data.passengers = _.map(vm.allPassengers, function (item) {
                    item.isVip = item.isVip ? 1 : 0;
                    item.passengerName = $("#selected_passengername" + item.passengerEmployeeId).val();
                    //指定元素排序
                    var arr = item.certificates;
                    var certificateTypeId = $("#selected_passengercerti" + item.passengerEmployeeId).val();
                    for (var i = 0; i < arr.length; i++) {
                        var certificate = arr[i];
                        if (certificate.certificateTypeId == certificateTypeId) {
                            arr.splice(i, 1);
                            arr.unshift(certificate);
                        }
                    }

                    _.unset(item, 'orderItemId');
                    return item;
                });
                data.itineraryType = vm.itineraryType;
                data.itineraryNo = vm.itineraryNo;

                //判断乘客信息
                if (vm.judgePassengerInfo(data.passengers)) {
                    return;
                }

                /*if (vm.selectedBookPerson.bookPersonEmployeeId) {
                 vm.addSearchPassenger(vm.selectedBookPerson.bookPersonEmployeeId);
                 }*/
                //添加常用旅客
                if (vm.allPassengers.length > 0) {
                    vm.addCommonPassenger();
                }
                var action = '';
                if (orderType == 'manual') {
                    action = __ctx + "/flightManualOrder/flightManualBook";
                }
                if (orderType == 'cct') {
                    var flag = false;
                    $(data.passengers).each(function (i, e) {
                        if (e.passengerClass == 'b' || e.passengerClass == 'c') {
                            flag = true;
                        }
                    });
                    if (flag) {
                        toastr.error("乘客中存在儿童或者婴儿,请选择手工预订！", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                        return;
                    }
                    action = __ctx + '/flights/list';
                }
                var form = $("<form></form>");
                form.attr('action', action)
                form.attr('method', 'post')
                var input = $("<input type='text' id='bookdate' name='bookPersonAndPassengersDTOStr'/>");
                form.append(input);
                form.appendTo("body")
                form.css('display', 'none');
                $("#bookdate").val(JSON.stringify(data));
                sessionStorage.clear();
                sessionStorage.bookPersonAndPassengers = JSON.stringify(data);
                form.submit();
            },
            getNationalitys: function () {
                var thisVM = this;
                $.ajax({
                    url: __ctx + "/resource/nationalitys",
                    //data: parms,
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error(data.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        thisVM.nationalitys = data;
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
                getPassengers(this.passengerSearchCondition);
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
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        if (data.result) {
                            if (data.obj) {
                                VM.selectedBookPerson = data.obj;
                                $("#bookperson_company_div").show();
                                $("#bookperson_phone_div").show();
                                $("#bookperson_email_div").show();
                                $("#bookperson_text_div").show();
                                $("#bookperson_company_selected").text(VM.selectedBookPerson.bookCompanyName);
                                $("#bookperson_phone_selected").text(VM.selectedBookPerson.bookPersonPhone);
                                $("#bookperson_phone_selected").text(VM.selectedBookPerson.bookPersonPhone);
                                $("#bookperson_email_selected").text(VM.selectedBookPerson.bookPersonEmail);

                                VM.judgeBookPersonBookAuthority(VM.selectedBookPerson);

                                if (VM.selectedBookPerson.bookPersonName != "" && VM.selectedBookPerson.bookPersonName != null) {
                                    VM.bookPerson.bookPersonName = VM.selectedBookPerson.bookPersonName;
                                } else {
                                    VM.bookPerson.bookPersonName = VM.selectedBookPerson.bookPersonEnlishName;
                                }
                                VM.bookPerson.companyId = VM.selectedBookPerson.bookCompanyId;
                                VM.bookPerson.bookPersonEmail = VM.selectedBookPerson.bookPersonEmail;
                                VM.bookPerson.bookPersonMobile = VM.selectedBookPerson.bookPersonPhone;
                                VM.bookPerson.bookPersonNo = VM.selectedBookPerson.bookPersonNumber;

                                //预订人转乘客
                                var passenger = {};
                                passenger.passengerChineseName = VM.selectedBookPerson.bookPersonName;
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
                                passenger.isVip = VM.selectedBookPerson.isVip;
                                passenger.passengerText = VM.selectedBookPerson.bookPersonText;
                                passenger.certificates = VM.selectedBookPerson.certificates;
                                //passenger.passengerBackupEmail = vm.selectedBookPerson.bookPersonBackupEmail;
                                passenger.passengerStructure = VM.selectedBookPerson.bookPersonStructure;
                                passenger.passengerStructureId = VM.selectedBookPerson.bookPersonStructureId;
                                passenger.englishLastName = VM.selectedBookPerson.englishLastName;
                                passenger.englishFirstName = VM.selectedBookPerson.englishFirstName;
                                VM.allPassengers.$set(VM.allPassengers.length, passenger);
                                VM.getItineraryPassenger();//获取行程下乘客
                                getCommonPassengers(VM.selectedBookPerson);//常用差旅人
                                VM.getCorporationAuthority(VM.bookPerson.companyId);
                            } else {
                                toastr.error("预订人获取失败！,请重新确定预订人！", "", {
                                    timeOut: 2000,
                                    positionClass: "toast-top-center"
                                });
                            }
                        }

                    }
                });
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
                                    vm.allPassengers.$set(vm.allPassengers.length, passenger);
                                });
                            }

                        }
                    });
                }
            },
            judgePassengerInfo: function (info) {
                var certieFlag = false;
                var passengerNameFlag = false;
                var passengerBirthDateFlag = false;
                var passengerTypeFlag = false;
                var passengerSexFlag = false;
                var pinyin = [];
                var pinyinFlag = false;
                var english = [];
                var englishNameFlag = false;
                $(info).each(function (i, e) {
                    //判断中文名字拼音
                	var nameBy = e.passengerName;
                    if(!nameBy){
                        passengerNameFlag = true;
                    } else {
                        //全部为中文
                        var reg = /^[\u4E00-\u9FA5]+$/;
                        if (reg.test(nameBy)) {
                            $.ajax({
                                url: __ctx + "/itinerary/getPinYinByC",
                                data: {chinese: nameBy},
                                type: "POST",
                                async: false,
                                error: function (data1) {
                                    toastr.error(data1.message, "拼音查询失败", toastrConfig);
                                },
                                success: function (data1) {
                                    if (data1.obj == null || data1.obj.length == 0) {
                                        toastr.error("没有匹配到中文", "", {timeOut: 2000, positionClass: "toast-top-center"});
                                    } else {
                                        //一字多音
                                        if (pinyin.length == 0) {
                                            for (var p = 0; p < data1.obj.length; p++) {
                                                pinyin.push(data1.obj[p]);
                                            }
                                        } else if (pinyin.length > 0) {
                                            for (var p = 0; p < data1.obj.length; p++) {
                                                for (var i = 0; i < pinyin.length; i++) {
                                                    if (pinyin[i] == data1.obj[p]) {
                                                        pinyinFlag = true;
                                                        break;
                                                    }
                                                }
                                                pinyin.push(data1.obj[p]);
                                            }
                                        }
                                    }
                                }
                            });
						}else{
                            if(english.length == 0){
                                english.push(nameBy);
                            }else if(english.length > 0){
                                for (var i = 0; i < english.length; i++) {
                                    if(english[i] == nameBy){
                                        englishNameFlag = true;
                                        break;
                                    }
                                }
                                english.push(nameBy);
                            }
                        }
                    }
                    //判断身份证和号码
                    var cercode = $("#selected_passengercerti" + e.passengerEmployeeId).val();
                    var certype = $.trim($("#selected_passengercerti" + e.passengerEmployeeId).text());
                	if(!e.certificates || !certype || !cercode){
                        certieFlag = true;
                    } else {
                        if (certype != "身份证") {
                			if(!e.passengerBirthDate){
                                passengerBirthDateFlag = true;
                            }
                        }
                    }
					if(!e.passengerType){
                        passengerTypeFlag = true;
                    }
					if(!e.passengerSex){
                        passengerSexFlag = true;
                    }

                });

                //判断是否有拼音相同
                if (pinyinFlag) {
                    toastr.error("乘客中存在中文姓名拼音相同的乘客，无法预订!请修改信息!", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return true;
                }
                if(englishNameFlag){
                    toastr.error("乘客中存在姓名相同的乘客，无法预订!请修改信息!", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return true;
                }
                if (certieFlag) {
                    toastr.error("乘客中存在证件信息不全，无法预订!请补足信息!", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return true;
                }
                if (passengerNameFlag) {
                    toastr.error("乘客中存在姓名信息不全，无法预订!请补足信息!", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return true;
                }
                if (passengerBirthDateFlag) {
                    toastr.error("当乘客证件不为身份证时，必须有出生信息，否则无法预订!请补足信息!", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return true;
                }
                if (passengerTypeFlag) {
                    toastr.error("乘客中存在乘客类型信息不全，无法预订!请补足信息!", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return true;
                }
                if (passengerSexFlag) {
                    toastr.error("乘客中存在性别信息不全，无法预订!请补足信息!", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return true;
                }
            },
            judgeBookPersonBookAuthority: function (selectedBookPerson) {
                //0默认全部选中，产品代订范围：国内机票:DA、国际机票:IA、国内酒店:DH、国际酒店:IH、火车票:TA、保险:DI、增值业务:DV
                if ((selectedBookPerson.bookAuthority == 2 || selectedBookPerson.bookAuthority == 3) && (selectedBookPerson.productTypeId == null || selectedBookPerson.productTypeId == "" || selectedBookPerson.productTypeId.indexOf("0") >= 0 || selectedBookPerson.productTypeId.indexOf("DA") >= 0)) {
                    $("#bookperson_bookForOthers_selected").text("当前预订人有代订权限、");
                    $("#passenger-to-add").show();
                    $("#outLinkAddPassenger").show();
                    $("#commonPassenger").show();
                } else {
                    $("#bookperson_bookForOthers_selected").text("当前预订人无代订权限、");
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
            'changeCompany': function (param) {
                this.getCorporationAuthority(param.company.value);
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
                            if (data.obj.canBookWithOverDue == 1 && data.obj.hasOverDue == 'Y') {
                                $("#cancellationOrder").modal('show');
                                vm.companyName = param.company.options[param.company.options.selectedIndex].text;
                                vm.companyFlag = 2;
                            } else if (data.obj.canBookWithOverDue == 0 && data.obj.hasOverDue == 'Y') {
                                $("#cancellationOrder").modal('show');
                                vm.companyName = param.company.options[param.company.options.selectedIndex].text;
                                vm.companyFlag = 1;
                            } else if (data.obj.hasOverDue == 'N') {
                                vm.companyFlag = 0;
                            }
                        }
                    }
                });
            }
        }
    })

    var getPassengers = function (parms) {
        $.ajax({
            url: __ctx + "/itinerary/getPassengersByCondition",
            contentType: "application/json",
            data: JSON.stringify(parms),
            type: "POST",
            datatype: "json",
            error: function (data1) {
                toastr.error(data1.message, "请求失败", toastrConfig);
            },
            success: function (data) {
                vm.searchPassengerList = data;
                //延迟加载
                window.setTimeout(function () {
                    $(vm.searchPassengerList.data).each(function (index, passenger1) {
                        $(vm.allPassengers).each(function (index2, passenger2) {
                            if (passenger1.passengerEmployeeId == passenger2.passengerEmployeeId) {
                                $("input[id='searchPassenger" + passenger2.passengerEmployeeId + "']").prop("checked", true);
                            }
                        });
                    });
                }, 100);
            }
        });
    }

    function getCommonPassengers(parms) {
        $.ajax({
            url: __ctx + "/itinerary/getCommonPassengers",
            data: {
                employeeId: parms.bookPersonEmployeeId
            },
            type: "POST",
            datatype: "json",
            error: function (data1) {
                toastr.error(data1.message, "请求失败", toastrConfig);
            },
            success: function (data) {
                data.data = _.map(data.data, function (item) {
                    return {
                        data: _.map(item.data, function (sub) {
                            _.unset(sub, 'orderItemId');
                            return sub;
                        })
                    }
                });
                vm.commonPassengers = data;
                var array1 = vm.commonPassengers.data;
                for (var i = 0; i < array1.length; i++) {
                    var arry = [];
                    var arry2 = array1[i].data;
                    for (var j = 0; j < arry2.length; j++) {
                        var flag = false;
                        $(vm.allPassengers).each(function (index, e) {
                            if (e.passengerEmployeeId == arry2[j].passengerEmployeeId) {
                                flag = true;
                            }
                        });
                        arry.$set(j, flag);
                    }
                    vm.isChecked.$set(i, arry);
                }
                setTimeout(tc.bookform.commpassenger, 500);
            }
        });

    }

    var searchPerson = function (parms) {
        if (!parms.pageSize) {
            parms.pageSize = 15;
        }
        if (!parms.page) {
            parms.page = 1;
        }
        $.ajax({
            url: __ctx + "/itinerary/searchBookPerson",
            data: parms,
            type: "POST",
            datatype: "json",
            error: function (data1) {
                toastr.error(data1.message, "请求失败", toastrConfig);
            },
            success: function (data) {
                vm.bookPersonList = data;
            }
        });

    }

    var loadCompanysData = function () {
        $.ajax({
            url: __ctx + "/resource/companys",
            //data: parms,
            type: "POST",
            datatype: "json",
            error: function (data1) {
                toastr.error(data1.message, "请求失败", toastrConfig);
            },
            success: function (data) {
                vm.companys = data;
//                setCompanysData(data);
                var flag = true;
            }
        });
    }
    loadCompanysData();

    $('#bookPersonModal').on('hidden.bs.modal', function () {
        vm.bookPerson.page = 1;
        vm.bookPerson.pageSize = 15;

        vm.bookPersonList = {};
    })

    $('#passengerModel').on('hidden.bs.modal', function () {
        vm.passengerSearchCondition.page = 1;
        vm.passengerSearchCondition.pageSize = 5;
    })
//    var setCompanysData = function(data){
//        $("#bookperson_company").empty();
//        for(var i=0;i<data.length;i++) {
//            var option = $("<option>").text(data[i].companyName).val(data[i].companyId);
//            $("#bookperson_company").append(option);
//        }
//        $('#bookperson_company').editableSelect({ 
//           bg_iframe: true,
//           case_sensitive: true, // If set to true, the user has to type in an exact                                  // match for the item to get highlighted
//           items_then_scroll: 10 ,// If there are more than 10 items, display a scrollbar
//           isFilter:true, //If set to true, the item will be filtered according to the matching criteria. 
//           onSelect: function(list_item) {
//                vm.bookPerson.companyId = list_item.val();
//            }
//    });
//    }

})