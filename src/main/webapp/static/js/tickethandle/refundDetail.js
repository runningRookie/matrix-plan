var refund_detail_info;
$(document).ready(
		function() {
			// 价格类型
			Vue.filter('toPriceType', {
				read : function(value, format) {
					if (value == '0') {
						return '普通';
					} else if (value == '1') {
						return '协议价格';
					} else {
						return "";
					}
				},
				write : function(value, format) {
					return value;
				}
			});
			// 出行人类型
			Vue.filter('toPassengerClass', {
				read : function(value, format) {
					if (value == 'a') {
						return '成人';
					} else if (value == 'b') {
						return '儿童';
					} else if (value == 'c') {
						return '婴儿';
					} else {
						return "";
					}
				},
				write : function(value, format) {
					return value;
				}
			});

			refund_detail_info = new Vue({
				el : '#refundDetailVM',
				data : {
					refundApplyInfo : [],
					bookPersonInfo : [],
					segmentInfoList : [],
					refundDetailInfoList : [],
					orderLogList:[],
					applyItems:[],
					urlList:[]
				},methods:{
				    init:function(){
		            	  $.ajax({
		                      url: __ctx + "/refundTicket/detail/index/init?applyNo="+window.applyNo,
		                      data: null,
		                      success:function(data){
		                    	  if(data.result){
		                    		  refund_detail_info.refundApplyInfo=data.obj.refundApplyInfo;
		                    		  refund_detail_info.bookPersonInfo=data.obj.bookPersonInfo;
		                    		  refund_detail_info.segmentInfoList=data.obj.segmentInfoList;
		                    		  refund_detail_info.refundDetailInfoList=data.obj.refundDetailInfoList;
	                    			  refund_detail_info.refundType=refund_detail_info.refundApplyInfo.refundType;
	                    			  refund_detail_info.urlList=data.obj.urlList;
	                    			  if(refund_detail_info.refundType=='0' || refund_detail_info.refundType==0){
	                    				  $("#refundType0").parent().addClass('checked');
	                    			  } else if(refund_detail_info.refundType=='1' || refund_detail_info.refundType==1){
	                    				  $("#refundType1").parent().addClass('checked');
	                    			  }
	                    			  if(null != data.message && "" != data.message){
	                    				  $('#refundException').text(data.message);
	                    				  $('#warnModal').modal({ backdrop: 'static'});
			                        	  $('#warnModal').modal('show');
	                    			  } else {
	                    				  $('#warnModal').modal('hide');
	                    			  }
		                    	  }else{
		                    		  toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
		                    	  }
		                      }
		                  });
		            },
		            close:function(){
		            	promptFnc("确定要关闭吗",
								function() {
									window.location.href = __ctx + "/issueTicket/index?returnFlag=2";// 退票列表
								});
		            },
		            add:function(){
		            	var remarksText = refund_detail_info.remarksText;
						if (remarksText == null || remarksText == "") {
							toastr.error("内部备注不能为空，请填写备注内容。", "", {
								timeOut : 2000,
								positionClass : "toast-top-center"
							});
							return false;
						}
						var data = {
								orderNo : refund_detail_info.refundApplyInfo.orderNo,
								remarksText : remarksText
							};
						$.ajax({
							type : "POST",
							contentType : "application/json",
							url : __ctx + "/refundTicket/addLog",
							data : JSON.stringify(data),
							success : function(data) {
								if (data.result) {
									refund_detail_info.remarksText="";
									toastr.info(data.message, "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
									//向日志列表增加数据
									var orderLog={};
									if(data.obj!=null){
										orderLog.operationType=data.obj.operatorType;
										orderLog.operator=data.obj.operator;
										orderLog.gmtCreate=data.obj.operatorDate;
										orderLog.content=data.obj.content;
										refund_detail_info.orderLogList.unshift(orderLog);	
									}
								} else {
									toastr.error(data.message, "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
									return false;
								}
							}
						});
		            },
		            showLog:function(){
		            	$("#orderLogDiv").toggle();; 
		            	var styleValue=$("#orderLogDiv").css("display");
						if('block'==styleValue || "block" ==styleValue){
							$.ajax({
								type : "POST",
								contentType : "application/json",
								url : __ctx + "/refundTicket/showLog?orderNo="+refund_detail_info.refundApplyInfo.orderNo,
								data : null,
								success : function(data) {
									if (data.result) {
										refund_detail_info.orderLogList=data.obj;
									} else {
										toastr.error(data.message, "", {
											timeOut : 2000,
											positionClass : "toast-top-center"
										});
										return false;
									}
								}
							});
						}
		            },
		            reject:function(){
		            	refund_detail_info.refundRejectText="";
		            	promptFnc("确定要驳回吗", function() {
							$('#refundRejectModal').modal({
								backdrop : 'static'
							});
							$("#refundRejectModal").modal('show');
							// 驳回处理
							refund_detail_info.dealReject();
						});
		            	//审核通过
		            },
		            audit:function(){
		            	// 审核处理
						var rtn=refund_detail_info.dealAudit();
						if(!rtn){
							return false;
						}
		            	promptFnc("确定要审批通过吗", function() {
		            		var data = {
									applyNo : window.applyNo,
									orderNo : refund_detail_info.refundApplyInfo.orderNo,
									applyItems:refund_detail_info.applyItems
								};
								$.ajax({
									type : "POST",
									contentType : "application/json",
									url : __ctx + "/refundTicket/audit",
									data : JSON.stringify(data),
									success : function(data) {
										if (data.result) {
											//提示信息
											toastr.info("审批通过处理完成。", "", {
												timeOut : 2000,
												positionClass : "toast-top-center"
											});
											// 出票列表
											setTimeout(function(){
												window.location.href = __ctx + "/issueTicket/index?returnFlag=2"
											}, 1000);
										} else {
											toastr.error(data.message, "", {
												timeOut : 2000,
												positionClass : "toast-top-center"
											});
											return false;
										}
									}
								});
		            	});
		            	//处理驳回处理
		            },dealReject:function(){
		            	$("#refundRejectSuccess").unbind();
		            	$("#refundRejectSuccess").click(function() {
							var rejectText = refund_detail_info.refundRejectText;
							if (rejectText == null || rejectText == "") {
								toastr.error("驳回内容不能为空，请填写驳回内容。", "", {
									timeOut : 2000,
									positionClass : "toast-top-center"
								});
								return false;
							}
							var data = {
								applyNo : window.applyNo,
								orderNo:refund_detail_info.refundApplyInfo.orderNo,
								rejectReason : rejectText
							};
							$.ajax({
								type : "POST",
								contentType : "application/json; charset=utf-8",
								url : __ctx + "/refundTicket/reject",
								data : JSON.stringify(data),
								success : function(data) {
									if (data.result) {
										//关闭模态框
										$("#rejectModal").modal('hide');
										//提示信息
										toastr.info("驳回处理完成。", "", {
											timeOut : 2000,
											positionClass : "toast-top-center"
										});
										// 出票列表
										setTimeout(function(){
											window.location.href = __ctx + "/issueTicket/index?returnFlag=2"
										}, 1000);
									} else {
										toastr.error(data.message, "", {
											timeOut : 2000,
											positionClass : "toast-top-center"
										});
										return false;
									}
								}
							});
						});
		            	//审批通过处理
		            },dealAudit:function(){
		            	refund_detail_info.applyItems=[];
		            	var refundDetails=refund_detail_info.refundDetailInfoList;
		            	for(var i=0;i<refundDetails.length;i++){
		            		var refundDetail=refundDetails[i];
		            		for(var j=0;j<refundDetail.refundAppItemVos.length;j++){
		            			var refundInfo=refundDetail.refundAppItemVos[j];
		            			refundInfo.refundSupplierActualAmount=""+refundInfo.refundSupplierActualAmount;
		            			//判断不能为空
		            			if(refundInfo.refundSupplierActualAmount=="" || refundInfo.refundSupplierActualAmount==null){
		            				toastr.error("实付供应商退票金额不能为空", "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
		            				return false;
		            			}
		            			var reg=/^(([0-9]*)|(([0]\.\d{1,2}|[0-9]*\.\d{1,2})))$/;
		            			if(!reg.test(refundInfo.refundSupplierActualAmount)){
		            				toastr.error("实付供应商退票金额格式不正确", "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
		            				return false;
		            			}
		            			var refundObj={};
		            			refundObj.id=refundInfo.id;
		            			refundObj.refundSupplierActualAmount=refundInfo.refundSupplierActualAmount;
		            			refundObj.orderItemId=refundInfo.orderItemId;
		            			refund_detail_info.applyItems.push(refundObj);
		            		}
		            	}
		            	return true;
		            }
				}
			});
			refund_detail_info.init()
		});
