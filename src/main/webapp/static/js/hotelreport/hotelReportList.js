var vm_list;
$(document).ready(function(){
    $('#search-date-start,#search-date-end').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose:true, // 选择日期后自动关闭
        endDate:new Date()
    });

    $('#search-date-start1,#search-date-end1').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose:true // 选择日期后自动关闭
    });

    $('#search-date-start').datetimepicker({
    }).on('hide', function(event) { 
	    event.preventDefault();  
	    event.stopPropagation(); 
	    var startTime=$("#search-date-start").val();
	    $('#search-date-end').datetimepicker('setStartDate',startTime);  
	    $('#search-date-start').datetimepicker('hide');
	});

	$('#search-date-start1').datetimepicker({
    }).on('hide', function(event) {  
	    event.preventDefault();  
	    event.stopPropagation();  
	    var startTime=$("#search-date-start1").val();
	    $('#search-date-end1').datetimepicker('setStartDate',startTime);  
	    $('#search-date-start1').datetimepicker('hide');
	});
    
    $('#search-date-end').datetimepicker({
    }).on('hide', function(event) {  
        event.preventDefault();  
        event.stopPropagation(); 
        var endTime=$("#search-date-end").val();
        $('#search-date-start').datetimepicker('setEndDate',endTime);  
        $('#search-date-end').datetimepicker('hide');
    });

    $('#search-date-end1').datetimepicker({
    }).on('hide', function(event) {  
        event.preventDefault();  
        event.stopPropagation(); 
        var endTime=$("#search-date-end1").val();
        $('#search-date-start1').datetimepicker('setEndDate',endTime);  
        $('#search-date-end1').datetimepicker('hide');
    });
    
    var loadCompanysData = function () {
        $.ajax({
            url: __ctx + "/resource/companys",
            type: "POST",
            datatype: "json",
            error: function (data1) {
                toastr.error(data1.message, "请求失败", toastrConfig);
            },
            success: function (data) {
                vm_list.companys = data;
            }
        });
    }
    
    $('#search-province-report').change(function(){ 
		var p1=$('#search-province-report').val();
		if(p1>0) {
			vm_list.getCitys(p1);
		}
	});
    
    vm_list=new Vue({
        el:"#hotelReportList",
        data:{
          infos:{},
          companys: [],
          citys: [],
          params:{
              dto:{
                  createBeginTime:moment(Date.now()).format('YYYY-MM-DD'),
                  createEndTime:moment(Date.now()).format('YYYY-MM-DD'),
                  occupancyBeginTime:"",
                  occupancyEndTime:"",
                  passengerName:"",
                  bookPersonName:"",
                  itineraryNo:"",
                  orderNo:"",
                  bookPhone:"",
                  hotelName:"",
                  orderChannel:"",
                  companyId:"",
                  orderStatus:"",
                  provinceId:"",
                  cityId:"",
                  paymentType:"",
                  hotelType:""
              },
              selectedDate:"1"
          },
          select_id:[],
          select_id_copy:[],
          select_map:{
                'select-orderNo':'订单号',
                'select-orderStatus':'订单状态',
                'select-companyName':'公司名称',
                'select-hotelName':' 酒店名称',
                'select-cityName':'城市名称',
                'select-bookPersonWorkNo':' 预订人工号',
                'select-bookPersonName':' 预订人姓名',
                'select-bookPersonDepartmentName1':'预订人部门名称1',
                'select-bookPersonDepartmentName2':'预订人部门名称2',
                'select-bookPersonDepartmentName3':'预订人部门名称3',
                'select-bookPersonDepartmentName4':'预订人部门名称4',
                'select-orderChannel':'预订渠道',
                'select-passengerNames':' 入住人姓名',
                'select-passengerDepartmentNames1':'入住人部门名称1',
                'select-passengerDepartmentNames2':'入住人部门名称2',
                'select-passengerDepartmentNames3':'入住人部门名称3',
                'select-passengerDepartmentNames4':'入住人部门名称4',
                'select-operatorWorkNo':'OP操作人工号',
                'select-operatorName':'OP操作人名称 ',
                'select-operatorDepartmentName1':'OP操作人部门名称1',
                'select-operatorDepartmentName2':'OP操作人部门名称2',
                'select-operatorDepartmentName3':'OP操作人部门名称3',
                'select-operatorDepartmentName4':'OP操作人部门名称4',
                'select-customerManagerWorkNo':'客户经理工号',
                'select-customerManagerName':'客户经理姓名',
                'select-customerManagerDepartmentName1':' 客户经理部门名称1',
                'select-customerManagerDepartmentName2':' 客户经理部门名称2',
                'select-customerManagerDepartmentName3':' 客户经理部门名称3',
                'select-customerManagerDepartmentName4':' 客户经理部门名称4',
                'select-salesManagerWorkNo':'销售经理工号',
                'select-salesManagerName':'销售经理姓名 ',
                'select-salesManagerDepartmentName1':'销售经理部门名称1',
                'select-salesManagerDepartmentName2':'销售经理部门名称2',
                'select-salesManagerDepartmentName3':'销售经理部门名称3',
                'select-salesManagerDepartmentName4':'销售经理部门名称4',
                'select-gmtOrderOccupancyTime':'订单入住时间',
                'select-gmtOrderLeaveTime':'订单离店时间',
                'select-roomType':'房型',
                'select-roomCount':'房间总数',
                'select-roomNightCount':'总间夜数',
                'select-customerAverageRoomPrice':' 平均房费 （对客人）',
                'select-opAverageRoomPrice':'平均房费 （OP）',
                'select-adjustment':'调整项',
                'select-roomPriceDetail':'房费明细',
                'select-taxe':'税费 ',
                'select-serviceFee':'服务费',
                'select-totalMoney':'订单总价',
                'select-hotelType':'酒店类型',
                'select-paymentType':'结算方式',
                'select-travelPurpose':'差旅目的',
                'select-isViolation':'是否违规',
                'select-isAgreement':'是否为协议酒店',
                'select-relatedOaNo':'OA关联单号',
                'select-itineraryRemark':'行程备注',
                'select-gmtCreateTime':'创单时间'
            },
            select_if : false
        },
        ready: function (){
            this.select_if = true;
            this.select_id = ['select-orderNo','select-hotelName','select-gmtOrderOccupancyTime','select-gmtOrderLeaveTime','select-roomType',
            		'select-roomCount','select-totalMoney','select-isViolation','select-gmtCreateTime'];
            this.select_id_copy = ['select-orderNo','select-hotelName','select-gmtOrderOccupancyTime','select-gmtOrderLeaveTime','select-roomType',
            		'select-roomCount','select-totalMoney','select-isViolation','select-gmtCreateTime'];
            loadCompanysData();
        },
        init: function() {
            $('#selectBtn').click(function() {
                $('#selectDiv').fadeToggle(100);
            });
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
            queryData: function(event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params.dto, pageInfo);
                } else {
                    this.params.dto.page = 1;
                    this.params.dto.pageSize = 10;
                }
                var temp = this.groupData();
                if (temp) {
                    this.loadGridData(temp);
                }
            },
            groupData: function(){
    	        if (!this.params.dto.createBeginTime|| !this.params.dto.createEndTime) {
    	            toastr.error("创建日期不能为空","", {
    	               timeOut: 2000,
    	               positionClass: "toast-top-center"
    	            });
                    return;
    	        };
                var temp = _.cloneDeep(this.params.dto);
                /*if("2" == this.params.selectedDate){
                    temp.dealStartDate = _.cloneDeep(this.params.dto.depDate);
                    temp.dealEndDate = _.cloneDeep(this.params.dto.arrDate);
                    temp.depDate = "";
                    temp.arrDate = "";
                }*/
                return temp;
            },
            btnClean: function () {
                this.params.dto.createBeginTime=moment(Date.now()).format('YYYY-MM-DD'),
                this.params.dto.createEndTime=moment(Date.now()).format('YYYY-MM-DD'),
                this.params.dto.occupancyBeginTime="",
                this.params.dto.occupancyEndTime="",
                this.params.dto.passengerName="",
                this.params.dto.bookPersonName="",
                this.params.dto.itineraryNo="",
                this.params.dto.orderNo="",
                this.params.dto.bookPhone="",
                this.params.dto.hotelName="",
                this.params.dto.orderChannel="",
                this.params.dto.companyId="",
                this.params.dto.orderStatus="",
                this.params.dto.provinceId="",
                this.params.dto.cityId="",
                this.params.dto.paymentType="",
                this.params.dto.hotelType=""
            },
            btnDownloadExcel: function () {
                var temp = this.groupData();
                var action = __ctx + "/hotelreport/downloadHotelReport";
                var form = $("#downForm");
                form.attr('action',action);
                form.attr('method','post');
                $("#hotelBusinessRequestDTO").val(JSON.stringify(temp));
                form.submit();
            },
            loadGridData: function(pars) {
                $.ajax({
                	type:"post",
                    url: __ctx + "/hotelreport/domesticHotelReport",
                    contentType:'application/json; charset=UTF-8',
					datatype:'json',
					data:JSON.stringify(pars),
                    success:function(data){
                        vm_list.infos = {};
                        if(!data || data.data == null || data.data.length <= 0){
          				  $('#reportException').text("查询无结果，请重新填写查询条件");
          				  $('#warnModal').modal({ backdrop: 'static'});
                      	  $('#warnModal').modal('show');
          			    } else {
          				  $('#warnModal').modal('hide');
          				  vm_list.infos = data;
          			    }
                    }
                });
            },
            selectConfirm:function(){
                if(this.select_id.length <= 0) {
					this.select_id = this.select_id_copy;
    			} else {
    				this.select_id_copy = [];
    				for (var key in this.select_map) {
                        if(this.select_id.indexOf(key) >= 0){
                            this.select_id_copy.push(key);
                        }
                    };
                    $('#selectDiv').fadeToggle(100);
    			}
            },
            selectClean:function(){
                this.select_id = [];
            },
            selectAll:function(){
                for (var key in this.select_map) {
                    this.select_id.push(key);
                }; 
            }
        }
    });
});