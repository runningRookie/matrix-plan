/**
 * Created by hzy24985 on 2016/4/25.
 */

/**
 * 将后台传来的数字型日期转成日期字符串, 格式按照momentjs类库做转换.
 * eg. data | toDate 'YYYY-MM-DD'
 *
 * @param format {String} 日期格式, 参照momentjs.
 * @author hzy24985
 */
Vue.filter('toDate', {
    read: function (value, format) {
        if (value) {
            if (value == '' || value == null || value == '-28800000' || value == '631123200000' || value == '-2209017600000' || value == '1970-01-01 00:00:00' || value == '1900-01-01 00:00:00') {
                return '';
            }
            return moment(value).format(format);
        } else {
            return value;
        }
    },
    write: function (value, format) {
        return value;
    }
});


/**
 * datas arr
 * 将 datas 里面对应的value显示为对应的text 页面过滤
 */
Vue.filter('toViewStr', {
    read: function (value, datas) {
        var text;
        $(datas).each(function (i, e) {
            if (value == e.value) {
                text = e.text;
            }
        });
        if (!text) {
            text = value;
        }
        return text;
    }
});
/**
 * 枚举值转换, 单项绑定，不会回写值.
 * @param value     {String}        传过来的值
 * @param all       {Array}         列表数据
 * @param feild     {String}  可选  列表中的属性名称, default: value
 * @param showFeild {String}  可选  显示成列表中的属性名称  default: text
 * @author hzy24985
 */
Vue.filter('enumFormat', function (value, all, feild, showFeild) {
    var text, feildName = feild, showName = showFeild;
    if (!feild) {
        feildName = 'value';
    }
    if (!showFeild) {
        showName = 'text';
    }
    $(all).each(function (index, item) {
        if (item[feildName] == value) {
            text = item[showName];
        }
    });
    return text;
});
/**
 * 结算方式转换
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('toPaymentType', function (value) {
    if (value == 'n') {
        return '现结';
    } else {
        return '授信';
    }
});
/**
 * 航段顺序描述
 * @param value {String}
 */
Vue.filter('segmentDesc', function (value) {
    return '航段' + (parseInt(value) + 1);
});

/**
 * 经停城市列表转为字符串
 */
Vue.filter('toStopCities', function (arr) {
    return _.map(arr, function (item) {
        return item.stopCity;
    }).toString();
});
/**
 * 转换折扣信息描述
 */
Vue.filter('discountTransfer', function (val) {
    if (!val) {
        return '';
    }
    if (val == 10) {
        return '全折';
    }
    return val.toFixed(1) + '折';
});
/**
 * 审批状态转换
 */
Vue.filter('auditStatusDesc', function (val) {
    var map = ['', '待审批', '审批中', '审批通过', '审批否决', '撤销审批'];
    return val && map[val];
});
/**
 * 价格类型转换
 */
Vue.filter('priceTypeDesc', function (val) {
    var map = ['非协议价', '协议价'];
    return val && map[val];
});
/**
 * 订单状态装换
 * @param value {String} 值:
 */
Vue.filter('flightOrderStatusFilter', function (value) {
    if (value == '01') {
        return '订单取消';
    } else if (value == '02') {
        return '待提交';
    } else if (value == '03') {
        return '待审批';
    } else if (value == '04') {
        return '审批中';
    } else if (value == '05') {
        return '审批不通过';
    } else if (value == '06') {
        return '待支付';
    } else if (value == '07') {
        return '待人工出票';
    } else if (value == '08') {
        return '出票驳回';
    } else if (value == '09') {
        return '出票驳回待审核';
    } else if (value == '10') {
        return '出票驳回审核通过';
    } else if (value == '11') {
        return '出票驳回审核不通过';
    } else if (value == '12') {
        return '出票成功';
    } else if (value == '13') {
        return '变更中';
    } else if (value == '14') {
        return '部分改期';
    } else if (value == '15') {
        return '部分退票';
    } else if (value == '16') {
        return '已改期';
    } else if (value == '17') {
        return '已退票';
    } else if (value == '18') {
        return '待自动出票';
    }
});
/**
 * 火车票订单状态
 */
