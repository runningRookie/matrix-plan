var vm_changeTicketList;
$(document).ready(function(){
     $('#date-end,#date-start').datetimepicker({
      minView: "month", // 选择日期后，不会再跳转去选择时分秒
        　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        　　language: 'zh-CN', // 汉化
        　　autoclose:true // 选择日期后自动关闭
        });
	  vm_changeTicketList=new Vue({
	    el:"#queryChangeTicketPageList",
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
                        vm_changeTicketList.companys = data;
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
                    url: __ctx + "/changeTicket/queryChangeTicketList",
                    data: pars,
                    success:function(data){
                        vm_changeTicketList.infos = data;
                    }
                });
            },
            unlock:function(applyNo){
            	$.ajax({
                    url: __ctx + "/changeTicket/unlock?applyNo="+applyNo,
                    data: null,
                    success:function(data){
                    	if(data.result){
                    		toastr.info(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    		 // 重新请求数据
                    		vm_changeTicketList.loadGridData(vm_changeTicketList.params);
                    	}else{
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            },
            lock:function(applyNo, orderNo){
            	$.ajax({
                    url: __ctx + "/changeTicket/lock?applyNo="+applyNo+"&orderNo="+orderNo,
                    data: null,
                    success:function(data){
                    	if(data.result){
                    		// 退票详情页
                    		window.location.href=__ctx+"/changeTicket/detail/index?applyNo="+applyNo+"&orderNo="+orderNo;
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