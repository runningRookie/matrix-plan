$(document).ready(function () {



    tc.ns('tc.flight.refund.segments', function (refundFunc) {

	        var initRefund = function (passengers) {
	            var refundChangeSign = {};
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
                    refundApply:{}
                },
                ready: function () {
                    var data = {refundApplyNo: window.refundApplyNo};
                    $.getJSON(__ctx + "/flights/getFlightSegmentsByApplyNo", data, function (result) {
                        flightVM.flights = result.obj;
                    });

                    $.getJSON(__ctx + "/flights/getRefundPassengerSegmentInfos", data, function (result) {
                        refundFunc && refundFunc(initRefund(result.obj), result.obj);
                        flightVM.passengers = result.obj;
                        window.setTimeout(function(){
                        	$("[data-toggle='popover']").popover({html : true });
    					},100);
                    });

                    $.getJSON(__ctx + "/flights/getRefundApplyInfo", data, function (result) {
                    	flightVM.refundApply = result.obj;
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


//        vm.$watch('selected', function (val) {
//            var oldPassengers = _.cloneDeep(vm.passengers);
//            var passengers = _.filter(_.map(val, function (sub, pIndex) {
//                var passenger = oldPassengers[pIndex];
//                passenger.flightSegmentInfos = _.map(sub, function (index) {
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