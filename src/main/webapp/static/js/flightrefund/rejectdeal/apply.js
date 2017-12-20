$(document).ready(function () {
//
//  var initDatePicker = function () {
//        $('.dateInputPicker').datetimepicker({
//            minView: "month", // 选择日期后，不会再跳转去选择时分秒
//            format: "yyyy-mm-dd", // 选择日期后，文本框显示的日期格式
//            language: 'zh-CN', // 汉化
//            autoclose: true // 选择日期后自动关闭
//        });
//
//        $('.timeInputPicker').datetimepicker({
//            startView: 'hour',
//            maxView: "hour", // 选择日期后，不会再跳转去选择时分秒
//            format: "hh:ii", // 选择日期后，文本框显示的日期格式
//            language: 'zh-CN', // 汉化
//            autoclose: true // 选择日期后自动关闭
//        });
//    };
//
    Vue.filter('refundTypeFliter', {
          read: function(value, format) {
                  if(value == 0){
                      return '自愿退票';
                  }else{
                      return '非自愿退票';
                  }
                  
          },
          write: function (value, format) {
                  return value;
          }
      });

    var refundTitleVM = new Vue({
           el: '#refundTitleVM',
           data: {           
          refundStatusCode:window.refundStatusCode
           },
           methods: {}
       });
    var refundchangesignVM = new Vue({
         el: '#refundchangesignVM',
         data: {           
          refundChangeSign:{},
          refundApply:{}       
         },
         methods: {}
     });
//
     var refundAmountVM = new Vue({
         el: '#refundAmountVM',
         data: {
          refundType:0,
          rejectReason:"",
          segmentInfos:[],
          passengerSegments:[],
        urlList : [],
               images: [],
               imgNames: [],
               fileValue:[],
               flag : false
         },
         ready: function () {
               var thisVM = this;
               thisVM.flag = true;
               var applyNO = {refundApplyNo : window.refundApplyNo};
               $.ajax({
                   url: __ctx + "/flights/findRefundImage",
                   contentType: "application/json",
                   type : "GET",
                   async: false,
                   data:applyNO,
                   datatype:"json",
                   success:function(data){
                       if(!data.result){
                           toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                       }else{
                           thisVM.urlList = data.obj.urlList.concat();
                       }
                   }
               });
         },
         methods:{
               addPic(e){
                   e.preventDefault();
                   $('input[type=file]').trigger('click');
                   return false;
               },
               onFileChange(e) {
                   var files = e.target.files || e.dataTransfer.files;
                   if (!files.length) {
                       return;
                   }
                   if (files.length >= 10) {
                       toastr.error("最多只能上传9张图片!", "", {
                           timeOut: 2000,
                           positionClass: "toast-top-center"
                       });
                       $('input[type=file]').val('');
                       return;
                   }
                   var flag = true;
                   _.forEach(files, function (file) {
                       if(['image/png','image/bmp','image/gif','image/jpg','image/jpeg'].indexOf(file.type) < 0){
                            flag = false;
                            return false;
                       }
                   });
                   if(!flag){
                       toastr.error("图片类型必须是.gif,jpeg,jpg,png,bmp中的一种!", "", {
                           timeOut: 2000,
                           positionClass: "toast-top-center"
                       });
                       $('input[type=file]').val('');
                       return;
                   }
                   var imageslen = refundAmountVM.images.length;
                   var originLength = refundAmountVM.urlList.length;
                   var newFileLen = files.length;
                   var totalFileLen = newFileLen + imageslen + originLength;
                   if (totalFileLen >= 10) {
                       toastr.error("最多只能上传9张图片!", "", {
                           timeOut: 2000,
                           positionClass: "toast-top-center"
                       });
                       $('input[type=file]').val('');
                       return;
                   }

                   $(files).each(function (i, e) {
                       refundAmountVM.fileValue.push(e);
                   });
                   this.createImage(files);
               },
               createImage(file) {
                   if (typeof FileReader === 'undefined') {
                       alert('您的浏览器不支持图片上传，请升级您的浏览器');
                       return false;
                   }
                   for (var i = 0; i < file.length; i++) {
                       var filesize = file[i].size;
                       if (filesize > 10 * 1024 * 1024) {
                           toastr.error("仅允许10M以内文件,文件：" + file[i].name + "，大小超过限制", "", {
                               timeOut: 2000,
                               positionClass: "toast-top-center"
                           });
                           return;
                       }
                   }
                   var image = new Image();
                   var vm = this;
                   var leng = file.length;
                   for (var i = 0; i < leng; i++) {
                       var name = file[i].name;
                       vm.imgNames.push(name);

                       var reader = new FileReader();
                       reader.readAsDataURL(file[i]);
                       reader.onload = function (e) {
                           vm.images.push(e.target.result);
                       };
                   }
                   $('input[type=file]').val('');
               },
               delImage: function (index) {
                   this.images.splice(index, 1);
                   this.imgNames.splice(index, 1);
                   this.fileValue.splice(index, 1);
               },
               delOriginImage: function (index) {
                   this.urlList.splice(index, 1);
               },
               count: function (o) {
                   var t = typeof o;
                   if (t == 'string') {
                       return o.length;
                   } else if (t == 'object') {
                       var n = 0;
                       for (var i in o) {
                           n++;
                       }
                       return n;
                   }
                   return false;
               },

               uploadImage: function () {
                   if(this.fileValue.length==0){
                       toastr.error("请先选择图片!","", {
                           timeOut: 2000,
                           positionClass: "toast-top-center"
                       });

                       return;

                   }
                   var formData = new FormData();
                   for (var i = 0; i < this.fileValue.length; i++) {
                       formData.append('files', this.fileValue[i]);
                   }

                   $.ajax({
                       type: "POST",
                       url: __ctx + "/flights/refund/upload",
                       contentType: false,    // 这个一定要写
                       processData: false,    // 这个也一定要写，不然会报错
                       data: formData,
                       dataType: "json",
                       success: function (result) {
                           if (result.result) {
                               toastr.success("图片上传成功！", "", {
                                   timeOut: 2000,
                                   positionClass: "toast-top-center"
                               });

                               var leng = result.obj.length;
                               if (leng > 0) {
                                   for (var i = 0; i < leng; i++) {
                                       var url = result.obj[i].fileUrl;
                                       refundAmountVM.images.$set(i, url);
                                   }
                               }
                           }
                       }
                   });
               }
         }
     });
     
     var vm = new Vue({
          el: '#orderLogVM',
          data: {
              logs: [],
              isShow: false
          }
      });
      
      var refundButtonVM = new Vue({
          el: '#refundButtonVM',
          data: {
	        	pnrCancelAble : false
          },
          ready: function () {
              
          },
          methods:{
            toggleLogs: function () {
              $.getJSON(__ctx + "/orders/" + window.orderNo + "/logs", function (data) {
                    vm.logs = data.obj;
                });
              vm.isShow = !vm.isShow;
              },
              updateRefundApply:function(){
                if(validImagsIsUpload()){
                        toastr.error("请先上传所选择的图片!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                    return;
                    }
                    this.cancelPnr();
		        	if(!refundButtonVM.pnrCancelAble){
		                toastr.error("请手动取消pnr", "", {timeOut: 2000, positionClass: "toast-top-center"});
		                setTimeout(function () {refundButtonVM.updateRefundApplyAfter()}, 2000);
		            }else{
		                this.updateRefundApplyAfter();
		            }
	            },
	            updateRefundApplyAfter:function(){
                var refundItems = [];
                $(refundAmountVM.passengerSegments).each(function(i,e){
                  $(e.refundItems).each(function(i,e){
                    refundItems.$set(refundItems.length,e.refundItem);
                  });
                });

                var url = refundAmountVM.urlList.concat(refundAmountVM.images);
                
                $.ajax({
                        url: __ctx + "/flights/updateRefundItems",
                        contentType: "application/json",                        
                        type : "POST",
                        data:JSON.stringify({flightRefundApplyItems : refundItems, urls : url.toString(), refundType: refundAmountVM.refundType,rejectReason:refundchangesignVM.refundApply.rejectReason}),
                        datatype:"json",
                        error:function(data1){
                            toastr.error("查询价格信息失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success:function(data){
                            if(!data.result){
                                toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                            }else{             
                                toastr.info("提交成功!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                                window.location.href =  __ctx + '/flights/refundDetail?applyNo=' + window.refundApplyNo;
                            }
                        }
                    });
              },
                saveRefundApply:function(){
                    if(validImagsIsUpload()){
                        toastr.error("请先上传所选择的图片!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        return;
                    }
                    var refundItems = [];
                    $(refundAmountVM.passengerSegments).each(function(i,e){
                        $(e.refundItems).each(function(i,e){
                            refundItems.$set(refundItems.length,e.refundItem);
                        });
                    });

                    var url = refundAmountVM.urlList.concat(refundAmountVM.images);

                    $.ajax({
                        url: __ctx + "/flights/saveRefundItems",
                        contentType: "application/json",
                        type : "POST",
                        data:JSON.stringify({flightRefundApplyItems : refundItems, urls : url.toString(), refundType: refundAmountVM.refundType,rejectReason:refundchangesignVM.refundApply.rejectReason}),
                        datatype:"json",
                        error:function(data1){
                            toastr.error("查询价格信息失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success:function(data){
                            if(!data.result){
                                toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                            }else{
                                toastr.info("提交成功!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                                location.reload();
                            }
                        }
                    });
                },
              cancelRefundApply:function(){
                
                var data = {refundApplyNo: window.refundApplyNo};
                
                $.ajax({
                        url: __ctx + "/flights/cancelRefundApply",                       
                        type : "POST",
                        data:data,
                        datatype:"json",
                        error:function(data1){
                            toastr.error("取消退票失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success:function(data){
                            if(!data.result){
                                toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                            }else{             
                              toastr.success("取消成功, 5秒后关闭当前页面", "", toastrConfig);
                              setTimeout(function () {
                                  window.close();
                              }, 5000);
                            }
                        }
                    });
	            },
	            cancelPnr: function () {
	              var CancelPnrRequestDTO = {};
	              CancelPnrRequestDTO.refundApplyNo = window.refundApplyNo;
	              CancelPnrRequestDTO.orderOrChangeNo = window.orderNo;
	              CancelPnrRequestDTO.sourceType = window.sourceType;
	              CancelPnrRequestDTO.buttonType = "1";
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

      var init = function () {
          $.getJSON(__ctx + "/orders/" + window.orderNo + "/logs", function (data) {
              vm.logs = data.obj;
          });
      };    

      tc.ns('tc.flight.logs.refresh', function () {
          init();
      });
      
     tc.flight.refund.segments(function (refundChangeSign,passengers) {
        refundchangesignVM.refundChangeSign = _.cloneDeep(refundChangeSign);
          refundAmountVM.segmentInfos = _.cloneDeep(passengers);
          $(refundAmountVM.segmentInfos).each(function(i,e){
          var passengerSegment = {};
          passengerSegment.passenger = e.passenger;
          var refundItems = [];
          $(e.flightSegmentInfos).each(function(i,e){
            var segmentRefundItem = {};
            segmentRefundItem.flightSegmentInfo = e;
            
            var refundItem = {};
            var data = {segmentInfoId: e.id};
                    $.ajax({
                        url: __ctx + "/flights/getRefundItemBySegmentInfoId",
                        contentType: "application/json",                        
                        type : "GET",
                        async: false,
                        data:data,
                        datatype:"json",
                        error:function(data1){
                            toastr.error("查询价格信息失败!", "",{timeOut: 2000, positionClass: "toast-top-center"});
                        },
                        success:function(data){
                            if(!data.result){
                                toastr.error(data.message, "",{timeOut: 2000, positionClass: "toast-top-center"});
                            }else{             
                                refundItem = data.obj;
                            }
                        }
                    });

            segmentRefundItem.refundItem = refundItem;
            refundItems.$set(refundItems.length,segmentRefundItem);
          });
          passengerSegment.refundItems = refundItems;
              refundAmountVM.passengerSegments.$set(refundAmountVM.passengerSegments.length,passengerSegment);                                          
          });
     });

     tc.flight.refund.apply(function (refundApply) {
        var refundApply = _.cloneDeep(refundApply);
        refundAmountVM.refundType = parseInt(refundApply.refundType);
        refundchangesignVM.refundApply = refundApply;
  //        newPoundagesVM.old.segmentInfos = _.cloneDeep(segmentInfos);
     });

        /**
         * true - 有图片未上传
         */
        function validImagsIsUpload() {
            var p = _.findIndex(refundAmountVM.images, function (url) {
                return url.indexOf('data:') >= 0;
            });
            return p >= 0;
       }
//
});