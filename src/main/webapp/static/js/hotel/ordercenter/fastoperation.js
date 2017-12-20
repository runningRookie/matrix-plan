$(document).ready(function () {
	
	Convert=function(data){/*
		if(data==1) return "行程取消";
		if(data==2) return "酒店满房";
		if(data==3) return "我就不想要了";
		if(data==4) return "其他";*/
		var result = "";
		//var day=new Date().getDay();
		switch (data){
			case '1':
			  result="行程取消";
			  break;
			case '2':
			  result="酒店满房";
			  break;
			case '3':
			  result="我就不想要了";
			  break;
			case '4':
			  result="其他";
			  break;
		}
		return result;
	}

    Vue.filter('dateToWeek', {
        read: function (date) {
            var newDateStr = date.replace(/-/g,"/");
            var aa = new Date(newDateStr).getDay();
            return "星期" + "日一二三四五六".split("")[aa];
        },
        write: function (value) {
            return value;
        }
    });

    var fastoperationVM = new Vue({
        el: '#fastoperationVM',
        data: {
            cancelReason: "",
            showModel:false,
			//outOrderStatus:"",
			order:{},
            orderMain:{},
            hotelDetailPriceInfo:{},
			cancelRemark:"",
			emergencyApprovalType:"",//紧急审批类型
			specialCode:"",//特殊CODE
			freeRemark:"",//免审备注
			s_msgcontent:"",
			canPushAgain:false,
			canModify:false,
			startDate:"",//入住日期
			endDate:"",//离店日期
			gmtOccupancyTime:"",//入住日期
			gmtLeaveTime:"",//离店日期
			resourceCountAndPriceDetails:[],
			totalCost:0,
			priceDiff:0,
			agreeHotelContactInfo:{},
			messageReceiverList: [],
			selectedOpt: 0,
			messageOpt: ""
        },
        watch:{
            'selectedOpt': function(val){
                this.changePhoneSelected(this.messageReceiverList[val].phone);
            }
        },
        ready: function () {
            this.showModel = true;
            var data = {orderNo: window.orderNo};
            var formatDate = function(DATE){
    			var date = new Date(DATE);
    			var year = date.getFullYear();
    			var month = date.getMonth()+1;
    			var day = date.getDate();
    			String(month).length < 2 ? (month = "0" + month): month;
                String(day).length < 2 ? (day = "0" + day): day;
    			return year+"-"+month+"-"+day+" 00:00:00";
    		};
            $.getJSON(__ctx + "/hotel/getHotelOrderByOrderNo", data, function (result) {
            	fastoperationVM.order = result.obj;
            	fastoperationVM.gmtOccupancyTime = formatDate(result.obj.gmtOccupancyTime);
            	fastoperationVM.gmtLeaveTime = formatDate(result.obj.gmtLeaveTime);
            	$("#confirmOrder").attr("disabled", "disabled");
                $("#cancelOrder").attr("disabled", "disabled");
                //判断是否可以确认 (内部订单状态为“6:待供应商确认” 且 外部订单状态为“10已确认” )
                if (fastoperationVM.order.orderStatus == '6') {
                    
                    $("#confirmOrder").attr("disabled", false);
                            
                }
                //判断是否可点击发送支付链接
                if(fastoperationVM.order.orderStatus == '1' || fastoperationVM.order.payStatus == '3' || fastoperationVM.order.approvalStatus != '3' ||
                		fastoperationVM.order.hotelType == '1' || (fastoperationVM.order.hotelType == '2' &&
                				fastoperationVM.order.paymentType == 'm')){
                	
                	$("#hotelpay").attr("disabled", true);
                }
                               
                $.getJSON(__ctx + "/hotel/getHotelOrderMainByOrderNo", data, function (result) {
                	fastoperationVM.orderMain = result.obj;
                	var currentTime = new Date().getTime();
                	var occupancyTime = fastoperationVM.order.gmtOccupancyTime;
                	if(occupancyTime == '' || occupancyTime == undefined || occupancyTime == null || isNaN(occupancyTime)){
                		occupancyTime = 0;
                	}
                	if(fastoperationVM.orderMain.isPushOrder == '0'|| (fastoperationVM.orderMain.isPushOrder == '1' &&
                			(currentTime - 72000000) < occupancyTime)){
                		if(fastoperationVM.order.orderStatus != 1 && fastoperationVM.order.orderStatus != 15 && fastoperationVM.order.orderStatus != 14){
                			$("#cancelOrder").attr("disabled", false);
                		}
                		
                	}

                	//能否订单修改以及再次发送判断
					if (fastoperationVM.orderMain.isPushOrder == '0'&&fastoperationVM.order.orderStatus!='1'&&fastoperationVM.order.orderStatus!='15') {
                        fastoperationVM.canModify = true;
					}
					if (fastoperationVM.order.orderStatus!='1'&&fastoperationVM.order.orderStatus!='15' && ((fastoperationVM.order.hotelType=='1' && fastoperationVM.order.approvalStatus=='3' && fastoperationVM.orderMain.isPushOrder == '0')
						||(fastoperationVM.order.hotelType=='2' && fastoperationVM.order.approvalStatus=='3' && fastoperationVM.order.payStatus == '3' && fastoperationVM.orderMain.isPushOrder == '0'))) {
						fastoperationVM.canPushAgain = true;
					}
                })
                
                //判断是否为协议酒店
                if(fastoperationVM.order.supplierType == '3'){
                	$("#confirmPushAgain").attr("disabled", true);
                	$("#contactHotel").attr("disabled", false);
                	$('#fax').show();//显示发送传真按钮
                	$('#pushAgain').parent('td').hide()//隐藏再次推送
                	$.getJSON(__ctx + "/agreementhotelcontact/queryhotelcontact", data, function (result) {
                		fastoperationVM.agreeHotelContactInfo = result.data;
                	})
                }else{
                	$("#contactHotel").attr("disabled", true);
                }
            });
            $.getJSON(__ctx + "/hotel/getHotelDetailPriceInfoByOrderNo", data, function (result) {
                fastoperationVM.hotelDetailPriceInfo = result.obj;
            });
            var _this = this;
    		var cal = new $.Calendar({
    			skin: "white",
    			monthNum: 2
    		});
            //计算最大离店日期
    		var computeEndDate = function(T,DATE){
    			var date = new Date();
    			if(DATE){
    				var dateList = DATE.split("-");
    				date.setFullYear(+dateList[0],+dateList[1]-1,+dateList[2]);
    			}			
    			date.setDate(date.getDate()+T);
    			var year = date.getFullYear();
    			var month = date.getMonth()+1;
    			month=month<10?'0'+month:month;
    			var day = date.getDate();
    			day=day<10?'0'+day:day;
    			return year+"-"+month+"-"+day;
    		};
            $(".input_date").click(function(){
    			var $this = $(this);
    			var startDate = new Date();
    			var endDate = computeEndDate(60);
    			var currentDate= [$(".input_date").eq(0).val()];
    			if($this.index(".input_date")==1){
    				startDate = computeEndDate(1,$(".input_date").eq(0).val());
    				var endDate1 = computeEndDate(60);//从当天到60天后的日期
    				var endDate2 = computeEndDate(20,$(".input_date").eq(0).val());//从入住日期到20天后的日期
    				//两个离店日期以最小的为准
    				if(+(endDate1.replace(/\-/g,""))>+(endDate2.replace(/\-/g,""))){
    					endDate = endDate2;
    				}else{
    					endDate = endDate1;
    				}
    			}
    			cal.pick({
           			elem: $this,
    	   			startDate:startDate,
    	   			endDate:endDate,
    	   			zIndex: "10050",
    				currentDate:currentDate,
           			fn:function(year, month, day){
    		  			Month=month<10?'0'+month:month;
              			Day=day<10?'0'+day:day;
              			var chooseDate = year+"-"+Month+"-"+Day;
               			if($this.index(".input_date")==1){
               				_this.endDate = chooseDate;
               				_this.getResourceCalendar($(".input_date").eq(0).val()+" 00:00:00",_this.endDate+" 00:00:00",_this.orderMain.productUniqueId);
               			}else{
               				_this.startDate = chooseDate;
               				_this.endDate = $(".input_date").eq(1).val();
               				//当选择的入住日期大于等于离店日期，需修改离店日期 || 当选择的入住日期和离店日期的间隔超过20天，需修改离店日期	
               				if(+(_this.startDate.replace(/\-/g,""))>=+(_this.endDate.replace(/\-/g,""))||+(computeEndDate(20,chooseDate).replace(/\-/g,""))<+(_this.endDate.replace(/\-/g,""))){
               					_this.endDate = computeEndDate(1,chooseDate);
               					$(".input_date").eq(1).val(computeEndDate(1,chooseDate));
               					$(".input_date").eq(1).click();
               				
               				}else{
                   				_this.getResourceCalendar(_this.startDate+" 00:00:00",$(".input_date").eq(1).val()+" 00:00:00",_this.orderMain.productUniqueId);
               				}
               			}
               			
           			}
      			});	
    		});
        },
        methods: {
            //确认订单
			confirmOrder:function(){
				$.ajax({
                    url: __ctx + "/hotel/confirmOrder",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("确认订单失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        toastr.success(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
						tc.hotel.logs.refresh();
                    }
                });
			},
			//申请取消
            cancelOrder: function () {
				//alert('取消订单,取消原因：'+fastoperationVM.cancelReason+'--'+Convert(fastoperationVM.cancelReason)+',取消备注：'+fastoperationVM.cancelRemark);
//				fastoperationVM.cancelRemark = Convert(fastoperationVM.cancelRemark);
				if (!fastoperationVM.cancelReason) {
                    toastr.error("订单取消原因不能为空！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
				
				var cancelReasonText = Convert(fastoperationVM.cancelReason);
				if(fastoperationVM.cancelReason == 4){
					if(fastoperationVM.cancelRemark == "" || fastoperationVM.cancelRemark == null || fastoperationVM.cancelRemark == undefined){
						toastr.error("请输入取消备注", "", {timeOut: 2000, positionClass: "toast-top-center"});
						return;
					}
					cancelReasonText = fastoperationVM.cancelRemark;
				}
				
				var hotelOrdersCancelRequestDTO = {
						token: '',
						orderStatusRequestDTOs:[{
								orderNo: window.orderNo,
								cancelReasonId:fastoperationVM.cancelReason,
                                cancelReason: cancelReasonText,
                                fromPlatment:2//固定传值 
                            }
                        ]
				};
				
				$.ajax({
					 //TODO  酒店
					url: __ctx + "/hotelorder/cancels",
					type: "POST",
					data: JSON.stringify(hotelOrdersCancelRequestDTO),
		            contentType:"application/json",
					datatype: "json",
					error: function (data) {
						toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
					},
					success: function (data) {
						if(data.result == true){
                           
							var responseDTO = data.obj.orderStatusResponseVOs;
							for(var i=0; i< responseDTO.length; i++ ){
								var e = responseDTO[i];
								if(e.orderNo == window.orderNo){
									toastr.success(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
									location.reload();
									$("#cancelOrder").attr("disabled", true);
                                   return;
								}
							
						     }

								toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});		
						
							}else{
								toastr.error("取消失败", "", {timeOut: 2000, positionClass: "toast-top-center"});   
							}
                   	}
				 	});
            /*    $.ajax({
                    url: __ctx + "/hotelorder/cancelOrder",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo,
                        cancelReason: fastoperationVM.cancelReason,
						cancelRemark: fastoperationVM.cancelRemark
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("取消订单失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        toastr.success("取消订单成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
						tc.hotel.logs.refresh();
                    }
                });*/
            },
			//撤回审批
            cancelApproval: function () {
				alert('撤回审批');
			/*	$.ajax({
                    url: __ctx + "/hotelorder/cancelApproval",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo,
						emergencyApprovalType:"",//紧急审批类型
						specialCode:"",//特殊CODE
						freeRemark:""//免审备注
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("撤回审批失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        toastr.success("撤回审批成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
						tc.hotel.logs.refresh();
                    }
                });*/
            },
			//紧急审批
			EmergencyApproval: function () {
				alert('撤回审批');
			/*	$.ajax({
                    url: __ctx + "/hotelorder/EmergencyApproval",
                    type: "POST",
                    data: {
                        orderNo: window.orderNo,
                    },
                    datatype: "json",
                    error: function (data) {
                        toastr.error("紧急审批失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                        toastr.success("紧急审批成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
						tc.hotel.logs.refresh();
                    }
                });*/
            },
            //生成支付链接
            hotelpay: function () {
                
	            $.ajax({
		            url: __ctx + "/hotelpay/paymsg",
		            type: "POST",
		            data: {
		            	orderNos:window.orderNo
		            },
		            datatype: "json",
		            error: function (data) {
		            	var showMessage = "生成支付链接失败";
		            	if(data.message != null && data.message != '' && data.message != undefined){
            				showMessage += ",原因：" + data.message;
            			}
		                toastr.error(showMessage, "", {timeOut: 2000, positionClass: "toast-top-center"});
		            },
		            success: function (data) {
		            	if(data.result == true){
		            		fastoperationVM.s_msgcontent = "尊敬的"+ fastoperationVM.order.bookPersonname + ",您预订的订单需要支付" + data.obj.totalFee.toFixed(2) + 
			            			"元,请点击链接: " + data.obj.payUrl + " 尽快完成支付。";
			                toastr.success("生成支付链接成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
							tc.hotel.logs.refresh();
		            	}else{
	            			var showMessage = "生成支付链接失败";
	            			if(data.message != null && data.message != '' && data.message != undefined){
	            				showMessage += ",原因：" + data.message;
	            			}
	            			toastr.error(showMessage, "", {timeOut: 2000, positionClass: "toast-top-center"});
		            	}
		            	
		            }
		            
		        });
            },
            //发送支付链接
            sendPaymentMsg: function () {
                var msgContent = fastoperationVM.s_msgcontent;
                if( msgContent == '' || msgContent == null || msgContent == undefined){
                	toastr.error("短信内容不能为空", "", {timeOut: 2000, positionClass: "toast-top-center"});
                	return;
                }
                var hotelMessageObjectDTO =  {
		                orderNo: window.orderNo,
		                messageObjectDTO:{
                            mobile: fastoperationVM.order.cellphone,
                            message: fastoperationVM.s_msgcontent
                        }
		            };
	            $.ajax({
		            url: __ctx + "/hotelorder/sendMsg",
		            type: "POST",
		            data: JSON.stringify(hotelMessageObjectDTO),
		            contentType:"application/json",
		            datatype: "json",
		            error: function (data) {
		                toastr.error("发送短信失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
		            },
		            success: function (data) {
		            	if(data.result == true){
		            		toastr.success("发送短信成功", "", {timeOut: 1000, positionClass: "toast-top-center"});
							tc.hotel.logs.refresh();
		            	}else{
		            		 toastr.error("发送短信失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
		            	}
		                
		            }
		            
		        });
            },
            //再次推送
            pushAgain: function () {
				var pushAgainDTO = {
                    orderNo: window.orderNo
				};
                $.ajax({
                    url: __ctx + "/hotelorder/pushAgain",
                    type: "POST",
                    data: JSON.stringify(pushAgainDTO),
                    contentType:"application/json",
                    datatype: "json",
                    error: function (data) {
                        toastr.error("再次推送失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                    	if (data.result && data.obj.result){
                            toastr.info("再次推送成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
						} else {
                            toastr.error("再次推送失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
						}
                        window.setTimeout(function () {
                            window.location.reload();
                        },2000);
                    }
                });
            },
            //获取酒店房型价格库存接口
            getResourceCalendar : function(startTime, endTime, productUniqueId){
                $(".input_date").eq(0).val(startTime.substring(0, startTime.indexOf(' ')));
                $(".input_date").eq(1).val(endTime.substring(0, endTime.indexOf(' ')));
                var newEndTime = new Date(endTime);            	
                var posturl="";
                var _this = this;
                if(_this.order.supplierType&&_this.order.supplierType==3){
                	posturl=__ctx +"/hotel/getAgreementResourceCalendar";
                }else{
                	posturl=__ctx +"/hotel/getResourceCalendar";
                	newEndTime.setDate(newEndTime.getDate()-1);
                }            	
            	var year = newEndTime.getFullYear();
    			var month = newEndTime.getMonth()+1;
    			var day = newEndTime.getDate();                
                $.ajax({
                    type:"POST",
                    url :posturl,
                    data :JSON.stringify({
                        "resourceId" : _this.orderMain.hotelId,
                        "resourceProductId" : _this.orderMain.roomId,
                        "startTime" : startTime,
                        "endTime" : year+"-"+month+"-"+day+" 00:00:00",
                        "productUniqueId" : productUniqueId
                    }),
                    dataType:"json",
                    async:false,
                    contentType: "application/json; charset=utf-8",
                    success: function(data){
                        if(data.result){
                            _this.resourceCountAndPriceDetails = data.obj;
                            _this.totalCost = 0;
                            _.forEach(_this.resourceCountAndPriceDetails, function(value){
                            	_this.totalCost += value.value.distributionSalePrice;
                            });
                            _this.totalCost = _this.totalCost*_this.order.roomNumber;
                            _this.priceDiff = _this.totalCost - _this.hotelDetailPriceInfo.totalRoomPrice;
                        }else{
                        	toastr.error("价格日历获取失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        	//价格日志置空
                        	_this.resourceCountAndPriceDetails = null;
                        }
                    },
                    error:function(){
                        console.log("获取酒店房型价格库存接口调用失败");
                    }
                });
            },
            //修改订单
            modifyOrder: function () {
				var modifyOrderDTO={
						resourceModifyDetailDTO:{
							orderNo:window.orderNo,
							startTime:$(".input_date").eq(0).val()+" 00:00:00",
							endTime:$(".input_date").eq(1).val()+" 00:00:00",
							resourceCountAndPriceDetails:fastoperationVM.resourceCountAndPriceDetails
						}
				};
				var deep = _.cloneDeep(modifyOrderDTO);
				_.forEach(deep.resourceModifyDetailDTO.resourceCountAndPriceDetails, function(val, index){
					delete val.value.needMinusMoney;
					delete val.value.cancelRules;
				});
                $.ajax({
                    url: __ctx + "/hotelorder/modifyOrder",
                    type: "POST",
                    data: JSON.stringify(deep),
                    contentType:"application/json",
                    datatype: "json",
                    error: function (data) {
                        toastr.error("修改订单失败", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                    	if(data.result){
                    		toastr.success("修改订单成功", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    	} else{
                    		toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    	window.setTimeout(function () {
                            window.location.reload();
                        },2000);
                    }
                });
            },
            //打开传真的页面
            openPrintPage:function(){
            	 window.open(__ctx + "/fax/viewfax?orderNo="+window.orderNo, "_blank");
            },
            //发送短信
            sendMsg: function () {
                if ($("#phoneNum").val()=="") {
                    toastr.error("请输入手机号！", "", toastrConfig);
                    return;
                }
                if (!fastoperationVM.messageOpt) {
                    toastr.error("请输入短信内容！", "", toastrConfig);
                    return;
                }
                var mobile = $("#phoneNum").val();
                var message = fastoperationVM.messageOpt;
                var receiverRole = fastoperationVM.messageReceiverList[fastoperationVM.selectedOpt].receiverRole;
                $.ajax({
                    url: __ctx + "/manualSendMsg/manualSendMsg",
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        mobile: mobile,
                        message: message,
                        productCode: 4,//国内酒店
                        receiverRole: receiverRole,
                        relateCode: window.orderNo
                    }),
                    success: function (result) {
                        if (result.result) {
                            toastr.success("手工短信发送成功", "", toastrConfig);
                            window.setTimeout(function () {
                                window.location.reload();
                            },2000);
                        }else{
                            toastr.error(result.message, "", toastrConfig);
                        }
                    }
                });
            },
            //切换手机号
            changePhoneSelected: function (phoneNum) {
                $("#phoneNum").val(phoneNum);
            },
            //获取短信接收人列表
            getReceiver:function () {
            	fastoperationVM.messageReceiverList = [];
                //1.旅客
                _.forEach(orderVM.__vue__.hotelItem, function(item){
                    _.forEach(item.hotelPassengerDTOs, function(item2){
                        var oneReceiver = {};
                        oneReceiver.receiverRole = 1;
                        oneReceiver.receiver = item2.passengerName;
                        oneReceiver.phone = item2.passengerPhone;
                        fastoperationVM.messageReceiverList.push(oneReceiver);
                    })
                });
                //2.预订人
                var oneReceiver = {};
                oneReceiver.receiverRole = 2;
                oneReceiver.receiver = (orderVM.__vue__.hotelBookPerson.bookPersonName||orderVM.__vue__.hotelBookPerson.bookPersonEnlishName);
                oneReceiver.phone = orderVM.__vue__.hotelBookPerson.bookPersonPhone;
                fastoperationVM.messageReceiverList.push(oneReceiver);
                //3.联系人
                _.forEach(orderVM.__vue__.hotelContactPerson, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 3;
                    oneReceiver.receiver = value.personName;
                    oneReceiver.phone = value.personMobile;
                    fastoperationVM.messageReceiverList.push(oneReceiver);
                });
                //4.抄送人
                _.forEach(orderVM.__vue__.hotelServicePerson, function(value){
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 4;
                    oneReceiver.receiver = value.servicePersonName;
                    oneReceiver.phone = value.servicePersonPhone;
                    fastoperationVM.messageReceiverList.push(oneReceiver);
                });
                //8.其他
                var oneReceiver = {};
                oneReceiver.receiverRole = 8;
                oneReceiver.receiver = "其他";
                oneReceiver.phone = "";
                fastoperationVM.messageReceiverList.push(oneReceiver);
            }
        }
    });
});