//切换tab页面
$(".J-tabs .J-tab").on('click',  function() {
    var nowtab = $(this).attr('tab');
    if (nowtab == "tab1") {car_error_order_vm.checkedIds = [];};
    $(this).removeClass('btn-xm-default').addClass('btn-xm-blue').closest('li').siblings().children('.J-tab').removeClass('btn-xm-blue').addClass('btn-xm-default');
    $(".tabs li[id="+ nowtab +"]").removeClass('none').siblings().addClass('none');
});