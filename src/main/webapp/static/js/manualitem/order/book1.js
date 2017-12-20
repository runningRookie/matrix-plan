var manual_book1;
var bookPerson = JSON.parse(sessionStorage.getItem('bookPerson'));
var passengers = JSON.parse(sessionStorage.getItem('passengers'));
var itineraryType = JSON.parse(sessionStorage.getItem('itineraryType'));
var itineraryNo = JSON.parse(sessionStorage.getItem('itineraryNo'));
$(document).ready(function () {
    $('#dateInputPickerStart,#dateInputPickerEnd').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true, // 选择日期后自动关闭
        startDate: new Date(),
        onChangeDateTime: function () {
            $("#dateInputPickerEnd").datetimepicker("setStartDate", $("#dateInputPickerStart").val());
        }
    });

    $('#dateInputPickerTimeEnd, #dateInputPickerTimeStart').datetimepicker({
        minView: 0, // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd hh:ii", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true, // 选择日期后自动关闭
        startDate: new Date(),
        onChangeDateTime: function () {
            $("#dateInputPickerTimeEnd").datetimepicker("setStartDate", $("#dateInputPickerTimeStart").val());
        }
    });
    manual_book1 = new Vue({
        el: '#manualConfirmVM',
        data: {
            isActive: true,
            bookPerson: window.bookPerson,
            passengers: window.passengers,
            itineraryType: window.itineraryType,
            itineraryNo: window.itineraryNo,
            supplierDTOs: [],
            supplier: '',
            countryDTOs: [],
            cityDTOs: [],
            bookType: '0',

            fromCity: '',
            toCity: '',
            selectedCtry: "",
            selectedCtryId: '',
            selectedSup: "",
            selectedServiceType: "",
            ccPersons: [],
            contactPersons: [],
            selectedServicePersons: [],
            defaultSettlementType: 'm',
            settlementType: 'm',
            outOrderNo: "",
            productType: '',
            serviceTypes: [],
            products: [],

            responsibleGroup: '',
            responsiblePeople: '',
            serviceGroups: [],
            servicePeoples: [],
            sellerName: '',
            sellerId: '',
            managerName: '',
            managerId: '',
            innerText: '',
            outerText: '',
            visitBeginDate: '',
            visitEndDate: '',
            amount: '',
            serviceRemark: '',
            attachmentFileUrl: '',
            attachmentFileUrlObj: {
                fileName: '请选择文件',
                fileKey: ''
            },
            serviceName: '',
            serviceType: '',
            serviceAccount: '',
            channelFrom: '',

            //产品采购价
            purchasePrice: 0.00,
            //佣金
            comissionPrice: 0.00,
            //调整项
            adjustmentFee: 0.00,
            //产品销售价
            salesPrice: 0.00,
            //服务费
            serviceFee: 0.00,
            //总销售价
            totalSalesPrice: 0.00,
            //订单总金额
            orderTotalAmount: 0.00,
            //订单净成本
            orderNetCostPrice: 0.00,
            //订单总利润
            orderTotalProfit: 0.00,
            defaultProduct: 'DV1'
        },
        methods: {
            selectProduct: function (type, event) {
                if (type == 'DV1') {
                    var flag = false;
                    _.forEach(manual_book1.passengers, function (item) {
                        if (item.passengerCerType != 2 && item.passengerCerType != 3) {
                            flag = true;
                        }
                    });
                    if (flag) {
                        toastr.error("签证必须提供有效地护照信息！", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                        return;
                    }
                    manual_book1.selectedCtry = "";
                    manual_book1.selectedCtryId = '';
                } else {
                    manual_book1.selectedCtry = "156,中国";
                    manual_book1.selectedCtryId = '156';
                    var cname = manual_book1.selectedCtry.split(',')[1];
                    manual_book1.loadCityData(cname);
                }

                manual_book1.productType = type;
                if (event) {
                    var targetEm = $(event.target);
                    var brothers = targetEm.siblings();
                    targetEm.removeClass('btn-xm-default');
                    targetEm.addClass('btn-xm-blue');
                    brothers.removeClass('btn-xm-blue');
                    brothers.addClass('btn-xm-default');
                }
                manual_book1.purchasePrice = 0.00;
                manual_book1.comissionPrice = 0.00;
                manual_book1.adjustmentFee = 0.00;
                manual_book1.salesPrice = 0.00;
                manual_book1.serviceFee = 0.00;
                manual_book1.totalSalesPrice = 0.00;
                manual_book1.orderTotalAmount = 0.00;
                manual_book1.orderNetCostPrice = 0.00;
                manual_book1.orderTotalProfit = 0.00;
                manual_book1.serviceRemark = '';
                manual_book1.visitBeginDate = '';
                manual_book1.visitEndDate = '';
                manual_book1.fromCity = '';
                manual_book1.toCity = '';
                manual_book1.supplier = '';
                manual_book1.outOrderNo = '';
                manual_book1.attachmentFileUrlObj = {
                    fileName: '请选择文件',
                    fileKey: ''
                };
                manual_book1.attachmentFileUrl = '';
            },
            outLinkCorporation: function (courl) {
                var outCoUrl = courl.replace('{0}', manual_book1.bookPerson.bookCompanyId);
                window.open(outCoUrl, "_blank");
            },
            outLinkEditBookPerson: function (editUrl, item) {
                if (item.passengerEmployeeId != 0) {
                    var outEditUrl = editUrl.replace('{0}', item.bookPersonEmployeeId).replace('{1}', item.bookCompanyId);
                    window.open(outEditUrl, "_blank");
                }
            },
            outLinkEditPassenger: function (editUrl, item) {
                if (item.passengerEmployeeId != 0) {
                    var outEditUrl = editUrl.replace('{0}', item.passengerEmployeeId).replace('{1}', item.passengerCompanyId);
                    window.open(outEditUrl, "_blank");
                } else {
                    toastr.error("非同事信息无法修改", "", toastrConfig);
                }
            },

            loadCountryData: function () {
                $.ajax({
                    url: __ctx + "/manualBasicData/queryCountries",
                    data: {},
                    type: "POST",
                    datatype: "json",
                    success: function (data) {
                        manual_book1.countryDTOs = data.values;
                    },
                    error: function () {
                        toastr.error("获取国家信息失败", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    }
                });
            },
            loadCityData: function (val) {
                $.ajax({
                    url: __ctx + "/manualBasicData/queryCities",
                    data: {countryChineseName: val},
                    type: "POST",
                    success: function (data) {
                        manual_book1.cityDTOs = data.values;
                    },
                    error: function () {
                        toastr.error("获取城市信息失败", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    }
                });
            },
            loadSupData: function (tmcId) {
                $.ajax({
                    url: __ctx + "/searchManualItem/findSuppliers",
                    data: {
                        tmcId: tmcId
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (data) {
                        manual_book1.supplierDTOs = data
                    },
                    error: function () {
                        toastr.error("获取供应商信息失败", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    }
                });
            },
            loadServiceData: function (val) {
                $.ajax({
                    url: __ctx + "/searchManualItem/findServiceTypes",
                    data: {
                        code: val
                    },
                    type: "POST",
                    datatype: "json",
                    success: function (data) {
                        manual_book1.serviceTypes = data
                    },
                    error: function () {
                        toastr.error("获取供应商信息失败", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    }
                });
            },

            loadProductData: function () {
                $.ajax({
                    url: __ctx + "/searchManualItem/findProductTypes",
                    data: {},
                    type: "POST",
                    datatype: "json",
                    success: function (data) {
                        manual_book1.products = data;
                        $('#productsDiv').find('div:first-child').addClass('btn-xm-blue');
                        $('#productsDiv').find('div:gt(0)').addClass('btn-xm-default');
                    },
                    error: function () {
                        toastr.error("获取供应商信息失败", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    }
                });
            },

            initCCPersons: function (vm) {
                vm.ccPersons = [];
                _.forEach(vm.passengers, function (item, index) {
                    $.getJSON(__ctx + '/employees/' + item.passengerEmployeeId + '/servicepersons', function (data) {
                        vm.ccPersons = _.uniq(vm.ccPersons.concat(data.obj || []));
                    });
                });
            },
            addContactPersons: function () {
                if (this.contactPersons.length >= 2) {
                    toastr.error("联系人不能超过2个", "", toastrConfig);
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
            getResponsiblePepoleByGroupId: function (groupId, func) {
                $.getJSON(__ctx + '/resource/getResponsiblePepoleByGroupId', {responsibleGroupId: groupId}, function (data) {
                    manual_book1.servicePeoples = data;

                    !!func && func(data);
                });
            },
            order: function () {
                if (manual_book1.productType == 'DV1') {
                    var flag = false;
                    _.forEach(manual_book1.passengers, function (item) {
                        if (item.passengerCerType != 2 && item.passengerCerType != 3) {
                            flag = true;
                        }
                    });
                    if (flag) {
                        toastr.error("签证必须提供有效地护照信息！", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                        return;
                    }
                }
                if (manual_book1.supplier == null || manual_book1.supplier == '') {
                    toastr.error("请选择供应商信息", "", toastrConfig);
                    return;
                }
                if (manual_book1.outOrderNo == null || manual_book1.outOrderNo == '') {
                    toastr.error("请填写外采单号", "", toastrConfig);
                    return;
                }

                if (manual_book1.outOrderNo.length > 100) {
                    toastr.error("外采单号最长100位", "", toastrConfig);
                    return;
                }

                if (manual_book1.purchasePrice == null || manual_book1.purchasePrice === "" ||manual_book1.purchasePrice < 0) {
                    toastr.error("采购价 需大于等于0", "", toastrConfig);
                    return;
                }
                if (manual_book1.comissionPrice == null || manual_book1.comissionPrice === "" ||manual_book1.comissionPrice < 0) {
                    toastr.error("佣金 需大于等于0", "", toastrConfig);
                    return;
                }
                if (manual_book1.comissionPrice == null || manual_book1.comissionPrice === "" || manual_book1.serviceFee < 0) {
                    toastr.error("服务费 需大于等于0", "", toastrConfig);
                    return;
                }

                if (manual_book1.selectedServiceType == null || manual_book1.selectedServiceType == '') {
                    toastr.error("服务类别必填", "", toastrConfig);
                    return;
                } else {
                    var id = manual_book1.selectedServiceType.split(',')[0];
                    _.forEach(manual_book1.serviceTypes, function (item) {
                        if (item.id == id) {
                            manual_book1.serviceName = item.type;
                            manual_book1.serviceType = item.id;
                            manual_book1.productCode = item.code;
                        }
                    });
                }

                if (manual_book1.serviceRemark.length > 200) {
                    toastr.error("服务内容最长200字符", "", toastrConfig);
                    return;
                }
                if (manual_book1.serviceRemark.trim().length == 0) {
                    toastr.error("服务内容必填", "", toastrConfig);
                    return;
                }

                if (manual_book1.amount <= 0) {
                    toastr.error("数量必须大于0", "", toastrConfig);
                    return;
                }

                if (manual_book1.visitBeginDate == '' || manual_book1.visitEndDate == '') {
                    toastr.error("出发日期与结束日期必填", "", toastrConfig);
                    return;
                }
                if (manual_book1.productType == 'DV1') {
                    var resg = /^[1-2][0-9][0-9][0-9]-[0-1]{0,1}[0-9]-[0-3]{0,1}[0-9]$/;
                    if (!resg.test(manual_book1.visitBeginDate) || !resg.test(manual_book1.visitEndDate)) {
                        toastr.error("日期格式不正确", "", toastrConfig);
                        return;
                    } else {
                        if (moment(manual_book1.visitBeginDate.trim()).format("YYYY-MM-DD") > moment(manual_book1.visitEndDate.trim()).format("YYYY-MM-DD")) {
                            toastr.error("出发日期不得大于结束日期", "", toastrConfig);
                            return;
                        }
                        var dateFlag = moment(manual_book1.visitBeginDate.trim()).format("YYYY-MM-DD") < moment(new Date()).format("YYYY-MM-DD");
                        if (dateFlag) {
                            toastr.error("出发日期不得小于当前日期", "", toastrConfig);
                            return;
                        }
                    }
                    manual_book1.fromCity = manual_book1.toCity = '';
                } else {
                    if (manual_book1.visitBeginDate == "") {
                        toastr.error("出发/入住 日期必填", "", toastrConfig);
                        return;
                    }
                    var resg = /^[1-2][0-9][0-9][0-9]-[0-1]{0,1}[0-9]-[0-3]{0,1}[0-9]\s[0-5]{0,1}[0-9]:[0-5]{0,1}[0-9]$/;
                    if (!resg.test(manual_book1.visitBeginDate.trim())) {
                        toastr.error("日期格式不正确", "", toastrConfig);
                        return;
                    } else {
                        var timeFlag = moment(manual_book1.visitBeginDate.trim()).format("YYYY-MM-DD HH:mm") < moment(new Date()).format("YYYY-MM-DD HH:mm");

                        if (timeFlag) {
                            toastr.error("出发/入住 日期时间不得小于当前日期时间", "", toastrConfig);
                            return;
                        }
                    }

                    if (manual_book1.fromCity == "" || manual_book1.toCity == "") {
                        toastr.error("出发城市与到达城市必填", "", toastrConfig);
                        return;
                    }
                }

                if (manual_book1.totalSalesPrice == null
                    || manual_book1.totalSalesPrice === ""
                    || manual_book1.totalSalesPrice <= 0
                    || manual_book1.orderTotalAmount <= 0) {
                    toastr.error("总销售价不得小于等于0", "", toastrConfig);
                    return;
                }

                var cNameFlag = false;
                var cNamePhone = false;
                _.forEach(manual_book1.contactPersons, function (item) {
                    if (item.personName == null || item.personName == '') {
                        cNameFlag = true;
                    }
                    if (item.personMobile == null || item.personMobile == '') {
                        cNamePhone = true;
                    }
                    if (item.personTelephone == null) {
                        item.personTelephone = '';
                    }
                    if (item.personEmail == null) {
                        item.personEmail = '';
                    }
                });

                if (cNameFlag) {
                    toastr.error("联系人姓名不完整", "", toastrConfig);
                    return;
                }
                if (cNamePhone) {
                    toastr.error("联系人手机号不完整", "", toastrConfig);
                    return;
                }

                //责任组,责任人校验
                if(manual_book1.responsibleGroup == null || manual_book1.responsibleGroup ==""){
                    toastr.error("请选择责任组!", "", toastrConfig);
                    return;
                }
                if(manual_book1.responsiblePeople == null || manual_book1.responsiblePeople ==""){
                    toastr.error("请选择责任人!", "", toastrConfig);
                    return;
                }
                if (manual_book1.innerText.length > 200 || manual_book1.innerText.length > 200) {
                    toastr.error("备注信息最长200个字符", "备注信息长度超过限制", toastrConfig);
                    return;
                }

                var data = {};
                data.itineraryNo = manual_book1.itineraryNo;
                data.passengerDTOS = manual_book1.passengers;

                data.currency = 'CNY'; //人民币
                data.servicePersonDTOS = [];
                _.forEach(manual_book1.ccPersons, function (item) {
                    _.forEach(manual_book1.selectedServicePersons, function (id) {
                        if (id == item.id) {
                            data.servicePersonDTOS.push({
                                id: item.id,
                                servicePersonName: item.name,
                                servicePersonPhone: item.mobile,
                                servicePersonEmail: item.email,
                                servicePersonType: item.servicePersonTypeName,
                                passengerEmployeeId: item.employeeId
                            })
                        }
                    })
                });

                data.contactPersonDTOS = manual_book1.contactPersons;
                data.responsiblePeopleId = manual_book1.responsiblePeople.split(',')[0];
                data.responsiblePeopleName = manual_book1.responsiblePeople.split(',')[1];

                data.responsibleGroupId = manual_book1.responsibleGroup.split(',')[0];
                data.responsibleGroupName = manual_book1.responsibleGroup.split(',')[1];

                data.bookType = manual_book1.bookType;
                data.paymentType = manual_book1.settlementType;
                data.orderNo = '';// no use
                data.tmcId = '';// 后台配置
                data.corporationId = manual_book1.bookPerson.bookCompanyId;
                data.bookEmployeeId = manual_book1.bookPerson.bookPersonEmployeeId;
                data.bookEmployeeName =
                    manual_book1.bookPerson.bookPersonName == null || manual_book1.bookPerson.bookPersonName == ''
                        ? manual_book1.bookPerson.bookPersonEnlishName : manual_book1.bookPerson.bookPersonName;
                data.sellerId = manual_book1.sellerId;
                data.sellerName = manual_book1.sellerName;
                data.managerId = manual_book1.managerId;
                data.managerName = manual_book1.managerName;
                data.innerText = manual_book1.innerText;
                data.outerText = manual_book1.outerText;
                data.operator = '';// 后台配置
                data.operatorName = '';// 后台配置
                data.visitBeginDate = manual_book1.visitBeginDate.trim();
                data.visitEndDate = manual_book1.visitEndDate.trim();
                data.isOfficial = manual_book1.itineraryType;
                data.destinationCountry = manual_book1.selectedCtry.split(',')[1];
                if (manual_book1.selectedCtry.split(',')[0] == 156) { //中国
                    data.fromCity = manual_book1.fromCity != null && manual_book1.fromCity.split(',').length > 1 ? manual_book1.fromCity.split(',')[1] : '';
                    data.toCity = manual_book1.toCity != null && manual_book1.toCity.split(',').length > 1 ? manual_book1.toCity.split(',')[1] : '';
                } else {
                    data.fromCity = manual_book1.fromCity;
                    data.toCity = manual_book1.toCity
                }
                data.channelType = 6;//1：Online（PC）2：Online（APP）3：Online（WX） 4：Online（API） 5：Offline（白屏）,6：Offline（手工）
                data.serviceName = manual_book1.serviceName; // type
                data.serviceType = manual_book1.serviceType; // id
                data.serviceAccount = manual_book1.serviceAccount = manual_book1.amount;
                data.attachmentFileUrl = manual_book1.attachmentFileUrl;
                data.channelFrom = manual_book1.channelFrom;
                data.outerOrderNo = manual_book1.outOrderNo;
                data.productCode = manual_book1.productCode; // code
                data.serviceRemark = manual_book1.serviceRemark;
                data.supplier = manual_book1.supplier != null ? manual_book1.supplier.split(',')[0] : '';
                data.supplierName = manual_book1.supplier != null ? manual_book1.supplier.split(',')[1] : '';
                _.forEach(manual_book1.supplierDTOs, function (item) {
                    if (item.id == data.supplier) {
                        data.supplierCode = item.code;
                    }
                });

                data.responsiblePeopleStructure = '';
                data.responsiblePeopleStructureId = '';
                data.managerPeopleStructure = '';
                data.managerPeopleStructureId = '';
                data.sellerPeopleStructure = '';
                data.sellerPeopleStructureId = '';

                data.accountType = manual_book1.settlementType == 'm' ? 'c' : 'p';
                data.manualitemsOrderFeeDTO = {
                    purchasePrice: manual_book1.purchasePrice,
                    comissionPrice: manual_book1.comissionPrice,
                    adjustmentFee: manual_book1.adjustmentFee,
                    salesPrice: manual_book1.salesPrice,
                    serviceFee: manual_book1.serviceFee,
                    totalSalesPrice: manual_book1.totalSalesPrice,
                    orderTotalAmount: manual_book1.orderTotalAmount,
                    orderNetCostPrice: manual_book1.orderNetCostPrice,
                    orderTotalProfit: manual_book1.orderTotalProfit
                };

                $.ajax({
                    url: __ctx + "/manualOrder/createOrder",
                    data: {paramStr: JSON.stringify(data)},
                    type: "POST",
                    // datatype: "json",
                    // contentType: "application/json",
                    success: function (data) {
                        if (data.result) {
                            $('#toitinerarypage').modal('show');
                            sessionStorage.clear();
                            setTimeout(function () {
                                location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo=" + data.obj.itineraryNo;
                            }, 2000);
                        }
                        if (!data.obj) {
                            toastr.error("创建失败, 请重新创建", "", toastrConfig);
                        }
                    },
                    error: function () {
                        toastr.error("创建失败, 请重新创建", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    }
                });
            },
            curFloat: function (val) {
                return parseFloat(val) ? parseFloat(val) : 0.00;
            },
            uploadFile: function () {
                tc.utils.fileUpload(function (attachmentFileUrlObj) {
                    manual_book1.attachmentFileUrlObj = attachmentFileUrlObj;
                    manual_book1.attachmentFileUrl = 'fileKey=' + attachmentFileUrlObj.fileKey + '&fileName=' +
                        (attachmentFileUrlObj.fileName == '请选择文件' ? "" : attachmentFileUrlObj.fileName);
                });
            },
            removeFile: function () {
                manual_book1.attachmentFileUrlObj = {
                    fileName: '请选择文件',
                    fileKey: ''
                };
                manual_book1.attachmentFileUrl = '';
            }
        },
        filters: {
            'nameSelector': function(item, type){
                if (type == 'bookPerson' ){
                    return item.bookPersonName == null || item.bookPersonName =='' ? item.bookPersonEnlishName : item.bookPersonName;
                }
                if (type == 'passenger'){
                    return item.passengerName == null || item.passengerName =='' ? item.passengerEnlishName : item.passengerName;
                }
            }
        },
        watch: {
            'selectedCtry': {
                deep: true,
                handler: function (value) {
                    var cname = value.split(',')[1];
                    manual_book1.selectedCtryId = value.split(',')[0];
                    this.loadCityData(cname);
                }
            },
            'settlementType': {
                deep: true,
                handler: function () {
                    $.uniform.update(); //更新页面
                }
            },

            'productType': {
                deep: true,
                handler: function (val) {
                    if (val == 'DV1') {
                        manual_book1.serviceAccount = manual_book1.amount = manual_book1.passengers.length;
                    }
                    this.loadServiceData(val);
                }
            },
            'responsibleGroup': function (val) {
                if (!val) {
                    return;
                }
                manual_book1.responsiblePeople = '';
                var id = val.split(',')[0];
                manual_book1.getResponsiblePepoleByGroupId(id);
            },
            'itineraryType': function (val) {
                if (val == 1) {
                    manual_book1.defaultSettlementType = manual_book1.settlementType = 'm';
                } else {
                    manual_book1.defaultSettlementType = manual_book1.settlementType = 'n';
                }
            },
            'visitBeginDate': {
                deep: true,
                handler: function (val) {
                    // this.visitEndDate = val;
                    $("#dateInputPickerEnd").datetimepicker("setStartDate", val);
                    $("#dateInputPickerTimeEnd").datetimepicker("setStartDate", val);
                }
            }

        },
        computed: {
            'orderTotalAmount': function () {
                var a = this.curFloat(this.purchasePrice) + this.curFloat(this.adjustmentFee) + this.curFloat(this.serviceFee);
                return a ? _.round(a, 2) : 0.00;
            },
            'orderNetCostPrice': function () {
                var b = this.curFloat(this.purchasePrice) - this.curFloat(this.comissionPrice);
                return b ? _.round(b, 2) : 0.00;
            },
            'orderTotalProfit': function () {
                var c = this.curFloat(this.orderTotalAmount) - this.curFloat(this.orderNetCostPrice);
                return c ? _.round(c, 2) : 0.00;
            },
            'totalSalesPrice': function () {
                var d = this.curFloat(this.purchasePrice) + this.curFloat(this.adjustmentFee) + this.curFloat(this.serviceFee);
                return d ? _.round(d, 2) : 0.00;
            },
            'salesPrice': function () {
                var e = this.curFloat(this.purchasePrice) + this.curFloat(this.adjustmentFee);
                return e ? _.round(e, 2) : 0.00;
            }
        },
        ready: function () {
            var thisVM = this;
            thisVM.productType = 'DV1';
            thisVM.loadSupData(window.tmcId);
            thisVM.loadCountryData();
            thisVM.loadServiceData(thisVM.productType);
            thisVM.loadProductData();
            thisVM.contactPersons = [{
                personName: bookPerson.bookPersonName || bookPerson.bookPersonEnlishName || bookPerson.bookPersonNickname,
                personTelephone: bookPerson.bookPersonTelPhone,
                personMobile: bookPerson.bookPersonPhone,
                personEmail: bookPerson.bookPersonEmail
            }];
            thisVM.initCCPersons(thisVM);
            $.getJSON(__ctx + '/basicinfo/corporations/' + bookPerson.bookCompanyId, function (data) {
                thisVM.sellerId = data.obj.corporationDetail.sellerId;
                thisVM.sellerName = data.obj.corporationDetail.sellerName;
                thisVM.managerId = data.obj.corporationDetail.managerId;
                thisVM.managerName = data.obj.corporationDetail.managerName;
            });

            // $.getJSON(__ctx + '/resource/getPaymentType', {employeeId: bookPerson.bookPersonEmployeeId}, function (data) {
            //     thisVM.settlementType = data.obj;
            //     thisVM.defaultSettlementType = data.obj;
            //     $.uniform.update();
            // });

            var cname = thisVM.selectedCtry.split(',')[1];
            thisVM.selectedCtryId = thisVM.selectedCtry.split(',')[0];
            thisVM.loadCityData(cname);

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
                        thisVM.getResponsiblePepoleByGroupId(group.id, function (peoples) {
                            var people = _.find(peoples, {id: parseInt(employeeId)});
                            if (!people) {
                                return;
                            }
                            thisVM.responsiblePeople = people.id + ',' + people.chineseName;
                        });
                    }
                });
            });
            $('#productsDiv').find('div:eq(0)').addClass('btn-xm-blue');
            $('#productsDiv').find('div:gt(0)').addClass('btn-xm-default');
        }
    });
});