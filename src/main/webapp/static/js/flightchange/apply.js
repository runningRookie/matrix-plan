$(document).ready(function () {

    jQuery.validator.addMethod("airlineCode", function (value, element) {
        var length = value.length;
        var en = /^[a-zA-Z\d]+$/;
        return this.optional(element) || (length == 2 && en.test(value));
    }, "请输入正确的航司二字码");

    jQuery.validator.addMethod("notHasChinese", function (value, element) {
        var cn = /.*[\u4e00-\u9fa5]+.*$/;
        return this.optional(element) || (!cn.test(value));
    }, "不允许输入中文");

    var suppliers = [];

    $.getJSON(__ctx + '/resource/getFlightSuppliers', function (data) {
        suppliers = data.obj || [];
    });

    var genDate = function (date, time) {
        if (!date || !time) {
            return null;
        }
        return date + ' ' + time + ':00';
    };

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

    var getOldPnr = function (order) {
        return order.flightOrderDTO.pnr;
    };


    var genPassengerNames = function (segmentInfos) {
        return _.map(segmentInfos, function (item) {
            return item.passenger.passengerName;
        }).toString();
    };

    var newSegmentsVM = new Vue({
        el: '#newSegmentsVM',
        data: {
            old: {
                segmentInfos: [],
                segments: []
            },
            new: {
                segmentInfos: [],
                segments: []
            },
            apply: {newPnr: ''},
            suppliers: []
        }
    });

    var changeTypeVM = new Vue({
        el: '#changeTypeVM',
        data: {
            old: {
                segments: []
            },
            apply: {changeType: '1'},
            new: {
                segments: []
            }
        }
    });

    var changePaymentVM = new Vue({
        el: '#changePaymentVM',
        data: {
            apply: {changeType: '1', paymentType:''},
            order: {flightOrderDTO: {}, orderMainDTO: {}},
			isReady: false
        },
        ready: function () {
			var thisVm = this;
            var data = {orderNo: window.orderNo};
            $.getJSON(__ctx + "/orderdetails/orderinfo", data, function (result) {
            	thisVm.order = result.obj;
				thisVm.apply.paymentType = thisVm.order.orderMainDTO.paymentType;
            });
			thisVm.isReady = true;
        }
    });

    var newPoundagesVM = new Vue({
        el: '#newPoundagesVM',
        data: {
            old: {
                segmentInfos: []
            },
            new: {
                changApplyItems: []
            },
            changeType: 1
        }
    });

    changeTypeVM.$watch('apply.changeType', function (val) {
        newPoundagesVM.changeType = val;
        if (0 == val) {
            var data = _.cloneDeep(newPoundagesVM.new.changApplyItems);
            data = _.map(data, function (sub) {
                var subData = _.map(sub.sub, function (item) {
                    item.changApplyItem.changeFee = 0;
                    item.changApplyItem.upgradeCost = 0;
                    return item;
                });
                return {sub: subData};
            });
            newPoundagesVM.new.changApplyItems = data;
        }
    });

    var filterStopSites = function (cities) {
        return _.filter(_.map(cities, function (item) {
            if (!item.stopCity) {
                return '';
            }
            return item;
        }));
    };

    var valid = function (segmentsData) {
        var flag = true;
        _.forEach(segmentsData.new.segments, function (segment) {
            if (genDate(segment.segmentDate.depDate, segment.segmentDate.depTime) > genDate(segment.segmentDate.arrDate, segment.segmentDate.arrTime)) {
                flag = false;
                return false;
            }
        });
        return flag;
    };

    var buttonVM = new Vue({
        el: '#buttonVM',
        methods: {
            save: function () {
                if (newSegmentsVM.old.segmentInfos.length == 0) {
                    toastr.error("请选择需要改签的乘客", "", toastrConfig);
                    return;
                }
                if (!$('#changeForm').valid()) {
                    $('body').animate({scrollTop: $('.new-flight-info').offset().top}, 100);
                    toastr.error("请输入合法的数据", "", toastrConfig);
                    return;
                }

                var segmentsData = _.cloneDeep(newSegmentsVM.$data);
                var poundagesData = _.cloneDeep(newPoundagesVM.$data);
                var changeTypeData = _.cloneDeep(changeTypeVM.$data);
                var changePaymentData = _.cloneDeep(changePaymentVM.$data);

                var paymentType = changePaymentData.apply.paymentType;
                var changePaymentNo = changePaymentData.apply.changePaymentNo;
                var changePaymentMethodCode = changePaymentData.apply.changePaymentMethodCode;

                if (!valid(segmentsData)) {
                    toastr.error("出发日期不能大于返回日期", "", toastrConfig);
                    return;
                }
                var reg = /^[0-9a-zA-Z]*$/;
                if(!reg.test(changePaymentNo)){
                	toastr.error("请输入数字或者字母！", "", toastrConfig);
                    return;
                }
                var changeApplyItems = _.map(segmentsData.new.segments, function (segment, pIndex) {
                    var originSegment = segmentsData.old.segments[pIndex];

                    var changeItemInfoSaves = [];
                    _.forEach(segmentsData.new.segmentInfos, function (info, pi) {
                        _.forEach(info.sub, function (sub, i) {
                            if (originSegment.id == sub.segmentId) {
                                changeItemInfoSaves.push({
                                    originFlightSegmentInfo: segmentsData.old.segmentInfos[pi].flightSegmentInfos[i],
                                    flightSegmentInfo: sub.segmentsInfo,
                                    flightTicket: sub.ticket,
                                    flightChangeApplyItem: poundagesData.new.changApplyItems[pi].sub[i].changApplyItem,
                                    flightOrderItem: {}
                                });
                            }
                        })
                    });

                    segment.segment.flightStopSites = filterStopSites(segment.segment.flightStopSites);

                    var data = _.assign(segment.segment, {
                        planBeginDate: genDate(segment.segmentDate.depDate, segment.segmentDate.depTime),
                        planEndDate: genDate(segment.segmentDate.arrDate, segment.segmentDate.arrTime)
                    });

                    var changTypeDataSegment = changeTypeData.new.segments[pIndex];

                    var changeInfo = {changeText: changTypeDataSegment.change};
                    var refundInfo = {refundText: changTypeDataSegment.refund};
                    var signInfo = {signText: changTypeDataSegment.sign};
                    return {
                        flightSegment: data,
                        originFlightSegment: originSegment,
                        flightChangeInfo: changeInfo,
                        flightRefundInfo: refundInfo,
                        flightSignInfo: signInfo,
                        changeItemInfoSaves: changeItemInfoSaves
                    };
                });
                var flightChangeApply = _.cloneDeep(_.assign(newSegmentsVM.apply, changeTypeVM.apply, {
                    pnr: getOldPnr(tc.flight.change.order()),
                    passengerNames: genPassengerNames(segmentsData.old.segmentInfos)
                }));
                flightChangeApply.paymentType = paymentType;
                flightChangeApply.changePaymentNo = changePaymentNo;
                flightChangeApply.changePaymentMethodCode = changePaymentMethodCode;

                var data = {
                    flightChangeApply: flightChangeApply,
                    changeItemSaves: changeApplyItems,
                    orderNo: window.orderNo
                };

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: __ctx + '/flights/change/create',
                    data: JSON.stringify(data),
                    dataType: "json",
                    success: function (data) {
                        if (!data.result) {
                            toastr.error("申请失败", "", toastrConfig);
                            return;
                        }
                        toastr.success("申请成功, 5秒后跳转到订单详情页", "", toastrConfig);
                        setTimeout(function () {
                            location.href = __ctx + "/orderdetails/flightorderdetail?orderNo=" + window.orderNo;
                        }, 5000);
                    },
                    error: function () {
                        toastr.error("网络出现问题，请稍后再试", "", toastrConfig);
                    }
                });
            },
            toggleLogs: function () {
                tc.flight.change.toggleLogs();
            }
        }
    });

    var oldAmountVM = new Vue({
        el: '#oldAmountVM',
        data: {
            refundChangeSign: {refundInfo: {}, changeInfo: {}, signInfo: {}},
            passengers: []
        }
    });


    var flightVM = tc.flight.change.segments(function (segmentInfos) {
        var oldSegmentInfos = _.cloneDeep(newSegmentsVM.new.segmentInfos);
        var oldApplyItems = _.cloneDeep(newPoundagesVM.new.changApplyItems);

        newSegmentsVM.new.segmentInfos = transferSegmentInfos(segmentInfos, oldSegmentInfos);
        newPoundagesVM.new.changApplyItems = transferApplyItems(segmentInfos, oldApplyItems);

        newSegmentsVM.old.segmentInfos = _.cloneDeep(segmentInfos);
        newPoundagesVM.old.segmentInfos = _.cloneDeep(segmentInfos);

        newSegmentsVM.suppliers = _.cloneDeep(suppliers);
    }, function (segments) {
        newSegmentsVM.old.segments = _.cloneDeep(segments);
        changeTypeVM.old.segments = _.cloneDeep(segments);

        newSegmentsVM.new.segments = initSegment(segments);
        changeTypeVM.new.segments = initRefundChange(segments);
        newPoundagesVM.new.changApplyItems = initChangeApplyItems(segments);

        setTimeout(initDatePicker, 500);
    }, function (refundChangeSign, oldPassengers) {
        oldAmountVM.refundChangeSign = _.cloneDeep(refundChangeSign);
        oldAmountVM.passengers = _.cloneDeep(oldPassengers);
    });

    (function () {
        $.getJSON(__ctx + "/orderdetails/orderinfo", {orderNo: window.orderNo}, function (result) {
            flightVM.setFlightOrder(result.obj.flightOrderDTO);
        });
    })();

    function transferSegmentInfos(segmentInfos, oldSegmentInfos) {
        if (segmentInfos.length == 0) {
            return [{
                sub: [{
                    segmentsInfo: {},
                    ticket: {ticketType: '1'}
                }]
            }]
        }
        var result = _.map(segmentInfos, function (info) {
            var sub = _.map(info.flightSegmentInfos, function (item) {
                var model = {
                    segmentsInfo: {},
                    ticket: {ticketType: '1'},
                    id: item.id,
                    segmentId: item.segmentId
                };
                return getOriginSegment(item.id, oldSegmentInfos) || model;
            });

            return {
                sub: sub
            };
        });
        return result;
    }

    function transferApplyItems(segmentInfos, oldApplyItems) {
        if (segmentInfos.length == 0) {
            return [{sub: [{changApplyItem: {}}]}]
        }
        var result = _.map(segmentInfos, function (info) {
            var sub = _.map(info.flightSegmentInfos, function (item) {
                var model = {
                    changApplyItem: {},
                    id: item.id,
                    segmentId: item.segmentId
                };
                return getOriginApplyItem(item.id, oldApplyItems) || model;
            });

            return {
                sub: sub
            };
        });
        return result;
    }

    function getOriginSegment(segmentInfoId, segmentInfos) {
        var obj = null;
        _.forEach(segmentInfos, function (sub) {
            _.forEach(sub.sub, function (item) {
                if (item.id == segmentInfoId) {
                    obj = item;
                    return false;
                }
            });
        });
        return obj;
    }

    function getOriginApplyItem(segmentInfoId, applyItems) {
        var obj = null;
        _.forEach(applyItems, function (sub) {
            _.forEach(sub.sub, function (item) {
                if (item.id == segmentInfoId) {
                    obj = item;
                    return false;
                }
            });
        });
        return obj;
    }

    function initSegment(segments) {
        return _.map(segments, function () {
            return {
                segment: {flightStopSites: [{stopCity: ''}]},
                segmentDate: {}
            };
        });
    }

    function initRefundChange(segments) {
        return _.map(segments, function () {
            return {
                change: '',
                refund: '',
                sign: ''
            };
        });
    }

    function initChangeApplyItems(segments) {
        return _.map(segments, function () {
            return {sub: []};
        });
    }

});