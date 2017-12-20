var vm_list;
$(document).ready(function(){

	Vue.filter('orderStatusFilter', {
        read: function (value, format) {
			 if (value == 0) {
                return '待提交';
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
                return '待提交';
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
                return '审批不通过';
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
	
		Vue.filter('supplierTypeFilter', {
        read: function (value, format) {
			if (value == 1) {
                return '手工单';
            }
            if (value == 2) {
                return '同程酒店';
            }
            if (value == 3) {
                return '协议酒店';
            }
            if (value == 4) {
                return '外采酒店';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
		
		Vue.filter('isPushOrderFilter', {
	        read: function (value, format) {
				if (value == 0) {
	                return '否';
	            }
	            if (value == 1) {
	                return '是';
	            }
	        },
	        write: function (value, format) {
	            return value;
	        }
	    });
	
	
$('#gmtCreateTimeBegin,#gmtCreateTimeEnd,#gmtOccupancyTimeBegin,#gmtOccupancyTimeEnd,#gmtPayTimeBegin,#gmtPayTimeEnd').datetimepicker({
      minView: "month", // 选择日期后，不会再跳转去选择时分秒
      format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
      language: 'zh-CN', // 汉化
      autoclose: true // 选择日期后自动关闭
  });

  /*	
	*省变化时刷新城市列表
	*/
	$('#provinceId').change(function(){ 
		var p1=$('#provinceId').val();
		if(p1>0) {
			vm_list.getCitys(p1);
		}
	});
	
	$('#cityId').change(function(){
		var id = $('#cityId option:selected').val();
		var name = $('#cityId option:selected').text();
	});
	
    vm_list=new Vue({
        el:"#domesticHotelList",
        data:{
            infos:{},
            params:{
				orderNo:"",
				outerOrderNo:"",
				orderChannel:"",
				gmtCreateTimeBegin:"",
				gmtCreateTimeEnd:"",
				gmtOccupancyTimeBegin:"",
				gmtOccupancyTimeEnd:"",
				gmtPayTimeBegin:"",
				gmtPayTimeEnd:"",
				provinceId:"",
				cityId:"",
				responsibleGroupId:"",
				approvalStatus:"",
				bookPersonName:"",
				passengerName:"",
				responsiblePersonName:"",
				payStatus:"",
				cellPhone:"",
				supplierType:"",
				orderStatus:"",
				hotelName:"",
				bookPersonType:"",
				productCode:"",
				hotelType:"",
				companyId:""
			},
			pars:{
				tcGroupList:[]
			},
			citys:[],
			dto:{
				orderNo:"DH1611218800010002"
			},
			companys:[]
//			,
//			gmtCreateTimeEnd:""
        },
        ready:function(){
            //页面初始化载入首页数据.
            //this.loadGridData();
        	$("#supplierType").find("option[value = "+window.supplierTypeCode+"]").attr("selected","true");
        	this.params.supplierType = window.supplierTypeCode;
        	//加载公司数据
        	var loadCompanysData = function () {
                $.ajax({
                    url: __ctx + "/resource/companys",
                    //data: parms,
                    type: "POST",
                    datatype: "json",
                    error: function (data1) {
                        toastr.error("请先选择公司！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success: function (data) {
                    	vm_list.companys = data;
                    }
                });
            };
            loadCompanysData();
        },
        methods:{
			//根据省获取城市
			getCitys:function(proId){
				$.ajax({
                    type:"POST",
                    url:__ctx + "/hotelorder/getCitys/"+proId,
                    success:function(result){
                        if (result.result){
                            vm_list.citys = result.obj;
							//var tt1 = result.obj;
							//var id = tt1[0].id;
							//var name = tt1[0].name;
							//alert(id + "---" + name);
                        }else{
                            toastr.error(result.message, "加载失败", {
                                timeOut : 2000,
                                positionClass : "toast-top-center"
                            });
                        }
                    },
                    error:function (result) {
                        toastr.error(result.message, "加载失败", {
                            timeOut : 2000,
                            positionClass : "toast-top-center"
                        });
                    }
                })
				
			},
			
        	// 加载list页面数据			
            loadGridData:function(dto){
				//alert("订单号："+dto.orderNo);
				//alert("服务小组："+dto.responsibleGroupId);
				/*alert("订单号："+hotelDTO.orderNo);
				alert("外部订单号："+hotelDTO.outerOrderNo);
				alert("分销渠道："+hotelDTO.orderChannel);
				alert("创建日期--开始："+hotelDTO.gmtCreateTimeBegin);
				alert("创建日期--截止："+hotelDTO.gmtCreateTimeEnd);
				alert("入住日期--开始："+hotelDTO.gmtOccupancyTimeBegin);
				alert("入住日期--截止："+hotelDTO.gmtOccupancyTimeEnd);
				alert("支付日期--开始："+hotelDTO.gmtPayTimeBegin);
				alert("支付日期--截止："+hotelDTO.gmtPayTimeEnd);*/
				/*alert("目的省"+hotelDTO.provinceId);
				alert("目的城市"+hotelDTO.cityId);
				alert("服务小组："+hotelDTO.responsibleGroupId);
				alert("审批状态："+hotelDTO.approvalStatus);
				alert("预订人类型(0预计人/1出行人)："+hotelDTO.bookPersonType);
				if(hotelDTO.bookPersonType=="0"){
					hotelDTO.passengerName = "";
				}else{
					hotelDTO.passengerName = hotelDTO.bookPersonName;
					hotelDTO.bookPersonName = "";
				}
				alert("预订人："+hotelDTO.bookPersonName);
				alert("出行人："+hotelDTO.passengerName);
				alert("责任人："+hotelDTO.responsiblePersonName);
				alert("支付状态："+hotelDTO.payStatus);
				alert("手机号："+hotelDTO.cellPhone);
				alert("供应商分类："+hotelDTO.supplierType);
				alert("订单状态："+hotelDTO.orderStatus);
				alert("订单状态："+hotelDTO.hotelName);
				alert("订单类型："+hotelDTO.productCode);	*/	
				
                //省、城市、小组、责任人：对应的名称 
				
				/*
				if(hotelDTO.bookPersonType=="1"){
					hotelDTO.passengerName = hotelDTO.bookPersonName;
					hotelDTO.bookPersonName = "";
				}
				*/
                $.ajax({
                    type:'post',
                    url:__ctx + "/hotelorder/querypage",
					contentType:'application/json; charset=UTF-8',
					datatype:'json',
					data:JSON.stringify(dto),
					success:function(result){
                        if (result.result){
                            vm_list.infos = result.obj
                        }else{
                            toastr.error(result.message, "加载失败", {
                                timeOut : 2000,
                                positionClass : "toast-top-center"
                            });
                        }
                    },
                    error:function (result) {
                        toastr.error(result.message, "加载失败", {
                            timeOut : 2000,
                            positionClass : "toast-top-center"
                        });
                    }
                })
				
            },
            // 翻页功能
			queryData: function(event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }
				/*else {
                     this.params.page = 1;
                     this.params.size = 20;
                 }*/
                this.loadGridData(this.params);
            },
            init:function(){
            	 var ss = window.supplierTypeCode;
        	  $.ajax({
                  url: __ctx + "/serachitinerary/index/init",
                  data: null,
                  success:function(data){
                	  if(data.result){
                		  var rtnObj=data.obj;
                    	  if(rtnObj!=null){
                    		  vm_list.$watch(function(){
                    			  //this.params.responsiblePepoleName = rtnObj.responsiblePepoleName;
                    			  //this.params.tcGroupList = rtnObj.tcGroup;
								  this.pars.tcGroupList = rtnObj.tcGroup;
                    		  });
                    	  }
                	  }else{
                		//提示信息
							toastr.error(data.message, "", {
								timeOut : 2000,
								positionClass : "toast-top-center"
							});
                	  }
                  }
              });
			},
		
			//跳转酒店详情页面
			showDetail:function(orderNo){
	            var url =__ctx+"/hotelorder/orderDetail?orderNo="+orderNo;
	            window.open(url);
            } 
//			,
//            changeCreateTimeEnd:function(){
//            	alert(vm_list.params.gmtCreateTimeEnd);
//
//                alert(gmtCreateTimeEnd);
//                vm_list.params.gmtCreateTimeEnd = gmtCreateTimeEnd + " 23:59:59";
//            }
        }
//        ,
//        watch:{
//        	'gmtCreateTimeEnd':'changeCreateTimeEnd'
//        }
    });
    vm_list.init();
})