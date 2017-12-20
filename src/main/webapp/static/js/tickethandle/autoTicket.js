var vm_auto_list;
$(document).ready(function(){
     $('#date-end,#date-start').datetimepicker({
      minView: "month", // 选择日期后，不会再跳转去选择时分秒
        　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        　　language: 'zh-CN', // 汉化
        　　autoclose:true // 选择日期后自动关闭
        });
     vm_auto_list=new Vue({
	    el:"#autoTicketPageList",
	    data:{
	      infos:[],
	      logInfo:[],
	      params:{
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
        },loadGridData: function(pars) {
            $.ajax({
                url: __ctx + "/autoTicket/getOrderList",
                data: pars,
                success:function(data){
                	vm_auto_list.infos = data;
                }
            });
        }
    }
  });
    //vm_auto_list.loadGridData(vm_auto_list.params);
});