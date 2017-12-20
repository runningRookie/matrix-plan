var vm_refundTicketList;
$(document).ready(function(){
     $('#date-end,#date-start').datetimepicker({
      minView: "month", // 选择日期后，不会再跳转去选择时分秒
        　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        　　language: 'zh-CN', // 汉化
        　　autoclose:true // 选择日期后自动关闭
        });
	  vm_refundTicketList=new Vue({
	    el:"#searchRefundTicketPageList",
	    data:{
	      infos:[],
	      params:{},
          companys:[]
	    },
	    ready:function(){
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
                        vm_refundTicketList.companys = data;
                    }
                });
            };
            loadCompanysData();
	    },
	    methods:{
	      queryData: function(event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }
                 else {
                     this.params.page = 1;
                     this.params.size = 20;
                 }
                this.loadGridData(this.params);
            },
            loadGridData: function(pars) {
            	$("#showDate").parent().removeClass("checked");
            	$("#showDate").attr("checked", false);
                $.ajax({
                    url: __ctx + "/refundTicket/getRefundTicketList",
                    data: pars,
                    success:function(data){
                        vm_refundTicketList.infos = data;
                    }
                });
            },
            init:function(){
            	  $.ajax({
                      url: __ctx + "/refundTicket/index/init",
                      data: null,
                      success:function(data){
                    	  var rtnObj=data.obj;
                    	  if(rtnObj!=null){
                    		  vm_refundTicketList.$watch(function(){
                    			  this.params.refundTypeList = rtnObj.refundTypeList;
                    		  });
                    	  }
                      }
                  });
            },
            show:function(event, pageInfo){
				if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }
                else {
                     this.params.page = 1;
                     this.params.size = 20;
                }
				//标记当天颜色
				var $a = $("#RefundTicket").find("tbody tr");
				if($("#showDate").prop("checked")){
					//如果选中排序
					$.ajax({
	                    url: __ctx + "/refundTicket/show",
	                    data: this.params,
	                    success:function(data){
	                        vm_refundTicketList.infos = data;
	                    }
	                });
				}else{
					this.loadGridData(this.params);
				}
			},
            unlock:function(applyNo){
            	$.ajax({
                    url: __ctx + "/refundTicket/unlock?applyNo="+applyNo,
                    data: null,
                    success:function(data){
                    	if(data.result){
                    		toastr.info(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    		 // 重新请求数据
                    		vm_refundTicketList.loadGridData(vm_refundTicketList.params);
                    	}else{
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            },
            lock:function(applyNo){
            	$.ajax({
                    url: __ctx + "/refundTicket/lock?applyNo="+applyNo,
                    data: null,
                    success:function(data){
                    	if(data.result){
                    		// 退票详情页
                    		window.location.href=__ctx+"/refundTicket/detail/index?applyNo="+applyNo;
                    	}else{
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            }
	    }
	  });
	  
	  function formatDate(date){
			Y = date.getFullYear() + '-';
			M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
	        D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate());
			return Y+M+D; 
	  }
});