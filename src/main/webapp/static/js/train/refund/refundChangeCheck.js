/*
 * LY.com Inc.
 * Copyright (c) 2004-2016 All Rights Reserved.
 */
var vue_change;
$(document).ready(function () {
	vue_change = new Vue({
        el: '#refundChangeCheck',
        data: {
            order: vue_changerefund.order,
			checkButton : true
        },
        ready: function () {
            $("input[type='checkbox']").click(function(){
				var len = $("input[type='checkbox']:checked").length;
				if(len==4) {
					vue_change.checkButton = false;
					$('#check-submit').attr('disabled',"false");
                    $("#check-submit").removeAttr("style");
				} else {
					vue_change.checkButton = true;
					$('#check-submit').attr('disabled',"true");
                    $("#check-submit").attr('style', 'background-color : #ccc');
				}	
			});
        },
		methods: {
			submitRefund: function () {
				$('#check-submit').attr("disabled",true);
                $("#check-submit").attr('style', 'background-color : #ccc');
				$.ajax({
					url: __ctx + "/train/refund/apply/submit",
					type: "POST",
					contentType: "application/json;charset=utf-8",
					data: JSON.stringify({
						id: this.order.orderItem.id,
						tmcId: this.order.orderItem.tmcId,
						orderNo: this.order.orderItem.orderNo,
						trainPassengerId: this.order.orderItem.trainPassengerId,
						itemType: this.order.orderItem.itemType,
						ticketStatus: this.order.orderItem.ticketStatus,
						trainPassengerId: this.order.orderItem.trainPassengerId,
						passengerTicketNo: this.order.ticket.passengerTicketNo,
						passengerName: this.order.passenger.passengerName,
						ticketPrice: this.order.ticket.ticketPriceReal,
						refundRate: this.order.refundRate,
						refundFee: this.order.refundFee,
						refundAmount: this.order.refundFee,
						serviceCharge: $.trim(this.order.serviceFee),
						outPassengerId: this.order.passenger.outPassengerId,
						outOrderNo: this.order.orderDetail.outOrderNo
					}),
					dataType: "json",
					success: function (result) {
						if (result.result) {
							toastr.success(result.message, "", {
								timeOut: 3000,
								positionClass: "toast-top-center"
							});
							setTimeout(function () {
								location.replace(document.referrer);
								document.referrer;
							}, 2000);
						} else {
							$('#check-submit').removeAttr("disabled");
                            $("#check-submit").removeAttr("style");
							toastr.error(result.message, "", {
								timeOut: 3000,
								positionClass: "toast-top-center"
							})
						}
					},
					error: function (result) {
						$('#check-submit').removeAttr("disabled");
                        $("#check-submit").removeAttr("style");
						toastr.error("获取数据失败", "", toastrConfig);
					}
				})
			},
		}
    });
})
