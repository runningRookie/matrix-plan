
var bookconfirm_vm;
$(document).ready(function(){
	
	bookconfirm_vm = new Vue({
        el:"#book_confrim_page",
        data:{
        	itineraryAndBookPersonInfos:[],
        	flightInfos:[],
        	hotelInfos:[],
        	trainInfos:[],
        	bottomInfo:[],
        	pageTopInfo:[],
           params:{
            	itineraryNoStr:itineraryNoStr,
            	personType:personType,
            	personId:personId,
            	companyId:companyId,
            	applyType:applyType,
            	flight:flight,
            	bus:bus,
            	hotel:hotel,
            	train:train,
            	showViolationTravelPolicy:showViolationTravelPolicy,
            	showViolationReason:showViolationReason,
            	showServiceCharge:showServiceCharge,
            	showTravelPurpose:showTravelPurpose,
            	showSinglePrice:showSinglePrice,
            	showTicketRefundChange:showTicketRefundChange,
            	showTicketCode:showTicketCode,
            	showflightDetail:showflightDetail,
            	itineraryRemark:"",
            	itineraryOrderNo:""
            }

     
       },
       
       ready: function () {
           // 页面初始化载入首页数据.
    	   this.getPageTopInfo();
           this.getItineraryAndBookPerson();   
           this.getFlightInfo();
           this.getHotelInfo();
           this.getTrainInfo();
           this.getPageBottomInfo();
       },
        methods:{
        	
        	getPageTopInfo: function() {
      		    $.ajax({
                    type:"POST",
                    url: __ctx + "/itineraryConfirmPage/getPageTopInfo",
                    contentType:'application/json; charset=UTF-8',
                    datatype:'json',
                    data:JSON.stringify(this.params),
                    success:function(data){
                    	bookconfirm_vm.pageTopInfo = data.obj;

                    }
                });
            	
            },
        	
        	getItineraryAndBookPerson: function() {
      		    $.ajax({
                    type:"POST",
                    url: __ctx + "/itineraryConfirmPage/getItineraryAndBookPerson",
                    contentType:'application/json; charset=UTF-8',
                    datatype:'json',
                    data:JSON.stringify(this.params),
                    success:function(data){
                    	bookconfirm_vm.itineraryAndBookPersonInfos = data.obj;
                    }
                });
            	
            },
        	getFlightInfo: function() {
                $.ajax({
                    type:"POST",
                    url: __ctx + "/itineraryConfirmPage/getFlightInfo",
                    contentType:'application/json; charset=UTF-8',
                    datatype:'json',
                    data:JSON.stringify(this.params),
                    success:function(data){
                    	bookconfirm_vm.flightInfos = data.obj;
                    }
                });
            	
            },
        	getHotelInfo: function() {
                $.ajax({
                    type:"POST",
                    url: __ctx + "/itineraryConfirmPage/getHotelInfo",
                    contentType:'application/json; charset=UTF-8',
                    datatype:'json',
                    data:JSON.stringify(this.params),
                    success:function(data){
                    	bookconfirm_vm.hotelInfos = data.obj;
                    }
                });
            	
            },
            getTrainInfo: function() {
                $.ajax({
                    type:"POST",
                    url: __ctx + "/itineraryConfirmPage/getTrainInfo",
                    contentType:'application/json; charset=UTF-8',
                    datatype:'json',
                    data:JSON.stringify(this.params),
                    success:function(data){
                    	bookconfirm_vm.trainInfos = data.obj;
                    }
                });
            	
            },
            getPageBottomInfo: function() {
                $.ajax({
                    type:"POST",
                    url: __ctx + "/itineraryConfirmPage/getPreviewBottom",
                    contentType:'application/json; charset=UTF-8',
                    datatype:'json',
                    data:JSON.stringify(this.params),
                    success:function(data){
                    	bookconfirm_vm.bottomInfo = data.obj;
                    }
                });
            	
            },
            pdfDownload:function(){
                $.ajax({
                    type:"POST",
                    url: __ctx + "/itinerarypdf/confirm/book/create",
                    contentType:'application/json; charset=UTF-8',
                    datatype:'json',
                    data:JSON.stringify(this.params),
                    success:function(data){
                    	if(data.result){
                    		bookconfirm_vm.params.itineraryOrderNo=data.obj;
                    		window.location.href =  __ctx + '/itinerarypdf/download?itineraryNum=' + data.obj;
                    		return;
                    	}else{
                    		toastr.error(data.message, "", {
								timeOut : 2000,
								positionClass : "toast-top-center"
							});
                    		return;
                    	}
                    }
                });
            }
        	
        }
	
	

	
	
});
	
	
	
});