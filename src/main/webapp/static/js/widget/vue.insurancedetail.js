Vue.component('insurance-detail', {
    template: '<a v-if="isShow" href="' + __ctx + '/insurance/detail?orderItemId={{orderitemid}}" target="_blank"><span class="font-blue">详情</span></a>',
    props: {
        isShow: Boolean,
        orderitemid: {
            type: Number,
            required: true
        }
    },
    ready: function () {
        var thisVM = this;
        thisVM.isShow = false;
        $.getJSON(__ctx + '/insurance/findByOrderItemId', {orderItemId: thisVM.orderitemid}, function (result) {
            if (!result.result || !result.obj || result.obj.length == 0) {
                return;
            }
            thisVM.isShow = true;
        });
    }
});