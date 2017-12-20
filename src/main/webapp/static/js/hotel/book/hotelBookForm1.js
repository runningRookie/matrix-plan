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
            	passengerEmployeeId:0,
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
            nationalitys: []

        },
        ready: function () {
            $("#bookperson_company_div").hide();
            $("#bookperson_phone_div").hide();
            $("#bookperson_email_div").hide();
            $("#bookperson_text_div").hide();
            $("#passenger-to-add").hide();
            this.getNationalitys();
            if (this.itineraryNo != '') {
                this.getBookPersonByItineraryNo();
                this.getItineraryPassenger();
                $("#searchBookPerson").hide();
            } else {
                $("#searchBookPerson").show();
            }
        },
        methods: {
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
                    this.bookPerson.size = 20;
                }
                searchPerson(this.bookPerson);
            },
            selectBookPerson: function (index, person) {
                if ($("input:checkbox:eq(" + index + ")").is(":checked")) {
                    this.selectedBookPerson = person;
                    $("input:checkbox").each(function (index2, element) {
                        if (index != index2) {
                            $("input:checkbox:eq(" + index2 + ")").attr("checked", false);
                        }
                    });

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
                    url: __ctx + "/hotel/getBookPersonDetailByEmployeeId/" + vm.selectedBookPerson.bookPersonEmployeeId,
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
                            vm.selectedBookPerson = data.obj;
                            vm.allPassengers = [];
                            vm.bookPerson.companyId = vm.selectedBookPerson.bookCompanyId;
                            vm.bookPerson.bookPersonName = vm.selectedBookPerson.bookPersonName;
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
                            passenger.passengerName = vm.selectedBookPerson.bookPersonName;
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
                            vm.allPassengers.$set(vm.allPassengers.length, passenger);

                            $("#bookperson_company_div").show();
                            $("#bookperson_phone_div").show();
                            $("#bookperson_email_div").show();
                            $("#bookperson_text_div").show();
                            $("#bookperson_company_selected").text(vm.selectedBookPerson.bookCompanyName);
                            $("#bookperson_phone_selected").text(vm.selectedBookPerson.bookPersonPhone);
                            $("#bookperson_phone_selected").text(vm.selectedBookPerson.bookPersonPhone);
                            $("#bookperson_email_selected").text(vm.selectedBookPerson.bookPersonEmail);
                            if (vm.selectedBookPerson.bookAuthority == 2 || vm.selectedBookPerson.bookAuthority == 3) {
                                $("#bookperson_bookForOthers_selected").text("当前预订人有代订权限");
                                $("#passenger-to-add").show();
                            } else {
                                $("#bookperson_bookForOthers_selected").text("当前预订人无代订权限");
                                $("#passenger-to-add").hide();
                            }
                            if (vm.selectedBookPerson.auditReferenceType == 'b') {
                                $("#bookperson_auditReferenceType_selected").text("审批流都参照预订人的审批流");
                            } else if (vm.selectedBookPerson.auditReferenceType == 'p') {
                                $("#bookperson_auditReferenceType_selected").text("审批流都参照出行人的审批流");
                            } else {
                                $("#bookperson_auditReferenceType_selected").text("审批流都参照选定的参照人的审批流");
                            }
                            $('#bookPersonModal').modal('hide');
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
                vm.passengerSearchCondition.companyId = vm.selectedBookPerson.bookCompanyId;
                getPassengers(vm.passengerSearchCondition);
            },
            selectCommonPassenger: function (index, index2, passenger) {
                //添加常用乘客
                if (!this.isChecked[index][index2]) {
                    vm.selectedCommonPassengers.$set(vm.selectedCommonPassengers.length, passenger);
                } else {
                    _.forEach(vm.selectedCommonPassengers, function (item, i) {
                        if (vm.selectedCommonPassengers[i] != null && passenger.passengerName == vm.selectedCommonPassengers[i].passengerName) {
                            vm.selectedCommonPassengers.$remove(vm.selectedCommonPassengers[i]);
                        }
                    });
                }

            },
            selectSearchPassenger: function (index, passenger) {
                //添加搜索的乘客
                if ($("input:checkbox[name='searchPassenger']:eq(" + index + ")").is(":checked")) {
                    vm.selectedSearchPassenger.$set(vm.selectedSearchPassenger.length, passenger);
                } else {
                    vm.selectedSearchPassenger.$remove(passenger);
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
                            url: __ctx + "/hotel/getPassengerDetailByEmployeeId/" + e.passengerEmployeeId,
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
                        url: __ctx + "/hotel/getPassengerDetailByEmployeeId/" + e.passengerEmployeeId,
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
                        url: __ctx + "/hotel/addEmployeeInfo",
                        contentType: "application/json",
                        type: "POST",
                        datatype: "json",
                        async:false,
                        data:{
                        	passengerDTO:vm.outerPassenger
                        },
                        error: function (data1) {
                            console.log(data1);
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
                        url: __ctx + "/hotel/addPassenger",
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

            },
            changeCertificateSelected: function (employeeId) {
                var certi = $("#selected_passengercerti" + employeeId).val();
                $("#selected_certiNo" + employeeId).text(certi);
            },
            removePassenger: function (index, passenger) {
                if (vm.allPassengers.length <= 1) {
                    toastr.error("乘客不能少于1个", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                vm.allPassengers.$remove(passenger);
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
                    url: __ctx + "/hotel/createItinerary",
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
                            window.location.href = __ctx + 'hotel/addProduct?itineraryId=' + data.obj;
                        }
                    }
                });
            },
            deleteCommonPassenger: function () {
                if (vm.selectedCommonPassengers.length > 0) {
                    var data = {};
                    var commonPassengers = [];

                    commonPassengers = vm.selectedCommonPassengers;

                    data.commonPassengers = commonPassengers;
                    data.bookPerson = vm.selectedBookPerson;
                    var selectedBookPerson = vm.selectedBookPerson;
                    $.ajax({
                        url: __ctx + "/hotel/deletePassenger",
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
                var data = {};
                data.bookPerson = vm.selectedBookPerson;
                data.passengers = _.map(vm.allPassengers, function (item) {
                    item.isVip = item.isVip ? 1 : 0;
                    return item;
                });
                data.itineraryType = vm.itineraryType;
                data.itineraryNo = vm.itineraryNo;
                var certieFlag = false;
                $(data.passengers).each(function (i, e) {
                    if (!e.certificates) {
                        certieFlag = true;
                    }
                });
                if (certieFlag) {
                    toastr.error("乘客中不存在证件信息，无法预订!请补足信息!", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return;
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
                        toastr.error("乘客中存在儿童胡或者婴儿,请选择手工预订！", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                        return;
                    }
                    action = __ctx + '/hotel/list';
                }
                var form = $("<form></form>");
                form.attr('action', action)
                form.attr('method', 'post')
                var input = $("<input type='text' id='bookdate' name='bookPersonAndPassengersDTOStr'/>");
                form.append(input);
                form.appendTo("body")
                form.css('display', 'none');
                $("#bookdate").val(JSON.stringify(data));
                sessionStorage.bookPersonAndPassengers = JSON.stringify(data);
                form.submit();
            },
            getNationalitys: function () {
                $.ajax({
                    url: __ctx + "/resource/nationalitys",
                    //data: parms,
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                        vm.nationalitys = data;
                    }
                });
            },
            queryPassengerData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.passengerSearchCondition, pageInfo);
                }
                else {
                    this.passengerSearchCondition.page = 1;
                    this.passengerSearchCondition.size = 20;
                }
                getPassengers(this.passengerSearchCondition);
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
                        alert(data1);
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
                                if (VM.selectedBookPerson.bookAuthority == 2 || VM.selectedBookPerson.bookAuthority == 3) {
                                    $("#bookperson_bookForOthers_selected").text("当前预订人有代订权限");
                                    $("#passenger-to-add").show();
                                } else {
                                    $("#bookperson_bookForOthers_selected").text("当前预订人无代订权限");
                                }
                                if (VM.selectedBookPerson.auditReferenceType == 'b') {
                                    $("#bookperson_auditReferenceType_selected").text("审批流都参照预订人的审批流");
                                } else if (VM.selectedBookPerson.auditReferenceType == 'p') {
                                    $("#bookperson_auditReferenceType_selected").text("审批流都参照出行人的审批流");
                                } else {
                                    $("#bookperson_auditReferenceType_selected").text("审批流都参照选定的参照人的审批流");
                                }
                                VM.bookPerson.bookPersonName = VM.selectedBookPerson.bookPersonName;
                                VM.bookPerson.companyId = VM.selectedBookPerson.bookCompanyId;
                                VM.bookPerson.bookPersonEmail = VM.selectedBookPerson.bookPersonEmail;
                                VM.bookPerson.bookPersonMobile = VM.selectedBookPerson.bookPersonPhone;
                                VM.bookPerson.bookPersonNo = VM.selectedBookPerson.bookPersonNumber;

                                //预订人转乘客
                                var passenger = {};
                                passenger.passengerName = vm.selectedBookPerson.bookPersonName;
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
                                vm.allPassengers.$set(vm.allPassengers.length, passenger);
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
            getItineraryPassenger:function(){
            	var VM = this;
            	if(VM.itineraryNo){
            		$.ajax({
                        url: __ctx + "/hotel/getPassengersByItineraryNo",
                        data: {
                        	itineraryNo:VM.itineraryNo
                        },
                        type: "POST",
                        datatype: "json",
                        error: function (data1) {
                        	toastr.error("请求失败！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success: function (data) {
                            if(data.result){
                            	$(data.obj).each(function (index, passenger) {
                            		vm.allPassengers.$set(vm.allPassengers.length, passenger);
                                });
                            }
                        	
                        }
                    });
            	}
            }

        }
    })

    var getPassengers = function (parms) {
        $.ajax({
            url: __ctx + "/hotel/getPassengersByCondition",
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

    var getCommonPassengers = function (parms) {
        $.ajax({
            url: __ctx + "/hotel/getCommonPassengers",
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

    var searchPerson = function (parms) {
        $.ajax({
            url: __ctx + "/hotel/searchBookPerson",
            data: parms,
            type: "POST",
            datatype: "json",
            error: function (data1) {
                alert(data1);
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
                alert(data1);
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
        vm.bookPerson.size = 20;
    })

    $('#passengerModel').on('hidden.bs.modal', function () {
        vm.passengerSearchCondition.page = 1;
        vm.passengerSearchCondition.size = 20;
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
