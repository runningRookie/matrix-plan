/*OP-hotelDetail酒店详情脚本-------------------朱辉20170214------------------------------*/
var book1 = {
	model:{
	    resourceId : window.resourceId,//酒店的ID
	    // resourceId:272772,
		startTime : window.startTime,//入住日期
		endTime :  window.endTime,//离店日期
		star : window.star,//星级
		// startTime:"2017-03-02",
		// endTime:"2017-03-03",
		// approval:[{"passengerId":1000000030,"passengerName":"秦非"}],//乘客人的信息
		approval:[],//乘客的信息
		hotelData : "",//备份酒店信息
		indexImg : "",//酒店Top-img的图片
		// bookingPerson:{"corporationId":123,"personId":1000000030,"personName":"肖月"},//预订人的信息
		bookingPerson:{},//预订人的信息
		imgNum:0,//图片数量
		obj:{},//获得相关酒店相关信息
		encrypt:{},//加密字符串
		bookPersonAndPassengers:window.bookPersonAndPassengers,//预订人与乘客信息
		tmcId:1,//tmcid
		travelPolicyNeed: [], // 差旅政策
		standardRule:"",//差旅标准
	},
	init:function(){
		this.bookPersonTmcId();//获取tmcid
		this.hotelDetail();//酒店详情信息加载
	},
	bookPersonTmcId:function(){
		var _this =this;
		var data = {
			employeeId: _this.model.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId
		}
		$.ajax({
			url :__ctx+"/hotel/queryEmployeeDetailById",
			data: data, 
			contentType: "application/json; charset=utf-8",
			dataType:"json",
			async:false,
			success:function(json){
				console.log(json.obj.tmcId)
				_this.model.tmcId = json.obj.tmcId;
			}
		})

	},
	hotelDetail:function(){
		$("#hotel-temp").html('<div class="hotel_list-loading" style="text-align:center;padding-top:200px;"><img src="http://img1.40017.cn/cn/comm/images/cn/public/transparent_loading_v2.gif" ><br>正在加载，请稍后</div>')
		var _this = this;
		var approvalChose= {"passengerId":0,"passengerName":""};
		var approvalAdd = [];//获取乘客信息
		for(var k=0;k<_this.model.bookPersonAndPassengers.passengers.length;k++){
		// approvalChose{"passengerId": _this.model.bookPersonAndPassengers.passengers[k].passengerEmployeeId,"passengerName":_this.model.bookPersonAndPassengers.passengers[k].passengerName}
		approvalChose.passengerId = _this.model.bookPersonAndPassengers.passengers[k].passengerEmployeeId;
		approvalChose.passengerName = _this.model.bookPersonAndPassengers.passengers[k].passengerName;
		approvalchose = {"passengerId":approvalChose.passengerId,"passengerName":approvalChose.passengerName};
		approvalAdd.push(approvalchose);
		}
		// console.log(approvalAdd)
        var bookPersonChose= {};//获取预订人的信息
	        bookPersonChose["corporationId"] = _this.model.bookPersonAndPassengers.bookPerson.bookCompanyId;
	        bookPersonChose["personId"] = _this.model.bookPersonAndPassengers.bookPerson.bookPersonEmployeeId;
	        bookPersonChose["personName"] = _this.model.bookPersonAndPassengers.bookPerson.bookPersonName; 
        _this.model.bookingPerson = bookPersonChose;
        _this.model.approval = approvalAdd
        // console.log(_this.model.approval);
		var requestData = {
				bookingPerson:_this.model.bookingPerson,
				resourceId : _this.model.resourceId,
				startTime : _this.model.startTime,
				endTime : _this.model.endTime,
				passengers : _this.model.approval,
				tmcId:_this.model.tmcId,
		}
		console.log(requestData)
		$.ajax({
			type:"POST",
			url :__ctx+"/hotel/getHotelDetail",
			data:JSON.stringify(requestData),
			contentType: "application/json; charset=utf-8",
			dataType:"json",
			async:true,
			success:function(json){
				$(".hotel_list-loading").hide();
				if(!json.success){
					NewPCPopHelper.alert("未查到该酒店信息，请查看其它酒店",function(){
						window.close();
					});
					return;
				}
				if(json.data.resourceProductsBaseInfo){ 
					
					var dataChose = json.data.resourceProductsBaseInfo;
					_this.model.hotelData = dataChose;
					//获取首张图片
					for(var i=0;i<json.data.resourceImages.length;i++){
						if(json.data.resourceImages[i].isResourceDefault==1){
							_this.model.indexImg = json.data.resourceImages[i].imageUrl;
						}
						break;
					}
					if(!_this.model.indexImg){ //没有默认Top-img图片，将酒店图片集合中的第一张作为Top-img图片
						_this.model.indexImg = json.data.resourceImages[0].imageUrl;
					}
					_this.model.imgNum = json.data.resourceImages.length;
					//酒店设施ID集合，进行筛选
					var FacilityList = [];
					for(var i=0;i<json.data.resourceFacilities.length;i++){
						FacilityList.push(json.data.resourceFacilities[i].facilityServicesId);
					}
					_this.getTravelPolicy();//获取乘客差旅政策
					//加载页面模板数据
					$("#hotel-temp").html(template('temp-hotel',{data:json.data,indexImg:_this.model.indexImg,est2List:FacilityList,star:_this.model.star,imgUlWaith:Math.ceil(json.data.resourceImages.length/2)*137+"px",travelPolicyNeeds:_this.model.travelPolicyNeed,standardRule:_this.model.standardRule}));
					$(".hotel-details-time>div>span").eq(0).text(_this.dateToWeek(_this.model.startTime));
					$(".hotel-details-time>div>span").eq(1).text(_this.dateToWeek(_this.model.endTime));
					$(".hotel-details-time>p").text("共"+_this.calculateDate(_this.model.startTime,_this.model.endTime)+"晚")
					console.log("json.data.resourceGPS===" + json.data.resourceGPS);
					/* 无资源时不显示右上角坐标，同时显示提示无资源方案  */
					if(json.data.resourceProductsBaseInfo.length>0 && json.data.minPrice>0){						
						$(".hotel-details-no").hide();
					}else{						
						$(".hotel-details-no").show();
					}
					//通过type==1,使用百度地图的坐标信息;
					for(var i=0;i<json.data.resourceGPS.length;i++){
						if(json.data.resourceGPS[i].type==1){
							//调用百度地图
							_this.baiduMapAPI(json.data.resourceGPS[i].lon,json.data.resourceGPS[i].lat,json.data.resourceName);
						    break;
						}
					}
					_this.detailFunc();//预订事件集合
			        _this.hotelTimeChangeFunc();//时间控件
			        _this.imgSlide();//加入图片滚动效果
			        _this.cancelRuleTip();//取消规则提示
					_this.travelPolicyTip();//差旅政策提示
				}
			},
			error:function(){
				alert("获取列表结束")
			}
		})		
	},
   //加入选择时间控件
	hotelTimeChangeFunc : function(){
		var _this = this;
		var cal = new $.Calendar({
			skin: "white",
			monthNum: 2
		});
		//计算最大离店日期
		var computeEndDate = function(T,DATE){
			var date = new Date();
			if(DATE){
				var dateList = DATE.split("-");
				date.setFullYear(+dateList[0],+dateList[1]-1,+dateList[2]);
			}			
			date.setDate(date.getDate()+T);
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			month=month<10?'0'+month:month;
			var day = date.getDate();
			day=day<10?'0'+day:day;
			return year+"-"+month+"-"+day;
		};
		$(".hotel-details-time").on("click","input",function(){
//			alert("ss");
			var $this = $(this);
			var startDate = new Date(),endDate = computeEndDate(60);            
			var currentDate= [$(".input_date").eq(0).val()];
			if($this.index(".input_date")==1){
				startDate = computeEndDate(1,$(".input_date").eq(0).val());
				var endDate1 = computeEndDate(60);//从当天到60天后的日期
				var endDate2 = computeEndDate(20,startDate);//从入住日期到20天后的日期
				//两个离店日期以最小的为准
				if(+(endDate1.replace(/\-/g,""))>+(endDate2.replace(/\-/g,""))){
					endDate = endDate2;
				}else{
					endDate = endDate1;
				}
			}
			cal.pick({
       			elem: $this,
	   			startDate:startDate,	
	   			endDate:endDate,   
	   			zIndex: "500",
				currentDate:currentDate,
       			fn:function(year, month, day){
		  			Month=month<10?'0'+month:month;
          			Day=day<10?'0'+day:day;
          			var chooseDate = year+"-"+Month+"-"+Day;
           			if($this.index(".hotel-details-time input")==1){
           				_this.model.endTime = chooseDate;
           				$(".hotel-details-time>div>span").eq(1).text(_this.dateToWeek(chooseDate));
           				$(".hotel-details-time>p").text("共"+_this.calculateDate(_this.model.startTime,_this.model.endTime)+"晚")
//           				_this.hotelDetail();//修改于 2017-6-21 20:18:29 cw
           			}else{
           				_this.model.startTime = chooseDate;
/*           				$(".hotel-details-time>p").text("共"+_this.calculateDate(_this.model.startTime,_this.model.endTime)+"晚")*/
	           			if(+($(".input_date").eq(0).val().replace(/\-/g,""))>=+($(".input_date").eq(1).val().replace(/\-/g,""))||+(computeEndDate(20,chooseDate).replace(/\-/g,""))<+(_this.model.endTime.replace(/\-/g,""))){
//	           				_this.model.endTime = computeEndDate(2,chooseDate);
	           				$(".hotel-details-time>div>span").eq(0).text(_this.dateToWeek(chooseDate));
//           					$(".input_date").eq(1).val(computeEndDate(1,chooseDate));
	           				$(".input_date").eq(1).click();
					    }else{
//		           			_this.hotelDetail();//修改于 2017-6-21 20:18:29 cw
					    	$(".input_date").eq(1).click();
					    }
           			}
       			}
  			});	
		});	
	},
	//百度地图
	baiduMapAPI : function(lon,lat,name){
  		var map = new BMap.Map("ditu"); 
  		map.enableScrollWheelZoom(true);//开启鼠标滚轮缩放
  		map.enableDragging(); //开启拖拽     
 		// 定义自定义覆盖物的构造函数  
 		function SquareOverlay(point,index,text){  
  			this._point = point;  
  			this._index = index; 
  			this._text = text;
 		}  
 		// 继承API的BMap.Overlay  
 		SquareOverlay.prototype = new BMap.Overlay(); 
 		// 实现初始化方法  
 		SquareOverlay.prototype.initialize = function(map){  
   		// 保存map对象实例  
    	this._map = map;      
    	// 创建div元素，作为自定义覆盖物的容器  
    	var div = document.createElement("div");  
    	div.setAttribute("class",'baidu-marker');
  		//div.setAttribute("data",this._index);
  		div.appendChild(document.createTextNode(this._text)); 
  		var p = this._span = document.createElement("p");
    	div.appendChild(p);
    	p.appendChild(document.createTextNode(this._index)); 
    	// 将div添加到覆盖物容器中  
    	map.getPanes().markerPane.appendChild(div);
  		$(map.getPanes().markerPane)    
    	// 保存div实例  
    		this._div = div;    
    		return div;  
 		}
 		//绘制覆盖物  
 		SquareOverlay.prototype.draw = function(){  
 		// 根据地理坐标转换为像素坐标，并设置给容器 
  			var position = this._map.pointToOverlayPixel(this._point);
    		this._div.style.left = position.x + 2 + "px";  
    		this._div.style.top = position.y - 42 + "px";  
 		}
 		var pointList = [];
		pointList[0] = new BMap.Point(lon, lat);
		var mySquare = new SquareOverlay(pointList[0],"1",name);  
 		map.addOverlay(mySquare);
		map.setViewport(pointList);
	},
		//预订事件集合
	detailFunc : function(){
		var _this = this;
		//图片放大功能
		$(".hotel-details-imglist>ul>li>img").on("click",function(){
			$(".hotel-details-top-img>img").attr("src",$(this).attr("src"));
		})
		//修改时间确定按钮
		$(".hotel-details-time>a").click(function(){
			_this.hotelDetail();
//			window.location.reload();
		});
		$(".chailv-error").on("mouseover",function(){
			$(this).children(".hotel-zhengce").show().parents(".chailv-error").siblings(".chailv-error").children(".hotel-zhengce").hide();
		})
		$(".chailv-error").on("mouseleave",function(){
			$(".hotel-zhengce").hide();
		})
		$(".more-button").on("click",function(){
			$(this).siblings().show();
			$(this).remove();
		});
		//预订按钮
		$(".zhifu-btn").click(function(){
			// alert(_this.model.bookPersonAndPassengers.passengers[0].passengerBirthDate);
			var cailvText="";
			var isViolatePolicy = $(this).attr("data-policy");
			var Indexes = $(this).attr("data");
			wz = Indexes.split("-");
			var data = JSON.stringify(_this.model.bookPersonAndPassengers);
			_this.model.obj = _this.model.hotelData[wz[0]].resourceProductEncryptDTOs[wz[1]].productDetailDTO; //通过位置索引值获取需要下单的仓位数据
	  	    _this.model.encrypt = _this.model.hotelData[wz[0]].resourceProductEncryptDTOs[wz[1]].encrypt;//加密字符串  
	  	    var keydata = {data:_this.model.obj,encrypt:_this.model.encrypt,cailvText:[]};
            keydata.indexImg = _this.model.indexImg;//展示图片
            keydata.adultCount = $(this).attr("data-adultCount");
            var form = $("<form></form>");
            form.attr('action', __ctx+"/hotel/book")
            form.attr('method', 'post')
            var input1 = $("<input type='text' id='bookdate' name='bookPersonAndPassengersDTOStr'/>");
            var input2  = $("<input type='text' id='hoteldata' name='hotelDTOStr'/>")
            form.append(input1);
            form.append(input2);
            form.appendTo("body")
            form.css('display', 'none');
            $("#bookdate").val(data);
            $("#hoteldata").val(JSON.stringify(keydata));
            console.log(form);
            form.submit();

            /*if(isViolatePolicy == "false"){

			}else{//违反差旅政策时
				_this.chailvPolicyOrder(Indexes);
			}*/
		});
        //差旅政策弹出相关事件
		$(".travel-policy-cancel").click(function(){
			$("#travel-policy").hide();
		});
		$("#travel-policy>div>.travel-policy-text").on("click","span",function(){
			$("#travel-policy>div>.travel-policy-text>span").removeClass("TMC_radio4");
			$(this).addClass("TMC_radio4");
		});
		// //违反差旅政策下单
		$(".travel-policy-quding").click(function(){
			//修改于2017-6-22 21:06:04 cw
//			var Indexes = $(this).attr("data-index");
//			var div = $("#travel-policy>div>.travel-policy-text .radio_act");
//			var div2 = div.siblings("textarea");
			
			var cailvText1 = $("#travel-policy>div>.travel-policy-text>.TMC_radio4").attr("data");
			var cailvText2= {"passengerId":0,"violationReason":"",violationReasonCode:""};
			cailvText2.violationReasonCode = $("#travel-policy>div>.travel-policy-text>.TMC_radio4").attr("data-code");
			var cailvText = [];
            for(var j=0;j<_this.model.approval.length;j++){
            cailvText2.violationReason = cailvText1;
//            cailvText2.violationReasonCode="";
            cailvText2.passengerId = _this.model.approval[j].passengerId;
            cailvtext1 ={"violationReason":cailvText2.violationReason,"violationReasonCode":cailvText2.violationReasonCode,"passengerId":cailvText2.passengerId}
			cailvText.push(cailvtext1);
		    }
			var data = JSON.stringify(_this.model.bookPersonAndPassengers);
			var keydata = {data:_this.model.obj,encrypt:_this.model.encrypt,cailvText:cailvText};
            keydata.indexImg = _this.model.indexImg;//展示图片
			var form = $("<form></form>");
            form.attr('action', __ctx+"/hotel/book")
            form.attr('method', 'post');
            var input1 = $("<input type='text' id='bookdate' name='bookPersonAndPassengersDTOStr'/>");
            var input2  = $("<input type='text' id='hoteldata' name='hotelDTOStr'/>")
            form.append(input1);
            form.append(input2);
            form.appendTo("body")
            form.css('display', 'none');
            $("#bookdate").val(data);
            $("#hoteldata").val(JSON.stringify(keydata));
            form.submit();
		});
	},
	//违反差旅政策下单
	chailvPolicyOrder : function(Indexes){
		var _this = this;
		var dataParams = {
            "corporationId":_this.model.bookingPerson.corporationId,
            "productType": 3,
        }
		$.ajax({
			type:"POST",
			url :__ctx+"/travelPolicyController/queryViolationCauses",
			data :JSON.stringify(dataParams),
			contentType: "application/json; charset=utf-8",
			dataType:"json",
			async:false,
			success: function(json){
				if(json.success){
					$("#travel-policy>div>.travel-policy-text").html("");
					for(var i = 0; i<json.values.length; i++){
						$("#travel-policy>div>.travel-policy-text").append("<span data='"+json.values[i].reasonChinese+"' data-code='"+json.values[i].code+"' class='TMC_radio3'></span>"+json.values[i].reasonChinese+"<br>")
//						$("#travel-policy>div>.travel-policy-text").append("<span data-whetherAddBox='"+json.values[i].whetherAddBox+"' data-code='"+json.values[i].code+" data='"+json.values[i].reasonChinese+"' class='TMC_radio3'></span>"+json.values[i].reasonChinese+"<br><textarea class='none' placeholder='请填写备注信息,不超过50个字'></textarea>");
//						if(json.values[i].whetherAddBox==1){
//							$("#travel-policy>div>.travel-policy-text textarea").eq(i).attr("data",json.values[i].addBoxRequired);
//						}	
					}
					$("#travel-policy>div>.travel-policy-text>span").eq(0).addClass("TMC_radio4");
//					$("#travel-policy .travel-policy-quding").attr({"data-index":Indexes});
//					$("#travel-policy>div>.travel-policy-text>div>span").eq(0).click();
					$("#travel-policy").show();
				}else if(json.errorCode=="LY0523BC2108"||json.errorCode=="LY0523BC2107"){
					window.location.href = 'login';	
				}
			},
			error:function(){
				console.log("获取差旅政策失败");
			}	
		});
	},
	//日期转换为星期几
	dateToWeek : function(date){//日期转换成星期
		var newDateStr = date.replace(/-/g,"/");
    	var aa = new Date(newDateStr).getDay();
    	return "周" + "日一二三四五六".split("")[aa];
	},
	//计算两个时间相差几天
	calculateDate : function(date1,date2){
		var we = new Date(date2.replace(/-/g,"/")).getTime() - new Date(date1.replace(/-/g,"/")).getTime();
		return we/24/60/60/1000;
	},
	//图片滚动效果
	imgSlide : function(){
		var _Num = Math.ceil(this.model.imgNum/6);//可滚动次数
		var Index = 1;//当前页面标记
		
		$(".imglist-btn-left").click(function(){
			if(Index>1){
				$(".hotel-details-imglist>ul").animate({left:"+=411"},300);
				Index--;
			}
		});
		$(".imglist-btn-right").click(function(){
			if(Index<_Num){
				$(".hotel-details-imglist>ul").animate({left:"-=411"},300);
				Index++;
			}
		});

	},
	//取消规则
	cancelRuleTip:function(){
		$('.cancel-rule>.title').on({
			mouseover: function () {
				$(this).siblings('.content').show();
				$(this).siblings('.content').css("display","inline-block");
			},
			mouseout: function () {
				$(this).siblings('.content').hide();
			}
		});
	},
	//差旅政策Tip
	travelPolicyTip:function(){
		$('#policyHover').on({
			click: function () {
				$(this).children('.symbol').toggle();
				$(this).children('.policy-content').toggle();
			}
		});
	},
	//获取差旅政策
	getTravelPolicy:function(){
		var _this = this;
		var city_id=null;
		var passenger_employeeIds="";
		try {
			city_id = _this.model.hotelData[0].resourceProductEncryptDTOs[0].productDetailDTO.cityId;
			var passengers=_this.model.bookPersonAndPassengers.passengers;
			for(var index in passengers){
				passenger_employeeIds+=(passengers[index].passengerEmployeeId+",");
			}
			passenger_employeeIds=passenger_employeeIds.substr(0,passenger_employeeIds.length-1);
		}catch(e){
			console.log(e);
		}
		$.ajax({
			type: "POST",
			url: __ctx+"/hotel/getHotelProtocolsByEmployeeIdsAndCityId",
			data: JSON.stringify({
				employeeIds: passenger_employeeIds, // 员工id集合
				cityId: city_id // // 城市id
			}),
			dataType: "json",
			async: false,
			contentType: "application/json; charset=utf-8",
			success: function(data){
				if(data.success && data.values){
					var standardRule = '';

					for(var i = 0; i < data.values.length; i++) {
						var singlePassengerPolicy = {}; // 每个人的差旅政策

						// 如果制定了差旅政策
						if(data.values[i].hotelProtocolNewDTO){
							var policyDetail = data.values[i].hotelProtocolNewDTO;
							standardRule = policyDetail.standardRule; // 1.按最高标准入住（A或B）  2.入住标准叠加（A+B）3.入住标准叠加（最低A+A）4.入住标准叠加（最高B+B）

							singlePassengerPolicy.employeeName = data.values[i].employeeChineseName|| data.values[i].employeeEnglishName; // 中文姓名||英文姓名
							singlePassengerPolicy.priceBegin = policyDetail.dynamicTravelProtocolHotelStandardDTO.priceBegin; // 价格区间起
							singlePassengerPolicy.priceEnd = policyDetail.dynamicTravelProtocolHotelStandardDTO.priceEnd; // 价格区间止
							singlePassengerPolicy.allowBook = policyDetail.dynamicTravelProtocolHotelStandardDTO.allowBook === 1 ? '允许预订' : '禁止预订'; // 是否允许预定 1-允许,0-禁止
							singlePassengerPolicy.ruleSenable = policyDetail.ruleSenable; // 是否启用单人上浮

							if (policyDetail.fixedValue) {
								singlePassengerPolicy.fixedValue = policyDetail.fixedValue + '元'; // 上浮固定值
							} else if (policyDetail.scaleValue) {
								singlePassengerPolicy.scaleValue = policyDetail.scaleValue + '%'; // 上浮百分比

								if(policyDetail.dynamicTravelProtocolHotelReferStandardDTO) { // 如果有参考标准 则使用参考标准
									singlePassengerPolicy.priceEnd = policyDetail.dynamicTravelProtocolHotelReferStandardDTO.priceEnd;
								}
							}
							_this.model.travelPolicyNeed.push(singlePassengerPolicy);
						}
					}

					// 参考标准
					switch(standardRule) {
						case 1:
							_this.model.standardRule = '按最高标准入住（A或B）';
							break;
						case 2:
							_this.model.standardRule = '入住标准叠加（A+B）';
							break;
						case 3:
							_this.model.standardRule = '入住标准叠加（最低A+A）';
							break;
						case 4:
							_this.model.standardRule = '入住标准叠加（最高B+B）';
							break;
						default:
							break;
					}
				}else if(data.errorCode=="LY0523BC2108" || data.errorCode=="LY0523BC2107"){
					window.location.href = 'login';
				}else {
					console.log('暂未获取到乘客的差旅政策');
				}
			},
			error:function(){
				console.log("获取乘客差旅政策接口调用失败");
			}
		});
	},
}
window.book1 = book1;
book1.init();
