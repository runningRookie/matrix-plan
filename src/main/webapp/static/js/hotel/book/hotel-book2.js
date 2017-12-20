/**
 * Created by cjh40460 on 2017/2/8.
 */
 
var hotelBook2 = {
    model : {
    	isToContinue:false,
        servicePrize :"",    //服务费
        servicePrizeWay : "",  //收取方式 1:按间夜 2：按订单
        passengersList :[],  //差旅人信息
        approvalReference : "",  //审批参照人
        cardTypeList :[],    //信用卡信息集合
        checkedCredit : {},    //选中的信用卡信息
        // token : $.cookie("tmcToken"), //用户token
        payType : "",  //支付类型 月结--m 现结--n
        personInfo : {},
		//JSON.parse($("#userInfo").val()).data ,   //预订人用户信息
        key : "578AC72378B43E96",  //十六位十六进制数作为秘钥(aes加密)
        iv : "ACD72978BF28978E",   //十六位十六进制数作为秘钥偏移量
        hotelInfoKey :  "FIGHT_WEB_API_16549825891487646077323",//_param.key || "FIGHT_WEB_API_16549825891487646077323", //取信息的key
        encrypt : "", //加密信息(下单接口用)
        productDetailDTO : {} , //酒店详细信息
        passengerKey : "FIGHT_WEB_API_17057326151487211147477",//"FIGHT_WEB_API_12904889351487646536546",  //差旅人key
        passengerNameList : [],  //差旅人姓名集合
        singleTotalAmount : 0,   //一间房多日期的总价
        hotelDetailInfo : {} ,   //酒店价格信息
        guaranteeInfo : {},  //调担保信息接口需要的参数
        guaranteePrice : 0 ,  //通过接口获取的担保费用
        guaranteeTime : "" ,  //超过此时间时需要担保
        violationReasons : [],   //违反差旅政策原因
		servicePersons:[], //抄送人
		
		responsibleGroupId:"",//责任组ID
		responsibleGroupName:"",//责任组名称
		responsiblePersonId:"", //责任人ID
		responsiblePersonName:"",//责任人名称
		
		salesId:"", //销售ID
		salesName:"",//销售名称
		customerManagerId:"",//客户经理ID
		customerManagerName:"",//客户经理名称 
		
		approvalPersonList: [], //审批参照人列表
		auditReferenceEmployeeId:"",//审批参照人ID
		isNeedGuarantee: false, //是否需要担保
		operatorId:"", //操作人ID
		settlementType:"", //结算方式(通过员工ID获取)
		roomRetainDate:"", //保留时间
		firstPassengerName:"",//第一个乘客姓名
		
		//新差旅政策新增字段
		adultCount: 2, // 房间最大入住人数
		cityId: '', // 城市id
		employeeIds: '', // 员工id
        travelPolicy: [], // 乘客差旅政策
        travelPolicyNeed: [], // 用到的差旅政策
        hotelPriceList: [], // 每天的酒店价格
        ifViolatePolicy: false, //是否有人违反差旅政策
        selectedPassenger: [], //已选差旅人
        minHotelPrice: '', // 酒店最低价格
        maxHotelPrice: '', // 酒店最高价格
        violatePolicyList: [], // 违反的差旅政策集合
        policyType: 0, // 0-未制定 1-符合 2-违反
        noRepeatViolatePolicyList: [],
		passengerList: [], // 差旅人列表
		hotelPriceList: [], // 酒店价格列表
		standardRule: '', // 多人入住标准
		
		bookPersonAndPassengers: window.bookPersonAndPassengers, //预订人和乘客信息
		hotelResourceDTO:window.hotelResourceDTO, //酒店信息
        domesticHotel: 0 //国内酒店预订权限
    },
    init : function () {
    	//预订人、乘客出生日期转为字符串
		var timeAll = window.bookPersonAndPassengers.bookPerson.bookPersonBirthDate;
	    var newTime = new Date(timeAll);
	    year = newTime.getFullYear();
	    month = newTime.getMonth()+1;
	    date = newTime.getDate();
	    month=month<10?'0'+month:month;
	    var day = newTime.getDate();
	    day=day<10?'0'+day:day;
	    time = year+"-"+month+"-"+day
	    window.bookPersonAndPassengers.bookPerson.bookPersonBirthDate = time;
	    //乘客出生日期转为字符串
	    for(var i=0;i<window.bookPersonAndPassengers.passengers.length;i++){
		   var timeAll = window.bookPersonAndPassengers.passengers[i].passengerBirthDate;
		   var newTime = new Date(timeAll);
		   year = newTime.getFullYear();
		   month = newTime.getMonth()+1;
		   date = newTime.getDate();
		   month=month<10?'0'+month:month;
		   var day = newTime.getDate();
		   day=day<10?'0'+day:day;
		   time = year+"-"+month+"-"+day
		   window.bookPersonAndPassengers.passengers[i].passengerBirthDate = time;
		 }
		
		this.model.personInfo = this.model.bookPersonAndPassengers.bookPerson;
		this.model.passengersList = this.model.bookPersonAndPassengers.passengers;
		this.model.productDetailDTO = this.model.hotelResourceDTO;
		//最大入住人数量
		if(this.model.hotelResourceDTO.adultCount && this.model.hotelResourceDTO.adultCount > 0){
			this.model.adultCount = this.model.hotelResourceDTO.adultCount;
		}else{
			this.model.adultCount = 2;
		}		
		
        this.getHotelInfo();//获取酒店信息
        this.contactModule(); //获取联系人
		this.getServicePersons(); //获取抄送人
        this.getServicePrize(); //获取服务费
        this.getCreditInfo(); //获取信用卡信息
        //this.ajaxGetPayType();  //获取支付方式
		this.getSettlementMethod(this.model.personInfo.bookPersonEmployeeId); //通过员工ID获取支付方式_最新
		this.getLoginUserInfo(); //获取当前登录人ID
        //this.clickFunc();  //页面点击事件集合
        //this.maintainHotelTimeClick(); //选择担保超时时间
		//this.choosePassengers();
        //this.getGuaranteeInfo();  //获取担保信息
		this.getResponsibleGroups(); //获取责任组
		this.getCorporation(this.model.personInfo.bookCompanyId);//获取公司销售、客户经理
		//this.getApprovalPersonList();//获取审批参照人列表
		//行程编号为空且审批参照模式为r时，显示审批参照人选择项
		if(this.model.bookPersonAndPassengers.itineraryNo == "" && this.model.personInfo.auditReferenceType == "r"){
			$("#auditReferencePerson").show();
			this.chooseApprovals(); //选择审批参照人
		}
		
		//信用卡年选项列表
		this.getCardYearList();		
		//第一个乘客
		if(this.model.passengersList && this.model.passengersList.length > 0) {	
			this.model.firstPassengerName = this.model.passengersList[0].passengerName;
		}
		
		//--start Fix bug#1120050321050108836, 需求变更. By huangyu on 2017.5.25
		if(this.model.productDetailDTO.data.paymentType == 1){     //现付酒店
			$(".remind-info").html("房费请于酒店前台支付<br />酒店确认入住后担保费用全部返还");
		}else {	//预付酒店
			$(".remind-info").html("酒店将预收全部费用，取消请按照政策提示");
		}
		//--end Fix bug#1120050321050108836, 需求变更. By huangyu on 2017.5.25
		
		this.getViolateReason(); // 获取违反差旅政策原因
    },
	

    //从缓存中获取酒店信息列表
    getHotelInfo : function(){
		//console.log(JSON.stringify(bookPersonAndPassengers))
        var _this = this;
		//_this.model.productDetailDTO = hotelResourceDTO;//JSON.parse(data.obj.pcRedis);    //全部信息（下单接口用）
		_this.model.encrypt = hotelResourceDTO.encrypt;//JSON.parse(data.obj.pcRedis).encrypt;     //加密信息（下单接口用）
		// _this.model.passengerKey = JSON.parse(data.obj.pcRedis).passengerKey;    //取差旅人用到的key
		
		//_this.chooseApprovals();
		var hotelData = _this.model.productDetailDTO.data;  //酒店信息
		//可订接口调用需要的入参
		_this.model.guaranteeInfo.hotelId = hotelData.resourceId;   //酒店Id
		_this.model.guaranteeInfo.roomId = hotelData.resourceProductId; //房型id
		_this.model.guaranteeInfo.policyId = hotelData.productUniqueId; //政策id
		_this.model.guaranteeInfo.comeDate = hotelData.startTime.substring(0,10);   //入住日期
		_this.model.guaranteeInfo.comeTime = hotelData.startTime.substring(0,10);   //到店时间(默认与入住日期相同)
		_this.model.guaranteeInfo.leaveDate = hotelData.endTime.substring(0,10);    //离店日期
		// _this.model.guaranteeInfo.bookingCount = $("#houseNum").text(); //预订的房间数量
		// _this.model.guaranteeInfo.guestCount = $("#houseNum").text();   //客人数量，目前取的与房间数一致
		_this.model.cityId = _this.model.hotelResourceDTO.data.cityId;
		console.log("cityId="+_this.model.hotelResourceDTO.data.cityId);
		console.log("_this.model.cityId="+_this.model.cityId);
		
		//显示房间选择下拉框
		var selectHtml = '';
		for(var i = 0; i < _this.model.adultCount; i++) {
			selectHtml += '<div class="clearfix person-select">\
				<div class="accommodation-name">请选择住客</div>\
				<ul class="accommodation-select-list"></ul>\
			</div>'
		}
		$('.person-select-wrap').html(selectHtml);
				
	/*	var loginName = _this.model.personInfo.bookPersonName || _this.model.personInfo.bookPersonEnlishName ;
		$("#allHouseNum .accommodation-name").text(loginName); //默认房间1显示 */ //入住人不能强制显示在入住人列表里面
		
		//打印酒店信息
		$("#startHotelTime").text(hotelData.startTime.substring(0,10));     //入店时间取年月日
		$("#leaveHotelTime").text(hotelData.endTime.substring(0,10));       //离店时间取年月日
		
		
		var houseList = "";   //房间列表集合
		for(var i=0; i<hotelData.resourceCountAndPriceDetails.length; i++){
			var houseDate = [],   //房间日期集合
				breakfastNum = hotelData.resourceCountAndPriceDetails[i].value.breakfastCount,  //接口返回早餐code
				breakfastCount = "";  //早餐份数展示
			_this.model.singleTotalAmount += hotelData.resourceCountAndPriceDetails[i].value.distributionSalePrice; //一间多夜的价格
			switch (breakfastNum) {
				case -1:
					breakfastCount = "含早";
					break;
				case 0:
					breakfastCount = "无早";
					break;
				case 1:
					breakfastCount = "单早";
					break;
				case 2:
					breakfastCount = "双早";
					break;
				case 3:
					breakfastCount = "三早";
					break;
				case 4:
					breakfastCount = "四早";
					break;
			}
			houseDate.push(hotelData.resourceCountAndPriceDetails[i].key.substring(0,4));   //加入年份
			houseDate.push(hotelData.resourceCountAndPriceDetails[i].key.substring(5,7));   //加入月份
			houseDate.push(hotelData.resourceCountAndPriceDetails[i].key.substring(8,10));   //加入日期
			houseList += "<li><p>"+hotelData.resourceCountAndPriceDetails[i].key.substring(0,10)+"<br>"+ _this.dateToWeek(houseDate)+"</p><span>&yen;"+
				hotelData.resourceCountAndPriceDetails[i].value.distributionSalePrice+"</span><br>"+breakfastCount+"</li>";
			_this.model.hotelPriceList.push(hotelData.resourceCountAndPriceDetails[i].value.distributionSalePrice);
		}
		_this.model.maxHotelPrice = _this.getMaxMin(_this.model.hotelPriceList, 'max'); // 几天房价的最大值
        _this.model.minHotelPrice = _this.getMaxMin(_this.model.hotelPriceList, 'min'); // 几天房价的最小值
		_this.getPassengers(); //获取差旅人信息
		
		if(_this.model.passengersList && _this.model.passengersList.length > 0) {
			var passengerName = _this.model.passengersList[0].passengerName||_this.model.passengersList[0].passengerEnlishName;
			$("#allHouseNum .accommodation-name").eq(0).text(passengerName); //默认房间1显示
		}
		
		_this.model.hotelDetailInfo.hotelDayNum = hotelData.resourceCountAndPriceDetails.length;    //住宿天数
		_this.getServicePrize();    //获取服务费
		$("#singleTotalAmount").text( _this.model.singleTotalAmount);   //展示总价
		$("#houseList").html(houseList);  //展示房间信息
		//判断支付类型 //判断酒店类型
		if(hotelData.paymentType == 1){   //支付类型为现付
			_this.getCreditInfo();  //获取信用卡信息
			_this.getRoomRetainDate(); //现付时获取担保时间
			$(".keep-house").show();    //房间保留时间选择框 --根据要求,现付一直显示
			_this.maintainHotelTimeClick(); //保留房间时间选择
			if(hotelData.isNeedGuarantee){   //判断是否需要担保 true--需要 false--不需要
			    _this.isNeedGuarantee = true;
				//$(".keep-house").show();    //房间保留时间选择框      //注释，放在上层统计判定：		现付一直显示
				//_this.maintainHotelTimeClick(); //保留房间时间选择  //注释，放在上层统计判定：		现付一直显示
				$("#payInHotel").show();    //信用卡填写块    //需要担保显示，不管担保费是否有
				//_this.getCreditInfo();  //获取信用卡信息	  //有担保费才显示，在担保费接口中统一处理，此处注释
				_this.getGuaranteeInfo();    //获取库存和担保费用				
				if( _this.model.guaranteePrice > 0){ //担保费 > 0 才显示
				    $("#guaranteeMoney").text(_this.model.guaranteePrice);  //设置担保费
					$("#guaranteePrice").show(); 	//显示担保费
				}
				//_this.maintainHotelTimeClick(); //保留房间时间选择
			}else{   //不需要担保
				if(hotelData.guaranteeCode == 4){   //是否为超时担保
					//$(".keep-house").show();		//房间保留时间选择框	//注释，放在上层统计判定：		现付一直显示
					//_this.maintainHotelTimeClick(); //保留房间时间选择	//注释，放在上层统计判定：		现付一直显示		
					//$("#payInHotel").show();      //逻辑修改，注释此行。参照：当房间保留时间 >= 担保时间, 显示：担保费、信息卡
					//_this.getCreditInfo();  		//获取信用卡信息，参照：当房间保留时间 >= 担保时间, 显示：担保费、信息卡
					var guaranteeTime = "";   //保留房间至guaranteeTime之后 需要担保费用
					switch (hotelData.guaranteeTime) {
						case "01:00":
							guaranteeTime = "25:00";
							break;
						case "02:00":
							guaranteeTime = "26:00";
							break;
						case "03:00":
							guaranteeTime = "27:00";
							break;
						case "04:00":
							guaranteeTime = "28:00";
							break;
						case "05:00":
							guaranteeTime = "29:00";
							break;
						default :
							guaranteeTime = hotelData.guaranteeTime;
							break;
					}
					_this.model.guaranteeTime = guaranteeTime;					
					//_this.getGuaranteeInfo();    //获取库存和担保费用，注释不用
					
					//新加  当房间保留时间 >= 担保时间, 显示：担保费、信息卡
					if($("#arriveTime").attr("data") > _this.model.guaranteeTime.substring(0,2)){//超时
					     //_this.getCreditInfo();  		//获取信用卡信息 
						 $("#payInHotel").show();  		//显示信用卡、结算方式显示：到店付，需要担保
						 _this.getGuaranteeInfo();      //获取担保费
						 if( _this.model.guaranteePrice > 0){ //担保费 > 0 才显示
							$("#guaranteeMoney").text(_this.model.guaranteePrice);  //设置担保费
							$("#guaranteePrice").show(); 	//显示担保费
						}
						 _this.isNeedGuarantee = true;  //设置是否需要担保为true
					  }else{//不超时，结算方式显示：到店付
						  $("#hotelGuarantee").show();
					  }
				}else {        //非超时担保，不用担保。结算方式显示：到店付
					$("#hotelGuarantee").show();
				}
			}
		}else {  //支付类型为预付
			$("#payInAdvance").show();
		}
		//加载右边的信息
		$(".hotel-book2-right>img").attr("src",hotelResourceDTO.indexImg);  //酒店图片
		$(".hotel-name").text(hotelData.resourceName);  //酒店名称
		var hotelAddress = hotelData.address || ""; //酒店详细地址
		$(".hotel-address").text(hotelData.cityName + " " + hotelData.sectionName + " " +hotelAddress);   //酒店地址
		$("#houseType").text(hotelData.resourceProductName);   //房型
		$("#bedNum").text(hotelData.bedTypeName);   //床型
		$("#houseSquare").text(hotelData.roomSize);     //面积
		$("#houseFloor").text(hotelData.roomFloor);     //楼层
		//早餐情况
		if(hotelData.haveBreakfast){
			$("#breakfastInfo").text("含早");
		}else {
			$("#breakfastInfo").text("无早");
		}
		
		//删除原违规原因及内容显示
		//是否违反差旅政策
		/*
		_this.model.violationReasons = _this.model.productDetailDTO.cailvText;
		if(_this.model.productDetailDTO && _this.model.productDetailDTO.cailvText && _this.model.productDetailDTO.cailvText.length>0){ //有差旅政策才显示
			$(".travel-policy").show();
			var travelPolicy = ""; */
		/*	for(var i=0 ;i<_this.model.productDetailDTO.cailvText.length;i++){
				if(_this.model.productDetailDTO.cailvText[i].violationReason){
					travelPolicy+="<p class='violation-reason'>原因"+(i+1)+"："+_this.model.productDetailDTO.cailvText[i].violationReason+"</p>";	
				}else{
					travelPolicy+="<p class='violation-reason'>原因"+(i+1)+"：</p>";
				}				
			} */
			//只显示一条
			/*
			if(_this.model.productDetailDTO.cailvText[0].violationReason){
				travelPolicy+="<p class='violation-reason'>原因："+_this.model.productDetailDTO.cailvText[0].violationReason+"</p>";	
			}
			$("#travelPolicy").html(travelPolicy);
		}
		*/
		// 违反内容 //一个人对应多个记录,人不重复		
		/*
		if(hotelData.travelPolicys && hotelData.travelPolicys.length != 0){
			var policyContent = "<p class='violation-reason'>违反内容：</p>";
			for(var i=0; i<hotelData.travelPolicys.length; i++){
				policyContent+="<div><p><span>"+hotelData.travelPolicys[i].passengerName+"</span>违反的差旅政策<span class='policy-btn'>详情</span></p>";
				for(var j=0; j<hotelData.travelPolicys[i].policyContent.length; j++){
					var policyContentList = "";
					policyContentList += "<li>"+hotelData.travelPolicys[i].policyContent[j]+"</li>";
					policyContent+="<ul class='none'>"+policyContentList+"</ul>";					
				}
				policyContent+="</div>";
			}
			$("#travelPolicyContent").html(policyContent);
			console.log("违反差旅政策内容:"+policyContent);
		}
		*/
		//删除原违规原因及内容显示
		
		$("#housePrice").text(_this.model.singleTotalAmount);  //单间多夜房费价格
		$("#housePriceNum").text("*1");  //房间数量
		$("#totalAmount").text(_this.model.singleTotalAmount+_this.model.servicePrize); //总价（服务费+房费）
		_this.clickFunc();
		
    },
    //日期转换成星期
    dateToWeek : function (dateList){
        var newDateStr = dateList.join("/");
        var aa = new Date(newDateStr).getDay();
        return "星期" + "日一二三四五六".split("")[aa];
    },
	// 获取价格最大值最小值
    getMaxMin: function(arr,maximin) {
        if (maximin == "max") {
            return Math.max.apply(Math, arr);
        }
        else if (maximin == "min") {
            return Math.min.apply(Math, arr);
        }
    },
	//日期加减
	addDate : function (date,days){ 
       var d=new Date(date); 
       d.setDate(d.getDate()+days); 
       var m=d.getMonth()+1; 
	   var n=d.getDate();
	   if(m < 10) { //一位补0
		m = '0' + m;
	   }	   
	   if(n < 10) { //一位补0
		n = '0' + n;
	   }
       return d.getFullYear()+'-'+m+'-'+n;
     },
	//获取保留时间,用于: 1.现付时获取担保费、可定查询时的入参comeTime.2.作为为现付时下单入参roomRetainDate. 初化时调用, 担保时间选择变动时调用。
	getRoomRetainDate : function(){
		var _this = this;
		//1.如果是预付酒店，comeDate和comeTime都传客人的入住时间
		//2.如果是现付酒店，comeDate传客人的入住时间，comeTime前端传房间保留时间(第二天都把日期往后推一天)
		var comeTime = _this.model.hotelResourceDTO.data.startTime; //预付酒店
		if(_this.model.productDetailDTO.data.paymentType == 1){     //现付酒店
			if( $("#arriveTime").attr("data") < 24 ){             //判断担保时间是否为第二天
				comeTime = _this.model.hotelResourceDTO.data.startTime.substring(0,10) + " " + $("#arriveTime").attr("data") + ":00:00";
			}else{//保留时间是第二天，日期后推一天				
				var dd = $("#arriveTime").attr("data") - 24;	//小时减24 
				if(dd < 10) { //一位补0
					dd = '0' + dd;
				}
				var date = _this.model.hotelResourceDTO.data.startTime.substring(0,10); //年月日
				date = _this.addDate(date,1); //增加1天
				comeTime = date + " " + dd + ":00:00";
			}			
		}
		_this.model.roomRetainDate = comeTime;
	},
    //获取是否有库存和担保服务费
    getGuaranteeInfo : function(){
        var _this = this;
		//1.如果是预付酒店，comeDate和comeTime都传客人的入住时间
		//2.如果是现付酒店，comeDate传客人的入住时间，comeTime前端传房间保留时间(第二天都把日期往后推一天)
	/*	var comeTime = _this.model.hotelResourceDTO.data.startTime; //预付酒店
		if(_this.model.productDetailDTO.data.paymentType == 1){     //现付酒店
			if( $("#arriveTime").attr("data") < 24 ){             //判断担保时间是否为第二天
				comeTime = _this.model.hotelResourceDTO.data.startTime.substring(0,10) + " " + $("#arriveTime").attr("data") + ":00:00";
			}else{//保留时间是第二天，日期后推一天				
				var dd = $("#arriveTime").attr("data") - 24;	//小时减24 
				console.log("dd1:"+dd);
				if(dd < 10) { //一位补0
					dd = '0' + dd;
				}
				console.log("dd2:"+dd);
				var date = _this.model.hotelResourceDTO.data.startTime.substring(0,10); //年月日
				date = _this.addDate(date,1); //增加1天
				comeTime = date + " " + dd + ":00:00";
			}			
		}
		_this.model.roomRetainDate = comeTime;
		console.log("可定检查入参comeTime"+comeTime);
		console.log("保留时间"+_this.model.roomRetainDate); */
        $.ajax({
            type:"POST",
            url :__ctx +"/hotel/bookableCheck",
            data :JSON.stringify({
				//测试数据-BEGIN
			/*	"hotelId" : 272772,
                "roomId" : 206972,
                "policyId" : 48368,
                "comeDate" : "2017-03-01",
                "comeTime":"00:00:00",
                "leaveDate":"2017-03-02",
                "bookingCount":1,
                "guestCount":1 */
				//-END
				
				//配置-BEGIN
                "hotelId" : _this.model.hotelResourceDTO.data.resourceId,
                "roomId" :   _this.model.hotelResourceDTO.data.resourceProductId,
                "policyId" : _this.model.hotelResourceDTO.data.productUniqueId,
                "comeDate" : _this.model.hotelResourceDTO.data.startTime, //根据新要求改为年月日时分秒
                "comeTime":  _this.model.roomRetainDate,//comeTime,//_this.model.hotelResourceDTO.data.startTime, //根据新要求改为年月日时分秒
                "leaveDate": _this.model.hotelResourceDTO.data.endTime,	  //根据新要求改为年月日时分秒
                "bookingCount":$("#houseNum").text(),
                "guestCount":$("#houseNum").text(),
                "isPayNow": _this.model.productDetailDTO.data.paymentType //支付方式:1现付、2预付
				//配置-END
            }),
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(data){
				var aa = JSON.stringify(data);
				//测试-BGN
				//$("#guaranteePrice").show();
				//$("#guaranteeMoney").text(10);
				//测试-END
                if(data.result){
                    if(data.obj && data.obj.canBooking == 1){   //是否可订，1-可订，0-不可订
						if(data.obj.amountPercent && data.obj.amountPercent>0){
							_this.model.guaranteePrice = data.obj.amountPercent;
						/*	$("#guaranteePrice").show();                             //显示"需担保房费"
							$("#guaranteeMoney").text(_this.model.guaranteePrice);	 //显示担保费
							$("#payInHotel").show();    							 //信用卡填写块
							_this.getCreditInfo();  								 //获取信用卡信息 
							_this.model.isNeedGuarantee = true;							 */
						}else{
						/*	$("#guaranteePrice").hide();                             //隐藏"需担保房费"
							$("#payInHotel").hide();    							 //隐藏信用卡填写块
							_this.model.isNeedGuarantee = false;		*/					
						}                        
                    }else {
                    NewPCPopHelper.alert("该房型已订完，请重新选择其他房型", function () {
                            _this.ToHotelDetail();    //库存不足跳转到酒店详情页
                        });  //临时注释，正式放开
                    }
                }
            },    
            error:function(){
                console.log("获取担保信息接口调用失败");
            }
        });
    },
    //获取差旅人信息
    getPassengers : function () {
        var _this = this;
		
		//根据员工ID去掉当前预订人 获取差旅人姓名列表
		for(var i=0; i<_this.model.passengersList.length; i++) {
			var pasNameAndId = {};
			pasNameAndId.passengerName = _this.model.passengersList[i].passengerName||_this.model.passengersList[i].passengerEnlishName;
			pasNameAndId.passengerEmployeeId = _this.model.passengersList[i].passengerEmployeeId;
			_this.model.passengerList.push(pasNameAndId);
			_this.model.employeeIds += _this.model.passengersList[i].passengerEmployeeId + ',';
		}
		_this.getTravelPolicy(); // 获取差旅政策

		// 第一间房的第一个人设置为第一个差旅人
		$(".accommodation-name").eq(0).text(_this.model.passengerList[0].passengerName).attr({'id': _this.model.passengerList[0].passengerEmployeeId, 'data-index': '0'}).css('color','#333')
		.siblings('img').attr('src','//file.40017.cn/assets/tmc/images/delete-pas.png').removeClass('show-select').addClass("delete-passenger");

		// 初始化第一个人的差旅政策
		var singleChosenPassenger = [],
		chosenPassenger = [];
		if(_this.model.travelPolicyNeed.length) {
			singleChosenPassenger.push(_this.model.travelPolicyNeed[0]);
			chosenPassenger.push(singleChosenPassenger);
			_this.calculateTravelPolicy(chosenPassenger);
		}
		
		_this.choosePassengers();		
    },
    //选择入住人 //显示前端传入乘客信息
	
    choosePassengers : function () {
        var _this = this;
        //var loginName = _this.model.personInfo.bookPersonName || _this.model.personInfo.bookPersonEnlishName ;
		var passengerNameList = "";//预订人不强制显示在入住人列表里  "<li>"+loginName+"</li>";   //可选入住人列表
        //选择入住人
		
		for(var i=0; i<_this.model.passengersList.length; i++){
				//passengerNameList += "<li data-index='"+i+"' >"+_this.model.passengersList[i].passengerName+"</li>";	
			passengerNameList += "<li data-index='"+i+"' id='"+_this.model.passengersList[i].passengerEmployeeId+"'>"+(_this.model.passengersList[i].passengerName||_this.model.passengersList[i].passengerEnlishName)+"</li>";
																								 								  
		}
		$("#allHouseNum").on("click",".accommodation-name",function () {	
			$('.accommodation-select-list').hide();	
            $(this).siblings(".accommodation-select-list").html(passengerNameList).toggle();
        })
       /* $("#allHouseNum").on("click", ".accommodation-select-list li", function () {
            $(this).parent().siblings(".accommodation-name").text($(this).text());
            $(this).parent().hide();
        }); */
		$("#allHouseNum").on("click", ".accommodation-select-list li", function () {
            $(this).parent().siblings(".accommodation-name").text($(this).text()).attr({"id": $(this).attr("id"), 'data-index': $(this).attr("data-index")}).css('color', '#333')
                .siblings('img').attr('src','//file.40017.cn/assets/tmc/images/delete-pas.png').removeClass('show-select').addClass("delete-passenger");
            $(this).parent().hide();

            _this.getAllHouseAndPas();
        });
    },	
	
	// 遍历入住人
    getAllHouseAndPas: function () {
        var _this = this;
		console.log("_this.model.travelPolicyNeed="+_this.model.travelPolicyNeed)
        var chosenPassenger = [];
        for(var i = 0; i < $('#allHouseNum>div').length; i++) {
            var oneHousePassenger = [];
            for(var j = 0; j < $('#allHouseNum>div').eq(i).find('.person-select').length; j++) {
                if($('#allHouseNum>div').eq(i).find('.person-select').children('.accommodation-name').eq(j).text() != '请选择住客') {
                    var index = $('#allHouseNum>div').eq(i).find('.person-select').children('.accommodation-name').eq(j).attr('data-index');
                    if(!_this.model.travelPolicyNeed[index].noPolicy) {
                        oneHousePassenger.push(_this.model.travelPolicyNeed[index]);
                    }
                }
                if(j+1 === $('#allHouseNum>div').eq(i).find('.person-select').length) {
                    break;
                }
            }

            var newArr = [];
            var arr = [];

            for(var k = 0; k < oneHousePassenger.length; k++) {
                var obj = oneHousePassenger[k];
                var employeeId = obj.employeeId;

                if ($.inArray(employeeId, arr) === -1) {
                    arr.push(obj.employeeId);
                    newArr.push(obj);
                }
            }
            if(newArr.length) {
                chosenPassenger.push(newArr);
            }
        }
        _this.calculateTravelPolicy(chosenPassenger); // 计算差旅政策
    },
	
	// 计算差旅政策
    calculateTravelPolicy: function (chosenPassenger) {
        var _this = this;
        _this.model.violatePolicyList = [];
		console.log("chosenPassenger="+chosenPassenger);
        if(chosenPassenger.length) {
            for(var i = 0; i < chosenPassenger.length; i++) {
                var singleChosenPassenger = chosenPassenger[i];

                if(!singleChosenPassenger.length) {
                    _this.model.policyType = 0;
                }else if(singleChosenPassenger.length === 1) { // 房间只住一人
                    if(!singleChosenPassenger[0].noPolicy) { // 如果配置了差旅政策
                        var newPriceBegin = singleChosenPassenger[0].priceBegin; // 计算上浮标准后的价格区间起
                        var newPriceEnd = singleChosenPassenger[0].priceEnd; // 计算上浮标准后的价格区间止

                        if(singleChosenPassenger[0].ruleSenable === 1) { // 启用了单人上浮标准

                            // 如果有上浮固定值，则不使用参考标准(只计算上限)
                            if (singleChosenPassenger[0].fixedValue) {
                                newPriceEnd = Math.round(singleChosenPassenger[0].priceEnd + singleChosenPassenger[0].fixedValue);
                            } else if(singleChosenPassenger[0].scaleValue) { // 如果有上浮比例
                                if(singleChosenPassenger[0].standardDTO) { // 如果有参考标准 则使用参考标准
                                    newPriceEnd = Math.round(singleChosenPassenger[0].standardDTO.priceEndStandard * (1+singleChosenPassenger[0].scaleValue/100));
                                }else {
                                    newPriceEnd = Math.round(singleChosenPassenger[0].priceEnd * (1+singleChosenPassenger[0].scaleValue/100));
                                }
                            } else { // 如果都没有
                                newPriceEnd = singleChosenPassenger[0].priceEnd;
                            }
                            _this.model.policyType = 1;
                        }

                        if(newPriceBegin > _this.model.minHotelPrice || newPriceEnd < _this.model.maxHotelPrice) {
                            _this.model.policyType = 2;
                            var floatChosenPassenger = $.extend(true, {}, singleChosenPassenger[0]);
                            floatChosenPassenger.priceEnd = newPriceEnd;
                            _this.model.violatePolicyList.push(floatChosenPassenger);
                        } else {
                            _this.model.policyType = 1;
                        }
                    } else {
                        _this.model.policyType = 0;
                    }

                }else {
                    switch (_this.model.standardRule){
                        case 1:
                            _this.firstType(singleChosenPassenger);
                            break;
                        case 2:
                            _this.secondType(singleChosenPassenger);
                            break;
                        case 3:
                            _this.thirdType(singleChosenPassenger);
                            break;
                        case 4:
                            _this.fourthType(singleChosenPassenger);
                            break;
                        default:
                            break;
                    }
                }
            }
        } else {
            _this.model.policyType = 0;
        }

        _this.showViolatePolicy();
    },
	
		
	 //选择审批参照人
    chooseApprovals : function () {
        var _this = this;
        var loginName = _this.model.personInfo.bookPersonName || _this.model.personInfo.bookPersonEnlishName ;
		var passengerNameList = "<li data-id="+_this.model.personInfo.bookPersonEmployeeId+">"+loginName+"</li>";   //可选审批参照人列表
        //选择审批参照人		
		for(var i=0; i<_this.model.passengersList.length; i++){
			if(_this.model.passengersList[i].passengerEmployeeId != _this.model.personInfo.bookPersonEmployeeId  && _this.model.passengersList[i].passengerType == "i"){
				passengerNameList += "<li data-id="+_this.model.passengersList[i].passengerEmployeeId+">"+(_this.model.passengersList[i].passengerName||_this.model.passengersList[i].passengerEnlishName)+"</li>";
			}
		}
		
		$(".hotel-info2").on("click", "#approvalPerson",function () {			
			$(this).siblings(".approval-select-list").html(passengerNameList);
        });
        $(".hotel-info2").on("click", ".approval-select-list li", function () {
            $("#approvalPerson").text($(this).text()).css("color", "#333");	
			_this.model.auditReferenceEmployeeId = $(this).attr("data-id");
            $(this).parent().hide();
        });
		
    },
	//获取信用卡年选择列表
	getCardYearList: function(){
		var year = new Date().getFullYear();
		var yearstr = "";
		for(var i=0;i<=10;i++){
			yearstr += "<li>"+year+"</li>";
			//console.log(i+":"+year);
			year++;			
		}
		console.log(yearstr);
		$(".year-list").html(yearstr);
	},
	
	
    // 打印差旅政策
    showViolatePolicy: function () {
        var _this = this;

        if (!_this.model.violatePolicyList.length && _this.model.policyType === 0) {
            $('#policyType').show().text('未制定差旅政策');
            $('#violationPolicy').hide();
        } else if (!_this.model.violatePolicyList.length && _this.model.policyType === 1) {
            $('#policyType').show().text('符合差旅政策');
            $('#violationPolicy').hide();
        } else {
            var newArr = [];
            var arr = [];

            for(var k = 0; k < _this.model.violatePolicyList.length; k++) {
                var obj = _this.model.violatePolicyList[k];
                var employeeId = obj.employeeId;

                if ($.inArray(employeeId, arr) === -1) {
                    arr.push(obj.employeeId);
                    newArr.push(obj);
                }
            }

            _this.model.noRepeatViolatePolicyList = newArr;
            // 打印违反的差旅政策
            if (newArr.length) {
                $('#policyType').hide();
                $('#violationPolicy').show();
                var violateHtml = '';
                for(var k = 0; k < newArr.length; k++) {
                    var priceEnd = '';
                    if(newArr[k].newPriceEnd) {
                        priceEnd = newArr[k].newPriceEnd;
                    } else {
                        priceEnd = newArr[k].priceEnd
                    }
                    var name = newArr[k].employeeChineseName || newArr[k].employeeChineseName;
                    violateHtml += '<div data-id='+newArr[k].employeeId+' class="every-policy"><p>'+name+'违反了如下差旅政策规定</p>\
            1.只能预订价格在'+newArr[k].priceBegin+'和'+priceEnd+'之间的酒店</div>';
                    $('#calculatePolicy').html(violateHtml);
                }
            }
        }
    },

    // 计算标准叠加（A或B）
    firstType: function (singleChosenPassenger) {
        var _this = this;
        var maxPrice = singleChosenPassenger[0].priceEnd;
        var minPrice = singleChosenPassenger[0].priceBegin;
        for (var i = 1; i < singleChosenPassenger.length; i++) {
            if(singleChosenPassenger[i].priceEnd > maxPrice) {
                maxPrice = singleChosenPassenger[i].priceEnd;
                minPrice = singleChosenPassenger[i].priceBegin;
            }
        }
        if(minPrice > _this.model.minHotelPrice || maxPrice < _this.model.maxHotelPrice) {
            _this.model.policyType = 2;
            for (var j = 0; j < singleChosenPassenger.length; j++) {
                var floatChosenPassenger = $.extend(true, {}, singleChosenPassenger[j]);
                floatChosenPassenger.priceBegin = minPrice;
                floatChosenPassenger.priceEnd = maxPrice;
                _this.model.violatePolicyList.push(floatChosenPassenger);
            }
        } else {
            _this.model.policyType = 1;
        }
    },

    // 入住标准叠加（A+B）
    secondType: function (singleChosenPassenger) {
        var _this = this;
        var maxPrice = singleChosenPassenger[0].priceEnd;
        var minPrice = singleChosenPassenger[0].priceBegin;
        for (var i = 1; i < singleChosenPassenger.length; i++) {
            maxPrice += singleChosenPassenger[i].priceEnd;
            if(singleChosenPassenger[i].priceBegin < minPrice) {
                minPrice = singleChosenPassenger[i].priceBegin;
            }
        }
        if(minPrice > _this.model.minHotelPrice || maxPrice < _this.model.maxHotelPrice) {
            _this.model.policyType = 2;
            for (var j = 0; j < singleChosenPassenger.length; j++) {
                var floatChosenPassenger = $.extend(true, {}, singleChosenPassenger[j]);
                floatChosenPassenger.priceBegin = minPrice;
                floatChosenPassenger.priceEnd = maxPrice;
                _this.model.violatePolicyList.push(floatChosenPassenger);
            }
        } else {
            _this.model.policyType = 1;
        }
    },

    // 入住标准叠加（最低A+A）
    thirdType: function (singleChosenPassenger) {
        var _this = this;
        var maxPrice = singleChosenPassenger[0].priceEnd;
        var minPrice = singleChosenPassenger[0].priceBegin;
        for (var i = 1; i < singleChosenPassenger.length; i++) {
            if(singleChosenPassenger[i].priceBegin < minPrice) {
                minPrice = singleChosenPassenger[i].priceBegin;
            }
            if(singleChosenPassenger[i].priceEnd < maxPrice) {
                maxPrice = singleChosenPassenger[i].priceEnd;
            }
        }
        maxPrice = maxPrice * singleChosenPassenger.length;
        if(minPrice > _this.model.minHotelPrice || maxPrice < _this.model.maxHotelPrice) {
            for (var j = 0; j < singleChosenPassenger.length; j++) {
                _this.model.policyType = 2;
                var floatChosenPassenger = $.extend(true, {}, singleChosenPassenger[j]);
                floatChosenPassenger.priceBegin = minPrice;
                floatChosenPassenger.priceEnd = maxPrice;
                _this.model.violatePolicyList.push(floatChosenPassenger);
            }
        } else {
            _this.model.policyType = 1;
        }
    },

    // 入住标准叠加（最高B+B）
    fourthType: function (singleChosenPassenger) {
        var _this = this;
        var maxPrice = singleChosenPassenger[0].priceEnd;
        var minPrice = singleChosenPassenger[0].priceBegin;
        for (var i = 1; i < singleChosenPassenger.length; i++) {
            if(singleChosenPassenger[i].priceBegin < minPrice) {
                minPrice = singleChosenPassenger[i].priceBegin;
            }
            if(singleChosenPassenger[i].priceEnd > maxPrice) {
                maxPrice = singleChosenPassenger[i].priceEnd;
            }
        }
        maxPrice = maxPrice * singleChosenPassenger.length;

        if(minPrice > _this.model.minHotelPrice || maxPrice < _this.model.maxHotelPrice) {
            _this.model.policyType = 2;
            for (var j = 0; j < singleChosenPassenger.length; j++) {
                var floatChosenPassenger = $.extend(true, {}, singleChosenPassenger[j]);
                floatChosenPassenger.priceBegin = minPrice;
                floatChosenPassenger.priceEnd = maxPrice;
                _this.model.violatePolicyList.push(floatChosenPassenger);
            }
        } else {
            _this.model.policyType = 1;
        }
    },

	//酒店下单接口
	order: function () {
        var _this = this;
        //公司预订权限校验
        _this.getCorporationAuthority();
        if (_this.model.domesticHotel != 1){
            NewPCPopHelper.alert("贵司暂未开通此产品的预订服务，若有需要，请联系差旅负责人");
            return;
        }
        // 校验违规原因
        console.log("校验违规原因="+_this.model.policyType)
        if(_this.model.policyType === 2) {
            if(!$('#selectViolate').text() || $('#selectViolate').text() === '请选择违规原因') {
                NewPCPopHelper.alert("请选择违规原因");
                return;
            }

            if($('#selectViolate').attr('data-addBoxRequired') == 1) {
                if(!$('#remarks').children('textarea').val() || $('#remarks').children('textarea').val()==='请填写备注信息,不超过50个字'){
                    NewPCPopHelper.alert("请填写备注信息,不超过50个字");
                    return;
                }
                if($('#remarks').children('textarea').val().length > 50) {
                    NewPCPopHelper.alert("备注信息不能超过50个字");
                    return;
                }
            }
        }

        var violateNameList = ''; // 违反禁止预订类的差旅政策名单
        for (var i = 0; i < _this.model.noRepeatViolatePolicyList.length; i++) {
            if(!_this.model.noRepeatViolatePolicyList[i].allowBook) {
                if(i+1 === _this.model.noRepeatViolatePolicyList.length) {
                    violateNameList += _this.model.noRepeatViolatePolicyList[i].employeeChineseName || _this.model.noRepeatViolatePolicyList[i].employeeEnglishName;
                } else {
                    violateNameList += _this.model.noRepeatViolatePolicyList[i].employeeChineseName || _this.model.noRepeatViolatePolicyList[i].employeeEnglishName+'，';
                    violateNameList += "，";
                }

            }
        }
        if(violateNameList) {
            NewPCPopHelper.alert(violateNameList+"违反禁止预订类的差旅政策，请重新选择。");
            return;
        }

        //如果需要担保则校验信用卡相关信息填写情况
        if($("#payInHotel").css('display') == 'block'){
            //if($("#payInHotel").is(":visible")){ //判断信用卡部分是否显示
            var ifChooseCredit = false;
            for(var i=0; i<$("#creditCardList .bank-tray").length; i++){
                if($("#creditCardList .bank-tray").eq(i).css("border-color")=="rgb(255, 0, 0)"){
                    ifChooseCredit = true;
                    break;
                }
            }
            //验证信用卡信息
            var creditCardNum = $("#creditCardNum"),  //证件号码
                creditNum = $("#creditNum"), //卡号
                CVV2Num = $("#CVV2Num"), //cvv2码
                verifyMouth = $("#monthSelect"), //选择信用卡有效期月份
                verifyYear = $("#yearSelect"),  //选择信用卡有效期年份
                creditPersonName = $("#creditPersonName"), //持卡人姓名
                creditPersonPhone = $("#creditPersonPhone"); //持卡人电话
            if(!ifChooseCredit){
                NewPCPopHelper.alert("请选择信用卡卡种");
                return;
            }
            if(!_this.verification.creditNumCheck(creditNum)){
                return;
            }
            if(!_this.verification.creditCVV2Check(CVV2Num)){
                return;
            }
            if(!_this.verification.mouthDateCheck(verifyMouth)){
                return;
            }
            if(!_this.verification.yearDateCheck(verifyYear)){
                return;
            }
            if(!_this.verification.creditNameCheck(creditPersonName)){
                return;
            }
            if(!_this.verification.creditPhoneCheck(creditPersonPhone)){
                return;
            }
            if(!_this.verification.creditCardCheck(creditCardNum)){
                return;
            }
        }
        if(!_this.verification.checkContacts()){    //校验联系人信息
            return;
        }
        if(!_this.verification.responseGroupCheck()){ 	//校验责任组
            return;
        }
        if(!_this.verification.responsePersonCheck()){ 	//校验责任人
            return;
        }
        if(!_this.verification.checkPassenger()){    //校验入住人
            return;
        }
        if(_this.model.bookPersonAndPassengers.itineraryNo == "" && _this.model.personInfo.auditReferenceType=="r" && !_this.verification.approvalPersonCheck()){ 	//校验审批参照人
            return;
        }
        //入住人校验
        var ifChoosePassenger = true;
        for(var i=0; i<$("#allHouseNum .accommodation-name").length; i++){
            console.log($(i+"---"+"#allHouseNum .accommodation-name").eq(i).text());
            if($("#allHouseNum .accommodation-name").eq(i).text() == "" ){
                ifChoosePassenger = false;
                break;
            }
        }
        if(!ifChoosePassenger){
            NewPCPopHelper.alert("请选择入住人");
        }

        //校验结算方式： 只要不为空就算有结算方式，否则为：未配置结算方式。hy45524 2017.6.14  --begin
        if(_this.model.settlementType){
            console.debug('配置了结算方式！');
        }else {
            console.debug('未配置结算方式！');
            NewPCPopHelper.alert("未配置结算方式！");
            return;
        }
        //校验结算方式： 只要不为空就算有结算方式，否则为：未配置结算方式。hy45524 2017.6.14  --end

        TmcLoading.open("订单提交中，请稍等");
        //提交订单
        _this.bookHotel();

    },

    //页面点击事件集合
    clickFunc : function () {
        var _this = this;
        //选择房间数量
        $("#houseNum").click(function () {
            $(this).siblings("#houseNumSelect").toggle();
        });		
		
        $(".choose-house-num").on("click", "li", function () {
            $("#houseNum").text($(this).text());
			console.log("预订房间数量"+$("#houseNum").text());
            $(this).parent().hide();
			
			// 刷新住客选择框
			var selectHtml = '';
			for(var i = 0; i < _this.model.adultCount; i++) {
				selectHtml += '<div class="clearfix person-select">\
					<div class="accommodation-name">请选择住客</div>\
					<ul class="accommodation-select-list"></ul>\
				</div>'
			}	

			var houseNum = "";
			for(var i=0; i<$("#houseNum").text(); i++){
				houseNum += '<div class="clearfix">\
					<span>房间'+(i+1)+'</span>\
					<div class="clearfix person-select-wrap">'+selectHtml+'</div>\
				</div>';
			}		
			
            // 初始化第一个人的差旅政策
            var singleChosenPassenger = [],
                chosenPassenger = [];

            singleChosenPassenger.push(_this.model.travelPolicyNeed[0]);
            chosenPassenger.push(singleChosenPassenger);
            _this.calculateTravelPolicy(chosenPassenger);
			
			/*
            var houseNum = "";
            //var loginName = _this.model.personInfo.bookPersonName || _this.model.personInfo.bookPersonEnlishName ;
            //默认显示第1个乘客信息
            for(var i=0; i<$("#houseNum").text(); i++){
                houseNum += "<div class='clearfix'>\
                    <span>房间"+(i+1)+"</span>\
                    <div class='accommodation-name'>"+_this.model.firstPassengerName+"</div>\
                    <ul class='accommodation-select-list'></ul>\
                </div><br>";
            }
			*/
			
            _this.model.hotelDetailInfo.allHousePrice = _this.model.singleTotalAmount*$("#houseNum").text();
            $("#singleTotalAmount").text(_this.model.hotelDetailInfo.allHousePrice);  //费用合计的价格
            $("#allHouseNum").html(houseNum);  //打印入住人列表
            $("#housePrice").text(_this.model.singleTotalAmount);  //单间多夜房费价格
            $("#housePriceNum").text("*"+$(this).text());  //房间数量
            var newServicePrize = "";
            if(_this.model.servicePrizeWay == 1){
                newServicePrize = _this.model.servicePrize * $(this).text();
                $("#serviceChargeNum").text(newServicePrize);
            }
			//按订单方式计算服务费 by huangyu on 2017.6.26 BEGIN
            else if(_this.model.servicePrizeWay == 2){
            	newServicePrize = _this.model.servicePrize ; 
            }
            ////按订单方式计算服务费 by huangyu on 2017.6.26  END
			
            $("#totalAmount").text(_this.model.hotelDetailInfo.allHousePrice+newServicePrize); //总价（服务费+房费）
			
			if(_this.model.passengersList && _this.model.passengersList.length > 0) {
				var passengerName = _this.model.passengersList[0].passengerName||_this.model.passengersList[0].passengerEnlishName;
				$("#allHouseNum .accommodation-name").eq(0).text(passengerName).attr({'id': _this.model.passengerList[0].passengerEmployeeId, 'data-index': '0'}).css('color','#333'); //默认房间1显示
			}
			
			//房间数量改变后要重新计算担保费BGN
			var hotelData = _this.model.productDetailDTO.data;  //酒店信息
			if(hotelData.paymentType == 1){   //支付类型为现付
				//$(".keep-house").show();      //房间保留时间选择框 --根据要求,现付一直显示
				//_this.maintainHotelTimeClick(); //保留房间时间选择
				if(hotelData.isNeedGuarantee){   //判断是否需要担保 true--需要 false--不需要
					_this.getGuaranteeInfo();    //获取担保费用
					if( _this.model.guaranteePrice > 0){ //担保费 > 0 才显示
						$("#guaranteeMoney").text(_this.model.guaranteePrice);  //设置担保费
						$("#guaranteePrice").show(); 	//显示担保费
					}
				}else{   //不需要担保
					if(hotelData.guaranteeCode == 4){   //是否为超时担保			
						//当房间保留时间 > 担保时间
						if($("#arriveTime").attr("data") > _this.model.guaranteeTime.substring(0,2)){
							 _this.getGuaranteeInfo();	//获取担保费用
							 if( _this.model.guaranteePrice > 0){ //担保费 > 0 才显示
								$("#guaranteeMoney").text(_this.model.guaranteePrice);  //设置担保费
								$("#guaranteePrice").show(); 	//显示担保费
							}
						  }
					}
				}
			}		
			//房间数量改变后要重新计算担保费END
        });
        //添加联系人模板
       $(".add-contact-person-btn").click(function(){
            if($(".hotel-info2-contact").length<3){
                $("#hotelContactPerson").append('<div class="hotel-info2-contact">\
        			<input type="text" placeholder="请输入联系人姓名" value="">\
            		<input type="text" placeholder="手机号" value="">\
            		<input type="text" placeholder="邮箱" value="">\
            		<a>删除</a>\
        		</div>');
            }
        });
        //删除联系人模板
        $("#hotelContactPerson").on("click","a",function(){
            if($(".hotel-info2-contact").length>1){
                $(this).parent().remove();
            }
        });
        //选择抄送人员
        $("#sendPerson").on("click",".TMC_checkbox",function(){
            $(this).toggleClass("checkbox_act");
        });
 
        //选择信用卡
        $(".settlement-way-wrap").on("click", ".bank-tray", function () {
            $(this).css("border-color","red");
            $(this).siblings(".bank-tray").css("border-color","#ddd");
            _this.model.checkedCredit.bankId = $(this).children(".bank").attr("bank-id");
            _this.model.checkedCredit.bankName = $(this).children(".bank").attr("bank-name");

        });
        //信用卡信息年份月份点击事件
        $(".settlement-way-wrap").on("click", "#monthSelect",function () {
            $(this).siblings(".month-err").hide();
            $(this).siblings(".month-list").toggle();
        });
        $(".settlement-way-wrap").on("click", ".month-list li", function () {
            $("#monthSelect").text($(this).text()).css("color", "#333");
            $(this).parent().hide();
        });
        $(".settlement-way-wrap").on("click", "#yearSelect",function () {
            $(this).siblings(".year-err").hide();
            $(this).siblings(".year-list").toggle();
        });
        $(".settlement-way-wrap").on("click", ".year-list li", function () {
            $("#yearSelect").text($(this).text()).css("color", "#333");
            $(this).parent().hide();
        });
		//信用卡证件类型选择
        $(".settlement-way-wrap").on("click", "#certificateType", function () {
            $(".month-list").hide();
            $(".year-list").hide();
            $(this).siblings("ul").toggle();
        });
        $(".settlement-way-wrap").on("click", ".card-type-list li", function () {
            $("#certificateType").text($(this).text()).attr("data-id", $(this).attr("data-id"));
            $(this).parent().hide();
        });

        //输入框失去焦点隐藏错误提示
        $(".settlement-way-wrap").on("focus", "input", function () {
            $(this).siblings(".input-err").hide();
        });
        //提交订单按钮点击事件
        $("#commitOrderBtn").click(function () {
            _this.order();
        });
		
		
		// 选择违规原因
		$('.violation-policy').on('click', '#selectViolate', function () {
            $(this).siblings('#violationSelectList').toggle();
        });
        $('.violation-policy').on('click', '#violationSelectList li', function () {
            $("#selectViolate").text($(this).text()).css('color', '#333');
            $("#selectViolate").attr({
                'data-whetheraddbox': $(this).attr('data-whetheraddbox'),
                'data-code': $(this).attr('data-code'),
                'data': $(this).attr('data'),
                'data-addBoxRequired': $(this).attr('data-addBoxRequired')
            });
            if($("#selectViolate").attr('data-whetheraddbox') == 1){
                $("#remarks").show();
            }else {
                $("#remarks").hide();
            }
            $(this).parent().hide();
        });

        //违反内容弹窗
        $('#travelPolicyWindow').hover (function () {
            $(this).children('#hotelPolicy').show();
        }, function () {
            $(this).children('#hotelPolicy').hide();
        });

        // 删除已选住客
        $('.keep-house').on('click', '.delete-passenger', function () {
            var $this = $(this);
            $this.siblings('.accommodation-name').text('请选择住客').css('color', '#999')
                .attr({'data-id': '', 'data-index': ''})
                .siblings('img').attr('src','//file.40017.cn/assets/tmc/images/destination-icon.png').removeClass("delete-passenger").addClass('show-select');
            if(_this.model.travelPolicyNeed.length) {
                _this.getAllHouseAndPas();
            }
        });
		
		//审批参照人点击事件
		$(".hotel-info2").on("click", "#approvalPerson",function () {			
            $(this).siblings(".approval-select-list").toggle();
        }); 
        $(".hotel-info2").on("click", ".approval-select-list li", function () {
            $("#approvalPerson").text($(this).text()).css("color", "#333");
			_this.model.auditReferenceEmployeeId = $(this).attr("data-id");
            $(this).parent().hide();
        });
		//责任组点击事件
		$(".hotel-info2").on("click", "#responseGroup",function () {
            $(this).siblings("ul").toggle();
        });
        $(".hotel-info2").on("click", "#responseGroupList li", function () {
            $("#responseGroup").text($(this).text()).css("color", "#333");
			$("#responseGroup").attr("data-id",$(this).attr("data-id"));
			_this.model.responsibleGroupId = $(this).attr("data-id");
			_this.model.responsibleGroupName = $(this).text();
            $(this).parent().hide();
			//责任人事件
			_this.getAllEmployeeByServiceGroupId(_this.model.responsibleGroupId);
        });
		//责任人点击事件
		$(".hotel-info2").on("click", "#responsePerson",function () {
            $(this).siblings("ul").toggle();
        });
        $(".hotel-info2").on("click", "#responsePersonList li", function () {
            $("#responsePerson").text($(this).text());
			$("#responsePerson").attr("data-id",$(this).attr("data-id"));
			_this.model.responsiblePersonId = $(this).attr("data-id");
			_this.model.responsiblePersonName = $(this).text();
			$(this).parent().hide();
        });
		//违反差旅政策的展开和收起
        $(".travel-policy").on("click", ".policy-btn", function () {
            if($(this).text() == "详情"){
                $(this).parent().siblings("ul").slideDown(300);
                $(this).parent().parent("div").siblings("div").children("ul").slideUp(300);
                $(this).text("收起");
                $(this).parent().parent("div").siblings("div").children("p").children(".policy-btn").text("详情");
            }else{
                $(this).parent().siblings("ul").slideUp(300);
                $(this).text("详情");
            }
        });
    },
    //选择房间保留时间
    maintainHotelTimeClick : function () {
		var _this = this;
        //保留房间选择
        $("#arriveTime").click(function () {
            $(this).parent().siblings("#arriveTimeList").toggle();
        });
        $(".keep-house").on("click", "#arriveTimeList li", function () {
            $("#arriveTime").text($(this).text());
			$("#arriveTime").attr("data",$(this).attr("data"));			
			$(this).parent().hide();
			_this.getRoomRetainDate(); //获取担保时间
			
			var hotelData = _this.model.productDetailDTO.data;  //酒店信息
			if(hotelData.paymentType == 1){   //支付类型为现付
				if(hotelData.isNeedGuarantee){   //判断是否需要担保 true--需要 false--不需要
					$("#payInHotel").show();  	 //显示信用卡(及到到店付,需要担保)
					_this.getGuaranteeInfo();    //获取担保费用
					if( _this.model.guaranteePrice > 0){ //担保费 > 0 才显示
						$("#guaranteeMoney").text(_this.model.guaranteePrice);  //设置担保费
						$("#guaranteePrice").show(); 	//显示担保费
					}
				}else{   //不需要担保
					if(hotelData.guaranteeCode == 4){   //是否为超时担保
						
						if($(this).attr("data") > _this.model.guaranteeTime.substring(0,2)){ //判断是否超时
							 $("#payInHotel").show();  		//显示信用卡(及到到店付,需要担保)
							 _this.getGuaranteeInfo();      //获取担保费				 
							 if( _this.model.guaranteePrice > 0){ //担保费 > 0 才显示
							     $("#guaranteeMoney").text(_this.model.guaranteePrice);  //设置担保费
								 $("#guaranteePrice").show(); 	//显示担保费
							 }				 
							 _this.isNeedGuarantee = true;  //设置是否需要担保为true
							 $("#hotelGuarantee").hide();	//超时，结算方式显示：到店付 隐藏
			             }else{
							 $("#guaranteePrice").hide(); //隐藏"需要担保费"
							 $("#payInHotel").hide();     //隐藏信用卡信息
							 _this.isNeedGuarantee = false;				
							 $("#hotelGuarantee").show();	//不超时，结算方式显示：到店付
						 }
						
					}else{ //非超时担保：不显示：信用卡(及到到店付,需要担保)、担保费
						$("#payInHotel").hide();     //隐藏信用卡信息
						$("#guaranteePrice").hide(); //隐藏"需要担保费"
						$("#hotelGuarantee").show(); //显示：到店付
						_this.isNeedGuarantee = false;
					}					
					
				}
			}else{//预付初始化已定义，此处不用重新计算
				
			}            
                          
        });
    },
    //联系人和抄送人员模块
    contactModule : function(){
        //加载自己为第一个联系人
        $(".hotel-info2-contact>input").eq(0).val(this.model.personInfo.bookPersonName||this.model.personInfo.bookPersonEnlishName);
        $(".hotel-info2-contact>input").eq(1).val(this.model.personInfo.bookPersonPhone);
        $(".hotel-info2-contact>input").eq(2).val(this.model.personInfo.bookPersonEmail);        
    },
    //支付类型模块
    ajaxGetPayType : function(){
		var _this = this;
		if( _this.model.productDetailDTO.paymentType == 1){//1-月结，2-现结
			_this.model.payType = "m";
			$("#payWayChoose").text("公司授信");
		}else{
			_this.model.payType = "n";
			$("#payWayChoose").text("个人支付");
		}

    },
    // 验证模块
    verification :{
        creditNumCheck : function (creditNum) {
            var div = creditNum;
            var a = div.val();
            var numReg = /^\d{15,16}$/;
            if(!a || a=='证件号码'){
                div.siblings(".input-err").html("<span></span>请输入卡号").show();
                return false;
            }
            if(!numReg.test(a)){
                div.siblings(".input-err").html("<span></span>请输入15或16位卡号").show();
                return false;
            }
            div.siblings(".input-err").hide();
            return true;
        },
		//校验cvv2码
        creditCVV2Check : function (verifyCVV2) {
            var div = verifyCVV2;
            var a = div.val();
            var numReg = /^\d{3}$/;
            if(!a || a=='证件号码'){
                div.siblings(".input-err").html("<span></span>请输入CVV2验证码").show();
                return false;
            }
            if(!numReg.test(a)){
                div.siblings(".input-err").html("<span></span>请输入3位验证码").show();
                return false;
            }
            div.siblings(".input-err").hide();
            return true;
        },
		//校验是否选择了月份
        mouthDateCheck : function (verifyMouth) {
            var div = verifyMouth;
            var a = div.text();
            if(!a || a=='月份'){
                div.siblings(".month-err").html("<span></span>请选择月份").show();
                return false;
            }
            div.siblings(".month-err").hide();
            return true;
        },
		//校验是否选择了年份
        yearDateCheck : function (verifyYear) {
            var div = verifyYear;
            var a = div.text();
            if(!a || a=='年份'){
                div.siblings(".year-err").html("<span></span>请选择年份").show();
                return false;
            }
            div.siblings(".year-err").hide();
            return true;
        },
		//校验持卡人姓名
        creditNameCheck : function (verifyName) {
            var div = verifyName;
            var a = div.val();
            var nameReg = /^[\u4e00-\u9fa5]{2,15}$/;
            if(!a || a=='输入持卡人姓名'){
                div.siblings(".input-err").html("<span></span>请输入持卡人姓名").show();
                return false;
            }
            if(!nameReg.test(a)){
                div.siblings(".input-err").html("<span></span>请输入2到15位中文姓名").show();
                return false;
            }
            div.siblings(".input-err").hide();
            return true;
        },
		//校验持卡人手机号
        creditPhoneCheck : function (verifyPhone) {
            var div = verifyPhone;
            var a = div.val();
            var phoneReg = /^\d{11,15}$/;
            if(!a || a=='输入持卡人手机号码'){
                div.siblings(".input-err").html("<span></span>请输入持卡人手机号码").show();
                return false;
            }
            if(!phoneReg.test(a)){
                div.siblings(".input-err").html("<span></span>请输入11到15位手机号码").show();
                return false;
            }
            div.siblings(".input-err").hide();
            return true;
        },
        //校验证件号码
        creditCardCheck : function (creditCardNum) {
            var div = creditCardNum;
            var a = div.val();
            var type = div.siblings(".card-type").attr("data-id");
            if(!a || a=='证件号码'){
                div.siblings(".input-err").html("<span></span>请输入证件号码").show();
                return false;
            }
            if(/\W/.test(a)){
                div.siblings(".input-err").html("<span></span>请正确输入证件号码").show();
                return false;
            }
            if(type==1&&!IdentityCodeValid(a)){  //证件类型为身份证
                div.siblings(".input-err").html("<span></span>请正确输入身份证号码").show();
                return false;
            }
            div.siblings(".input-err").hide();
            return true;
        },
		//校验联系人信息
        checkContacts : function(){
            var ifComplete = true;
            $(".hotel-info2-contact").each(function(){ //只校验姓名和手机，邮箱非必填
                if(!$(this).children("input").eq(0).val()){
                    ifComplete = false;
                    NewPCPopHelper.alert("请检查联系人中是否有姓名栏未填写");
                    return false;
                }
                if(!/^1[3,4,5,7,8]\d{9}$/.test($(this).children("input").eq(1).val())){
                    ifComplete = false;
                    NewPCPopHelper.alert("请检查联系人中是否有手机号未填写或填写错误");
                    return false;
                }
            });
            return ifComplete;
        },
		// 校验是否选择入住人
        checkPassenger: function () {
            var ifComplete = true;
            $(".person-select-wrap").each(function(){
                for(var i = 0; i < $(this).children('.person-select').length; i++) {
                    if($(this).children('.person-select').eq(i).children(".accommodation-name").text() === '请选择住客'){
                        ifComplete = false;
                        if(i+1 === $(this).children('.person-select').length) {
                            NewPCPopHelper.alert("每间房间至少选择一名住客");
                            return false;
                        }
                    }else {
                        ifComplete = true;
                        break;
                    }
                }
            });
            return ifComplete;
        },
 
		//校验责任组
		responseGroupCheck : function () {			
            var div = $("#responseGroup");
            var a = div.text();
            if(!a || a==''){
				NewPCPopHelper.alert("请选择责任组");
                return false;
            }
            return true;
        },
		//校验责任人
		responsePersonCheck : function () {			
            var div = $("#responsePerson");
            var a = div.text();
            if(!a || a==''){
				NewPCPopHelper.alert("请选择责任人");
                return false;
            }
            return true;
        },
		//校验审批参照人
		approvalPersonCheck : function () {			
            var div = $("#approvalPerson");
            var a = div.text();
            if(!a || a==''){
				NewPCPopHelper.alert("请选择审批参照人");
                return false;
            }
            return true;
        }
    },
    //获取服务费
    getServicePrize : function(){		
        var data = 0;
        var _this = this;

        $.ajax({
            type:"POST",
            url :__ctx +"/hotel/getDHServiceFee",
            data :JSON.stringify({
                "businesstripNature" : 1,//出差类型，1：因公
                "buyChannel" : 1,//购买渠道 1：offline 2：APP 3：PC //OP使用1
                "hotelCategory" : _this.model.productDetailDTO.data.paymentType,//酒店类别 1：现付 2：预付 3：协议 
                "companyId" : _this.model.bookPersonAndPassengers.bookPerson.bookCompanyId //1
            }),
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(json){
				var aa = JSON.stringify(json);
                if(json.result){
                    if(json.obj && json.obj.amount){
                        data = json.obj.amount;
						console.log("获取服务费="+data);
                        $("#serviceCharge").show();
						console.log("服务费收取方式="+json.obj.chargeWay);
                        if(json.obj.chargeWay == 2){  //收取方式  2 ：按订单
                            _this.model.servicePrize = data;
                            _this.model.servicePrizeWay = 2;
                            $("#serviceChargeNum").text(_this.model.servicePrize);
                        }else if(json.obj.chargeWay == 1){ //收取方式  1:按间夜
                            _this.model.servicePrize = data*_this.model.hotelDetailInfo.hotelDayNum*$("#houseNum").text();
                            _this.model.servicePrizeWay = 1;
                            $("#serviceChargeNum").text(_this.model.servicePrize);  //一夜一间的服务费
                        }
                    }
                } 
            },
            error:function(){
                console.log("获取服务费失败");
            }
        });
    },
    //获取信用卡信息
    getCreditInfo : function(){
        var _this = this;
        $.ajax({
            type:"POST",
            url :__ctx+"/hotel/getCardTypeList",
            data :JSON.stringify({
                "orderType":1//, //1：国内酒店；2：国内机票；6：团购；7：门票
            }),
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(data){
				var aa = JSON.stringify(data);
                var creditList = "";
                if(data.result){
					if(data.obj && data.obj.payMentMerchants){
						_this.model.cardTypeList = data.obj.payMentMerchants;
						for(var i=0; i<_this.model.cardTypeList.length; i++) {
							if(_this.model.cardTypeList[i].cardBankLogoUrl == "http://pic4.40017.cn/hotel/2016/04/25/14/S60xu8.jpg"){
								creditList+="<div class='bank-tray'>\
								<div class='bank bank_"+_this.model.cardTypeList[i].creditCardBankId+"' bank-id='"+_this.model.cardTypeList[i].creditCardBankId+"'\
								bank-name='"+_this.model.cardTypeList[i].paymentWayName+"'></div>\
							</div>";
							}else {
								var imageUrl = "http://file.40017.cn/assets/tmc/images/card-type.jpg";
								$(this).css("background",'url('+imageUrl+')');
								creditList+="<div class='bank-tray'>\
									<div class='bank' bank-id='"+_this.model.cardTypeList[i].creditCardBankId+"'  bank-name='"+_this.model.cardTypeList[i].paymentWayName+"'>\
										<img src='"+_this.model.cardTypeList[i].cardBankLogoUrl+"'>\
									</div>\
								</div>";
							}
						}
					}
                }
                $("#creditCardList").html(creditList);
            },
            error:function(){
                console.log("获取信用卡信息失败");
            }
        });
    },
	
	//获取差旅政策
    getTravelPolicy : function(){
        var _this = this;
        $.ajax({
            type: "POST",
            url: __ctx+"/hotel/getHotelProtocolsByEmployeeIdsAndCityId",
            data: JSON.stringify({
                employeeIds: _this.model.employeeIds, // 员工id集合 
                cityId: _this.model.hotelResourceDTO.data.cityId //_this.model.cityId // 城市id
            }),
            dataType: "json",
            async: false,
            contentType: "application/json; charset=utf-8",
            success: function(data){ 
                if(data.success && data.values){
                    _this.model.travelPolicy = data.values; // 备份数据

                    for(var i = 0; i < data.values.length; i++) {
                        var singlePassengerPolicy = {}; // 每个人的差旅政策

                        singlePassengerPolicy.employeeId = data.values[i].employeeId; // 员工id
                        singlePassengerPolicy.employeeChineseName = data.values[i].employeeChineseName; // 中文姓名
                        singlePassengerPolicy.employeeEnglishName = data.values[i].employeeEnglishName; // 英文姓名

                        // 如果制定了差旅政策
                        if(data.values[i].hotelProtocolNewDTO){
                            var policyDetail = data.values[i].hotelProtocolNewDTO;
                            singlePassengerPolicy.standardRule = policyDetail.standardRule; // 1.按最高标准入住（A或B）  2.入住标准叠加（A+B）3.入住标准叠加（最低A+A）4.入住标准叠加（最高B+B）
                            singlePassengerPolicy.scaleValue = policyDetail.scaleValue; // 浮动比例值
                            singlePassengerPolicy.fixedValue = policyDetail.fixedValue; // 浮动固定值
                            singlePassengerPolicy.ruleSenable = policyDetail.ruleSenable; // 单人上浮规则是否启用 0-未启用 1-启用
                            if (policyDetail.dynamicTravelProtocolHotelReferStandardDTO) { // 引用城市标准
                                singlePassengerPolicy.standardDTO = {};
                                singlePassengerPolicy.standardDTO.priceBeginStandard = policyDetail.dynamicTravelProtocolHotelReferStandardDTO.priceBegin; // 价格区间起
                                singlePassengerPolicy.standardDTO.priceEndStandard = policyDetail.dynamicTravelProtocolHotelReferStandardDTO.priceEnd; // 价格区间止
                                singlePassengerPolicy.standardDTO.allowBook = policyDetail.dynamicTravelProtocolHotelReferStandardDTO.allowBook; // 是否允许预定 1-允许,0-禁止
                            }
                            singlePassengerPolicy.priceBegin = policyDetail.dynamicTravelProtocolHotelStandardDTO.priceBegin; // 价格区间起
                            singlePassengerPolicy.priceEnd = policyDetail.dynamicTravelProtocolHotelStandardDTO.priceEnd; // 价格区间止
                            singlePassengerPolicy.allowBook = policyDetail.dynamicTravelProtocolHotelStandardDTO.allowBook; // 是否允许预定 1-允许,0-禁止
                        } else {
                            singlePassengerPolicy.noPolicy = true; // 未制定差旅政策
                        }
                        _this.model.travelPolicyNeed.push(singlePassengerPolicy);
                    }
					for (var j = 0; j < _this.model.travelPolicyNeed.length; j++) {
                        if (!_this.model.travelPolicyNeed[j].noPolicy) {
                            _this.model.policyType = 1;
                            _this.model.standardRule = _this.model.travelPolicyNeed[j].standardRule;
                            break;
                        } else {
                            _this.model.policyType = 0;
                        }
                    }
					console.log(_this.model.travelPolicyNeed)
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
	
	//获取抄送人
    getServicePersons : function(){
        var _this = this;
        $.ajax({
            type:"POST",
            url :__ctx+"/employees/"+_this.model.personInfo.bookPersonEmployeeId+"/servicepersons", //__ctx+"/employees/"+"1000000033"+"/servicepersons",
            data : {},
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(data){
				var aa = JSON.stringify(data);
                if(data.result){
					if(data.obj){
						var empData = data.obj;
						for(var i = 0; i<empData.length;i++){
						$("#sendPerson").append('<div class="hotel-info2-send">\
							<p style="width:130px">'+empData[i].servicePersonTypeName+'：<span data="'+empData[i].servicePersonTypeName+'">'+empData[i].name+'</span></p>\
							<p style="width:170px">手机：<span>'+empData[i].mobile+'</span></p>\
							<p style="width:220px">邮箱：<span>'+empData[i].email+'</span></p>\
							<p style="display:none">员工ID：<span>'+empData[i].employeeId+'</span></p>\
							<p><span class="TMC_checkbox"></span><span>接收订单信息</span></p>\
						</div>')
						}
					}
                }
            },
            error:function(){
                console.log("获取抄送人失败");
            }
        });
    },
	//获取责任组
    getResponsibleGroups : function(){
        var _this = this;
        $.ajax({
            type:"POST",
            url :__ctx+"/resource/getResponsibleGroups",
            data : {},
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(data){
				var aa = JSON.stringify(data);
				if(data && data.length>0){
					var responseGroups = "";
					for(var i=0;i<data.length;i++){
						responseGroups += "<li data-id="+data[i].id+">"+data[i].name+"</li>"
					}   
					$("#responseGroupList").html(responseGroups);	
				}				
            },
            error:function(){
                console.log("获取责任组失败");
            }
        });
    },
	//获取责任人
    getAllEmployeeByServiceGroupId : function(responsibleGroupId){
        var _this = this;
        $.ajax({
            //type:"POST",
            url :__ctx+"/resource/getResponsiblePepoleByGroupId",
            data : {
				responsibleGroupId:responsibleGroupId	
			},
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(data){
				var aa = JSON.stringify(data);
				if(data && data.length>0){
					var responsePersons = "";
					for(var i=0;i<data.length;i++){
						responsePersons += "<li data-id="+data[i].id+">"+data[i].chineseName||data[i].englishName+"</li>"
					}
					$("#responsePersonList").html(responsePersons);
				}				
            },
            error:function(){
                console.log("获取责任人失败");
            }
        });
    },
	//获取公司销售、客户经理
    getCorporation : function(id){
        var _this = this;
        $.ajax({
            //type:"POST",
            url :__ctx+"/basicinfo/corporations/"+id,
            data : {},
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(data){
				var aa = JSON.stringify(data);
				if(data.result){
					if(data.obj){
						var corporationDTO = data.obj;
						if(corporationDTO){
							var corporationDetail = corporationDTO.corporationDetail;
							var sellerId = corporationDetail.sellerId;
							var sellerName = corporationDetail.sellerName;
							var managerId = corporationDetail.managerId;
							var managerName = corporationDetail.managerName;
							$("#sellerName").text(sellerName);
							$("#managerName").text(managerName);
							_this.model.salesId = sellerId;
							_this.model.salesName = sellerName;
							_this.model.customerManagerId = managerId;
							_this.model.customerManagerName = managerName;
						}
					}					
				}
            },
            error:function(){
                console.log("获取公司销售、客户经理失败");
            }
        });
    },
    //获取登录员工信息
    getLoginUserInfo : function(){
        var _this = this;
        $.ajax({
            //type:"POST",
            url :__ctx+"/hotel/getLoginUserInfo",
            data : {},
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(data){
				var aa = JSON.stringify(data);
				if(data.result){
					if(data.obj && data.obj.tmcEmployeeId){
						_this.model.operatorId = data.obj.tmcEmployeeId;						
					}					
				}
            },
            error:function(){
                console.log("获取登录员工信息失败");
            }
        });
    },
	//获取员工结算方式
    getSettlementMethod : function(employeeId){
        var _this = this;
        $.ajax({
            //type:"POST",
            url :__ctx+"/hotel/getSettlementMethod",
            data : {
				employeeId:employeeId
			},
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(data){
				var aa = JSON.stringify(data);
				if(data.result){
					if(data.obj && data.obj.domesticHotelMethod){
						//国内酒店结算方式：1-月结，2-现结
						if(data.obj.domesticHotelMethod == 1){
							_this.model.settlementType = "m";
							$("#payWayChoose").text("公司授信");
						}else if(data.obj.domesticHotelMethod == 2){
							_this.model.settlementType = "n";
							$("#payWayChoose").text("个人支付");
						}						 
					}					
				}
            },
            error:function(){
                console.log("获取员工结算方式失败");
            }
        });
    },
	
	//获取违反差旅政策原因
    getViolateReason: function(){
        var _this = this;
        $.ajax({
            url :__ctx+"/hotel/getViolationReason",
			data:{
				"corporationId": parseInt(_this.model.personInfo.bookCompanyId), //预订人公司ID
				"productType": 3 //国内酒店ID
			},
            dataType:"json",
            contentType: "application/json; charset=utf-8",
            async:false,
            success: function(data){
                if(data.success && data.values){
					var reasonContent = '';
                    for(var i = 0; i < data.values.length; i++) {
						console.log(data.values[i].addBoxRequired);
						console.log(data.values[i].whetherAddBox);
						console.log(data.values[i].code);
						console.log(data.values[i].reasonChinese);
						
						reasonContent += '<li data-addBoxRequired='+data.values[i].addBoxRequired+' data-whetherAddBox='+data.values[i].whetherAddBox+
						' data-code='+data.values[i].code+
						' data='+data.values[i].reasonChinese+
						'>'+
						data.values[i].reasonChinese+
						'</li>';
						
                    }
                    $('#violationSelectList').html(reasonContent);
					console.log("reasonContent="+reasonContent);
                }
            },
            error:function(){
                console.log("获取差旅政策失败");
            }
        });
    },
	//获取公司预订产品权限
    getCorporationAuthority:function () {
    	var _this = this;
        $.ajax({
            url:__ctx + "/tmcCorporation/getCorporationAuthority?corporationId=" + _this.model.personInfo.bookCompanyId,
            contentType: "application/json",
            datatype:"json",
            async:false,
            error: function(data1){
                toastr.error(data1.message, "请求失败", toastrConfig);
            },
            success:function(data){
                if (data.result && data.obj) {
                	_this.model.domesticHotel = data.obj.domesticHotel;
                };
            }
        });
    },
	//加密
    Encrypt : function (word){
        var _this = this;
        srcs = CryptoJS.enc.Utf8.parse(word);
        var encrypted = CryptoJS.AES.encrypt(srcs,CryptoJS.enc.Utf8.parse(_this.model.key) , {iv: CryptoJS.enc.Utf8.parse(_this.model.iv),mode:CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7});
        return encrypted.ciphertext.toString().toUpperCase();
    },
    //解密
    Decrypt : function(word){
        var encryptedHexStr = CryptoJS.enc.Hex.parse(word);
        var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        var decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv,mode:CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7});
        var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        return decryptedStr.toString();
    },
    //跳转酒店详情
	ToHotelDetail : function(){
		var _this = this;
		var data = JSON.stringify(_this.model.bookPersonAndPassengers);
        var resourceId = _this.model.hotelResourceDTO.data.resourceId; 					//JSON.stringify($(this).attr("data"));
        var startDate = _this.model.productDetailDTO.data.startTime.substring(0,10);	//_this.model.startDate;
        var endDate = _this.model.productDetailDTO.data.endTime.substring(0,10);		//_this.model.endDate;
        var form = $("<form></form>");
            form.attr('action', __ctx+"/hotel/detail")
            form.attr('method', 'post')
            var input1 = $("<input type='text' id='bookdate' name='bookPersonAndPassengersDTOStr'/>");
            var input2 = $("<input type='text' id='resourceId' name='resourceId'/>");
            var input3 = $("<input type='text' id='startDate' name='startTime'/>");
            var input4 = $("<input type='text' id='endDate' name='endTime'/>");
            form.append(input1);
            form.append(input2);
            form.append(input3);
            form.append(input4);
            form.appendTo("body")
            form.css('display', 'none');
            $("#bookdate").val(data);
            $("#resourceId").val(JSON.parse(resourceId));               
            $("#startDate").val(JSON.stringify(startDate));
            $("#endDate").val(JSON.stringify(endDate));
            form.submit(); 
	},
    //下单接口
    bookHotel : function () {
        var _this = this;
        var BookRequestDTO = {};//下单参数对象
        //对象中加入酒店基本信息
        BookRequestDTO.productDetailDTO = _this.model.productDetailDTO.data;
        //对象中加入加密信息
        BookRequestDTO.encrypt = _this.model.encrypt;
        //对象中加入所有联系人
        BookRequestDTO.contactPersons = [];
        $(".hotel-info2-contact").each(function(){
            var $data = $(this).children("input");
            BookRequestDTO.contactPersons.push({personName:$data.eq(0).val(),personTelephone:$data.eq(1).val(),personEmail:$data.eq(2).val()});
        });
        //对象中加入结算方式(月结：m, 现结：n) //根据预订人去获取
        BookRequestDTO.settlementType = _this.model.settlementType; //_this.model.payType;
        //对象中加入抄送人名单 
        BookRequestDTO.servicePersons = [];
        $(".hotel-info2-send").each(function(){
            var $this =$(this).children("p");
            if($(this).find(".TMC_checkbox").hasClass("checkbox_act")){
                BookRequestDTO.servicePersons.push({
                    servicePersonName : $this.eq(0).children("span").text(),
                    servicePersonType : $this.eq(0).children("span").attr("data"),
                    servicePersonPhone : $this.eq(1).children("span").text(),
                    servicePersonEmail : $this.eq(2).children("span").text(),
                    passengerEmployeeId : parseInt($this.eq(3).children("span").text())
                });
            }
        });
        //行程类型 1.因公，2.因私
        BookRequestDTO.itineraryType = 1;
        //行程编号
        BookRequestDTO.itineraryNo = _this.model.bookPersonAndPassengers.itineraryNo;
		//行程编号不空时,下单时不传"审批参照人ID",下单页面不显示"审批参照模式"
        //加入审批参照人员工ID, 审批参照类型r时，传审批人参照人ID；审批参照类型b时，传审批人预订人ID；
		if(BookRequestDTO.itineraryNo == ""){
			if(_this.model.personInfo.auditReferenceType == "r"){
			BookRequestDTO.auditReferenceEmployeeId =  parseInt(_this.model.auditReferenceEmployeeId); 
			}else if(_this.model.personInfo.auditReferenceType == "b"){
				BookRequestDTO.auditReferenceEmployeeId =  parseInt(_this.model.personInfo.bookPersonEmployeeId); 
			} 
		}else{
			//不传"审批参照人ID",下单页面不显示"审批参照模式"
		}
		       
        //加入审批类型
		BookRequestDTO.auditReferenceType = _this.model.personInfo.auditReferenceType; 
		//预订人信息
		BookRequestDTO.bookingPersonDTO = {};
		/** 预订人所在公司id */
		BookRequestDTO.bookingPersonDTO.corporationId =  parseInt(_this.model.personInfo.bookCompanyId); 
		/** 预订人id */
		BookRequestDTO.bookingPersonDTO.personId = parseInt(_this.model.personInfo.bookPersonEmployeeId); 
		/** 预订人名字 */
		BookRequestDTO.bookingPersonDTO.personName = (_this.model.personInfo.bookPersonName||_this.model.personInfo.bookPersonEnlishName);
		/** 预定人手机号 */
		BookRequestDTO.bookingPersonDTO.phone = _this.model.personInfo.bookPersonPhone;
		
        //对象中加入乘客列表
        BookRequestDTO.passengerDTOs = [];
        for(var i=0;i<_this.model.passengersList.length;i++){
            var certificateType = "",   //证件类型名称
                certificateTypeCode = "",   //证件类型代码
                certificateCode = "";   //证件号码
            if(_this.model.passengersList[i].certificates.length > 0){
                certificateType = _this.model.passengersList[i].certificates[0].certificateType;
                certificateTypeCode = _this.model.passengersList[i].certificates[0].certificateTypeId;//_this.model.passengersList[i].certificates[0].certificateTypeCode;
                certificateCode = _this.model.passengersList[i].certificates[0].certificateCode;
            }
            BookRequestDTO.passengerDTOs.push({
                id : _this.model.passengersList[i].passengerEmployeeId||"",   //乘客id (目前用乘客员工id)
                passengerName : _this.model.passengersList[i].passengerName||_this.model.passengersList[i].passengerEnlishName,   //乘客姓名
                passengerCompanyId : _this.model.passengersList[i].passengerCompanyId||"",    //所属公司id
                //passengerDepartmentId : _this.model.passengersList[i].passengerDepartmentId||"",    //所属部门ID 此字段不要传
                certificateType : certificateType,  //证件类型名称
                certificateTypeCode : certificateTypeCode,  //证件类型代码
                certificateCode : certificateCode,   //证件号码
                sex : _this.model.passengersList[i].passengerSex || "", //性别
                birthDate : _this.model.passengersList[i].passengerBirthDate || ""  //出生日期(YYYY-mm-dd)
            });
            if(BookRequestDTO.passengerDTOs[i].certificateType!="身份证"){
                BookRequestDTO.passengerDTOs[i].sex = $(".seclect-book2-Gender>p").eq(i).text();
                BookRequestDTO.passengerDTOs[i].birthDate = $(".BirthDate").eq(i).val();
            }
        }
        //对象中加入信用卡信息
        if($("#payInHotel").is(":visible")){ //判断信用卡部分是否显示
			BookRequestDTO.creditCardInfoDTO = {};
			BookRequestDTO.creditCardInfoDTO.cardNumber = _this.Encrypt($("#creditNum").val());
			BookRequestDTO.creditCardInfoDTO.bankId = _this.model.checkedCredit.bankId;
			BookRequestDTO.creditCardInfoDTO.bankName = _this.model.checkedCredit.bankName;
			BookRequestDTO.creditCardInfoDTO.cv2AuthCode = _this.Encrypt($("#CVV2Num").val());
			BookRequestDTO.creditCardInfoDTO.avaliableTime = _this.Encrypt($("#yearSelect").text()+"/"+$("#monthSelect").text());
			BookRequestDTO.creditCardInfoDTO.cardName = _this.Encrypt($("#creditPersonName").val());
			BookRequestDTO.creditCardInfoDTO.cardPhoneNumber = _this.Encrypt($("#creditPersonPhone").val());
			BookRequestDTO.creditCardInfoDTO.certificateType = _this.Encrypt($("#certificateType").attr("data-id"));
			BookRequestDTO.creditCardInfoDTO.certificateNumber = _this.Encrypt($("#creditCardNum").val());
		}        
        //对象中加入酒店预订填写信息
        BookRequestDTO.bookFillInfoDTO = {};
		/*    BookRequestDTO.bookFillInfoDTO.name = [];
        $("#allHouseNum .accommodation-name").each(function(){
            BookRequestDTO.bookFillInfoDTO.name.push($(this).eq(0).text());
        }); name ->　roomAndName　*/
		
		BookRequestDTO.bookFillInfoDTO.roomAndName = [];   //入住人员工ID 列表
        for(var i = 0; i < $('#allHouseNum>div').length; i++) {
            var singleRoomAndName = {};
            singleRoomAndName.roomNum = i+1;
            singleRoomAndName.employees = [];
            for(var j = 0; j < $('#allHouseNum>div').eq(i).find('.person-select').length; j++) {
                if($('#allHouseNum>div').eq(i).find('.person-select').eq(j).find('.accommodation-name').attr('id')) {
                    singleRoomAndName.employees.push($('#allHouseNum>div').eq(i).find('.person-select').eq(j).find('.accommodation-name').attr('id'));
                }
            }
            BookRequestDTO.bookFillInfoDTO.roomAndName.push(singleRoomAndName);
        }
		
		//1现付下单要传保留时间
		if( _this.model.productDetailDTO.data.paymentType == 1 ){
			BookRequestDTO.bookFillInfoDTO.roomRetainDate = _this.model.roomRetainDate;
		}
        
        BookRequestDTO.bookFillInfoDTO.remark = $(".hotel-remark").val();
        BookRequestDTO.bookFillInfoDTO.roomNum = parseInt($("#houseNum").text());
		/** 销售ID */
		BookRequestDTO.salesId =  parseInt(_this.model.salesId);
		/** 销售名称 */
		BookRequestDTO.salesName = _this.model.salesName;
		/** 客户经理ID */
		BookRequestDTO.customerManagerId =  parseInt(_this.model.customerManagerId);
		/** 客户经理名称 */
		BookRequestDTO.customerManagerName = _this.model.customerManagerName;
		/** 责任人ID */
		BookRequestDTO.responsiblePersonId =  _this.model.responsiblePersonId;
		/** 责任人名称 */
		BookRequestDTO.responsiblePersonName = _this.model.responsiblePersonName;
		/** 责任组ID */
		BookRequestDTO.responsibleGroupId =  parseInt(_this.model.responsibleGroupId);
		/** 责任组名称 */
		BookRequestDTO.responsibleGroupName = _this.model.responsibleGroupName;
		/** 订单渠道 1：Online（PC）2：Online（APP）3：Online（WX）4：Online（API）5：Offline（白屏）6：Offline（手工）*/
		BookRequestDTO.orderChannel = 5; 
		/** 供应商类型 1.手工单 2.同程 3.协议 4.外采 */
		BookRequestDTO.supplierType = 2; //_this.model.supplierType;
		
        //对象中加入违反的差旅政策原因
        BookRequestDTO.violationReasons = [];//_this.model.violationReasons;
		for (var i = 0; i < _this.model.noRepeatViolatePolicyList.length; i++) {
            var singleViolationReason = {};
            if($("#remarks").children('textarea').is(':visible') && $('#remarks').children('textarea').val() != "" ){ //可见不为空：入参 违规原因+（备注），否则仅有 违规原因
				singleViolationReason.violationReason = $('#selectViolate').text() + '（' + $('#remarks').children('textarea').val() + '）';
			}else {
				singleViolationReason.violationReason = $('#selectViolate').text() ;
			}
            singleViolationReason.violationReasonCode = $('#selectViolate').attr('data-code');
            singleViolationReason.passengerId = _this.model.noRepeatViolatePolicyList[i].employeeId;
            BookRequestDTO.violationReasons.push(singleViolationReason);
        }
		
		/** 是否需要担保 */
		BookRequestDTO.isNeedGuarantee = _this.model.isNeedGuarantee;
		/** 操作人ID */
		BookRequestDTO.operatorId = _this.model.operatorId;
		console.log(JSON.stringify(BookRequestDTO));
		//下单操作
		var dto = BookRequestDTO;
		$.ajax({
            type:"POST",
            url :__ctx+"/hotelOrder/createOrder",
            data:JSON.stringify(dto),
            dataType:"json",
            async:false,
            contentType: "application/json; charset=utf-8",
            success: function(data){
				var aa = JSON.stringify(data);
				console.log("aa="+aa)
                if(data.result){
					TmcLoading.close();
					if(data.obj && data.obj.itineraryNo){
						var itineraryNo = data.obj.itineraryNo;
						window.location.href = __ctx + "/itineraryproduct/itineraryproductlist?itineraryNo="+itineraryNo;
					}                    					
                }else{ 
					TmcLoading.close();
					//返回错误代码LY0521026208、LY0521026209，提示库存不足，跳转详情页面
					if(data.errorCode && (data.errorCode=="LY0521026208" || data.errorCode=="LY0521026209") ){
						NewPCPopHelper.alert("该房型已订完，请重新选择其他房型", function () {
                            _this.ToHotelDetail();    //库存不足跳转到酒店详情页
                        });
					}else if (data.errorCode && (data.errorCode=="LY0521026215")){
                        NewPCPopHelper.alert("贵司暂未开通此产品的预订服务，若有需要，请联系差旅负责人", function () {
                        });
					}else if(data.errorCode === 'LY0521026216'){
                        NewPCPopHelper.alert("该行程已提交，不可继续添加", function () {
							// 不做任何处理
                        });
                        /*NewPCPopHelper.isToContinueBooking("您当前行程已提交，继续添加，则会创建新行程", function () {
                            _this.isToContinueBooking_cancel();    //取消，无操作
                        },function () {
                            _this.isToContinueBooking_continue();  //继续，抹除行程单号继续创建订单
                        });*/
                    }else{
						NewPCPopHelper.alert("下单失败,请重新下单", function () {
							_this.ToHotelDetail();    //下单失败跳转到酒店详情页
						});
					}
				}
            },
            error:function(){
            	TmcLoading.close();
                console.log("下单失败");
				NewPCPopHelper.alert("下单失败,请重新下单", function () {
					_this.ToHotelDetail();    //下单失败跳转到酒店详情页
				});
            }
        });
		
    },

    isToContinueBooking_cancel : function () {
    },

    isToContinueBooking_continue : function () {
		// 行程已经提交但是任继续下单，擦除行程单号，创建新行程
        hotelBook2.model.bookPersonAndPassengers.itineraryNo = '';
        // 调用预订接口
		this.order();
    }
};
window.hotelBook2 = hotelBook2;
hotelBook2.init();