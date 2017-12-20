var tc = tc || {};
tc.ns = function (ns, func) {
    var object = window;
    var tokens = ns.split('.');

    while (tokens.length > 0) {
        var token = tokens.shift();

        object[token] = object[token] || {};

        if (!tokens.length && !!func) {
            object[token] = func;
        }

        object = object[token];
    }
};

var toastrConfig = {
    timeOut: 2000,
    positionClass: "toast-top-center"
};

/**
 * 提示框
 *
 * @param content
 *            提示内容
 * @param callback
 *            回调函数
 */
function promptFnc(content, callback) {
    $('#promptModal').modal({
        backdrop: 'static'
    });
    $("#promptModal").modal('show');
    if (content != "" && content != null) {
        $("#promptBody").html(content);
    }

    $("#promptSuccessBtn").unbind();
    $("#promptSuccessBtn").click(function () {
        callback();
        $("#promptModal").modal('hide');
    });

}

window.TRAVELPOLICY_SPLITSYMBOL = 'TTTTTTTTT';

/**
 * return false if arr is null or [], else return true
 * @param arr
 * @returns {boolean}
 */
tc.ns('tc.arr.isNotEmpty', function (arr) {
    return !!arr && arr.length > 0;
});
/**
 * return true if arr is null or [], else return false
 * @param arr
 * @returns {boolean}
 */
tc.ns('tc.arr.isEmpty', function (arr) {
    return !tc.arr.isNotEmpty(arr);
});
tc.ns('tc.flight.detail.utils.genTableTemplate', function (ths, trs) {
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
        var template = '<div><table class="flightTipTable" style="background-color: #000">';
        if (tc.arr.isNotEmpty(ths)) {
            template += '<thead><tr>';
            _.forEach(ths, function (val) {
                template += '<th>' + val + '</th>';
            });
            template += '</tr></thead>';
        }
        template += '<tbody>';
        template += genTrs(trs);
        template += '</tbody></table></div>';
        return template;
    };

    return genTableTemplate(ths, trs);
});
/**
 * 加载loading框
 */
tc.ns('tc.startLoading', function () {
    Metronic.blockUI({boxed: true});
});
/**
 * 停止loading框
 */
tc.ns('tc.stopLoading', function () {
    Metronic.unblockUI();
});
tc.ns('tc.flight.utils.genTableTemplate', tc.flight.detail.utils.genTableTemplate);
/**
 * 转换保险日期，去掉时分秒，开始时间00:00:00，结束时23:59:59
 * @param date String类型日期
 * @param time 后缀得时分秒时间，（00:00:00， 23:59:59）
 * @return moment格式得时间
 */
tc.ns('tc.insurance.dateTransfer', function (date, time) {
    var formatDate = moment(date).format("YYYY-MM-DD");
    return moment(formatDate + ' ' + time);
});
tc.ns('tc.insurance.startTransfer', function (date) {
    return tc.insurance.dateTransfer(date, '00:00:00');
});
tc.ns('tc.insurance.endTransfer', function (date) {
    return tc.insurance.dateTransfer(date, '23:59:59');
});