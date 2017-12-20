//选择哪种筛选方式
$(".J-tabs .J-tab").on('click',  function() {
    $(this).removeClass('btn-xm-default').addClass('btn-xm-blue').closest('li').siblings().children('.J-tab').removeClass('btn-xm-blue').addClass('btn-xm-default');
});
var vm_list;
$(document).ready(function(){
    $('#date-end,#date-start').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose:true // 选择日期后自动关闭
    });
    vm_list=new Vue({
        el:"#queryItineraryByPeople",
        data:{
            infos:[],
            employeesinfo:[],
            params:{
            	personId:"",
                beginTime:"",
                endTime:"",
                personType:""
            },
            
            employeeParams:{
            	name:"",
            	companyId:""
            	
            },
            selectItinerary:[]
            
       },
        methods:{
            queryData: function(event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.employeeParams, pageInfo);
                }else {
                     this.employeeParams.page = 1;
                     this.employeeParams.pageSize = 10;
                 }
                
            	var begintime=vm_list.params.beginTime;
            	var endtime=vm_list.params.endTime;
                
                var personName=this.employeeParams.name;
                if(personName.length==0){
                    toastr.error("请输入姓名！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                }else if(endtime!=""&&begintime>endtime){
            		
                    toastr.error("开始时间不得大于结束时间！", "", {timeOut: 2000, positionClass: "toast-top-center"});
	
            	}else{
            		this.employeeParams.personType=this.params.personType;
                	this.loadEmployees(this.employeeParams);
                }
           //    this.loadGridData(this.params);
            },

            loadEmployees: function(pars) {
                $.ajax({
                    type:"POST",
                    url: __ctx + "/queryitinerarybypeople/queryEmployeeByPage",
                    contentType:'application/json; charset=UTF-8',
                    datatype:'json',
                    data:JSON.stringify(pars),
                    success:function(data){
                    	var result=data.data;''
                    	if(result == undefined &&pars.personType== '1'){
                            toastr.error("无此预订人信息！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    	}else if(result == undefined &&pars.personType== '2'){
                            toastr.error("无此差旅人信息！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    	} 
                    	else if(result.length == 1)  {
                    	var personId=result[0].id;
                    	var personName=result[0].chineseName;
                    	vm_list.params.personId=personId;
                   // 	vm_list.employeeParams.name=personName;
                    	vm_list.loadGridData(vm_list.params);
      
                    	}else{
                          	var length=result.length;
                            vm_list.employeesinfo = data;
                            $('#employeeModal').modal('show')

                    	}

                    }
                });
            },


            loadGridData: function(pars) {
                $.ajax({
                    type:"POST",
                    url: __ctx + "/queryitinerarybypeople/queryItineraryByPage",
                    contentType:'application/json; charset=UTF-8',
                    datatype:'json',
                    data:JSON.stringify(pars),
                    success:function(data){
                        vm_list.infos = data;
                    }
                });
            	
            },
            showDetail:function(itineraryNo){
                window.location.href=__ctx+"/itineraryproduct/itineraryproductlist?itineraryNo="+itineraryNo;
            },
            selectBookPerson: function (index, person) {
            	var personId=person.id;
            	var personName=person.chineseName;            	
            	vm_list.params.personId=personId;
            	//vm_list.employeeParams.name=personName;

            },
            choosePerson:function(){
            	
            	 this.loadGridData(this.params);
            	  $('#employeeModal').modal('hide')
            },
            
            getBookPerson:function(){
            	vm_list.params.personType="1";
            	$("#passengerLabel").attr("hidden",true);
            	$("#bookPersonLabel").removeAttr("hidden");
            	this.reset();
            },
            
            getPassenger:function(){
            	vm_list.params.personType="2";
            	$("#bookPersonLabel").attr("hidden",true);
            	$("#passengerLabel").removeAttr("hidden");
            	this.reset();
            },
            
            reset: function () {
           	 this.infos = {};
           },
            genConfirmOrder:function(){
            	var itinerayNoStr="";
            	$(vm_list.selectItinerary).each(function(i,e){
            		itinerayNoStr+=e+",";

            	});
            	                 
            	if(vm_list.selectItinerary.length==0){
                    toastr.error("请选择具体行程！", "", {timeOut: 2000, positionClass: "toast-top-center"});
            	}else{
                window.location.href=__ctx+"/queryitinerarybypeople/confirmOrderPage?itineraryNoStr="+itinerayNoStr+"&personType="+vm_list.params.personType+"&companyId="+vm_list.employeeParams.companyId+"&personId="+vm_list.params.personId;
            	}
            }
            
        }
    });
    //vm_list.init()
});