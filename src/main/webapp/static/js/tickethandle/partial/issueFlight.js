var ticket_detail_info;
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

			ticket_detail_info = new Vue({
				el : '#issueFlightVM',
				data : {
					orderInfo : "",
					outerText : "",
					ticketSupplier:"",
					ticketSupplierName:"",
					ticketType :"",
					externalOrderNo:"",
					flights : [],
					//officeList:[],
					passengers : [],
					ticketInfo : []
				},ready : function() {
					var data = {
						orderNo : window.orderNo
					};

					// 航段信息查询
					$.getJSON(__ctx + "/orderdetails/searchFlightSegment",
							data, function(result) {
								if(result.result){
									ticket_detail_info.flights = result.obj;
								}else{
									toastr.error(result.message, "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
								}
							});
					// 乘客信息查询
					$.getJSON(__ctx
							+ "/orderdetails/searchPassengerSegmentInfos",
							data, function(result) {
								if(result.result){
									ticket_detail_info.passengers = result.obj;
									//设置票种的默认值
									for(var i=0;i<ticket_detail_info.passengers.length;i++){
										var passenger= ticket_detail_info.passengers[i];
										ticket_detail_info.ticketSupplier=passenger.flightTicketDTO.ticketSupplierId;
										ticket_detail_info.ticketSupplierName=passenger.flightTicketDTO.ticketSupplier;
										ticket_detail_info.ticketType=passenger.flightTicketDTO.ticketType;
										ticket_detail_info.externalOrderNo=passenger.flightTicketDTO.externalOrderNo;
										//处理供应商问题
										passenger.flightTicketDTO.ticketSupplier=passenger.flightTicketDTO.ticketSupplierId;
									}
								}else{
									toastr.error(result.message, "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
								}
							});
					// 票基础信息
					$.getJSON(__ctx + "/issueTicket/detail/index/init", data,
							function(result) {
								if (result.result) {
									ticket_detail_info.orderInfo = result.obj.orderInfo;
									ticket_detail_info.outerText = result.obj.outerText;
									ticket_detail_info.ticketInfo = result.obj;
									//ticket_detail_info.officeList=result.obj.officeList;
									if(null != result.message && "" != result.message){
	                    				  $('#issueException').text("本订单请求供应商出票失败或已被供应商拒绝出票，请查看日志。");
	                    				  $('#warnModal').modal({ backdrop: 'static'});
			                        	  $('#warnModal').modal('show');
	                    			} else {
	                    				  $('#warnModal').modal('hide');
	                    			}
								} else {
									toastr.error(result.message, "", {
										timeOut : 2000,
										positionClass : "toast-top-center"
									});
								}
							});
				},methods : {
					//供应商改变
					changeSupplier:function(supplier){
						var info = ticket_detail_info.passengers;
						if (info != null) {
							for (var i = 0; i < info.length; i++) {
								var ticketInfo = info[i].flightTicketDTO;
								ticketInfo.ticketSupplier=supplier;
							}
						}
					}
				}
			});
		});