var changeDetailVM;
$(document).ready(
		function() {
			var defaultConfig = {container: 'body'};
			
			Vue.filter('toSegmentChangeDesc', {
		        read: function (value, format) {
		            if (value == '1') {
		                return '航班延迟';
		            }
		            if (value == '2') {
		                return '航班提前';
		            }
		            if (value == '3') {
		                return '航班取消';
		            }
		            if (value == '10') {
		                return '取消恢复';
		            }
		            return  '其他';
		        },
		        write: function (value, format) {
		            return value;
		        }
		    });
			
			changeDetailVM = new Vue({
				el : '#changeDetailVM',
				data : {
					bookCompanyName: "",
		            bookPerson: "",
					changeApplyInfo : {ticketAccountDtoList: [],changeApplyItemVoList: []},
					orderLogList : {},
					flights : {},
					passengers : {},
					segments : {},
					newPassengers : {},
					applyItems : {},
					pnr: "",
					urlList:[]
				},methods:{
				    init:function(){
				    	var data = {orderNo: window.orderNo};
		            	  $.ajax({
		                      url: __ctx + "/changeTicket/detail/index/init?applyNo="+window.applyNo+"&orderNo="+window.orderNo,
		                      data: null,
		                      success:function(data){
		                    	  if(!data.obj || !data.obj.flightChangeApplyDTO){
			                      		window.location.href = __ctx+"/common/pageNotFound";
			                      }else{
			                    	    changeDetailVM.changeApplyInfo = _.cloneDeep(data.obj.flightChangeApplyDTO);
			                    	    changeDetailVM.segments = _.cloneDeep(data.obj.segmentMap.flightSegments);
			                    	    changeDetailVM.newPassengers = _.cloneDeep(data.obj.segmentMap.passengers);
			                    	    
			                    	    changeDetailVM.urlList=data.obj.urlList;
			                    	    
			                    	    if(changeDetailVM.changeApplyInfo.rescheduledType == '1'){
			                    	    	$("#rescheduledType1").parent().addClass('checked');
			                    	    	changeDetailVM.pnr = data.obj.flightChangeApplyDTO.pnr;
			                    	    	if(data.obj.flightChangeApplyDTO.pnr){
			                    	    		$("#search-pnr").attr("disabled", "disabled");
			                    	    	}
			                    	    	setTimeout(function(){
			                    	    		$(".search-ticketNo").attr("disabled", "disabled");
											}, 1000);
			                    	    }else{
			                    	    	$("#rescheduledType0").parent().addClass('checked');
			                    	    	changeDetailVM.pnr = data.obj.flightChangeApplyDTO.newPnr;
			                    	    }
			                    	    
			                    	    setTimeout(function () {
			                                $('.originPriceTypes').each(function () {
			                                    var selector$ = $(this);
			                                    var pIndex = selector$.data('pindex');
			                                    var index = selector$.data('index');
			                                    var item = changeDetailVM.newPassengers[pIndex][index].originSegmentInfo;
			                                    var segment = changeDetailVM.segments[index].originSegment;
			                                    if (!item || !segment) {
			                                        return;
			                                    }
			                                    if (item.priceType != 1) {
			                                        return;
			                                    }
			                                    var template = tc.flight.detail.utils.genTableTemplate([], [
			                                        ['协议号：', segment.airlineCompany + '：' + item.agreementCode],
			                                        ['协议价：', item.agreementPrice]
			                                    ]);

			                                    selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
			                                });
			                                
			                                $('.newPriceTypes').each(function () {
			                                    var selector$ = $(this);
			                                    var pIndex = selector$.data('pindex');
			                                    var index = selector$.data('index');
			                                    var item = changeDetailVM.newPassengers[pIndex][index].segmentInfo;
			                                    var segment;
			                                    if(changeDetailVM.changeApplyInfo.rescheduledType == '1'){
			                                    	segment = changeDetailVM.segments[index].segmentChange;
			                                    }else{
			                                    	segment = changeDetailVM.segments[index].newSegment;
			                                    }
			                                    if (!item || !segment) {
			                                        return;
			                                    }
			                                    if (item.priceType != 1) {
			                                        return;
			                                    }
			                                    var template = tc.flight.detail.utils.genTableTemplate([], [
			                                        ['协议号：', segment.airlineCompany + '：' + item.agreementCode],
			                                        ['协议价：', item.agreementPrice]
			                                    ]);

			                                    selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
			                                });
			                            }, 500);
			                    	    
			                    	    console.log(JSON.stringify(data.obj.flightChangeApplyDTO.flightChangeDistributionDTO));
			                    	    if(null !=data.obj.flightChangeApplyDTO && null != data.obj.flightChangeApplyDTO.flightChangeDistributionDTO && 1 == data.obj.flightChangeApplyDTO.flightChangeDistributionDTO.supplierChangeSuccess){
			                    	    	if(data.obj.flightChangeApplyDTO.flightChangeDistributionDTO.supplierChangeOrderSerialId){
			                    	    		$('#changeException').text("本订单已被供应商拒绝改期，请查看日志。");
			                    	    	}else{
			                    	    		$('#changeException').text("本订单请求供应商改期失败，请查看日志。");
			                    	    	}
			                    	    	$('#dealModal').modal({ backdrop: 'static'});
			                        		$('#dealModal').modal('show');
			                    	    }else{
			                    	    	$('#dealModal').modal('hide');
			                    	    }
			                      }
		                      }
		                  });
		            	  
		            	  $.getJSON(__ctx + "/orderdetails/getBookCompanyName", data, function (result) {
		            		  changeDetailVM.bookCompanyName = result.obj;
		                  });

		                  $.getJSON(__ctx + "/orderdetails/bookpersons", data, function (result) {
		                	  changeDetailVM.bookPerson = result.obj;
		                  });

		                  $.getJSON(__ctx + "/orderdetails/searchFlightSegment", data, function (result) {
		                	  changeDetailVM.flights = result.obj;
		                  });

		                  $.getJSON(__ctx + "/orderdetails/searchPassengerSegmentInfos", data, function (result) {
		                	  changeDetailVM.passengers = result.obj;
		                  });
		            },
		            close:function(){
		            	promptFnc("确定要关闭吗",
								function() {
									window.location.href = __ctx + "/issueTicket/index?returnFlag=4";// 改期列表
								});
		            },
		            add:function(){
		            	var remarksText = changeDetailVM.remarksText;
						if (remarksText == null || remarksText == "") {
							toastr.error("内部备注不能为空，请填写备注内容。", "", {
								timeOut : 2000,
								positionClass : "toast-top-center"
							});
							return false;
						}
						var data = {
								orderNo : changeDetailVM.changeApplyInfo.orderNo,
								remarksText : remarksText
							};
						$.ajax({
							type : "POST",
							contentType : "application/json",
							url : __ctx + "/changeTicket/addLog",
							data : JSON.stringify(data),
							success : function(data) {
								if (data.result) {
									changeDetailVM.remarksText="";
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
										changeDetailVM.orderLogList.unshift(orderLog);	
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
		            	$("#orderLogDiv").toggle();
		            	var styleValue=$("#orderLogDiv").css("display");
						if('block'==styleValue || "block" ==styleValue){
							$.ajax({
								type : "POST",
								contentType : "application/json",
								url : __ctx + "/changeTicket/showLog?applyNo="+changeDetailVM.changeApplyInfo.applyNo,
								data : null,
								success : function(data) {
									if (data.result) {
										changeDetailVM.orderLogList=data.obj;
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
		            	changeDetailVM.changeRejectText="";
		            	$("#changeRejectModal").modal('show');
		            	// 驳回处理
		            	changeDetailVM.dealReject();
		            },
		            audit:function(){
		            	// 审核处理
						var rtn=changeDetailVM.dealAudit();
						if(!rtn){
							return false;
						}
		            	promptFnc("确认改期？", function() {
		            		var data = {
									applyNo : window.applyNo,
									orderNo : changeDetailVM.changeApplyInfo.orderNo,
									changeType : '1',
									pnr : changeDetailVM.pnr,
									applyItems:changeDetailVM.applyItems
								};
								$.ajax({
									type : "POST",
									contentType : "application/json",
									url : __ctx + "/changeTicket/audit",
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
		            },
		            dealReject:function(){
		            	$("#changeRejectSuccess").unbind();
		            	$("#changeRejectSuccess").click(function() {
							var rejectText = changeDetailVM.changeRejectText;
							var data = {
								applyNo : window.applyNo,
								orderNo:changeDetailVM.changeApplyInfo.orderNo,
								rejectReason : rejectText
							};
							$.ajax({
								type : "POST",
								contentType : "application/json; charset=utf-8",
								url : __ctx + "/changeTicket/reject",
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
											window.location.href = __ctx + "/issueTicket/index?returnFlag=4"
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
		            },
		            dealAudit:function(){
		            	changeDetailVM.applyItems=[];
		            	var passengers=changeDetailVM.newPassengers;
						var keys=_.keys(changeDetailVM.newPassengers);
						var ticketNos = "";
						for(var k=0;k<keys.length;k++){
							var passenger=passengers[keys[k]];
							for(var i=0;i<passenger.length;i++){
								var applyItem=passenger[i].applyItem;
								var reg0=/^[0-9]{3}\-[0-9]{10}$/;
								var reg=/^[0-9]{13}$/;
		            			if(!reg0.test(applyItem.ticketNo) && !reg.test(applyItem.ticketNo)){
		            				toastr.error("票号不合法！", "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
		            				return false;
		            			}
								var refundObj={};
								refundObj.id=applyItem.id;
								refundObj.newOrderItemId=applyItem.newOrderItemId;
								refundObj.originalOrderItemId=applyItem.originalOrderItemId;
								refundObj.segmentChangeOrderItemId=applyItem.segmentChangeOrderItemId;
								refundObj.ticketNo=applyItem.ticketNo;
								changeDetailVM.applyItems.push(refundObj);
								
								ticketNos =ticketNos+applyItem.ticketNo+"T";
							}
						}
						var reg1=/^[A-Za-z0-9]*$/;
						var reg2=/^[0-9A-Za-z]{1,6}$/;
						if(!reg1.test(changeDetailVM.pnr)){
							toastr.error("非法字符，请输入英文或数字！", "", {
								timeOut : 2000,
								positionClass : "toast-top-center"
							});
							return false;
						}
            			if(!reg2.test(changeDetailVM.pnr)){
            				toastr.error("PNR请输入6位以内的英文或数字！", "", {
								timeOut : 2000,
								positionClass : "toast-top-center"
							});
            				return false;
            			}
            			if(changeDetailVM.changeApplyInfo.rescheduledType == '1' || this.validTicketNosIfExist(ticketNos)){
							return true;
						}else{
							return false;
						}
						return true;
		            },
		            validTicketNosIfExist:function(ticketNos){
						if(!ticketNos){
							toastr.info("请填写票号！", "", {
								timeOut : 2000,
								positionClass : "toast-top-center"
							});
							return;
						}
						var ifExis = true;
						$.ajax({
							type : "POST",
							url : __ctx + "/changeTicket/validTicketNo",
							data : {
								ticketNos:ticketNos
							},
							async: false,
							success : function(data) {
								if(data.result){
									if(data.obj.repeat){
										//提示信息
										toastr.info("票号"+data.obj.repeatTicketNos+"存在重复！", "", {
											timeOut : 2000,
											positionClass : "toast-top-center"
										});
										ifExis = false;
									}
								}else{
									toastr.info(data.message, "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
								}
							}
						});
						return ifExis ;
					}
				}
			});
			changeDetailVM.init()
		});
