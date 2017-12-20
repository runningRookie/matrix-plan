$(".ul-percent:gt(4)").hide();
$(".show-more").on('click', function() {
    if ($(".show-more-tr").text() == '展开更多') {
        $(".ul-percent:gt(4)").slideDown(300);
        $(".show-more-tr").text('收起')
    } else {
        $(".ul-percent:gt(4)").slideUp(300);
        $(".show-more-tr").text('展开更多')
    }
})
$(".show-detail-content").hide();
$(".detail-show").on("click", function() {
    if ($(".show-detail").text() == '展开明细') {
        $(".show-detail-content").show(300);
        $(".show-detail").text('收起');
    } else {
        $('.show-detail-content').hide(300);
        $(".show-detail").text('展开明细')
    }
})
