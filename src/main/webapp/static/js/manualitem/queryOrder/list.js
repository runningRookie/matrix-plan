var vm_list;
$(document).ready(function(){
     $('#date-end1,#date-start1').datetimepicker({
      minView: "month", // 选择日期后，不会再跳转去选择时分秒
        　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        　　language: 'zh-CN', // 汉化
        　　autoclose:true // 选择日期后自动关闭
        });
     $('#date-end2,#date-start2').datetimepicker({
       minView: "month", // 选择日期后，不会再跳转去选择时分秒
           　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
           　　language: 'zh-CN', // 汉化
           　　autoclose:true // 选择日期后自动关闭
           });
     $('#date-end4,#date-start4').datetimepicker({
       minView: "month", // 选择日期后，不会再跳转去选择时分秒
           　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
           　　language: 'zh-CN', // 汉化
           　　autoclose:true // 选择日期后自动关闭
           });
  vm_list=new Vue({
    el:"#searchForm",
    data:{
      orderInfos:[],
      refundOrderInfos:[],
      companys: [],
      orderProductTypes:[],
      refundProductTypes:[],
      orderServiceTypes:[],
      refundServiceTypes:[],
      suppliers:[],
      orderStatus:[],
       refundOrderStatus:[],
      orderSearchCondition:{
    	  orderNo:"",
    	  orderCompanyId:"",
    	  orderStatus:"",
    	  orderPassengerName:"",
    	  orderPassengerPhone:"",
    	  orderLinkPerson:"",
    	  orderLinkPersonPhone:"",
    	  orderBookPerson:"",
    	  supplier:"",
    	  orderProductType:"",
    	  orderServiceType:"",
    	  orderTakeoffStartTime:"",
    	  orderTakeoffEndTime:"",
    	  orderCreateStartTime:"",
    	  orderCreateEndTime:""
      },
      refundSearchCondition:{
    	  orderNo:"",
    	  refundOrderNo:"",
    	  refunOrderStatus:"",
    	  refundCompanyId:"",
    	  refundPassengerName:"",
    	  refundBookPerson:"",
    	  refundPerson:"",
    	  refundProductType:"",
    	  refundServiceType:"",
    	  refundCreateStartTime:"",
    	  refundCreateEndTime:""
      }
    },
    ready:function(){
    	//默认订单查询
    	$("#refundOrderForm").attr("style","display:none");
    	
    	//加载产品类型
    	this.loadProductType();
    	//加载服务类型
    	this.loadServiceType();
    	//加载供应商
    	this.loadSupplier();
    	//加载公司数据
    	this.loadCorporations();
    	//查询订单
    	this.loadOrderGridData();
    	//查询退单
    	this.loadRefundGridData();
    	this.orderStatus=[ {code:0,name:"待提交"},
    	                   {code:5,name:"待支付"},
    	                   {code:9,name:"待登账"},
    	                   {code:8,name:"已登账"},
    	                   {code:11,name:"有退单"},
    	                   {code:10,name:"已取消"}
    	                   ];
    	this.refundOrderStatus=[
    	                        {code:9,name:"待登账"},
    	                        {code:8,name:"已登账"}
    	                        ];
    },
    methods:{
    	//订单查询
      orderQueryData: function(event, pageInfo) {
    	  		//按钮样式控制
      			$("#orderResetBtn").attr("class","btn-radius div-mg-10 btn-xm-default");
      			$("#orderSearchBtn").attr("class","btn-radius div-mg-10 btn-xm-blue");
                if (pageInfo) {
                    $.extend(vm_list.orderSearchCondition, pageInfo);
                }else {
                	vm_list.orderSearchCondition.page = 1;
                	vm_list.orderSearchCondition.size = 20;
                 }
                this.loadOrderGridData(vm_list.orderSearchCondition);
         },
         //订单查询清空按钮
        btnCleanOrder: function () {
        	//按钮样式控制
        	$("#orderResetBtn").attr("class","btn-radius div-mg-10 btn-xm-blue");
        	$("#orderSearchBtn").attr("class","btn-radius div-mg-10 btn-xm-default");
            vm_list.orderSearchCondition.orderNo="";
            vm_list.orderSearchCondition.orderCompanyId="";
            vm_list.orderSearchCondition.orderStatus="";
            vm_list.orderSearchCondition.orderPassengerName="";
            vm_list.orderSearchCondition.orderPassengerPhone="";
            vm_list.orderSearchCondition.orderLinkPerson="";
            vm_list.orderSearchCondition.orderLinkPersonPhone="";
            vm_list.orderSearchCondition.orderBookPerson="";
            vm_list.orderSearchCondition.supplier="";
            vm_list.orderSearchCondition.orderProductType="";
            vm_list.orderSearchCondition.orderTakeoffStartTime="";
            vm_list.orderSearchCondition.orderTakeoffEndTime="";
            vm_list.orderSearchCondition.orderCreateStartTime="";
            vm_list.orderSearchCondition.orderCreateEndTime="";
            //加载服务类型
        	this.loadServiceType();
        	vm_list.orderSearchCondition.orderServiceType="";
        },
        //订单查询操作
        loadOrderGridData: function(param) {
            $.ajax({
            	type:"POST",
                url: __ctx + "/searchManualItem/searchOrderList",
                data: param,
                success:function(data){
                	if(data.data && data.data.length>0){
                		vm_list.orderInfos = data;
                	}else{
                		vm_list.orderInfos={};
                		if(param){
                			//如果第一次进入页面,或者是刷新页面时,param为空,以初始条件查询数据,不进行此提示
                			toastr.info("抱歉，查无结果，请调整查询条件", "", {timeOut: 2000, positionClass: "toast-top-center"});
                		}
                	}
                }
            });
        },
        
        //退单查询
        refundQueryData: function(event, pageInfo) {
        	//按钮样式控制
  			$("#refundResetBtn").attr("class","btn-radius div-mg-10 btn-xm-default");
  			$("#refundSearchBtn").attr("class","btn-radius div-mg-10 btn-xm-blue");
            if (pageInfo) {
                $.extend(vm_list.refundSearchCondition, pageInfo);
            }else {
            	vm_list.refundSearchCondition.page = 1;
            	vm_list.refundSearchCondition.size = 20;
             }
            this.loadRefundGridData(vm_list.refundSearchCondition);
	     },
	     //退单查询清空按钮
	    btnCleanRefund: function () {
	    	//按钮样式控制
  			$("#refundResetBtn").attr("class","btn-radius div-mg-10 btn-xm-blue");
  			$("#refundSearchBtn").attr("class","btn-radius div-mg-10 btn-xm-default");
	        vm_list.refundSearchCondition.orderNo="";
	        vm_list.refundSearchCondition.refundOrderNo="";
	        vm_list.refundSearchCondition.refunOrderStatus="";
	        vm_list.refundSearchCondition.refundCompanyId="";
	        vm_list.refundSearchCondition.refundPassengerName="";
	        vm_list.refundSearchCondition.refundBookPerson="";
	        vm_list.refundSearchCondition.refundPerson="";
	        vm_list.refundSearchCondition.refundProductType="";
	        vm_list.refundSearchCondition.refundCreateStartTime="";
	        vm_list.refundSearchCondition.refundCreateEndTime="";
	      //加载服务类型
	    	this.loadServiceType();
	    	vm_list.refundSearchCondition.refundServiceType="";
	    	
	    },
	    //退单查询操作
	    loadRefundGridData: function(param) {
	        $.ajax({
	        	type:"POST",
	            url: __ctx + "/searchManualItem/searchRefundList",
	            data: param,
	            success:function(data){
	            	if(data.data && data.data.length>0){
	            		vm_list.refundOrderInfos = data;
	            	}else{
	            		vm_list.refundOrderInfos={};
	            		//如果第一次进入页面,或者是刷新页面时,param为空,以初始条件查询数据,不进行此提示
	            		if(param){
	            			toastr.info("抱歉，查无结果，请调整查询条件", "", {timeOut: 2000, positionClass: "toast-top-center"});
	            		}
	            	}
	            }
	        });
	    },
	    
	    //订单查询按钮点击时
	    queryOrderButton:function(){
	    	$("#refundOrderForm").attr("style","display:none");
	    	$("#orderForm").attr("style","display:block");
	    	$("#queryOrderButton").attr("class","J-tab btn-xm-blue");
	    	$("#queryRefundButton").attr("class","J-tab btn-xm-default");
	    },
	    //退单查询按钮点击时
	    queryRefundButton:function(){
	    	$("#orderForm").attr("style","display:none");
	    	$("#refundOrderForm").attr("style","display:block");
	    	$("#queryRefundButton").attr("class","J-tab btn-xm-blue");
	    	$("#queryOrderButton").attr("class","J-tab btn-xm-default");
	    },
	    //产品类型查询
	    loadProductType:function(){
	    	$.ajax({
	        	type:"POST",
	            url: __ctx + "/searchManualItem/findProductTypes",
	            success:function(data){
	                vm_list.orderProductTypes = data;
	                vm_list.refundProductTypes = data;
	            }
	        });
	    },
	    //服务类型查询
	    loadServiceType:function(param){
	    	var code="";
	    	if(param == "order"){
	    		code=vm_list.orderSearchCondition.orderProductType;
	    	}
	    	if(param == "refund"){
	    		code=vm_list.refundSearchCondition.refundProductType;
	    	}
	    	$.ajax({
	        	type:"POST",
	            url: __ctx + "/searchManualItem/findServiceTypes",
	            data:{"code":code},
	            success:function(data){
	            	if(!param){
	            		vm_list.orderServiceTypes = data;
	            		vm_list.refundServiceTypes = data;
	            	}
	            	if(param == "order"){
	            		vm_list.orderServiceTypes = data;
	            	}
	            	if(param == "refund"){
	            		vm_list.refundServiceTypes = data;
	            	}
	            }
	        });
	    },
	    //供应商查询
	    loadSupplier:function(){
	    	$.ajax({
	        	type:"POST",
	            url: __ctx + "/searchManualItem/findSuppliers",
	            data:{"tmcId":tmcId},
	            success:function(data){
	            	vm_list.suppliers=data;
	            }
	        });
	    },
	    
	    //加载公司数据
	    loadCorporations:function(){
	    	$.ajax({
                url: __ctx + "/resource/companys",
                type: "POST",
                datatype: "json",
                error: function (data1) {
                    toastr.error("请先选择公司！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                },
                success: function (data) {
                	vm_list.companys = data;
                }
            });
	    }
    }
  });
  vm_list.$watch('orderSearchCondition.orderProductType', function (val) {
      if (val == "") {
    	  vm_list.loadServiceType("");
      }else{
    	  vm_list.loadServiceType("order");
      }
      
  });
  vm_list.$watch('refundSearchCondition.refundProductType', function (val) {
      if (val == "") {
    	  vm_list.loadServiceType('');
      }else{
    	  vm_list.loadServiceType('refund');
      }
  });
});