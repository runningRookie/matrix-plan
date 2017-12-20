var refund_vue;
$(document).ready(function(){
	//空白符
    Vue.filter('toBlank', {
        read: function (value) {
            if (!value || value == '' || value == null ) {
                return '--';
            }
            return value;
        }
    });
	//日期时间过滤器
    Vue.filter('toDate', {
        read: function (value, format) {
            if (value == '' || value == null || value == '631123200000' || value == '1990-01-01 00:00:00') {
                return '';
            }
            return moment(value).format(format);
        }
    });
    //状态
    Vue.filter('toStatus', {
        read: function (value) {
            if (value == '' || value == null) {
                return '';
            }
            if(value == '0') return "待提交";
            if(value == '5') return "待支付";
            if(value == '8') return "已登账";
            if(value == '9') return "待登账";
            if(value == '10') return "已取消";
            if(value == '11') return "有退单";
            if(value == '99') return "审核不通过";
            return "";
        }
    });
    //结算方式
    Vue.filter('toSettlementMethod', {
        read: function (value) {
            if (value == '' || value == null) {
                return '';
            }
            if(value == 'n') return "现结退款";
            if(value == 'm') return "额度返还";
            return "";
        }
    });
    //支付方式
    Vue.filter('toPaymentStatus', {
    	read: function (value) {
    		if (value == '' || value == null) {
    			return '';
    		}
    		if(value == '1') return "未退款";
    		if(value == '3') return "已退款";
    		if(value == '4') return "退款失败";
    		if(value == '5') return "交易关闭";
    		if(value == '6') return "交易超时到期";
    		return "";
    	}
    });
    //保留两位小数
    Vue.filter('toFixed2', {
        read: function (value) {
            if (!value || value == '' || value == null ) {
                return 0;
            }
            return _.round(parseFloat(value), 2);
        }
    });
	refund_vue=new Vue({
    el:"#refundForm",
    data:{
    	//查询结果
    	infos:{},
    	param:{
    		cancelReason:"",
    		refundOrderNo:refundOrderNo,
    		cancelReasonDesc:""
    	},
    	msgParam:{
    		refundOrderNo:"",
    		phone:"",
    		content:""
    	},
    	financeUrl:window.location.host + '/finance/bussinessbillsdetail/billsdetail-op',
        logContent:""
    },
    ready:function(){
    	//加载退单详情
    	this.loadRefundDetail();
    },
    methods:{
    	//加载基础数据
    	loadRefundDetail:function (){
    		$.ajax({
            	type:"POST",
                url: __ctx + "/refundManualItem/getRefundDetail",
                data: {"refundOrderNo":refundOrderNo},
                success:function(result){
                	if(result.success){
                		refund_vue.infos = result.data;
                		$("#sendMsgBtn").attr("disabled",false);
            			//$("#cancelRefund").attr("disabled",false);
                		//如果退单已取消,则取消退单和发送短信按钮置灰,不可用
                		if(result.data.manualItemsRefundDTO.cancelOrderStatus=="10" || result.data.manualItemsRefundDTO.cancelOrderStatus=="99"){
                			$("#sendMsgBtn").attr("disabled",true);
                			//$("#cancelRefund").attr("disabled",true);
                		}
                		//已登账状态下,不可取消退单,退款请求发送成功,不可取消退单,因为一旦允许取消,退款流程会出现问题,
                		if(result.data.manualItemsRefundDTO.cancelOrderStatus=="8" || result.data.manualItemsRefundDTO.paymentStatus =="3"){
                			//$("#cancelRefund").attr("disabled",true);
                		}
                		
                		//用于控制备注的行数
                		var innerRemarkText=result.data.manualItemsRefundDTO.innerRemark;
                		if(innerRemarkText && innerRemarkText.indexOf("\n") > 0){
                			innerRemarkRows=innerRemarkText.split("\n");
                			$("#innerRemarkTextarea").attr("rows",innerRemarkRows.length);
                		}
                		var outerRemarkText=result.data.manualItemsRefundDTO.outerRemark;
                		if(outerRemarkText && outerRemarkText.indexOf("\n") > 0){
                			outerRemarkRows=outerRemarkText.split("\n");
                			$("#outerRemarkTextarea").attr("rows",outerRemarkRows.length);
                		}
                		//联系人手机
                		refund_vue.msgParam.phone=result.data.manualItemsRefundDTO.bookPersonPhone;
                	}                	
                }
            });
    	},
    	//取消退单按钮
    	cancelRefundConfirm:function (){
    		 $("#confirmCancel").modal({
                 show: true,
                 backdrop: 'static'
             });
    	},
    	//发送短信按钮
    	sendMsgConfirm:function (){
    		 $("#sendMsgModel").modal({
                 show: true,
                 backdrop: 'static'
             });
    	},
    	//确认取消
    	cancelRefund: function () {
    		if(refund_vue.infos.manualItemsRefundDTO.paymentStatus && refund_vue.infos.manualItemsRefundDTO.paymentStatus ==3){
    			toastr.error("","该退单是已退款状态,不能取消!", {timeOut: 2000, positionClass: "toast-top-center"});
    			return;
    		}
    		$.ajax({
            	type:"POST",
                url: __ctx + "/refundManualItem/cancelRefund",
                data: refund_vue.param,
                success:function(result){
                	if(result.success){
                		toastr.info("", "取消退单成功!",{timeOut: 3000, positionClass: "toast-top-center",onHidden:function(){refund_vue.loadRefundDetail()}});
                	}else{
                		toastr.error(result.errorMessage, "取消退单失败!",{timeOut: 2000, positionClass: "toast-top-center"});
                	}
                }
            });
         },
         //发送短信
         sendMsg:function (){
        	 refund_vue.msgParam.refundOrderNo=refundOrderNo;
        	 if(!refund_vue.msgParam.phone || refund_vue.msgParam.phone==""){
        		 toastr.error("","请输入预订人联系手机!", {timeOut: 2000, positionClass: "toast-top-center"});
        		 return;
        	 }
        	 if(!refund_vue.msgParam.content || refund_vue.msgParam.content==""){
        		 toastr.error("","请输入短信内容!", {timeOut: 2000, positionClass: "toast-top-center"});
        		 return;
        	 }
        	 $.ajax({
             	type:"POST",
                 url: __ctx + "/refundManualItem/sendMsg",
                 data: refund_vue.msgParam,
                 success:function(result){
                 	if(result.success){
                 		toastr.info("发送短信成功!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                 	}else{
                 		toastr.error(result.errorMessage,"发送短信失败!", {timeOut: 2000, positionClass: "toast-top-center"});
                 	}
                 }
             });
    	},
    	//下载文件
    	downloadFile:function(){
    		if(!refund_vue.infos.manualItemsRefundDTO.attachmentFileKey){
    			toastr.warning("没有附件可下载!", "",{timeOut: 2000, positionClass: "toast-top-center"});
    			return;
    		}
    		window.open(__ctx+"/file/download?fileKey="+refund_vue.infos.manualItemsRefundDTO.attachmentFileKey+"&fileName="+refund_vue.infos.manualItemsRefundDTO.attachmentFileName);
    	},
    	//重新登账
    	createBill:function(){
    		if(refund_vue.infos.manualItemsRefundDTO.cancelOrderStatus == "10"){
    			toastr.error("","该退单已经取消,不能重新登账!", {timeOut: 2000, positionClass: "toast-top-center"});
    			return;
    		}
            if(refund_vue.infos.manualItemsRefundDTO.cancelOrderStatus == "99"){
                toastr.error("","该退单已经审核不通过,不能重新登账!", {timeOut: 2000, positionClass: "toast-top-center"});
                return;
            }
    		if(refund_vue.infos.manualItemsRefundDTO.cancelOrderStatus !="9"){
    			toastr.error("","该退单不是[待登账],不能重新登账!", {timeOut: 2000, positionClass: "toast-top-center"});
    			return;
    		}
    		 $.ajax({
              	type:"POST",
                  url: __ctx + "/refundManualItem/createBill",
                  data: {"refundOrderNo":refundOrderNo},
                  success:function(result){
                  	if(result.success){
                  		toastr.info("重新登账成功!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                  		//刷新信息
                  		refund_vue.loadRefundDetail();
                  	}else{
                  		toastr.error(result.errorMessage,"重新登账失败!", {timeOut: 2000, positionClass: "toast-top-center"});
                  	}
                  }
              });
    	},
    	//作废登账
    	billsVoided:function(){
    		if(refund_vue.infos.manualItemsRefundDTO.cancelOrderStatus=="10"){
    			toastr.error("","该退单已经取消,不能作废登账!", {timeOut: 2000, positionClass: "toast-top-center"});
    			return;
    		}
    		if(refund_vue.infos.manualItemsRefundDTO.cancelOrderStatus !="8"){
    			toastr.error("","该退单不是[已登账],不能作废登账!", {timeOut: 2000, positionClass: "toast-top-center"});
    			return;
    		}
   		 	$.ajax({
             	type:"POST",
                 url: __ctx + "/refundManualItem/billsVoided",
                 data: {"refundOrderNo":refundOrderNo},
                 success:function(result){
                 	if(result.success){
                 		toastr.info("作废登账成功!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                 		//刷新信息
                  		refund_vue.loadRefundDetail();
                 	}else{
                 		toastr.error(result.errorMessage,"作废登账失败!", {timeOut: 2000, positionClass: "toast-top-center"});
                 	}
                 }
             });
    	},
    	//打开登账备注弹框
        openBillRemark:function (){
    		if(refund_vue.infos.manualItemsRefundBillDTO.billStatus != '1'){
                toastr.error("","账单未登账,请先进行登账!", {timeOut: 2000, positionClass: "toast-top-center"});
                return;
			}
            $("#billRemark").modal({
                show: true,
                backdrop: 'static'
            });
		},
        updateBillRemark:function(){
            if(refund_vue.infos.manualItemsRefundBillDTO.billNo==""){
                toastr.error("","账单号为空!", {timeOut: 2000, positionClass: "toast-top-center"});
                return;
            }
            if(refund_vue.infos.manualItemsRefundBillDTO.remark==""){
                toastr.error("","请填写账单备注!", {timeOut: 2000, positionClass: "toast-top-center"});
                return;
            }
            $.ajax({
                type:"POST",
                url: __ctx + "/refundManualItem/updateRefundBillRemark",
                data: {"billNo":refund_vue.infos.manualItemsRefundBillDTO.billNo,"remark":refund_vue.infos.manualItemsRefundBillDTO.remark},
                success:function(result){
                    if(result.success){
                        toastr.info("更新账单备注成功!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        //刷新信息
                        refund_vue.loadRefundDetail();
                    }else{
                        toastr.error(result.errorMessage,"", {timeOut: 2000, positionClass: "toast-top-center"});
                    }
                }
            });
		},
        //添加订单日志
        addOrderLog:function(){
            if(refund_vue.logContent == ""){
                toastr.error("","请输入内部备注!", {timeOut: 2000, positionClass: "toast-top-center"});
                return;
            }
            $.ajax({
                type:"POST",
                url: __ctx + "/manualOrder/saveOrderLog",
                data: {"orderNo":refund_vue.infos.manualItemsRefundDTO.originalOrderNo,"content":refund_vue.logContent},
                success:function(result){
                    if(result.success){
                        toastr.info("添加订单日志成功!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        //刷新信息
                        refund_vue.logContent="";
                        refund_vue.loadRefundDetail();
                    }else{
                        toastr.error(result.errorMessage,"", {timeOut: 2000, positionClass: "toast-top-center"});
                    }
                }
            });
        }
    }
  });
});