$(document).ready(function () {

    var initDatePicker = function () {
        $('.dateInputPicker').datetimepicker({
            minView: "month", // 选择日期后，不会再跳转去选择时分秒
            format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
            language: 'zh-CN', // 汉化
            autoclose: true // 选择日期后自动关闭
        });

        $('.timeInputPicker').datetimepicker({
            startView: 'hour',
            maxView: "hour", // 选择日期后，不会再跳转去选择时分秒
            format: "hh:ii", // 选择日期后，文本框显示的日期格式
            language: 'zh-CN', // 汉化
            autoclose: true // 选择日期后自动关闭
        });
    };

var initRefund = function (passengers) {
        var refundChangeSign = {};
        refundChangeSign.refundInfo = passengers[0].flightRefundInfoDTO;
        refundChangeSign.changeInfo = passengers[0].flightChangeInfoDTO;
        refundChangeSign.signInfo = passengers[0].flightSignInfoDTO;
        flightVM.refundChangeSign = refundChangeSign;
    };

var getAirTravelProtocols = function(passengers){
    var VM = flightVM;
    $(passengers).each(function(i,e){
        $.ajax({
            url: __ctx + "/resource/getAirTravelProtocolByEmployeeId",
            data:{
                employeeId:e.passenger.passengerEmployeeId
            },
            type : "POST",
            datatype:"json",
            async: false,
            error:function(data1){
                alert(data1);
            },
            success:function(data){ 
                if(data == null){
                    toastr.error("差旅政策获取失败！", "",{timeOut: 2000, positionClass: "toast-top-center"});
                }else{
                    VM.passengerProtocols[i] =  data;      
                }
            }
        });                  
    });
}

var flightVM = new Vue({
        el: '#flightVM',
        data: {
            flights: [],
            passengers: [],
            refundChangeSign:{},
            order:{flightOrderDTO: {}, orderMainDTO: {}},
            passengerProtocols:[],
            flightViolationReasons:[],
            suppliers:[]
        },
        watch: {
            passengers: {
                handler: function(passengers){
                       var totalAmount = 0;
                       var totalCost = 0;
                        if(passengers.length > 0){
                            for(var i= 0;i<passengers.length;i++){
                                for(var j=0;j<passengers[i].flightSegmentInfos.length;j++){
                                    if(passengers[i].flightSegmentInfos[j].flightAmount !="" && passengers[i].flightSegmentInfos[j].flightAmount !='undefined'){
                                        totalAmount =(parseFloat(totalAmount)+parseFloat(passengers[i].flightSegmentInfos[j].flightAmount)).toFixed(2);
                                    }                                
                                    if(passengers[i].flightSegmentInfos[j].capitalCost !="" && passengers[i].flightSegmentInfos[j].capitalCost !='undefined'){
                                        totalAmount =(parseFloat(totalAmount)+parseFloat(passengers[i].flightSegmentInfos[j].capitalCost)).toFixed(2);
                                    }                               
                                    if(passengers[i].flightSegmentInfos[j].fuelCost !="" && passengers[i].flightSegmentInfos[j].fuelCost !='undefined'){
                                        totalAmount =(parseFloat(totalAmount)+parseFloat(passengers[i].flightSegmentInfos[j].fuelCost)).toFixed(2);
                                    }                                
                                    if(passengers[i].flightSegmentInfos[j].serviceCharge !="" && passengers[i].flightSegmentInfos[j].serviceCharge !='undefined'){
                                        totalAmount =(parseFloat(totalAmount)+parseFloat(passengers[i].flightSegmentInfos[j].serviceCharge)).toFixed(2);
                                    }                               
                                    if(passengers[i].flightSegmentInfos[j].plusPrice !="" && passengers[i].flightSegmentInfos[j].plusPrice !='undefined'){
                                        totalAmount =(parseFloat(totalAmount)+parseFloat(passengers[i].flightSegmentInfos[j].plusPrice)).toFixed(2);
                                    }

                                    if(passengers[i].flightSegmentInfos[j].purchasePrice !="" && passengers[i].flightSegmentInfos[j].purchasePrice !='undefined'){
                                        totalCost =(parseFloat(totalCost)+parseFloat(passengers[i].flightSegmentInfos[j].purchasePrice)).toFixed(2);
                                    }                                
                                    if(passengers[i].flightSegmentInfos[j].capitalCost !="" && passengers[i].flightSegmentInfos[j].capitalCost !='undefined'){
                                        totalCost =(parseFloat(totalCost)+parseFloat(passengers[i].flightSegmentInfos[j].capitalCost)).toFixed(2);
                                    }                               
                                    if(passengers[i].flightSegmentInfos[j].fuelCost !="" && passengers[i].flightSegmentInfos[j].fuelCost !='undefined'){
                                        totalCost =(parseFloat(totalCost)+parseFloat(passengers[i].flightSegmentInfos[j].fuelCost)).toFixed(2);
                                    } 
                                }
                            }           
                        }
                        flightVM.order.orderMainDTO.totalAmount = totalAmount;
                        flightVM.order.orderMainDTO.totalCost = totalCost; 
                },
                deep: true
            }
        },
        ready: function () {
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/searchFlightSegment", data, function (result) {
                flightVM.flights = result.obj;
            });
            $.getJSON(__ctx + "/resource/getFlightSuppliers", data, function (result) {
            	flightVM.suppliers = result.obj;
            });
            $.getJSON(__ctx + "/orderdetails/getPassengerSegmentInfosNotSuppplierName", data, function (result) {
                flightVM.passengers = result.obj;
                initRefund(result.obj);
                getAirTravelProtocols(result.obj);
            });
            
            this.getAllCurrencyTypes();
            this.getFlightViolationReasons();
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
            },
            getFlightViolationReasons:function(){
                 var VM = this;
                 $.ajax({
                     url: __ctx + "/resource/getFlightViolationReasonByOrderNo",
                     data:{
                         orderNo:window.orderNo
                     },
                     type : "POST",
                     datatype:"json",
                     error:function(data1){
                         alert(data1);
                     },
                     success:function(data){
                         if(data == null){
                             toastr.error("差旅违规原因获取失败！", "",{timeOut: 2000, positionClass: "toast-top-center"});
                         }else{
                             VM.flightViolationReasons =  data;              
                         }
                     }
                 });
            },
            showStopSite:function(flightStopSites,index){
                var stopsites="";
                stopsites +="<table style='width:100%;padding:0px;' class='table table-bordered'>";
                stopsites +="<thead>";
                stopsites +="<tr>";
                stopsites +="<th></th>";
                stopsites +="<th>经停机场</th>";
                stopsites +="<th>到达时间</th>";
                stopsites +="<th>起飞时间</th>";
                stopsites +="</tr>";
                stopsites +="</thead>";
                stopsites +="<tbody>";
                $(flightStopSites).each(function (i, stopSite) {
                    stopsites +="<tr>";
                    stopsites +="<th>"+(i+1)+"</th>";
                    stopsites +="<th>"+stopSite.stopPort+"</th>";
                    stopsites +="<th>"+stopSite.arriveTime+"</th>";
                    stopsites +="<th>"+stopSite.leaveTime+"</th>";
                    stopsites +="</tr>";
                })
                stopsites +="</tbody>";
                stopsites +="</table>";
                var option={
                        template:"<div class='popover' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content' style='padding:0px;'></div></div>",
                        content:stopsites,
                        container:'body',
                        html:true
                    }

                $('#testButtton'+index).popover(option).popover('show');

            }
       }
    });
    




    var orderVM = new Vue({
        el: '#orderVM',
        data: {
            order: {flightOrderDTO: {}, orderMainDTO: {}},
            bookCompanyName: "",
            bussinessTravelAim: "",
            relationalOrderNum: 0
        },
        ready: function () {
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                orderVM.order = result.obj;
                flightVM.order = result.obj;
            });

            $.getJSON(__ctx + "/orderdetails/getBookCompanyName", data, function (result) {
                orderVM.bookCompanyName = result.obj;
            });

            $.getJSON(__ctx + "/orderdetails/getBuessinessTravelAim", data, function (result) {
                orderVM.bussinessTravelAim = result.obj;
            });

            $.getJSON(__ctx + "/orderdetails/getRelationalOrderNum", data, function (result) {
                orderVM.relationalOrderNum = result.obj;
            });
        }
    });
    
    
    
    
    
    

    
    
    var refundButtonVM = new Vue({
        el: '#refundButtonVM',
        data: {
            cancelReason:"",
            cancelReasonCode:"",
            showModel:false
        },
        ready: function () {
        	this.showModel = true;
        },
        methods:{        
            toggleLogs: function () {
                tc.flight.change.toggleLogs();
            },
            submitUpdateOrder:function(){
                var updateFlightOrder = {};
                updateFlightOrder.flightOrderInfo = flightVM.order;
                updateFlightOrder.passengerSements = flightVM.passengers;
                updateFlightOrder.flightSegments = flightVM.flights;
                
                var flightChangeInfo = {};
                flightChangeInfo = flightVM.refundChangeSign.changeInfo;
                var flightRefundInfo = {};
                flightRefundInfo = flightVM.refundChangeSign.refundInfo;
                var flightSignInfo = {};
                flightSignInfo = flightVM.refundChangeSign.signInfo;
                updateFlightOrder.flightChangeInfo = flightChangeInfo;
                updateFlightOrder.flightRefundInfo = flightRefundInfo;
                updateFlightOrder.flightSignInfo = flightSignInfo;
                
                _.unset(updateFlightOrder,'flightOrderInfo.orderMainDTO.beginIndex');
                _.unset(updateFlightOrder,'flightOrderInfo.flightOrderDTO.beginIndex');

                $(updateFlightOrder.flightSegments).each(function(i,e){
                    if(e.planBeginDate == '' || e.planBeginDate == null){
                        toastr.error("起飞时间不能为空!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if(e.planEndDate == '' || e.planEndDate == null){
                        toastr.error("到达时间不能为空!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if(e.airlineCompany == '' || e.airlineCompany == null){
                        toastr.error("航空公司不能为空!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    if(e.planModel == '' || e.planModel == null){
                        toastr.error("机型不能为空!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }                     
                });

                if(updateFlightOrder.flightOrderInfo.flightOrderDTO.pnr == '' || updateFlightOrder.flightOrderInfo.flightOrderDTO.pnr == null){
                    toastr.error("pnr不能为空!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                var priceTypeFlag = true;
                var agreementCodeFlag = true;
                var minusProfitReasonFlag = true
                $(updateFlightOrder.passengerSements).each(function(i,e){
                    $(e.flightSegmentInfos).each(function(i,e){
                        if(e.priceType == '' || e.priceType == null){
                            priceTypeFlag = false;
                            
                        }
                        if(e.priceType == '1' && (e.agreementCode == '' || e.agreementCode == null)){
                            agreementCodeFlag = false;                          
                        }
                        if((parseFloat(e.flightAmount)-parseFloat(e.purchasePrice)+parseFloat(e.serviceCharge)+parseFloat(e.plusPrice)).toFixed(2) < 0 && !e.minusProfitReason){
                            minusProfitReasonFlag = false;
                        }
                    }); 
                });

                if(!priceTypeFlag){
                    toastr.error("价格类型不能为空!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if(!agreementCodeFlag){
                    toastr.error("协议号不能为空!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if(!minusProfitReasonFlag){
                    toastr.error("存在负利润，负利润原因不能为空!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                // alert(flightVM.order.orderMainDTO);
                // return;
                $.ajax({
                    url: __ctx + "/updateFlights/updateFlightOrder",
                    contentType: "application/json", 
                    data:JSON.stringify(updateFlightOrder),                       
                    type : "POST",
                    datatype:"json",
                    error:function(data1){
                        alert(data1);
                    },
                    success:function(data){
                        if(!data.result){
                            toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                        }else{
                            toastr.success("提交成功, 5秒后关闭当前页面", "", toastrConfig);
                            setTimeout(function () {
                                window.close();
                            }, 5000);                 
                        }
                    }
                });

            },
            dealCancel:function(){
            	promptFnc("确定要取消吗",
						function() {
            			refundButtonVM.cancelOutTicket();
						});
            },
            cancelOutTicket:function(){
            	$.ajax({
                    url: __ctx + "/flightOrder/ticket/cancel/"+window.orderNo,
                    type : "POST",
                    datatype:"json",
                    error:function(data1){
                    	toastr.error("取消出票请求失败", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success:function(data){
                    	if(!data.result){
                            toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                        }else{
                            toastr.success("取消成功, 5秒后关闭当前页面", "", toastrConfig);
                            setTimeout(function () {
                                window.close();
                            }, 5000);                 
                        }
                    }
                });
            },
            bindReason:function(cancelReasonCode){
            	if(cancelReasonCode == '1'){
            		this.cancelReason = "行程取消";
            	}else if(cancelReasonCode == '2'){
            		this.cancelReason = "重新预订";
            	}
				else if(cancelReasonCode == '3'){
					this.cancelReason = "价格有问题";        		
            	}
				else if(cancelReasonCode == '4'){
					this.cancelReason = "审批问题";
				}
				else if(cancelReasonCode == '5'){
					this.cancelReason = "支付问题";
				}
				else if(cancelReasonCode == '6'){
					this.cancelReason = "测试订单";
				}
				else if(cancelReasonCode == '7'){
					this.cancelReason = "客人自主取消";
				}
            },
            cancelOrder : function(){
                if(refundButtonVM.cancelReason == ''){
                    toastr.error("取消原因不能为空！", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
            
                $.ajax({
                    url: __ctx + "/flightOrder/cancelFlightOrder",
                    type : "POST",
                    data:{
                        orderNo:window.orderNo,
                        cancelReason:refundButtonVM.cancelReason,
                        cancelReasonCode:refundButtonVM.cancelReasonCode
                    },
                    datatype:"json",
                    error:function(data){
                        toastr.error("取消失败", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success:function(data){
                        if(!data.result){
                            toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                        }else{                           
                            toastr.success("取消成功, 5秒后关闭当前页面", "", toastrConfig);
                            setTimeout(function () {
                                window.close();
                            }, 5000);             
                        }
                    }
                });
           }  
        }
    });
});


