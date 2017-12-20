var trainQueryVue;

$(function () {
    //出发站、到达站输入框使用select2初始化
    $("#fromStation, #toStation").select2({
        language: "zh-CN",
        minimumInputLength: 1,
        ajax: {
            url: __ctx + "/train/cityList",
            type: "post",
            dataType: "json",
            quietMillis: 1000,
            data: function (term, page) {
                return {
                    "queryKey": term.trim()
                };
            },
            results: function (data, page) {
                var resultArray = [];
                if (data.obj != null) {
                    $.each(data.obj, function (index, item) {
                        var temp = item.split(",");
                        resultArray.push({
                            "id": temp[0],
                            "text": temp[0]
                        });
                    });
                }

                return {
                    results: resultArray
                };
            },
            cache: true
        }
    });

    var startDate = moment(new Date()).format("YYYY-MM-DD");
    var endDate = moment(new Date()).add(60, 'd').format("YYYY-MM-DD");
    $("#datetimepicker").datetimepicker({
        format: "yyyy-mm-dd",
        minView: "month",
        autoclose: true,
        todayBtn: true,
        language: "zh-CN",
        startDate: startDate,
        endDate: endDate
    }).bind("mouseover", function () {
        $(this).css({
            "cursor": "pointer"
        })
    }).val(moment(new Date()).format("YYYY-MM-DD")).on(
        "changeDate", function () {
            $("#datetimepicker").datetimepicker({"setStartDate": startDate, "setEndDate": endDate});
        }
    );

    trainQueryVue = new Vue({
        el: "#trainQuery",
        data: {
            "searchParam": {
                "fromStation": "",
                "toStation": "",
                "trainDate": "",
                "froms": [],
                "tos": [],
                "employeeIds": ""
            },
            "result": {
                "totalCount": 0,
                "limitedTotal": 0,
                "sendTime": 0,
                "trains": []
            },
            "stopOverResult": [],
            "indexNumber" : undefined
        },
        methods: {
            //站站查询
            search: function () {
                if (trainQueryVue.searchParam.fromStation == null) {
                    toastr.warning("请选择出发站", "", toastrConfig);
                    return;
                }
                if (trainQueryVue.searchParam.toStation == null) {
                    toastr.warning("请选择到达站", "", toastrConfig);
                    return;
                }
                book1.getTrainListAjax(trainQueryVue.searchParam.fromStation, trainQueryVue.searchParam.toStation, trainQueryVue.searchParam.trainDate, 1);
            },
            stopOverSearch: function (trainNo, fromStation, toStation, date, index) {
                var param = this;
                param.stopOverResult = book1.stopOverSearch(trainNo, fromStation, toStation, date);
                param.indexNumber= index;
            }
        }
    });

    var book1 = {
        model: { //变量集合
            fromStation: "", //出发城市
            toStation: "", //到达城市
            trainDate: "", //出发日期
            trainData: [],
            queryKey: ""
        },
        //默认加载事项
        init: function () {
            this.searchFunc(); //头部搜索事件加载
            sessionStorage.clear();
            $("#trainQuery").hide();
            this.mouseoverFunc(); //页面显示事件集合
            this.dateShow();
        },
        //显示大的日期选择
        dateShow: function () {
            var _this = this;
            //左右选择时间功能
            var startDate = new Date(new Date().getTime() - 5 * 24 * 3600 * 1000);
            var endDate = new Date(new Date().getTime() + 60 * 24 * 3600 * 1000 + 5 * 24 * 3600 * 1000);
            var sDate = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate();
            var eDate = endDate.getFullYear() + "-" + (endDate.getMonth()+1) + "-" + endDate.getDate();
            var dayArr = getDayArr(sDate, eDate); //获得所有日期
            var dateToWeek = function (dateList) { //日期转换成星期
                var newDateStr = dateList.replace(/-/g, "/");
                var aa = new Date(newDateStr).getDay();
                return "周" + "日一二三四五六".split("")[aa];
            };
            //生成html
            var $dates = $("#dates");

            $dates.css("width", dayArr.length * 100); //给ul赋值宽度
            for (var i = 0; i < dayArr.length; i++) {
                //锁定当前选中的
                if (dayArr[i] === $("#datetimepicker").val()) {
                    $dates.css("left", (i - 4) * -100); //赋值定位
                    $dates.append("<li class='choose-time-style selectdate' data-date='" + dayArr[i] + "'><p>" + dayArr[i].substring("5", dayArr[i].length) + "</p><p>" + dateToWeek(dayArr[i]) + "</p></li>")
                } else if (i < 5 || i > dayArr.length - 6) {
                    $dates.append("<li class='noclick' data-date='" + dayArr[i] + "'><p>" + dayArr[i].substring("5", dayArr[i].length) + "</p><p>" + dateToWeek(dayArr[i]) + "</p></li>")
                }  else {
                    $dates.append("<li class='selectdate' data-date='" + dayArr[i] + "'><p>" + dayArr[i].substring("5", dayArr[i].length) + "</p><p>" + dateToWeek(dayArr[i]) + "</p></li>")
                }
            }
            //时间的左右点击事件
            $(".time-right").click(function () {
                var leftWidth = $dates.position().left;
                var width = ($dates.width() - (10 * 100)) * -1;
                leftWidth > width ? $dates.css("left", leftWidth - 100) : leftWidth; //给ul赋值宽度
            });
            $(".time-left").click(function () {
                var leftWidth = $dates.position().left;
                leftWidth > -1 ? leftWidth : $dates.css("left", leftWidth + 100);
            });
            //计算所有天数的函数
            function getDayArr(sDate, eDate) {
                function getDate(datestr) {
                    var temp = datestr.split("-");
                    var date = new Date(temp[0], parseInt(temp[1] - 1).toString(), temp[2]);
                    return date;
                }

                var dayArr = [];
                var startTime = getDate(sDate);
                var endTime = getDate(eDate);
                while ((endTime.getTime() - startTime.getTime()) >= 0) {
                    var year = startTime.getFullYear();
                    var month = (startTime.getMonth() + 1).toString().length == 1 ? "0" + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
                    var day = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
                    dayArr.push(year + "-" + month + "-" + day)
                    startTime.setDate(startTime.getDate() + 1);
                }
                return dayArr;
            }
        },
        //查询车次
        getTrainListAjax: function (fromStation, toStation, trainDate, type) {
            $("#trainQuery").show();
            $("#loading").css({
                "display": "block"
            });
            $(".buxian").addClass("color-hover").siblings(".check").removeClass("color-hover").find("i").removeClass("checkbox-choose");
            $(".buxian").each(function(){
                book1.screenFunc($(this));
            });
            $.ajax({
                url: __ctx + "/train/station2station",
                type: 'get',
                data: {
                    "fromStation": fromStation,
                    "toStation": toStation,
                    "trainDate": trainDate.replace(/-/g, ""),
                    "ticketType": 1,
                    "employeeIds": "0"//不查询差旅政策适用0
                },
                success: function (dataRes) {
                    trainQueryVue.result.sendTime += 1;
                    if (dataRes.obj != null) {
                        dataRes.obj.trainDate = book1.model.trainDate;
                        //为vue对象赋值
                        trainQueryVue.searchParam.fromStation = dataRes.obj.fromStation != null ? dataRes.obj.fromStation : trainQueryVue.searchParam.fromStation;
                        trainQueryVue.searchParam.toStation = dataRes.obj.toStation != null ? dataRes.obj.toStation : trainQueryVue.searchParam.toStation;
                        trainQueryVue.searchParam.trainDate = dataRes.obj.trainDate != null ? dataRes.obj.trainDate : trainQueryVue.searchParam.trainDate;
                        trainQueryVue.searchParam.froms = dataRes.obj.froms;
                        trainQueryVue.searchParam.tos = dataRes.obj.tos;
                        trainQueryVue.result.totalCount = dataRes.obj.totalCount;
                        trainQueryVue.result.limitedTotal = dataRes.obj.totalCount;
                        trainQueryVue.result.trains = dataRes.obj.trains;
                        if (trainQueryVue.result.trains != null) {
                            for (var a = 0; a < trainQueryVue.result.trains.length; a++) {
                                trainQueryVue.result.trains[a].beginTime = trainQueryVue.result.trains[a].fromTime == "--" || trainQueryVue.result.trains[a].fromTime == null ?
                                    99999 :
                                    parseInt(trainQueryVue.result.trains[a].fromTime.split(":")[0]) * 60 + parseInt(trainQueryVue.result.trains[a].fromTime.split(":")[1]); //出发时间毫秒值.如果没有则给999999
                            }
                        }
                        sessionStorage.searchParam = JSON.stringify(trainQueryVue.searchParam);
                        sessionStorage.result = JSON.stringify(trainQueryVue.result);
                    }

                    book1.model.trainData = dataRes.obj;
                    sessionStorage.queryKey = book1.model.queryKey = dataRes.obj != null ? dataRes.obj.queryKey : "";
                    //获取出发站和到达站
                    var data = book1.model.trainData;
                    //把耗时转为时分
                    var transTime = function (time) {
                        var hour = parseInt(time / 60);
                        var minute = parseInt(time % 60);
                        return hour + "小时" + minute + "分钟";
                    };
                    //分类火车类型
                    var transType = function (train) {
                        if (train == "D") {
                            return "d";
                        }
                        if (train == "GD" || train == "C") {
                            return "g";
                        } else {
                            return "pt";
                        }

                    };
                    //分类时间段
                    var timeAt = function (times) {
                        var t = parseInt(times.substring(0, 2));
                        var type;
                        if (t >= 0 && t < 6) {
                            type = "morning";
                        } else if (6 <= t && t < 12) {
                            type = "am";
                        } else if (12 <= t && t < 18) {
                            type = "pm";
                        } else {
                            type = "night";
                        }
                        return type;
                    };

                    if (data != null && data.trains != null) {
                        //添加一个时间为时分的参数&火车类型分类的参数&出发/到达时间归类（morning,am,pm,night）
                        for (var i = 0; i < data.trains.length; i++) {
                            data.trains[i].runTime = transTime(parseInt(data.trains[i].runTimeSpan)); //时间转换
                            data.trains[i].trainClassType = transType(data.trains[i].trainClass); //车类型转换
                            data.trains[i].fromTimeAt = "go-" + timeAt(data.trains[i].fromTime); //出发时间段
                            data.trains[i].toTimeAt = "at-" + timeAt(data.trains[i].toTime); //到达时间段

                            var tickets = data.trains[i].tickets;
                            $.each(tickets, function (index, obj) {
                                obj.seatClass = index;
                                obj.price = parseFloat(obj.price);
                                obj.upPrice = parseFloat(obj.upPrice);
                                obj.midPrice = parseFloat(obj.midPrice);
                                obj.downPrice = parseFloat(obj.downPrice);
                            });
                        }
                    }
                    sessionStorage.searchParam = JSON.stringify(trainQueryVue.searchParam);
                    sessionStorage.result = JSON.stringify(trainQueryVue.result);
                    $("#loading").css({"display": "none"});
                    judgeQueryResultMsg();
                    if (type === 0) {
                        var data = book1.model.trainData;

                        trainQueryVue.searchParam.fromStation = fromStation;
                        trainQueryVue.searchParam.toStation = toStation;
                        trainQueryVue.searchParam.trainDate = $("#datetimepicker").val();
                        trainQueryVue.searchParam.froms = data != null ? data.froms : [];
                        trainQueryVue.searchParam.tos = data != null ? data.tos : [];
                        trainQueryVue.result.totalCount = data != null ? data.totalCount : 0;
                        trainQueryVue.result.trains = data != null ? data.trains : [];
                    } else if(type === 1) {
                        trainQueryVue.result.totalCount = book1.model.trainData != null ? book1.model.trainData.totalCount : 0;
                        trainQueryVue.result.trains = book1.model.trainData != null ? book1.model.trainData.trains : [];
                        trainQueryVue.searchParam.froms = book1.model.trainData != null ? book1.model.trainData.froms : [];
                        trainQueryVue.searchParam.tos = book1.model.trainData != null ? book1.model.trainData.tos : [];
                    }
                }
            });

        },
        stopOverSearch: function (trainNo, fromStation, toStation, date) {
            var stopOverData;
            $.ajax({
                async: false,
                url: __ctx + "/train/stopOver",
                type: "get",
                data: {
                    "trainNo": trainNo,
                    "fromStation": fromStation,
                    "toStation": toStation,
                    "date": date
                },
                success: function (data) {
                    stopOverData = data.obj;
                }

            });
            return stopOverData;
        },
        //头部搜索栏操作事件集合
        searchFunc: function () {
            var _this = this;
            var dateToWeek = function (dateList) { //日期转换成星期
                var newDateStr = dateList.join("/");
                var aa = new Date(newDateStr).getDay();
                return "星期" + "日一二三四五六".split("")[aa];
            };
            //换
            $("#exchange").click(function () {
                var val1 = $("#fromStation").val();
                var val2 = $("#toStation").val();
                $("#fromStation").val(val2).trigger("change");
                $("#toStation").val(val1).trigger("change");
                //改变select2显示
                $($("#fromStation").prev().children("a").children("span")[0]).text(val2);
                $($("#toStation").prev().children("a").children("span")[0]).text(val1);

            });
            //选择日期
            // var cal = new $.Calendar({
            //     skin: "white",
            //     monthNum: 2
            // });

            $(".train_choose-time").on("click", ".selectdate", function () {
                trainQueryVue.result.trains = [];
                $(".train_choose-time").children("ul").children("li").removeClass("choose-time-style");
                $(this).addClass("choose-time-style");
                var dataList = $(this).children("p");
                var selectedDate = new Date().getFullYear() + "-" + dataList[0].innerHTML;
                selectedDate = $(".choose-time-style").attr("data-date");
                //调用站站查询函数：
                trainQueryVue.searchParam.trainDate = selectedDate;
                $("#datetimepicker").val(selectedDate);
                book1.model.trainDate = selectedDate;
                trainQueryVue.search();
            });

        },

        //筛选条件查询
        screenFunc: function ($this) {
            //全部隐藏
            $(".train_result-list li").addClass("dn");
            var trainType = []; //车类型--KG
            var goTime = []; //出发时间段
            var atTime = []; //到达时间段
            var goStation = []; //出发的车站
            var atStation = []; //到达的车站
            var stationType = []; //车站类型--始发、路过
            //拿到用户要求的筛选条件
            var $trainType = $("#trainType");
            var $goTime = $("#goTime");
            var $atTime = $("#atTime");
            var $goStation = $("#goStation");
            var $atStation = $("#atStation");
            var $stationType = $("#stationType");
            //DOM节点
            var $arr = [$trainType, $goTime, $atTime, $goStation, $atStation, $stationType];
            //存储筛选的值
            var demandArr = [trainType, goTime, atTime, goStation, atStation, stationType];
            for (var i = 0; i < $arr.length; i++) {
                $arr[i].children(".color-hover").each(function () {
                    var value = $(this).attr("data");
                    demandArr[i].push(value)
                });
            }
            //开始筛选
            $(".train_result-list li").each(function () {
                //初始化隐藏
                $(this).removeClass("dn");
                //获得每一辆列车的信息
                var trainClassType = $(this).attr("data-trainclasstype");
                var fromTimeAt = $(this).attr("data-fromtimeat");
                var toTimeAt = $(this).attr("data-totimeat");
                var fromStation = $(this).attr("data-fromStation");
                var toStation = $(this).attr("data-tostation");
                var fromPassType = $(this).attr("data-frompasstype");
                var conditionArr = [trainClassType, fromTimeAt, toTimeAt, fromStation, toStation, fromPassType];
                //如果不满足条件则隐藏该列车信息
                //记录不符合条件的车次数：
                for (var i = 0; i < conditionArr.length; i++) {
                    if (demandArr[i][0] != "all") {
                        if (demandArr[i].indexOf(conditionArr[i]) == -1) {
                            $(this).addClass("dn");
                        }
                    }
                }

            });
            trainQueryVue.result.limitedTotal = $(".train_result-list li").length - $(".train_result-list li.dn").length;
        },

        //页面显示相关事件
        mouseoverFunc: function () {
            var _this = this;
            //经停站显示隐藏
            var i = 0;
            $(".train_result-list").on('click', ".tra", function () {
                $(".stopover-station2").addClass("dn");
                // $(".stopover-station-hidden").addClass("dn");
                var index = $(this).attr("data-index");
                if (i == 0) {
                    var trainDate = $(this).attr("data-trainDate").replace(/-/g,"");
                    trainQueryVue.stopOverSearch($(this).attr("data"), $(this).attr("data-fromstation-tra"), $(this).attr("data-tostation-tra"), trainDate, index);
                    $(this).children(".stopover-station2").removeClass("dn");
                    // $(this).children(".stopover-station-hidden").removeClass("dn");
                    i++;
                } else if (i == 1) {
                    $(this).children(".stopover-station2").addClass("dn");
                    // $(this).children(".stopover-station-hidden").addClass("dn");
                    trainQueryVue.stopOverResult = undefined;
                    i--;
                }
            });
            //卧铺显示隐藏
            $(".train_result-list").on('mouseover', ".color-hover", function () {
                $(this).next(".seat-tips").removeClass("dn");
            });
            $(".train_result-list").on('mouseout', ".color-hover", function () {
                $(this).next(".seat-tips").addClass("dn");
            });
            //违反差旅政策显示隐藏
            $(".train_result-list").on("mouseover", ".tc-wranning", function () {
                $(this).next(".slip-policy").removeClass("dn");
            }).on("mouseout", ".tc-wranning", function () {
                $(this).next(".slip-policy").addClass("dn");
            });
            //显示更多筛选条件
            $(".show-morecheck").on('click', function () {
                $("#moreSelect").slideDown(300);
                $(this).slideUp(300);
                $(".hide-morecheck").slideDown(300)
            })
            $(".hide-morecheck").on('click', function () {
                $("#moreSelect").slideUp(300)
                $(this).slideUp(300);
                $(".show-morecheck").slideDown(300)
            });
            //各类筛选的点击事件
            $(".allcheckbox").on("click", ".buxian", function () {
                $(this).addClass("color-hover").siblings(".check").removeClass("color-hover").find("i").removeClass("checkbox-choose");
                _this.screenFunc($(this)); //筛选结果
            });
            $(".allcheckbox").on('click', '.check', function () {
                $(this).toggleClass("color-hover").children().toggleClass("checkbox-choose");
                //判断是否筛选了，若没有则显示不限
                if ($(this).siblings(".color-hover").length > 0) {
                    $(this).siblings(".buxian").removeClass("color-hover");
                } else {
                    $(this).siblings(".buxian").addClass("color-hover");
                }
                _this.screenFunc($(this)); //筛选结果
            });
        }

    };
    book1.init();

    $("#search").on("click", function () {
        $("#dates").children().remove();
        book1.dateShow();

        book1.model.trainDate = $("#datetimepicker").val();
        if ($("#fromStation").val() == "" || $("#toStation").val() == "") {
            toastr.warning("请选择出发、到达城市！", "", {
                "positionClass": "toast-top-center"
            });
            return;
        }
        trainQueryVue.result.trains = [];
        var fromStation = $("#fromStation").val().split(",")[0];
        var toStation = $("#toStation").val().split(",")[0];
        book1.getTrainListAjax(fromStation, toStation, $("#datetimepicker").val(), 0);
    });

    $("#backPage").on("click", function () {
        window.history.back();
    });

    $(".time-consuming").on('click', function () {
        var arr = trainQueryVue.result.trains;

        $(this).toggleClass("sort-time");
        if ($(this).hasClass("sort-time")) {
            $(this).find("i").removeClass("reverse-img").addClass("sort-img");
            arr.sort(function (a, b) {
                return a.runTimeSpan - b.runTimeSpan;
            });
        } else {
            $(this).find("i").removeClass("sort-img").addClass("reverse-img");
            arr.sort(function (a, b) {
                return b.runTimeSpan - a.runTimeSpan;
            });
        }
        trainQueryVue.result.trains = arr;
    });

    $(".arrival-time").on('click', function () {
        var arr = trainQueryVue.result.trains;

        $(this).toggleClass("sort-time");
        if ($(this).hasClass("sort-time")) {
            $(this).find("i").removeClass("reverse-img").addClass("sort-img");
            arr.sort(function (a, b) {
                return a.beginTime - b.beginTime;
            });
        } else {
            $(this).find("i").removeClass("sort-img").addClass("reverse-img");
            arr.sort(function (a, b) {
                return b.beginTime - a.beginTime;
            });
        }
        trainQueryVue.result.trains = arr;
        $(".train_result-list ul").empty();
        for (var i = 0; i < arr.length; i++) {
            $(".train_result-list ul").append(arr[i]);
        }
    });
    
    $(".arrival-time").on('click', function () {
    	var arr = trainQueryVue.result.trains;
    	
    	$(this).toggleClass("sort-time");
        if ($(this).hasClass("sort-time")) {
            $(this).find("i").removeClass("reverse-img").addClass("sort-img");
            arr.sort(function (a, b) {
                return a.beginTime - b.beginTime;
            });
        } else {
            $(this).find("i").removeClass("sort-img").addClass("reverse-img");
            arr.sort(function (a, b) {
                return b.beginTime - a.beginTime;
            });
        }
        trainQueryVue.result.trains = arr;
    });

    function judgeQueryResultMsg() {
        if ((trainQueryVue.result.trains == null || trainQueryVue.result.trains.length == 0) &&
            (sessionStorage.result == null || sessionStorage.result.trains == null || sessionStorage.result.trains.length == 0)) {
            trainQueryVue.result.limitedTotal == 0
        } else {
            // $("#queryResultMsg").hide();
        }
    }

    judgeQueryResultMsg();
});
