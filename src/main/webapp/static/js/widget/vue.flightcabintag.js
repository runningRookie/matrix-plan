Vue.component('flight-cabintag', {
    template: '<img :class="classname" :src="src" :style="{display: isshow}">',
    props: {
        supplierid: String,
        policytype: String,
        src: String,
        isshow: String,
        classname: String
    },
    ready: function () {
        var thisVM = this;

        thisVM.isshow = 'block';
        if (thisVM.policytype === '45') {
            thisVM.src = __ctx + '/img/flight/directselling_price.png';
        } else {
        	if(thisVM.supplierid === null || thisVM.supplierid ===undefined){
        		thisVM.isshow = 'none';
        	}else{
        		if (['76345189', '76345205', '1427076'].indexOf(thisVM.supplierid) < 0) {
                    thisVM.src = __ctx + '/img/flight/agent_price.png';
                } else {
                    thisVM.isshow = 'none';
                }
        	}
            
        }
                
    }
});