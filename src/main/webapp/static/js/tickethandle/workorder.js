var vm_workOrderList;
$(document).ready(function(){
     $('#gmtCreateTimeBegin,#gmtCreateTimeEnd').datetimepicker({
    	   minView: "month", // 选择日期后，不会再跳转去选择时分秒
        　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        　language: 'zh-CN', // 汉化
        　autoclose:true // 选择日期后自动关闭
        });
     Vue.filter('workOrderTypeFilter', {
         read: function (value, format) {
             if (value == '1') {
                 return '退票';
             }
             if (value == '2') {
                 return '改签';
             }
         },
         write: function (value, format) {
             return value;
         }
     });
     Vue.filter('workOrderLockFilter', {
         read: function (value, format) {
             if (value == '1') {
                 return '锁定';
             }
             if (value == '2') {
                 return '解锁';
             }
         },
         write: function (value, format) {
             return value;
         }
     });
     Vue.filter('workOrderStatusFilter', {
         read: function (value, format) {
             if (value == '1') {
                 return '无人处理';
             }
             if (value == '2') {
                 return '锁定中';
             }
             if (value == '3') {
                 return '已处理';
             }
         },
         write: function (value, format) {
             return value;
         }
     });
     
	  vm_workOrderList=new Vue({
	    el:"#workOrderPageList",
	    data:{
	      infos:[],
	      params:{},
	      workOrderNo:"",
	      operatorType:"",
	      lockInfos:[]
	    },
	    ready:function(){
	    },
	    methods:{
	      queryData: function(event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }
                 else {
                     this.params.page = 1;
                     this.params.size = 10;
                 }
                this.loadGridData(this.params);
            },
            loadGridData: function(pars) {
            	$("#showOperator").parent().removeClass("checked");
            	$("#showOperator").attr("checked", false);
                $.ajax({
                    url: __ctx + "/workOrder/getWorkOrderList",
                    data: pars,
                    success:function(data){
                    	if(data.result){
                    		vm_workOrderList.infos = data.obj;
                    	}else{
                    		vm_workOrderList.infos = null;
                    		console.log(data.message);
                    	}
                    }
                });
            },
            /*
			 * init:function(){ $.ajax({ url: __ctx +
			 * "/refundTicket/index/init", data: null, success:function(data){
			 * var rtnObj=data.obj; if(rtnObj!=null){
			 * vm_workOrderList.$watch(function(){ this.params.refundTypeList =
			 * rtnObj.refundTypeList; }); } } }); },
			 */
            /*
			 * show:function(event, pageInfo){ if (pageInfo) {
			 * $.extend(this.params, pageInfo); } else { this.params.page = 1;
			 * this.params.size = 20; } //标记当天颜色 var $a =
			 * $("#workOrder").find("tbody tr");
			 * if($("#showDate").prop("checked")){ //如果选中排序 $.ajax({ url: __ctx +
			 * "/refundTicket/show", data: this.params, success:function(data){
			 * vm_workOrderList.infos = data; } }); }else{
			 * this.loadGridData(this.params); } },
			 */
            show: function(event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }
                 else {
                     this.params.page = 1;
                     this.params.size = 10;
                 }
              // 标记当天颜色
                var $a = $("#WorkOrder").find("tbody tr");
				if($("#showOperator").prop("checked")){
					this.params.operator = '1';
	                $.ajax({
	                    url: __ctx + "/workOrder/getWorkOrderList",
	                    data: this.params,
	                    success:function(data){
	                    	if(data.result){
	                    		vm_workOrderList.infos = data.obj;
	                    	}else{
	                    		console.log(data.message);
	                    	}
	                    }
	                });
	                this.params.operator = null;
				}else{
					this.loadGridData(this.params);
				}
            },
            showContent:function(content,type){
            	vm_workOrderList.str1 = "";
				vm_workOrderList.str2 = "";
				vm_workOrderList.str3 = "";
                if(content !=null && content !="" ){//换行
					if('1' == type){
						var strs = content.split("TTTTTTTTT");
						vm_workOrderList.str1 = strs[0];
						vm_workOrderList.str2 = strs[1];
					}else 
					if('2' == type){
						var strs = content.split("TTTTTTTTT");
						vm_workOrderList.str1 = strs[0];
						vm_workOrderList.str2 = strs[1];
						vm_workOrderList.str3 = strs[2];
					}

                }
            },
            unlock:function(workOrderNo,operatorType){
            	$.ajax({
                    url: __ctx + "/workOrder/updateFlightWorkOrderStatus?workOrderNo="+workOrderNo+"&operatorType="+operatorType,
                    data: null,
                    success:function(data){
                    	if(data.result){
                    		toastr.info(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    		 // 重新请求数据
                    		vm_workOrderList.loadGridData(vm_workOrderList.params);
                    	}else{
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            },
            lock:function(workOrderNo,operatorType){
            	$.ajax({
            		url: __ctx + "/workOrder/updateFlightWorkOrderStatus?workOrderNo="+workOrderNo+"&operatorType="+operatorType,
                    data: null,
                    success:function(data){
                    	if(data.result){
                    		 // 重新请求数据
                    		vm_workOrderList.loadGridData(vm_workOrderList.params);
                    	}else{
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            },
            
            deal:function(workOrderNo,operatorType){
            	this.workOrderNo = workOrderNo;
            	this.operatorType = operatorType;
            	$('#dealModal').modal({ backdrop: 'static'});
        		$("#dealModal").modal('show');
            },
            look:function(workOrderNo){
            	$.ajax({
                    url: __ctx + "/workOrder/getWorkOrderLock?workOrderNo="+workOrderNo,
                    data: null,
                    success:function(data){
                    	if(data.result){
                        	$('#lockModal').modal({ backdrop: 'static'});
                    		$("#lockModal").modal('show');
                    		// 数据填充
                    		vm_workOrderList.lockInfos=data.obj;
                    		console.log(vm_workOrderList.lockInfos);
                    	}else{
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            },
            orderDetail:function(orderNo){
            	// 订单详情页
            	window.open(__ctx+"/orderdetails/flightorderdetail?orderNo="+orderNo);
            },
          // 清除数据
			clearData:function(){
				vm_workOrderList.params.orderNo="";
				vm_workOrderList.params.workOrderNo="";
				vm_workOrderList.params.pnr="";
				vm_workOrderList.params.gmtCreateTimeBegin="";
				vm_workOrderList.params.gmtCreateTimeEnd="";
				vm_workOrderList.params.workOrderType="";
				vm_workOrderList.params.workOrderStatus="";
			}
	    }
	  });
	  $('#dealBtn').click(function(){
      	$.ajax({
      		url: __ctx + "/workOrder/updateFlightWorkOrderStatus?workOrderNo="+vm_workOrderList.workOrderNo+"&operatorType="+vm_workOrderList.operatorType,
              data: null,
              success:function(data){
              	if(data.result){
              		toastr.info(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
             		 // 重新请求数据
             		vm_workOrderList.loadGridData(vm_workOrderList.params);
              	}else{
              		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
              	}
              }
          });
      	$('#dealModal').modal('hide');
      });
	  function formatDate(date){
			Y = date.getFullYear() + '-';
			M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
	        D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate());
			return Y+M+D; 
	  }
	// 取当天日期
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
});