Vue.component('insurance-price', {
    template: '<div>{{price}}</div>',
    props: {
        price: String,
        orderitemid: {
            type: Number,
            required: true
        }
    },
    ready: function () {
        var thisVM = this;
        var price = 0;

        $.getJSON(__ctx + '/insurance/findByOrderItemId', {orderItemId: thisVM.orderitemid}, function (result) {
            if (!result.result || !result.obj) {
                thisVM.price = price;
                return;
            }

            _.forEach(result.obj, function (item) {
                price += parseFloat(item.insuranceSoldProduceDTO.ruleProduceDealSalePrice || 0);
            });

            thisVM.price = price;
        });
    }
});