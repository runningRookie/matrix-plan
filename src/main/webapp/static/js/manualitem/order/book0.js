var manual_book0;
$(document).ready(function () {
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

    manual_book0 = new Vue({
        el: '#bookform',
        data: {
            modalSelectedBookPerson: -1,
            innerIt: false,
            init: true,
            itineraryType: 1,
            itineraryNo: window.itineraryNo,
            selectedCerIds: [], // 已选择的证件ID
            cerCodes: [],
            companys: [],
            bookPerson: {
                corporationId: '',
                bookPersonName: '',
                bookPersonEmail: '',
                bookPersonMobile: '',
                bookPersonNo: ''
            },
            bookPersonList: {},
            selectedBookPerson: {},
            commonPassengers: {},
            selectedCommonPassengers: [],
            passengerSearchCondition: {
                condition: "",
                companyId: 0
            },
            searchPassengerList: {},
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
            bookAuthority: '',
            moreText: '更多',
            passengerClass: '80px',
            searchPassengerArr: [],
            commonPassengerArr: [],
            //用于存储逾期公司的名称
            overDueCompanyName:"",
            //用于控制button是否可点击
            buttonFlag:true
        },
        ready: function () {
            this.loadCompanysData();
            if (this.itineraryNo != '') {
                this.getBookPersonByItineraryNo();
                this.getItineraryPassenger();
                this.innerIt = true;
                this.init = false;
            }
        },
        methods: {
            getMoreCommonPassenger: function (event) {
                if (manual_book0.moreText == "更多") {
                    manual_book0.moreText = "收起";
                    manual_book0.passengerClass = 'auto';
                } else {
                    manual_book0.moreText = "更多";
                    manual_book0.passengerClass = '80px';
                }
            },
            searchBookPersons: function () {
                if (manual_book0.bookPerson.corporationId == '' || manual_book0.bookPerson.corporationId == null) {
                    toastr.error("请先选择公司！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                manual_book0.init = false;
                this.searchPerson(manual_book0.bookPerson);

                $("#bookPersonModal").modal({
                    show: true,
                    backdrop: 'static'
                });
            },
            searchPerson: function (parms) {
                if (!parms.pageSize) {
                    parms.pageSize = 15;
                }
                if (!parms.page) {
                    parms.page = 1;
                }
                $.ajax({
                    url: __ctx + "/manualOrder/searchBookPerson",
                    data: parms,
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        manual_book0.bookPersonList = data;
                    }
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
                this.searchPerson(this.bookPerson);
            },
            setBookPerson: function () {
                if (manual_book0.modalSelectedBookPerson > -1) {
                    manual_book0.selectedBookPerson = manual_book0.bookPersonList.data[manual_book0.modalSelectedBookPerson];
                } else {
                    manual_book0.selectedBookPerson = {};
                }
                manual_book0.modalSelectedBookPerson = -1;
                if (this.selectedBookPerson.bookPersonEmployeeId == '' || this.selectedBookPerson.bookPersonEmployeeId == null) {
                    $('#bookPersonModal').modal('hide');
                    return;
                }
                //精确确定预定人信息
                $.ajax({
                    url: __ctx + "/manualOrder/getBookPersonDetailByEmployeeId/" + manual_book0.selectedBookPerson.bookPersonEmployeeId,
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
                            manual_book0.selectedBookPerson = data.obj;
                            manual_book0.allPassengers = [];
                            //manual_book0.bookPerson.corporationId = manual_book0.selectedBookPerson.bookCompanyId;
                            if (manual_book0.selectedBookPerson.bookPersonName != "" && manual_book0.selectedBookPerson.bookPersonName != null) {
                                manual_book0.bookPerson.bookPersonName = manual_book0.selectedBookPerson.bookPersonName;
                            } else {
                                manual_book0.bookPerson.bookPersonName = manual_book0.selectedBookPerson.bookPersonEnlishName;
                            }
                            manual_book0.bookPerson.bookPersonEmail = manual_book0.selectedBookPerson.bookPersonEmail;
                            manual_book0.bookPerson.bookPersonMobile = manual_book0.selectedBookPerson.bookPersonPhone;
                            manual_book0.bookPerson.bookPersonNo = manual_book0.selectedBookPerson.bookPersonNumber;
                            //预订人转乘客
                            var passenger = {};
                            passenger.passengerName = manual_book0.selectedBookPerson.bookPersonName;
                            passenger.passengerEnlishName = manual_book0.selectedBookPerson.bookPersonEnlishName;
                            passenger.passengerNickname = manual_book0.selectedBookPerson.bookPersonNickname;
                            passenger.passengerCompanyId = manual_book0.selectedBookPerson.bookCompanyId;
                            passenger.passengerCompany = manual_book0.selectedBookPerson.bookCompanyName;
                            passenger.passengerDepartmentId = manual_book0.selectedBookPerson.bookDepartmentId;
                            passenger.passengerDepartmentName = manual_book0.selectedBookPerson.bookDepartmentName;
                            passenger.passengerSex = manual_book0.selectedBookPerson.bookPersonSex;
                            passenger.passengerPhone = manual_book0.selectedBookPerson.bookPersonPhone;
                            passenger.passengerEmail = manual_book0.selectedBookPerson.bookPersonEmail;
                            passenger.passengerBirthDate = manual_book0.selectedBookPerson.bookPersonBirthDate;
                            passenger.passengerEmployeeId = manual_book0.selectedBookPerson.bookPersonEmployeeId;
                            passenger.passengerNationality = manual_book0.selectedBookPerson.bookPersonNationality;
                            passenger.passengerNo = manual_book0.selectedBookPerson.bookPersonNumber;
                            passenger.passengerType = manual_book0.selectedBookPerson.bookPersonType;
                            passenger.passengerClass = manual_book0.selectedBookPerson.bookPersonClass;
                            passenger.isVip = manual_book0.selectedBookPerson.isVip;
                            passenger.passengerText = manual_book0.selectedBookPerson.bookPersonText;
                            passenger.certificates = manual_book0.selectedBookPerson.certificates;
                            //passenger.passengerBackupEmail = manual_book0.selectedBookPerson.bookPersonBackupEmail;
                            passenger.passengerStructure = manual_book0.selectedBookPerson.bookPersonStructure;
                            passenger.passengerStructureId = manual_book0.selectedBookPerson.bookPersonStructureId;
                            passenger.englishLastName = manual_book0.selectedBookPerson.englishLastName;
                            passenger.englishFirstName = manual_book0.selectedBookPerson.englishFirstName;
                            manual_book0.allPassengers.$set(manual_book0.allPassengers.length, passenger);
                            if (manual_book0.selectedBookPerson.bookAuthority == 2 || manual_book0.selectedBookPerson.bookAuthority == 3) {
                                manual_book0.getCommonPassengers(manual_book0.selectedBookPerson);
                            }
                            manual_book0.bookAuthority = manual_book0.selectedBookPerson.bookAuthority;
                            $('#bookPersonModal').modal('hide');
                        }
                    }
                });

            },
            searchPassengers: function () {
                if (!manual_book0.selectedBookPerson.bookPersonEmployeeId) {
                    toastr.error("请选择预订人", "", toastrConfig);
                    return;
                }
                if (manual_book0.selectedBookPerson.bookAuthority != 2 && manual_book0.selectedBookPerson.bookAuthority != 3) {
                    toastr.error("当前预订人无代订权限", "", toastrConfig);
                    return;
                }
                manual_book0.passengerSearchCondition.companyId = manual_book0.selectedBookPerson.bookCompanyId;
                manual_book0.passengerSearchCondition.page = 1;
                manual_book0.passengerSearchCondition.pageSize = 5;
                manual_book0.getPassengers(manual_book0.passengerSearchCondition);
            },
            selectSearchPassenger: function (index, passenger, event) {
                //添加搜索的乘客
                if ($(event.target).prop("checked")) {
                    if (manual_book0.allPassengers.length > 8) {
                        toastr.error("最多九名乘客！", "", toastrConfig);
                        return;
                    }
                    var flag = false;
                    _.forEach(manual_book0.allPassengers, function (item, index) {
                        if (item.passengerEmployeeId == passenger.passengerEmployeeId) {
                            flag = true;
                        }
                    });
                    // 不存在
                    if (!flag) {
                        $.ajax({
                            url: __ctx + "/itinerary/getPassengerDetailByEmployeeId/" + passenger.passengerEmployeeId,
                            contentType: "application/json",
                            type: "GET",
                            datatype: "json",
                            error: function (data1) {
                                toastr.error(data.message, "查询失败", toastrConfig);
                            },
                            success: function (data) {
                                if (data.result) {
                                    manual_book0.allPassengers.$set(manual_book0.allPassengers.length, data.obj);
                                }
                            }
                        });
                    } else { // 存在
                        toastr.warning("该乘客已选择", "", toastrConfig);
                    }
                    manual_book0.commonPassengerArr.push(passenger.passengerEmployeeId);
                    manual_book0.commonPassengerArr = _.uniq(manual_book0.commonPassengerArr);
                } else { // 取消
                    if (manual_book0.allPassengers.length <= 1) {
                        var sFlag = false;
                        _.forEach(manual_book0.allPassengers, function (item) {
                            passenger.passengerEmployeeId == item.passengerEmployeeId ? sFlag = true : sFlag = false;
                        });
                        if (sFlag) {
                            toastr.warning("至少选择一位乘客", "", toastrConfig);
                            $(event.target).prop("checked", true);
                        }
                    } else {
                        var ii = [];
                        _.forEach(manual_book0.allPassengers, function (item, index) {
                            if (item.passengerEmployeeId == passenger.passengerEmployeeId) {
                                ii.push(index);
                            }
                        });
                        _.forEach(ii, function (i) {
                            manual_book0.allPassengers.splice(i, 1);
                        });

                        manual_book0.commonPassengerArr = _.uniq(_.filter(manual_book0.commonPassengerArr, function (o) {
                            return o != passenger.passengerEmployeeId;
                        }));
                    }
                }
            },
            selectCommomPassenger: function (index1, index2, passenger, event) {
                if ($(event.target).prop("checked")) {
                    if (manual_book0.allPassengers.length > 8) {
                        toastr.warning("乘客最多九位", "", toastrConfig);
                    } else {
                        var flag = false;
                        _.forEach(manual_book0.allPassengers, function (item, index) {
                            item.passengerEmployeeId == passenger.passengerEmployeeId ? flag = true : flag = false
                        });
                        if (!flag) {
                            $.ajax({
                                url: __ctx + "/itinerary/detailsByIds/",
                                data: {ids: passenger.passengerEmployeeId},
                                type: "POST",
                                error: function (data) {
                                    toastr.error(data.message, "查询失败", toastrConfig);
                                },
                                success: function (data) {
                                    if (data.result) {
                                        var temp = data.obj[0];
                                        manual_book0.allPassengers.$set(manual_book0.allPassengers.length, temp);
                                    }
                                }
                            });
                        } else {
                            toastr.warning("该乘客已选择", "", toastrConfig);
                        }
                        manual_book0.searchPassengerArr.push(passenger.passengerEmployeeId);
                        manual_book0.searchPassengerArr = _.uniq(manual_book0.searchPassengerArr);
                    }
                } else {
                    if (manual_book0.allPassengers.length <= 1) {
                        var tFlag = false;
                        _.forEach(manual_book0.allPassengers, function (item, index) {
                            item.passengerEmployeeId == passenger.passengerEmployeeId ? tFlag = true : tFlag = false;
                        });
                        if (tFlag) {
                            toastr.warning("至少选择一位乘客", "", toastrConfig);
                            $(event.target).prop("checked", true);
                        }
                    } else {
                        var arr = [];
                        _.forEach(manual_book0.allPassengers, function (item, index) {
                            if (item.passengerEmployeeId == passenger.passengerEmployeeId) {
                                arr.push(index);
                            }
                        });
                        _.forEach(arr, function (e) {
                            manual_book0.allPassengers.splice(e, 1);
                        });

                        manual_book0.commonPassengerArr = _.uniq(_.filter(manual_book0.commonPassengerArr, function (o) {
                            return o != passenger.passengerEmployeeId;
                        }));

                        manual_book0.searchPassengerArr = _.uniq(_.filter(manual_book0.searchPassengerArr, function (o) {
                            return o != passenger.passengerEmployeeId;
                        }));
                    }
                }
            },
            removePassenger: function (empId) {
                if (manual_book0.allPassengers.length <= 1) {
                    toastr.warning("乘客不能少于1个", "", {timeOut: 2000, positionClass: "toast-top-center"});
                } else {
                    manual_book0.commonPassengerArr = _.uniq(_.filter(manual_book0.commonPassengerArr, function (o) {
                        return o != empId;
                    }));

                    manual_book0.searchPassengerArr = _.uniq(_.filter(manual_book0.searchPassengerArr, function (o) {
                        return o != empId;
                    }));

                    manual_book0.allPassengers = _.uniq(_.filter(manual_book0.allPassengers, function (o) {
                        return o != empId
                    }));

                    var ai = [];
                    _.forEach(manual_book0.allPassengers, function (item, index) {
                        if (item.passengerEmployeeId == empId) {
                            ai.push(index);
                        }
                    });
                    _.forEach(ai, function (i) {
                        manual_book0.allPassengers.splice(i, 1);
                    });
                }
            },
            addCommonPassenger: function () {
                if (manual_book0.allPassengers.length > 0) {
                    var dataAdd = {};
                    var commonPassengers = [];
                    if (manual_book0.allPassengers.length > 0) {
                        commonPassengers = manual_book0.allPassengers;
                    }
                    _.forEach(commonPassengers, function (item) {
                        _.unset(item, 'orderNo');
                        _.unset(item, 'passengerCerCode');
                        _.unset(item, 'passengerCerName');
                        _.unset(item, 'passengerCerType');
                        _.unset(item, 'gmtCreateTime');
                        _.unset(item, 'gmtModifyTime');
                        _.unset(item, 'operatorName');
                        _.forEach(item.certificates, function (i) {
                            _.unset(i, 'gmtExpiring');
                            _.unset(i, 'enabled');
                        })
                    });
                    dataAdd.commonPassengers = commonPassengers;
                    var bookPerson = {};
                    bookPerson.bookPersonEmployeeId = manual_book0.selectedBookPerson.bookPersonEmployeeId;
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
                                toastr.error(data.message, "", toastrConfig);
                            } else {
                                toastr.info(data.message, "", toastrConfig);
                            }
                        }
                    });
                }
            },
            deleteCommonPassenger: function () {
                _.forEach(manual_book0.commonPassengers.data, function (data) {
                    _.forEach(data.data, function (d) {
                        if (manual_book0.commonPassengerArr.indexOf(d.passengerEmployeeId) >= 0) {
                            manual_book0.selectedCommonPassengers.push(d);
                        }
                    });
                });
                if (manual_book0.commonPassengerArr.indexOf(manual_book0.selectedBookPerson.bookPersonEmployeeId) >= 0) {
                    toastr.warning("预订人不可删除", "", toastrConfig);
                    return;
                }
                if (manual_book0.selectedCommonPassengers.length == 0) {
                    toastr.warning("请选择待删除常用乘客", "", toastrConfig);
                    return;
                }
                if (manual_book0.selectedCommonPassengers.length > 0) {
                    var dataDelete = {
                        commonPassengers: manual_book0.selectedCommonPassengers,
                        bookPerson: manual_book0.selectedBookPerson
                    };
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
                                toastr.error(data.message, "", toastrConfig);
                            } else {
                                manual_book0.getCommonPassengers(dataDelete.bookPerson);
                                _.forEach(manual_book0.allPassengers, function (t, outIndex) {
                                    _.forEach(data.data, function (d, inIndex) {
                                        if (t.passengerEmployeeId == d.passengerEmployeeId) {
                                            _.slice(manual_book0.allPassengers, outIndex, 1);
                                        }
                                    })
                                });
                            }
                        }
                    });
                }
                manual_book0.selectedCommonPassengers = [];
                manual_book0.commonPassengerArr = [manual_book0.selectedBookPerson.bookPersonEmployeeId];
                manual_book0.searchPassengerArr = _.filter(manual_book0.searchPassengerArr, function (o) {
                    return o != manual_book0.selectedBookPerson.bookPersonEmployeeId;
                });
            },
            refreshAllPassengers: function () {
                var ids = [];
                for (var i = 0; i < manual_book0.allPassengers.length; i++) {
                    if (manual_book0.allPassengers[i].passengerEmployeeId != 0) {
                        ids.push(manual_book0.allPassengers[i].passengerEmployeeId);
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
                            toastr.error(data.message, "", toastrConfig);
                        } else {
                            manual_book0.allPassengers = data.obj;
                        }
                    }
                });
            },
            outLinkAddPassenger: function (url) {
                window.open(url + manual_book0.selectedBookPerson.bookCompanyId, "_blank");
            },
            outLinkCorporation: function (courl) {
                var outCoUrl = courl.replace('{0}', manual_book0.selectedBookPerson.bookCompanyId);
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
            queryPassengerData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.passengerSearchCondition, pageInfo);
                }
                else {
                    this.passengerSearchCondition.page = 1;
                    this.passengerSearchCondition.pageSize = 5;
                }
                manual_book0.getPassengers(this.passengerSearchCondition);
            },
            getBookPersonByItineraryNo: function () {
                var VM = this;
                $.ajax({
                    url: __ctx + "/manualitemItinerary/getBookPersonByItineraryNo",
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
                                if (VM.selectedBookPerson.bookPersonName != "" && VM.selectedBookPerson.bookPersonName != null) {
                                    VM.bookPerson.bookPersonName = VM.selectedBookPerson.bookPersonName;
                                } else {
                                    VM.bookPerson.bookPersonName = VM.selectedBookPerson.bookPersonEnlishName;
                                }
                                VM.bookPerson.corporationId = VM.selectedBookPerson.bookCompanyId;
                                VM.bookPerson.bookPersonEmail = VM.selectedBookPerson.bookPersonEmail;
                                VM.bookPerson.bookPersonMobile = VM.selectedBookPerson.bookPersonPhone;
                                VM.bookPerson.bookPersonNo = VM.selectedBookPerson.bookPersonNumber;

                                //预订人转乘客
                                var passenger = {};
                                passenger.passengerName = manual_book0.selectedBookPerson.bookPersonName;
                                passenger.passengerEnlishName = manual_book0.selectedBookPerson.bookPersonEnlishName;
                                passenger.passengerNickname = manual_book0.selectedBookPerson.bookPersonNickname;
                                passenger.passengerCompanyId = manual_book0.selectedBookPerson.bookCompanyId;
                                passenger.passengerCompany = manual_book0.selectedBookPerson.bookCompanyName;
                                passenger.passengerDepartmentId = manual_book0.selectedBookPerson.bookDepartmentId;
                                passenger.passengerDepartmentName = manual_book0.selectedBookPerson.bookDepartmentName;
                                passenger.passengerSex = manual_book0.selectedBookPerson.bookPersonSex;
                                passenger.passengerPhone = manual_book0.selectedBookPerson.bookPersonPhone;
                                passenger.passengerEmail = manual_book0.selectedBookPerson.bookPersonEmail;
                                passenger.passengerBirthDate = manual_book0.selectedBookPerson.bookPersonBirthDate;
                                passenger.passengerEmployeeId = manual_book0.selectedBookPerson.bookPersonEmployeeId;
                                passenger.passengerNationality = manual_book0.selectedBookPerson.bookPersonNationality;
                                passenger.passengerNo = manual_book0.selectedBookPerson.bookPersonNumber;
                                passenger.passengerType = manual_book0.selectedBookPerson.bookPersonType;
                                passenger.passengerClass = manual_book0.selectedBookPerson.bookPersonClass;
                                passenger.isVip = manual_book0.selectedBookPerson.isVip;
                                passenger.passengerText = manual_book0.selectedBookPerson.bookPersonText;
                                passenger.certificates = manual_book0.selectedBookPerson.certificates;
                                //passenger.passengerBackupEmail = manual_book0.selectedBookPerson.bookPersonBackupEmail;
                                passenger.passengerStructure = manual_book0.selectedBookPerson.bookPersonStructure;
                                passenger.passengerStructureId = manual_book0.selectedBookPerson.bookPersonStructureId;
                                passenger.englishLastName = manual_book0.selectedBookPerson.englishLastName;
                                passenger.englishFirstName = manual_book0.selectedBookPerson.englishFirstName;
                                manual_book0.allPassengers.$set(manual_book0.allPassengers.length, passenger);
                                manual_book0.getCommonPassengers(manual_book0.selectedBookPerson);
                                manual_book0.bookAuthority = manual_book0.selectedBookPerson.bookAuthority;
                                manual_book0.cerCodes = _.map(manual_book0.allPassengers, function (item, index) {
                                    var cer = manual_book0.findCer(item, manual_book0.selectedCerIds[index]);
                                    return cer && cer.certificateCode;
                                });
                                manual_book0.cerCodes = _.uniq(manual_book0.cerCodes);
                            } else {
                                toastr.error("预订人获取失败！,请重新确定预订人！", "", toastrConfig);
                            }
                        }
                    }
                });
            },
            loadCompanysData: function () {
                $.ajax({
                    url: __ctx + "/resource/companys",
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        manual_book0.companys = data;
                    }
                });
            },
            getCommonPassengers: function (parms) {
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
                        manual_book0.commonPassengers = data;
                    }
                });
            },
            getPassengers: function (parms) {
                $.ajax({
                    url: __ctx + "/manualOrder/getPassengersByCondition",
                    contentType: "application/json",
                    data: JSON.stringify(parms),
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error(data1.message, "请求失败", toastrConfig);
                    },
                    success: function (data) {
                        manual_book0.searchPassengerList = data;
                    }
                });
            },
            getItineraryPassenger: function () {
                var VM = this;
                if (VM.itineraryNo) {
                    $.ajax({
                        url: __ctx + "/manualitemItinerary/getPassengersByItineraryNo",
                        data: {
                            itineraryNo: VM.itineraryNo
                        },
                        type: "POST",
                        datatype: "json",
                        error: function (data1) {
                            toastr.error("请求失败！", "", toastrConfig);
                        },
                        success: function (data) {
                            if (data.result) {
                                $(data.obj).each(function (index, passenger) {
                                    manual_book0.allPassengers.$set(manual_book0.allPassengers.length, passenger);
                                });
                                manual_book0.cerCodes = _.map(manual_book0.allPassengers, function (item, index) {
                                    var cer = manual_book0.findCer(item, manual_book0.selectedCerIds[index]);
                                    return cer && cer.certificateCode;
                                });
                                manual_book0.cerCodes = _.uniq(manual_book0.cerCodes);
                            }
                        }
                    });
                }
            },
            toBook: function () {
                if (manual_book0.selectedBookPerson == null || manual_book0.selectedBookPerson.bookPersonName == undefined) {
                    toastr.error("请先选择预订人！", "", toastrConfig);
                    return;
                }
                if (manual_book0.allPassengers.length == 0) {
                    toastr.error("请添加乘客！", "", toastrConfig);
                    return;
                }
                if (manual_book0.allPassengers.length > 9) {
                    toastr.error("乘客不能多于9人！", "", toastrConfig);
                    return;
                }
                if (manual_book0.amount <= 0) {
                    toastr.error("数量需大于0", "", toastrConfig);
                    return;
                }

                var data = {};
                data.bookPerson = manual_book0.selectedBookPerson;
                data.passengers = _.map(manual_book0.allPassengers, function (item) {
                    item.isVip = item.isVip ? 1 : 0;
                    _.unset(item, 'orderItemId');
                    return item;
                });
                data.itineraryType = manual_book0.itineraryType;
                data.itineraryNo = manual_book0.itineraryNo;

                //判断乘客信息
                if (manual_book0.judgePassengerInfo(data.passengers)) {
                    return;
                }

                /*if (manual_book0.selectedBookPerson.bookPersonEmployeeId) {
                	manual_book0.addSearchPassenger(manual_book0.selectedBookPerson.bookPersonEmployeeId);
                }*/
                //添加常用旅客
                if (manual_book0.allPassengers.length > 0) {
                    manual_book0.addCommonPassenger();
                }

                for (var i = 0; i < data.passengers.length; i++) {
                    var cer = manual_book0.findCer(data.passengers[i], manual_book0.selectedCerIds[i]);
                    data.passengers[i].passengerCerCode = cer.certificateCode;
                    data.passengers[i].passengerCerName = cer.certificateType;
                    data.passengers[i].passengerCerType = cer.certificateTypeId;
                    delete data.passengers[i].certificates;
                }

                var action = __ctx + "/manualOrder/book1";
                var form = $("<form></form>");
                form.attr('action', action);
                form.attr('method', 'post');
                var input = $("<input type='text' id='bookdate' name='bookPersonAndPassengersDTOStr'/>");
                form.append(input);
                form.appendTo("body");
                form.css('display', 'none');
                $("#bookdate").val(JSON.stringify(data));
                sessionStorage.removeItem('bookPerson');
                sessionStorage.removeItem('passengers');
                sessionStorage.removeItem('itineraryType');
                sessionStorage.removeItem('itineraryNo');
                sessionStorage.setItem('bookPerson', JSON.stringify(data.bookPerson));
                sessionStorage.setItem('passengers', JSON.stringify(data.passengers));
                sessionStorage.setItem('itineraryType', JSON.stringify(data.itineraryType));
                sessionStorage.setItem('itineraryNo', JSON.stringify(data.itineraryNo));
                form.submit();
            },
            judgePassengerInfo: function (info) {
                var certieFlag = false;
                var passengerNameFlag = false;
                var passengerBirthDateFlag = false;
                var passengerTypeFlag = false;
                var passengerSexFlag = false;
                var pinyin = [];
                var pinyinFlag = false;
                $(info).each(function (i, e) {
                    //判断中文名字拼音
                    var nameBy = $("#selected_passengername" + e.passengerEmployeeId).val();
                    if (nameBy == null || nameBy == "") {
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
                                        toastr.error("没有匹配到中文", "", toastrConfig);
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
                                                    }
                                                }
                                                pinyin.push(data1.obj[p]);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                    //判断身份证和号码
                    var cercode = $("#selected_passengercerti" + e.passengerEmployeeId).val();
                    var certype = $.trim($("#selected_passengercerti" + e.passengerEmployeeId).text());
                    if (certype == null || certype == "" || cercode == null || cercode == "") {
                        certieFlag = true;
                    } else {
                        if (certype != "身份证") {
                            if (e.passengerBirthDate == null || e.passengerBirthDate == "") {
                                passengerBirthDateFlag = true;
                            }
                        }
                    }
                    if (e.passengerType == null || e.passengerType == "") {
                        passengerTypeFlag = true;
                    }
                    if (e.passengerSex == null || e.passengerSex == "") {
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
            changeCertificate: function (employeeId) {
                var certi = $("#passengercerti" + employeeId).val();
                $("#certiNo" + employeeId).text(certi);
            },
            findCer: function (passenger, selectedCerId) {
                selectedCerId == null ? selectedCerId = 1 : selectedCerId;
                return _.find(passenger.certificates, function (o) {
                    if (o != null) {
                        return o.certificateTypeId == selectedCerId;
                    }
                })
            },
            //公司逾期时,是否继续预定,取消按钮
            cancelDueCompany: function () {
                manual_book0.bookPerson.corporationId="";
            },
            checkDueCompany:function () {

                manual_book0.buttonFlag=true;
                if(val && val != ''){
                    $.ajax({
                        url: __ctx + "/itinerary/monthlyOverDueJudge",
                        data: {"companyId":val},
                        type: "POST",
                        dataType: "json",
                        success: function (data) {
                            if(data.result){
                                if(data.obj.hasOverDue == 'Y'){
                                    for(var i=0,length=manual_book0.companys.length;i<length;i++){
                                        if(val == manual_book0.companys[i].companyId){
                                            manual_book0.overDueCompanyName=manual_book0.companys[i].companyName;
                                            break;
                                        }
                                    }
                                    //公司已经逾期,判断是否可以继续预定
                                    if(data.obj.canBookWithOverDue == 1){
                                        //逾期可预订
                                        manual_book0.buttonFlag=true;
                                        $("#dueJudgeModal").modal({
                                            show: true,
                                            backdrop: 'static'
                                        });
                                    }else{
                                        //逾期不可预订
                                        manual_book0.buttonFlag=false;
                                        $("#dueJudgeModal").modal({
                                            show: true,
                                            backdrop: 'static'
                                        });
                                    }

                                }
                            }else{
                                toastr.error("获取公司是否逾期信息失败", "", {
                                    timeOut: 2000,
                                    positionClass: "toast-top-center"
                                });
                            }
                        }
                    });
                }
            }
        },
        computed: {
            cerCodes: function () {
                var thisVM = this;
                return _.map(thisVM.allPassengers, function (item, index) {
                    var cer = thisVM.findCer(item, thisVM.selectedCerIds[index]);
                    return cer && cer.certificateCode;
                });
                manual_book0.cerCodes = _.uniq(manual_book0.cerCodes);
            }
        },
        watch: {
            'allPassengers': {
                deep: true,
                handler: function (val) {
                    manual_book0.selectedCerIds = [];
                    manual_book0.searchPassengerArr = [];
                    manual_book0.commonPassengerArr = [];
                    _.forEach(val, function (item, index) {
                        if (val[index] && val[index].certificates && val[index].certificates.length > 0) {
                            manual_book0.selectedCerIds.push(val[index].certificates[0].certificateTypeId);
                        }
                        manual_book0.searchPassengerArr.push(item.passengerEmployeeId);
                        manual_book0.commonPassengerArr.push(item.passengerEmployeeId);
                    });
                }
            },
            'bookPerson.corporationId':{
                deep: true,
                handler: function(val){
                    manual_book0.buttonFlag=true;
                    $("#queryBookPersonBtn").attr("class","btn-xm-blue btn-radius");
                    if(val && val != ''){
                        $.ajax({
                            url: __ctx + "/itinerary/monthlyOverDueJudge",
                            data: {"companyId":val},
                            type: "POST",
                            dataType: "json",
                            success: function (data) {
                                if(data.result){
                                    if(data.obj.hasOverDue == 'Y'){
                                        for(var i=0,length=manual_book0.companys.length;i<length;i++){
                                            if(val == manual_book0.companys[i].companyId){
                                                manual_book0.overDueCompanyName=manual_book0.companys[i].companyName;
                                                break;
                                            }
                                        }
                                        //公司已经逾期,判断是否可以继续预定
                                        if(data.obj.canBookWithOverDue == 1){
                                            //逾期可预订
                                            manual_book0.buttonFlag=true;
                                            $("#dueJudgeModal").modal({
                                                show: true,
                                                backdrop: 'static'
                                            });
                                        }else{
                                            //逾期不可预订
                                            manual_book0.buttonFlag=false;
                                            $("#queryBookPersonBtn").attr("class","btn-xm-grey2 btn-radius");
                                            $("#dueJudgeModal").modal({
                                                show: true,
                                                backdrop: 'static'
                                            });
                                        }

                                    }
                                }else{
                                    //两边公司是否逾期一一对应,获取失败暂不处理
                                }
                            }
                        });
                    }
                }
            }
        }
    });

    $('#bookPersonModal').on('hidden.bs.modal', function () {
        manual_book0.bookPerson.page = 1;
        manual_book0.bookPerson.pageSize = 15;

        manual_book0.bookPersonList = {};
    });

    $('#passengerModel').on('hidden.bs.modal', function () {
        manual_book0.passengerSearchCondition.page = 1;
        manual_book0.passengerSearchCondition.pageSize = 5;
    })
});