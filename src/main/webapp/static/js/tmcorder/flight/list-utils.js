$(document).ready(function () {
    var craftTypes = ['', '小型飞机', '中型飞机', '大型飞机'];

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
        var template = '<div><table class="table dataTable" style="background-color: #000"><thead><tr>';
        _.forEach(ths, function (val) {
            template += '<th>' + val + '</th>';
        });
        template += '</tr></thead><tbody>';
        template += genTrs(trs);
        template += '</tbody></table></div>';
        return template;
    };

    var genTable = function (trs) {
        var template = '<table class="flightTipTable"><tbody>';
        template += genTrs(trs);
        template += '</tbody></table>';
        return template;
    };

    var defaultConfig = {container: 'body'};

    var genRefundChangeParams = function (flight, item, searchVM, resultVM) {
        var params = {
            airlineCode: flight.airlineCode,
            fltNo: flight.fltNo,
            depDate: searchVM.params.depDate,
            cabinCode: item.flightData.cabinCode,
            baseCabinCode: item.flightData.baseCabinCode,
            baseCabinFare: item.flightData.baseCabinFare,
            fdFare: item.flightData.fdFare,
            fbc: item.flightData.fbc,
            discount: item.flightData.discount,
            startPort: item.flightData.depPortCode,
            endPort: item.flightData.arrPortCode,
            depTime: item.flightData.depTime,
            shareFltCode: item.flightData.shareFltCode,
            shareFltNo: item.flightData.shareFltNo,
            flightAmount: item.flightData.fare,
            flightQueryResultKey:flight.flightQueryResultKey,
            flightInfoKey:flight.flightInfoKey,
            cabinInfoKey:item.flightData.cabinInfoKey,
            resourceType:flight.channelType,
            priceType:item.flightData.isAgreeFare==='Y'?'1':'0'
        };
        if (resultVM.travelType === 'back') {
            params.depDate = searchVM.params.backDate;
        }
        return params;
    };

    var refundChanges = function (resultVM, searchVM, baseUrl, selector$) {
        var events = $._data(selector$[0], 'events');
        if (!!events) {
            return;
        }
        var pIndex = selector$.data('pindex');
        var index = selector$.data('index');
        var flight = resultVM.filterFlights[pIndex];
        if (!flight) {
            return;
        }
        var item = flight.cabins[index];
        if (!item) {
            return;
        }
        //var url = baseUrl + (item.flightData.isAgreeFare === 'Y' ? 'protocolrefund' : 'flightrefund');
        
        var url = baseUrl + 'refundChange';

        var params = genRefundChangeParams(flight, item, searchVM, resultVM);

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: url,
            data: JSON.stringify(params),
            dataType: "json",
            success: function (data) {
                resultVM.refundChangeSigns[pIndex] = resultVM.refundChangeSigns[pIndex] || [];
                resultVM.refundChangeSigns[pIndex][index] = data.obj;
                if (!data.obj) {
                    return;
                }
                var refundRules = _.map(data.obj.refundRule, function (val) {
                    return ['&nbsp;', val];
                });
                var changeRules = _.map(data.obj.changeRule, function (val) {
                    return ['&nbsp;', val];
                });
                if (!refundRules[0]) {
                    return;
                }
                refundRules[0][0] = '退票：';
                changeRules[0][0] = '改期：';
                var template = genTable(refundRules.concat(changeRules).concat([['签转：', data.obj.signTransferRule]]));

                selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
            }
        });
    };

    tc.ns('tc.flight.list.utils.refundChanges', refundChanges);

    tc.ns('tc.flight.list.utils.genRefundChangeParams', genRefundChangeParams);

    tc.ns('tc.flight.list.utils.priceTips', function (resultVM) {
        $('.priceTips').each(function () {
            var selector$ = $(this);
            var index = selector$.data('pindex');
            var flight = resultVM.filterFlights[index];
            var insurancePrice = resultVM.selectInsurancePrice[index];
            if (!flight) {
                return;
            }
            var passengerLength = parseFloat(window.bookPersonAndPassengers.passengers.length);
            var passengerPrice = parseFloat(flight.lowestFare || 0) + parseFloat(flight.departureTax || 0) + parseFloat(flight.fule || 0) + parseFloat(resultVM.serviceFee || 0);
            var template = genTable([
                ['人数：' + passengerLength + '人'],
                ['个人单价：' + (passengerPrice + insurancePrice) + '元'],
                ['合计：' + (passengerLength * passengerPrice).toFixed(2) + '元']
            ]);

            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });
    });

    /**
     * 创建toolTip，包含经停，机型，共享，差旅政策，退改签（第一次展开舱位时调用ajax获取），准点率，及点击展开或关闭舱位功能
     */
    tc.ns('tc.flight.list.utils.tips', function (resultVM, searchVM, baseUrl) {

        $('.planeModels').each(function () {
            var selector$ = $(this);
            var index = selector$.data('index');
            var item = resultVM.filterFlights[index];
            if (!item) {
                return;
            }
            var template = genTableTemplate(['机型', '机型名称', '机型类型', '座位数'], [
                [item.equipmentCode || '', item.craftName || '', craftTypes[item.fltSize] || '', item.seatNumber || '']
            ]);

            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });

        $('.shareFlights').each(function () {
            var selector$ = $(this);
            var index = selector$.data('index');
            var item = resultVM.filterFlights[index];
            if (!item) {
                return;
            }
            var template = genTableTemplate(['实际承运航班'], [
                [item.shareFltCode + item.shareFltNo]
            ]);

            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });

        $('.stoppings').each(function () {
            var selector$ = $(this);
            var index = selector$.data('index');
            var flight = resultVM.filterFlights[index];
            if (!flight) {
                return;
            }
            var depDate = resultVM.travelType === 'back' ? searchVM.params.backDate : searchVM.params.depDate;
            var params = {
                airlineCode: flight.airlineCode,
                fltNo: flight.fltNo,
                depDate: depDate,
                startPort: flight.depPortCode,
                endPort: flight.arrPortCode
            };
            if (flight.isShareFlight === 'Y') {
                params.airlineCode = flight.shareFltCode;
                params.fltNo = flight.shareFltNo;
            }

            setTimeout(function () {
                $.getJSON(baseUrl + 'stopping/', params, function (data) {
                    resultVM.stoppings.$set(index, _.cloneDeep(data.obj));

                    var trs = _.map(data.obj, function (item) {
                        return [item.stopPort, item.stopArrTime, item.stopDepTime];
                    });
                    var template = genTableTemplate(['经停机场', '到达时间', '起飞时间'], trs);
                    selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
                });
            }, Math.ceil(Math.random() * (1000)));
        });
        $('.punctualities').each(function () {
            var selector$ = $(this);
            var index = selector$.data('index');
            var item = resultVM.filterFlights[index];
            if (!item) {
                return;
            }
            selector$.tooltip({title: item.flightTimeRate + '%'});
        });

        $('.violatePolicy').each(function () {
            var selector$ = $(this);
            var pIndex = selector$.data('pindex');
            var index = selector$.data('index');
            var flight = resultVM.filterFlights[pIndex];
            if (!flight) {
                return;
            }
            var cabin = flight.cabins[index];
            if (!cabin) {
                return;
            }

            var trs = _.filter(_.map(cabin.flightData.travelPolicys, function (item) {
                if (!item.policyContent) {
                    return null;
                }
                var arr = [[item.passengerName + ' 违反了如下差旅政策规定：']];
                arr = arr.concat(_.map(item.policyContent, function (str, i) {
                    return [(parseInt(i) + 1) + '、' + str.violateContent];
                }));
                return [genTable(arr)];
            }));

            var template = genTable(trs);

            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });

        $('.selectFlight').each(function () {
            var events = $._data($(this)[0], 'events');
            if (!!events && !!events['click']) {
                return;
            }
            $(this).click(function () {
                var trSelectors$ = $('tr');
                var tdSelector$ = $(this).parent().parent().parent().parent();

                trSelectors$.removeClass('currentSelector');

                tdSelector$.find('.table-scrollable').toggle('display');
                tdSelector$.parent().toggleClass('selected-border').addClass('currentSelector');

                trSelectors$.each(function () {
                    if ($(this).hasClass('currentSelector')) {
                        return;
                    }
                    $(this).removeClass('selected-border').find('.table-scrollable').css('display', 'none');
                });

                tdSelector$.find('.refundChanges').each(function () {
                    refundChanges(resultVM, searchVM, baseUrl, $(this));
                });
            });
        });
    });


    /**
     * 根据日期生成前后n天内的数据，用于日历展示
     */
    tc.ns('tc.flight.list.utils.calendarDays', function (originDate, floatDays) {
        if (!originDate) {
            originDate = new Date();
        }
        if (!floatDays) {
            floatDays = 10;
        }
        var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        var arr = [];

        var length = parseInt(floatDays);
        var currentDate = moment().format("YYYY-MM-DD");
        var startDate = moment(originDate).subtract(parseInt(floatDays / 2 - 1), 'days').format("YYYY-MM-DD");

        if (startDate < currentDate) {
            startDate = currentDate;
        }

        for (var i = 0; i < length; i++) {
            arr.push(genObj(moment(startDate).add(i, 'days')));
        }

        function genObj(momentDate) {
            return {
                date: momentDate.format("YYYY-MM-DD"),
                day: momentDate.format("MM-DD"),
                week: week[momentDate.format('d')]
            }
        }

        return arr;
    });

    /**
     * 推荐航班提示
     */
    tc.ns('tc.flight.list.utils.suggestTips', function initSuggestTips(flight, briefs, index) {
        var defaultConfig = {container: 'body'};

        $('.suggestPlaneModels' + index).each(function () {
            var selector$ = $(this);
            if (!flight) {
                return;
            }
            var template = genTableTemplate(['机型', '机型名称', '机型类型', '座位数'], [
                [flight.equipmentCode || '', flight.craftName || '', craftTypes[flight.fltSize] || '', flight.seatNumber || '']
            ]);

            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });

        $('.suggestShareFlights' + index).each(function () {
            var selector$ = $(this);
            if (!flight) {
                return;
            }
            var template = genTableTemplate(['实际承运航班'], [
                [flight.shareFltCode + flight.shareFltNo]
            ]);

            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });

        $('.suggestStoppings' + index).each(function () {
            var selector$ = $(this);
            if (!flight) {
                return;
            }
            var trs = _.map(briefs, function (item) {
                return [item.stopPort, item.stopArrTime, item.stopDepTime];
            });
            var template = genTableTemplate(['经停机场', '到达时间', '起飞时间'], trs);
            selector$.tooltip(_.assign(defaultConfig, {title: template, html: true}));
        });
        $('.suggestPunctualities' + index).each(function () {
            var selector$ = $(this);
            if (!flight) {
                return;
            }
            selector$.tooltip({title: flight.flightTimeRate + '%'});
        });
    });
});