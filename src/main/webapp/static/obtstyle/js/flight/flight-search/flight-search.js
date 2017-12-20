tc.ns('tc.flight.list.utils.flightList', function (resultVM, searchVM, baseUrl) {
    $('.flight-list-btn2').each(function () {
        var events = $._data($(this)[0], 'events');
        if (!!events && !!events['click']) {
            return;
        }
        $(this).click(function () {
            if ($(this).attr('data')) {
                $('.travel-policy').show()
            }
        })
    });

    $('.travel-policy-text>li>.radio>.radio-static').each(function () {
        var events = $._data($(this)[0], 'events');
        if (!!events && !!events['click']) {
            return;
        }
        $(this).click(function () {
            $(".travel-policy-text>li>.radio").children('.radio-static').removeClass('radio-act')
            $(this).addClass('radio-act');
        })
    });

    $('.list>dd>ul>li>.radio>.radio-static').each(function () {
        var events = $._data($(this)[0], 'events');
        if (!!events && !!events['click']) {
            return;
        }
        $(this).click(function () {
            $(".list>dd>ul>li>.radio").children('.radio-static').removeClass('radio-act')
            $(this).addClass('radio-act');
        })
    });

    $('.J-insurance').each(function () {
        var events = $._data($(this)[0], 'events');
        if (!!events && !!events['click']) {
            return;
        }
        $(this).click(function () {
            if ($(this).hasClass('on')) {
                $(this).removeClass('on').addClass('down').children('.tab-default').show();
            } else {
                $(this).removeClass('down').addClass('on').children('.tab-default').hide();
            }
        })
    });

    $('.tab-default,.tab-orange,checkbox').each(function () {
        var events = $._data($(this)[0], 'events');
        if (!!events && !!events['click']) {
            return;
        }
        $(this).click(function () {
            event.stopPropagation();
        })
    });

    $('.flight-list-btn').each(function () {
        var events = $._data($(this)[0], 'events');
        if (!!events && !!events['click']) {
            return;
        }
        $(this).click(function () {
            /*航班选择*/
            if ($(this).siblings('.flight-list-ul').hasClass('none')) {
                $(this).siblings('.flight-list-ul').slideDown(300).removeClass('none');

                $(this).parent().find('.refundChanges').each(function () {
                    tc.flight.list.utils.refundChanges(resultVM, searchVM, baseUrl, $(this));
                });
            } else {
                $(this).siblings('.flight-list-ul').slideUp(300).addClass('none');
            }
        })
    });
});