var vm_list;
$(document).ready(function(){
	$('#drawering').tab('show'); // 选择第一个标签
	
	//跳转第一个tab页
	if(returnFlag!=null||returnFlag!=undefined||returnFlag==''||returnFlag=='1'){
		$('#drawering').tab('show');
	}
	//跳转第二个tab页
	if(returnFlag!=null&&returnFlag!=undefined&&returnFlag=='2'){
		$('#refundcompletion').tab('show');
		vm_refundTicketList.init();
	    // 重新请求数据
	    vm_refundTicketList.loadGridData(vm_refundTicketList.params);
	}
	//跳转第三个tab页
	if(returnFlag!=null&&returnFlag!=undefined&&returnFlag=='3'){
		$('#autoticket').tab('show');
	    // 重新请求数据
		vm_auto_list.loadGridData(vm_auto_list.params);
	}
	//跳转第四个tab页
	if(returnFlag!=null&&returnFlag!=undefined&&returnFlag=='4'){
		$('#changeticket').tab('show');
		// 重新请求数据
		vm_changeTicketList.loadGridData(vm_changeTicketList.params);
	}
	//跳转第5个tab页
	/*if(returnFlag!=null&&returnFlag!=undefined&&returnFlag=='5'){
		$('#workorder').tab('show');
	    // 重新请求数据
		vm_workOrderList.loadGridData(vm_workOrderList.params);
	}*/
	
	$('#refundcompletion').click(function (e) {
		vm_refundTicketList.init();
	    // 重新请求数据
	    vm_refundTicketList.loadGridData(vm_refundTicketList.params);
	})
	$('#autoticket').click(function (e) {
	    // 重新请求数据
		vm_auto_list.loadGridData(vm_auto_list.params);
	})
	$('#changeticket').click(function (e) {
		// 重新请求数据
		vm_changeTicketList.loadGridData(vm_changeTicketList.params);
	})
	/*$('#workorder').click(function (e) {
	    // 重新请求数据
		vm_workOrderList.loadGridData(vm_workOrderList.params);
	})*/
		  
     $('#date-end,#date-start').datetimepicker({
      minView: "month", // 选择日期后，不会再跳转去选择时分秒
        　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        　　language: 'zh-CN', // 汉化
        　　autoclose:true // 选择日期后自动关闭
        });
  vm_list=new Vue({
    el:"#searchIssueTicketPageList",
    data:{
      infos:[],
      logInfo:[],
      params:{
    	  drawering:"",
    	  refundcompletion:"",
    	  changecompletion:"",
    	  autoticket:"",
    	  //workorder:"",
    	  orderModeList:[]
      }
    },
    methods:{
      queryData: function(event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }else {
                     this.params.page = 1;
                     this.params.size = 20;
                 }
                this.loadGridData(this.params);
            },
            reset: function () {
                this.params = {};
            },
            loadGridData: function(pars) {
            	if(pars.orderMode==null || pars.orderMode==undefined){
            		pars.orderMode=1;
            	}
                $.ajax({
                    url: __ctx + "/issueTicket/getOrderList",
                    data: pars,
                    success:function(data){
                        vm_list.infos = data;
                    }
                });
            },
            init:function(){
            	  $.ajax({
                      url: __ctx + "/issueTicket/index/init",
                      data: null,
                      success:function(data){
                    	  if(data.result){
                    		  var rtnObj=data.obj;
                        	  if(rtnObj!=null){
                        		  vm_list.$watch(function(){
                        			  this.params.orderModeList = rtnObj.orderModeList;
                        			  this.params.drawering=rtnObj.drawering;
                        			  this.params.refundcompletion=rtnObj.refundcompletion;
                        			  this.params.changecompletion=rtnObj.changecompletion;
                        			  this.params.autoticket=rtnObj.autoticket;
                        			  //this.params.workorder=rtnObj.workorder;
                        		  });
                        	  }
                    	  }else{
                    		  toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	  }
                      }
                  });
            },
            unlock:function(orderNo){
            	$.ajax({
                    url: __ctx + "/issueTicket/unlock?orderNo="+orderNo,
                    data: null,
                    success:function(data){
                    	if(data.result){
                    		toastr.info(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    		 // 重新请求数据
                    		vm_list.loadGridData(vm_list.params);
                    	}else{
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            },
            lock:function(orderNo){
            	$.ajax({
                    url: __ctx + "/issueTicket/lock?orderNo="+orderNo,
                    data: null,
                    success:function(data){
                    	if(data.result){
                    		// 进入出票详情页
                    		window.location.href=__ctx+"/issueTicket/detail/index?orderNo="+orderNo;
                    	}else{
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            },
            look:function(orderNo){
            	$.ajax({
                    url: __ctx + "/issueTicket/look?orderNo="+orderNo,
                    data: null,
                    success:function(data){
                    	if(data.result){
                    		vm_list.logInfo=[];
                        	$('#logModal').modal({ backdrop: 'static'});
                    		$("#logModal").modal('show')
                    		// 数据填充
                    		vm_list.logInfo=data.obj;
                    	}else{
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            }
    }
  });
  vm_list.init();
  // 重新请求数据
	vm_list.loadGridData(vm_list.params);
});