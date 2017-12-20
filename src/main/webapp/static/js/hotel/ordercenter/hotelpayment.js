$(document).ready(function () {
  
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
	                return '因公';
	            }
	            if (value == 2) {
	                return '因私';
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
				if(value == 'DT1'){
				return '火车票';
				}
				if(value == 'DH1'){
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
	                return '待提交审批';
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
	                return '审批否决';
	            }
				if (value == 5) {
	                return '撤销审批';
	            }
	        },
	        write: function (value, format) {
	            return value;
	        }
	    });

	    var vm_list = new Vue({
	        el: "#itineraryproductlist",
	        data: {
	            infos: [],
	            params: {},
	            checked: [],
	            orderNos: [],
	            cancelReason: "行程取消",
	            cancelReasonCode:"1",
	            orderNo: "",
				auditId:"",
	            allowedOrderStatus: ["02","03","04","05","06"],
				auditStatusList:["01","02"],
				auditStatus2:["01"],
				hotelAudit:"1",
	            showModel:false
	        },
	        ready: function () {
	            // 页面初始化载入首页数据.
	            this.loadGridData();
	            this.showModel = true;
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
	        methods: { //紧急审批TODO
	            emergencyApproval: function () {
	                var emergencyApprovalQuery = {};
	                emergencyApprovalQuery.orderNo = window.orderNo;
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
	                            toastr.error("提交紧急审批失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
	                        } else {
	                            toastr.info("提交紧急审批成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
	                        }
	                    }
	                });
	            },
	            trainEmergencyApproval: function(){
	            	alert("this is train");
	            },
	            hotelEmergencyApproval: function(){
	            	alert("this is hotel");
	            },
				 /*撤回审批*/
	            cancellationOrder: function () {
	                $.ajax({
	                    url: __ctx + "/commitaudit/trminationapproval",
	                    data: {
	                        orderNo: vm_list.orderNo,
							auditId: vm_list.auditId
	                    },
	                    success: function (data) {
	                        if (!data.result) {
	                            toastr.error(data.message, "撤回审批失败", {timeOut: 2000, positionClass: "toast-top-center"});
	                        } else {
	                            toastr.info(data.message, "撤回审批成功", {timeOut: 2000, positionClass: "toast-top-center"});
	                        }
	                    }
	                });
	            },
	            goSms: function () {
	            	this.orderNos = [];
	                $("#formModal").modal({
	                    show: true,
	                    remote: __ctx + "/itineraryproduct/tocommitaudit?orderNos=" + this.orderNos.toString() + "&itineraryNo=" + itineraryNo,
	                    backdrop: 'static'
	                });
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
	                    }
	                });
	            },

	            cancelOrder: function () {
	                if (vm_list.cancelReason == '') {
	                    toastr.error("订单取消原因不能为空！", "", {timeOut: 2000, positionClass: "toast-top-center"});
	                    return;
	                }
	                $.ajax({
	                    url: __ctx + "/flightOrder/cancelFlightOrder",
	                    type: "POST",
	                    data: {
	                        orderNo: vm_list.orderNo,
	                        cancelReasonCode:vm_list.cancelReasonCode,
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
	            },
	            bindReason:function(cancelReasonCode){
	            	if(cancelReasonCode == '1'){
	            		this.cancelReason = "行程取消";
	            	}else if(cancelReasonCode == '2'){
	            		this.cancelReason = "重新预订";
	            	}
					else if(cancelReasonCode == '3'){
						this.cancelReason = "价格有问题";        		
	            	}
					else if(cancelReasonCode == '4'){
						this.cancelReason = "审批问题";
					}
					else if(cancelReasonCode == '5'){
						this.cancelReason = "支付问题";
					}
					else if(cancelReasonCode == '6'){
						this.cancelReason = "测试订单";
					}
					else if(cancelReasonCode == '7'){
						this.cancelReason = "客人自主取消";
					}
	            },//打包支付
	            togetherPay:function(){
	            	  $.ajax({
	                      url: __ctx + "/payment/togetherPay/check",
	                      data: {
	                          itineraryNo: window.itineraryNo
	                      },
	                      success: function (data) {
	                          if (data.result && data.obj.isPay) {
	                          	window.location.href = __ctx + "/payment/togetherPay/index?itineraryNo="+window.itineraryNo
	                          } else {
	                              toastr.error(data.message, "", {timeOut: 0, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
	                          }
	                      }
	                  });
	            }
	        }
	    });

	    $('#confirmCancel').on('show.bs.modal', function (event) {
	        var button = $(event.relatedTarget) // Button that triggered the modal
	        var orderNo = button.data('orderno') // Extract info from data-* attributes
	        vm_list.orderNo = orderNo;

	    })
		
		 $('#RevocationOfApproval').on('show.bs.modal', function (event) {
	        var button = $(event.relatedTarget) // Button that triggered the modal
	        var orderNo = button.data('orderno') // Extract info from data-* attributes
			var auditid = button.data('auditid')
	        vm_list.orderNo = orderNo;
			vm_list.auditId = auditid;
	    })
});