Vue.filter('trainOrderStatusFilter', function (value) {
    if (value == 'C') {
        return '订单已取消';
    }
    if (value == 'N') {
        return '占座中';
    }
    if (value == 'D') {
        return '待提交';
    }
    if (value == 'S') {
        return '待审批';
    }
    if (value == 'G') {
        return '审批中';
    }
    if (value == 'H') {
        return '审批不通过';
    }
    if (value == 'B') {
        return '购票失败';
    }
    if (value == 'A') {
        return '待支付';
    }
    if (value == 'O') {
        return '订单已过期';
    }
    if (value == 'E') {
        return '已申请出票';
    }
    if (value == 'U') {
        return '申请出票失败';
    }
    if (value == 'F') {
        return '出票成功';
    }
    if (value == 'P') {
        return '出票失败';
    }
    if (value == 'Y') {
        return '部分退票';
    }
    if (value == 'X') {
        return '部分改签';
    }
    if (value == 'Q') {
        return '已全部改签';
    }
    if (value == 'T') {
        return '已全部退票';
    }
    else {
        return '未知状态';
    }
});

/**
 * 审批单状态转换
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('orderApprovalFilter', function (value) {
    if (value == '01') {
        return '待审批';
    } else if (value == '02') {
        return '审批中';
    } else if (value == '03') {
        return '审批不通过';
    } else if (value == '04') {
        return '审批通过';
    } else {
        return '';
    }
});
Vue.filter('toRefundStatus', function (value) {
    if (value == '01') {
        return '待处理';
    } else if (value == '02') {
        return '已处理，未退款';
    } else if (value == '03') {
        return '已处理，已退票';
    } else if (value == '04') {
        return '已驳回';
    } else if (value == '05') {
        return '申请中';
    }
});
/**
 * 审批单状态转换
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('flightSourceFilter', function (value) {
    if (value == '1') {
        return '自出';
    } else {
        return '外购';
    }
});
/**
 * 审批单状态转换
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('productCodeFilter', function (value) {
    if (value == 'DA1') {
        return '国内机票';
    } else if (value == 'DT1') {
        return "国内火车票";
    } else {
        return '其他';
    }
});
/**
 * 审批单状态转换
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('channelFromFilter', function (value) {
    if (value == '1') {
        return '电话';
    } else if (value == '2') {
        return '邮件';
    } else {
        return '';
    }
});
/**
 * 乘客类型
 */
Vue.filter('toPassengerClass', function (value) {
    if (value == 'a') {
        return '成人';
    } else if (value == 'c') {
        return '儿童';
    } else {
        return "婴儿";
    }
});
/**
 * 乘客类型（儿童）
 */
Vue.filter('toPassengerClassCHD', function (value) {
	if (value == 'c') {
		return 'CHD';
	} else {
		return "";
	}
});
/**
 * 是否
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('booleanFilter', function (value) {
    if (value == '0') {
        return '否';
    } else if (value == '1') {
        return "是";
    } else {
        return "";
    }
});
/**
 * 是否
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('priceTypeFilter', function (value) {
    if (value == '0') {
        return '非协议价';
    } else {
        return "协议价";
    }
});
/**
 * 是否
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('bookTypeFilter', function (value) {
    if (value == '1') {
        return '自动';
    } else if (value == '2') {
        return "手工";
    } else {
        return "";
    }
});

// ====train=====
/**
 * 火车票预定方式（1-电话，2-邮件）
 */
Vue.filter('trainBookTypeFilter', function (value) {
    if (value == 1) {
        return '电话';
    } else if (value == 2) {
        return "邮件";
    } else {
        return "";
    }
});

/**
 * 证件类型（取自基础数据库）
 */
Vue.filter('certificateTypeCodeFilter', function (value) {
    if (value == "1") {
        return '身份证';
    } else if (value == "2") {
        return "公务护照";
    } else if (value == "3") {
        return "普通护照";
    } else if (value == "4") {
        return "港澳通行证";
    } else if (value == "5") {
        return "台胞证";
    } else if (value == "6") {
        return "回乡证";
    } else if (value == "7") {
        return "军人证";
    } else if (value == "8") {
        return "海员证";
    } else if (value == "9") {
        return "其它";
    } else {
        return "";
    }
});
/**
 * 火车票状态（N-未出票,F-已出票,C-退票中,T-已退票,B-申请退票失败,O-退票失败,Y-改签中,G-已改签）
 */
