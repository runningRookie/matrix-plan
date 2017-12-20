tc.ns('tc.bookform.commpassenger', function () {
    $(".J-check-more").on("click", function () {
        $(this).closest('.box-com').toggleClass('passenger');
        if($(".J-check-more").text() == "更多"){
        	$(".J-check-more").text("收起");
        }else{
        	$(".J-check-more").text("更多");
        }
    });
});