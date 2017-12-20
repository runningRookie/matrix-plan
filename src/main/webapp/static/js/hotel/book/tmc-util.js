//获取链接上的参数
var getParam = function (search) {
    search = search.replace(/#.+$/,'');
    var re = {};
     if (search == "" || typeof search == "undefined") {
        return {};
    } else {
        search = search.substr(1).split('&');
        for (var i = 0, len = search.length; i < len; i++) {
            var tmp = search[i].split('=');
            if(i == 0 && tmp.length == 1) {//?132141
                return {
                    '__search__' : tmp[0]
                };
            }
            re[tmp.shift()] = tmp.join('=');
        }
        return re;
    }
};
var _param = getParam(window.location.search);
    

//低版本浏览器兼容placeholder
function addPlaceholder() {
    //判断浏览器是否支持placeholder属性
    supportPlaceholder = 'placeholder' in document.createElement('input'),
        placeholder = function(input) {
            var text = input.attr('placeholder'),
                defaultValue = input.defaultValue;
            if (!defaultValue) {
                input.val(text).addClass("phcolor");
            }
            input.focus(function() {
                if (input.val() == text) {
                    input.val("");
                }
            });
            input.blur(function() {
                if (input.val() == "") {
                    input.val(text).addClass("phcolor");
                }
            });
            //输入的字符不为灰色
            input.keydown(function() {
                input.removeClass("phcolor");
            });
        };
    //当浏览器不支持placeholder属性时，调用placeholder函数
    if (!supportPlaceholder) {
        $('input').each(function() {
            if ($(this).attr("type") == "text" && $(this).val()=="") {
                placeholder($(this));
            }
        });       
    }
};
addPlaceholder();

jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

//加入loading动画
var TmcLoading = {
	open : function(text){
		$("body").append('<div id="tmc-loading"><p><br>'+text+'</p></div>');
	},
	close :function(){
		$("#tmc-loading").remove();
	}	
}

var NewPCPopHelper = {
        alert : function(text,func){
			var HTML = "<div id='new_pc_pop'>\
                       	<div id='new_pc_alert'>\
                       		<span>"+text+"</span>\
							<a>确定</a>\
                       	</div>\
                       </div>";
 			$("body").append(HTML);
			$("#new_pc_alert").css("margin-top",-$("#new_pc_alert").height()/2)			
			$("#new_pc_alert>a").click(function(){
				$("#new_pc_pop").remove();
				if(func){func()};
			});
	       		
		},

        isToContinueBooking : function(text,func, func1){
            var HTML = "<div id='new_pc_pop'>\
                            <div id='new_pc_alert'>\
                                <span>"+text+"</span>\
                                <a id='isToContinueBooking_cancel'>取消</a>\
                                <a id='isToContinueBookingcontinue'>继续预订</a>\
                            </div>\
                           </div>";
            $("body").append(HTML);
            $("#new_pc_alert").css("margin-top",-$("#new_pc_alert").height()/2)
            $("#isToContinueBooking_cancel").click(function(){
                $("#new_pc_pop").remove();
                if(func){func()};
            });
            $("#isToContinueBookingcontinue").click(function(){
                $("#new_pc_pop").remove();
                if(func){func1()};
            });
        },

/***param参数对象：
   content  --    弹窗内容
   btn1     --    左边按钮名称
   btn2     --    右边按钮名称
   func1     --   左边按钮回调函数 (如何不填默认关闭弹窗)
   func2     --   右边按钮回调函数（如何不填默认关闭弹窗)
 ***/	
		confirm : function(param){
           var HTML = "<div id='new_pc_pop'>\
		   				<div id='new_pc_confirm'>\
           					<span>"+param.content+"</span>\
           					<a id='new_pc_confirm_a1'>"+param.btn1+"</a>\
           					<a id='new_pc_confirm_a2'>"+param.btn2+"</a>\
       					</div>\
   					   </div>";
 			$("body").append(HTML);
            $("#new_pc_confirm").css("margin-top",-$("#new_pc_confirm").height()/2)		
            $("#new_pc_confirm_a1").click(function(){
				$("#new_pc_pop").remove();
				if(param.func1){param.func1()};
			});
            $("#new_pc_confirm_a2").click(function(){
				$("#new_pc_pop").remove();
				if(param.func2){param.func2()};
			});
        },
        /***param参数对象：
         title	--    弹窗标题
         content  --    弹窗内容
         input    --    输入框
         btn1     --    左边按钮名称
         btn2     --    右边按钮名称
         func1     --   左边按钮回调函数 (如何不填默认关闭弹窗)
         func2     --   右边按钮回调函数（如何不填默认关闭弹窗)
         ***/
        input : function (param) {
            var HTML = "<div id='new_pc_pop'>\
		   				<div id='new_pc_input'>\
		   				    <div>\
                                <label>"+param.label+"</label>\
                                <input type='text' placeholder='非必填' id='input-content' value=''>\
                            </div>\
           					<a id='new_pc_input_a1'>"+param.btn1+"</a>\
           					<a id='new_pc_input_a2'>"+param.btn2+"</a>\
       					</div>\
   					   </div>";
            $("body").append(HTML);
            $("#new_pc_input").css("margin-top",-$("#new_pc_input").height()/2)
            $("#new_pc_input_a1").click(function(){
                if(param.func1){param.func1()};
                $("#new_pc_pop").remove();
            });
            $("#new_pc_input_a2").click(function(){
                if(param.func2){param.func2()};
                $("#new_pc_pop").remove();
            });
        },
        select : function (param) {
            var HTML = "<div id='new_pc_pop'>\
                            <div id='new_pc_select'>\
                                <div>\
                                    <span class='select-title'><i class='star'>*</i>"+param.label+"</span>\
                                    <span class='select_box'>\
                                        <p class='select-value'>请选择差旅目的</p>\
                                        <ul class='select-list'>"+param.listHtml+"</ul>\
                                        <div class='error'>错误</div>\
                                    </span>\
                                </div>\
                                <a id='new_pc_select_a1'>"+param.btn1+"</a>\
                                <a id='new_pc_select_a2'>"+param.btn2+"</a>\
                            </div>\
                        </div>";
            $("body").append(HTML);
            $("#new_pc_pop").click(function(){
                $(".select-list").hide();
            })
            $(".select-value").click(function(event){
                if(event.stopPropagation){event.stopPropagation()}else{event.cancelBubble=true};
                $("#error").hide();
                $(".select-list").show()
            });
            $(".select-list li").click(function(){
                $(".select-value").text($(this).text());
                $(".select-list").hide();
            });
            $("#new_pc_select").css("margin-top",-$("#new_pc_input").height()/2)
            $("#new_pc_select_a1").click(function(){
                if(param.func1){param.func1()};
                //$("#new_pc_pop").remove();
            });
            $("#new_pc_select_a2").click(function(){
                if(param.func2){param.func2()};
                $("#new_pc_pop").remove();
            });
        }
      }
 function IdentityCodeValid(code) { 
            var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
            var tip = "";
            var pass= true;
            
            if(!code || !/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(code)){
                        
                tip = "身份证号格式错误";
                pass = false;
            }
            
           else if(!city[code.substr(0,2)]){
                tip = "地址编码错误";
                pass = false;
            }
            else{
                //18位身份证需要验证最后一位校验位
                if(code.length == 18){
                    code = code.split('');
                    //∑(ai×Wi)(mod 11)
                    //加权因子
                    var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
                    //校验位
                    var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
                    var sum = 0;
                    var ai = 0;
                    var wi = 0;
                    for (var i = 0; i < 17; i++)
                    {
                        ai = code[i];
                        wi = factor[i];
                        sum += ai * wi;
                    }
                    var last = parity[sum % 11];
                    if(parity[sum % 11] != code[17]){
                        tip = "校验位错误";
                        pass =false;
                    }
                }
            }
            return pass;
       }
//兼容IE8不支持“indexOf”属性或方法
if (!Array.prototype.indexOf){
    Array.prototype.indexOf = function(elt /*, from*/){
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++){
            if (from in this && this[from] === elt)
                return from;
        }
        return -1;
    };
}
 //页面头部
 	$("#logOut").on("click",function(){
		$.cookie('tmcToken', "",{ expires: -1, path: '/' });
		$.cookie('tmcUs', "",{ expires: -1, path: '/' });
		window.location.href = 'login';
	});
	
//获取头部行程参数所带的数据
function getxingchengKey(key){
    var data;
    $.ajax({
        url : '/tmc/api/passenger/queryTemp-flight',
        type : 'post',
        dataType : 'json',
        data : JSON.stringify({"key":key}),
        contentType: "application/json; charset=utf-8",
        async:false,
        success : function (json) {
            if(json.result){
                data = JSON.parse(json.obj.pcRedis);
            }else{
                console.log("获取行程存储数据失败");    
            }
        },
        error:function(){
            console.log("获取行程存储数据失败");    
        }
    }); 
    return data;
}   