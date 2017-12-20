$(document).ready(function () {

    $('.boot_date').datetimepicker({
        minView: "hour", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd hh:ii", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true // 选择日期后自动关闭
    });
    var defaultConfig = {container: 'body'};
    var initShowModel=function(){
        window.setTimeout(function(){ 
        	initShareFlight();
            initStopSite();
//            initChangeFees();
            initServiceCharge();
            initRefundChangeSignInfos();
            
            $(changeFlightVM.changeflights).each(function (pindex, flight) {
            	$("#change-flight"+pindex).find(".tr-cabin:gt(1)").hide();
            	$("#detail-show"+pindex).on('click',function(){
    	            if($("#show-detail"+pindex).text()=='显示全部舱位'){
    	            	$("#change-flight"+pindex).find(".tr-cabin:gt(1)").slideDown(300);
    	                $("#show-detail"+pindex).text('收起');
    	            }else{
    	            	$("#change-flight"+pindex).find(".tr-cabin:gt(1)").slideUp(300);
    	                $("#show-detail"+pindex).text('显示全部舱位')
    	            }        
                })
                changeFlightVM.bookPnr[pindex]=false;
            })
            
        },100);
    }

    var genTrs = function (trs) {
        var html = '';
        _.forEach(trs, function (tds) {
            html += '<tr>';
            _.forEach(tds, function (val) {
                html += '<td style="min-width: 50px;">' + val + '</td>';
            });
            html += '</tr>';
        });
        return html;
    };

    var genTable = function (trs) {
        var template = '<table class="flightTipTable" style="margin:10px;border-collapse:separate;border-spacing:2px;"><tbody>';
        template += genTrs(trs);
        template += '</tbody></table>';
        return template;
    };

    var genTableTemplate = function (ths, trs) {
        var template = '<div><table class="table dataTable" style="background-color: #000"><thead><tr>';
        _.forEach(ths, function (val) {
            template += '<th>' + val + '</th>';
        });
        template += '</tr></thead><tbody>';
        template += genTrs(trs);
        template += '</tbody></table></div>';
        return template;
    };
    
    var initShareFlight=function(){
    	var vm = changeFlightVM;
    	$(vm.changeflights).each(function (index, flight) {
    		if (!flight) {
                return;
            }
            var template = genTableTemplate(['实际承运航班'], [
                [flight.shareFltCode + flight.shareFltNo]
            ]);

            $("#suggestShareFlights"+index).tooltip(_.assign(defaultConfig, {title: template, html: true}));            
    	});
    }
    
    //初始化经停
    var initStopSite=function(){
        var vm = changeFlightVM;
        var data = vm.changeSearchFlightData;
        $(vm.changeflights).each(function (index, flight) {
            if (!flight) {
                return;
            }
            var depDate = data.changeDate;
            var params = {
                airlineCode: flight.airlineCode,
                fltNo: flight.fltNo,
                depDate: depDate,
                startPort: flight.depPortCode,
                endPort: flight.arrPortCode
            };
            if (flight.isShareFlight == 'Y') {
                params.airlineCode = flight.shareFltCode;
                params.fltNo = flight.shareFltNo;
            }
            var baseUrl = __ctx + '/flights/';
            setTimeout(function () {
                $.getJSON(baseUrl + 'stopping/', params, function (data) {
                    vm.stoppings.$set(index, _.cloneDeep(data.obj));

                    var trs = _.map(data.obj, function (item) {
                        return [item.stopPort, item.stopArrTime, item.stopDepTime];
                    });
                    var template = genTableTemplate(['经停机场', '到达时间', '起飞时间'], trs);
                    $("#stoppings"+index).tooltip(_.assign(defaultConfig, {title: template, html: true}));
                });
            }, Math.ceil(Math.random() * (1000)));
        });
    }
    
    //初始改期费用
//    var initChangeFees = function(){
//        var vm = changeFlightVM;
//        var data = vm.changeSearchFlightData;
//        $(vm.changeflights).each(function (pindex, flight) {
//            if (!flight) {
//                return;
//            }
//            $(flight.cabins).each(function (cindex, cabin) {
//                var params = {
//                    airlineCode: flight.airlineCode,
//                    fltNo: flight.fltNo,
//                    depDate: data.changeDate,
//                    startPort: flight.depPortCode,
//                    endPort: flight.arrPortCode,
//                    cabinCode:cabin.flightData.cabinCode,
//                    baseCabinCode:cabin.flightData.baseCabinCode,
//                    baseCabinFare:cabin.flightData.baseCabinFare,
//                    fdFare:cabin.flightData.fdFare,
//                    fbc:cabin.flightData.fbc,
//                    discount:cabin.flightData.discount
//                };
//                setTimeout(function () {
//                $.getJSON(__ctx + '/flights/' + 'flightrefund', params, function (data) {
//                        var flightRefundResponseDTO = data.obj;
//                        vm.changeFee[pindex][cindex] = flightRefundResponseDTO.endorsePriceFromCustomer;
//                    });
//                }, Math.ceil(Math.random() * (1000)));
//             })   
//            
//         })   
//    }

    var getPolicyType = function(orderNo){
        var data = {orderNo: orderNo};
        var policyType = null;
        $.getJSON(__ctx + "/orderdetails/searchPassengerSegmentInfos", data, function (result) {
        	policyType = result.obj[0].flightSegmentInfos[0].policyType;
        });
        return policyType;
    }
    
    var getCompanyId = function(orderNo){
        var data = {orderNo: orderNo};
        var policyType = getPolicyType(orderNo);
        $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
            var companyId = result.obj.bookPersonDTO.bookCompanyId;
            getServiceCharge(companyId,policyType);
        });
    }

    var getServiceCharge=function(companyId,policyType){
        var VM = changeFlightVM;
        var serviceChargeData = {companyId:companyId,serviceType:3,policyType:policyType};                          
        $.getJSON(__ctx + "/servicefee/da", serviceChargeData, function (result) {
        	var tempServiceCharge = [[]];
            $(VM.changeflights).each(function (pindex, flight) {
//            	if(!VM.serviceCharge[pindex]){
//             	   VM.serviceCharge[pindex] = [];
//                 }
            	if(!tempServiceCharge[pindex]){
            		tempServiceCharge[pindex] = [];
                  }
                $(flight.cabins).each(function (cindex, cabin) {
                    if(result && result.obj && result.obj.chargeWay==2 && !VM.rescheduledType){
                    	tempServiceCharge[pindex].$set(cindex,result.obj.amount);
                    }else{
                    	tempServiceCharge[pindex].$set(cindex,0);
                    }                 
                })  
            })
            VM.serviceCharge = tempServiceCharge;
        });
    }

    var initServiceCharge = function(){
        var VM = changeFlightVM;
        var data = {orderOrApplyNo: VM.changeSearchFlightData.orderOrApplyNo,sourceType:VM.changeSearchFlightData.sourceType};
        if(data.sourceType == '1'){
            getCompanyId(data.orderOrApplyNo);
        }else{
            var data2 = {applyNo: VM.changeSearchFlightData.orderOrApplyNo}
            $.getJSON(__ctx + "/flights/change/detail", data2, function (result) {
                 var orderNo =  result.obj.flightChangeApplyDTO.orderNo;
                 getCompanyId(orderNo);  
            });
        }   
    }

    var initRefundChangeSignInfos=function(){
        var vm = changeFlightVM;
        var data = vm.changeSearchFlightData;
        var tempChangeFee = [[]];
        var tempUpgradeCost = [[]];
        $(vm.changeflights).each(function (pindex, flight) {
            if (!flight) {
                return;
            }
            if(!tempChangeFee[pindex]){
            	tempChangeFee[pindex] = [];
            }            
            if(!tempUpgradeCost[pindex]){
            	tempUpgradeCost[pindex] = [];
            }
            if(!vm.refundInfos[pindex]){
            	vm.refundInfos[pindex] = [];
            }
            if(!vm.changeInfos[pindex]){
            	vm.changeInfos[pindex] = [];
            }
            if(!vm.signInfos[pindex]){
            	vm.signInfos[pindex] = [];
            }
            
            $(flight.cabins).each(function (cindex, cabin) {
            	//vm.changeFee[pindex].$set(cindex,vm.changeSearchFlightData.changeFee);
            	tempChangeFee[pindex].$set(cindex,vm.changeSearchFlightData.changeFee);
                //vm.upgradeCost[pindex].$set(cindex,cabin.flightData.fare - vm.changeSearchFlightData.flightAmount);
            	if(vm.rescheduledType){
            		tempUpgradeCost[pindex].$set(cindex,0);
            	}else{
            		tempUpgradeCost[pindex].$set(cindex,cabin.flightData.fare - vm.changeSearchFlightData.flightAmount);
            		
            		var params = {
            				airlineCode: cabin.flightData.airlineCode,
            				fltNo: cabin.flightData.fltNo,
            				depDate: changeSearchFlightData.changeDate,
            				cabinCode: cabin.flightData.cabinCode,
            				baseCabinCode: cabin.flightData.baseCabinCode,
            				baseCabinFare: cabin.flightData.baseCabinFare,
            				fdFare: cabin.flightData.fdFare,
            				fbc: cabin.flightData.fbc,
            				discount: cabin.flightData.discount,
            				startPort: cabin.flightData.depPortCode,
            				endPort: cabin.flightData.arrPortCode,
            				depTime:cabin.flightData.depTime,
            				shareFltCode:cabin.flightData.shareFltCode,
            				shareFltNo:cabin.flightData.shareFltNo,
            				flightAmount: cabin.flightData.fare,
            				flightQueryResultKey: cabin.flightData.flightQueryResultKey,
            				flightInfoKey:cabin.flightData.flightInfoKey,
            				cabinInfoKey:cabin.flightData.cabinInfoKey,
            				orderOrApplyNo: vm.changeSearchFlightData.orderOrApplyNo,
            				sourceType:vm.changeSearchFlightData.sourceType,
            				priceType:cabin.flightData.isAgreeFare == 'Y'? '1':'0'
            		};
            		/*var baseUrl = __ctx + '/flights/';
                	var url = baseUrl + (cabin.flightData.isAgreeFare === 'Y' ? 'protocolrefund' : 'flightrefund');*/
            		
            		var refundChangeSignInfo = "";
            		$.ajax({
            			type: "POST",
            			contentType: "application/json",
            			url: __ctx + '/flights/refundChange',
            			async: true,
            			data: JSON.stringify(params),
            			dataType: "json",
            			success: function (data) {
            				if (!data.obj) {
            					return;
            				}
            				
            				var refundRule = '';
            				$(data.obj.refundRule).each(function (i, rule) {
            					refundRule += rule+';';
            				}) 
            				vm.refundInfos[pindex][cindex]=refundRule;
            				var changeRule = '';
            				$(data.obj.changeRule).each(function (i, rule) {
            					changeRule += rule+';';
            				})
            				vm.changeInfos[pindex][cindex]=changeRule;
            				vm.signInfos[pindex][cindex]=data.obj.signTransferRule;
            			}
            		});
            		
            	}

            });
        })
        vm.changeFee = tempChangeFee;
        vm.upgradeCost = tempUpgradeCost;
    }

    var changeFlightVM = new Vue({
        el: '#changeFlightVM',
        data: {
            changeSearchFlightData:changeSearchFlightData,
            changeflights:[],
            stoppings:[],
            sortType:'1',
            bookPnr:[],
            changeFee:[[]],
            upgradeCost:[[]],
            serviceCharge:[[]],
            refundInfos:[[]],
            changeInfos:[[]],
            signInfos:[[]],
            applyNo:'',
            customerShouldPay:'',
            tcOrderSerialid:'',
            airlines:[],
            airlinesCode:changeSearchFlightData.airCode,
            rescheduledType:changeSearchFlightData.rescheduledType == '1'?true:false
        },
        ready: function () {
        	if(this.rescheduledType){
                this.initAirLine();
            }else{
				this.initChangeFlights();
			}
        },
        methods: {
            initChangeFlights:function(){
                var VM = this;
                var data = VM.changeSearchFlightData;
                VM.sortType = '1';
                data.sortType = VM.sortType;
                if(VM.airlinesCode){
                	data.airCode = VM.airlinesCode;
                }else{
                	data.airCode = VM.changeSearchFlightData.airCode;
                }
                $.ajax({
                    url: __ctx + "/flights/change/queryFlights",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    type: "POST",
                    datatype: "json",
                    async: false,
                    error: function (data1) {
                        alert(data1);
                    },
                    success: function (data) {
                    	if(data.result){
                    		VM.changeflights = data.obj;
                    		if(!VM.changeflights || VM.changeflights.length==0){
                    			toastr.info("未查询到可改期的航班", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    		}
                    		initShowModel();                   
                    	}else{
                    		toastr.error("改期航班查询失败，请重试！", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    	}
                    }
                });
            },
            initAirLine:function(){
            	var vm = this;
                $.ajaxSettings.async = false;
                $.getJSON(__ctx + '/resource/getAllAirline', function (data) {
                	vm.airlines = data.obj;
                });
                vm.airlinesCode = vm.changeSearchFlightData.airCode;
            },
            showRefundChangeSignInfo:function(cabin,pindex,cindex){
                      var VM =this;
//                    var changeSearchFlightData = VM.changeSearchFlightData;
//                    var params = {
//                        airlineCode: cabin.flightData.airlineCode,
//                        fltNo: cabin.flightData.fltNo,
//                        depDate: changeSearchFlightData.changeDate,
//                        cabinCode: cabin.flightData.cabinCode,
//                        baseCabinCode: cabin.flightData.baseCabinCode,
//                        baseCabinFare: cabin.flightData.baseCabinFare,
//                        fdFare: cabin.flightData.fdFare,
//                        fbc: cabin.flightData.fbc,
//                        discount: cabin.flightData.discount,
//                        startPort: cabin.flightData.depPortCode,
//                        endPort: cabin.flightData.arrPortCode
//                    };
//                    var baseUrl = __ctx + '/flights/';
//                    var url = baseUrl + (cabin.flightData.isAgreeFare === 'Y' ? 'protocolrefund' : 'flightrefund');
//                    var refundChangeSignInfo = "";
//                    $.ajax({
//                        type: "POST",
//                        contentType: "application/json",
//                        url: url,
//                        async: false,
//                        data: JSON.stringify(params),
//                        dataType: "json",
//                        success: function (data) {
//                            if (!data.obj) {
//                                return;
//                            }
//                            var refundRules = _.map(data.obj.refundRule, function (val) {
//                                return ['&nbsp;', val];
//                            });
//                            var changeRules = _.map(data.obj.changeRule, function (val) {
//                                return ['&nbsp;', val];
//                            });
//                            if (!refundRules[0]) {
//                                return;
//                            }
//                            refundRules[0][0] = '退票：';
//                            changeRules[0][0] = '改期：';
//                            refundChangeSignInfo = genTable(refundRules.concat(changeRules).concat([['签转：', data.obj.signTransferRule]]));       
//                        }
//                    });
                    var refundInfo = VM.refundInfos[pindex][cindex].split(';');
                    var refundRules = _.map(refundInfo, function (val) {
                      return ['&nbsp;', val];
                    });
                    var changeInfo = VM.changeInfos[pindex][cindex].split(';');
                    var changeRules = _.map(changeInfo, function (val) {
                	  return ['&nbsp;', val];
                    });
                    refundRules[0][0] = '退票：';
                    changeRules[0][0] = '改期：';
                    refundChangeSignInfo = genTable(refundRules.concat(changeRules).concat([['签转：', VM.signInfos[pindex][cindex]]]));
                    var option={
                            template:"<div class='popover' role='tooltip' style='max-width: 600px;'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content' style='padding:0px;'></div></div>",
                            content:refundChangeSignInfo,
                            container:'body',
                            html:true
                        }

                    $('#testButtton'+pindex+cindex).popover(option).popover('show');

                },
                sortChangeFlights:function(sortType){
                    var VM = this;
                    if(sortType == '1'){
                    	VM.changeflights.sort(compare("lowestFare"));
                    }else
                	if(sortType == '2'){
                		VM.changeflights.sort(compare1("depDate","depTime"));
                    }else
                    if(sortType == '3'){
                    	VM.changeflights.sort(compareBy1("depDate","arrTime","isNextDayFlag","nextDate"));
                    }else
                    if(sortType == '4'){
                    	VM.changeflights.sort(compareBy2("depDate","arrTime","depTime","isNextDayFlag","nextDate"));
                    }
                    
                    VM.sortType = sortType;
                    //VM.initChangeFlights();
                },
                changeBook:function(cabin,pindex,cindex){
                    var ex = /^\d+$/;
                    var data = {};
                    data.changeSearchFlightData = this.changeSearchFlightData;
                    data.cabin = cabin;
                    data.bookPnr = this.bookPnr[pindex];
                    data.changeFee = this.changeFee[pindex][cindex];
                    data.upgradeCost = this.upgradeCost[pindex][cindex];
                    data.serviceCharge = this.serviceCharge[pindex][cindex];
                    data.refundInfo = this.refundInfos[pindex][cindex];
                    data.changeInfo = this.changeInfos[pindex][cindex];
                    data.signInfo = this.signInfos[pindex][cindex];
                    if (data.changeFee===null || data.changeFee===""  || data.changeFee<0 || !ex.test(data.changeFee)) {                       
                        toastr.error("请输入合法的改期费!", "", toastrConfig);
                        return;
                    }
                    if (data.upgradeCost ===null || data.upgradeCost==="" || data.upgradeCost<0 || !ex.test(data.upgradeCost)) {                       
                        toastr.error("请输入合法的升舱费!", "", toastrConfig);
                        return;
                    }
                    if (data.serviceCharge ===null || data.serviceCharge==="" || data.serviceCharge<0 || !ex.test(data.serviceCharge)) {                       
                        toastr.error("请输入合法的服务费!", "", toastrConfig);
                        return;
                    }
                    if (data.serviceCharge>100) {                       
                        toastr.error("服务费不能超过100!", "", toastrConfig);
                        return;
                    }
                    var url=__ctx + '/flights/'+'creatChangeApply';
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: url,
                        data: JSON.stringify(data),
                        dataType: "json",
                        success: function (data) {
                            if(data.result){
                            	console.log(JSON.stringify(data));
                            	if('1' == data.obj.changeFlag){
                            		changeFlightVM.applyNo=data.obj.applyNo;
                            		changeFlightVM.customerShouldPay=data.obj.customerShouldPay;
                            		changeFlightVM.tcOrderSerialid=data.obj.tcOrderSerialid;
                            		$('#changeException').text("您输入的改期费用小于供应商返回的改期费用，请确认是否提交？");
                            		$('#dealModal').modal({ backdrop: 'static'});
	                        		$('#dealModal').modal('show');
                            	}else{
                            		toastr.success("改期单创建成功, 2秒后跳转到改期单详情页", "", toastrConfig);
                            		setTimeout(function () {
                            			window.location.href=__ctx+"/flights/changes/"+data.obj.applyNo;
                            		}, 2000);
                            	}
                            }else{
                            	toastr.error(data.message, "", toastrConfig);
                            }
                        }
                    }); 
                },
                dealChangeException:function(flag){
                	if('Y' == flag){
                		var info = {};
                		info.applyNo=changeFlightVM.applyNo;
                		info.customerShouldPay=changeFlightVM.customerShouldPay;
                		info.tcOrderSerialid=changeFlightVM.tcOrderSerialid;
                		$.ajax({
                            type: "POST",
                            contentType: "application/json",
                            url: __ctx + '/flights'+'/dealDistributionTicket',
                            data: JSON.stringify(info),
                            dataType: "json",
                            success: function (data) {
                            	if(data.result){
                            		toastr.success("改期单创建成功,"+data.message+",2秒后跳转到改期单详情页", "", toastrConfig);
                                	setTimeout(function () {window.location.href=__ctx+"/flights/changes/"+changeFlightVM.applyNo;}, 2000);
                            	}else{
                            		toastr.error(data.message, "", toastrConfig);
                            	}
                            }
                		});
                	}else{
                		$.post(__ctx + "/flights/change/" + changeFlightVM.applyNo + "/cancelChangeOrder", function (data) {
                			console.log(JSON.stringify(data));
                			//留在本页
                			$('#dealModal').modal('hide');
                        });
                	}
                }
        },
        events: {
            'changeCompany': function(param) {
            	this.initChangeFlights();
        	}
        }
    });

    changeFlightVM.$watch("bookPnr",function(bookPnr){
        
    })
   
    function compare(propertyName) {
	    return function(object1, object2) {
	      var value1 = object1[propertyName];
	      var value2 = object2[propertyName];
	      if (value2 < value1) {
	        return 1;
	      } else if (value2 > value1) {
	        return -1;
	      } else {
	        return 0;
	      }
	    }
  }
    function compare1(propertyName1,propertyName2) {
	    return function(object1, object2) {
	      var value1 = new Date(object1[propertyName1] + " " + object1[propertyName2]).getTime();
	      var value2 = new Date(object2[propertyName1] + " " + object2[propertyName2]).getTime();
	      if (value2 < value1) {
	        return 1;
	      } else if (value2 > value1) {
	        return -1;
	      } else {
	        return 0;
	      }
	    }
  }
    function compareBy1(propertyName1,propertyName2,propertyName3,propertyName4) {
	    return function(object1, object2) {
	    	var date1 = '';
	    	if(object1[propertyName3]){
	    		date1 = object1[propertyName4];
	    	}else{
	    		date1 = object1[propertyName1] + " " +  object1[propertyName2];
	    	}
	    	var date2 = '';
	    	if(object2[propertyName3]){
	    		date2 = object2[propertyName4];
	    	}else{
	    		date2 = object2[propertyName1] + " " +  object2[propertyName2];
	    	}
	    	
	      var value1 = new Date(date1).getTime();
	      var value2 = new Date(date2).getTime();
	      if (value2 < value1) {
	        return 1;
	      } else if (value2 > value1) {
	        return -1;
	      } else {
	        return 0;
	      }
	    }
  }
    function compareBy2(propertyName1,propertyName2,propertyName3,propertyName4,propertyName5) {
	    return function(object1, object2) {
	    	var date1 = '';
	    	if(object1[propertyName4]){
	    		date1 = object1[propertyName5];
	    	}else{
	    		date1 = object1[propertyName1] + " " +  object1[propertyName2];
	    	}
	    	var date2 = '';
	    	if(object2[propertyName4]){
	    		date2 = object2[propertyName5];
	    	}else{
	    		date2 = object2[propertyName1] + " " +  object2[propertyName2];
	    	}
	    	
	      var value1 = new Date(date1).getTime() - new Date(object1[propertyName1] + " " +  object1[propertyName3]).getTime();
	      var value2 = new Date(date2).getTime() - new Date(object2[propertyName1] + " " +  object2[propertyName3]).getTime();
	      if (value2 < value1) {
	        return 1;
	      } else if (value2 > value1) {
	        return -1;
	      } else {
	        return 0;
	      }
	    }
  }
});