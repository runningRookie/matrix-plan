Vue.component('insurance-checkbox', {
    template: '<input type="checkbox" v-bind:value="ruleproduct.ruleProduceId" class="{{className}}"'
    + ' v-bind:disabled="isDisabled"'
    + ' v-model="model">'
    + ' {{ruleproduct.resourceDTO.insuranceName}}&nbsp;&nbsp;&nbsp;&nbsp;{{price}}元&nbsp;&nbsp;&nbsp;&nbsp;{{hidead=="Y"?"":ruleproduct.resourceDTO.advertisement}}',
    props: {
        ruleproduct: Object,
        className: String,
        isDisabled: Boolean,
        hidead: String,
        model: {
            required: true
        },
        price: Number
    },
    ready: function () {
        var nowDate = moment();
        var thisVM = this;

        var isGift = ['1', '2'].indexOf(thisVM.ruleproduct.buyType) >= 0
            && (tc.insurance.startTransfer(thisVM.ruleproduct.presentValidStartTime) <= nowDate
                && nowDate <= tc.insurance.endTransfer(thisVM.ruleproduct.presentValidEndTime));
        thisVM.isDisabled = (thisVM.ruleproduct.buyType == 4 || isGift);

        thisVM.price = isGift ? 0 : thisVM.ruleproduct.salePrice;
    }
});