var vm_minusProfitList;
$(document).ready(function(){
     $('#date-end,#date-start').datetimepicker({
      minView: "month", // 选择日期后，不会再跳转去选择时分秒
        　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        　　language: 'zh-CN', // 汉化
        　　autoclose:true // 选择日期后自动关闭
        });
	  vm_minusProfitList=new Vue({
	    el:"#minusProfitList",
	    data:{
	      infos:[],
	      params:{}
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
                     this.params.size = 20;
                 }
                this.loadGridData(this.params);
            },
            reset: function () {
            },
            orderDetail:function(orderNo){
            	//订单详情页
            	window.open(__ctx+"/orderdetails/flightorderdetail?orderNo="+orderNo);
            },
            orderDeal:function(orderNo){
            	//负利润单处理页
            	window.open(__ctx+"/negativeprofits/negativeprofitsorderlist?orderNo="+orderNo);
            },
            loadGridData: function(pars) {
                $.ajax({
                    url: __ctx + "/minusProfit/getMinusProfitList",
                    data: pars,
                    success:function(data){
                        vm_minusProfitList.infos = data;
                    }
                });
            }
	    }
	  });
});