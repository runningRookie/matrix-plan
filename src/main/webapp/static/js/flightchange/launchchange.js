$(document).ready(function () {

    $('.boot_date').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true, // 选择日期后自动关闭
        startDate: new Date()
    });

    var getChangeFee = function(sourceType){
    	var VM　= changeVM;
    	var cabin;
    	var depDate = moment(VM.segments[0].planBeginDate).format("YYYY-MM-DD");
    	var depTime = moment(VM.segments[0].planBeginDate).format("HH:mm");
    	$.ajax({
            type: "POST",
            url: __ctx + '/resource/getAirCabin',
            async: false,
            data: {
            	cabinCode:VM.passengers[0].flightSegmentInfos[0].seatCode,
            	airWaysCode:VM.segments[0].airlineCompanyCode
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
                airlineCode: VM.segments[0].airlineCompanyCode,
                fltNo: VM.segments[0].flightNo,
                depDate: depDate,
                cabinCode: VM.passengers[0].flightSegmentInfos[0].seatCode,
                baseCabinCode: cabin.accBaseCabinCode,
                baseCabinFare: VM.passengers[0].flightSegmentInfos[0].sameSeatClassAmount,
                fdFare: VM.passengers[0].flightSegmentInfos[0].currentWindowOpenPrice,
                fbc: VM.passengers[0].flightSegmentInfos[0].fbc,
                discount: VM.passengers[0].flightSegmentInfos[0].flightDiscount,
                startPort: VM.segments[0].startPortCode,
                endPort: VM.segments[0].endPortCode,
                depTime:depTime,
                shareFltCode:VM.segments[0].carrierFlightCompanyCode,
                shareFltNo:VM.segments[0].carrierFlightNo,
                useOldFd:true,
                flightAmount: VM.passengers[0].flightSegmentInfos[0].flightAmount,
                //flightQueryResultKey: VM.segments[0].flightQueryResultKey,
                //flightInfoKey:VM.segments[0].flightInfoKey,
                //cabinInfoKey:VM.passengers[0].flightSegmentInfos[0].cabinInfoKey,
                orderOrApplyNo: window.orderOrApplyNo,
                sourceType:window.sourceType,
                priceType:VM.passengers[0].flightSegmentInfos[0].priceType,
                passengerClass:VM.passengers[0].passenger.passengerClass
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
                if (!data.obj) {
                    return;
                }
                VM.changeFee = data.obj.endorsePriceFromCustomer;
            }
        });
    }
    
    var changeVM = new Vue({
        el: '#changeVM',
        data: {
            orderOrApplyNo: window.orderOrApplyNo,
            sourceType:window.sourceType,
            segments:[],
            passengers:[],
            order:{},
            flightChangeApplyDetail:{},
            segmentInfoIds:[],
            changeDate:"",
            paymentType:"",
            flag:false,
            changeFee:0,
            freeChangeFlag:"",
            changeable:true
        },
        ready: function () {
            var VM  = this;
            var data = {orderOrApplyNo: window.orderOrApplyNo,sourceType:window.sourceType};
            $.getJSON(__ctx + "/flights/querySegments", data, function (result) {
                VM.segments = result.obj;
            });
            if(window.sourceType == '1'){
                var data = {orderNo: window.orderOrApplyNo};
                $.getJSON(__ctx + "/orderdetails/searchPassengerSegmentInfos", data, function (result) {
                    VM.passengers = result.obj;
                   
                });
                $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                    VM.order = result.obj;                                      
                    if(!result.obj || !result.obj.flightOrderDTO){
                        window.location.href = __ctx+"/common/pageNotFound";
                    }
                    VM.flag=true;
                    window.setTimeout(function(){
                        VM.paymentType = VM.order.orderMainDTO.paymentType;
                        if(VM.paymentType=='n'){
                        	$("#month_pay").attr('disabled','disabled');
                        }                       
                    },100);                   
                });
                /*window.setTimeout(function(){
                	getChangeFee();
                },1000);*/
            }else{
                var data = {changeApplyNo: window.orderOrApplyNo};
                $.getJSON(__ctx + "/flights/queryChangePassengerSegmentInfo", data, function (result) {
                    VM.passengers = result.obj;
                    
                });
                var data2 = {applyNo: window.orderOrApplyNo};
                $.getJSON(__ctx + "/flights/change/detail", data2, function (result) {
                    VM.flightChangeApplyDetail = result.obj;    
                    VM.flag=true;
                    window.setTimeout(function(){
                    	VM.paymentType = VM.flightChangeApplyDetail.flightChangeApplyDTO.paymentType;
                    	if(VM.paymentType=='n'){
                        	$("#month_pay").attr('disabled','disabled');
                        }                 	
                    },100);
                    if(!result.obj || !result.obj.flightChangeApplyDTO){
                        window.location.href = __ctx+"/common/pageNotFound";
                    }                  
                });
                
            }
            window.setTimeout(function(){
            	getChangeFee();
            },1000);
            setTimeout(initTips, 500);
        },
        methods: {
            searchChangeFlight:function(){
            	if(changeVM.segments.length>1){
            		toastr.error("真往返无法申请改期!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
            	}
                if(changeVM.segmentInfoIds.length==0){
                    toastr.error("请先选择需要改期的乘客信息!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if(!changeVM.changeDate){
                    toastr.error("请先选择改期日期!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if(!changeVM.paymentType){
                    toastr.error("请先选择支付方式!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                var data={
                    orderOrApplyNo: window.orderOrApplyNo,
                    sourceType:window.sourceType,
                    segmentInfoIds:changeVM.segmentInfoIds,
                    changeDate:changeVM.changeDate,
                    paymentType:changeVM.paymentType,
                    segmentId:changeVM.segments[0].id,
                    changeFee:changeVM.changeFee,
                    flightAmount:changeVM.passengers[0].flightSegmentInfos[0].flightAmount,
                    freeChangeFlag:changeVM.freeChangeFlag,
                    rescheduledType:'0',
                    airCode:changeVM.segments[0].airlineCompanyCode
                }
                var changeSearchFlightDataDTO = {
                    orderOrApplyNo: window.orderOrApplyNo,
                    sourceType:window.sourceType,
                    segmentInfoIds:changeVM.segmentInfoIds,
                    segmentId:changeVM.segments[0].id
                }
                this.checkTicketStatus(changeSearchFlightDataDTO);
                if(!changeVM.changeable){
                	toastr.error("票号状态异常", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
            	}
                $("input:checkbox[name='passengerSegment']").attr("checked", false);
                var action = __ctx + '/flights/searchChangeFlight';
                var form = $("<form></form>");
                form.attr('action', action);
                form.attr('method', 'post');
                var input = $("<input type='text' id='searchdate' name='changeSearchFlightData'/>");
                form.append(input);
                form.appendTo("body")
                form.css('display', 'none');
                $("#searchdate").val(JSON.stringify(data));
                form.submit();
            },
            selectPassengerSegment:function(index,item){
                if ($("input:checkbox[name='passengerSegment']:eq(" + index + ")").is(":checked")) {
                    changeVM.segmentInfoIds.$set(changeVM.segmentInfoIds.length, item.flightSegmentInfos[0].id);
                } else {
                    changeVM.segmentInfoIds.$remove(item.flightSegmentInfos[0].id);
                }
            },
            checkTicketStatus:function(params) {
            	$.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url:  __ctx + '/flights/change/checkTicketStatus',
                    data: JSON.stringify(params),
                    dataType: "json",
                    async : false,
                    success: function (result) {
                    	changeVM.changeable = result.obj;
                    }
                });
            }
        }
    });

    
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
            var item = changeVM.passengers[pIndex].flightSegmentInfos[0];
            var segment = changeVM.segments[0];
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