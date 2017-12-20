var vm_list;
$(document).ready(function(){

	Vue.filter('orderStatusFilter', {
        read: function (value, format) {
			 if (value == 0) {
                return '待提交审批';
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
	//取当天日期
	Today=function(){
		var oDate = new Date(); 
		var year = oDate.getFullYear();   
		var month = oDate.getMonth()+1;   
		if(month<10){
			month = "0"+month;
		}
		var day = oDate.getDate(); 
		return year+"-"+month + "-" + day;
	}

	vm_list=new Vue({
        el:"#hotelOpOrderList",
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
				companyId: ""
			},
			pars:{
				tcGroupList:[]
			},
			citys:[],
			companys: []
        },
        ready:function(){
            // 页面初始化载入首页数据.
            //this.loadGridData();
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
                    url:__ctx + "/hotel/getCitys/"+proId,
                    success:function(result){
                        if (result.result){
                            vm_list.citys = result.obj;
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
				$.ajax({
                    type:'post',
                    url:__ctx + "/hotel/querypage",
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
                }else {
                     this.params.page = 1;
                     this.params.pageSize = 20;
                 }
                this.loadGridData(this.params);
            },
            init:function(){
        	  $.ajax({
                  url: __ctx + "/serachitinerary/index/init",
                  data: null,
                  success:function(data){
                	  if(data.result){
                		  var rtnObj=data.obj;
                    	  if(rtnObj!=null){
                    		  vm_list.$watch(function(){
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
				$("#hotelOrderNo").val(orderNo);
				document.form1.action= __ctx + "/hotel/hotelOpOrderDetail";
				$("#formid").submit();			
			},
			//清除数据
			clearData:function(){
				vm_list.params.orderNo="";
				vm_list.params.outerOrderNo="";
				vm_list.params.bookPersonName="";
				vm_list.params.cellPhone="";
				vm_list.params.hotelName="";
			}	
        }
    });
    vm_list.init();
})