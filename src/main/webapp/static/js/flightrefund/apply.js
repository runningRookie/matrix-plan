$(document).ready(function () {

    var initDatePicker = function () {
        $('.dateInputPicker').datetimepicker({
            minView: "month", // 选择日期后，不会再跳转去选择时分秒
            format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
            language: 'zh-CN', // 汉化
            autoclose: true // 选择日期后自动关闭
        });

        $('.timeInputPicker').datetimepicker({
            startView: 'hour',
            maxView: "hour", // 选择日期后，不会再跳转去选择时分秒
            format: "hh:ii", // 选择日期后，文本框显示的日期格式
            language: 'zh-CN', // 汉化
            autoclose: true // 选择日期后自动关闭
        });
    };

    var refundchangesignVM = new Vue({
        el: '#refundchangesignVM',
        data: {           
            refundChangeSign:{},
            segments:[]           
        },
        methods: {}
    });

    var refundAmountVM = new Vue({
        el: '#refundAmountVM',
        data: {
            refundType:0,
            segmentInfos:[],
            passengerSegments:[],
            fileUrls:[],
            images: [],
            imgNames: [],
            fileValue:[]
    
        },
        ready: function () {
            
        },
        methods:{
            calculate:function(pIndex,index){               
                var e= this.segmentInfos[pIndex].flightSegmentInfos[index];
                var refundItem = this.passengerSegments[pIndex].refundItems[index].refundItem;
                if(refundItem.refundFee == '' || refundItem.refundFee == null){
                    refundItem.refundFee = 0;
                }
                if(refundItem.serviceCharge == '' || refundItem.serviceCharge == null){
                    refundItem.serviceCharge = 0;
                }
                if(refundItem.plusPrice == '' || refundItem.plusPrice == null){
                    refundItem.plusPrice = 0;
                }
                if(refundItem.refundSupplierAmount == '' || refundItem.refundSupplierAmount == null){
                    refundItem.refundSupplierAmount = 0;
                }
                this.passengerSegments[pIndex].refundItems[index].refundItem.refundAmount = (parseFloat(parseFloat(e.flightAmount)+parseFloat(e.capitalCost)+parseFloat(e.fuelCost)+parseFloat(e.plusPrice))-parseFloat(parseFloat(refundItem.refundFee)+parseFloat(refundItem.serviceCharge)+parseFloat(refundItem.plusPrice))).toFixed(2);
            },
            
            
            
            addPic(e){
                e.preventDefault();
                $('input[type=file]').trigger('click');
                return false;
            },
            onFileChange(e) {
                var files = e.target.files || e.dataTransfer.files;
                if(files.length>=10){
                    toastr.error("最多只能上传9张图片!","", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    
                    return;
                }

                var flag = true;
                _.forEach(files, function (file) {
                    var fileName=file.name;
                    var extStart = fileName.lastIndexOf(".") + 1;
                     var ext = fileName.substring(extStart, fileName.length).toLowerCase();
                     if (ext != "bmp" && ext != "png" && ext != "gif" && ext != "jpeg" && ext != "jpg" ){
                         flag = false;
                         return false;
                    }
                });
                if(!flag){
                    toastr.error("图片类型必须是.gif,jpeg,jpg,png,bmp中的一种!","", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });  
                    $('input[type=file]').val('');
                    return;
                }
                
                var imageslen = refundAmountVM.images.length;
                var originLength = refundAmountVM.fileUrls.length;
                var newFileLen = files.length;
                var totalFileLen = newFileLen + imageslen + originLength;
                
                
                var imageslen=refundAmountVM.images.length;
                var newFileLen=files.length;
                var totalFileLen =newFileLen+imageslen;
                if(totalFileLen>=10){
                    toastr.error("最多只能上传9张图片!","", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    
                    return;
                }
                
                
                if (!files.length)return; 
                $(files).each(function (i, e) {
                    refundAmountVM.fileValue.push(e);
                });
                this.createImage(files);
            },
            createImage(file) {
              if(typeof FileReader==='undefined'){
                  alert('您的浏览器不支持图片上传，请升级您的浏览器');
                  return false;
              }
              for (var i = 0; i < file.length; i++) {
                  var filesize = file[i].size;
                  if (filesize > 10  * 1024 * 1024) {
                    toastr.error("仅允许10M以内文件,文件："+file[i].name+"，大小超过限制", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return;
                  };
                };
              var image = new Image();
              var vm = this;
              var leng=file.length;
              for(var i=0;i<leng;i++){
                  var name = file[i].name;
                  vm.imgNames.push(name);
                  
                  var reader = new FileReader();
                  reader.readAsDataURL(file[i]);
                  reader.onload =function(e){
                      vm.images.push(e.target.result);
                  };
              }
            $('input[type=file]').val('');
            },
            delImage:function(index){
                  this.images.splice(index,1);
                  this.imgNames.splice(index,1);
                  this.fileValue.splice(index, 1);
                },
 
            uploadImage : function(){
                
                if(this.fileValue.length==0){
                    toastr.error("请先选择图片!","", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    
                    return;
                    
                }

                var formData = new FormData();
                for (var i=0;i<this.fileValue.length;i++) {
                  formData.append('files', this.fileValue[i]);
                };

                $.ajax({
                    type: "POST",
                    url: __ctx + "/flights/refund/upload",
                    contentType: false,    // 这个一定要写
                      processData: false,    // 这个也一定要写，不然会报错
                      data: formData,
                    dataType: "json",
                    success: function(result) {
                        if(result.result){
                            toastr.success("图片上传成功！", "",{
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                            refundAmountVM.fileUrls=[];
                            var leng = result.obj.length;
                                if (leng > 0) {
                                    for (var i = 0; i < leng; i++) {
                                        var url = result.obj[i].fileUrl;
                                        refundAmountVM.fileUrls.push(url);
                                    }
                                } 
                              }
                            }
                          });
                     },
                     
                   enlargeImage:function(index){
                       window.open(index); 
                   }
                     
                     

        }
    });
    
    var refundButtonVM = new Vue({
        el: '#refundButtonVM',
        data: {
            buttonType:"",
            pnrCancelAble : false
        },
        ready: function () {
            
        },
        methods:{
            submitWait:function(){
                refundButtonVM.buttonType='2';
                refundButtonVM.toConfirmPage();
                
            },
            saveApply:function(){
                refundButtonVM.buttonType='1';
                refundButtonVM.toConfirmPage();
            },

            
            
            toConfirmPage:function(){
                var flightRefundApplyItems = [];
                $(refundAmountVM.passengerSegments).each(function(i,e){
                    $(e.refundItems).each(function(i,e){
                        flightRefundApplyItems.$set(flightRefundApplyItems.length,e.refundItem);
                    })  
                })
                if(flightRefundApplyItems.length == 0){
                 toastr.error("请先选择乘客", "", toastrConfig);
                 return;
                }
                if(refundAmountVM.refundType == '0'){
                    $("#refundTypeText").text("自愿退票");
                }else{
                    $("#refundTypeText").text("非自愿退票");
                }

                var indexArry = [];                
                $(refundAmountVM.segmentInfos).each(function(i,e){
                    $(e.flightSegmentInfos).each(function(i,e){
                        if($.inArray(e.flightIndex, indexArry) == -1){
                            indexArry.$set(indexArry.length,e.flightIndex);
                        }
                    });
                });
                var flightStr = '';
                $(refundchangesignVM.segments).each(function(i,e){
                    if($.inArray(i, indexArry) != -1){
                        flightStr += refundchangesignVM.segments[i].planBeginDate +" "+ refundchangesignVM.segments[i].startCityName+"飞"+refundchangesignVM.segments[i].endCityName;
                    }
                });
                $("#flightText").text(flightStr);
                $("#passengerNumText").text(refundAmountVM.segmentInfos.length);
                var nameStr = "";
                $(refundAmountVM.segmentInfos).each(function(i,e){
                    nameStr += e.passenger.passengerName;
                    if((i+1)!=refundAmountVM.segmentInfos.length){
                        nameStr +=",";
                    }
                });
                $("#passengersNameText").text(nameStr);
                var totalFee = 0;
                var totalPlus = 0;
                var totalServiceCharge = 0;
                var totalRefundAmount = 0;
                $(refundAmountVM.passengerSegments).each(function(i,e){
                    $(e.refundItems).each(function(i,e){
                        totalFee +=parseFloat(e.refundItem.refundFee);
                        totalPlus +=parseFloat(e.refundItem.plusPrice);
                        totalServiceCharge +=parseFloat(e.refundItem.serviceCharge);
                        totalRefundAmount +=parseFloat(e.refundItem.refundAmount);
                    });
                });
                totalFee = totalFee.toFixed(2);
                totalPlus = totalPlus.toFixed(2);
                totalServiceCharge = totalServiceCharge.toFixed(2);
                totalRefundAmount = totalRefundAmount.toFixed(2);
                $("#totalFeeText").text(totalFee);
                $("#totalPlusText").text(totalPlus);
                $("#allFeeText").text(parseFloat(totalFee)+parseFloat(totalPlus));
                $("#totalServiceText").text(totalServiceCharge);
                $("#totalAmountText").text(totalRefundAmount);
                
                var ids = '';
                $(refundAmountVM.segmentInfos).each(function(i,e){
                    $(e.flightSegmentInfos).each(function(j,e2){
                        ids +=e2.id;
                        ids +=",";
                    });
                });
                
                $.ajax({
                    type: "POST",
                    url: __ctx + "/flights/checkRefundApply",
                    dataType: "json",
                    data: {
                        ids:ids
                    },
                    async: false,
                    success: function (data) {
                        if (!data.result) {
                            toastr.error(data.message, "", {timeOut: 1000, positionClass: "toast-top-center"});
                            return;
                        }else{
                            //校验
                            var reg=/^(([0-9]*)|(([0]\.\d{1,2}|[0-9]*\.\d{1,2})))$/;
                            //循环的乘客
                            for(var i=0;i<refundAmountVM.segmentInfos.length;i++){
                                var passenger=refundAmountVM.segmentInfos[i];
                                var passengerSegments=refundAmountVM.passengerSegments[i];
                                //循环航段
                                for(var j=0;j<passenger.flightSegmentInfos.length;j++){
                                    var segmentInfo=passenger.flightSegmentInfos[j];
                                    var refundItem1=passengerSegments.refundItems[j];
                                    //销售价
                                    var flightAmount = segmentInfo.flightAmount;
                                    //基建费
                                    var fuelCost = segmentInfo.fuelCost;
                                    //燃油费
                                    var plusPrice = segmentInfo.plusPrice;
                                    
                                    //退票手续费
                                    var refundFee = refundItem1.refundItem.refundFee;
                                    //退票服务费
                                    var serviceCharge = refundItem1.refundItem.serviceCharge;
                                    //应退客人金额
                                    var refundAmount = refundItem1.refundItem.refundAmount;
                                    //应付供应商退票费
                                    var refundSupplierAmount = refundItem1.refundItem.refundSupplierAmount;
                                    
                                    //判断销售价是否大于退票手续费
                                    if(flightAmount-refundFee<0){
                                        toastr.error("退票手续费大于销售价！", "", {
                                            timeOut : 2000,
                                            positionClass : "toast-top-center"
                                        });
                                        return false;
                                    }
                                    //退票服务费不为负
                                    if(!reg.test(serviceCharge)){
                                        toastr.error("退票服务费不为负！", "", {
                                            timeOut : 2000,
                                            positionClass : "toast-top-center"
                                        });
                                        return false;
                                    }
                                    //应退客人金额>=基建+燃油
                                    if(refundAmount-fuelCost-plusPrice<0){
                                        toastr.error("基建费和燃油费之和大于应退客人金额！", "", {
                                            timeOut : 2000,
                                            positionClass : "toast-top-center"
                                        });
                                        return false;
                                    }
                                    //应付供应商退票费<=销售介+基建燃油
                                    if(refundSupplierAmount-flightAmount-fuelCost-plusPrice>0){
                                        toastr.error("应付供应商退票费大于销售价、基建费和燃油费之和！", "", {
                                            timeOut : 2000,
                                            positionClass : "toast-top-center"
                                        });
                                        return false;
                                    }
                                }
                            }
                            $("#confirmRefundInfo").modal({
                                show : true,
                            //   remote : __ctx + "/itinerary/bookpersonlist",
                                backdrop : 'static'
                            });
                        }
                    },
                    error: function () {
                        toastr.error("网络出现问题，请稍后再试", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    }
                });
                
            
            },
            createRefundApply:function(){
                var refundSaveDTO = {};
                var flightRefundApplyDTO = {};
                flightRefundApplyDTO.refundType = refundAmountVM.refundType;
                flightRefundApplyDTO.orderNo = window.orderNo;
                var pnr = tc.flight.refund.pnr();
                flightRefundApplyDTO.pnr = pnr;
                flightRefundApplyDTO.buttonType=refundButtonVM.buttonType;//按钮类型
                var passengerNames = "";
        		var passengerPhones = "";
                var ticketNos = "";
                $(refundAmountVM.segmentInfos).each(function(i,e){
                    passengerNames = passengerNames+e.passenger.passengerName+",";
        			passengerPhones = passengerPhones+e.passenger.passengerPhone+",";
                    ticketNos = ticketNos+e.flightTicketDTO.ticketNo+",";
                });
                passengerNames = passengerNames.substring(0,passengerNames.length-1);
        		passengerPhones = passengerPhones.substring(0,passengerPhones.length-1);
                ticketNos = ticketNos.substring(0,ticketNos.length-1);
                flightRefundApplyDTO.passengerNames = passengerNames;
        		flightRefundApplyDTO.passengerPhones = passengerPhones;
                flightRefundApplyDTO.ticketNos = ticketNos;

                var passengerSegmentItems = refundAmountVM.segmentInfos;

                var flightRefundApplyItems = [];
                $(refundAmountVM.passengerSegments).each(function(i,e){
                    $(e.refundItems).each(function(i,e){
                        flightRefundApplyItems.$set(flightRefundApplyItems.length,e.refundItem);
                    })  
                })

                 refundSaveDTO.flightRefundApplyDTO = flightRefundApplyDTO;
                 refundSaveDTO.passengerSegmentItems = passengerSegmentItems;
                 refundSaveDTO.flightRefundApplyItems = flightRefundApplyItems;
                 
                 if(refundSaveDTO.flightRefundApplyDTO == null){
                     toastr.error("参数错误", "", toastrConfig);
                     return;
                 }
                
                 if(refundSaveDTO.flightRefundApplyItems.length == 0){
                     toastr.error("请先选择乘客", "", toastrConfig);
                     return;
                 }
        		 
                 
                 //图片上传
                 var flightRefundPictureDTO={};
                 flightRefundPictureDTO.jsonUrl=refundAmountVM.fileUrls;
                 flightRefundPictureDTO.url="";
                 flightRefundPictureDTO.pictureName="";
                 flightRefundPictureDTO.remark="";
                 refundSaveDTO.flightRefundPictureDTO=flightRefundPictureDTO;
                 
                if('2' == refundButtonVM.buttonType){
                    this.cancelPnr(refundSaveDTO);
                    if(!refundButtonVM.pnrCancelAble){
                        toastr.error("请手动取消pnr", "", {timeOut: 2000, positionClass: "toast-top-center"});
                        setTimeout(function () {refundButtonVM.createRefundApplyAfter(refundSaveDTO)}, 2000);
                    }else{
                        this.createRefundApplyAfter(refundSaveDTO);
                    }
                } else {
                    this.createRefundApplyAfter(refundSaveDTO);
                }
            },
            createRefundApplyAfter:function(refundSaveDTO){
                $.ajax({
                     type: "POST",
                     contentType: "application/json",
                     url: __ctx + '/flights/createRefundApply',
                     data: JSON.stringify(refundSaveDTO),
                     dataType: "json",
                     success: function (data) {
                         if (!data.result) {
                             toastr.error("申请失败", "", toastrConfig);
                             return;
                         }
                         toastr.success("申请成功", "", toastrConfig);
                         window.location.href =  __ctx + '/flights/refundDetail?applyNo=' + data.obj;
                     }
                 });
            },
            toggleLogs: function () {
                tc.flight.change.toggleLogs();
            },
            cancelPnr: function (refundSaveDTO) {
                var CancelPnrRequestDTO = {};
                CancelPnrRequestDTO.pnr = tc.flight.refund.pnr();
                CancelPnrRequestDTO.orderOrChangeNo = window.orderNo;
                CancelPnrRequestDTO.sourceType = window.sourceType;
                CancelPnrRequestDTO.refundSaveDTO = refundSaveDTO;
                CancelPnrRequestDTO.buttonType = "2";
                if(!CancelPnrRequestDTO.pnr){
                    return false;
                }
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + '/flights/refund/cancelPnr',
                    data: JSON.stringify(CancelPnrRequestDTO),
                    dataType: "json",
                    async : false,
                    success: function (data) {
                        refundButtonVM.pnrCancelAble = data.result;
                    }
                });
            }
        }
    });

    tc.flight.change.segments(function (segmentInfos,refundFee,serviceCharge) {
        refundAmountVM.segmentInfos = _.cloneDeep(segmentInfos);
        refundAmountVM.passengerSegments = [];
        $(refundAmountVM.segmentInfos).each(function(i,e){
            var passengerSegment = {};
            passengerSegment.passenger = e.passenger;
            var refundItems = [];
            $(e.flightSegmentInfos).each(function(i,e){
                var segmentRefundItem = {};
                segmentRefundItem.flightSegmentInfo = e;
                
                var refundItem = {};
                refundItem.flightSegmentInfoId = e.id;
                refundItem.refundFee = 0;
                refundItem.refundFee = refundFee;
                refundItem.serviceCharge = 0;
                refundItem.serviceCharge = serviceCharge;
                refundItem.plusPrice = 0;
                refundItem.refundAmount = 0;
                refundItem.refundAmount = (parseFloat(parseFloat(e.flightAmount)+parseFloat(e.capitalCost)+parseFloat(e.fuelCost)+parseFloat(e.plusPrice))-parseFloat(parseFloat(refundItem.refundFee)+parseFloat(refundItem.serviceCharge)+parseFloat(refundItem.plusPrice))).toFixed(2);
                refundItem.refundSupplierActualAmount = 0;
                refundItem.refundSupplierAmount = 0;
                segmentRefundItem.refundItem = refundItem;
                refundItems.$set(refundItems.length,segmentRefundItem);
            });
            passengerSegment.refundItems = refundItems;
            refundAmountVM.passengerSegments.$set(refundAmountVM.passengerSegments.length,passengerSegment);                                          
        });
//        newPoundagesVM.old.segmentInfos = _.cloneDeep(segmentInfos);
    }, function (segments) {
        refundchangesignVM.segments = segments;
        setTimeout(initDatePicker, 500);
    }, function(refundChangeSign){
        refundchangesignVM.refundChangeSign = _.cloneDeep(refundChangeSign);
    });

});