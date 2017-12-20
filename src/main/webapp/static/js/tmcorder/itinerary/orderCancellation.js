var vm;
$(document).ready(function() {
	
    $('#date-birth').datetimepicker({
            minView: "month", // 选择日期后，不会再跳转去选择时分秒
        　　format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        　　language: 'zh-CN', // 汉化
        　　autoclose:true // 选择日期后自动关闭
        });
	
	
    Vue.filter('toDate', {
        read: function(value, format) {
                if(value == '' || value == null || value=='631123200000' || value=='1990-01-01 00:00:00'){
                    return '';
                }
                return moment(value).format(format);
        },
        write: function (value, format) {
                return value;
        }
    });

    Vue.filter('toSex', {
        read: function(value, format) {
                if(value == 'm'){
                    return '男';
                }else{
                    return '女';
                }
                
        },
        write: function (value, format) {
                return value;
        }
    });
    
    
   
    vm = new Vue({
        el:'#bookform',
        data:{
            itineraryType:1,
            companys:[],
            bookPerson:{
            	companyId:'',
            	bookPersonName:'',
            	bookPersonEmail:'',
            	bookPersonMobile:'',
            	bookPersonNo:''
            },
            bookPersonList:{},
            selectedBookPerson:{},
            commonPassengers:{},
            passengerSearchCondition:{
            	conditon:""
            },
            searchPassengerList:{},
            selectedCommonPassengers:[],
            isChecked:[[]],
            selectedSearchPassenger:[],
            outerPassenger:{
            	passengerName:"",
                passengerNationality:"",
                passengerClass:"",
                passengerCertificates:[{
                    certificateType:"",
                    certificateCode:""
                }],
                passengerBirthDate:"",
                passengerPhone:"",
                passengerText:"",
                passengerSex:"",
                passengerType:"o"             
            },
            allPassengers:[]
            
        },
        ready:function(){
            $("#bookperson_company_div").hide();
            $("#bookperson_phone_div").hide();
            $("#bookperson_email_div").hide();
            $("#bookperson_text_div").hide();
            $("#passenger-to-add").hide();
        }, 
        methods: {
        	searchBookPersons:function(){
        		
        		searchPerson(vm.bookPerson);
        		
                $("#bookPersonModal").modal({
                    show : true,
                //   remote : __ctx + "/itinerary/bookpersonlist",
                    backdrop : 'static'
                });
            },
            queryData:function(event,pageInfo){
                if (pageInfo) {
                    $.extend(this.bookPerson, pageInfo);
                }
                 else {
                     this.bookPerson.page = 1;
                     this.bookPerson.size = 20;
                 }
                searchPerson(this.bookPerson);
            },
            selectBookPerson:function(index,person){
                if($("input:checkbox:eq("+index+")").is(":checked")){
                    this.selectedBookPerson = person;
                    $("input:checkbox").each(function(index2,element){
                        if(index != index2){
                            $("input:checkbox:eq("+index2+")").attr("checked",false);
                        }                   
                    });

                }else{
                    this.selectedBookPerson = {}
                }
                
            },
            setBookPerson:function(){
                
                this.bookPerson.companyId = this.selectedBookPerson.bookCompanyId;
                this.bookPerson.bookPersonName = this.selectedBookPerson.bookPersonName;
                this.bookPerson.bookPersonEmail = this.selectedBookPerson.bookPersonEmail;
                this.bookPerson.bookPersonMobile = this.selectedBookPerson.bookPersonPhone;
                this.bookPerson.bookPersonNo = this.selectedBookPerson.bookPersonNumber;
                // $("#editable-select").val(this.bookPerson.companyName);
                // $("#editable-select_sele").val(this.bookPerson.companyName);
                // alert($("#editable-select").find("value"));
                // $("#editable-select").find("option[text='公司1']").attr("selected",true);
                $("#bookperson_company_sele").val(this.selectedBookPerson.bookCompanyName);

                //预订人转乘客
                var passenger = {};
                passenger.passengerName = this.selectedBookPerson.bookPersonName;
                passenger.passengerEnlishName = this.selectedBookPerson.bookPersonEnlishName;
                passenger.passengerNickname = this.selectedBookPerson.bookPersonNickname;
                passenger.passengerCompanyId = this.selectedBookPerson.bookCompanyId;
                passenger.passengerCompany = this.selectedBookPerson.bookCompanyName;
                passenger.passengerDepartmentId = this.selectedBookPerson.bookPersonDepartment;
                passenger.passengerDepartmentName = this.selectedBookPerson.bookPersonDepartmentName;
                passenger.passengerSex = this.selectedBookPerson.bookPersonSex;
                passenger.passengerPhone = this.selectedBookPerson.bookPersonPhone;
                passenger.passengerEmail = this.selectedBookPerson.bookPersonEmail;
                passenger.passengerBirthDate = this.selectedBookPerson.bookPersonBirthDate;
                passenger.passengerEmployeeId = this.selectedBookPerson.bookPersonEmployeeId;
                passenger.passengerNationality = this.selectedBookPerson.bookPersonNationality;
                passenger.passengerNo = this.selectedBookPerson.bookPersonNumber;
                passenger.passengerType = this.selectedBookPerson.bookPersonType;
                passenger.passengerClass = this.selectedBookPerson.bookPersonClass;
                passenger.isVip = this.selectedBookPerson.isVip;
                passenger.passengerText = this.selectedBookPerson.bookPersonText;
                passenger.passengerCertificates = this.selectedBookPerson.certificates;
                passenger.passengerBackupEmail = this.selectedBookPerson.bookPersonBackupEmail;
                passenger.passengerStructure = this.selectedBookPerson.bookPersonStructure;
                vm.allPassengers.$set(vm.allPassengers.length,passenger);

                $("#bookperson_company_div").show();
                $("#bookperson_phone_div").show();
                $("#bookperson_email_div").show();
                $("#bookperson_text_div").show();
                $("#bookperson_company_selected").text(this.selectedBookPerson.bookCompanyName);
                $("#bookperson_phone_selected").text(this.selectedBookPerson.bookPersonPhone);
                $("#bookperson_phone_selected").text(this.selectedBookPerson.bookPersonPhone);
                $("#bookperson_email_selected").text(this.selectedBookPerson.bookPersonEmail);
                if(this.selectedBookPerson.isBookForOthers){
                    $("#bookperson_bookForOthers_selected").text("当前预订人有代订权限");
                    $("#passenger-to-add").show();
                }else{
                    $("#bookperson_bookForOthers_selected").text("当前预订人无代订权限");
                }
                if(this.selectedBookPerson.auditReferenceType == 'b'){
                    $("#bookperson_auditReferenceType_selected").text("审批流都参照预订人的审批流");
                }else if(this.selectedBookPerson.auditReferenceType == 'p'){
                    $("#bookperson_auditReferenceType_selected").text("审批流都参照出行人的审批流");
                }else{
                    $("#bookperson_auditReferenceType_selected").text("审批流都参照选定的参照人的审批流");
                }
                $('#bookPersonModal').modal('hide');
            },
            selectPassengers:function(){

            	getCommonPassengers(vm.selectedBookPerson);

                vm.searchPassengerList = {};

                $("#passengerModel").modal({
                    show : true,
                //   remote : __ctx + "/itinerary/bookpersonlist",
                    backdrop : 'static'
                });
            },
            searchPassengers:function(){
                getPassengers(vm.passengerSearchCondition);
            },
            selectCommonPassenger:function(index,index2,passenger){
                //添加常用乘客
                if(!this.isChecked[index][index2]){
                    vm.selectedCommonPassengers.$set(vm.selectedCommonPassengers.length, passenger);
                }else{
                    $(vm.selectedCommonPassengers).each(function(i,e){
                        if(vm.selectedCommonPassengers[i] !=null && passenger.passengerName == vm.selectedCommonPassengers[i].passengerName){
                            vm.selectedCommonPassengers.$remove(vm.selectedCommonPassengers[i]);
                        }
                        
                    });
                }
    
            },
            selectSearchPassenger:function(index,passenger){
                //添加搜索的乘客
                if($("input:checkbox[name='searchPassenger']:eq("+index+")").is(":checked")){
                    vm.selectedSearchPassenger.$set(vm.selectedSearchPassenger.length,passenger);
                }else{
                    vm.selectedSearchPassenger.$remove(passenger);
                }

            },
            changeCertificate:function(employeeId){
                var certi = $("#passengercerti"+employeeId).val();
                $("#certiNo"+employeeId).text(certi);
            },
            setPassengers:function(){
                vm.outerPassenger.passengerNationality = $("#nationality").val();
                $(vm.selectedCommonPassengers).each(function(i,e){
                    vm.allPassengers.$set(vm.allPassengers.length,e);
                });
                $(vm.selectedSearchPassenger).each(function(i,e){
                    vm.allPassengers.$set(vm.allPassengers.length,e);
                });
                if(vm.outerPassenger.passengerName !="" && vm.outerPassenger.passengerClass !="" && vm.outerPassenger.passengerCertificates[0].certificateCode !="" && vm.outerPassenger.passengerCertificates[0].certificateType !="" && vm.outerPassenger.passengerPhone !=""){
                    vm.allPassengers.$set(vm.allPassengers.length,vm.outerPassenger);
                }               

                $('#passengerModel').modal('hide');

                if(vm.selectedSearchPassenger.length >0 || vm.outerPassenger.passengerName !=""){
                    var data = {};
                    var commonPassengers = [];
                    if(vm.selectedSearchPassenger.length >0){
                        commonPassengers = vm.selectedSearchPassenger;
                    }
                   
                    if(vm.outerPassenger.passengerName !=""){
                        commonPassengers.$set(commonPassengers.length,vm.outerPassenger);
                    }

                    data.commonPassengers = commonPassengers;
                    data.bookPerson = vm.selectedBookPerson;
                    $.ajax({
                        url: __ctx + "/itinerary/addPassenger",
                        contentType: "application/json",
                        data: JSON.stringify(data),
                        type : "POST",
                        datatype:"json",
                        error:function(data1){
                            alert(data1);
                        },
                        success:function(data){
                            if(!data.result){
                                toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                            }else{
                            	toastr.info(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});                         
                            }
                        }
                    });   
                }
                      
            },
            changeCertificateSelected:function(employeeId){
                var certi = $("#selected_passengercerti"+employeeId).val();
                $("#selected_certiNo"+employeeId).text(certi);
            },
            removePassenger:function(index,passenger){
                vm.allPassengers.$remove(passenger);
            },
            createItinerary:function(){                              

            	if(vm.selectedBookPerson == null || vm.selectedBookPerson.bookPersonName == undefined){
            		toastr.error("请先选择预订人！", "",{timeOut: 2000, positionClass: "toast-top-center"});
            		return;
            	}
            	if(vm.allPassengers.length == 0){
            		toastr.error("请添加乘客！", "",{timeOut: 2000, positionClass: "toast-top-center"});
            		return;
            	}
            	var data = {};
                data.bookPerson = vm.selectedBookPerson;
                data.passengers=vm.allPassengers;
                data.itineraryType = vm.itineraryType;
            	$.ajax({
                    url: __ctx + "/itinerary/createItinerary",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    type : "POST",
                    datatype:"json",
                    error:function(data1){
                        alert(data1);
                    },
                    success:function(data){
                    	if(!data.result){
                    		toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                    	}else{
                    		window.location.href =  __ctx + 'itinerary/addProduct?itineraryId=' + data.obj;                   		
                    	}
                    }
                });
            },
            deleteCommonPassenger:function(){
            	if(vm.selectedCommonPassengers.length > 0){
            		var data = {};
                    var commonPassengers = [];
                    
                    commonPassengers = vm.selectedCommonPassengers;                  

                    data.commonPassengers = commonPassengers;
                    data.bookPerson = vm.selectedBookPerson;
                    $.ajax({
                        url: __ctx + "/itinerary/deletePassenger",
                        contentType: "application/json",
                        data: JSON.stringify(data),
                        type : "POST",
                        datatype:"json",
                        error:function(data1){
                            alert(data1);
                        },
                        success:function(data){
                            if(!data.result){
                                toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                            }else{
                            	toastr.info(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});                        
                            }
                        }
                    });
            	}
            },
            toManualBook:function(){
                if(vm.selectedBookPerson == null || vm.selectedBookPerson.bookPersonName == undefined){
                    toastr.error("请先选择预订人！", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if(vm.allPassengers.length == 0){
                    toastr.error("请添加乘客！", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                var data = {};
                data.bookPerson = vm.selectedBookPerson;
                data.passengers=vm.allPassengers;
                data.itineraryType = vm.itineraryType;
                // $.ajax({
                //     url: __ctx + "/flightManualOrder/flightManualBook",
                //     contentType: "application/json",
                //     data: JSON.stringify(data),
                //     type : "POST",
                //     datatype:"json",
                //     error:function(data1){
                //         alert(data1);
                //     },
                //     success:function(data){
                        
                //     }
                // });
                //$.post(__ctx + "/flightManualOrder/flightManualBook", {'bookPersonAndPassengersDTO':JSON.stringify(data)});
                // $.post(
                //     url:__ctx + "/flightManualOrder/flightManualBook",
                //     data:JSON.stringify(data),                   
                //     type:'json');
                // $.post(
                //     url:__ctx + "/flightManualOrder/flightManualBook",
                //     data:JSON.stringify(data),
                //     function(msg){
                //         // 这里是请求发送成功后的回调函数。
                //         // msg是返回的数据，数据类型在type参数里定义！
                //     },
                //     type:'json'
                // );
                var action = __ctx + "/flightManualOrder/flightManualBook";
                var form = $("<form></form>");
                form.attr('action',action)
                form.attr('method','post')
                var input = $("<input type='text' id='bookdate' name='bookPersonAndPassengersDTOStr'/>");
                form.append(input);
                form.appendTo("body")
                form.css('display','none');
                $("#bookdate").val(JSON.stringify(data));
                form.submit();
            }

        }
    })
    
    var getPassengers = function(parms){
        $.ajax({
            url: __ctx + "/itinerary/getPassengersByCondition",
            data: parms,
            type : "POST",
            datatype:"json",
            error:function(data1){
                alert(data1);
            },
            success:function(data){
                vm.searchPassengerList = data;
            }
        });
    }

    var getCommonPassengers = function(parms){
        $.ajax({
            url: __ctx + "/itinerary/getCommonPassengers",
            data: {
            	employeeId:parms.bookPersonEmployeeId
            },
            type : "POST",
            datatype:"json",
            error:function(data1){
                alert(data1);
            },
            success:function(data){
                vm.commonPassengers = data;
                var array1 = vm.commonPassengers.data;
                for(var i = 0;i<array1.length;i++){
                    var arry=[];
                    var arry2 = array1[i].data;        
                    for(var j=0;j<arry2.length;j++){
                        arry.$set(j,false);
                     }
                     vm.isChecked.$set(i,arry);
                }
            }
        });

    }

    var searchPerson = function(parms){
        $.ajax({
            url: __ctx + "/itinerary/searchBookPerson",
            data: parms,
            type : "POST",
            datatype:"json",
            error:function(data1){
                alert(data1);
            },
            success:function(data){
                vm.bookPersonList = data;
            }
        });

    }
    
    var loadCompanysData = function() {
        $.ajax({
            url: __ctx + "/itinerary/companys",
            //data: parms,
            type : "POST",
            datatype:"json", 
            error:function(data1){
                alert(data1);
            },
            success:function(data){
            	vm.companys = data;
                setCompanysData(data);
            	var flag = true;
            }
        });
    }
    loadCompanysData();

    var setCompanysData = function(data){
        $("#bookperson_company");
        $("#bookperson_company").empty();
        for(var i=0;i<data.length;i++) {
            var option = $("<option>").text(data[i].companyName).val(data[i].companyId);
            $("#bookperson_company").append(option);
        }
        $('#bookperson_company').editableSelect({ 
           bg_iframe: true,
           case_sensitive: true, // If set to true, the user has to type in an exact                                  // match for the item to get highlighted
           items_then_scroll: 10 ,// If there are more than 10 items, display a scrollbar
           isFilter:true //If set to true, the item will be filtered according to the matching criteria. 
    });
    }
    
})
