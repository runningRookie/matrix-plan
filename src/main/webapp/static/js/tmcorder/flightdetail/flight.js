$(document).ready(function () {
    tc.ns('tc.flight.refund.segments', function (refundFunc) {
	        var initRefund = function (passengers) {
	            var refundChangeSign = {};
	            if(!passengers || !passengers[0]){
	                return refundChangeSign;
                }
	            refundChangeSign.refundInfo = passengers[0].flightRefundInfoDTO;
	            refundChangeSign.changeInfo = passengers[0].flightChangeInfoDTO;
	            refundChangeSign.signInfo = passengers[0].flightSignInfoDTO;
	            return refundChangeSign;
	        };

            var flightVM = new Vue({
                el: '#flightVM',
                data: {
                    flights: [],
                    passengers: [],
                    lowestPrice:[],
                    order:{},
					rtResponseDTO:{},
                    flag:false,
                    segmentId:0,
                    seatNo:""
                },
                ready: function () {
                	var data = {orderNo: window.orderNo};
                	$.getJSON(__ctx + "/orderdetails/searchFlightSegment", data, function (result) {
                		flightVM.flights = result.obj;
                		setTimeout(initTips, 500);
                    });

                	$.getJSON(__ctx + "/orderdetails/searchPassengerSegmentInfos", data, function (result) {
                        refundFunc && refundFunc(initRefund(result.obj), result.obj);
                        flightVM.passengers = result.obj;
                        window.setTimeout(function(){
                        	$("[data-toggle='popover']").popover({html : true });
							$(".tip-Black .title").on('click', function() {
							$(this).closest('.tip-Black').hide();
						});
						},100);
                    });

                    $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                        flightVM.order = result.obj;
                        if(parseInt(flightVM.order.flightOrderDTO.flightOrderStatus) < 12){
                            flightVM.flag = false;
                        }else{
                            flightVM.flag = true;
                        }
                    });
                },
                methods:{
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
					pnrInfo: function(pIndex){

						var pnr = flightVM.order.flightOrderDTO.pnr;
						var office = flightVM.order.flightOrderDTO.officeCode;
						var protocolNumber = flightVM.passengers[0].flightSegmentInfos[0].agreementCode;  
						$.ajax({
                            url: __ctx + "/flightdetail/pnrinfo",
                            type : "GET",
                            data:{
                            	pnr:pnr,
								office:office,
								protocolNumber: protocolNumber
                            },
                            datatype:"json",
                            error:function(data){
                                toastr.error("获取pnr详情失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                            },
                            success:function(data){
                                $('.pnrInfoTip'+pIndex).show();
								 flightVM.rtResponseDTO = data.obj;
								 if(!data.obj){
								 	flightVM.rtResponseDTO = {};
								 	flightVM.rtResponseDTO.pnrInfo={};
								 }
							},
						});
					},
					
                    selectLowestPrice: function (id,index) {
	                    var lowestPriceStr="";
	                    $.ajax({
                            url: __ctx + "/flightOrder/getLowestPrice",
                            type : "POST",
                            data:{
                            	id:id
                            },
                            datatype:"json",
                            error:function(data){
                                toastr.error("获取最低价失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                            },
                            success:function(data){
                                if(data.result){
                                	var lowestPriceList = data.obj;
                                	lowestPriceStr +="<table style='width:100%;padding:0px;' class='table table-bordered'>";
                                	lowestPriceStr +="<thead>";
                                	lowestPriceStr +="<tr>";
                                	lowestPriceStr +="<th width='280px'></th>";
                                	lowestPriceStr +="<th width='160px'>航班号</th>";
                                	lowestPriceStr +="<th width='160px'>舱等/折扣</th>";
                                	lowestPriceStr +="<th width='100px'>机型</th>";
                                	lowestPriceStr +="<th width='160px'>出发日期/时间</th>";
            	                    lowestPriceStr +="<th width='160px'>到达日期/时间</th>";
            	                    lowestPriceStr +="<th width='190px'>价格(不含税)</th>";
            	                    lowestPriceStr +="<th width='160px'>损失金额</th>";
            	                    lowestPriceStr +="</tr>";
            	                    lowestPriceStr +="</thead>";
            	                    lowestPriceStr +="<tbody>";
            	                    $(lowestPriceList).each(function (i, lowestPrice) {
            	                    	lowestPriceStr +="<tr>";
            	                    	lowestPriceStr +="<th>"+lowestPrice.priceName+"</th>";
            	                    	lowestPriceStr +="<th>"+lowestPrice.flightNo+"</th>";
            	                    	lowestPriceStr +="<th>"+lowestPrice.flightCabinClass+"/"+lowestPrice.flightDiscount+"</th>";
            	                    	lowestPriceStr +="<th>"+lowestPrice.planModel+"</th>";
            	                    	lowestPriceStr +="<th>"+lowestPrice.flightBeginDate+"</th>";
            	                    	lowestPriceStr +="<th>"+lowestPrice.flightEndDate+"</th>";
            	                    	lowestPriceStr +="<th>"+lowestPrice.flightNoTaxPrice+"</th>";
            	                    	lowestPriceStr +="<th>"+lowestPrice.flightLossAmount+"</th>";
            	                    	lowestPriceStr +="</tr>";
            	                    })
            	                    lowestPriceStr +="</tbody>";
            	                    lowestPriceStr +="</table>";
            	                    var option={
            	                            template:"<div class='popover' style='max-width:100%' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content' style='padding:0px;'></div></div>",
            	                            content:lowestPriceStr,
            	                            container:'body',
            	                            html:true
            	                        }
            	                    $('#lookButtton'+index).popover(option).popover('show');


                                }else{
                                    toastr.error(data.message,"", {timeOut: 1000, positionClass: "toast-top-center"});
                                }
                            }
                        });
                    },
                    selectSeatNo:function(id){
                        flightVM.segmentId = id;
                        flightVM.seatNo = "";
                        $("#selectSeatNo").modal({
                            show : true,
                        //   remote : __ctx + "/itinerary/bookpersonlist",
                            backdrop : 'static'
                        });
                    },
                    saveSeatNo:function(){
                        $.ajax({
                            url: __ctx + "/orderdetails/saveSeatNo",
                            type : "POST",
                            data:{
                                segmentId:flightVM.segmentId,
                                seatNo:flightVM.seatNo
                            },
                            datatype:"json",
                            error:function(data){
                                toastr.error("保存座位号失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                            },
                            success:function(data){
                                if(data.result){
                                    toastr.success("座位号保存成功!","", {timeOut: 1000, positionClass: "toast-top-center"});
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

        function initTips() {
            var defaultConfig = {container: 'body'};
            var craftTypes = ['', '小型飞机', '中型飞机', '大型飞机'];

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
                var template = '<div><table class="flightTipTable ' + (tc.arr.isNotEmpty(ths) ? 'table dataTable' : '') + '" style="background-color: #000"><thead>';
                if (tc.arr.isNotEmpty(ths)) {
                    template += '<tr>';
                    _.forEach(ths, function (val) {
                        template += '<th>' + val + '</th>';
                    });
                    template += '</tr>';
                }
                template += '</thead><tbody>';
                template += genTrs(trs);
                template += '</tbody></table></div>';
                return template;
            };

            $('.planeModels').each(function () {
                var selector$ = $(this);
                var index = selector$.data('index');
                var item = flightVM.flights[index];
                if (!item) {
                    return;
                }

                $.getJSON(__ctx + "/basicinfo/aircrafts/" + item.planModel, function (data) {
                    var air = data.obj;
                    if (!air) {
                        return;
                    }
                    var template = genTableTemplate(['机型', '机型名称', '机型类型', '座位数'], [
                        [air.craftCode || '', air.craftName || '', craftTypes[air.acplaneType] || '', air.acseatCount || '']
                    ]);

                    selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
                });
            });

            $('.shareFlights').each(function () {
                var selector$ = $(this);
                var index = selector$.data('index');
                var item = flightVM.flights[index];
                if (!item) {
                    return;
                }
                var template = genTableTemplate(['实际承运航班'], [
                    [item.carrierFlightCompanyCode + item.carrierFlightNo]
                ]);

                selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
            });

            $('.violationReasons').each(function () {
                var selector$ = $(this);
                var pIndex = selector$.data('pindex');
                var index = selector$.data('index');
                var item = flightVM.passengers[pIndex].flightSegmentInfos[index];
                if (!item) {
                    return;
                }
                if (item.businessTravelPolicy.isViolation!=1) {
                    return;
                }
                var template = genTableTemplate([], [
                    ['违反内容：', item.businessTravelPolicy.violationContent.replace(/TTTTTTTTT/g,"<br>")],
                    ['违反原因：', item.businessTravelPolicy.violationReason]
                ]);

                selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
            });

            $('.priceTypes').each(function () {
                var selector$ = $(this);
                var pIndex = selector$.data('pindex');
                var index = selector$.data('index');
                var item = flightVM.passengers[pIndex].flightSegmentInfos[index];
                var segment = flightVM.flights[index];
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

            $('.ticketTips').each(function () {
                var selector$ = $(this);
                var pIndex = selector$.data('pindex');
                var item = flightVM.passengers[pIndex];
                if (!item) {
                    return;
                }
                if (!item.flightTicketDTO) {
                    return;
                }
                var map = ['', 'BSP', 'B2B', 'B2G', 'BOP', '官网'];
                var val = item.flightTicketDTO.ticketType;
                var template = genTableTemplate([], [
                    ['票种：', val && (map[val] || val)],
                    ['打票机号：', item.flightTicketDTO.ticketMachine]
                ]);

                selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
            });
        }
//        vm.$watch('selected', function (val) {
//            var oldPassengers = _.cloneDeep(vm.passengers);
//            var passengers = _.filter(_.map(val, function (sub, pIndex) {
//                var passenger = oldPassengers[pIndex];
//                passenger.flightSegmentInfos = _.map(‘sub, function (index) {
//                    return passenger.flightSegmentInfos[index];
//                });
//                if (passenger.flightSegmentInfos.length == 0) {
//                    return null;
//                }
//                return passenger;
//            }));
//            passengersFunc && passengersFunc(passengers);
//        });
    });
});