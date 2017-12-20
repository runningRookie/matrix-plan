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
    
    vm_list=new Vue({
        el:"#segmentChangeList",
        data:{
          infos:[],
          companys: [],
          params:{
              dto:{
                  bookStartDate:moment(Date.now()).format('YYYY-MM-DD'),
                  bookEndDate:moment(Date.now()).format('YYYY-MM-DD'),
                  depDate:"",
                  arrDate:"",
                  dealStartDate:"",
                  dealEndDate:"",
                  passengerName:"",
                  bookPersonName:"",
                  flightSegmentType:"",
                  itineraryNo:"",
                  orderNo:"",
                  originOrderNo:"",
                  orderType:"",
                  bookType:"",
                  companyId:""
              },
              selectedDate:"1"
          },
          select_id:[],
          select_id_copy:[],
          select_map:{
        	    'select-itineraryNo':'行程单号',
                'select-orderNo':'订单号',
                'select-orderType':'类型',
                'select-refundChangeNo':'出退改单号',
                'select-companyName':'客户公司名称',
                'select-finishTime':'成交时间',
                'select-passengerName':'乘机人',
                'select-passengerNo':'乘机人工号',
                'select-passengerStructure1':'乘客组织架构层级1',
                'select-passengerStructure2':'乘客组织架构层级2',
                'select-passengerStructure3':'乘客组织架构层级3',
                'select-passengerStructure4':'乘客组织架构层级4',
                'select-flightSegmentType':'航段类型',
                'select-stationAirLine':'航线',
                'select-stationCodeAirLine':'航线代码',
                'select-cityAirLine':'城市',
                'select-airCode':'航司二字码',
                'select-airName':'航空公司',
                'select-fltNo':'航班号',
                'select-planModel':'机型',
                'select-depTime':'起飞时间',
                'select-arrTime':'到达时间',
                'select-cabinCode':'舱位',
                'select-discount':'折扣',
                'select-cabinClass':'舱等',
                'select-pnr':'PNR',
                'select-officeCode':'OFFICE号',
                'select-ticketNo':'票号',
                'select-passengerType':'乘客类型',
                'select-sellfare':'销售票价',
                'select-purchasePrice':'成本票价',
                'select-plusPrice':'调整项',
                'select-capitalCost':'基建费',
                'select-fuleCost':'燃油费',
                'select-upgradeAndPlusCost':'升舱费',
                'select-upgradeCost':'升舱费成本',
                'select-airlineServiceandPlusFee':'航司退改手续费',
                'select-airlineServiceFee':'退改手续费成本',
                'select-serviceFee':'服务费',
                'select-currency':'币种',
                'select-totalAmount':'总金额',
                'select-baseCodePrice':'同舱等全价',
                'select-dayMinPrice':'当天最低价',
                'select-hourMinPrice':'N小时最低价',
                'select-advanceBookDay':'提前预订天数',
                'select-paymentType':'支付方式',
                'select-orderStatus':'订单状态',
                'select-channelType':'预订方式',
                'select-protocol':'是否协议',
                'select-share':'是否共享',
                'select-stop':'是否经停',
                'select-violation':'是否违规',
                'select-priceType':'价格类型',
                'select-ticketType':'票种',
                'select-ticketMode':'出票方式',
                'select-supplierCode':'供应商ID',
                'select-supplierName':'供应商名称',
                'select-travelAimsCode':'差旅目的code',
                'select-travelAims':'差旅目的描述',
                'select-oaNo':'关联OA单号',
                'select-remark':'行程备注',
                'select-bookTime':'预订时间',
                'select-bookPersonName':'预订人',
                'select-bookPersonNo':'预订人工号',
                'select-bookStructure1':'预订人组织层级1',
                'select-bookStructure2':'预订人组织层级2',
                'select-bookStructure3':'预订人组织层级3',
                'select-bookStructure4':'预订人组织层级4',
                'select-responsiblePepoleName':'OP处理人姓名',
                'select-responsiblePepoleId':'OP处理人工号',
                'select-responsibleGroupName':'OP处理人小组',
                'select-responsiblePepoleStructure1':'处理人OP组织架构层级1',
                'select-responsiblePepoleStructure2':'处理人OP组织架构层级2',
                'select-responsiblePepoleStructure3':'处理人OP组织架构层级3',
                'select-responsiblePepoleStructure4':'处理人OP组织架构层级4',
                'select-manageName':'客户经理姓名',
                'select-manageId':'客户经理工号',
                'select-manageStructure1':'客户经理组织架构层级1',
                'select-manageStructure2':'客户经理组织架构层级2',
                'select-manageStructure3':'客户经理组织架构层级3',
                'select-manageStructure4':'客户经理组织架构层级4',
                'select-sellerName':'销售经理姓名',
                'select-sellerId':'销售经理工号',
                'select-sellerStructure1':'销售经理组织层级1',
                'select-sellerStructure2':'销售经理组织层级2',
                'select-sellerStructure3':'销售经理组织层级3',
                'select-sellerStructure4':'销售经理组织层级4'
            },
            select_if : false
        },
        ready: function (){
            this.select_if = true;
            this.select_id = ['select-itineraryNo', 'select-orderNo', 'select-refundChangeNo', 'select-companyName', 'select-finishTime', 
                              'select-passengerName', 'select-passengerNo', 'select-flightSegmentType', 'select-stationAirLine', 'select-fltNo', 
                              'select-channelType', 'select-bookTime', 'select-bookPersonName', 'select-bookPersonNo'];
            this.select_id_copy = ['select-itineraryNo', 'select-orderNo', 'select-refundChangeNo', 'select-companyName', 'select-finishTime', 
                                   'select-passengerName', 'select-passengerNo', 'select-flightSegmentType', 'select-stationAirLine', 'select-fltNo', 
                                   'select-channelType', 'select-bookTime', 'select-bookPersonName', 'select-bookPersonNo'];
            loadCompanysData();
        },
        init: function() {
            $('#selectBtn').click(function() {
                $('#selectDiv').fadeToggle(100);
            });
        },
        methods:{
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
    	        if (!this.params.dto.bookStartDate || !this.params.dto.bookEndDate) {
    	            toastr.error("预订日期不能为空","", {
    	               timeOut: 2000,
    	               positionClass: "toast-top-center"
    	            });
                    return;
    	        };
                var temp = _.cloneDeep(this.params.dto);
                if("2" == this.params.selectedDate){
                    temp.dealStartDate = _.cloneDeep(this.params.dto.depDate);
                    temp.dealEndDate = _.cloneDeep(this.params.dto.arrDate);
                    temp.depDate = "";
                    temp.arrDate = "";
                }
                return temp;
            },
            btnClean: function () {
                this.params.dto.bookStartDate=moment(Date.now()).format('YYYY-MM-DD'),
                this.params.dto.bookEndDate=moment(Date.now()).format('YYYY-MM-DD'),
                this.params.dto.depDate="",
                this.params.dto.arrDate="",
                this.params.dto.dealStartDate="",
                this.params.dto.dealEndDate="",
                this.params.dto.passengerName="",
                this.params.dto.bookPersonName="",
                this.params.dto.flightSegmentType="DA1",
                this.params.dto.itineraryNo="",
                this.params.dto.originOrderNo="",
                this.params.dto.orderNo="",
                this.params.dto.companyId="",
                this.params.dto.bookType="",
                this.params.dto.orderType=""
            },
            btnDownloadExcel: function () {
                var temp = this.groupData();
                var action = __ctx + "/report/downloadReportExcel";
                var form = $("#downForm");
                form.attr('action',action);
                form.attr('method','post');
                $("#businessRequestDTO").val(JSON.stringify(temp));
                form.submit();
            },
            loadGridData: function(pars) {
                $.ajax({
                    url: __ctx + "/report/domesticFlightReport",
                    data: pars,
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