Vue.filter('trainTicketStatusFilter', function (value) {
    if (value == "N") {
        return '未出票';
    } else if (value == "F") {
        return "已出票";
    } else if (value == "C") {
        return "退票中";
    } else if (value == "B") {
        return "申请退票失败";
    } else if (value == "T") {
        return "已退票";
    } else if (value == "O") {
        return "退票失败";
    } else if (value == "Y") {
        return "改签中";
    } else if (value == "G") {
        return "已改签";
    } else {
        return value;
    }
});
/**
 * 服务人员类别
 */
Vue.filter('servicePersonTypeFilter', function (value) {
    var reg = /^[0-9]*$/;
    if(!reg.test(value)){
        return value;
    } else if (value == 1) {
        return '老板';
    } else if (value == 2) {
        return '秘书';
    } else if (value == 3) {
        return '司机';
    } else {
        return '';
    }
});
/**
 * 违反差旅政策内容转换
 */
Vue.filter('trainViolationFliter', function (value) {
    var arr = value.split("TTTTTTTTT");
    var violationContentStr = '';
    for (var i = 0; i < arr.length; i++) {
        violationContentStr += (i + 1) + "：" + arr[i] + '';
    }
    return violationContentStr;
});

/**
 * 根据服务人列表获取名字（以逗号分隔）
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('genServicePersonNames', function (value) {
    return _.map(value, function (item) {
        return item.servicePersonName;
    }).toString();
});

/**
 * 是否
 * @param value {String} 值:n-现付 m-授信
 */
Vue.filter('ticketModeFilter', function (value) {
    if (value == 0) {
        return '未知';
    } else if (value == 1) {
        return "自动";
    } else if (value == 2) {
        return "手工";
    }
});

/**
 * 审批状态转换
 */
Vue.filter('outTicketFailFilter', function (val) {
    if (!val) {
        val = 0;
    }
    var map = ['正常', '不符合自动出票条件', '乘机人信息不一致', '航段信息不一致', '航段状态不正常', '价格不一致', '调用出票接口失败', '更新订单信息失败', '调用PNR解析接口失败', '服务接口返回数据为空'];
    return map[val];
});

/**
 * 渠道来源转换
 */
Vue.filter('channelTypeDesc', function (val) {
    if (!val) {
        val = 0;
    }
    var map = ['', 'Online（PC）', 'Online（APP）', 'Online（WX）', 'Online（API）', 'Offline（白屏）', 'Offline（手工）'];
    return val && map[val];
});

/**
 * 票种转换
 */
Vue.filter('ticketTypeDesc', function (val) {
    var map = ['', 'BSP', 'B2B', 'B2G', 'BOP', '官网', '外购'];
    return val && (map[val] || val);
});
Vue.filter('terminalFilter', function (value) {
    if (value == '--') {
        return '';
    } else {
        return value;
    }
});
/**
 * 舱等转换
 */
Vue.filter('seatClassDesc', function (val) {
    var map = ['', '经济舱', '超值经济舱', '公务舱', '头等舱'];
    return val && map[val];
});
/**
 * 改期类型转换
 */
Vue.filter('changeTypeDesc', function (val) {
    return val == 1 ? '收费改期' : '免费改期';
});
/**
 * 改期支付方式转换
 */
Vue.filter('paymentTypeDesc', function (val) {
    if (val == 'n') {
        return '现付';
    } else if (val == 'm') {
        return '授信';
    } else {
        return '';
    }
});
/**
 * 改期支付方式代码转换
 */
Vue.filter('changePaymentMethodCodeDesc', function (val) {
    if (val == 'IN') {
        return '月结';
    } else if (val == 'AL') {
        return '支付宝';
    } else if (val == 'QW') {
        return '微信';
    } else if (val == 'CC') {
        return '公司信用卡';
    } else if (val == 'CP') {
        return '个人信用卡';
    } else if (val == 'DC') {
        return '现金';
    } else if (val == 'DB') {
        return '银行转帐';
    } else {
        return '';
    }
});
/**
 * 违反差旅政策内容转换
 */
