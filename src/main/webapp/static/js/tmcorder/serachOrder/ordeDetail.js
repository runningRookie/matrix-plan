var vm_list;
$(document).ready(function(){

    Vue.filter('toPaymentType', {
        read: function(value, format) {
                if(value == 'n'){
                    return '现结';
                }else{
                    return '授信';
                }
                
        },
        write: function (value, format) {
                return value;
        }
   }); 

  vm_list=new Vue({
    el:"#orderDetailList",
    data:{
      flightOrderNo:"DA20161025144547665",
      infos:{},
      params:{},
      passengerSegments:[],
      flightSegments:[],
      orderInfo:{},
      cancelReason:"",
      singleResult:{},
      emergencyApprovalQuery:{}
    },
    ready:function(){
        this.loadGridData();
        this.serachOrder(this.flightOrderNo);
        this.searchFlightSegment(this.flightOrderNo);
        this.searchPassengerSegmentInfo(this.flightOrderNo);
    },
    methods:{
        //紧急审批TODO
        emergencyApproval : function (){
            var emergencyApprovalQuery={};
            emergencyApprovalQuery.orderNo = orderNo;
            emergencyApprovalQuery.stopRadio = this.emergencyApprovalQuery.stopRadio;
            emergencyApprovalQuery.codeStop = this.emergencyApprovalQuery.stopRadio==2?this.emergencyApprovalQuery.codeStop1:this.emergencyApprovalQuery.codeStop2;
            $.ajax({
                    url: __ctx + "/commitaudit/emergencyapproval",
                    contentType: "application/json",
                    type: "POST", 
                    dataType: "json",
                    data: JSON.stringify(emergencyApprovalQuery)
                });
        },
        

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
            reset: function () {
                this.params = {};
            },
            loadGridData: function(pars) {
                $.ajax({
                    url: __ctx + "/orderdetails/getflightorder",
                    data: pars,
                    success:function(data){
                        /*vm_list.infos = data;*/
                         /* for(var i=0;i<vm_list.infos.passengers.length;i++){
                          var passengerSegment = {};
                          passengerSegment.passenger=vm_list.infos.passengers[i];
                          passengerSegment.flightSegments = vm_list.infos.segmentOrInfoDTOs;
                          vm_list.passengerSegments.$set(vm_list.passengerSegments.length,passengerSegment);
                        }*/
                    }
                });
            },
            serachOrder: function(orderInfo){
                $.ajax({
                    url: __ctx + "/orderdetails/orderinfo",
                    data: {
                        orderNo:orderInfo
                    },
                    success : function(data){
                        vm_list.orderInfo = data.obj;
                    }
                });
            },
            searchFlightSegment:function(orderInfo){
                $.ajax({
                    url: __ctx + "/orderdetails/searchFlightSegment",
                    data: {
                        orderNo:orderInfo
                    },
                    success : function(data){
                        vm_list.flightSegments = data.obj;
                    }
                });
            },
            searchPassengerSegmentInfo:function(orderInfo){
                $.ajax({
                    url: __ctx + "/orderdetails/searchPassengerSegmentInfos",
                    data: {
                        orderNo:orderInfo
                    },
                    success : function(data){
                        vm_list.passengerSegments = data.obj;
                    }
                });
            },
            cancelOrderModal:function(){
                $("#confirmCancel").modal({
                    show : true,
                //   remote : __ctx + "/itinerary/bookpersonlist",
                    backdrop : 'static'
                });
            },

            /*撤回审批*/
            cancellationOrder:function(){
               $.ajax({
                    url: __ctx + "/commitaudit/trminationapproval",
                    data: {
                        orderNo:orderNo
                    },
                    success : function(data){
                        vm_list.singleResult = data.obj;
                        //需要告知用户，TODO
                    }
                });
            },
            toRefundOrder:function(){
            	window.location.href =  __ctx + '/flights/refund?orderNo=' + vm_list.flightOrderNo; 
            },
            cancelOrder :function (){
                if(vm_list.cancelReason == ''){
                    toastr.error("订单取消原因不能为空！", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                
                        // if(orderStatus == '1' || orderStatus == '5'){
                        //     toastr.error("该订单不可取消！", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        //     return;
                        // }
                    $.ajax({
                    url: __ctx + "/flightOrder/cancelFlightOrder",
                    type : "POST",
                    data:{
                        orderNo:vm_list.flightOrderNo,
                        cancelReason:vm_list.cancelReason
                    },
                    datatype:"json",
                    error:function(data){
                        toastr.error("取消失败", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    },
                    success:function(data){
                        toastr.success(data.message,"", {timeOut: 1000, positionClass: "toast-top-center"});
                        // parms = order_list.parms;
                        // reloadGridData(parms);
                        
                    }
                });
               } 
    }
  });
  
});

