$(document).ready(function () {
    var defaultConfig = {container: 'body'};
    
    var initSelected = function (passengers) {
    	return _.map(passengers, function () {
    		return [];
    	});
    };
    
    var vm = new Vue({
    	el: '#recordedChangInfoVM',
    	data: {
    		selected: [[]],
    		changeSearchFlightData:changeSearchFlightData,
    		segmentDetail:{},
    		order: {},
    		changeOrder:{},
    		passengerInfo:[],
    		refundChangeSign:{
    			refundInfo:{},
    			changeInfo:{},
    			signInfo:{}
    		},
    		newSegment:{
    			fuelCost:"",
    			capitalCost:"",
    			flightAmount:"",
    			startTerminal:"",
    			endTerminal:"",
    			startPortCode:"",
    			endPortCode:"",
    			priceType:"",
    			currentWindowOpenPrice:"",
    			sameSeatClassAmount:"",
    			seatClassCode:"",
    			airlineCompany:"",
    			seatCode:"",
    			flightDiscount:""
    		},
    		newAmount:{
    			changeFee:"0",
    			upgradeCost:"0",
    			serviceCharge:"0",
    			changeAmount:"0"
    		}
    	},
    	ready: function () {
    		
    		this.getRecordedSingleDetail();
    		
    		window.setTimeout(function () {
    			$('.boot_date').datetimepicker({
    				minView: "hour", // 选择日期后，跳转去选择时分
    				format: "yyyy-mm-dd hh:ii ", // 选择日期后，文本框显示的日期格式
    				language: 'zh-CN', // 汉化
    				autoclose: true, // 选择日期后自动关闭
    				startDate: new Date()
    			});
    		}, 200);
    		
    		/*$.getJSON(__ctx + "/orderdetails/searchPassengerSegmentInfos", data, function (result) {
    			vm.passengers = result.obj;
    			vm.selected = initSelected(result.obj);
    			window.setTimeout(function () {
    				$("[data-toggle='popover']").popover({html: true});
    				
    				$('.originPriceTypes').each(function () {
    					var selector$ = $(this);
    					var pIndex = selector$.data('pindex');
    					var index = selector$.data('index');
    					var item = vm.passengers[pIndex].flightSegmentInfos[index];
    					var segment = vm.flights[index];
    					if (!item || !segment) {
    						return;
    					}
    					if (item.priceType != 1) {
    						return;
    					}
    					var template = tc.flight.detail.utils.genTableTemplate([], [
    					                                                            ['协议号：', segment.airlineCompany + '：' + item.agreementCode],
    					                                                            ['协议价：', item.agreementPrice]
    					                                                            ]);
    					
    					selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
    				});
    			}, 100);
    		});*/
    		
    	},
    	methods: {
    		getTicketStatus: function (index, ticketNo, passengerName) {
    			var startPortCode = this.segmentDetail.startPortCode;
    			var endPortCode = this.segmentDetail.endPortCode;
    			var airlineCompanyCode = this.segmentDetail.airlineCompanyCode;
    			$.ajax({
    				url: __ctx + "/flightOrder/getTicketLastStatus",
    				type: "POST",
    				data: {
    					ticketNo: ticketNo,
    					startPortCode: startPortCode,
    					endPortCode: endPortCode,
    					airlineCode: airlineCompanyCode,
    					passengerName: passengerName
    				},
    				datatype: "json",
    				error: function (data) {
    					toastr.error("获取票号状态失败!", "", {timeOut: 2000, positionClass: "toast-top-center"});
    				},
    				success: function (data) {
    					if (data.result) {
    						$("#ticketNo" + index + "_" + ticketNo).text("(" + data.obj + ")");
    						$("#ticketNo" + index + "_" + ticketNo).css("color", "red");
    					} else {
    						toastr.error(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
    					}
    				}
    			});
    		},
    		showStopSite: function (flightStopSites, index) {
    			var stopsites = "";
    			stopsites += "<table style='width:100%;padding:0px;' class='table table-bordered'>";
    			stopsites += "<thead>";
    			stopsites += "<tr>";
    			stopsites += "<th></th>";
    			stopsites += "<th>经停机场</th>";
    			stopsites += "<th>到达时间</th>";
    			stopsites += "<th>起飞时间</th>";
    			stopsites += "<th>经停时长</th>";
    			stopsites += "</tr>";
    			stopsites += "</thead>";
    			stopsites += "<tbody>";
    			$(flightStopSites).each(function (i, stopSite) {
    				stopsites += "<tr>";
    				stopsites += "<th>" + (i + 1) + "</th>";
    				stopsites += "<th>" + stopSite.stopPort + "</th>";
    				stopsites += "<th>" + stopSite.arriveTime + "</th>";
    				stopsites += "<th>" + stopSite.leaveTime + "</th>";
    				if (stopTime > 60) {
    					stopsites += "<th>" + stopSite.stopTime / 60 + "小时" + stopSite.stopTime % 60 + "分钟" + "</th>";
    				} else {
    					stopsites += "<th>" + stopSite.leaveTime + "分钟" + "</th>";
    				}
    				stopsites += "</tr>";
    			})
    			stopsites += "</tbody>";
    			stopsites += "</table>";
    			var option = {
    					template: "<div class='popover' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content' style='padding:0px;'></div></div>",
    					content: stopsites,
    					container: 'body',
    					html: true
    			}
    			
    			$('#testButtton' + index).popover(option).popover('show');
    			
    		},
    		getRecordedSingleDetail:function(){
    			var vm = this;
    			$.ajax({
    				type: "POST",
    				contentType: "application/json",
    				url: __ctx + '/flights/'+'change/recordedSingleDetail',
    				data: JSON.stringify(this.changeSearchFlightData),
    				dataType: "json",
    				success: function (data) {
    						if(data.result){
    							//console.log(JSON.stringify(data.obj));
    							vm.segmentDetail = data.obj.flightSegment;
    							vm.passengerInfo = data.obj.passengerSegmentInfoVOs;
    							if(vm.changeSearchFlightData.sourceType == '1'){
    								vm.order = data.obj.flightOrderVO;
    							}else{
    								vm.changeOrder = data.obj.flightChangeApplyVO;
    							}
    							
    							vm.newSegment.startTerminal = vm.segmentDetail.startTerminal;
    							vm.newSegment.endTerminal = vm.segmentDetail.endTerminal;
    							vm.newSegment.startPortCode = vm.segmentDetail.startPortCode;
    							vm.newSegment.endPortCode = vm.segmentDetail.endPortCode;
    							vm.newSegment.sameSeatClassAmount = vm.passengerInfo[0].flightSegmentInfo.sameSeatClassAmount;
    							vm.newSegment.currentWindowOpenPrice = vm.passengerInfo[0].flightSegmentInfo.currentWindowOpenPrice;
    							vm.newSegment.fuelCost = vm.passengerInfo[0].flightSegmentInfo.fuelCost;
    							vm.newSegment.capitalCost = vm.passengerInfo[0].flightSegmentInfo.capitalCost;
    							vm.newSegment.flightAmount = vm.passengerInfo[0].flightSegmentInfo.flightAmount;
    							vm.newSegment.priceType = vm.passengerInfo[0].flightSegmentInfo.priceType;
    							
    							vm.newSegment.seatClassCode = vm.passengerInfo[0].flightSegmentInfo.seatClassCode;
    							vm.newSegment.seatCode = vm.passengerInfo[0].flightSegmentInfo.seatCode;
    							vm.newSegment.flightDiscount = vm.passengerInfo[0].flightSegmentInfo.flightDiscount;
    							vm.newSegment.airlineCompany = vm.segmentDetail.airlineCompany;
    							
    							vm.refundChangeSign.refundInfo = vm.passengerInfo[0].flightRefundInfoVO;
    							vm.refundChangeSign.changeInfo = vm.passengerInfo[0].flightChangeInfoVO;
    							vm.refundChangeSign.signInfo = vm.passengerInfo[0].flightSignInfoVO;
    							
    							window.setTimeout(function () {
    			    				$("[data-toggle='popover']").popover({html: true});
    			    				
    			    				$('.originPriceTypes').each(function () {
    			    					var selector$ = $(this);
    			    					var pIndex = selector$.data('pindex');
    			    					var item = vm.passengerInfo[pIndex].flightSegmentInfo;
    			    					var segment = vm.segmentDetail;
    			    					if (!item || !segment) {
    			    						return;
    			    					}
    			    					if (item.priceType != 1) {
    			    						return;
    			    					}
    			    					var template = tc.flight.detail.utils.genTableTemplate([], [
    			    					                                                            ['协议号：', segment.airlineCompany + ' ' + item.agreementCode],
    			    					                                                            ['协议价：', item.agreementPrice]
    			    					                                                            ]);
    			    					selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
    			    				});
    			    			}, 100);
    						}else{
        						toastr.error(data.message, "", toastrConfig);
        					}
    					}
    				});
    			
    		},
    		updateFee:function(){
    			var exdata = /^[0-9]+([.]{1}[0-9]+){0,1}$/;//整数或者小数
    			if(exdata.test(this.newSegment.changeFee) && exdata.test(this.newSegment.upgradeCost)){
    				this.newSegment.changeAmount = parseFloat(this.newSegment.changeFee) + parseFloat(this.newSegment.upgradeCost);
    			}
    		},
    		changeBook:function () {
    			//提交改期
    			var VM = this;
    			var ex = /^\d+$/;//数字
    			var exdata = /^[0-9]+([.]{1}[0-9]+){0,1}$/;//整数或者小数
    			var exE=/^[A-Z]{1,2}$/;//两位大写字母
    			var exE2=/^[A-Z]{1}$/;//1位大写字母
    			var exdate=/^((?:19|20)\d\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;//日期
    			var exCH = /^[\u4E00-\u9FA5]+$/;//中文
    			var exNuEn = /^[a-zA-Z0-9]+$/;//数字或字母
    			var data = {
    					cabin:{}
    			};
    			var flightData = {};
    			//flightData.depCode//出发城市三字码
    			//flightData.arrCode//到达城市三字码
    			flightData.airlineCode = $("#flightNo").val().substr(0,2);//航司二字码
    			flightData.airlineName = vm.newSegment.airlineCompany;//航司的中文名字
    			flightData.fltNo = $("#flightNo").val().substr(2);//航班号
    			flightData.depDate = $("#planBeginDate").val().split(" ")[0];//出发日期
    			flightData.depTime = $("#planBeginDate").val().split(" ")[1];//起飞时间
    			flightData.arrTime = $("#planEndDate").val().split(" ")[1];//抵达时间
    			flightData.depStationCode = VM.newSegment.startTerminal;// 起始航站楼二字码
    			flightData.arrStationCode = VM.newSegment.endTerminal;//抵达航站楼二字码
    			flightData.cabinSpecailName = $("#seatClass").find("option:selected").text().trim();//舱等
    			flightData.cabinType = VM.newSegment.seatClassCode;//舱位
    			flightData.cabinCode = VM.newSegment.seatCode;//舱位代码
    			flightData.baseCabinCode = "";//基准舱位代码?
    			flightData.depPortCode = VM.newSegment.startPortCode;//出发机场三字码
    			flightData.arrPortCode = VM.newSegment.endPortCode;//到达机场三字码
    			flightData.baseCabinFare = VM.newSegment.sameSeatClassAmount;//基准舱位价格
    			flightData.fdFare = VM.newSegment.currentWindowOpenPrice;//fd价格
    			flightData.discount = VM.newSegment.flightDiscount;//具体折扣
    			flightData.fule = VM.newSegment.fuelCost;//燃油费
    			flightData.departureTax = VM.newSegment.capitalCost;//基建
    			flightData.fare = VM.newSegment.flightAmount;//销售价
    			if(VM.newSegment.priceType == '1'){
    				flightData.isAgreeFare = 'Y';//是否协议价
    			}else{
    				flightData.isAgreeFare = 'N';
    			}
    			
    			data.changeSearchFlightData = this.changeSearchFlightData;
    			data.changeSearchFlightData.changeDate=flightData.depDate;
    			data.cabin.flightData = flightData;
    			data.bookPnr = false;
    			data.changeFee = VM.newAmount.changeFee;
    			data.upgradeCost = VM.newAmount.upgradeCost;
    			data.serviceCharge = VM.newAmount.serviceCharge;
    			//调整项
    			data.refundInfo = "";
    			data.changeInfo = "";
    			data.signInfo = "";
    			
    			if ($("#planBeginDate").val() === "" || $("#planEndDate").val() === "" || $("#planBeginDate").val() ===null || $("#planEndDate").val() ===null || flightData.depDate===null || flightData.depDate==="" || flightData.depTime ===null || flightData.depTime==="" || flightData.arrTime ===null || flightData.arrTime==="") {                       
    				toastr.error("请选择改期的日期和时间!", "", toastrConfig);
    				return;
    			}
    			if(new Date($("#planBeginDate").val()).getTime() > new Date($("#planEndDate").val()).getTime()){
    				toastr.error("到达时间一定要大于起飞时间!", "", toastrConfig);
    				return;
    			}
    			if (flightData.airlineName ===null || flightData.airlineName==="" || !exCH.test(flightData.airlineName)) {                       
    				toastr.error("请输入航司中文名称!", "", toastrConfig);
    				return;
    			}
    			if((flightData.depStationCode != "" && !exNuEn.test(flightData.depStationCode)) || (flightData.arrStationCode != "" && !exNuEn.test(flightData.arrStationCode))){
    				toastr.error("请输入合法的航站楼!", "", toastrConfig);
    				return;
    			}
    			if ($("#flightNo").val()==="" || $("#flightNo").val() === null || flightData.airlineCode ===null || flightData.airlineCode==="" || flightData.fltNo ===null || flightData.fltNo==="" || !exNuEn.test(flightData.fltNo) || !exNuEn.test(flightData.airlineCode)) {                       
    				toastr.error("请输入合法的航班号!", "", toastrConfig);
    				return;
    			}
    			if (flightData.cabinSpecailName ===null || flightData.cabinSpecailName==="" || flightData.cabinType ===null) {                       
    				toastr.error("请选择航班舱等!", "", toastrConfig);
    				return;
    			}
    			if (flightData.cabinCode ===null || flightData.cabinCode==="" || !exNuEn.test(flightData.cabinCode)) {                       
    				toastr.error("请输入合法的舱位!", "", toastrConfig);
    				return;
    			}
    			if (flightData.discount ===null || flightData.discount==="" || !exdata.test(flightData.discount) || flightData.discount<0) {                       
    				toastr.error("请输入合法的折扣!", "", toastrConfig);
    				return;
    			}
    			if (data.changeFee===null || data.changeFee===""  || !ex.test(data.changeFee) || data.changeFee<0) {                       
    				toastr.error("请输入合法的改期费!", "", toastrConfig);
    				return;
    			}
    			if (data.upgradeCost ===null || data.upgradeCost==="" || !ex.test(data.upgradeCost) || data.upgradeCost<0) {                       
    				toastr.error("请输入合法的升舱费!", "", toastrConfig);
    				return;
    			}
    			if (data.serviceCharge ===null || data.serviceCharge==="" || !ex.test(data.serviceCharge) || data.serviceCharge<0) {                       
    				toastr.error("请输入合法的服务费!", "", toastrConfig);
    				return;
    			}
    			if (data.serviceCharge>100) {                       
    				toastr.error("服务费不能超过100!", "", toastrConfig);
    				return;
    			}
    			var url=__ctx + '/flights/'+'creatChangeApply';
    			$.ajax({
    				type: "POST",
    				contentType: "application/json",
    				url: url,
    				data: JSON.stringify(data),
    				dataType: "json",
    				success: function (data) {
    					if(data.result){
    						console.log(JSON.stringify(data));
    						toastr.success("改期单创建成功, 2秒后跳转到改期单详情页", "", toastrConfig);
    						setTimeout(function () {
    							window.location.href=__ctx+"/flights/changes/"+data.obj.applyNo;
    						}, 2000);
    					}else{
    						toastr.error(data.message, "", toastrConfig);
    					}
    				}
    			}); 
    		}
    		
    	}
    });
    
    /*vm.$watch('selected', function (val) {
    	var arr = _.cloneDeep(val);
    	var oldPassengers = _.cloneDeep(vm.passengers);
    	var passengers = _.filter(_.map(arr, function (sub, pIndex) {
    		sub = sub.sort();
    		var passenger = oldPassengers[pIndex];
    		passenger.flightSegmentInfos = _.map(sub, function (index) {
    			return _.assign(passenger.flightSegmentInfos[index], {flightIndex: index});
    		});
    		if (passenger.flightSegmentInfos.length == 0) {
    			return null;
    		}
    		return passenger;
    	}));
    	passengersFunc && passengersFunc(passengers);
    });
    
    return {
    	setFlightOrder: function (flightOrder) {
    		vm.flightOrder = flightOrder;
    	}
    };*/
});