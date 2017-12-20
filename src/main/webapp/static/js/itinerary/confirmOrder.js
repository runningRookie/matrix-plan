var confirmOrdervm;

$(document).ready(function(){
	
	confirmOrdervm=new Vue({
	
        el:"#confirmOrderPage",
        data:{
            params:{
            	itineraryNoStr:itineraryNoStr,
            	personType:personType,
            	personId:personId,
            	companyId:companyId,
            	applyType:"",
            	flight:false,
            	bus:false,
            	hotel:false,
            	train:false,
            	showViolationTravelPolicy:false,
            	showViolationReason:false,
            	showServiceCharge:true,
            	showTravelPurpose:false,
            	showSinglePrice:true,
            	showTicketRefundChange:false,
            	showTicketCode:false,
            	showflightDetail:true
            }
       },
       methods:{

           sendQueryParam: function() {
        	   var flight=confirmOrdervm.params.flight;
        	   var hotel=confirmOrdervm.params.hotel;
        	   var train=confirmOrdervm.params.train;
        	   var bus=confirmOrdervm.params.bus;
        	   if(flight==false&&hotel==false&&train==false&&bus==false){
        		   toastr.error("请选择具体产品！", "", {timeOut: 2000, positionClass: "toast-top-center"});
        		   return;
        	   }
        	   
               window.location.href=__ctx+"/itineraryConfirmPage/bookConfirmPage?itineraryNoStr="+confirmOrdervm.params.itineraryNoStr+"&personType="+confirmOrdervm.params.personType+
               "&companyId="+confirmOrdervm.params.companyId+"&personId="+confirmOrdervm.params.personId+
               "&applyType="+confirmOrdervm.params.applyType+"&flight="+confirmOrdervm.params.flight+"&bus="+confirmOrdervm.params.bus+"&hotel="+confirmOrdervm.params.hotel+
               "&train="+confirmOrdervm.params.train+"&showViolationTravelPolicy="+confirmOrdervm.params.showViolationTravelPolicy+"&showViolationReason="+confirmOrdervm.params.showViolationReason+
               "&showServiceCharge="+confirmOrdervm.params.showServiceCharge+"&showTravelPurpose="+confirmOrdervm.params.showTravelPurpose+"&showSinglePrice="+confirmOrdervm.params.showSinglePrice+
               "&showTicketRefundChange="+confirmOrdervm.params.showTicketRefundChange+"&showTicketCode="+confirmOrdervm.params.showTicketCode+"&showflightDetail="+confirmOrdervm.params.showflightDetail;
               

           }

       }
	});
});