Vue.filter('violationFliter', function (value) {
    var arr = value.split(window.TRAVELPOLICY_SPLITSYMBOL);
    var violationContentStr = '';
    for (var i = 0; i < arr.length; i++) {
        violationContentStr += (i + 1) + "：" + arr[i] + '</br>';
    }
    return violationContentStr;
});
/**
 * 金额运算(浮点问题)
 */
Vue.filter('floatFliter', function (value) {
    var arr = value.split(window.TRAVELPOLICY_SPLITSYMBOL);
    var violationContentStr = '';
    for (var i = 0; i < arr.length; i++) {
        violationContentStr += (i + 1) + "：" + arr[i] + '</br>';
    }
    return violationContentStr;
});
/**
 * 保险购买状态转换
 */
Vue.filter('insuranceStatusDesc', function (val) {
    var map = ['待购', '已购', '投保失败', '', '已退', '退保失败'];
    return map[val];
});
/**
 * 渠道来源
 *    1：Online（PC）
 2：Online（APP）
 3：Online（WX）
 4：Online（API）
 5：Offline（白屏）
 6：Offline（手工）
 */
Vue.filter('trainChannelFromFilter', function (val) {
    var map = ['', 'Online（PC）', 'Online（APP）', 'Online（WX）', 'Online（API）', 'Offline（白屏）', 'Offline（手工）'];
    return map[val];
});
/**
 * 获取占座过期时间
 * 占座过期时间计算：判断发车时间，发车时间在2小时以内的，座位有效时长为5分钟，发车前2小时以上，座位有效时长为22分钟
 */
Vue.filter('expireTicketTime', function (occupySeatTime, planBeginDate, format) {
    if (occupySeatTime && planBeginDate) {
        if (occupySeatTime == '-28800000' || occupySeatTime == '631123200000' || occupySeatTime == '-2209017600000' || occupySeatTime == '1970-01-01 00:00:00' || occupySeatTime == '1900-01-01 00:00:00' || planBeginDate == '-2209017600000' || planBeginDate == '1970-01-01 00:00:00' || planBeginDate == '1900-01-01 00:00:00') {
            return '';
        }
        if (moment(occupySeatTime).add(2, 'hour').isBefore(moment(planBeginDate))) {
            return moment(occupySeatTime).add(22, 'minute').format(format);
        } else {
            return moment(occupySeatTime).add(5, 'minute').format(format);
        }
    }
});
/**
 * 获取座位类别
 */
Vue.filter('seatClassFilter', function (value) {
    var map = {
        "hardseat": "硬座",
        "softseat": "软座",
        "firstseat": "一等座",
        "secondseat": "二等座",
        "hardsleeperup": "硬卧上铺",
        "hardsleepermid": "硬卧中铺",
        "hardsleeperdown": "硬卧下铺",
        "softsleeperup": "软卧上铺",
        "softsleeperdown": "软卧下铺",
        "noseat": "无座",
        "businessseat": "商务座",
        "specialseat": "特等座",
        "advancedsoftsleeper": "高级软卧",
        "otherseat": "其他",
        "": "",
    };
    return map[value];
});
/**
 * 把数字转为汉字
 */
Vue.filter('indexTransfer', function (val) {
    var map = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return map[val];
});

/**
 * 保障气象 1-单次  7-7天
 */
Vue.filter('insurancePeriodDesc', function (val) {
    if (val == 1) {
        return '单次';
    }
    if (val == 2) {
        return '7天';
    }
    return '';
});


/**
 * 把数字转为汉字
 */
Vue.filter('flightTicketStatusTransfer', function (val) {
	var map = {
	        "X": "未出票",
	        "A": "出票成功",
	        "B": "退票中",
	        "E": "已退票",
	        "F":"改期中",
	        "H":"已改期",
	        "": "",
	    };
    return map[val];
});

