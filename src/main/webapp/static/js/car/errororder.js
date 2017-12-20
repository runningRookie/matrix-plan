var car_error_order_vm;
$(document).ready(function () {

    Vue.filter('toDate', {
        read: function (value, format) {
            if (value) {
                if (value == '' || value == null || value == '-28800000' || value == '631123200000' || value == '-2209017600000' || value.substr(0,4) == '1900' || value.substr(0,4) == '1970' ) {
                    return '';
                }
                return moment(value).format(format);
            } else {
                return value;
            }
        },
        write: function (value, format) {
            return value;
        }
    });

    car_error_order_vm = new Vue({

        el:"#carErrorOrderList",
        data:{
            checkedIds:[],
            infos:{},
            params:{
                orderId:"",
                bookPersonPhone:"",
                passengerPhone:"",
                useCarType:""
            }
        },
        ready:function(){
        },
        methods:{
            queryData: function(event, pageInfo) {
                if (pageInfo) {
                    $.extend(this.params, pageInfo);
                }
                else {
                    this.params.page = 1;
                    this.params.size = 20;
                }
                this.checkedIds = [];
                this.loadGridData(this.params);
            },
            reset: function () {
                car_error_order_vm.params.orderId="",
                    car_error_order_vm.params.bookPersonPhone="",
                    car_error_order_vm.params.passengerPhone="",
                    car_error_order_vm.params.useCarType=""
            },
            loadGridData: function(pars) {
                $.ajax({
                    url: __ctx + "/car/error/getList",
                    data: pars,
                    success:function(data){
                        car_error_order_vm.infos = data;
                    }
                });
            },
            synErrorOrder: function () {
                var list = car_error_order_vm.checkedIds;
                this.checkedIds = [];
                if(list.length == 0){
                    toastr.info("您未选择订单，请选择订单，再同步", "", {
                        timeOut: 2000,
                        positionClass: "toast-top-center"
                    });
                    return;
                }
                var param = {
                    orderIds: list
                }
                $.ajax({
                    url: __ctx + "/car/order/synErrorOrder",
                    type: "post",
                    contentType: 'application/json; charset=UTF-8',
                    datatype: 'json',
                    data: JSON.stringify(param),
                    success: function (result) {
                        if (result.success) {
                            var ids = [];
                            if(result.data && result.data.orderIds) {
                                ids = result.data.orderIds;
                                if (ids.length == 0) {
                                    toastr.info("操作成功", "", {
                                        positionClass: "toast-top-center"
                                    });
                                } else {
                                    toastr.info("操作失败", "失败数量="+ids.length, {
                                        positionClass: "toast-top-center"
                                    });
                                }
                            }
                        } else {
                            toastr.error("操作失败", "", {
                                timeOut: 2000,
                                positionClass: "toast-top-center"
                            });
                        }
                        car_error_order_vm.queryData();
                    },
                    error: function () {
                        toastr.error("操作失败", "", {
                            timeOut: 2000,
                            positionClass: "toast-top-center"
                        });
                    }
                });

            }
        }
    });
    car_error_order_vm.queryData();
});