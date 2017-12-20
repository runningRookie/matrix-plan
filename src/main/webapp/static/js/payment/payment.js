$(document).ready(function () {
	//设置单独支付tab选中
	if(window.type=='singlePay'){
		$('#singlePay').tab('show');	
		$("#togetherPay").css("background-color","#9D9D9D");
		$("#togetherPay").css("color","#FFFFFF");
	}else if(window.type=='togetherPay'){
		$('#togetherPay').tab('show');	
		$("#singlePay").css("background-color","#9D9D9D");
		$("#singlePay").css("color","#FFFFFF");
	}
    var vm_payment_list = new Vue({
        el: '#paymentVM',
        data: {
        	bookPerson:[],
        	payOrderList:[],
        	s_msgcontent:"",
        	t_msgcontent:"",
        	errNoList:[],
            params : {
            	itineraryNo:"",
            	bookPersonName :"",
            	bookPersonPhone:"",
            	orderNos:[],
            	payType:"",
            	content:"",
            	orderList : []
			}
        },methods: {
            init: function () {
            	//加载独立支付
            	//打包支付加载数据
                if(window.type=='singlePay'){
                	vm_payment_list.singlePay();
                	//打包支付加载数据
                }else if(window.type=='togetherPay'){
                	vm_payment_list.togetherPay();
            	}
            },//独立支付
            singlePay: function () {
            	//数据清空
            	//数据清空
            	vm_payment_list.s_msgcontent="";
                $.ajax({
                    url: __ctx + "/payment/singlePay/init",
                    data: {
                        orderNo: window.orderNo
                    },
                    success: function (data) {
                        if (data.result) {
                        	vm_payment_list.bookPerson=data.obj.bookPerson;
                        } else {
                            toastr.error(data.message, "", {timeOut: 0, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                        }
                    }
                });
            },//打包支付
            togetherPay: function () {
            	//数据清空
            	vm_payment_list.t_msgcontent="";
            	vm_payment_list.errNoList=[];
                $.ajax({
                    url: __ctx + "/payment/togetherPay/init",
                    data: {
                    	itineraryNo: window.itineraryNo
                    },
                    success: function (data) {
                        if (data.result) {
                        	vm_payment_list.bookPerson=data.obj.bookPerson;
                        	vm_payment_list.payOrderList=data.obj.payOrderList;
                        } else {
                            toastr.error(data.message, "", {timeOut: 0, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                        }
                    }
                });
            }, //获取支付链接
            getPayUrl:function(type){
            	//数据清空
            	vm_payment_list.s_msgcontent="";
            	vm_payment_list.t_msgcontent="";
            	vm_payment_list.params.orderList=[];
            	// 处理前校验
				if (!vm_payment_list.getPayUrlCheck()) {
					return false;
				}
				vm_payment_list.params.itineraryNo=window.itineraryNo;
            	if(type =='single'){
            		vm_payment_list.params.payType="1";
            		var paymentOrderVO=new Object();
            		paymentOrderVO.orderNo=window.orderNo;
            		paymentOrderVO.productCode="DA1";
            		vm_payment_list.params.orderList.push(paymentOrderVO);	
            	}else if(type == 'together'){
            		vm_payment_list.params.payType="2";
            		var orderListLength=vm_payment_list.payOrderList.length;
            		var isExist=false;
            		for(var i=0;i<orderListLength ;i++){
            			var _box=$("#checkbox_"+vm_payment_list.payOrderList[i].orderNo).prop("checked");
            			if(_box==true){
            				isExist=true;
            				var paymentOrderVO=new Object();
                    		paymentOrderVO.orderNo=vm_payment_list.payOrderList[i].orderNo;
                    		paymentOrderVO.productCode=vm_payment_list.payOrderList[i].productCode;
            				vm_payment_list.params.orderList.push(paymentOrderVO);
            			}
            		}
            		if(!isExist){
            			 toastr.error("请选择操作的订单。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
            			return false;
            		}
            	}
            	vm_payment_list.params.bookPersonName=vm_payment_list.bookPerson.bookPersonName;
            	vm_payment_list.params.bookPersonPhone=vm_payment_list.bookPerson.bookPersonPhone;
            	$.ajax({
            		type : "POST",
					contentType : "application/json",
                    url: __ctx + "/payment/getPayUrl",
                    data : JSON.stringify(vm_payment_list.params),
                    success: function (data) {
                        if (data.result) {
                        	vm_payment_list.params.orderNos=data.obj.orderNos;
                        	$("#confirmTipPay").modal({
                               show: true,
                               backdrop: 'static'
                        	});
                        	$("#confirmTipBody").html("");
                        	$("#confirmTipBody").html(data.obj.returnMsg);
                        	$("#confirmTipClose").unbind();
                        	$("#confirmTipClose").click(function(){
                        		if(vm_payment_list.params.payType=="1"){
                        			if(data.obj.result=='1'){
                        				vm_payment_list.s_msgcontent=data.obj.content;
                        			}else if(data.obj.result=='2'){
                        				window.location.href = __ctx + "/orderdetails/flightorderdetail?orderNo="+window.orderNo;
                        			}
                				}else if(vm_payment_list.params.payType=="2"){
                					if(data.obj.result=='1'){
                        				vm_payment_list.t_msgcontent=data.obj.content;
                        			} else{
                        				//错误的订单号
                        				vm_payment_list.errNoList=data.obj.errNoList;
                        				//设置错误的订单号不能被选中
                        				vm_payment_list.setCheckBoxFun();
                        			}
                				}
                        		$("#confirmTipPay").modal('hide');
                        	});
                        } else {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                        }
                  }
              });
            },            
            //获取支付链接校验
            getPayUrlCheck:function(){
            	if(vm_payment_list.bookPerson.bookPersonName== null || vm_payment_list.bookPerson.bookPersonName == ""){
            		toastr.error("预订人姓名不能为空。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
            		return false;
            	}
            	if(vm_payment_list.bookPerson.bookPersonPhone== null || vm_payment_list.bookPerson.bookPersonPhone == ""){
            		toastr.error("预订人手机号码不能为空。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
            		return false;
            	}
            	var reg = /^\d{11}$/;
            	if(!reg.test(vm_payment_list.bookPerson.bookPersonPhone)){
            		toastr.error("预订人手机号码不正确。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
            		return false;
            	}
            	return true;
            },
            //发送短信
            sendMsg:function(){
            	// 处理前校验
				if (!vm_payment_list.getPayUrlCheck()) {
					return false;
				}
				if(vm_payment_list.params.payType=="1"){
					vm_payment_list.params.content=vm_payment_list.s_msgcontent;
				}else if(vm_payment_list.params.payType=="2"){
					vm_payment_list.params.content=vm_payment_list.t_msgcontent;
				}
				//判断是否执行过生成短信
				if(vm_payment_list.params.orderNos==null || vm_payment_list.params.orderNos.length==0){
					toastr.error("短信未生成无法发送。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
					 return false;
				}
				//校验内容是否为空
				if(vm_payment_list.params.content ==null || vm_payment_list.params.content==""){
					 toastr.error("短信内容不能为空。", "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
					 return false;
				}
				vm_payment_list.params.bookPersonName=vm_payment_list.bookPerson.bookPersonName;
				vm_payment_list.params.bookPersonPhone=vm_payment_list.bookPerson.bookPersonPhone;
            	$.ajax({
            		type : "POST",
					contentType : "application/json",
                    url: __ctx + "/payment/sendMsg",
                    data : JSON.stringify(vm_payment_list.params),
                    success: function (data) {
                        if (data.result) {
                        	 toastr.info(data.message, "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                        	 //页面关闭返回原来的页面
                        	 if(vm_payment_list.params.payType=="1"){
                        		 //页面关闭
     							setTimeout(function(){
     								//在增值单详情页面开发完之后修改一下，兼容增值单 和 其他业务
     								window.location.href = __ctx + "/orderdetails/flightorderdetail?orderNo="+window.orderNo;
     							}, 1000);
             				}else if(vm_payment_list.params.payType=="2"){
             					 //页面关闭
    							setTimeout(function(){
    								window.location.href=__ctx+"/itineraryproduct/itineraryproductlist?itineraryNo="+window.itineraryNo;
    							}, 1000);
             				}
                        } else {
                            toastr.error(data.message, "", {timeOut: 2000, positionClass: "toast-top-center",extendedTimeOut : 0,closeButton : true});
                        }
                  }
            	})
            },
            //关闭页面发送
            closeMsg:function(){
            	if(window.type=='singlePay'){
            		window.location.href = __ctx + "/orderdetails/flightorderdetail?orderNo="+window.orderNo;
            	}else if(window.type=='togetherPay'){
            		window.location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo="+window.itineraryNo;
            	}
            },//设置checkbox不能选中
            setCheckBoxFun:function(){
            	var _errList=vm_payment_list.errNoList;
            	if(_errList!=null && _errList!=""){
            		for(var i=0;i<_errList.length;i++){
            			$("#checkbox_"+_errList[i]).prop("checked", false);
            			$("#checkbox_"+_errList[i]).prop("disabled", "disabled");
            		}
            	}
            }
        }
    });
    vm_payment_list.init();
});


