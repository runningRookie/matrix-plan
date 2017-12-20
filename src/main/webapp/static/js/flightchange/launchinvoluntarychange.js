$(document).ready(function () {

    $('.boot_date').datetimepicker({
        minView: "month", // 选择日期后，不会再跳转去选择时分秒
        format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
        language: 'zh-CN', // 汉化
        autoclose: true, // 选择日期后自动关闭
        startDate: new Date()
    });

    /*var getChangeFee = function(sourceType){
    	var VM　= involuntaryChangeVM;
    	var cabin;
    	var depDate = moment(VM.segments[0].planBeginDate).format("YYYY-MM-DD");
    	var depTime = moment(VM.segments[0].planBeginDate).format("HH:mm");
    	$.ajax({
            type: "POST",
            url: __ctx + '/resource/getAirCabin',
            async: false,
            data: {
            	cabinCode:VM.passengers[0].flightSegmentInfos[0].seatCode,
            	airWaysCode:VM.segments[0].airlineCompanyCode
            },
            dataType: "json",
            success: function (data) {
                if (!data) {
                    return;
                }
                cabin =  data;     
            }
        });
    	
    	var params = {
                airlineCode: VM.segments[0].airlineCompanyCode,
                fltNo: VM.segments[0].flightNo,
                depDate: depDate,
                cabinCode: VM.passengers[0].flightSegmentInfos[0].seatCode,
                baseCabinCode: cabin.accBaseCabinCode,
                baseCabinFare: VM.passengers[0].flightSegmentInfos[0].sameSeatClassAmount,
                fdFare: VM.passengers[0].flightSegmentInfos[0].currentWindowOpenPrice,
                fbc: VM.passengers[0].flightSegmentInfos[0].fbc,
                discount: VM.passengers[0].flightSegmentInfos[0].flightDiscount,
                startPort: VM.segments[0].startPortCode,
                endPort: VM.segments[0].endPortCode,
                depTime:depTime,
                shareFltCode:VM.segments[0].carrierFlightCompanyCode,
                shareFltNo:VM.segments[0].carrierFlightNo,
                useOldFd:true,
                flightAmount: VM.passengers[0].flightSegmentInfos[0].flightAmount,
                orderOrApplyNo: window.orderOrApplyNo,
                sourceType:window.sourceType,
                priceType:VM.passengers[0].flightSegmentInfos[0].priceType,
                passengerClass:VM.passengers[0].passenger.passengerClass
            };
    	*/
    	
        /*var baseUrl = __ctx + '/flights/';
        var url = baseUrl + (VM.passengers[0].flightSegmentInfos[0].priceType === '1' ? 'protocolrefund' : 'flightrefund');*/
    	
    	/*$.ajax({
            type: "POST",
            contentType: "application/json",
            url:  __ctx + '/flights/refundChange',
            data: JSON.stringify(params),
            dataType: "json",
            success: function (data) {
                if (!data.obj) {
                    return;
                }
                VM.changeFee = data.obj.endorsePriceFromCustomer;
            }
        });
    }*/
    
    var involuntaryChangeVM = new Vue({
        el: '#involuntaryChangeVM',
        data: {
            orderOrApplyNo: window.orderOrApplyNo,
            sourceType:window.sourceType,
            segments:[],
            passengers:[],
            order:{},
            flightChangeApplyDetail:{},
            segmentInfoIds:[],
            changeDate:"",
            paymentType:"",
            flag:false,
            changeFee:0,
            freeChangeFlag:"",
            fileUrls:[],
            images: [],
            imgNames: [],
            fileValue:[],
            changeable:true
        },
        ready: function () {
            var VM  = this;
            var data = {orderOrApplyNo: window.orderOrApplyNo,sourceType:window.sourceType};
            $.getJSON(__ctx + "/flights/querySegments", data, function (result) {
                VM.segments = result.obj;
            });
            if(window.sourceType == '1'){
                var data = {orderNo: window.orderOrApplyNo};
                $.getJSON(__ctx + "/orderdetails/searchPassengerSegmentInfos", data, function (result) {
                    VM.passengers = result.obj;
                });
                $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
                    VM.order = result.obj;                                      
                    if(!result.obj || !result.obj.flightOrderDTO){
                        window.location.href = __ctx+"/common/pageNotFound";
                    }
                    VM.flag=true;
                    window.setTimeout(function(){
                        VM.paymentType = VM.order.orderMainDTO.paymentType;
                    },100);                   
                });
            }else{
                var data = {changeApplyNo: window.orderOrApplyNo};
                $.getJSON(__ctx + "/flights/queryChangePassengerSegmentInfo", data, function (result) {
                    VM.passengers = result.obj;
                    
                });
                var data2 = {applyNo: window.orderOrApplyNo};
                $.getJSON(__ctx + "/flights/change/detail", data2, function (result) {
                    VM.flightChangeApplyDetail = result.obj;    
                    VM.flag=true;
                    window.setTimeout(function(){
                    	VM.paymentType = VM.flightChangeApplyDetail.flightChangeApplyDTO.paymentType;
                    },100);
                    if(!result.obj || !result.obj.flightChangeApplyDTO){
                        window.location.href = __ctx+"/common/pageNotFound";
                    }                  
                });
                
            }
            /*window.setTimeout(function(){
            	getChangeFee();
            },1000);*/
            setTimeout(initTips, 500);
        },
        methods: {
            searchChangeFlight:function(type){
            	if(involuntaryChangeVM.segments.length>1){
            		toastr.error("真往返无法申请改期!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
            	}
                if(involuntaryChangeVM.segmentInfoIds.length==0){
                    toastr.error("请先选择需要改期的乘客信息!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if(!involuntaryChangeVM.changeDate && type == 0){
                    toastr.error("请先选择改期日期!", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                }
                if(validImagsIsUpload()){
                    toastr.error("请先上传所选择的图片!", "",{timeOut: 2000, positionClass: "toast-top-center"});
        	        return;
                }
                //图片上传
	       		var flightChangePicture={};
	       		flightChangePicture.jsonUrl=involuntaryChangeVM.fileUrls;
	       		flightChangePicture.url="";
	       		flightChangePicture.pictureName="";
	       		flightChangePicture.remark="";
	       		var changeSearchFlightDataDTO = {
	       			orderOrApplyNo: window.orderOrApplyNo,
	                sourceType:window.sourceType,
	                segmentInfoIds:involuntaryChangeVM.segmentInfoIds,
	                segmentId:involuntaryChangeVM.segments[0].id
	            }
	       		this.checkTicketStatus(changeSearchFlightDataDTO);
	       		if(!involuntaryChangeVM.changeable){
        			toastr.error("票号状态异常", "", {timeOut: 2000, positionClass: "toast-top-center"});
                    return;
        		}
                var data={
                    orderOrApplyNo: window.orderOrApplyNo,
                    sourceType:window.sourceType,
                    segmentInfoIds:involuntaryChangeVM.segmentInfoIds,
                    changeDate:involuntaryChangeVM.changeDate,
                    paymentType:involuntaryChangeVM.paymentType,
                    segmentId:involuntaryChangeVM.segments[0].id,
                    changeFee:involuntaryChangeVM.changeFee,
                    flightAmount:involuntaryChangeVM.passengers[0].flightSegmentInfos[0].flightAmount,
                    freeChangeFlag:'N',
                    rescheduledType:'1',
                    flightChangePictureDTO:flightChangePicture,
                    flightSegmentChangeId:window.flightSegmentChangeId,
                    airCode:involuntaryChangeVM.segments[0].airlineCompanyCode
                }
                $("input:checkbox[name='passengerSegment']").attr("checked", false);
                var action = '';
                if(type == 0){
                	action = __ctx + '/flights/searchChangeFlight';
                }else{
                	action = __ctx + '/flights/changeRecordedSingle';
                }
                var form = $("<form></form>");
                form.attr('action', action);
                form.attr('method', 'post');
                var input = $("<input type='text' id='searchdate' name='changeSearchFlightData'/>");
                form.append(input);
                form.appendTo("body")
                form.css('display', 'none');
                $("#searchdate").val(JSON.stringify(data));
                form.submit();
            },
            selectPassengerSegment:function(index,item){
                if ($("input:checkbox[name='passengerSegment']:eq(" + index + ")").is(":checked")) {
                    involuntaryChangeVM.segmentInfoIds.$set(involuntaryChangeVM.segmentInfoIds.length, item.flightSegmentInfos[0].id);
                } else {
                    involuntaryChangeVM.segmentInfoIds.$remove(item.flightSegmentInfos[0].id);
                }
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
                
                var imageslen = involuntaryChangeVM.images.length;
                var originLength = involuntaryChangeVM.fileUrls.length;
                var newFileLen = files.length;
                var totalFileLen = newFileLen + imageslen + originLength;
                
                if(totalFileLen>=10){
                    toastr.error("最多只能上传9张图片!","", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                	
                	return;
                }
                
                if (!files.length)return; 
                $(files).each(function (i, e) {
                	involuntaryChangeVM.fileValue.push(e);
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
	                toastr.error("仅允许10M以内文件,文件："+file[i].name+"，大小超过限制", {
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
                    url: __ctx + "/flights/change/upload",
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
                            involuntaryChangeVM.fileUrls=[];
                            var leng = result.obj.length;
                            if (leng > 0) {
                                for (var i = 0; i < leng; i++) {
                                	var url = result.obj[i].fileUrl;
                                	involuntaryChangeVM.fileUrls.push(url);
                                	involuntaryChangeVM.images.$set(i, url);
                                }
                            } 
                        }
				     }
				});
                
			},
    	   enlargeImage:function(index){
    		   window.open(index); 
    	   },
           checkTicketStatus:function(params) {
           	$.ajax({
                   type: "POST",
                   contentType: "application/json",
                   url:  __ctx + '/flights/change/checkTicketStatus',
                   data: JSON.stringify(params),
                   dataType: "json",
                   async : false,
                   success: function (result) {
                	   involuntaryChangeVM.changeable = result.obj;
                   }
               });
           }
        }
    });

    
    function initTips() {
    	
    	var defaultConfig = {container: 'body'};

        var genTrs = function (trs) {
            var html = '';
            _.forEach(trs, function (tds) {
                html += '<tr>';
                _.forEach(tds, function (val) {
                    html += '<td style="min-width: 50px;text-align: left;">' + val + '</td>';
                });
                html += '</tr>';
            });
            return html;
        };

        var genTableTemplate = function (ths, trs) {
            var template = '<div><table class="flightTipTable" style="background-color: #000"><thead><tr>';
            _.forEach(ths, function (val) {
                template += '<th>' + val + '</th>';
            });
            template += '</tr></thead><tbody>';
            template += genTrs(trs);
            template += '</tbody></table></div>';
            return template;
        };
    	
    	$('.priceTypes').each(function () {
            var selector$ = $(this);
            var pIndex = selector$.data('pindex');
            var item = involuntaryChangeVM.passengers[pIndex].flightSegmentInfos[0];
            var segment = involuntaryChangeVM.segments[0];
            if (!item || !segment) {
                return;
            }
            if (item.priceType!=1) {
                return;
            }
            var template = genTableTemplate([], [
                ['协议号：', segment.airlineCompany+'：'+item.agreementCode],
                ['协议价：', item.agreementPrice]
            ]);

            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });
    }
   
    /**
     * true - 有图片未上传
     */
    function validImagsIsUpload() {
        var p = _.findIndex(involuntaryChangeVM.images, function (url) {
            return url.indexOf('data:') >= 0;
        });
        return p >= 0;
   }
    
});