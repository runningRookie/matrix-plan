/*TMC-hotel-book1酒店列表脚本-------------------朱辉20170204------------------------------*/
var book1 = {
	model : {
		keyword:"",//关键字保存
		cityId:"53",//目的地ID
		cityType:0,//目的地类型，0：市，1：区或县级市
		sectionId:"",//行政区ID
		startDate:"",//入住日期
		endDate:"",//离店日期
		bdId:"",//商圈ID
		lp:"",//价格范围,其中"["表示包含边界，"}"不包含边界
		classId:[],//星级ID
		chainId:[],//品牌ID
		estId:[],//酒店设施
		lonAndLatList:[],//列表经纬度集合
		map:new BMap.Map("baidu-map"),//百度地图挂靠
		checkKeyInfo:{checkCityId:"53",type:"0"},//存放关键字搜索所需要的目的地数据
		//bookPersonAndPassengers:window.bookPersonAndPassengers,//预订人与乘客信息；

	},
	init : function(){		
		this.hotelTimeFunc();//加入选择日期控件
		$("#baidu-map").height(window.innerHeight-110);//地图模块设置
		this.hotelListDate(1,1);//酒店列表数据加载
		this.hotelScreenClickFunc();//筛选区域相关事件
		this.baiduMapFunc();//页面与地图交互效果
		this.hotelCityFunc();//目的地查询
		this.hotelKeyFunc();//关键字查询
		this.book1ClickFunc();//页面点击事件集合
	},
	//酒店列表数据加载,当目的地更改时或第一次加载，type=1;其他情况为2
	hotelListDate : function(type,pageNum,sectionId){//pageNum:分页
		var _this = this;
		$(".hotel-list-left").html('<div class="hotel_list-loading " style=""><img src="http://img1.40017.cn/cn/comm/images/cn/public/transparent_loading_v2.gif" ><br>正在加载，请稍后</div>')
		var requestData = {
			caller:"pc",//调用平台
			cityId:_this.model.cityId,//目的地
			startDate:_this.model.startDate,//入住日期
			endDate:_this.model.endDate,//离店日期
			pageNum:pageNum,//分页
			pageSize:20,//每页最大内容
		}
		//关键字
		if(_this.model.keyword){
			requestData.keyword = _this.model.keyword;
		}
		//行政区ID,当方法中传sectionId。优先使用传的值
		if(sectionId){
			requestData.sectionId = sectionId;
		}else if(_this.model.sectionId){
			requestData.sectionId = _this.model.sectionId;
		}
		//商圈ID
		if(_this.model.bdId){
			requestData.bdId = _this.model.bdId;
		}
		//价格区间
		if(_this.model.lp){
			requestData.lp = _this.model.lp;
		}
		//星级ID
		if(_this.model.classId.length>0){
			requestData.classId = _this.model.classId;
		}
		//品牌ID
		if(_this.model.chainId.length>0){
			requestData.chainId = _this.model.chainId;
		}
		//酒店设施
		if(_this.model.estId.length>0){
			requestData.estId = _this.model.estId;
		}									
		$.ajax({
			type:"POST",
			url : __ctx+"/hotel/getHotelList",
			data :JSON.stringify(requestData),
			contentType: "application/json; charset=utf-8",
			dataType:"json",
			async:true,
			success: function(json){
				_this.model.map.clearOverlays()//清除所有百度坐标 
				$(".hotel-list-left").html("");
				if(type===1){
					_this.hotelScreenList(json.obj);//加载所有品牌、行政区、商圈    
				}
                // console.log(json.obj.hotelList);
				_this.model.lonAndLatList = [];
				var data = json.obj.hotelList;
					if(!data||data.length===0){
					$(".hotel-list-left").html("<p>暂无搜索结果，已为您还原筛选相关条件，请重新搜索</p>");
					//清空关键字和筛选条件
					_this.model.keyword = "";					
					$("#input-key").val("");
					_this.reductionSec();
					$(".book1-page").hide();//隐藏分页
					return;
				}
				for(var i =0;i<data.length;i++){
					_this.model.lonAndLatList.push({lon:data[i].lon,lat:data[i].lat,name:data[i].name});//将经纬度和酒店名称加入集合
					var distanceInfo = "";//距离关键字提示
					if(data[i].distanceInfo&&data[i].distanceInfo.distance!=0){
						distanceInfo = "距离"+data[i].distanceInfo.keyword+data[i].distanceInfo.distance+"公里";
					}
					var est2List = [];//设施ID集合
					if(data[i].est2List){
						for(var a = 0;a<data[i].est2List.length;a++){
							est2List.push(data[i].est2List[a].id);
							// console.log(est2List);
						}
					}
					//<p>'+data[i].name+'<span style="padding-left:20px;font-size:14px;color:orange;">'+xinjiName[data[i].classId]+'</span></p>\
//					var xinjiName = {"27":"二星级","26":"三星级","24":"四星级","23":"五星级","28":"豪华型","30":"高档型","31":"舒适型","32":"经济型","15":"酒店式公寓"};
					var xinjiName = {"27":"hotel-list-info-xinixin2","26":"hotel-list-info-xinixin3","24":"hotel-list-info-xinixin4","23":"hotel-list-info-xinixin5","28":"hotel-list-info-zuan5","30":"hotel-list-info-zuan4","31":"hotel-list-info-zuan3","32":"hotel-list-info-zuan2"};
					if(data[i].name.length>16){
						data[i].name = data[i].name.substring(0,16) + "..."
					}
					var Html = '<div class="hotel-li" data-eq="'+i+'">\
       	  				<div class="hotel-list-img"><img src="'+data[i].imgAbs+'" width="100%" ></div>\
            			<div class="hotel-list-index">'+(i+1)+'</div>\
       		  			<div class="hotel-list-info">\
            				<p>'+data[i].name+'<span class="'+xinjiName[data[i].classId]+'"></span></p>\
                			<div class="hotel-list-address"><span>'+data[i].city+'</span><span>'+data[i].section+'</span>'+data[i].address+'<br>'+distanceInfo+'</div>\
                			<div class="hotel-list-icon">';
                	//接送机服务			
                	if(est2List.indexOf(37)!=-1||est2List.indexOf(1130)!=-1||est2List.indexOf(1106)!=-1){
                		Html+='<img src="//file.40017.cn/assets/tmc/images/hotel-jiesong.png" width="24px" title="机场接送">';
                	}
                	//wifi
                	if(est2List.indexOf(154)!=-1){
                		Html+='<img src="//file.40017.cn/assets/tmc/images/hotel-wifi.png" width="24px" title="无线网">';
                	}
                	//健身房
                	if(est2List.indexOf(158)!=-1){
                		Html+='<img src="//file.40017.cn/assets/tmc/images/hotel-js.png" width="24px" title="健身房">';
                	}
                	//会议室
                	if(est2List.indexOf(449)!=-1){
                		Html+='<img src="//file.40017.cn/assets/tmc/images/hotel-Meeting.png" width="24px" title="会议室">';
                	}         	
                 	//泳池
                	if(est2List.indexOf(80)!=-1||est2List.indexOf(79)!=-1||est2List.indexOf(333)!=-1){
                		Html+='<img src="//file.40017.cn/assets/tmc/images/hotel-swim.png" width="24px" title="泳池">';
                	}
                  	//停车场
                	if(est2List.indexOf(205)!=-1||est2List.indexOf(206)!=-1||est2List.indexOf(1115)!=-1){
                		Html+='<img src="//file.40017.cn/assets/tmc/images/hotel-p.png" width="24px" title="停车场">';
                	}
                	//<a class="list-btn" data="'+data[i].id+'" data-eq="'+i+'">查看详情</a>\
                	Html+='</div></div><div class="hotel-list-right">\
						<p><span>￥<span>'+data[i].lowestPrice+'</span></span>起</p>\
						<a class="list-btn" data="'+data[i].id+'" data-eq="'+i+'" data-xinji="'+xinjiName[data[i].classId]+'">查看详情</a>\
						</div></div>'                	                    
   					$(".hotel-list-left").append(Html);        
				}
				_this.pageFunc(Math.ceil(json.obj.totalCount/20),pageNum);//渲染分页
				_this.baiduMapAPI();//调用百度地图		


				   
			},
			error:function(){
				console.log("获取酒店列表失败");	
			}	
		})
	},
	//目的地搜索
	hotelCityFunc : function(){
		var _this = this;
		$("body").append('<div id="hotel-getcity"><span class="getCity-arrows"></span><p>输入中文/拼音/或↑↓键选择<span></span></p></div>');
		var $div = $("#input-city");
		// console.log($div);
//		var wz = $div.offset();
		// console.log(wz);
//		var _height = $div.height()-30;
//		$("#hotel-getcity").css({"top":(wz.top+_height)+"px","left":wz.left+"px"});
		var top = parseInt($('.hotel-search').css('margin-top')) * 2 + parseInt($('.input_type1').css('height'));
		var left = $(".hotel-search-p1").offset().left;
		$("#hotel-getcity").css({"top":top+"px","left":left+"px"});
		$div.on("input",function(event){
			$.ajax({
				type:"POST",
				url:__ctx+"/common/getDestinations",
				data:JSON.stringify({keys:$div.val()}),
				contentType: "application/json; charset=utf-8",
				dataType:"json",
				async:true,
				success:function(json){
					if(!json.result){
						return
					};
					$("#hotel-getcity>ul").remove();
					if(json.obj.destDetailInfoDTOs.length){
						var data = json.obj.destDetailInfoDTOs;
					// console.log(data);
					for(var i = 0;i<data.length;i++){
						$("#hotel-getcity").append("<ul></ul>");
						if(data[i].type==0){ //市
							for(var a = 0;a<data[i].destBaseInfoDTOs.length;a++){
								$("#hotel-getcity>ul").eq(i).append("<li data-type='0' data-cityname='"+data[i].destBaseInfoDTOs[a].cityName+"' data-cityid='"+data[i].destBaseInfoDTOs[a].cityId+"' data-checkcityid='"+data[i].destBaseInfoDTOs[a].cityId+"'>"+data[i].destBaseInfoDTOs[a].outName+"<p></p></li>");
							}
							$("#hotel-getcity>ul").eq(i).children("li").eq(0).children("p").text("城市");
						}
						else if(data[i].type==1){ //行政区
							for(var a = 0;a<data[i].destBaseInfoDTOs.length;a++){
								$("#hotel-getcity>ul").eq(i).append("<li data-type='1' data-keyname='"+data[i].destBaseInfoDTOs[a].regionName+"' data-cityname='"+data[i].destBaseInfoDTOs[a].cityName+"' data-cityid='"+data[i].destBaseInfoDTOs[a].cityId+"' data-checkcityid='"+data[i].destBaseInfoDTOs[a].regionId+"' data-regiontype='"+data[i].destBaseInfoDTOs[a].isMunicipality+"'>"+data[i].destBaseInfoDTOs[a].outName+"<p></p></li>");
							}
							$("#hotel-getcity>ul").eq(i).children("li").eq(0).children("p").text("行政区");
						}
						else if(data[i].type==4){ //商圈
							for(var a = 0;a<data[i].destBaseInfoDTOs.length;a++){
								$("#hotel-getcity>ul").eq(i).append("<li data-type='4' data-keyname='"+data[i].destBaseInfoDTOs[a].businessName+"' data-cityname='"+data[i].destBaseInfoDTOs[a].cityName+"' data-cityid='"+data[i].destBaseInfoDTOs[a].cityId+"' data-regionid='"+data[i].destBaseInfoDTOs[a].regionId+"' data-checkcityid='"+data[i].destBaseInfoDTOs[a].businessId+"'>"+data[i].destBaseInfoDTOs[a].outName+"<p></p></li>");
							}
							$("#hotel-getcity>ul").eq(i).children("li").eq(0).children("p").text("商圈");
						}						
					}
					$("#hotel-getcity").show();
					}
				},
				error:function(){
					console.log("酒店搜索失败")
				}
			})
			event.stopPropagation();
		});
		
		$("#hotel-getcity").on("mouseover","li",function(){
			$("#hotel-getcity>ul>li").removeClass("keydown");
			$(this).addClass("keydown");
		});
		//关闭弹窗
		$("#hotel-getcity>p>span").click(function(){
			$("#hotel-getcity>ul").remove();
			$("#input-city").val($("#input-city").attr("data-value"));
			$("#hotel-getcity").hide();
		});
		$("body").click(function(){
			if($("#hotel-getcity").is(':visible')){
				$("#hotel-getcity>p>span").click();
			}
		})	
		//选择目的地
		$("#hotel-getcity").on("click","li",function(){
			$("#hotel-getcity>p>span").click();
			var $this = $(this);
			var divKey = $("#input-key");
			var type = $this.attr("data-type");
			var checkCityId = $this.attr("data-checkcityid");
			_this.model.checkKeyInfo.checkCityId = checkCityId;
			_this.model.checkKeyInfo.type = type;
			$div.val($this.attr("data-cityname")).attr("data-value",$this.attr("data-cityname"));	
			//当目的地更改时，刷新初始化关键字和筛选条件
			_this.model.keyword = "";
			_this.model.sectionId = "";
			_this.reductionSec();
			_this.model.cityId = $this.attr("data-cityid");	
			if(type==0){//选择的是城市	
				divKey.val("");
				_this.model.cityType = 0;			
			}else if(type==1){//选择的是行政区和县级市
				divKey.val("");
				_this.model.cityType = 1;				
				_this.model.sectionId = checkCityId;
			}else if(type==4){//选择的是商圈
				var regionid = $this.attr("data-regionid");
				divKey.val($this.attr("data-keyname"));
				_this.model.bdId = checkCityId;
				//自动选择商圈
				$(".select-sq>p").text($this.attr("data-keyname"));
				$("#unlimited-1").removeClass("sec-a");	
				if(regionid==0){//目的地为市，区
					_this.model.cityType = 0;
					_this.model.checkKeyInfo.checkCityId = _this.model.cityId;
					_this.model.checkKeyInfo.type = 0;
				}else{//目的地为县级市
					_this.model.cityType = 1;
					_this.model.sectionId = regionid;					
				}
			};//判断传值？
			_this.hotelListDate(1,1);	
		});
		//支持键盘操作
		$(window).on("keydown",function(event){
			var div = $("#hotel-getcity>ul>li");
			var Num = div.length;
			if(Num===0){return;};
			var Index = $(".keydown").index("#hotel-getcity>ul>li");	
			if(event.keyCode===38){
				if(Index>0){
					$(".keydown").removeClass("keydown");
					div.eq(Index-1).addClass("keydown");
				}
			}
			if(event.keyCode===40){
				if(Index<Num-1){
					$(".keydown").removeClass("keydown");
					div.eq(Index+1).addClass("keydown");
				}
			}
			if(event.keyCode===13){
				$(".keydown").click();
			}
		});
		$("#hotel-getcity").click(function(event){
			event.stopPropagation();
		});
	},
	//加入选择时间控件
	hotelTimeFunc : function(){
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
		$(".input_date").eq(0).val(computeEndDate(0))
		$(".input_date").eq(1).val(computeEndDate(1))
		_this.model.startDate = $(".input_date").eq(0).val();
		_this.model.endDate = $(".input_date").eq(1).val();
		$(".input_date").click(function(){
			var $this = $(this);
			var startDate = new Date(),endDate = computeEndDate(60);            
			var currentDate= [$(".input_date").eq(0).val()];
			if($this.index(".input_date")==1){
				startDate = computeEndDate(1,$(".input_date").eq(0).val());
				var endDate1 = computeEndDate(60);//从当天到60天后的日期
				var endDate2 = computeEndDate(20,$(".input_date").eq(0).val());//从入住日期到20天后的日期
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
           			if($this.index(".input_date")==1){
           				_this.model.endDate = chooseDate;
           				_this.hotelListDate(2,1);
           			}else{
           				_this.model.startDate = chooseDate;
           				//当选择的入住日期大于等于离店日期，需修改离店日期 || 当选择的入住日期和离店日期的间隔超过20天，需修改离店日期	
           				if(+(_this.model.startDate.replace(/\-/g,""))>=+(_this.model.endDate.replace(/\-/g,""))||+(computeEndDate(20,chooseDate).replace(/\-/g,""))<+(_this.model.endDate.replace(/\-/g,""))){
           					_this.model.endDate = computeEndDate(1,chooseDate);
           					$(".input_date").eq(1).val(computeEndDate(1,chooseDate));
           					$(".input_date").eq(1).click();
           				
           				}else{
           					//修改于2017-6-22 14:24:48 cw
           					$(".input_date").eq(1).val(computeEndDate(1,chooseDate));
           					$(".input_date").eq(1).click();
           					_this.hotelListDate(2,1);
           				}
           			}
           			
       			}
  			});	
		});
	},
	//关键字搜索
	hotelKeyFunc:function(){
		var _this = this;
		$("body").append('<div id="hotel-getkey"><span class="getCity-arrows"></span><p>输入中文/拼音/或↑↓键选择<span></span></p></div>');
        var $div = $("#input-key");
//		var wz = $div.offset();
//		var _height = $div.height()-30;
//		$("#hotel-getkey").css({"top":(wz.top+_height)+"px","left":wz.left+"px"});
        var top = parseInt($('.hotel-search').css('margin-top')) * 2 + parseInt($('.input_type1').css('height'));
		var left = $(".input_type2").offset().left;
		$("#hotel-getkey").css({"top":top+"px","left":left+"px"});
			$div.on("input",function(event){
			var requestData = {
				checkcityid:_this.model.checkKeyInfo.checkCityId,
				checkcitytype:_this.model.checkKeyInfo.type,
				comedate:_this.model.startDate,
				leavedate:_this.model.endDate,
				cityId:_this.model.cityId,
				keys:$div.val(),
			}
			$.ajax({
				type:"POST",
				url:__ctx+"/common/getKeywords",
				data:JSON.stringify(requestData),
				contentType: "application/json; charset=utf-8",
				dataType:"json",
				async:true,
				success:function(json){
					if(!json.result){return};
					$("#hotel-getkey>ul").remove();
					if(json.obj.keywordDetailDTOs){
						var data = json.obj.keywordDetailDTOs;
						for(var i = 0;i<data.length;i++){
							$("#hotel-getkey").append("<ul></ul>");
							for(var a = 0;a<data[i].keywordBaseDTOs.length;a++){
	                              
								$("#hotel-getkey>ul").eq(i).append("<li data-regionId='"+data[i].keywordBaseDTOs[a].regionId+"' data-name='"+data[i].keywordBaseDTOs[a].name+"' data-type='"+data[i].type+"' data-id='"+data[i].keywordBaseDTOs[a].id+"' data-idType='"+data[i].keywordBaseDTOs[a].idType+"'>"+data[i].keywordBaseDTOs[a].outName+"<p></p></li>");
							}
							$("#hotel-getkey>ul").eq(i).children("li").eq(0).children("p").text(["酒店品牌","酒店名称","","地区信息","坐标信息"][data[i].type]);
						}
						$("#hotel-getkey").show();	
					}
				},
				error:function(){
					console.log("关键字模糊搜索失败")
				}
			})
			event.stopPropagation();
		});
		$("#hotel-getkey").on("mouseover","li",function(){
			$("#hotel-getkey>ul>li").removeClass("getkeydown");
			$(this).addClass("getkeydown");
		});
		//关闭弹窗
		$("#hotel-getkey>p>span").click(function(){
			$("#hotel-getkey>ul").remove();
			$("#hotel-getkey").hide();
		});
		$("body").click(function(){
			if($("#hotel-getkey").is(':visible')){
				$("#hotel-getkey>p>span").click();
			}
		});
		// 支持键盘操作
		$(window).on("keydown",function(event){
			if(!$("#hotel-getkey").is(':visible')){
				return;
			}	
			var div = $("#hotel-getkey>ul>li");
			var Num = div.length;
			if(Num===0){return;};
			var Index = $(".getkeydown").index("#hotel-getkey>ul>li");	
			if(event.keyCode===38){
				if(Index>0){
					$(".getkeydown").removeClass("getkeydown");
					div.eq(Index-1).addClass("getkeydown");
				}
			}
			if(event.keyCode===40){
				if(Index<Num-1){
					$(".getkeydown").removeClass("getkeydown");
					div.eq(Index+1).addClass("getkeydown");
				}
			}
			if(event.keyCode===13){
				$(".getkeydown").click();
			}
		});
		$("#hotel-getkey").click(function(event){
			event.stopPropagation();
		});

		//选择关键字
		$("#hotel-getkey").on("click","li",function(){	
			$("#hotel-getkey>p>span").click();
			_this.model.keyword = "";
			var $this = $(this);
			var type = $this.attr("data-type");
			var id = $this.attr("data-id");
			var idtype = $this.attr("data-idtype");
			$div.val($this.attr("data-name"));
			if(type==0){//选择的是酒店品牌
				$("#hotel-brand>li>span").each(function(){	
					var brandId = $(this).attr("data");
					if(brandId==id&&!$(this).hasClass("checkbox_act")){
						$(this).click();
						return false;
					}
				})
			}else if(type==1||type==4){//选择的是酒店名称和坐标信息
				_this.model.keyword = $this.attr("data-name");
				_this.hotelListDate(2,1);
			}else if(type==3&&idtype==2){//选择的是商圈
				if(_this.model.bdId!=id){
					_this.model.bdId = id;
					$(".select-city>p").text("行政区");
					$(".select-sq>p").text($this.attr("data-name"));
					if(_this.model.cityType==0){
						_this.model.sectionId = "";
					}
					$("#unlimited-1").removeClass("sec-a");
					if($this.attr("data-regionid")!="0"){//当选择的是县级市的商圈，需额外传行政区ID,此行政区ID不做保存处理
						_this.hotelListDate(2,1,$this.attr("data-regionid"));
					}else{
						_this.hotelListDate(2,1);
					}					
				}
			}else if(type==3&&idtype==3){//选择的是行政区
				if(_this.model.sectionId!=id){
					_this.model.sectionId = id;
					$(".select-sq>p").text("商圈");
					$(".select-city>p").text($this.attr("data-name"));
					_this.model.bdId = "";
					$("#unlimited-1").removeClass("sec-a");
					_this.hotelListDate(2,1);
				}
			}				
		});
		$(".hotel_select-btn").click(function(){
			_this.model.keyword = $div.val();
			_this.hotelListDate(2,1);
		});	
	},
	//加载所有品牌、行政区、商圈
	hotelScreenList:function(data){		
		//行政区
		$(".select-city>ul").html("<span></span>");
		if(data.sctList){
			for(var i=0;i<data.sctList.length;i++){			
				$(".select-city>ul").append("<li data='"+data.sctList[i].id+"'>"+data.sctList[i].name+"</li>");
			}
		}
		//商圈
		$(".select-sq>ul").html("<span></span>");
		if(data.bdList){
	       for(var i=0;i<data.bdList.length;i++){			
		   $(".select-sq>ul").append("<li data='"+data.bdList[i].id+"'>"+data.bdList[i].name+"</li>");
		   }		
		}
		//品牌
		$("#hotel-brand").html("");
		if(data.chainList){
				for(var i=0;i<data.chainList.length;i++){			
				$("#hotel-brand").append("<li><span class='TMC_checkbox'  data='"+data.chainList[i].id+"'></span>"+data.chainList[i].name+"</li>");
			}
			//如果品牌数量大于7个则隐藏多余品牌
			if(data.chainList.length>7){
				$("#hotel-brand>li").slice(0,7).show();
				$("#hotel-brand").append('<div class="checkbox-xj-more">更多</div>')
			}else{
				$("#hotel-brand>li").show();
			}
		}
	},

	//筛选区域相关事件
	hotelScreenClickFunc : function(){
		var _this = this;
		/*选择行政区和商圈相关*/
		$(".select-city>p,.select-city>span,.select-sq>p,.select-sq>span").click(function(event){
			if($(this).siblings("ul").children("li").length>0){
				$(this).siblings("ul").toggle();
			}
			event.stopPropagation();
		});
		$("body").click(function(){
			$(".hotel-select-ul").hide();
		});
		$(".hotel-select-ul").on("click","li",function(){
			var $this = $(this);
			$this.parent().siblings("p").text($this.text());
			var Index = $this.parent().index(".hotel-select-ul");
			if(Index===0){//选择行政区
				_this.model.sectionId = $this.attr("data");
				_this.model.bdId = "";
				$(".select-sq>p").text("商圈");
			}else if(Index===1){//选择商圈
				_this.model.bdId = $this.attr("data");
				$(".select-city>p").text("行政区");
				if(_this.model.cityType==0){
					_this.model.sectionId = "";
				}
			}
			$("#unlimited-1").removeClass("sec-a");
			_this.hotelListDate(2,1);
		});
		$("#unlimited-1").click(function(){
			$(this).addClass("sec-a");
			$(".select-city>p").text("行政区");
			$(".select-sq>p").text("商圈");
			if(_this.model.cityType==0){
				_this.model.sectionId = "";
			}
			_this.model.bdId = "";
			_this.hotelListDate(2,1);
		});
		/*选择价格区间*/
		$("#prize-sec>li>span").on("click",function(){
			$("#prize-sec>li>span").removeClass("radio_act");
			$(this).addClass("radio_act");
			$("#unlimited-2").removeClass("sec-a");
			$(".zdy-prize>input").val("");
			_this.model.lp = $(this).attr("data");
			_this.hotelListDate(2,1);
		});
		//自定义价格区间,备注只能输入数字
		$(".zdy-prize>input").keyup(function(){//兼容IE8
			$(this).val($(this).val().replace(/[^0-9-]+/,''));
		});
		$(".zdy-prize>a").click(function(){
			var minP = $(".zdy-prize>input").eq(0).val();
			var maxP = $(".zdy-prize>input").eq(1).val();
			if(minP||maxP){
				$("#prize-sec>li>span").removeClass("radio_act");
				_this.model.lp = "["+(minP||"*")+","+(maxP||"*")+"]";
				$("#unlimited-2").removeClass("sec-a");
				_this.hotelListDate(2,1);
			}
		});
		$("#unlimited-2").click(function(){
			$(this).addClass("sec-a");
			$("#prize-sec>li>span").removeClass("radio_act");
			$(".zdy-prize>input").val("");
			_this.model.lp = "";
			_this.hotelListDate(2,1);
		});
		/*选择星级*/
		$("#xinji-sec>li>span").on("click",function(){
			var $this = $(this);
			var xinjiId = $this.attr("data").split(",");
			if($this.hasClass("checkbox_act")){
				$this.removeClass("checkbox_act");
				for(var i=0;i<xinjiId.length;i++){
					_this.model.classId.splice(_this.model.classId.indexOf(+xinjiId[i]),1);
					// console.log(_this.model.classId.splice(_this.model.classId.indexOf(+xinjiId[i]),1))
				}
				if($("#xinji-sec>li>.checkbox_act").length===0){
					$("#unlimited-3").addClass("sec-a");
				}				
			}else{
				$this.addClass("checkbox_act");
				for(var i=0;i<xinjiId.length;i++){
					_this.model.classId.push(+xinjiId[i]);
				}
				$("#unlimited-3").removeClass("sec-a");
			}
			_this.hotelListDate(2,1);
		});
		$("#unlimited-3").click(function(){
			$(this).addClass("sec-a");
			$("#xinji-sec>li>span").removeClass("checkbox_act");
			_this.model.classId = [];
			_this.hotelListDate(2,1);
		});
		/*选择酒店品牌*/
		$("#hotel-brand").on("click","span",function(){
			var $this = $(this);
			var brandId = +$this.attr("data");
			if($this.hasClass("checkbox_act")){
				$this.removeClass("checkbox_act");
				_this.model.chainId.splice(_this.model.chainId.indexOf(brandId),1);
				if($("#hotel-brand>li>.checkbox_act").length===0){
					$("#unlimited-4").addClass("sec-a");
				}				
			}else{
				$this.addClass("checkbox_act");
				_this.model.chainId.push(brandId);
				$("#unlimited-4").removeClass("sec-a");
			}
			_this.hotelListDate(2,1);
		});
		$("#unlimited-4").click(function(){
			$(this).addClass("sec-a");
			$("#hotel-brand>li>span").removeClass("checkbox_act");
			_this.model.chainId = [];
			_this.hotelListDate(2,1);
		});
		//展开收起更多酒店
		$("#hotel-brand").on("click",".checkbox-xj-more",function(){
			if($(this).text()=="更多"){
				$("#hotel-brand>li").show();
				$(this).text("收起");
			}else{
				$("#hotel-brand>li").slice(7).hide();
				$(this).text("更多");
			}
		});
		/*选择设施*/
		$("#hotel-facilities>li>span").on("click",function(){
			var $this = $(this);
			var facilitiesId = $this.attr("data").split(",");
			if($this.hasClass("checkbox_act")){
				$this.removeClass("checkbox_act");
				for(var i=0;i<facilitiesId.length;i++){
					_this.model.estId.splice(_this.model.estId.indexOf(+facilitiesId[i]),1);
				}
				if($("#hotel-facilities>li>.checkbox_act").length===0){
					$("#unlimited-5").addClass("sec-a");
				}				
			}else{
				$this.addClass("checkbox_act");
				for(var i=0;i<facilitiesId.length;i++){
					_this.model.estId.push(+facilitiesId[i]);
				}
				$("#unlimited-5").removeClass("sec-a");
			}
			_this.hotelListDate(2,1);
		});
		$("#unlimited-5").click(function(){
			$(this).addClass("sec-a");
			$("#hotel-facilities>li>span").removeClass("checkbox_act");
			_this.model.estId = [];
			_this.hotelListDate(2,1);
		});		
	},
	//还原筛选条件
	reductionSec : function(){
		//地区
		$(".hotel-select-1>a").addClass("sec-a");
		$(".select-city>p").text("行政区");
		$(".select-sq>p").text("商圈");
		if(this.model.cityType==0){
			this.model.sectionId = "";
		}
		this.model.bdId = "";
		//价格区间
		$("#prize-sec>li>span").removeClass("radio_act");
		$(".zdy-prize>input").val("");
		this.model.lp = "";
		//星级
		$("#xinji-sec>li>span").removeClass("checkbox_act");
		this.model.classId = [];
		//酒店品牌
		$("#hotel-brand>li>span").removeClass("checkbox_act");
		this.model.chainId = [];
		//设施
		$("#hotel-facilities>li>span").removeClass("checkbox_act");
		this.model.estId = [];
	},	
	//调用百度地图API
	baiduMapAPI : function(){
  		var map = this.model.map; 
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
 		var Zindex =20;
 		//循环调用绘制DIV
 		for(var i = 0;i<book1.model.lonAndLatList.length;i++){
 			var BMapPoint = new BMap.Point(book1.model.lonAndLatList[i].lon, book1.model.lonAndLatList[i].lat);
 			if(i<5){
 				pointList.push(BMapPoint);
 			}
 			var mySquare = new SquareOverlay(BMapPoint,i+1,book1.model.lonAndLatList[i].name);  
 			map.addOverlay(mySquare);
 			$(".baidu-marker").eq(i).css("z-index",Zindex);
 			Zindex--;
 		}
		//将前5个坐标将在同时显示在一个面上
		//map.setZoom(15);
  		map.setViewport(pointList);
  		map.setZoom(16);
	},
	//页面与地图交互效果
	baiduMapFunc : function(){
		var _this = this;
		$("body").on("mouseover",".baidu-marker",function(){
			$(this).addClass("baidu-marker-hover");
		});
		$("body").on("mouseleave",".baidu-marker,.hotel-li",function(){
			$(".baidu-marker").removeClass("baidu-marker-hover");
		});
		$(".hotel-list-left").on("mouseover",".hotel-li",function(){
			var eq = +$(this).attr("data-eq");
			var map = _this.model.map;
			var BMapPoint = new BMap.Point(book1.model.lonAndLatList[eq].lon, book1.model.lonAndLatList[eq].lat);
			map.panTo(BMapPoint);
			var div = $(".baidu-marker").eq(eq);
			div.addClass("baidu-marker-hover");
    		div.animate({top:"-=4"},300);
    		div.animate({top:"+=4"},300);
    		div.animate({top:"-=4"},300);
    		div.animate({top:"+=4"},300);
		});
		//悬浮地图
		$(window).scroll(function(){
			var top = $(".hotel-list").offset().top;
			if($(this).scrollTop()>=top){
				$(".hotel-map").css("position","fixed").addClass("FixLeft").removeClass("AbsoluteLeft");
			}else{
				$(".hotel-map").css("position","absolute").addClass("AbsoluteLeft").removeClass("FixLeft");
			}
		});
		//关闭打开地图
//		$(".map-close").click(function(){
//			$("#baidu-map").slideUp(500);
//		});	
//		$(".map-open").click(function(){
//			$("#baidu-map").slideDown(500);
//		});		
		//修改于 2017-5-23 14:32:21 cw
		$(".map-close").click(function(){
			if($("#baidu-map").is(":visible")){
				$("#baidu-map").slideUp(500);
				$(this).html('展开 <img src="http://file.40017.cn/assets/tmc/images/point.png" >');
			}else{
				$("#baidu-map").slideDown(500);
				$(this).html('收起 <img src="http://file.40017.cn/assets/tmc/images/point.png" >');
			}
			
		});	
	},
	//分页：页面中永远只有7个格子，且第一个和最后一个直接出现，不参与判断
	pageFunc : function(Num,page){
		$(".book1-page>ul").html("");
		if(Num<=1){
			$(".book1-page").hide();
			return;
		}else{
			$(".book1-page").show();
		}
		$(".book1-page>div").eq(2).text(Num);//最后一页
		$(".book1-page>p").hide();		
		if(Num<=7){//如果分页数量小于等于7，直接打印格子
			for(var i = 2;i<Num;i++){
				$(".book1-page>ul").append("<li class='page-at'>"+i+"</li>");				
			}
		}else{//分页数量大于7，则多出来的格子需要隐藏处理
			if(page<5){//当前分页如果小于5，则只需要加载123456和最后一个
				for(var i = 2;i<7;i++){
					$(".book1-page>ul").append("<li class='page-at'>"+i+"</li>");				
				}
				$(".book1-page>p").eq(0).hide();
				$(".book1-page>p").eq(1).show();
			}else if(page>(Num-4)){//当前分页如果在最后5个里面，则只需要加载1和最后6个
				for(var i = 5;i>0;i--){
					$(".book1-page>ul").append("<li class='page-at'>"+(Num-i)+"</li>");				
				}
				$(".book1-page>p").eq(1).hide();
				$(".book1-page>p").eq(0).show();
			}else{//上面2种情况外，需要加载第1个和最后1个和分页为中心的前后2个共7个
				for(var i = 0;i<5;i++){
					$(".book1-page>ul").append("<li class='page-at'>"+(page-2+i)+"</li>");				
				}
				$(".book1-page>p").show();
			}
		}
		$(".page-at").removeClass("page-down");
		$(".page-at").each(function(){//匹配选中项
			if($(this).text()==page){
				$(this).addClass("page-down");
				return false;
			}
		});
		$(".book1-page").show();
	},
	//页面点击事件集合
	book1ClickFunc : function(){
		var _this = this;
		//选择分页
		$(".book1-page").on("click",".page-at",function(){
			if(!$(this).hasClass("page-down")){
				_this.hotelListDate(2,$(this).text());
			}
		});
		$(".page-perv").click(function(){
			var d = +$(".page-down").text();
			if(d>1){
				_this.hotelListDate(2,d-1);
			}			
		});
		$(".page-next").click(function(){
			var d = +$(".page-down").text();
			if($(".page-down").index(".page-at")!=6){
				_this.hotelListDate(2,d+1);
			}			
		});
		//跳转酒店详情
		$(".hotel-list-left").on("click",".list-btn",function(){
			    var data = JSON.stringify(_this.model.bookPersonAndPassengers);
		        var resourceId = JSON.stringify($(this).attr("data"));
		        var startDate = _this.model.startDate;
		        var endDate = _this.model.endDate;
		        var star = $(this).attr("data-xinji");
		        $("#bookdate").val(data);
	            $("#resourceId").val(JSON.parse(resourceId));               
	            $("#startDate").val(JSON.stringify(startDate));
	            $("#endDate").val(JSON.stringify(endDate));
	            $("#star").val(JSON.stringify(star));
				document.form1.action= __ctx+"/hotel/queryDetail";
				$("#formid").submit();		
		});
	},
}
window.book1 = book1;
book1.init();
$(window).resize(function () {          //当浏览器大小变化时
	//城市下拉列表高度适应
	var top = parseInt($('.hotel-search').css('margin-top')) * 2 + parseInt($('.input_type1').css('height'));
	var left = $(".hotel-search-p1").offset().left;
	$("#hotel-getcity").css({"top":top+"px","left":left+"px"});
	//商圈/街道/关键字 下拉列表高度适应
	var top = parseInt($('.hotel-search').css('margin-top')) * 2 + parseInt($('.input_type1').css('height'));
	var left = $(".input_type2").offset().left;
	$("#hotel-getkey").css({"top":top+"px","left":left+"px"});
});
