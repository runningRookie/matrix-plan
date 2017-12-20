/**
 * Created by lf48082 on 2017/8/2.
 */ 
var vue_shortMessage;
$(document).ready(function () {
    vue_shortMessage = new Vue({
        el: '#manualShortMessageDiv',
        data: {
        	bookPersonPhone: "",
        	content: ""
        },
        ready: function () {
        },
        methods: {
            //发送手工短信
        	sendMsg: function () {
        		 $.ajax({
                     url: __ctx + "/manualitemsNotify/sendManualMsg",
                     data: JSON.stringify({
                    	 "itineraryNo": itineraryNo,
                    	 "createTradeDTOs" : [{"orderNo": orderNo}],
                    	 "bookPersonName": bookPersonName,
                    	 "bookPersonPhone": vue_shortMessage.bookPersonPhone,
                    	 "content" : vue_shortMessage.content                 	 
                     }),                    
                     type: "POST",
                     datatype: "json",
                     contentType: "application/json;charset=utf-8",
                     success: function (result) {
                         if (result.success) {
	                    	  toastr.success("短信发送成功", "", {
	                              timeOut: 2000,
	                              positionClass: "toast-top-center"
	                          });
	                    	  
   							setTimeout(function(){
 								window.location.href = __ctx + "/manualOrder/detail?orderNo=" + orderNo;
 							}, 1000);
                         } else {
	                    	  toastr.error(result.errorMessage, "", {
	                              timeOut: 2000,
	                              positionClass: "toast-top-center"
	                          });
                         }
                     },
                     error: function (result) {
                         toastr.error("短信发送失败", "", toastrConfig);
                     }
                 });
            }            
        }
    });

});