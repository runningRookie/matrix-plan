var refundApplyVM;
$(document).ready(function () {

    tc.ns('tc.flight.refund.apply', function (applyFunc) {

        refundApplyVM = new Vue({
            el: '#refundApplyVM',
            data: {
                refundApply:{
                	ticketAccountDtoList:[]
                },
                bookPerson:{},
                ticketAccount: '',
                servicePeoples: [],
                contactPersons: [],
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
                var data = {refundApplyNo: window.refundApplyNo};
                $.getJSON(__ctx + "/flights/getRefundApplyInfo", data, function (result) {
                    
                    if(!result.result){
                        toastr.error(result.message,"", {timeOut: 1000, positionClass: "toast-top-center"});
                    }
                    if (!result.obj) {
                        window.location.href = __ctx+"/common/pageNotFound";
                    }else{
                        applyFunc && applyFunc(result.obj);
                        refundApplyVM.refundApply = result.obj;
                        window.orderNo = result.obj.orderNo;

                        var data1 = {orderNo: window.orderNo};
                        $.getJSON(__ctx + "/negativeprofits/serachservicepeople", data1, function (result) {
                        	refundApplyVM.servicePeoples = result.obj;
                        });

                        $.getJSON(__ctx + "/negativeprofits/serachcontactperson", data1, function (result) {
                        	refundApplyVM.contactPersons = result.obj;
                        });

                    }
     
                });

                $.getJSON(__ctx + "/flights/getBookPersonByApplyNo", data, function (result) {
                    refundApplyVM.bookPerson = result.obj;
                });

            },
            methods:{
            	manualAccount:function(ticketNo, orderNo, applyNo){
                    $.ajax({
                    	url: __ctx + "/refundTicket/manualAccountSync/"+ticketNo+"/"+orderNo+"/"+applyNo,
                        type : "POST",
                        data:{
                        	ticketNo:ticketNo,
                        	orderNo:orderNo,
                        	applyNo:applyNo
                        },
                        datatype:"json",
                        error:function(data){
                            toastr.error("手工登账失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success:function(data){
                            if(data.result){
                            	toastr.info("手工登账成功!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                            }else{
                                toastr.error(data.message,"", {timeOut: 1000, positionClass: "toast-top-center"});
                            }
                            var data = {refundApplyNo: window.refundApplyNo};
                            $.getJSON(__ctx + "/flights/getRefundApplyInfo", data, function (result) {
                                applyFunc && applyFunc(result.obj);
                                refundApplyVM.refundApply = result.obj;
                                window.orderNo = result.obj.orderNo;
                                if(!result.result){
                                	toastr.error(result.message,"", {timeOut: 1000, positionClass: "toast-top-center"});
                                }
                            });
                        }
                    });
            	},
            	toValidate:function(billNo){
                	var href = refundApplyVM.refundApply.billsCancelUrl + billNo;
                    window.open(href);
            	},
            	financeNote: function (ticketAccount) {
                    this.ticketAccount = ticketAccount;
                    $("#formModal").modal({
                        show: true,
                        remote: __ctx + "/orderdetails/toFinanceNote",
                        backdrop: 'static',
                    })
                },
                //发送短信
                sendMsg: function () {
                    if ($("#phoneNum").val()=="") {
                        toastr.error("请输入手机号！", "", toastrConfig);
                        return;
                    }
                    if (!refundApplyVM.messageOpt) {
                        toastr.error("请输入短信内容！", "", toastrConfig);
                        return;
                    }
                    var mobile = $("#phoneNum").val();
                    var message = refundApplyVM.messageOpt;
                    var receiverRole = refundApplyVM.messageReceiverList[refundApplyVM.selectedOpt].receiverRole;
                    $.ajax({
                        url: __ctx + "/manualSendMsg/manualSendMsg",
                        type: "POST",
                        contentType: "application/json;charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify({
                            mobile: mobile,
                            message: message,
                            productCode: 1,//国内机票
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
                    refundApplyVM.messageReceiverList = [];
                    //1.旅客
                    _.forEach(flightVM.__vue__.passengers, function(value){
                        var oneReceiver = {};
                        oneReceiver.receiverRole = 1;
                        oneReceiver.receiver = value.passenger.passengerName;
                        oneReceiver.phone = value.passenger.passengerPhone;
                        refundApplyVM.messageReceiverList.push(oneReceiver);
                    });
                    //2.预订人
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 2;
                    oneReceiver.receiver = refundApplyVM.bookPerson.bookPersonName;
                    oneReceiver.phone = refundApplyVM.bookPerson.bookPersonPhone;
                    refundApplyVM.messageReceiverList.push(oneReceiver);
                    //3.联系人
                    _.forEach(refundApplyVM.contactPersons, function(value){
                        var oneReceiver = {};
                        oneReceiver.receiverRole = 3;
                        oneReceiver.receiver = value.personName;
                        oneReceiver.phone = value.personMobile;
                        refundApplyVM.messageReceiverList.push(oneReceiver);
                    });
                    //4.抄送人
                    _.forEach(refundApplyVM.servicePeoples, function(value){
                        var oneReceiver = {};
                        oneReceiver.receiverRole = 4;
                        oneReceiver.receiver = value.servicePersonName;
                        oneReceiver.phone = value.servicePersonPhone;
                        refundApplyVM.messageReceiverList.push(oneReceiver);
                    });
                    //8.其他
                    var oneReceiver = {};
                    oneReceiver.receiverRole = 8;
                    oneReceiver.receiver = "其他";
                    oneReceiver.phone = "";
                    refundApplyVM.messageReceiverList.push(oneReceiver);
                }
            }
        });

    });    

    

});