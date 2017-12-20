var detailVM;
$(document).ready(function () {

    Vue.filter('paymentTypeFilter', function (value) {
        if (value == 'n') {
            return '现结';
        } else if (value == 'm') {
            return '授信';
        } else {
            return '';
        }
    });
    Vue.filter('getDateFilter', {
        read: function (value, format) {
            if (value == '1970-01-01 00:00:00') {
                return '';
            }
            if (format) {
                return moment(value).format(format);
            } else {
                return value;
            }
        }
    });
    Vue.filter('holdClassTypeFilter', {
        read: function (value) {
            if (value == "a") {
                return '成人';
            }
            if (value == "c") {
                return '儿童';
            }
            if (value == "b") {
                return '婴儿';
            }
        }
    });
    Vue.filter('productCodeFilter', {
        read: function (value) {
            if (value == "DA1") {
                return '国内机票';
            }
            if (value == "IA1") {
                return '国际机票-大陆到港澳台';
            }
            if (value == "IA2") {
                return '国际机票-大陆到亚洲(非港澳台)';
            }
            if (value == "IA3") {
                return '国际机票-大陆到亚洲外';
            }
            if (value == "IA4") {
                return '国际机票-境外到境外(洲内)';
            }
            if (value == "IA5") {
                return '国际机票-境外到境外(跨洲)';
            }
            if (value == "DH1") {
                return '国内酒店';
            }
            if (value == "IH1") {
                return '国际酒店';
            }
            if (value == "DT1") {
                return '国内火车票';
            }
            if (value == "IV1") {
                return '亚洲签证';
            }
            if (value == "IV2") {
                return '欧洲签证';
            }
            if (value == "IV3") {
                return '北美签证';
            }
            if (value == "DC1") {
                return '国内租车';
            }
            if (value == "IC1") {
                return '国际租车';
            }
            if (value == "DI") {
                return '国内保险';
            }
        }
    });
    Vue.filter('insurancePeriodFilter', {
        read: function (value) {
            if (value == "1") {
                return '单次';
            }
            if (value == "2") {
                return '七天';
            }
        }
    });
    Vue.filter('insureStatusFilter', {
        read: function (value) {
            if (value == "0") {
                return '待购';
            }
            if (value == "1") {
                return '已购';
            }
            if (value == "2") {
                return '投保失败';
            }
            if (value == "3") {
                return '待退';
            }
            if (value == "4") {
                return '已退';
            }
            if (value == "5") {
                return '退保失败';
            }
            if (value == "6") {
                return '已取消';
            }
        }
    });
    Vue.filter('ruleProduceBuyTypeFilter', {
        read: function (value) {
            if (value == "1") {
                return '赠完购买';
            }
            if (value == "2") {
                return '赠完关闭';
            }
            if (value == "3") {
                return '选择购买';
            }
            if (value == "4") {
                return '强制购买';
            }
        }
    });
    Vue.filter('ruleProduceSaleTypeFilter', {
        read: function (value) {
            if (value == "10") {
                return '联售';
            }
            if (value == "11") {
                return '联赠';
            }
            if (value == "20") {
                return '单售';
            }
            if (value == "21") {
                return '单赠';
            }
        }
    });
    Vue.filter('billOperateTypeFilter', {
        read: function (value) {
            if (value == "1") {
                return '出';
            }
            if (value == "2") {
                return '改';
            }
            if (value == "3") {
                return '退';
            }
        }
    });

    Vue.filter('numberFix', {
        read: function (value, number) {
        	if(value!=null){
        		return value.toFixed(number);
            }
        }
    });

    detailVM = new Vue({
        el: '#insuranceDetailVM',
        data: {
            insuranceOrderDTO: {},
            insuranceOrderItemDTOs: [],
            insuranceOrderItemFinanceDTOs: [],
            insuranceOrderMainDTO: {},
            insuranceContactPersonDTOs: [],
            insuranceOrderLogs: [],
            totalPurchasePrice: 0,
            totalSalePrice: 0,
            chooseItem: {},
            isReturn: false,
            goInsurance: {
                supplierCode: undefined,
                insureStatus: undefined,
                insuranceNumber: undefined,
                insureTaskCode: undefined,
                canChooseStatus: true
            },
            goReturn: {
                insureStatus: undefined,
                returnTaskCode: undefined,
                canChooseStatus: true
            },
            financeList: []
        },
        ready: function () {
            this.loadData();
            this.loadLog();
        },
        methods: {
            loadData: function () {
                $.ajax({
                    url: __ctx + "/insurance/getInfoByOrderNo?orderNo=" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result && result.obj) {
                            detailVM.insuranceOrderDTO = result.obj.insuranceOrderDTO;
                            detailVM.insuranceOrderItemDTOs = result.obj.insuranceOrderItemDTOs;
                            detailVM.insuranceOrderMainDTO = result.obj.insuranceOrderMainDTO;
                            detailVM.insuranceContactPersonDTOs = result.obj.insuranceContactPersonDTOs;

                            _.forEach(detailVM.insuranceOrderItemDTOs, function (orderItem) {
                                detailVM.totalSalePrice += orderItem.insuranceSoldProduceDTO.ruleProduceDealSalePrice;
                                detailVM.totalPurchasePrice += orderItem.insuranceSoldDTO.purchasePrice;
                                orderItem.canEdit = false;
                                // if (orderItem.insureStatus && detailVM.insuranceOrderDTO.payDate && detailVM.insuranceOrderDTO.payDate != '1970-01-01 00:00:00' &&
                                if (orderItem.insureStatus && detailVM.insuranceOrderDTO.payDate &&
                                    (orderItem.insureStatus == '0'
                                    || orderItem.insureStatus == '1'
                                    || orderItem.insureStatus == '2'
                                    || orderItem.insureStatus == '5')) {
                                    orderItem.canEdit = true;
                                }
                            });
                            detailVM.totalSalePrice = detailVM.totalSalePrice.toFixed(2);
                            detailVM.totalPurchasePrice = detailVM.totalPurchasePrice.toFixed(2);
                        } else {
                            toastr.error("获取保险数据失败", "", toastrConfig);
                        }
                    },
                    error: function (result) {
                        toastr.error("获取保险数据失败", "", toastrConfig);
                    }
                })
            },
            loadLog: function () {
                $.ajax({
                    url: __ctx + "/insurance/logs?insuranceNo=" + window.orderNo,
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result && result.obj) {
                            detailVM.insuranceOrderLogs = result.obj;
                        }
                    },
                    error: function (result) {
                        toastr.error("获取日志数据失败", "", toastrConfig);
                    }
                })
            },
            itemDetail: function (orderItem) {
                detailVM.$set('chooseItem', orderItem);
            },
            billDetail: function () {
                detailVM.financeList = [];
                $.ajax({
                    url: __ctx + "/insurance/getBillList",
                    type: "POST",
                    contentType: "application/json",
                    datatype: "json",
                    data: JSON.stringify({insuranceOrderNo:window.orderNo}),
                    success: function (result) {
                        detailVM.$set('insuranceOrderItemFinanceDTOs', []);
                        if (result.data) {
                            detailVM.$set('financeList', result.data);
                        }
                        var itemMap = {};
                        _.forEach(detailVM.insuranceOrderItemDTOs, function (insuranceOrderItem) {
                            var key = insuranceOrderItem.insuranceNumber;
                            itemMap[key] = insuranceOrderItem;
                        });
                        _.forEach(detailVM.financeList, function (finance, index) {
                            detailVM.$set('insuranceOrderItemFinanceDTOs[' + index + '].viewStatus', "N");
                            var key = finance.insuranceNumber;
                            detailVM.$set('insuranceOrderItemFinanceDTOs[' + index + '].item', {});
                            if (key) {
                                var item = itemMap[key];
                                if (item) {
                                    detailVM.$set('insuranceOrderItemFinanceDTOs[' + index + '].item', item);
                                    detailVM.$set('insuranceOrderItemFinanceDTOs[' + index + '].viewStatus', finance.viewStatus);
                                }
                            }
                            detailVM.$set('insuranceOrderItemFinanceDTOs['+index+'].finance', finance);
                        });
                    },
                    error: function (result) {
                        toastr.error("获取账单信息失败", "", toastrConfig);
                    }
                });
            },
            manualBill: function (item) {
                $.ajax({
                    url: __ctx + "/insurance/createBill",
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        ticketNo: item.item.insuranceNumber,
                        orderNumber: item.item.insuranceOrderNo,
                        tickType: item.item.saleType,
                        operateTypeId: item.finance.operateType,
                        companyId: detailVM.insuranceOrderMainDTO.coporationId,
                        externalOrderNo: item.item.insureTaskCode,
                        itemId: item.item.id
                    }),
                    success: function (result) {
                        if (result.success && result.data.success) {
                            toastr.success("手工登账成功", "", toastrConfig);
                        }else{
                            toastr.error("手工登账失败", "", toastrConfig);
                        }
                        detailVM.billDetail();
                    }
                });
            },
            financeNote: function(billNo) {
                detailVM.billNo = billNo;
                $("#billAccount").modal('hide');
                $("#financeNote").modal({
                    show: true,
                    remote: __ctx + "/insurance/toFinanceNote",
                    backdrop: 'static',
                })
            },
            billsVoided: function (item) {
                $.ajax({
                    url: __ctx + "/insurance/billsVoided",
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        billsNo: item.finance.billNo,
                        operateTypeId: item.finance.operateType
                    }),
                    success: function (result) {
                        if (result.success) {
                            toastr.success("手工作废成功", "", toastrConfig);
                        }else{
                            toastr.error("手工作废失败", "", toastrConfig);
                        }
                        detailVM.billDetail();
                    }
                });
            },
            dealStatus: function (orderItem) {
                detailVM.chooseItem = orderItem;
                if (orderItem.insureStatus == '1'
                    || orderItem.insureStatus == '5') {
                    //可以进行退保
                    detailVM.isReturn = true;
                    detailVM.goInsurance = {
                        itemStatus: orderItem.insureStatus,
                        insureStatus: detailVM.chooseItem.insureStatus,
                        returnTaskCode: undefined,
                        canChooseStatus: true,
                        insureStatusList: []
                    };
                    if (orderItem.insureStatus == "1") {
                        detailVM.goInsurance.insureStatusList = [
                            {statusValue: "1", statusName: "已购"},
                            {statusValue: "4", statusName: "已退"}
                        ]
                    }
                    if (orderItem.insureStatus == "5") {
                        detailVM.goInsurance.insureStatusList = [
                            {statusValue: "5", statusName: "退保失败"},
                            {statusValue: "4", statusName: "已退"}
                        ]
                    }
                } else {
                    //可以进行投保
                    detailVM.isReturn = false;
                    detailVM.goInsurance = {
                        itemStatus: orderItem.insureStatus,
                        supplierCode: undefined,
                        insureStatus: detailVM.chooseItem.insureStatus,
                        insuranceNumber: undefined,
                        insureTaskCode: undefined,
                        canChooseStatus: true,
                        insureStatusList: []
                    };
                    if (orderItem.insureStatus == "0") {
                        detailVM.goInsurance.insureStatusList = [
                            {statusValue: "0", statusName: "待购"},
                            {statusValue: "1", statusName: "已购"},
                            {statusValue: "6", statusName: "已取消"}
                        ]
                    }
                    if (orderItem.insureStatus == "2") {
                        detailVM.goInsurance.insureStatusList = [
                            {statusValue: "1", statusName: "已购"},
                            {statusValue: "2", statusName: "投保失败"},
                            {statusValue: "6", statusName: "已取消"}
                        ]
                    }
                }
            },
            updateItem: function (param) {
                $.ajax({
                    url: __ctx + "/insurance/updateItems",
                    type: "POST",
                    contentType: "application/json",
                    datatype: "json",
                    data: JSON.stringify({insuranceItemUpdates:param}),
                    success: function (result) {
                        if (result.result) {
                            toastr.info("更新成功", "", toastrConfig);
                            window.setTimeout(function () {
                                window.location.reload();
                            },2000);
                        } else {
                            toastr.error("更新失败", "", toastrConfig);
                        }
                    },
                    error: function (result) {
                        toastr.error("更新失败", "", toastrConfig);
                    }
                })
            },
            handRefund: function () {
                var handData = {
                    insuranceOrderNo:detailVM.chooseItem.insuranceOrderNo,
                    insuranceItemIds: []
                };
                handData.insuranceItemIds.push(detailVM.chooseItem.id);
                if (confirm("确认手动退保？")) {
                    $.ajax({
                        url: __ctx + "/insurance/refundInsurance",
                        type: "POST",
                        contentType: "application/json",
                        datatype: "json",
                        data: JSON.stringify(handData),
                        success: function (result) {
                            if (result && result.data) {
                                toastr.info("手动申请退保成功", "", toastrConfig);
                                window.setTimeout(function () {
                                    window.location.reload();
                                },2000);
                            } else {
                                detailVM.dealStatus(detailVM.chooseItem);
                                toastr.error("手动申请退保失败", "", toastrConfig);
                            }
                        },
                        error: function (result) {
                            toastr.error("手动申请退保失败", "", toastrConfig);
                        }
                    });
                }
            },
            handInsurance: function () {
                var handData = {
                    insuranceOrderNo:detailVM.chooseItem.insuranceOrderNo,
                    orderItemIdList: []
                };
                handData.orderItemIdList.push(detailVM.chooseItem.id);
                if (confirm("确认手动投保？")) {
                    $.ajax({
                        url: __ctx + "/insurance/gotoBuy",
                        type: "POST",
                        contentType: "application/json",
                        datatype: "json",
                        data: JSON.stringify(handData),
                        success: function (result) {
                            if (result && result.data) {
                                toastr.info("手动申请投保成功", "", toastrConfig);
                                window.setTimeout(function () {
                                    window.location.reload();
                                },2000);
                            } else {
                                detailVM.dealStatus(detailVM.chooseItem);
                                toastr.error("手动申请投保失败", "", toastrConfig);
                            }
                        },
                        error: function (result) {
                            toastr.error("手动申请投保失败", "", toastrConfig);
                        }
                    });
                }
            },
            handRefundSave: function () {
                var saveData = {
                    status:undefined,
                    insuranceItemId:undefined,
                    returnTaskCode:undefined,
                    insuranceOrderNumber:undefined,
                    supplierCode:undefined,
                    insureTaskCode:undefined,
                    callbackType:undefined
                };
                saveData.status = detailVM.goInsurance.insureStatus;
                saveData.insuranceItemId = detailVM.chooseItem.id;
                saveData.insuranceOrderNumber = detailVM.chooseItem.insuranceOrderNo;
                saveData.callbackType = "2";
                if (detailVM.goInsurance.insureStatus == "4") {
                    if(!detailVM.goInsurance.returnTaskCode || detailVM.goInsurance.returnTaskCode == '') {
                        toastr.error("退保流水号不能为空", "", toastrConfig);
                        return;
                    }
                    saveData.returnTaskCode = detailVM.goInsurance.returnTaskCode;
                }

                var saveDataList = [];
                saveDataList.push(saveData);
                if (confirm("确认保存？")) {
                    detailVM.updateItem(saveDataList);
                }
            },
            handInsuranceSave: function () {
                var saveData = {
                    status:undefined,
                    insuranceItemId:undefined,
                    returnTaskCode:undefined,
                    insuranceOrderNumber:undefined,
                    supplierCode:undefined,
                    insureTaskCode:undefined,
                    callbackType:undefined
                };
                saveData.status = detailVM.goInsurance.insureStatus;
                saveData.insuranceItemId = detailVM.chooseItem.id;
                saveData.insuranceOrderNumber = detailVM.chooseItem.insuranceOrderNo;
                if (detailVM.goInsurance.insureStatus == "6") {
                    saveData.callbackType = "99";
                } else {
                    saveData.callbackType = "1";
                }
                if (detailVM.goInsurance.insureStatus == "1") {
                    if(!detailVM.goInsurance.insuranceNumber || detailVM.goInsurance.insuranceNumber == '') {
                        toastr.error("投保单号不能为空", "", toastrConfig);
                        return;
                    }
                    if(!detailVM.goInsurance.supplierCode || detailVM.goInsurance.supplierCode == '') {
                        toastr.error("供应商编号不能为空", "", toastrConfig);
                        return;
                    }
                    if(!detailVM.goInsurance.insureTaskCode || detailVM.goInsurance.insureTaskCode == '') {
                        toastr.error("投保流水号不能为空", "", toastrConfig);
                        return;
                    }
                    saveData.insuranceNumber = detailVM.goInsurance.insuranceNumber;
                    saveData.supplierCode = detailVM.goInsurance.supplierCode;
                    saveData.insureTaskCode = detailVM.goInsurance.insureTaskCode;
                }

                var saveDataList = [];
                saveDataList.push(saveData);
                if (confirm("确认保存？")) {
                    detailVM.updateItem(saveDataList);
                }
            }
        }
    });
});