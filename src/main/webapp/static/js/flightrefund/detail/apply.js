$(document).ready(function () {
debugger;
//
//	var initDatePicker = function () {
//        $('.dateInputPicker').datetimepicker({
//            minView: "month", // 选择日期后，不会再跳转去选择时分秒
//            format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
//            language: 'zh-CN', // 汉化
//            autoclose: true // 选择日期后自动关闭
//        });
//
//        $('.timeInputPicker').datetimepicker({
//            startView: 'hour',
//            maxView: "hour", // 选择日期后，不会再跳转去选择时分秒
//            format: "hh:ii", // 选择日期后，文本框显示的日期格式
//            language: 'zh-CN', // 汉化
//            autoclose: true // 选择日期后自动关闭
//        });
//    };
//
		Vue.filter('refundTypeFliter', {
	        read: function(value, format) {
	                if(value == 0){
	                    return '自愿退票';
	                }else{
	                    return '非自愿退票';
	                }
	                
	        },
	        write: function (value, format) {
	                return value;
	        }
	    });

		var refundchangesignVM = new Vue({
	       el: '#refundchangesignVM',
	       data: {           
	       	refundChangeSign:{},
			urlList:[]
	       },
			ready: function () {
			 },
	       methods: {
	    	 
	       }
	   });

	   var refundAmountVM = new Vue({
	       el: '#refundAmountVM',
	       data: {
	       	refundType:0,
	       	segmentInfos:[],
	       	passengerSegments:[],
	       	urlList:[]
	       },
	       ready: function () {
	    	   var thisVM = this;
				var applyNO = {refundApplyNo : window.refundApplyNo};
				$.ajax({
                   url: __ctx + "/flights/findRefundImage",
                   contentType: "application/json",                        
                   type : "GET",
                   async: false,
                   data:applyNO,
                   datatype:"json",
                   success:function(data){
                       if(!data.result){
                           toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                       }else{             
                       	thisVM.urlList = data.obj.urlList;
                       }
                   }
               });
	       },
	       methods:{     
	    	   enlargeImage:function(index){
	    		   window.open(index); 
	    	   }
	       }
	   });
	   
	   var vm = new Vue({
	        el: '#orderLogVM',
	        data: {
	            logs: [],
	            isShow: false
	        }
	    });
	    
	    var refundButtonVM = new Vue({
	        el: '#refundButtonVM',
	        data: {
	        },
	        ready: function () {
	            
	        },
	        methods:{
	        	toggleLogs: function () {
	        		$.getJSON(__ctx + "/orders/" + window.orderNo + "/logs", function (data) {
	        	        vm.logs = data.obj;
	        	    });
	        		vm.isShow = !vm.isShow;
	            }
	        }
	    });

	   tc.flight.refund.segments(function (refundChangeSign,passengers) {
	   		refundchangesignVM.refundChangeSign = _.cloneDeep(refundChangeSign);
	        refundAmountVM.segmentInfos = _.cloneDeep(passengers);
	        $(refundAmountVM.segmentInfos).each(function(i,e){
	    		var passengerSegment = {};
	    		passengerSegment.passenger = e.passenger;
	    		var refundItems = [];
	    		$(e.flightSegmentInfos).each(function(i,e){
	    			var segmentRefundItem = {};
	    			segmentRefundItem.flightSegmentInfo = e;
	    			
	    			var refundItem = {};
		    		var data = {segmentInfoId: e.id};
                    $.ajax({
                        url: __ctx + "/flights/getRefundItemBySegmentInfoId",
                        contentType: "application/json",                        
                        type : "GET",
                        async: false,
                        data:data,
                        datatype:"json",
                        error:function(data1){
                            toastr.error("查询价格信息失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success:function(data){
                            if(!data.result){
                                toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                            }else{             
                                refundItem = data.obj;
                            }
                        }
                    });

		    		segmentRefundItem.refundItem = refundItem;
		    		refundItems.$set(refundItems.length,segmentRefundItem);
	    		});
	    		passengerSegment.refundItems = refundItems;
	            refundAmountVM.passengerSegments.$set(refundAmountVM.passengerSegments.length,passengerSegment);                                          
	        });
	   });

	   tc.flight.refund.apply(function (refundApply) {
	   		var refundApply = _.cloneDeep(refundApply);
	   		refundAmountVM.refundType = refundApply.refundType;
	//        newPoundagesVM.old.segmentInfos = _.cloneDeep(segmentInfos);
	   });
	   
	   
	   
//
});