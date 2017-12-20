$(document).ready(function () {
    tc.ns('tc.flight.change.segments', function (passengersFunc, flightsFunc, refundFunc) {

        var initRefund = function (passengers) {
            if (!passengers) {
                return {}
            }
            var refundChangeSign = {};
            refundChangeSign.refundInfo = passengers[0] && passengers[0].flightRefundInfoDTO;
            refundChangeSign.changeInfo = passengers[0] && passengers[0].flightChangeInfoDTO;
            refundChangeSign.signInfo = passengers[0] && passengers[0].flightSignInfoDTO;
            return refundChangeSign;
        };

        var initSelected = function (passengers) {
            return _.map(passengers, function () {
                return [];
            });
        };
        
        var initRefundFee = function(){
        	var VM　= vm;
        	var cabin;
        	if(!VM.flights || !VM.passengers){
        		return;
        	}
        	var depDate = moment(VM.flights[0].planBeginDate).format("YYYY-MM-DD");
        	var depTime = moment(VM.flights[0].planBeginDate).format("HH:mm");
        	$.ajax({
                type: "POST",
                url: __ctx + '/resource/getAirCabin',
                async: false,
                data: {
                	cabinCode:VM.passengers[0].flightSegmentInfos[0].seatCode,
                	airWaysCode:VM.flights[0].airlineCompanyCode
                },
                dataType: "json",
                success: function (data) {
                    if (!data) {
                        return;
                    }
                    cabin =  data;     
                }
            });
        	
        	var params = {
                    airlineCode: VM.flights[0].airlineCompanyCode,
                    fltNo: VM.flights[0].flightNo,
                    depDate: depDate,
                    cabinCode: VM.passengers[0].flightSegmentInfos[0].seatCode,
                    baseCabinCode: cabin.accBaseCabinCode,
                    baseCabinFare: VM.passengers[0].flightSegmentInfos[0].sameSeatClassAmount,
                    fdFare: VM.passengers[0].flightSegmentInfos[0].currentWindowOpenPrice,
                    fbc: VM.passengers[0].flightSegmentInfos[0].fbc,
                    discount: VM.passengers[0].flightSegmentInfos[0].flightDiscount,
                    startPort: VM.flights[0].startPortCode,
                    endPort: VM.flights[0].endPortCode,
                    depTime:depTime,
                    shareFltCode:VM.flights[0].carrierFlightCompanyCode,
                    shareFltNo:VM.flights[0].carrierFlightNo,
                    useOldFd:true,
                    flightAmount: VM.passengers[0].flightSegmentInfos[0].flightAmount,
                    flightQueryResultKey: VM.flights[0].flightQueryResultKey,
                    flightInfoKey: VM.flights[0].flightInfoKey,
                    cabinInfoKey: VM.passengers[0].flightSegmentInfos[0].cabinInfoKey,
                    passengerClass: VM.passengers[0].passenger.passengerClass,
                    orderOrApplyNo: window.orderNo,
                    sourceType:window.sourceType,
                    /*priceType:VM.passengers[0].flightSegmentInfos[0].priceType*/
                    priceType:'0'
                };
        	
            /*var baseUrl = __ctx + '/flights/';
            var url = baseUrl + (VM.passengers[0].flightSegmentInfos[0].priceType === '1' ? 'protocolrefund' : 'flightrefund');*/
        	
        	$.ajax({
                type: "POST",
                contentType: "application/json",
                url:  __ctx + '/flights/refundChange',
                data: JSON.stringify(params),
                dataType: "json",
                success: function (data) {
                	var tempRefundFee = 0;
                    if (data.obj && data.obj.refundPriceFromCustomer) {
						tempRefundFee = data.obj.refundPriceFromCustomer;
                    }
                    VM.refundFee = tempRefundFee;
                }
            });
        }
        
        var initServiceCharge = function(){
            var VM = vm;
            var data = {orderOrApplyNo: window.orderNo,sourceType:window.sourceType};
            if(data.sourceType == '1'){
                getCompanyId(data.orderOrApplyNo);
            }else{
                var data2 = {applyNo: window.orderNo}
                $.getJSON(__ctx + "/flights/change/detail", data2, function (result) {
                     var orderNo =  result.obj.flightChangeApplyDTO.orderNo;
                     getCompanyId(orderNo);
                });
            }   
        }
        
        var getCompanyId = function(orderNo,policyType){
            var data = {orderNo: orderNo};
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                var companyId = result.obj.bookPersonDTO.bookCompanyId;
                getServiceCharge(companyId);
            });
        }
        
        var getServiceCharge=function(companyId){
            var VM = vm;
            var policyType = VM.passengers[0].flightSegmentInfos[0].policyType;
            var serviceChargeData = {companyId:companyId,serviceType:2,policyType:policyType};                                     
            $.getJSON(__ctx + "/servicefee/da", serviceChargeData, function (result) {
            	var tempServiceCharge = 0;
            	if(result && result.obj && result.obj.chargeWay==2){
            		tempServiceCharge = result.obj.amount;
                }
                VM.serviceCharge = tempServiceCharge;
            });
        }
        
        var vm = new Vue({
            el: '#flightVM',
            data: {
                flights: [],
                passengers: [],
                selected: [[]],
                flightOrder: {},
                order: {},
                pnr:"",
                flag: false,
                refundFee:0,
                serviceCharge:0
            },
            ready: function () {
                var data = {orderNo: window.orderNo,sourceType:window.sourceType};

                $.getJSON(__ctx + "/flights/getRefundFlightSegments", data, function (result) {
                    flightsFunc && flightsFunc(result.obj);
                    vm.flights = result.obj;
                });

                $.getJSON(__ctx + "/flights/getCanRefundPassengerSegmentInfos", data, function (result) {
                    refundFunc && refundFunc(initRefund(result.obj), result.obj);
                    vm.passengers = result.obj;
                    vm.selected = initSelected(result.obj);
                    initRefundFee();
                    initServiceCharge();
                    window.setTimeout(function(){
                    	$("[data-toggle='popover']").popover({html : true });
                    },100);
                });
                $.getJSON(__ctx + "/flights/getPnr", data, function (result) {
	                  vm.pnr = result.obj;    
	              });
                setTimeout(initTips, 500);
//                $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
//                    vm.order = result.obj;
//                    if (parseInt(vm.order.flightOrderDTO.flightOrderStatus) < 12) {
//                        vm.flag = false;
//                    } else {
//                        vm.flag = true;
//                    }
//                });
            },
            methods: {
                getTicketStatus: function (index,ticketNo,passengerName) {
                    var startPortCode = this.flights[index].startPortCode;
                    var endPortCode = this.flights[index].endPortCode;
                    var airlineCompanyCode = this.flights[index].airlineCompanyCode;
                    $.ajax({
                        url: __ctx + "/flightOrder/getTicketLastStatus",
                        type : "POST",
                        data:{
                            ticketNo:ticketNo,
                            startPortCode:startPortCode,
                            endPortCode:endPortCode,
                            airlineCode:airlineCompanyCode,
                            passengerName:passengerName
                        },
                        datatype:"json",
                        error:function(data){
                            toastr.error("获取票号状态失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success:function(data){
                            if(data.result){
                                $("#ticketNo"+index+"_"+ticketNo).text("("+data.obj+")");
                                $("#ticketNo"+index+"_"+ticketNo).css("color","red");
                            }else{
                                toastr.error(data.message,"", {timeOut: 1000, positionClass: "toast-top-center"});
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
        
        tc.ns('tc.flight.refund.pnr', function () {
            return _.cloneDeep(vm.pnr);
        });

        vm.$watch('selected', function (val) {
            var arr = _.cloneDeep(val);
            var oldPassengers = _.cloneDeep(vm.passengers);
            var passengers = _.filter(_.map(arr, function (sub, pIndex) {
                sub = sub.sort();
                var passenger = oldPassengers[pIndex];
                passenger.flightSegmentInfos = _.map(sub, function (index) {
                    return passenger.flightSegmentInfos[index];
                });
                if (passenger.flightSegmentInfos.length == 0) {
                    return null;
                }
                return passenger;
            }));
            passengersFunc && passengersFunc(passengers,vm.refundFee,vm.serviceCharge);
        });

        return {
            setFlightOrder: function (flightOrder) {
                vm.flightOrder = flightOrder;
            }
        };
        
        function initTips() {
        
            var defaultConfig = {container: 'body'};

            var genTrs = function (trs) {
                var html = '';
                _.forEach(trs, function (tds) {
                    html += '<tr>';
                    _.forEach(tds, function (val) {
                        html += '<td style="min-width: 50px;text-align: left;">' + val + '</td>';
                    });
                    html += '</tr>';
                });
                return html;
            };

            var genTableTemplate = function (ths, trs) {
                var template = '<div><table class="flightTipTable" style="background-color: #000"><thead><tr>';
                _.forEach(ths, function (val) {
                    template += '<th>' + val + '</th>';
                });
                template += '</tr></thead><tbody>';
                template += genTrs(trs);
                template += '</tbody></table></div>';
                return template;
            };
            
            $('.priceTypes').each(function () {
                var selector$ = $(this);
                var pIndex = selector$.data('pindex');
                var index = selector$.data('index');
                var item = vm.passengers[pIndex].flightSegmentInfos[index];
                var segment = vm.flights[index];
                if (!item || !segment) {
                    return;
                }
                if (item.priceType!=1) {
                    return;
                }
                var template = genTableTemplate([], [
                    ['协议号：', segment.airlineCompany+'：'+item.agreementCode],
                    ['协议价：', item.agreementPrice]
                ]);

                selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
            });
        }

    });

    
});