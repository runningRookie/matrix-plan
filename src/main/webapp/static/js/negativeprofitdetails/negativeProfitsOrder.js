$(document).ready(function () {

	
    var vm = new Vue({
        el: '#negativeProfitsOrder',
        data: {
        	orderNo : orderNo,
            flightOrderDTO : {}
        },
        methods:{
       toggleLogs: function () {
            tc.flight.change.toggleLogs();
        },
        passOrderLog: function () {
             var flightOrderDTO ={};
                flightOrderDTO.orderNo=orderNo;
                flightOrderDTO.rejectReason=$("#passOrderReason").val();
            $.ajax({
            	url: __ctx + "/negativeprofits/updateorderauditstatus",
                contentType: "application/json",
                    type: "POST", 
                    dataType: "json",
                    data: JSON.stringify(flightOrderDTO),
             success: function (data) {
                        if (!data.result) {
                            toastr.error("申请失败", "", toastrConfig);
                            return;
                        }
                        toastr.success("申请成功", "", toastrConfig);
                        window.location.href=__ctx+"/flightOrder/flightorderlist?returnFlag="+orderNo;
                        
                    }         
            });
        },
        auditPass: function(){
        	   $.ajax({
               	url: __ctx + "/negativeprofits/orderadoptedstatus",
                       data: {
                    	   orderNo : orderNo
                       },
                    success: function (data) {
                        if (!data.result) {
                            toastr.error("申请失败", "", toastrConfig);
                            return;
                        }
                        toastr.success("申请成功", "", toastrConfig);
                    }
               });
        }

        }
    });
    
    var refundAmountVM = new Vue({
	       el: '#refundAmountVM',
	       data: {
	       	refundType:0,
	       	segmentInfos:[],
	       	passengerSegments:[],
	       	order:{}
	       },
	       ready: function () {
	           this.getAllCurrencyTypes();
	           var data = {orderNo: window.orderNo};
	           $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
	        	   refundAmountVM.order = result.obj;
	            });
	       },
	       methods:{
             getAllCurrencyTypes:function(){               
                 $.ajax({
                     url: __ctx + "/resource/getAllCurrencyTypes",
                     type : "POST",
                     datatype:"json",
                     error:function(data1){
                         alert(data1);
                     },
                     success:function(data){
                         for(var i=0;i<data.length;i++) {                       
                             var option = $("<option>").text(data[i].chineseName).val(data[i].currencyTypeCode);
                             $("#currency").append(option);                                                     
                         }
                     }
                 });
             }        
	       }
	   });
    
    var refundchangesignVM = new Vue({
        el: '#refundchangesignVM',
        data: {           
        	refundChangeSign:{},
            segments:[]           
        },
        methods: {}
    });

    tc.flight.refund.segments(function (refundChangeSign,passengers) {
   		
        refundAmountVM.passengerSegments = _.cloneDeep(passengers);
   });
    
    tc.flight.detail.order(function (order) {
        refundAmountVM.order = _.cloneDeep(order);
   });

    tc.flight.change.segments(null, function (segments) {
    	refundchangesignVM.segments = segments;
    }, function(refundChangeSign){
    	refundchangesignVM.refundChangeSign = _.cloneDeep(refundChangeSign);
    });
 
});