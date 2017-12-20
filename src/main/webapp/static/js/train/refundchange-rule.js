$(document).ready(function () {
	
	 var genTableTemplate = function () {
	        var template = '<div><table style="background-color: #000;margin:-8px;">';
	        template += '<tr>';
	        template += '<td style="min-width: 500px;text-align: left;">&nbsp;</td>';
	        template += '</tr>';
	        template += '<tr>';
	        template += '<td style="min-width: 500px;text-align: left;">&nbsp; 退票说明：</td>';
	        template += '</tr>';
	        template += '<tr>';
	        template += '<td style="min-width: 500px;text-align: left;">&nbsp; 1.代购成功，未取票且发车前时间大于35分钟，发车前15天以内的退票，铁路局将对每张车票按梯次收取退票手续费。</td>';
	        template += '</tr>';
	        template += '<tr>';
	        template += '<td style="min-width: 500px;text-align: left;">&nbsp; 2.代购成功，已取票或发车前时间小于35分钟，需您自行携带购票时所使用的乘车人有效证件原件和火车票在发车前去火车站退票窗口办理退票。</td>';
	        template += '</tr>';
	        template += '<tr>';
	        template += '<td style="min-width: 500px;text-align: left;">&nbsp; 改签说明：</td>';
	        template += '</tr>';
	        template += '<tr>';
	        template += '<td style="min-width: 500px;text-align: left;">&nbsp; 1.未取纸质票，且离发车时间大于35分钟，可改签等于或低于原车票票价的车次。其他不能在线改签的情况需在发车前至火车站窗口办理。</td>';
	        template += '</tr>';
	        template += '<tr>';
	        template += '<td style="min-width: 500px;text-align: left;">&nbsp; 2.开车前48小时以上，可改签预售期内的车次。开车前48小时以内，可改签至票面当天24：00之前任意车次，不办理票面日期次日及以后的改签。</td>';
	        template += '</tr>';
	        template += '<tr>';
	        template += '<td style="min-width: 500px;text-align: left;">&nbsp; 3.新车票票价低于原车票的，退还差额。</td>';
	        template += '</tr>';
	        template += '<tr>';
	        template += '<td style="min-width: 500px;text-align: left;">&nbsp;</td>';
	        template += '</tr>';
	        template += '</table></div>';
	        return template;
	    };
         $('.refundchangerule').tooltip({
        	 container: 'body',
        	 placement:'right',
        	 title: genTableTemplate(),
        	 html: true
        	 });
});