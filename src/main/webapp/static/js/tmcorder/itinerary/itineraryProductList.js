var vm_list;
$(document).ready(function () {
    document.onclick = function () {
        $(".stopover-station").addClass("dn");
        vm_list.showApprovalRecord = false;
        $(".stopover-station-itinerary").addClass("dn");
        vm_list.showitinerarySubsidiary = false;
    };

    Vue.filter('auditStatusFliter', {
        read: function (value, format) {
            if (value == 01) {
                return '待审批';
            }
            if (value == 02) {
                return '审批中';
            }
            if (value == 03) {
                return '审批不通过';
            }
            if (value == 04) {
                return '审批通过';
            }


        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('itineraryFliter', {
        read: function (value, format) {
            if (value == 1) {
                return '因公预订';
            }
            if (value == 2) {
                return '因私预订';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('carOrderStatusFliter', {
        read: function (value, format) {
            if (value == '2') {
                return '已支付';
            }
            if (value == '3') {
                return '已退款';
            }
            if (value == '4') {
                return '已取消';
            }
            if (value == '7') {
                return '部分退款';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
    
    Vue.filter('carOrderTypeFliter', {
        read: function (value, format) {
            if (value == '0') {
                return '实时';
            }
            if (value == '1') {
                return '预约';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
    
    
    
    Vue.filter('approvalModelFliter', {
        read: function (value, format) {
            if (value == 1) {
                return '按组织架构审批';
            }
            if (value == 2) {
                return '授权沿用';
            }
            if (value == 3) {
                return '直接线下审批';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('approvalResultFliter', {
        read: function (value, format) {
            if (value == -1) {
                return '拒绝';
            }
            if (value == 0) {
                return '未审批';
            }
            if (value == 1) {
                return '通过';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('approvalReferenceFliter', {
        read: function (value, format) {
            if (value == 1) {
                return '预订人';
            }
            if (value == 2) {
                return '差旅人';
            }
            if (value == 3) {
                return '参照人';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('productCodeFliter', {
        read: function (value, format) {
            if (value == 'DA1') {
                return '国内机票';
            }
            if (value == 'DT1') {
                return '火车票';
            }
            if (value == 'DH1') {
                return '国内酒店';
            }
        },
        write: function (value, format) {
            return value;
        }
    });


    Vue.filter('orderStatusFliter', {
        read: function (value, format) {
            if (value == 01) {
                return '订单取消';
            }
            if (value == 02) {
                return '待提交';
            }
            if (value == 03) {
                return '待审批';
            }
            if (value == 04) {
                return '审批中';
            }
            if (value == 05) {
                return '审批不通过';
            }
            if (value == 06) {
                return '待支付';
            }
            if (value == 07) {
                return '待人工出票';
            }
            if (value == 08) {
                return '出票驳回';
            }
            if (value == 09) {
                return '出票驳回待审核';
            }
            if (value == 10) {
                return '出票驳回审核通过';
            }
            if (value == 11) {
                return '出票驳回审核不通过';
            }
            if (value == 12) {
                return '出票成功';
            }
            if (value == 13) {
                return '变更中';
            }
            if (value == 14) {
                return '部分改期';
            }
            if (value == 15) {
                return '部分退票';
            }
            if (value == 16) {
                return '已改期';
            }
            if (value == 17) {
                return '已退票';
            }
            if (value == 18) {
                return '待自动出票';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('hotelOrderStatusFilter', {
        read: function (value, format) {
            if (value == 0) {
                return '待提交';
            }
            if (value == 1) {
                return '已取消';
            }
            if (value == 2) {
                return '待审批';
            }
            if (value == 3) {
                return '审批中';
            }
            if (value == 4) {
                return '审批不通过';
            }
            if (value == 5) {
                return '待支付';
            }
            if (value == 6) {
                return '待供应商确认';
            }
            if (value == 7) {
                return '供应商不确认';
            }
            if (value == 8) {
                return '供应商口头确认';
            }
            if (value == 9) {
                return '供应商已确认';
            }
            if (value == 10) {
                return '入住中';
            }
            if (value == 11) {
                return '确认入住';
            }
            if (value == 12) {
                return '确认未住';
            }
            if (value == 13) {
                return '部分退房';
            }
            if (value == 14) {
                return '已取消(全部退房)';
            }
            if (value == 15) {
                return '申请取消';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
    
    Vue.filter('manualItemOrderStatusFliter', {
        read: function (value, format) {
        	if (value == 0) {
                return '待提交';
            }
        	
            if (value == 2) {
                return '待审批';
            }

            if (value == 5) {
                return '待支付';
            }
            
            if (value == 8) {
                return '已登账';
            }
            
            if (value == 9) {
                return '待登账';
            }
            
            if (value == 10) {
                return '已取消';
            }
            
            if (value == 11) {
                return '有退单';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

        
    Vue.filter('manualItemPaymentTypeFliter', {
        read: function (value, format) {
        	if (value == "m") {
                return '授信';
            }
        	
            if (value == "n") {
                return '现结';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
    
    Vue.filter('hotelApprovalStatusFilter', {
        read: function (value, format) {
            if (value == 1) {
                return '待审批';
            }
            if (value == 2) {
                return '审批中';
            }
            if (value == 3) {
                return '审批通过';
            }
            if (value == 4) {
                return '审批不通过';
            }
            if (value == 5) {
                return '撤销审批';
            }
            if (value == 6) {
                return '';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('approvalFinalTypeFilter', {
        read: function (value, format) {
            if (value == 1) {
                return '紧急审批';
            }
            if (value == 2) {
                return '免审';
            }
            if (value == 3) {
                return '线下审批';
            }
            if (value == 4) {
                return '授权沿用';
            }
            if (value == 5) {
                return '正常审批（短信）';
            }
            if (value == 6) {
                return '正常审批（邮件）';
            }
            if (value == 7) {
                return '正常审批（OBT）';
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('auditId', {
        read: function (value, format) {
            if (!value) {
                return '';
            }
            return value;
        },
        write: function (value, format) {
            return value;
        }
    });

    Vue.filter('serviceRemarkFliter', {
        read: function (value, format) {
            if (value && value.length > 50) {
                return value.substr(0, 50) + "...";
            }

            return value;
        },
        write: function (value, format) {
            return value;
        }
    });    
    
    vm_list = new Vue({
        el: "#itineraryproductlist",
        data: {
            infos: [],
            params: {},
            checked: [],
            orderNos: [],
            cancelReason: "行程取消",
            cancelReasonCode: "1",
            orderNo: "",
            auditId: "",
            productCode: "",
            hotelorderstatus: "",
            allowedOrderStatus: ["02", "03", "04", "05", "06"],
            auditStatusList: ["01", "02"],
            auditStatus2: ["01"],
            hotelAudit: "1,2",
            hotelAudit2: "1",
            trainStatus: ["A", "D", "G", "H", "S"],
            hotelOutStatus: "0,2,3,4,5",
            allowedManualItemOrderStatus: ["0","5"],
            showModel: false,
            showApprovalRecord: false,
            approvalFlows: [],
            approvalRecords: [],
            itinerarySubsidiaryData: [],
            travelPurposeData:{
            	"result":false,
            	"subsidiaryResult":false,
            	"chineseTitle":"",
            	"value":"",
            	"additionalFillinBox":"",
            	"additionalFillinBoxRequired":"",
            	"travelPurposeRemark":"",
            	"travelPurposeUrl":[],
            },//差旅目的对象
            itineraryUpdateParm: {},
            showitinerarySubsidiary: false
        },
        ready: function () {
            // 页面初始化载入首页数据.
            this.loadGridData();
            this.showModel = true;
            setTimeout(function () {
                $('#confirmCancel').on('shown.bs.modal', function (event) {
                    var button = $(event.relatedTarget) // Button that triggered the modal
                    var orderNo = button.data('orderno') // Extract info from data-* attributes
                    var productCode = button.data('productcode')
                    vm_list.orderNo = orderNo;
                    vm_list.productCode = productCode;
                });
            }, 500);

        },
        computed: {
            allowSubmit: function () {
                var thisVM = this;
                if (thisVM.checked.length == 0) {
                    return false;
                }
                var flag = true;
                _.forEach(thisVM.checked, function (index) {
                    index = parseInt(index);
                    var order = thisVM.infos[index];
                    if (order.flightOrderStatus != "02") {
                        flag = false;
                        return false;
                    }
                });
                if (!flag) {
                    toastr.error("请选择待提交订单！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                }
                return flag;
            }
        },
        methods: { //紧急审批
            emergencyApproval: function () {
                var emergencyApprovalQuery = {};
                emergencyApprovalQuery.auditId = vm_list.infos.approvalResultDTOList[0].auditId;
                emergencyApprovalQuery.itineraryProductList = vm_list.infos;
                emergencyApprovalQuery.stopRadio = this.emergencyApprovalQuery.stopRadio;
                emergencyApprovalQuery.codeStop = this.emergencyApprovalQuery.stopRadio == 2 ? this.emergencyApprovalQuery.codeStop1 : this.emergencyApprovalQuery.codeStop2;

                if (!emergencyApprovalQuery.stopRadio) {
                    toastr.error("请选择审批方式", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }

                if (emergencyApprovalQuery.stopRadio == 2 && !emergencyApprovalQuery.codeStop) {
                    toastr.error("请输入特殊code", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $.ajax({
                    url: __ctx + "/commitaudit/emergencyapproval",
                    contentType: "application/json",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(emergencyApprovalQuery),
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.obj, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            toastr.info("提交紧急审批成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            window.location.reload();
                        }
                    }
                });
            },
            /*撤回审批*/
            cancellationOrder: function () {
                var trminationApprovalQueryDTO = {};
                trminationApprovalQueryDTO.auditId = vm_list.infos.approvalResultDTOList[0].auditId;
                trminationApprovalQueryDTO.itineraryProductList = vm_list.infos;
                $.ajax({
                    url: __ctx + "/commitaudit/trminationapproval",
                    contentType: "application/json",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(trminationApprovalQueryDTO),
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "撤回审批失败", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            toastr.info(data.message, "撤回审批成功", {timeOut: 2000, positionClass: "toast-top-center"});
                            window.location.reload();
                        }
                    }
                });
            },
            goSms: function () {
                this.orderNos = [];
                var travelOnOffCfgDTOs = vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[0].onOff.toString() + ','+ vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[1].onOff.toString() + ','+
                    vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[2].onOff.toString() +  ','+ vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[3].onOff.toString();
                /*判断火车票状态*/
                var data = vm_list.infos;
                if (null != data.trainOrdreDTOList) {
                    var trainStatus = false;
                    for (var i = 0; i < data.trainOrdreDTOList.length; i++) {
                        this.orderNos.push(data.trainOrdreDTOList[i].trainOrderDTO.orderNo);
                        var status = data.trainOrdreDTOList[i].trainOrderDTO.orderStatus;
                        if (status == 'N') {
                            toastr.error(data.message, "火车票状态不能为占座中", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                            return;
                        } else {
                            if (status == 'D') {
                                trainStatus = true;
                            }
                        }
                    }
                    var auditAmount = 0;
                    var personPay = 0;
                    if (data.itinerarySubsidiaryDTO != null) {
                        auditAmount = data.itinerarySubsidiaryDTO.auditAmount;
                        personPay = data.itinerarySubsidiaryDTO.personPay;
                    }

                    if (trainStatus) {
                        $("#formModal").modal({
                            show: true,
                            remote: __ctx + "/itineraryproduct/tocommitaudit?orderNos=" + this.orderNos.toString() + "&itineraryNo=" + itineraryNo + "&auditAmount=" + auditAmount + "&personPay=" + personPay + "&travelOnOffCfgDTOs=" + travelOnOffCfgDTOs,
                            backdrop: 'static'
                        });
                    }
                }
                if (data.itineraryOrderDOList != null) {
                    for (var i = 0; i < data.itineraryOrderDOList.length; i++) {
                        this.orderNos.push(data.itineraryOrderDOList[i].flightOrderItemDTO.orderNo);
                        var flightStatus = data.itineraryOrderDOList[i].flightOrderItemDTO.flightOrderStatus;
                        var auditAmount = 0;
                        var personPay = 0;
                        if (data.itinerarySubsidiaryDTO != null) {
                            auditAmount = data.itinerarySubsidiaryDTO.auditAmount;
                            personPay = data.itinerarySubsidiaryDTO.personPay;
                        }
                        if (flightStatus == '02') {
                            $("#formModal").modal({
                                show: true,
                                remote: __ctx + "/itineraryproduct/tocommitaudit?orderNos=" + this.orderNos.toString() + "&itineraryNo=" + itineraryNo+ "&auditAmount=" + auditAmount + "&personPay=" + personPay + "&travelOnOffCfgDTOs=" + travelOnOffCfgDTOs,
                                backdrop: 'static'
                            });
                        }
                    }
                }
                if (data.hotelOrderInfoDTOList != null) {
                    for (var i = 0; i < data.hotelOrderInfoDTOList.length; i++) {
                        this.orderNos.push(data.hotelOrderInfoDTOList[i].hotelOrderDTO.orderNo);
                        var hotelStatus = data.hotelOrderInfoDTOList[i].hotelOrderDTO.orderStatus;
                        var auditAmount = 0;
                        var personPay = 0;
                        if (data.itinerarySubsidiaryDTO != null) {
                            auditAmount = data.itinerarySubsidiaryDTO.auditAmount;
                            personPay = data.itinerarySubsidiaryDTO.personPay;
                        }
                        if (hotelStatus == '0') {
                            $("#formModal").modal({
                                show: true,
                                remote: __ctx + "/itineraryproduct/tocommitaudit?orderNos=" + this.orderNos.toString() + "&itineraryNo=" + itineraryNo+ "&auditAmount=" + auditAmount + "&personPay=" + personPay + "&travelOnOffCfgDTOs=" + travelOnOffCfgDTOs,
                                backdrop: 'static'
                            });
                        }
                    }
                }

                if (data.manualitemOrderInfoDTOList != null) {
                    for (var i = 0; i < data.manualitemOrderInfoDTOList.length; i++) {
                        this.orderNos.push(data.manualitemOrderInfoDTOList[i].manualItemOrderDTO.orderNo);
                        var manualitemStatus = data.manualitemOrderInfoDTOList[i].manualItemOrderDTO.orderStatus;
                        if (manualitemStatus == '0') {
                            $("#formModal").modal({
                                show: true,
                                remote: __ctx + "/itineraryproduct/toManualitemCommitAuditPage?orderNos=" + this.orderNos.toString() + "&itineraryNo=" + itineraryNo + "&isNotManualitem=" + isNotManualitem + "&travelOnOffCfgDTOs=" + travelOnOffCfgDTOs,
                                backdrop: 'static'
                            });
                            
                            return;
                        }
                    }
                    
                    toastr.error(data.message, "行程不满足审批条件！", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                }                
            },
            cancelAudit: function () {
                this.orderNos = [];
                for (var i = 0; i < vm_list.checked.length; i++) {
                    var index = vm_list.checked[i];
                    var info = vm_list.infos[index];
                    this.orderNos.push(info.orderNo);
                }
                $("#formModal").modal({
                    show: true,
                    remote: __ctx + "/itineraryproduct/toordercancellation?orderNo=" + this.orderNos,
                    backdrop: 'static'
                });
            },
            continueBooking: function () {
                var data = vm_list.infos;
                if (null != data.trainOrdreDTOList) {
                    for (var i = 0; i < data.trainOrdreDTOList.length; i++) {
                        var status = data.trainOrdreDTOList[i].trainOrderDTO.orderStatus;
                        if (!(status == 'N' || status == 'C' || status == 'D' || status == 'O')) {
                            toastr.error(data.message, "当前行程不可添加产品", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                            return;
                        }
                    }

                }
                if (data.itineraryOrderDOList != null) {
                    for (var i = 0; i < data.itineraryOrderDOList.length; i++) {
                        var flightStatus = data.itineraryOrderDOList[i].flightOrderItemDTO.flightOrderStatus;
                        if (!(flightStatus == '02' || flightStatus == '01')) {
                            toastr.error(data.message, "当前行程不可添加产品", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                            return;
                        }
                    }
                }
                if (data.hotelOrderInfoDTOList != null) {
                    for (var i = 0; i < data.hotelOrderInfoDTOList.length; i++) {
                        var hotelStatus = data.hotelOrderInfoDTOList[i].hotelOrderDTO.orderStatus;
                        if (!(hotelStatus == '0' || hotelStatus == '1')) {
                            toastr.error(data.message, "当前行程不可添加产品", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                            return;
                        }
                    }
                }
                
                if (null != data.manualitemOrderInfoDTOList) {
                    for (var i = 0; i < data.manualitemOrderInfoDTOList.length; i++) {
                        var status = data.manualitemOrderInfoDTOList[i].manualItemOrderDTO.orderStatus;
                        if (status != '0' && status != '10') {
                            toastr.error(data.message, "当前行程不可添加产品", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                            return;
                        }
                    }

                    window.location.href =  __ctx + "/manualOrder/manualitemBook?itineraryNo=" + itineraryNo;
                    return;
                }
                /*是否可继续预订校验*/
                $.ajax({
                    url: __ctx + "/itineraryproduct/isAbleToContinueBooking?itineraryNo=" + itineraryNo,
                    type: "GET",
                    success: function (data) {
                        if(data != null && data.result){
                            // 服务调用成功
                            if(data.obj){
                                // 可继续添加，展示产品预订按钮列表
                                $(".box-icon").toggleClass('show');
                            }else{
                                toastr.error("该行程已经提交不可继续预订", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            }
                        }else{
                            // 服务调用失败
                            toastr.error("继续预订校验接口调用失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }
                    },
                    error: function () {
                        toastr.error("继续预订校验接口调用失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    }
                });
            },
            queryData: function (event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }
                else {
                    this.params.page = 1;
                    this.params.size = 20;
                }
                this.loadGridData(this.params);
            },
            reset: function () {
                this.params = {};
            },
            loadGridData: function (pars) {
                $.ajax({
                    url: __ctx + "/itineraryproduct/produclist?itineraryNo=" + itineraryNo,
                    data: pars,
                    success: function (data) {
                        vm_list.infos = data.obj;

                        if(vm_list.infos != null && vm_list.infos.carOrderDTOList != null && vm_list.infos.carOrderDTOList.length > 0) {
                            //如果是用车行程，预订时间取叫车时间
                            vm_list.infos.itineraryDetailsResponseDTO.gmtCreate = vm_list.infos.carOrderDTOList[0].departureTime;//叫车时间
                        }

                    }
                });
            },
            cancelOrder: function () {
                if (vm_list.cancelReason == '') {
                    toastr.error("订单取消原因不能为空！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                $('#confirmCancel').modal('hide');
                if ("DA1" == vm_list.productCode) {
                    $.ajax({
                        url: __ctx + "/flightOrder/cancelFlightOrder",
                        type: "POST",
                        data: {
                            orderNo: vm_list.orderNo,
                            cancelReasonCode: vm_list.cancelReasonCode,
                            cancelReason: vm_list.cancelReason
                        },
                        datatype: "json",
                        error: function (data) {
                            toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success: function (data) {
                        	if(data.result){
                        		toastr.success(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                                location.reload();
                        	}else{
                        		toastr.error(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                        	}
                            
                        }
                    });
                }
                if ("DT1" == vm_list.productCode) {
                    $.ajax({
                        url: __ctx + "/trainOrderDetail/cancelOrder",
                        type: "POST",
                        data: {
                            orderNo: vm_list.orderNo,
                            cancelReasonCode: vm_list.cancelReasonCode,
                            cancelReason: vm_list.cancelReason
                        },
                        datatype: "json",
                        error: function (data) {
                            toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success: function (data) {
                            toastr.success(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                            location.reload();
                        }
                    });
                }
                if ("DH1" == vm_list.productCode) {
                    var hotelOrdersCancelRequestDTO = {
                        token: '',
                        orderStatusRequestDTOs: [{
                            orderNo: vm_list.orderNo,
                            cancelReasonId: vm_list.cancelReasonCode,
                            cancelReason: vm_list.cancelReason,
                            fromPlatment: 2//固定传值
                        }
                        ]
                    };

                    $.ajax({
                        //TODO  酒店
                        url: __ctx + "/hotelorder/cancels",
                        type: "POST",
                        data: JSON.stringify(hotelOrdersCancelRequestDTO),
                        contentType: "application/json",
                        datatype: "json",
                        error: function (data) {
                            toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success: function (data) {
                            if (data.result == true) {

                                var responseDTO = data.obj.orderStatusResponseVOs;
                                for (var i = 0; i < responseDTO.length; i++) {
                                    var e = responseDTO[i];
                                    if (e.orderNo == vm_list.orderNo) {
                                        toastr.success(data.message, "", {
                                            timeOut: 1000,
                                            positionClass: "toast-top-center"
                                        });
                                        location.reload();
                                        return;
                                    }

                                }

                                toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});

                            } else {
                                toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            }
                        }
                    });
                }
                
                if (vm_list.productCode.indexOf("DV") > -1) {
                    $.ajax({
                        url: __ctx + "/manualOrder/cancelOrder",
                        type: "POST",                        
                        data: JSON.stringify({
                            orderNo: vm_list.orderNo,
                            cancelReasonCode: vm_list.cancelReasonCode,
                            cancelReason: vm_list.cancelReason
                        }),                    
                        datatype: "json",
                        contentType: "application/json",                        
                        error: function (data) {
                            toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success: function (data) {
                        	if(data.success){
                                toastr.success("取消成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
                                location.reload();                        		
                        	} else {
                                toastr.error(data.errorMessage, "", {timeOut: 1000, positionClass: "toast-top-center"});                        		
                        	}
                        }
                    });
                }
            },
            bindReason: function (cancelReasonCode) {
                if (cancelReasonCode == '1') {
                    this.cancelReason = "行程取消";
                } else if (cancelReasonCode == '2') {
                    this.cancelReason = "重新预订";
                }
                else if (cancelReasonCode == '3') {
                    this.cancelReason = "价格有问题";
                }
                else if (cancelReasonCode == '4') {
                    this.cancelReason = "审批问题";
                }
                else if (cancelReasonCode == '5') {
                    this.cancelReason = "支付问题";
                }
                else if (cancelReasonCode == '6') {
                    this.cancelReason = "测试订单";
                }
                else if (cancelReasonCode == '7') {
                    this.cancelReason = "客人自主取消";
                }
            },//打包支付
            togetherPay: function () {
                $.ajax({
                    url: __ctx + "/payment/togetherPay/check",
                    data: {
                        itineraryNo: window.itineraryNo
                    },
                    success: function (data) {
                        if (data.result && data.obj.isPay) {
                            window.location.href = __ctx + "/payment/togetherPay/index?itineraryNo=" + window.itineraryNo;
                        } else {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }
                    }
                });
            },//增值单打包支付
            manualitemTogetherPay: function () {
                $.ajax({
                    url: __ctx + "/payment/togetherPay/check",
                    data: {
                        itineraryNo: window.itineraryNo
                    },
                    success: function (data) {
                        if (data.result && data.obj.isPay) {
                            window.location.href = __ctx + "/manualPayment/togetherPay/index?itineraryNo=" + window.itineraryNo;
                        } else {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }
                    }
                });
            },
            //生成行程单
            createItineraryOrder: function () {
                var bookPersonName = vm_list.infos.itineraryDetailsResponseDTO.bookPersonName;
                var gmtCreate = moment(vm_list.infos.itineraryDetailsResponseDTO.gmtCreate).format("YYYY-MM-DD");
                var bookCompanyId = vm_list.infos.itineraryDetailsResponseDTO.bookCompanyId;
                window.location.href = __ctx + "/queryitinerarybypeople/initquerypage?bookPersonName=" + bookPersonName + "&companyId=" + bookCompanyId + "&gmtCreate=" + gmtCreate;
            },
            approvalRecord: function () {
                $(".stopover-station").addClass("dn");
                var e = window.event;
                if (e.stopPropagation) {
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true;
                }
                if (!vm_list.showApprovalRecord) {
                    var auditId = vm_list.infos.approvalResultDTOList[0].auditId;
                    $.ajax({
                        async: false,
                        url: __ctx + "/itineraryproduct/getAprovalRecord",
                        type: "get",
                        data: {
                            "auditId": auditId
                        },
                        success: function (data) {
                            vm_list.approvalFlows = data.obj[0].approvalFlowDTOList;
                            vm_list.approvalRecords = data.obj[0].approvalRecordDTOList;
                        }
                    });
                    $(".stopover-station").removeClass("dn");
                    vm_list.showApprovalRecord = true
                } else if (vm_list.showApprovalRecord) {
                    $(".stopover-station").addClass("dn");
                    vm_list.showApprovalRecord = false
                }
            },
            itinerarySubsidiary: function () {
                $(".stopover-station-itinerary").addClass("dn");
                var e = window.event;
                if (e.stopPropagation) {
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true;
                }
                if (!vm_list.showitinerarySubsidiary) {
                    $.ajax({
                        async: false,
                        url: __ctx + "/itineraryproduct/produclist",
                        type: "get",
                        data: {
                            "itineraryNo": window.itineraryNo
                        },
                        success: function (data) {
                            vm_list.itinerarySubsidiaryData = data.obj.itinerarySubsidiaryDTO;
                            if(vm_list.itinerarySubsidiaryData.configList!=null && vm_list.itinerarySubsidiaryData.configList.length>0){
                            	//差旅目的
                            	var travelPurposeInfo=vm_list.itinerarySubsidiaryData.configList[0];
                            	if(0==travelPurposeInfo.type || '0'==travelPurposeInfo.type){
                            		//差旅目的处理
                                	vm_list.travelPurposeData.result=true;
                                	vm_list.travelPurposeData.chineseTitle=travelPurposeInfo.chineseTitle;
                                	vm_list.travelPurposeData.value=travelPurposeInfo.value;
                                	if(travelPurposeInfo.json !=null && travelPurposeInfo.json!=''){
                                		vm_list.travelPurposeData.subsidiaryResult=true;
                                		var purposeJson=JSON.parse(travelPurposeInfo.json);
                                		vm_list.travelPurposeData.additionalFillinBox=purposeJson.additionalFillinBox;
                                		vm_list.travelPurposeData.allowedUploadAttachmentsRequired=purposeJson.allowedUploadAttachmentsRequired;
                                		vm_list.travelPurposeData.additionalFillinBoxRequired=purposeJson.additionalFillinBoxRequired;
                                		vm_list.travelPurposeData.allowedUploadAttachments=purposeJson.allowedUploadAttachments;
                                		vm_list.travelPurposeData.travelPurposeRemark=purposeJson.travelPurposeRemark;
                                		vm_list.travelPurposeData.travelPurposeUrl= eval ("(" + purposeJson.travelPurposeUrl+ ")");
                                	}
                            	}
                            }
                        }
                    });
                    $(".stopover-station-itinerary").removeClass("dn");
                    vm_list.showitinerarySubsidiary = true
                } else if (vm_list.showitinerarySubsidiary) {
                    $(".stopover-station-itinerary").addClass("dn");
                    vm_list.showitinerarySubsidiary = false
                }
            },
            itinerarySave: function () {
                vm_list.itineraryUpdateParm.oaNo = $("#oaNo").val() || '';
                vm_list.itineraryUpdateParm.remark = $("#oa-note").val() || '';
                vm_list.itineraryUpdateParm.itineraryNo = window.itineraryNo;
                vm_list.itineraryUpdateParm.travelAims = "";
                if (vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[2].onOff == 1 && $("#oaNo").val() == '') {
                    toastr.error("OA单号不能为空", "", toastrConfig);
                    return;
                }

                if (vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[3].onOff == 1 && $("#oa-note").val() == '') {
                    toastr.error("OA备注不能为空", "", toastrConfig);
                    return;
                }

                if ($("#oaNo").val() != undefined && $("#oaNo").val().length > 50) {
                    toastr.error("OA单号最多输入50个字符", "", toastrConfig);
                    return;
                }

                var reg = /^[0-9a-zA-Z]+$/;
                if ($("#oaNo").val() != undefined && $("#oaNo").val().length > 0 && !reg.test($("#oaNo").val())) {
                    toastr.error("OA单号只能输入数字或字母", "", toastrConfig);
                    return;
                }

                if ($("#oa-note").val() != undefined && $("#oa-note").val().length > 200) {
                    toastr.error("OA备注最多输入200个字符", "", toastrConfig);
                    return;
                }
                $.ajax({
                    contentType: "application/json",
                    type: "POST",
                    data: JSON.stringify(vm_list.itineraryUpdateParm),
                    datatype: "json",
                    url: __ctx + "/itineraryproduct/itinerarySave",
                    success: function (data) {
                        if (data.result) {
                            toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            $(".stopover-station-itinerary").addClass("dn");
                            vm_list.showitinerarySubsidiary = false;
                        } else {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        }
                    }
                });
            },
            /*占座中或已申请出票返回true，否则返回false*/
            isShowRefreshButton: function(orderStatus){
                if(orderStatus == "N"){//占座中
                    return true;
                }
                if(orderStatus == "E"){//已申请出票
                    return true;
                }
                return false;
            }
        }
    });
    $('#RevocationOfApproval').on('shown.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var orderNo = button.data('orderno') // Extract info from data-* attributes
        var auditid = button.data('auditid')
        vm_list.orderNo = orderNo;
        vm_list.auditId = auditid;
    })

    $('#emergentApproval').on('shown.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var orderNo = button.data('orderno') // Extract info from data-* attributes
        var auditid = button.data('auditid')
        vm_list.orderNo = orderNo;
        vm_list.auditId = auditid;
    })

})