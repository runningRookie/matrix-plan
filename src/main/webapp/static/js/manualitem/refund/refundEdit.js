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
    
  //保留两位小数
    Vue.filter('toFixed2', {
        read: function (value) {
            if (!value || value == '' || value == null ) {
                return 0;
            }
            return _.round(parseFloat(value), 2);
        }
    });
    
    
    //处理乘客姓名
    Vue.filter('passengerNameFilter', {
        read: function ([passengerName, passengerEnlishName]) {
            if (passengerName) {
                return passengerName;
            }

            return passengerEnlishName;
        }
    });
    
    
	refund_vue=new Vue({
    el:"#refundEditForm",
    data:{
    	//查询结果
    	infos:{},
    	//提交参数
    	param:{
    		refundAmount:0,
    		orderNo:orderNo,
    		cancelOrderType:"1",
    		passengers:"",
    		refundAmount:0.00,
    		passengerRefundSumFee:0.00,
    		refundFee:0.00,
    		chargeFee:0.00,
    		adjustmentFee:0.00,
    		serviceFee:0.00,
    		attachmentUrl:"",
    		attachmentName:"请选择文件...",
    		attachmentKey:""
    	},
    	tempPassengers:[]
    	
    },
    ready:function(){
    	//加载订单详情
    	this.loadOrderDetail();
    },
    methods:{
    	//加载基础数据
    	loadOrderDetail:function (){
    		$.ajax({
            	type:"POST",
                url: __ctx + "/refundManualItem/getOrderDetail",
                data: {"orderNo":orderNo},
                success:function(result){
                	if(result.success){
                		refund_vue.infos = result.data;
                		//如果订单状态是已登账/有退单,并且可退数量大于0,方可提交退单
                		if(result.data.manualItemOrderDTO && (result.data.manualItemOrderDTO.orderStatus=="8"||( result.data.manualItemOrderDTO.orderStatus == "11") && parseInt(result.data.refundProductInfoDTO.amount) > 0)){
                			$("#refundButton").attr("disabled",false);
                		}else{
                			$("#refundButton").attr("disabled",true);
                		}
                	}else{
                		toastr.info("未查询到订单信息!", "",{timeOut: 3000, positionClass: "toast-top-center"});
                	}
                }
            });
    	},
    	//提交退单按钮
    	refundOrderConfirm:function(){
    		 $("#confirmRefund").modal({
                 show: true,
                 backdrop: 'static'
             });
    	},
    	//确认提交
    	refundOrder:function(){
    		if(!refund_vue.tempPassengers || refund_vue.tempPassengers.length == 0){
    			toastr.error("请选择乘客!", "",{timeOut: 2000, positionClass: "toast-top-center"});
    			return;
    		}
    		var tempPassenger="";
    		for(var i=0;i<refund_vue.tempPassengers.length;i++){
    			tempPassenger+=refund_vue.tempPassengers[i];
    			tempPassenger+=",";
    		}
    		refund_vue.param.passengers=tempPassenger;
    		
    		//
    		if(parseFloat(refund_vue.param.refundFee)+parseFloat(refund_vue.param.chargeFee)+parseFloat(refund_vue.param.adjustmentFee)+parseFloat(refund_vue.param.serviceFee)<0){
    			toastr.error("","产品退单费用、退单手续费、调整项、服务费之和不能小于0!",{timeOut: 3000, positionClass: "toast-top-center"});
    			return;
    		}
    		
    		$.ajax({
            	type:"POST",
                url: __ctx + "/refundManualItem/saveRefundInfo",
                data: refund_vue.param,
                success:function(result){
                	if(result.success){
                		//跳转订单详情
                		toastr.info("","提交退单成功!",{timeOut: 2000, positionClass: "toast-top-center",onHidden:function(){window.location.href=__ctx+"/refundManualItem/gotoRefundDetail/"+result.data;}});
                		
                	}else{
                		toastr.error(result.errorMessage,"提交退单失败!",{timeOut: 3000, positionClass: "toast-top-center"});
                	}
                }
            });
    	},
    	//上传文件
    	uploadFile: function(){
    		tc.utils.fileUpload(function (result) {
    			refund_vue.param.attachmentUrl=result.fileUrl;
    			refund_vue.param.attachmentName=result.fileName;
    			refund_vue.param.attachmentKey=result.fileKey;
            })
    	},
    	//计算金额
    	calculateFee: function(){
    		if($.trim(refund_vue.param.refundFee)!="" && $.trim(refund_vue.param.chargeFee)!=""
    				&& $.trim(refund_vue.param.adjustmentFee)!=""	&& $.trim(refund_vue.param.serviceFee)!=""){
    			refund_vue.param.refundFee=_.round(parseFloat(refund_vue.param.refundFee), 2);
    			refund_vue.param.chargeFee=_.round(parseFloat(refund_vue.param.chargeFee), 2);
    			refund_vue.param.adjustmentFee=_.round(parseFloat(refund_vue.param.adjustmentFee), 2);
    			refund_vue.param.serviceFee=_.round(parseFloat(refund_vue.param.serviceFee), 2);
    			refund_vue.param.passengerRefundSumFee=refund_vue.param.orderSalesPrice-refund_vue.param.refundFee-refund_vue.param.chargeFee-refund_vue.param.adjustmentFee-refund_vue.param.serviceFee;
    			if(refund_vue.param.passengerRefundSumFee<0){
    				refund_vue.param.passengerRefundSumFee=0.00;
    			}else{
    				refund_vue.param.passengerRefundSumFee=_.round(refund_vue.param.passengerRefundSumFee, 2);
    			}
    		}
    	},
    	//展开所有的退单信息
    	showAllRefund : function() {
    		if(refund_vue.infos.manualItemRefundDTOs && refund_vue.infos.manualItemRefundDTOs.length>1){
    			$("#closeAllRefundBtn").removeAttr("style","display: none");
    			$("#showAllRefundBtn").attr("style","display: none");
    			for(i in refund_vue.infos.manualItemRefundDTOs){
    				$("#refundTable"+(parseInt(i)+1)).attr("style","margin-top: 10px;width: 98%");
    			}
    		}
    	},
    	//收起
    	closeAllRefund : function (){
    		if(refund_vue.infos.manualItemRefundDTOs && refund_vue.infos.manualItemRefundDTOs.length>1){
    			$("#showAllRefundBtn").removeAttr("style","display: none");
    			$("#closeAllRefundBtn").attr("style","display: none");
    			for(i in refund_vue.infos.manualItemRefundDTOs){
    				$("#refundTable"+(parseInt(i)+1)).attr("style","margin-top: 10px;display: none;width: 98%");
    			}
    		}
    	},
    	//移除文件
    	removeFile : function (){
    		refund_vue.param.attachmentUrl="";
			refund_vue.param.attachmentName="请选择文件...";
			refund_vue.param.attachmentKey="";
    	}
    }
  });
	refund_vue.$watch('param.orderSalesPrice', function (val) {
	      if (val == "") {
	    	  return;
	      }else{
	    	  refund_vue.calculateFee();
	      }
	  });
});