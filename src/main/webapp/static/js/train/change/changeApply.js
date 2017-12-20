/*
 * LY.com Inc.
 * Copyright (c) 2004-2016 All Rights Reserved.
 */
var vue_change;
$(document).ready(function () {

	vue_change = new Vue({
        el: '#changeApply',
        data: {
            order: {},
            showChangeItem: false,
			priceDiff: "",
			queryKey: "",
			newValues: {},
            errorMessage:''
        },
        ready: function () {
            this.loadData();
			$("#dialog-cancel").on("click", function () {
                sessionStorage.clear();
				window.history.go(-1);
            });
			$("#applySuccess").on("click", function () {
                window.location.href = __ctx + "/train/change/detail?orderNo=" + sessionStorage.newOrderNo;
				sessionStorage.clear();
            });
        },
        methods: {
            loadData: function () {
                $.ajax({
                    url: __ctx + "/train/refund/apply/detail?itemId=" + window.itemId+"&flag=",
                    type: "GET",
                    datatype: "json",
                    success: function (result) {
                        if (result.result && result.obj) {
                        	vue_change.order = result.obj;

							if (sessionStorage.queryDate != undefined) {
								vue_change.newValues = JSON.parse(sessionStorage.queryDate);
								sessionStorage.clear();
								vue_change.showChangeItem = true;
                                $("#dialog-submit").removeAttr("style");
								vue_change.queryKey = vue_change.newValues.queryKey;
								vue_change.priceDiff = new BigDecimal(vue_change.newValues.price.toString()).subtract(new BigDecimal(vue_change.order.ticket.ticketPriceReal.toString()));
							}
                        } else {
                            toastr.error(result.message, "", toastrConfig);
							setTimeout(function () {
								window.history.go(-1);
							}, 2000);
                        }
                    },
                    error: function (result) {
                        toastr.error("获取数据失败", "", toastrConfig);
						setTimeout(function () {
							window.history.go(-1);
						}, 2000);
                    }
                })
            },
			queryTrainNo:function(orderNo){
				$.ajax({
                    url: __ctx + "/train/change/validateChange",
                    type: "POST",
					contentType: "application/json;charset=utf-8",
					data: JSON.stringify({
						// orderNo: orderNo,
						orderNo: vue_change.order.orderDetail.outOrderNo,
						// passengerId: window.passengerId
						passengerId: vue_change.order.passenger.outPassengerId
					}),
                    datatype: "json",
                    success: function (result) {
                        if (result.result) {
                        	var param = {
                                trainNo : vue_change.order.orderDetail.trainNo,
                                planBeginDate : vue_change.order.orderDetail.planBeginDate,
                                seatClass : vue_change.order.ticket.seatClass
							};
                            sessionStorage.param = JSON.stringify(param);
                            sessionStorage.planBeginDate = vue_change.order.orderDetail.planBeginDate;
                            sessionStorage.fromCity = vue_change.order.orderDetail.fromCity;
                            sessionStorage.fromStation = vue_change.order.orderDetail.fromStation;
                            sessionStorage.toCity = vue_change.order.orderDetail.toCity;
                            sessionStorage.toStation = vue_change.order.orderDetail.toStation;
                            sessionStorage.passenger = JSON.stringify(vue_change.order.passenger);
                            sessionStorage.itemId = vue_change.order.orderItem.id;
                        	window.location.href = __ctx + "/train/change/ticketQuery";
                        } else {
                            toastr.error("当前旅客改签验证不通过，无法办理改签", "", toastrConfig);
                        }
                    },
                    error: function (result) {
                        toastr.error("改签验证失败", "", toastrConfig);
                    }
                })
            },
            submitChange:function() {
            	var reg_Fee = /^\d+(\.\d+)?$/;
				var trimStr = $.trim(vue_change.order.serviceFee);
				if (trimStr === "" || !reg_Fee.test(trimStr)) {
                    toastr.error("服务费为空或格式不正确", null, {
                        timeOut: 3000,
                        positionClass: "toast-top-center"
                    });
				} else if (trimStr.indexOf(".") != -1 && trimStr.split(".")[1].length > 1) {
					toastr.error("服务费只允许1位小数", null, {
						timeOut: 3000,
						positionClass: "toast-top-center"
					});
                } else {
                	$.ajax({
                		url: __ctx + "/train/change/submitChange",
                		type: "POST",
                		contentType: "application/json;charset=utf-8",
                		data: JSON.stringify({
                			tmcId: this.order.orderItem.tmcId,
                			orderNo: "",
                			outOrderNo: this.order.orderDetail.outOrderNo,
                			itineraryNo: this.order.orderMain.itineraryNo,
                			originOrderNo: this.order.orderItem.orderNo,
                			originItemId: this.order.orderItem.id,
                			paymentType: this.order.orderMain.paymentType,
                			fromCity: this.newValues.fromCityName,
                			fromStation: this.newValues.fromStation,
                			toStation: this.newValues.toStation,
                			toCity: this.newValues.toCityName,
                			fromStationCode: this.newValues.fromStationCode,
                			toStationCode: this.newValues.toStationCode,
                			planBeginDate: new Date(this.newValues.trainBeginDate),
                			planEndDate: new Date(this.newValues.trainEndDate),
                			trainNo: this.newValues.trainNo,
                            trainClass: this.newValues.trainClass,
                			ticketPrice: this.newValues.price,
                			queryKey: this.newValues.queryKey,
                			seatClass: this.newValues.seatClass,
                			serviceFee: $.trim(this.order.serviceFee),
                			passengerId: this.newValues.trainReservedPassengerDTO.outPassengerId,
                            channelFrom: 5,
                            //todo 预定方式需要修改
                            bookType: 1
                		}),
                		datatype: "json",
                		success: function (result) {
                			sessionStorage.clear();
                			if (result.result) {
                				if (result.obj) {
                					sessionStorage.newOrderNo = result.obj;
                				}
                				$("#formModal").modal({
            						show : true,
            						backdrop : 'static',
            						remote : __ctx + "/train/change/applySuccess"
            					});
                			} else {
                                if (result.errorCode == "LY0522012119") {
                                    $("#createOrderError").modal('show');
                                    vue_change.errorMessage = result.message;
                                } else {
                                    toastr.error("申请改签失败","原因：" + result.message, toastrConfig);
                                }
                			}
                		},
                		error: function (result) {
                			sessionStorage.clear();
                			toastr.error("申请改签异常", "", toastrConfig);
                		}
                	})
                }
            }
        }
    });

});
