//support IE,FIREFOX,CHROME
(function($) {
	$.fn.lmprint=function(options){
		var opt=$.extend({},$.fn.lmprint.defaults,options);
		var $element = (this instanceof jQuery) ? this : $(this);
		if($('#'+opt.id).length>0){
			$('#'+opt.id).remove();
		}
		var $iframe = $('<iframe  id="'+opt.id+'"/>');       
        if (!opt.preview) { $iframe.css({ position: "absolute", width: "0px", height: "0px", left: "-600px", top: "-600px" }); }
        $iframe.appendTo("body");
        var doc = $iframe[0].contentWindow.document;
        if (opt.importCSS)
        {
            if ($("link[media=print]").length > 0) 
            {
                $("link[media=print]").each( function() {
                    doc.write("<link type='text/css' rel='stylesheet' href='" + $(this).attr("href") + "' media='print' />");
                });
            }
            else 
            {
                $("link").each( function() {
                    doc.write("<link type='text/css' rel='stylesheet' href='" + $(this).attr("href") + "' />");
                });
            }
        }
        $element.each( function() {
        	 doc.write($(this).html());
             try{
                 var inputs = doc.getElementsByTagName("input");
                 for(i=0; i< inputs.length; i++){            
                     if(inputs[i].type == "text"){
                         inputs[i].setAttribute("value",$(this).find("input[id='"+inputs[i].id+"']").val());
                     }
                 }
             }catch(e){
                 console.log(e);
             }
        });      
        doc.close();
        setTimeout( function() {$iframe[0].contentWindow.print()},1000);
	}
    $.fn.lmprint.defaults = {
        id:'printiframelm',//iframe唯一标识
        importCSS: true,//加载样式
    };
})(jQuery);