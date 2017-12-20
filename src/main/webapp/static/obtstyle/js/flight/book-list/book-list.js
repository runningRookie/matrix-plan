$('.Jshow:gt(5)').hide();
$(".more-search").on('click', function() {
    $('.Jshow:gt(5)').toggle(300);
})
//切换tab页面
$(".J-tabs .J-tab").on('click',  function() {
    var nowtab = $(this).attr('tab');
    $(this).removeClass('btn-xm-default').addClass('btn-xm-blue').closest('li').siblings().children('.J-tab').removeClass('btn-xm-blue').addClass('btn-xm-default');
    $(".tabs li[id="+ nowtab +"]").removeClass('none').siblings().addClass('none');
});