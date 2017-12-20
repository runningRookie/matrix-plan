var ticket_detail_vm;
$(document).ready(
		function() {
			ticket_detail_vm = new Vue({
				el : "#ticket_detail_button",
				data : {
					rejectText : "",
					params : {
						orderNo:"",
						ticketDtoList : []
					}
				},
				methods : {
					// 点击关闭
					close : function() {
						promptFnc("确定要关闭吗",
								function() {
									window.location.href = __ctx + "/issueTicket/index";// 出票列表
								});
					},
					// 点击处理
					deal : function() {
						// 处理前校验
						if (!ticket_detail_vm.dealCheck()) {
							return false;
						}
						ticket_detail_vm.params.orderNo=window.orderNo;
						//ticket_detail_vm.params.officeCode=ticket_detail_info.orderInfo.officeCode;
						// 处理
						$.ajax({
							type : "POST",
							contentType : "application/json",
							url : __ctx + "/issueTicket/detail/deal",
							data : JSON.stringify(ticket_detail_vm.params),
							success : function(data) {
								if (data.result) {
									//登帐处理
									//ticket_detail_vm.ticketAccount();
									//提示信息
									toastr.info("处理完成。", "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
									//出票列表
									setTimeout(function(){
										window.location.href = __ctx + "/issueTicket/index"
									}, 1000);
								} else {
									toastr.error(data.message, "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
								}
							}
						});
					},
					// 点击驳回
					reject : function() {
						promptFnc("确定要驳回吗", function() {
							$('#rejectModal').modal({
								backdrop : 'static'
							});
							$("#rejectModal").modal('show');
							// 驳回处理
							ticket_detail_vm.dealReject();
						});
					},// 处理前必填项校验
					dealCheck : function() {
						ticket_detail_vm.params.ticketDtoList = [];
						var info = ticket_detail_info.passengers;
//						//office不能为空
//						if(ticket_detail_info.orderInfo.officeCode==null || ticket_detail_info.orderInfo.officeCode==""){
//							toastr.error("Office不能为空。", "", {
//								timeOut : 2000,
//								positionClass : "toast-top-center"
//							});
//							return false;
//						}
						//供应商不能为空
						if(ticket_detail_info.ticketSupplier==null || ticket_detail_info.ticketSupplier==""){
							toastr.error("供应商不能为空。", "", {
								timeOut : 2000,
								positionClass : "toast-top-center"
							});
							return false;
						}
						//票价种类不能为空
						if(ticket_detail_info.ticketType==null || ticket_detail_info.ticketType==""){
							toastr.error("票价种类不能为空。", "", {
								timeOut : 2000,
								positionClass : "toast-top-center"
							});
							return false;
						}
						var reg0=/^[0-9]{3}\-[0-9]{10}$/;
						var reg=/^[0-9]{13}$/;
						var ticketNos="T";
						if (info != null) {
							for (var i = 0; i < info.length; i++) {
								var ticketInfo = info[i].flightTicketDTO;
								ticketInfo.ticketType=ticket_detail_info.ticketType;
								ticketInfo.ticketSupplierId=ticket_detail_info.ticketSupplier;
								$.each(ticket_detail_info.ticketInfo.ticketSupplierList,function(key,value){ 
									if(ticketInfo.ticketSupplierId == key){
										ticketInfo.ticketSupplier = value;
									}
								}); 
								ticketInfo.externalOrderNo=ticket_detail_info.externalOrderNo;
								var passengerInfo = info[i].passenger;
								ticket_detail_vm.params.ticketDtoList.push(ticketInfo);
								if(!reg0.test(ticketInfo.ticketNo) && !reg.test(ticketInfo.ticketNo)){
		            				toastr.error("票号不合法！", "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
		            				return false;
		            			}
								//校验票号不能重复
								var ticketNo=ticketInfo.ticketNo;
								if(ticketNos.indexOf(ticketNo)>0){
									toastr.error("乘客" + passengerInfo.passengerName + ",票号不能重复。", "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
									return false;
								}
								ticketNos=ticketNos+ticketNo+"T";
							}
							if(this.validTicketNosIfExist(ticketNos)){
								return true;
							}else{
								return false;
							}
							return true;
						}
					},// 驳回处理
					dealReject : function() {
						$("#rejectSuccess").unbind();
						$("#rejectSuccess").click(function() {
							var rejectText = ticket_detail_vm.rejectText;
							if (rejectText == null || rejectText == "") {
								toastr.error("驳回内容不能为空，请填写驳回内容。", "", {
									timeOut : 2000,
									positionClass : "toast-top-center"
								});
								return false;
							}
							var data = {
								orderNo : window.orderNo,
								rejectText : rejectText
							};
							$.ajax({
								type : "POST",
								contentType : "application/json",
								url : __ctx + "/issueTicket/reject",
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
											window.location.href = __ctx + "/issueTicket/index"
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
							url : __ctx + "/issueTicket/validTicketNo",
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
						return ifExis;
					}
					//登帐处理
//					ticketAccount:function(){
//						$.ajax({
//							type : "POST",
//							contentType : "application/json",
//							url : __ctx + "/issueTicket/detail/ticket/account?orderNo="+ticket_detail_vm.params.orderNo,
//							data : null,
//							success : function(data) {
//							}
//						});
//					}
				}
			});
		});