Vue.filter('flightTicketStatus', function (val) {
    if (val == 'X') {
        return '未出票';
    }
    if (val == 'A') {
        return '出票成功';
    }

    if (val == 'B') {
        return '退票中';
    }
    if (val == 'E') {
        return '已退票';
    }
    if (val == 'F') {
        return '改期中';
    }
    if (val == 'H') {
        return '已改期';
    }
    return '';
});

/**
 * 折扣
 */
Vue.filter('flightDiscountDesc', function (val) {
    if (val == '10') {
        return '全';
    }
    return val;
});

/**
 * 展示乘客姓名
 */
Vue.filter('passengerNameDesc', function (item) {
	if (item) {
		if (item.passengerName && !item.passengerEnlishName) {
			return item.passengerName;
		} else if (!item.passengerName && item.passengerEnlishName) {
			if (item.passengerEnlishName == "/") {
				return "";
			} else {
				return item.passengerEnlishName;
			}
		} else if (item.passengerName && item.passengerEnlishName) {
			if (item.passengerEnlishName == "/") {
				return item.passengerName;
			} else {
				return item.passengerName + "(" + item.passengerEnlishName + ")";
			}
		}
	} else {
		return "";
	}
});

Vue.filter('passengerNameDesc2', function (item) {
    if (!!item.passengerName) {
        return item.passengerName;
    }
    if (!!item.passengerEnlishName) {
        return item.passengerEnlishName;
    }
    if (!!item.passengerNickname) {
        return item.passengerNickname;
    }
    return '';
});
/**
 * 展示预订人姓名
 */
Vue.filter('bookPersonNameDesc', function (item) {
    if (item) {
		if (item.bookPersonName && !item.bookPersonEnlishName) {
			return item.bookPersonName;
		} else if (!item.bookPersonName && item.bookPersonEnlishName) {
			if (item.bookPersonEnlishName == "/") {
				return "";
			} else {
				return item.bookPersonEnlishName;
			}
		} else if (item.bookPersonName && item.bookPersonEnlishName) {
			if (item.bookPersonEnlishName == "/") {
				return item.bookPersonName;
			} else {
				return item.bookPersonName + "(" + item.bookPersonEnlishName + ")";
			}
		}
	} else {
		return "";
	}
});

Vue.filter('bookPersonNameDesc2', function (item) {
    if (!!item.bookPersonName) {
        return item.bookPersonName;
    }
    if (!!item.bookPersonEnlishName) {
        return item.bookPersonEnlishName;
    }
    if (!!item.bookPersonNickname) {
        return item.bookPersonNickname;
    }
    return '';
});
/**
 * 差旅配置判断
 */
Vue.filter('violationTransfer', function (val) {
    if (val == 0) {
        return '否';
    }
    if (val == 1) {
        return '是';
    }
    if (val == 2) {
        return '未配置';
    }
    return '';
});
/**
 * 保险赠送展示过滤
 */
Vue.filter('insuranceRuleTransfer', function (item) {
    if (item.buyType == 4) {
        return '强制购买';
    }
    if (['1', '2'].indexOf(item.buyType) >= 0) {
        var nowDate = moment();
        if (tc.insurance.startTransfer(item.presentValidStartTime) <= nowDate && nowDate <= tc.insurance.endTransfer(item.presentValidEndTime)) {
            return '赠送';
        }
    }
    return '';
});
/**
 * 订单过期状态判断
 */
Vue.filter('outDateStatusFilter', function (val) {
    if (val == 1) {
        return '（订单过期）';
    }
    return '';
});

/**
 * 渠道判断
 */
Vue.filter('channelTypeFilter', function (val) {
    if (val == 1) {
        return 'IBE+';
    }
    if (val == 2) {
        return '同程IBE';
    }
    if (val == 3) {
        return '同程分销';
    }
    return '';
});

/**
 * 详情页产品类型
 */
Vue.filter('orderDetailResourceTypeFilter', function (val) {
    if (val == '1') {
        return '大唐IBE+';
    } else if (val == '2') {
        return '商旅IBE+';
    } else if (val == '3') {
        return '商旅自出';
    } else if (val == '4') {
        return '商旅外购';
    } else if (val == '5') {
        return '分销官网';
    } else if (val == '6') {
        return '分销代理';
    } else if (val == '7') {
        return '分销自出';
    } else {
        return '';
    }
});