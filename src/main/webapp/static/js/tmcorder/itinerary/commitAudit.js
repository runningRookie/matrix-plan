var vm_list2;
Vue.config.devtools = true;
Vue.filter('approvalModelFilter', {
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

Vue.filter('split', {
    read: function (value, length) {
        if (value != undefined && value.length > length) {
            return value.substring(0, length) + "...";
        }
        return value;
    }
});

vm_list2 = new Vue({
    el: '#commitAudit',
    data: {
        infos: [],
        labelNameResp: {},
        itineraryAttrCfgItemVOList: [],
        projectData: [],
        chooseTravel: {},
        bindDate: '',
        params: {},
        audit: [],
        images: [],
        imgNames: [],
        fileValue: [],
        imgUrls: '',
        offlineParams: {},
        authorizeParams: {},
        approvalModel: [],
        travelOnOffCfgDTOs: '',
        totalCost: {},
        auditParams:{
            fileValue: [],
            images: [],
            imageUrls: [],
            imgNames: [],
            remark: ''
        }
    },
    ready: function () {
        setTimeout(function(){
            //差旅目的
	        $.ajax({
	            url: __ctx + "/commitaudit/traveldestination/",
	            data: {
	                itineraryNo: $("#itineraryNo").val()
	            },
	            success: function (data) {
	                vm_list2.infos = data.obj.travelPurposeDTOList;
	                vm_list2.labelNameResp = data.obj.labelNameRespDTO;
	                vm_list2.itineraryAttrCfgItemVOList = data.obj.itineraryAttrCfgItemVOList;
                    _.forEach(vm_list2.itineraryAttrCfgItemVOList, function (itineraryAttrCfgItem) {
                        if (itineraryAttrCfgItem.type == 2) {
                            vm_list2.projectData = itineraryAttrCfgItem.selectlist;
                        }
                        // itineraryAttrCfgItem.enabledEdit = true;
                    });
                    if(vm_list2.infos!=null && vm_list2.infos.length!=0){
                        if (!!vm_list2.infos[0]) {
                            vm_list2.chooseTravel = vm_list2.infos[0];
                        }
                    }
                }
	        });
	        //审批流
	        $.ajax({
	            url: __ctx + "/commitaudit/freetrialorder?itineraryNo=" + $("#itineraryNo").val(),
	            data: null,
	            success: function (data) {
	                if (data.result) {
	                    vm_list2.audit = data.obj;

	                    /*审批流空校验*/
                        if(vm_list2.audit == null || vm_list2.audit.length == 0){/*审批流为空，显示错误提示信息*/
                            /*按钮置灰*/
                            $("#organizeApproval-submit").attr("disabled","true");
                            /*显示错误提示信息*/
                            $("#approvalStreamErrorMsg").show();
                        }

                        for(var i = 0; i < vm_list2.audit.length; i++){
                            if(vm_list2.audit[i].approvalStream == null || vm_list2.audit[i].approvalStream == ""){/*存在审批流为空的订单*/
                                /*按钮置灰*/
                                $("#organizeApproval-submit").attr("disabled","true");
                                /*显示错误提示信息*/
                                $("#approvalStreamErrorMsg").show();
                                break;
                            }
                        }
	                }
	            }
	        });
	
            var bookPersonId = vm_list.infos.itineraryDetailsResponseDTO.bookPersonEmployeeId;
            $.ajax({
            	url: __ctx + "/commitaudit/getApprovalModel?bookPersonId=" + bookPersonId,
                data: null,
                success: function (data) {
                    if (data.result) {
                        vm_list2.approvalModel = data.obj;
                    }
                }
            });        	
        });	        
    },
    methods: {
        validateItineraryAttrCfgItemVOList:function () {
            var error;
            if (vm_list2.infos!=null && vm_list2.infos.length!=0){
                vm_list2.auditParams.remark = _.trim(vm_list2.auditParams.remark);
                if (vm_list2.chooseTravel.additionalFillinBoxRequired && vm_list2.auditParams.remark.length == 0) {
                    error = vm_list2.labelNameResp.labelChName + "填写框不能为空";
                    return error;
                }
                if (vm_list2.chooseTravel.allowedUploadAttachmentsRequired && vm_list2.auditParams.images.length == 0) {
                    error = vm_list2.labelNameResp.labelChName + "附件不能为空";
                    return error;
                }
                if (vm_list2.auditParams.images.length > 3) {
                    error = vm_list2.labelNameResp.labelChName + "附件不能超过3张";
                    return error;
                }
                if (vm_list2.auditParams.images.length > 0) {
                    var size = 0;
                    _.forEach(vm_list2.auditParams.fileValue, function (image) {
                        size += image.size;
                    });
                    if (size > 10 * 1024 * 1024) {
                        error = vm_list2.labelNameResp.labelChName + "附件总大小不能超过10M";
                        return error;
                    }
                }
            }
            if (!error) {
                for (var i = 0; i < vm_list2.itineraryAttrCfgItemVOList.length; i++) {
                    var itineraryAttrCfgItemVO = vm_list2.itineraryAttrCfgItemVOList[i];
                    if (itineraryAttrCfgItemVO.must) {
                        if (itineraryAttrCfgItemVO.showCfg == 1 || itineraryAttrCfgItemVO.showCfg == 2) {
                            if (itineraryAttrCfgItemVO.selectedValue == null || itineraryAttrCfgItemVO.selectedValue == "") {
                                error = itineraryAttrCfgItemVO.chineseTitle + "不能为空";
                                break;
                            }
                        }
                        if (itineraryAttrCfgItemVO.showCfg == 3) {
                            if (itineraryAttrCfgItemVO.choose == null || itineraryAttrCfgItemVO.choose == undefined) {
                                error = itineraryAttrCfgItemVO.chineseTitle + "不能为空";
                                break;
                            }
                            if (itineraryAttrCfgItemVO.choose == "") {
                                error = itineraryAttrCfgItemVO.chineseTitle + '不能选择“请选择”项';
                                break;
                            }
                        }
                    } else {
                        if (itineraryAttrCfgItemVO.showCfg == 3) {
                            if (itineraryAttrCfgItemVO.choose == "") {
                                error = itineraryAttrCfgItemVO.chineseTitle + '不能选择“请选择”项';
                                break;
                            }
                        }
                    }
                }
            }
            return error;
        },
        goSms: function () {
            vm_list2.travelOnOffCfgDTOs = vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[0].onOff.toString() + vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[1].onOff.toString() +
                vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[2].onOff.toString() + vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[3].onOff.toString();

            var error = vm_list2.validateItineraryAttrCfgItemVOList();
            if (error) {
                toastr.error(error, "", toastrConfig);
                return;
            }

            var createApprovalApplicantParams = {};
            createApprovalApplicantParams.orderNos = $("#orderNos").val();
            createApprovalApplicantParams.travelAims = vm_list2.params.chineseName;
            createApprovalApplicantParams.travelPurposeCode = vm_list2.params.travelPurposeCode;
            createApprovalApplicantParams.itineraryNo = itineraryNo;
            createApprovalApplicantParams.itineraryProductListDTO = vm_list.infos;
            createApprovalApplicantParams.configVOList = [];
            var formData = new FormData();
            //差旅目地
            if (vm_list2.infos && vm_list2.infos.length != 0) {
                var itineraryConfigRequestVO = {};
                itineraryConfigRequestVO.type = 0;
                itineraryConfigRequestVO.code = vm_list2.chooseTravel.travelPurposeCode;
                itineraryConfigRequestVO.value = vm_list2.chooseTravel.chineseName;
                if(vm_list2.chooseTravel.additionalFillinBox && vm_list2.chooseTravel.additionalFillinBox != 0) {
                    if (vm_list2.auditParams.remark.length != 0) {
                        itineraryConfigRequestVO.remark = vm_list2.auditParams.remark;
                    }
                }
                if(vm_list2.chooseTravel.allowedUploadAttachments && vm_list2.chooseTravel.allowedUploadAttachments != 0) {
                    _.forEach(vm_list2.auditParams.fileValue, function (image) {
                        formData.append('files', image);
                    });
                }
                createApprovalApplicantParams.configVOList.push(itineraryConfigRequestVO);
            }
            //行程配置
            _.forEach(vm_list2.itineraryAttrCfgItemVOList, function (itineraryAttrCfgItemVO) {
                var itineraryConfigRequestVO = {};
                itineraryConfigRequestVO.id = itineraryAttrCfgItemVO.id;
                itineraryConfigRequestVO.type = itineraryAttrCfgItemVO.type;
                if (itineraryAttrCfgItemVO.showCfg == 1 || itineraryAttrCfgItemVO.showCfg == 2) {
                    itineraryConfigRequestVO.code = itineraryAttrCfgItemVO.selectedCode;
                    itineraryConfigRequestVO.value = itineraryAttrCfgItemVO.selectedValue;
                }
                if (itineraryAttrCfgItemVO.showCfg == 3) {
                     var  choose = JSON.parse(itineraryAttrCfgItemVO.choose);
                     if(choose != null) {
                         itineraryConfigRequestVO.code = choose.code;
                         // itineraryConfigRequestVO.value = choose.chineseDesc;
                         itineraryConfigRequestVO.value = choose.text;
                     } else {
                         itineraryConfigRequestVO.code = "";
                         itineraryConfigRequestVO.value = "";
                     }
                }

                createApprovalApplicantParams.configVOList.push(itineraryConfigRequestVO);
            });

            if (vm_list2.auditParams.images.length > 0) {
                $.ajax({
                    type: "post",
                    url: __ctx + "/commitaudit/upload",
                    contentType: false,    // 这个一定要写
                    processData: false,    // 这个也一定要写，不然会报错
                    data: formData,
                    dataType: "json",
                    success: function (result) {
                        if (result.result) {
                            if (result.obj != null) {
                                createApprovalApplicantParams.configVOList[0].pictureUrls = [];
                                _.forEach(result.obj,function (url) {
                                    vm_list2.auditParams.imageUrls.push(url);
                                    createApprovalApplicantParams.configVOList[0].pictureUrls.push(url.fileUrl);
                                });
                            }
                        } else {
                            toastr.error("上传失败，请稍后再试", "", toastrConfig);
                            return;
                        }
                        $.ajax({
                            url: __ctx + "/commitaudit/commit",
                            contentType: "application/json",
                            type: "POST",
                            data: JSON.stringify(createApprovalApplicantParams),
                            datatype: "json",
                            success: function (data) {
                                if (!data.result) {
                                    toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                } else {
                                    toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                    setTimeout(function () {
                                        window.location.href = __ctx + '/serachitinerary/index';
                                    }, 500);
                                }
                            }
                        });
                    }
                });
            } else {
                $.ajax({
                    url: __ctx + "/commitaudit/commit",
                    contentType: "application/json",
                    type: "POST",
                    data: JSON.stringify(createApprovalApplicantParams),
                    datatype: "json",
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                            setTimeout(function () {
                                window.location.href = __ctx + '/serachitinerary/index';
                            }, 500);
                        }
                    }
                });
            }
        },
        getConfigVOList: function (data) {
            // var formData = new FormData();
            data.configVOList = [];
            //差旅目地
            if (vm_list2.infos && vm_list2.infos.length != 0) {
                var itineraryConfigRequestVO = {};
                itineraryConfigRequestVO.type = 0;
                itineraryConfigRequestVO.code = vm_list2.chooseTravel.travelPurposeCode;
                itineraryConfigRequestVO.value = vm_list2.chooseTravel.chineseName;
                if(vm_list2.chooseTravel.additionalFillinBox && vm_list2.chooseTravel.additionalFillinBox != 0) {
                    if (vm_list2.auditParams.remark.length != 0) {
                        itineraryConfigRequestVO.remark = vm_list2.auditParams.remark;
                    }
                }
                data.configVOList.push(itineraryConfigRequestVO);
            }
            //行程配置
            _.forEach(vm_list2.itineraryAttrCfgItemVOList, function (itineraryAttrCfgItemVO) {
                var itineraryConfigRequestVO = {};
                itineraryConfigRequestVO.id = itineraryAttrCfgItemVO.id;
                itineraryConfigRequestVO.type = itineraryAttrCfgItemVO.type;
                if (itineraryAttrCfgItemVO.showCfg == 1 || itineraryAttrCfgItemVO.showCfg == 2) {
                    itineraryConfigRequestVO.code = itineraryAttrCfgItemVO.selectedCode;
                    itineraryConfigRequestVO.value = itineraryAttrCfgItemVO.selectedValue;
                }
                if (itineraryAttrCfgItemVO.showCfg == 3) {
                    var  choose = JSON.parse(itineraryAttrCfgItemVO.choose);
                    if(choose != null) {
                        itineraryConfigRequestVO.code = choose.code;
                        // itineraryConfigRequestVO.value = choose.chineseDesc;
                        itineraryConfigRequestVO.value = choose.text;
                    } else {
                        itineraryConfigRequestVO.code = "";
                        itineraryConfigRequestVO.value = "";
                    }
                }
                data.configVOList.push(itineraryConfigRequestVO);
            });
            return data;
        },
        getFiles:function () {
            var formData = new FormData();
            if(vm_list2.chooseTravel.allowedUploadAttachments && vm_list2.chooseTravel.allowedUploadAttachments != 0) {
                _.forEach(vm_list2.auditParams.fileValue, function (image) {
                    formData.append('files', image);
                });
            }
            return formData;
        },
        goAudit: function () {
            vm_list2.travelOnOffCfgDTOs = vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[0].onOff.toString() + vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[1].onOff.toString() +
                vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[2].onOff.toString() + vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[3].onOff.toString();
            var error = vm_list2.validateItineraryAttrCfgItemVOList();
            if (error) {
                toastr.error(error, "", toastrConfig);
                return;
            }

            if ($("#orderNo").val()=='') {
                toastr.error("请输入沿用订单号", "", toastrConfig);
                return;
            }

            // if ($("#oaNoAudit").val() != undefined && $("#oaNoAudit").val().length > 50) {
            //     toastr.error("OA单号最多输入50个字符", "", toastrConfig);
            //     return;
            // }
            //
            // var reg = /^[0-9a-zA-Z]+$/;
            // if ($("#oaNoAudit").val() != undefined && $("#oaNoAudit").val().length > 0 && !reg.test($("#oaNoAudit").val())) {
            //     toastr.error("OA单号只能输入数字或字母", "", toastrConfig);
            //     return;
            // }
            //
            // if ($("#oa-noteAudit").val() != undefined && $("#oa-noteAudit").val().length > 200) {
            //     toastr.error("OA备注最多输入200个字符", "", toastrConfig);
            //     return;
            // }
            //
            // if (vm_list2.travelOnOffCfgDTOs.substring(2,3) == '1' && $("#oaNoAudit").val() == '') {
            //     toastr.error("OA单号不能为空", "", toastrConfig);
            //     return;
            // }
            //
            // if (vm_list2.travelOnOffCfgDTOs.substring(3,4) == '1' && $("#oa-noteAudit").val() == '') {
            //     toastr.error("OA备注不能为空", "", toastrConfig);
            //     return;
            // }

            vm_list2.authorizeParams.orderNo = $("#orderNo").val();
            vm_list2.authorizeParams.itineraryProductListDTO = vm_list.infos;
            vm_list2.authorizeParams.orderNos = $("#orderNos").val();
            vm_list2.authorizeParams.travelAims = vm_list2.params.chineseName;
            vm_list2.authorizeParams.travelPurposeCode = vm_list2.params.travelPurposeCode;
            vm_list2.authorizeParams.itineraryNo = itineraryNo;
            // vm_list2.authorizeParams.oaNo = $("#oaNoAudit").val();
            // vm_list2.authorizeParams.oaRemark = $("#oa-noteAudit").val();

//            if (vm_list2.authorizeParams.travelAims == '' || typeof (vm_list2.authorizeParams.travelAims) == "undefined") {
//                toastr.error("差旅目的不能为空", "", toastrConfig);
//                return;
//            }
            vm_list2.authorizeParams = vm_list2.getConfigVOList(vm_list2.authorizeParams);
            if (vm_list2.auditParams.images.length > 0) {
                var formData = vm_list2.getFiles();
                $.ajax({
                    type: "post",
                    url: __ctx + "/commitaudit/upload",
                    contentType: false,    // 这个一定要写
                    processData: false,    // 这个也一定要写，不然会报错
                    data: formData,
                    dataType: "json",
                    success: function (result) {
                        if (result.result) {
                            if (result.obj != null) {
                                vm_list2.authorizeParams.configVOList[0].pictureUrls = [];
                                _.forEach(result.obj,function (url) {
                                    vm_list2.auditParams.imageUrls.push(url);
                                    vm_list2.authorizeParams.configVOList[0].pictureUrls.push(url.fileUrl);
                                });
                            }
                        } else {
                            toastr.error("上传失败，请稍后再试", "", toastrConfig);
                            return;
                        }
                        $.ajax({
                            url: __ctx + "/commitaudit/audit",
                            contentType: "application/json",
                            type: "POST",
                            data: JSON.stringify(vm_list2.authorizeParams),
                            datatype: "json",
                            success: function (data) {
                                if (!data.result) {
                                    toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                } else {
                                    toastr.info("授权审批成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
                                    setTimeout(function () {
                                        window.location.href = __ctx + '/serachitinerary/index';
                                    }, 500);
                                }
                            }
                        });
                    }
                });
            } else {
                $.ajax({
                    url: __ctx + "/commitaudit/audit",
                    contentType: "application/json",
                    type: "POST",
                    data: JSON.stringify(vm_list2.authorizeParams),
                    datatype: "json",
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                        } else {
                            toastr.info("授权审批成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
                            setTimeout(function () {
                                window.location.href = __ctx + '/serachitinerary/index';
                            }, 500);
                        }
                    }
                });
            }
        },
        goOffline: function () {
            vm_list2.travelOnOffCfgDTOs = vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[0].onOff.toString() + vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[1].onOff.toString() +
                vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[2].onOff.toString() + vm_list.infos.employeeTravelOnOffDTO.travelOnOffCfgDTOs[3].onOff.toString();
            var error = vm_list2.validateItineraryAttrCfgItemVOList();
            if (error) {
                toastr.error(error, "", toastrConfig);
                return;
            }

            if ($("#approval-note").val().length > 100) {
                toastr.error("审批备注最多输入100个字符", "", toastrConfig);
                return;
            }

            // if ($("#oaNoAudit").val() != undefined && $("#oaNoAudit").val().length > 50) {
            //     toastr.error("OA单号最多输入50个字符", "", toastrConfig);
            //     return;
            // }
            //
            // var reg = /^[0-9a-zA-Z]+$/;
            // if ($("#oaNoAudit").val() != undefined && $("#oaNoAudit").val().length > 0 && !reg.test($("#oaNoAudit").val())) {
            //     toastr.error("OA单号只能输入数字或字母", "", toastrConfig);
            //     return;
            // }

            // if ($("#oa-noteAudit").val() != undefined && $("#oa-noteAudit").val().length > 200) {
            //     toastr.error("OA备注最多输入200个字符", "", toastrConfig);
            //     return;
            // }
            //
            // if (vm_list2.travelOnOffCfgDTOs.substring(2,3) == '1' && $("#oaNoAudit").val() == '') {
            //     toastr.error("OA单号不能为空", "", toastrConfig);
            //     return;
            // }
            //
            // if (vm_list2.travelOnOffCfgDTOs.substring(3,4) == '1' && $("#oa-noteAudit").val() == '') {
            //     toastr.error("OA备注不能为空", "", toastrConfig);
            //     return;
            // }

            var formData = new FormData();
            for (var i = 0; i < vm_list2.fileValue.length; i++) {
                formData.append('files', vm_list2.fileValue[i]);
            }

            $.ajax({
                type: "post",
                url: __ctx + "/commitaudit/upload",
                contentType: false,    // 这个一定要写
                processData: false,    // 这个也一定要写，不然会报错
                data: formData,
                dataType: "json",
                success: function (result) {
                    if (result.result) {
                        if (result.obj != null) {
                            var leng = result.obj.length;
                            if (leng > 1) {
                                for (var i = 0; i < leng; i++) {
                                    var url = result.obj[i].fileUrl;
                                    vm_list2.imgUrls += url + ",";
                                }
                                vm_list2.imgUrls = vm_list2.imgUrls.substr(0, vm_list2.imgUrls.length - 1);
                            } else {
                                vm_list2.imgUrls = result.obj[0].fileUrl;
                            }
                        }
                        // var urls = "";
                        // $(result.obj).each(function (i, e) {
                        //     urls = urls + e.fileUrl + ",";
                        // });
                        // urls = urls.substring(0, urls.length - 1);
                        vm_list2.offlineParams.urls = vm_list2.imgUrls;
                        vm_list2.offlineParams.approvalNote = $("#approval-note").val();
                        vm_list2.offlineParams.itineraryProductListDTO = vm_list.infos;
                        vm_list2.offlineParams.orderNos = $("#orderNos").val();
                        vm_list2.offlineParams.travelAims = vm_list2.params.chineseName;
                        vm_list2.offlineParams.travelPurposeCode = vm_list2.params.travelPurposeCode;
                        vm_list2.offlineParams.itineraryNo = itineraryNo;
                        // vm_list2.offlineParams.oaNo = $("#oaNoAudit").val();
                        // vm_list2.offlineParams.oaRemark = $("#oa-noteAudit").val();
//                        if (vm_list2.offlineParams.travelAims == '' || typeof (vm_list2.offlineParams.travelAims) == "undefined") {
//                            toastr.error("差旅目的不能为空", "", toastrConfig);
//                            return;
//                        }
                        vm_list2.offlineParams = vm_list2.getConfigVOList(vm_list2.offlineParams);
                        if (vm_list2.auditParams.images.length > 0) {
                            var formData2 = vm_list2.getFiles();
                            $.ajax({
                                type: "post",
                                url: __ctx + "/commitaudit/upload",
                                contentType: false,    // 这个一定要写
                                processData: false,    // 这个也一定要写，不然会报错
                                data: formData2,
                                dataType: "json",
                                success: function (result) {
                                    if (result.result) {
                                        if (result.obj != null) {
                                            vm_list2.offlineParams.configVOList[0].pictureUrls = [];
                                            _.forEach(result.obj,function (url) {
                                                vm_list2.auditParams.imageUrls.push(url);
                                                vm_list2.offlineParams.configVOList[0].pictureUrls.push(url.fileUrl);
                                            });
                                        }
                                    } else {
                                        toastr.error("上传失败，请稍后再试", "", toastrConfig);
                                        return;
                                    }
                                    $.ajax({
                                        url: __ctx + "/commitaudit/offlineApproval",
                                        contentType: "application/json",
                                        type: "POST",
                                        data: JSON.stringify(vm_list2.offlineParams),
                                        datatype: "json",
                                        success: function (data) {
                                            if (!data.result) {
                                                toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                            } else {
                                                toastr.info("线下审批成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
                                                setTimeout(function () {
                                                    window.location.href = __ctx + '/serachitinerary/index';
                                                }, 500);
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            $.ajax({
                                url: __ctx + "/commitaudit/offlineApproval",
                                contentType: "application/json",
                                type: "POST",
                                data: JSON.stringify(vm_list2.offlineParams),
                                datatype: "json",
                                success: function (data) {
                                    if (!data.result) {
                                        toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                    } else {
                                        toastr.info("线下审批成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
                                        setTimeout(function () {
                                            window.location.href = __ctx + '/serachitinerary/index';
                                        }, 500);
                                    }
                                }
                            });
                        }
                        // toastr.info("上传成功！", "", toastrConfig);
                    } else {
                        toastr.error("上传失败，请稍后再试", "", toastrConfig);
                        return false;
                    }
                }
            });
        },
        organizeApproval: function () {
            $(".organizeApproval").removeClass("organize");
            $(".auditApproval").addClass("audit");
            $(".offlineApproval").addClass("offline");
        },

        auditApproval: function () {
            $(".auditApproval").removeClass("audit");
            $(".organizeApproval").addClass("organize");
            $(".offlineApproval").addClass("offline");
        },
        offlineApproval: function () {
            $(".offlineApproval").removeClass("offline");
            $(".organizeApproval").addClass("organize");
            $(".auditApproval").addClass("audit");
        },
        addPic(e){
            e.preventDefault();
            $('#file').trigger('click');
            return false;
        },
        onFileChange(e) {
            var flag = true;
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length)return;

            _.forEach(files, function (file) {
                var fileName=file.name;
                var extStart = fileName.lastIndexOf(".") + 1;
                var ext = fileName.substring(extStart, fileName.length).toLowerCase();
                if (ext != "bmp" && ext != "png" && ext != "gif" && ext != "jpeg" && ext != "jpg" ){
                    flag = false;
                    return false;
                }
            });
            if(!flag){
                toastr.error("图片类型必须是.gif,jpeg,jpg,png,bmp中的一种!","", {
                    timeOut: 2000,
                    positionClass: "toast-top-center"
                });
                $('#file').val('');

                return;
            }

            this.createImage(files);
        },
        createImage(files) {
            if (typeof FileReader === undefined) {
                alert('您的浏览器不支持图片上传，请升级您的浏览器');
                return false;
            }
            for (var i = 0; i < files.length; i++) {
                var filesize = files[i].size;
                if (filesize > 10 * 1024 * 1024) {
                    toastr.error("仅允许10M以内文件,文件：" + files[i].name + "，大小超过限制", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return;
                }
            }
            var image = new Image();
            var vm = this;
            var leng = files.length;
            for (var i = 0; i < leng; i++) {
                var file = files[i];
                this.loadImage(file, vm);
                // var name = file.name;
                // vm.imgNames.push(name);
                // var reader = new FileReader();
                // reader.readAsDataURL(files[i]);
                // reader.onload = function (e) {
                // 	if ($.inArray(e.target.result, vm.images) < 0) {
                //         vm_list2.fileValue.push(file);
                // 		vm.images.push(e.target.result);
                //         vm.imgNames.push(name);
                // 	}
                // };
            }
            $('#file').val('');
        },
        loadImage(file, vm) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                if ($.inArray(e.target.result, vm.images) < 0) {
                    vm_list2.fileValue.push(file);
                    vm.images.push(e.target.result);
                    vm.imgNames.push(file.name);
                }
            };
        },
        delImage: function (index) {
            this.images.splice(index, 1);
            this.imgNames.splice(index, 1);
            this.fileValue.splice(index, 1);
        },
        removeImage: function (e) {
            this.images = [];
            this.imgNames = [];
            this.fileValue = [];
        }
    }
});