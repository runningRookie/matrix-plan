var vm_list;
$(document).ready(function(){
    var nowDate  = new Date();
	Vue.filter('changeTypeFilter', {
        read: function (value, format) {
			if (value == '1') {
                return '延迟';
            }
            if (value == '2') {
                return '提前';
            }
            if (value == '3') {
                return '取消';
            }
            if (value == '4') {
                return '解析失败';
            }
            if (value == '5') {
                return '手动添加';
            }
            if (value == '6') {
                return '航班号或机场或舱位发生变动';
            }
            if (value == '7') {
                return '抵达时间提前';
            }
            if (value == '8') {
                return '抵达时间延误超过30分钟内';
            }
            if (value == '9') {
                return '抵达时间延误超过30分钟';
            }
            if (value == '10') {
                return '航班取消后恢复';
            }
        },
        write: function (value, format) {
            return value;
        }
    });
	
	Vue.filter('toDate', {
        read: function (value, format) {
            if (value == '' || value == null || value == '631123200000' || value == '1990-01-01 00:00:00') {
                return '';
            }
            return moment(value).format(format);
        },
        write: function (value, format) {
            return value;
        }
    });
	
    $('#date-start1,#date-start2').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        endDate: moment().add(1, 'y').format("YYYY-MM-DD"),
        autoclose:true // 选择日期后自动关闭
    });
    
    vm_list=new Vue({
    el:"#segmentChangeList",
    data:{
      infos:[],
      params:{
    	  flightOrderNo:"",
    	  passengerName:"",
    	  flightNo:"",
    	  departureAirPort:"",
    	  arrivalAirPort:"",
    	  changeType:"",
    	  departureTime1:moment().format("YYYY-MM-DD"),
    	  departureTime2:moment().add(1, 'y').format("YYYY-MM-DD"),
    	  arrivalTime1:"",
    	  arrivalTime2:"",
          passengerPhone:'',
          operatorStatus:''
      },
      details:[]
    },
    methods:{
    	queryData: function(event, pageInfo) {
    	    if(!valid(this.params)){
    	        return;
            }
            if (pageInfo) {
                $.extend(this.params, pageInfo);
            } else {
                 this.params.page = 1;
                 this.params.size = 20;
            }
            this.loadGridData(this.params);
        },
        btnClean: function () {
            vm_list.params.flightOrderNo="";
            vm_list.params.passengerName="";
            vm_list.params.flightNo="";
            vm_list.params.departureAirPort="";
            vm_list.params.arrivalAirPort="";
            vm_list.params.changeType="";
            vm_list.params.departureTime1="";
            vm_list.params.departureTime2="";
            vm_list.params.arrivalTime1="";
            vm_list.params.arrivalTime2="";
            vm_list.params.passengerPhone='';
            vm_list.params.operatorStatus='';
        },
        loadGridData: function(pars) {
            $.ajax({
                url: __ctx + "/segementchange/getSegmentChangeList",
                data: pars,
                success:function(data){
                		vm_list.infos = data;
                }
            });
        },
        detail:function(item){
        	vm_list.details = item
        	$('#detailModal').modal({ backdrop: 'static'});
    		$("#detailModal").modal('show')
        },
        lock:function(id, orderNo){
            $.ajax({
                url: __ctx + "/segementchange/lock?id="+id,
                data: null,
                success:function(data){
                    if(data.result){
                        window.location.href=__ctx+"/flights/flightorderdetail?orderNo="+orderNo + '&flightSegmentChangeId='+ id;
                    }else{
                        toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    }
                }
            });
        },
        unlock:function(id){
            $.ajax({
                url: __ctx + "/segementchange/unlock?id="+id,
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
        unNeedDeal: function (id) {
            $.ajax({
                url: __ctx + "/segementchange/unNeedDeal?id="+id,
                data: null,
                success:function(data){
                    if(data.result){
                        // 重新请求数据
                        vm_list.loadGridData(vm_list.params);
                    }else{
                        toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    }
                }
            });
        }
    }
  });

    function valid(params) {
        if(!!params.flightOrderNo && (!/^[A-Za-z0-9]+$/.test(params.flightOrderNo) || params.flightOrderNo.length >20)){
            toastr.error('订单号只允许输入字母、数字且不能超过20个字符', "",{timeOut: 2000, positionClass: "toast-top-center"});
            return false;
        }
        if(!!params.passengerName && (!/^[A-Za-z\u4e00-\u9fa5/]+$/.test(params.passengerName) || params.passengerName.length >20)){
            toastr.error('乘客姓名只允许输入字母、汉字、符号（仅限“/”）且不能超过50个字符', "",{timeOut: 2000, positionClass: "toast-top-center"});
            return false;
        }
        if(!!params.passengerPhone && (!/^[0-9]+$/.test(params.passengerPhone) || params.passengerPhone.length >11)){
            toastr.error('乘客联系方式只允许输入数字且不能超过11个字符', "",{timeOut: 2000, positionClass: "toast-top-center"});
            return false;
        }
        if(!!params.departureAirPort && (!/^[A-Za-z]+$/.test(params.departureAirPort) || params.departureAirPort.length >10)){
            toastr.error('起飞机场只允许输入字母且不能超过10个字符', "",{timeOut: 2000, positionClass: "toast-top-center"});
            return false;
        }
        if(!!params.arrivalAirPort && (!/^[A-Za-z]+$/.test(params.arrivalAirPort) || params.arrivalAirPort.length >20)){
            toastr.error('到达机场只允许输入字母且不能超过10个字符', "",{timeOut: 2000, positionClass: "toast-top-center"});
            return false;
        }
        if(!!params.flightNo && (!/^[A-Za-z0-9]+$/.test(params.flightNo) || params.flightNo.length >10)){
            toastr.error('航班号只允许输入字母、数字且不能超过10个字符', "",{timeOut: 2000, positionClass: "toast-top-center"});
            return false;
        }
        if(!!params.departureTime1 && !!params.departureTime2 && (moment(params.departureTime1).add(1,'y').format('YYYY-MM-DD') < params.departureTime2)){
            toastr.error('起飞日期区间时间跨度不能超过1年', "",{timeOut: 2000, positionClass: "toast-top-center"});
            return false;
        }
        return true;
    }
  // vm_list.init()
});