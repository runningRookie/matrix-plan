$(document).ready(function () {
    Vue.filter('cancelRuleIdFilter',function(value){
        var cancelRule="";
        switch (value){
            case 0:
                cancelRule="限时取消";
                break;
            case 1:
                cancelRule="免费取消";
                break;
            case 2:
                cancelRule="不可取消";
                break;
            case 3:
                cancelRule="收费取消";
                break;
            default:
                ;
        }
        return cancelRule;
    });
    Vue.filter('hotelTypeFilter', {
        read: function (value, format) {
            if (value == 1) {
            	return '现付';                
            }
            if (value == 2) {
            	return '预付';
            }            
        },
        write: function (value, format) {
            return value;
        }
    });
	
	Vue.filter('orderStatusFilter', {
        read: function (value, format) {
			 if (value == 0) {
                return '待提交审批';
            }
            if (value == 1) {
                return '已取消';
            }
            if (value == 2) {
                return '待审批';
            }
            if (value == 3) {
                return '审批中';
            }
            if (value == 4) {
                return '审批不通过';
            }
			if (value == 5) {
                return '待支付';
            }
            if (value == 6) {
                return '待供应商确认';
            }
            if (value == 7) {
                return '供应商不确认';
            }
            if (value == 8) {
                return '供应商口头确认';
            }
			if (value == 9) {
                return '供应商已确认';
            }
            if (value == 10) {
                return '入住中';
            }
            if (value == 11) {
                return '确认入住';
            }
            if (value == 12) {
                return '确认未住';
            }
			if (value == 13) {
                return '部分退房';
            }
            if (value == 14) {
                return '已取消(全部退房)';
            }
            if (value == 15) {
                return '已申请取消';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
	
	Vue.filter('approvalStatusFilter', {
        read: function (value, format) {
        	if (value == 0) {
                return '未提交审批';
            }
            if (value == 1) {
                return '待审批';
            }
            if (value == 2) {
                return '审批中';
            }
            if (value == 3) {
                return '审批通过';
            }
            if (value == 4) {
                return '审批否决';
            }
			if (value == 5) {
                return '撤销审批';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
	
	Vue.filter('payStatusFilter', {
        read: function (value, format) {
			if (value == 0) {
                return '未知';
            }
            if (value == 1) {
                return '未支付';
            }
            if (value == 2) {
                return '支付中';
            }
            if (value == 3) {
                return '支付成功';
            }
            if (value == 4) {
                return '支付失败';
            }
			if (value == 5) {
                return '交易关闭';
            }
			if (value == 6) {
                return '交易超时到期';
            }
            if (value == 7) {
                return '交易冲正';
            }
			if (value == 8) {
                return '预授权成功';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
	
/*	Vue.filter('servicePersonTypeFilter', {
        read: function (value, format) {
            if (value == 1) {
                return '老板';
            }
            if (value == 2) {
                return '秘书';
            }      
			if (value == 3) {
                return '司机';
            }    			
        }, 
        write: function (value, format) {
            return value;
        }
    });*/
	
	/*外部订单状态(0待库存确认 1 :待支付 2：已取消  3：已支付 5：待同程确认   10：同程已确认 11：确认入住 12：确认未住 15：申请部分退款  20：申请全额退款 25：全额退款结束   30：部分退款结束   35：已结算 40：订单结束)*/
	Vue.filter('outOrderStatusFilter', {
        read: function (value, format) {
			if (value == 0) {
                return '待库存确认';
            }
            if (value == 1) {
                return '待支付';
            }
            if (value == 2) {
                return '已取消';
            }
            if (value == 3) {
                return '已支付';
            }
            if (value == 5) {
                return '待同程确认';
            }
			if (value == 10) {
                return '同程已确认';
            }
			if (value == 11) {
                return '确认入住';
            }
			if (value == 12) {
                return '确认未住';
            }
			if (value == 15) {
                return '申请部分退款';
            }
			if (value == 20) {
                return '申请部分退款';
            }
			if (value == 25) {
                return '全额退款结束';
            }
			if (value == 30) {
                return '部分退款结束';
            }
			if (value == 35) {
                return '已结算';
            }
			if (value == 40) {
                return '订单结束';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
	
	Vue.filter('orderChannelFilter', {
        read: function (value, format) {
        	if(value == 1){
        		return 'Online（PC）';
        	}
        	if(value == 2){
        		return 'Online（APP）';
        	}
        	if(value == 3){
        		return 'Online（WX）';
        	}
        	if(value == 4){
        		return 'Online（API）';
        	}
        	if(value == 5){
        		return 'Offline（白屏）';
        	}
        	if(value == 6){
        		return 'Offline（手工）';
        	}
        	
        	return '';
        },
        write: function (value, format) {
            return value;
        }
     });
	
	    var vm = new Vue({
	        el: '#orderVM',
	        data: {
	        	order:{},
				orderMain:{},
				hotelDetailPriceInfo:{},
				hotelServicePerson:[],
	        	hotelBookPerson:{},
	        	hotelItem:[],
			    hotelBusinessTravelPolicy:[]
	        },
	        ready: function () {
	            var data = {orderNo: window.orderNo};
	            $.getJSON(__ctx + "/hotel/getHotelOrderByOrderNo", data, function (result) {
	                vm.order = result.obj;
	            });
				$.getJSON(__ctx + "/hotel/getHotelOrderMainByOrderNo", data, function (result) {
	                vm.orderMain = result.obj;
	            });
				 $.getJSON(__ctx + "/hotel/getHotelDetailPriceInfoByOrderNo", data, function (result) {
	                vm.hotelDetailPriceInfo = result.obj;
	            }); 
				$.getJSON(__ctx + "/hotel/getHotelServicePersonByOrderNo", data, function (result) {
	                vm.hotelServicePerson = result.obj;
	            });
				$.getJSON(__ctx + "/hotel/getHotelBookPersonByOrderNo", data, function (result) {
	                vm.hotelBookPerson = result.obj;
	            });
				$.getJSON(__ctx + "/hotel/getHotelItemByOrderNo", data, function (result) {
	                vm.hotelItem = result.obj;
	                var hotelBusinessTravelPolicys = [];
	                for(var i=0; i< vm.hotelItem.length ; i++){
	                	var hotelPassengers = vm.hotelItem[i].hotelPassengerDTOs;
	                	for (var j=0; j< hotelPassengers.length ; j++){
	                		//差旅政策
		                	hotelBusinessTravelPolicys.push(vm.hotelItem[i].hotelPassengerDTOs[j]);
	                	}
	                }
	               //去重
	                var hash = {};
	                vm.hotelBusinessTravelPolicy = hotelBusinessTravelPolicys.reduce(function(item, next) {
	                    hash[next.passengerEmployeeId] ? '' : hash[next.passengerEmployeeId] = true && item.push(next);
	                    return item;
	                }, []);
	            }); 
				/*$.getJSON(__ctx + "/hotel/getHotelBusinessTravelPolicyByOrderNo", data, function (result) {
	                vm.hotelBusinessTravelPolicy = result.obj;
	            }); */
	        },
	        methods:{
	               showStopSite:function(violationContent, id){//显示违反差旅Modal
	                        
	                        var policyStr = "";
	                        if(violationContent !=null && violationContent !="" ){
	                        	var violation = violationContent.split("TTTTTTTTT");
		                        for(var i=0; i< violation.length ; i++){
		                            policyStr += (i+1) + " : " + violation[i] + "<br>";
		                        }
		                    
		                        var option={
		                                template:"<div class='popover' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content' style='padding:9px;14px'></div></div>",
		                                content:policyStr,
		                                container:'body',
		                                html:true
		                            }

		                        $('#' + id).popover(option).popover('show');
	                        }
	                        
	                    },
	                hideStopSite:function(id){//隐藏违反差旅Modal
	                    $('#' + id).popover('hide');
	                },
	                //跳转行程详情页面
	    			showItineraryDetail:function(itineraryNo){
	    	            window.location.href =__ctx+"/itineraryproduct/itineraryproductlist?itineraryNo="+itineraryNo;
	                } 
	            }

	    });
		
		//外部备注信息处理
		$('#remarkSubmitBtn').click(function () {
        var remark = $('#outRemark').val();
        if (!remark) {
            toastr.error("请输入外部备注", "", toastrConfig);
            return;
        }
        var params = {
            remark: remark,
            orderNo: window.orderNo,
            remarkType: 2
        };
        $.post(__ctx + "/hotel/insertRemark" , params, function (result) {
            if (!result.result) {
                toastr.error("保存失败", "", toastrConfig);
                return;
            }
            toastr.success("保存成功", "", toastrConfig);
            $('#remark').text(remark);
			tc.hotel.logs.refresh();
        });
    });
		
		//内部备注处理
	    $('#innerTextSubmitBtn').click(function () {
	        var innerText = $('#hotelOnChangeInnerText').val();
	        if (!innerText) {
	            toastr.error("请输入内部备注", "", toastrConfig);
	            return;
	        }
	        var params = {
	            remark: innerText,
	            orderNo: window.orderNo,
	            remarkType: 1
	        };
	        $.post(__ctx + "/hotel/insertRemark" , params, function (result) {
	            if (!result.result) {
	                toastr.error("保存失败", "", toastrConfig);
	                return;
	            }
	            toastr.success("保存成功", "", toastrConfig);
				tc.hotel.logs.refresh();
	        });
	    });

	
});