var vm_list;
$(document).ready(function(){
     $('#date-end,#date-start').datetimepicker({
      minView: "month", // 选择日期后，不会再跳转去选择时分秒
        　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        　　language: 'zh-CN', // 汉化
        　　autoclose:true // 选择日期后自动关闭
        });
  vm_list=new Vue({
    el:"#itineraryPageList",
    data:{
      infos:[],
      params:{
    	  itineraryNo:"",
    	  companyName:"",
    	  beginTime:"",
    	  endTime:"",
    	  passengerName:"",
    	  bookPersonName:"",
    	  passengerPhone:"",
    	  bookPersonPhone:"",
    	  passengerEmail:"",
    	  bookPersonEmail:""
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
        btnClean: function () {
            vm_list.params.itineraryNo="";
            vm_list.params.companyName="";
            vm_list.params.beginTime="";
            vm_list.params.endTime="";
            vm_list.params.passengerName="";
            vm_list.params.bookPersonName="";
            vm_list.params.passengerPhone="";
            vm_list.params.bookPersonPhone="";
            vm_list.params.responsiblePepoleName="";
            vm_list.params.passengerEmail="";
            vm_list.params.bookPersonEmail="";
        },
        loadGridData: function(pars) {
            $.ajax({
                url: __ctx + "/serachitinerary/getitinerarylist",
                data: pars,
                success:function(data){
                    vm_list.infos = data;
                }
            });
        }
    }
  });
  //vm_list.init()
});