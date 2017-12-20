var vm_list2;
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

vm_list2 = new Vue({
    el: '#commitAudit',
    data: {
        infos: [],
        params: {},
        audit: [],
        images: [],
        imgNames: [],
        fileValue: [],
        imgUrls: '',
        offlineParams: {},
        authorizeParams: {},
        approvalModel: [],
        totalCost: {}
    },
    ready: function () {
        setTimeout(function(){                	
	        $.ajax({
	            url: __ctx + "/commitaudit/traveldestination/",
	            data: {
	                itineraryNo: $("#itineraryNo").val()
	            },
	            success: function (data) {
	                vm_list2.infos = data.obj.travelPurposeDTOList;
	                if (!!vm_list2.infos[0]) {
	                    vm_list2.params.chineseName = vm_list2.infos[0].chineseName;
	                    vm_list2.params.travelPurposeCode = vm_list2.infos[0].travelPurposeCode;
	                }
	            }
	        });
	        $.ajax({
	            url: __ctx + "/commitaudit/freetrialorder?itineraryNo=" + $("#itineraryNo").val(),
	            data: null,
	            success: function (data) {
	                if (data.result) {
	                    vm_list2.audit = data.obj;
	                }
	            }
	        });
	
	        if(isNotManualitem){
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
	        } else {
	        	vm_list2.approvalModel = [-1, -1, 3]; //只显示线下审批
                vm_list2.offlineApproval();
                
	            $.ajax({
	            	url: __ctx + "/manualAudit/getTotalCost",
	                data: {"itineraryNo" : itineraryNo},
	                success: function (data) {
	                    if (data.success) {
	                        vm_list2.totalCost = data.data;
	                    }
	                }
	            });        	

	        }   	        
        });	        
    },
    methods: {
        goSms: function () {
            var createApprovalApplicantParams = {};
            createApprovalApplicantParams.orderNos = $("#orderNos").val();
            createApprovalApplicantParams.travelAims = vm_list2.params.chineseName;
            createApprovalApplicantParams.travelPurposeCode = vm_list2.params.travelPurposeCode;
            createApprovalApplicantParams.itineraryNo = itineraryNo;
            createApprovalApplicantParams.itineraryProductListDTO = vm_list.infos;
            // if (vm_list2.infos.length > 0 && createApprovalApplicantParams.travelAims == '' || typeof (createApprovalApplicantParams.travelAims) == "undefined") {
            //     toastr.error("差旅目的不能为空", "", toastrConfig);
            //     return;
            // }
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
        },
        goAudit: function () {
            if ($("#orderNo").val()=='') {
                toastr.error("请输入沿用订单号", "", toastrConfig);
                return false;
            }
            vm_list2.authorizeParams.orderNo = $("#orderNo").val();
            vm_list2.authorizeParams.itineraryProductListDTO = vm_list.infos;
            vm_list2.authorizeParams.orderNos = $("#orderNos").val();
            vm_list2.authorizeParams.travelAims = vm_list2.params.chineseName;
            vm_list2.authorizeParams.travelPurposeCode = vm_list2.params.travelPurposeCode;
            vm_list2.authorizeParams.itineraryNo = itineraryNo;
            // if (vm_list2.infos.length > 0 && vm_list2.authorizeParams.travelAims == '' || typeof (vm_list2.authorizeParams.travelAims) == "undefined") {
            //     toastr.error("差旅目的不能为空", "", toastrConfig);
            //     return;
            // }
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
        },
        goOffline: function () {
            if ($("#approval-note").val().length > 100) {
                toastr.error("审批备注最多输入100个字符", "", toastrConfig);
                return false;
            }
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
                        // if (vm_list2.infos.length > 0 && vm_list2.offlineParams.travelAims == '' || typeof (vm_list2.offlineParams.travelAims) == "undefined") {
                        //     toastr.error("差旅目的不能为空", "", toastrConfig);
                        //     return;
                        // }
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
                        // toastr.info("上传成功！", "", toastrConfig);
                    } else {
                        toastr.error("上传失败，请稍后再试", "", toastrConfig);
                        return false;
                    }
                }
            });
        },
        goManualitemOffline: function(){
            if ($("#approval-note").val().length > 100) {
                toastr.error("审批备注最多输入100个字符", "", toastrConfig);
                return false;
            }
            
            if (vm_list2.params.travelNo && vm_list2.params.travelNo.length > 50) {
                toastr.error("OA单号最多输入50个字符", "", toastrConfig);
                return;
            }

            var reg = /^[0-9a-zA-Z]+$/;
            if (vm_list2.params.travelNo && vm_list2.params.travelNo.length > 0 && !reg.test(vm_list2.params.travelNo)) {
                toastr.error("OA单号只能输入数字或字母", "", toastrConfig);
                return;
            }
            
            if (vm_list2.params.remark && vm_list2.params.remark.length > 200) {
                toastr.error("OA备注最多输入200个字符", "", toastrConfig);
                return;
            }

            if (travelOnOffCfgDTOs.split(",")[2] == '1' && !vm_list2.params.travelNo) {
                toastr.error("OA单号不能为空", "", toastrConfig);
                return;
            }

            if (travelOnOffCfgDTOs.split(",")[3] == '1' && !vm_list2.params.remark) {
                toastr.error("OA备注不能为空", "", toastrConfig);
                return;
            }
            
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

                        vm_list2.offlineParams.urls = vm_list2.imgUrls;
                        vm_list2.offlineParams.approvalNote = $("#approval-note").val();
                        vm_list2.offlineParams.itineraryProductListDTO = vm_list.infos;
                        vm_list2.offlineParams.orderNos = $("#orderNos").val();
                        vm_list2.offlineParams.travelAims = vm_list2.params.chineseName;
                        vm_list2.offlineParams.travelPurposeCode = vm_list2.params.travelPurposeCode;
                        vm_list2.offlineParams.itineraryNo = itineraryNo;
                        // if (vm_list2.infos.length > 0 && vm_list2.offlineParams.travelAims == '' || typeof (vm_list2.offlineParams.travelAims) == "undefined") {
                        //     toastr.error("差旅目的不能为空", "", toastrConfig);
                        //     return;
                        // }
                        
                        vm_list2.offlineParams.travelNo = vm_list2.params.travelNo;
                        vm_list2.offlineParams.remark = vm_list2.params.remark;

                        $.ajax({
                            url: __ctx + "/manualitemApproval/offlineApproval",
                            contentType: "application/json",
                            type: "POST",
                            data: JSON.stringify(vm_list2.offlineParams),
                            datatype: "json",
                            success: function (data) {
                                if (!data.result) {
                                    toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                                } else {
                                    toastr.info("线下审批成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
                                    $("#commitAudit").hide();
                                    setTimeout(function () {
                                        window.location.href = __ctx + '/serachitinerary/index';
                                    }, 500);
                                }
                            }
                        });
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
            $('input[type=file]').trigger('click');
            return false;
        },
        onFileChange(e) {
            var flag = true;
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;            

            _.forEach(files, function (file) {
                var fileName=file.name;
                var extStart = fileName.lastIndexOf(".") + 1;
                var ext = fileName.substring(extStart, fileName.length).toLowerCase();
                if (ext != "bmp" && ext != "png" && ext != "gif" && ext != "jpeg" && ext != "jpg" ){
                    flag = false;
                    return false;
                }
                vm_list2.fileValue.push(file);
            });
            if(!flag){
                toastr.error("图片类型必须是.gif,jpeg,jpg,png,bmp中的一种!","", {
                    timeOut: 2000,
                    positionClass: "toast-top-center"
                });
                $('input[type=file]').val('');
                return;
            }

            this.createImage(files);
        },
        createImage(file) {
            if (typeof FileReader === 'undefined') {
                alert('您的浏览器不支持图片上传，请升级您的浏览器');
                return false;
            }
            for (var i = 0; i < file.length; i++) {
                var filesize = file[i].size;
                if (filesize > 10 * 1024 * 1024) {
                    toastr.error("仅允许10M以内文件,文件：" + file[i].name + "，大小超过限制", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return;
                }
            }
            var image = new Image();
            var vm = this;
            var leng = file.length;
            for (var i = 0; i < leng; i++) {
                var name = file[i].name;
                vm.imgNames.push(name);
                var reader = new FileReader();
                reader.readAsDataURL(file[i]);
                reader.onload = function (e) {
                	if ($.inArray(e.target.result, vm.images) < 0) {
                		vm.images.push(e.target.result);
                	}
                };
            }
            
            $('input[type=file]').val('');
        },
        delImage: function (index) {
            this.images.splice(index, 1);
            this.imgNames.splice(index, 1);
        },
        removeImage: function (e) {
            this.images = [];            
        }
    }
});