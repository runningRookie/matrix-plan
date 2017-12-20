/*
 * LY.com Inc.
 * Copyright (c) 2004-2016 All Rights Reserved.
 */

Vue.component('vue-page', {
    template:
    '<ul class="pagination pull-right no-margin">' +
        '<li v-if="currentPage > 1" >' +
            '<a v-on:click="btnClick(1, $event)">首页</a>' +
        '</li>' +
        '<li v-else class="disabled">' +
            '<a>首页</a>' +
        '</li>' +
        '<li v-if="currentPage > 1" >' +
            '<a v-on:click="paginator.currentPage-- ,pageClick($event)">上一页</a>' +
        '</li>' +
        '<li v-else class="disabled">' +
            '<a>上一页</a>' +
        '</li>' +
        '<li v-for="index in indexs"  v-bind:class="{\'active\': currentPage === index }">' +
            '<a v-on:click="btnClick(index, $event)" v-html="index"></a>' +
        '</li>' +
        '<li v-if="currentPage != totalPage" >' +
            '<a v-on:click="paginator.currentPage++,pageClick($event)">下一页</a>' +
        '</li>' +
        '<li v-else class="disabled">' +
            '<a>下一页</a>' +
        '</li>' +
        '<li v-if="currentPage != totalPage" >' +
            '<a v-on:click="btnClick(totalPage, $event)">尾页</a>' +
        '</li>' +
        '<li v-else class="disabled">' +
            '<a>尾页</a>' +
        '</li>' +
        '<li class="disabled">' +
            '<a>共<i v-html="totalPage"></i>页</a>' +
        '</li>' +
        '<li class="disabled">' +
            '<a>共<i class="total-record" v-text="totalCount"></i>条</a>' +
        '</li>' +
        '<li class="disabled">' +
            '<a style="border: 0px;margin-left: 0px;">到第<input class="search-page" type="text" style="width: 50px;height: 20px;" oninput="(this.v=function(){this.value=this.value.replace(/[^0-9]+/,\'\');}).call(this)" v-model="pages" />页</a>' +
        '</li>' +
        '<li>' +
            '<a class="search-page" style="border: 0px;margin-left: 0px;background-color: #337ab7;color: #fff;" v-on:click="jumpClick($event,this)">跳转</a>' +
        '</li>' +
    '</ul>',
    props: ["paginator", "query", "size"],
    data(){
        return {
            pages:1
        }
    },
    mounted(){
        this.pages = paginator.currentPage;
    },
    computed: {
        indexs: function(){
            this.pages = this.paginator.currentPage;
            var left = 1;
            if (!this.paginator) {
                return [];
            }
            var right = this.paginator.totalPage;
            var ar = [];
            if(this.paginator.totalPage>= 7){
                if(this.paginator.currentPage > 5 && this.paginator.currentPage < this.paginator.totalPage-4){
                    left = this.paginator.currentPage - 3;
                    right = parseInt(this.paginator.currentPage) + 3;
                }else{
                    if(this.paginator.currentPage<=5){
                        left = 1;
                        right = 7;
                    }else{
                        right = this.paginator.totalPage;
                        left = this.paginator.totalPage - 6;
                    }
                }
            }
            while (left <= right){
                ar.push(left);
                left ++;
            }
            return ar;
        },
        currentPage: function() {
            if (!this.paginator) {
                return 0;
            }
            return this.paginator.currentPage;
        },
        totalPage: function() {
            if (!this.paginator) {
                return 0;
            }
            return this.paginator.totalPage;
        },
        totalCount: function() {
            if (!this.paginator) {
                return 0;
            }
            return this.paginator.totalCount;
        }
    },
    methods: {
        btnClick: function (value, event) {
            if(value != this.paginator.currentPage){
                this.paginator.currentPage = value;
                this.query(event, {page: this.paginator.currentPage, size: this.size});
            }
            this.pages = this.paginator.currentPage;

        },
        pageClick: function (event) {
            this.query(event, {page: this.paginator.currentPage, size: this.size});
            this.pages = this.paginator.currentPage;
        },
        jumpClick: function (event,a) {
            if (!this.paginator) {
                this.pages = "";
                return;
            }
            var Value = this.pages;
            if(Value < 1 || Value > this.paginator.totalPage){
                this.pages = this.paginator.currentPage;
                return;
            }
            this.btnClick(Value, event);
        }
    }
});