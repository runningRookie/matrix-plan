//common.html中的wrap导航
$(".nav-left .li-name").on('click',function(){
    var father = $(this).parent('dd');
	if(father.hasClass('top')){
		father.removeClass('top').addClass('down');
	}else{
		father.removeClass('down').addClass('top').siblings().removeClass('top').addClass('down');
	}
})

$(".nav-left li").on('click',function(){
    $(this).addClass('on').siblings().removeClass('on');
})

var urlIndex = window.urlIndex;
if(urlIndex){
    $(".nav-left li[data-index="+urlIndex+"]").addClass('on').parents('dd').addClass('top');
    $(".index").removeClass('on');
}else{
    $(".index").addClass('on');
}

//button_checkbox.html中的checkbox,radio
$(".checkbox-static").on('click', function() {
    $(this).toggleClass("checkbox-act")
});

$(".radio-static").on('click', function() {
    $(this).parents(".radio").find(".radio-static").removeClass('radio-act');
    $(this).addClass('radio-act');
});

$('.float-right').on('click','li',function(){
	$(this).siblings('li').removeClass('bg-blue');
	$(this).addClass('bg-blue');
})
$(".tab-default,.tab-orange,checkbox").on('click', function(event) {
    event.stopPropagation();
});
$('.travel-policy-cancel').on('click',function(){
    $('.travel-policy').hide();
    event.stopPropagation();
})


$('.btn-xm-default').on('click',function(){
	if($(this).text()=='更多搜索条件'){
		$('.percent:gt(2)').show();
	}
})

/*航班选择*/
$(".flight-list-btn").on('click',function(){
	if($(this).siblings('.flight-list-ul').hasClass('none')){
		$(this).siblings('.flight-list-ul').slideDown(300).removeClass('none');
	}else{
		$(this).siblings('.flight-list-ul').slideUp(300).addClass('none');
	}
})

/*航班选择结束*/
/*日期选择*/


/*日期选择结束*/
/*日期选择结束*/
$(".tip-Black .title").on('click', function() {
    $(this).closest('.tip-Black').hide();
});
