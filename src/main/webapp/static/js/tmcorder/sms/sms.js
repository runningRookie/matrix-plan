
var sms_vm;
$(document).ready(function() {
	sms_vm = new Vue({
	    el:'#message',
	    data:{
	        orderNo:orderNo,
	        phone:""
	    },
	    ready: function () {
	    },
	    methods:{
	    	sendSms:function(){
	    		var content = $("#content").val();
	    		var phone = $("#phone").val();
	    		if(phone == '' || content == ''){
	    			toastr.error("短信内容和短信号码不能为空！", "",{timeOut: 2000, positionClass: "toast-top-center"});
	    			return;
	    		}
	    		var url = __ctx+"/sendsms";
	    		$.ajax({
		            type : 'POST',
		            url : url,
		            data : {
		            	content:content,
		            	phone:phone
		            },
		            datatype : "json",
		            success : function(data) {
						if (data && data.result) {
							toastr.success(data.message, "",{timeOut: 1000, positionClass: "toast-top-center"});
						} else {
						toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
						}
		            },
		            error : function(err) {
		                toastr.error("发送失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
		            }
		        });
	    	}
	    }
	});

	var setTelphone = function(param){
				var me = sms_vm;
	    		$.ajax({
		            type : 'GET',
		            url : __ctx+"/telphone/"+param,
		            datatype : "json",
		            success : function(data) {		            	
						if (data && data.result) {
							me.phone = data.obj;
						} else {
							me.phone = ""; 
						}
		            },
		            error : function(err) {
		            	me.phone = "";
		            }
		        });
	    	}
	 setTelphone(orderNo);

    $("#back-to-order").click(function(){
    	window.location.href=__ctx + "/order/orderDetail?orderNo="+orderNo;
    })
});

