
/***
**--2013-04-19--****
**common pageSource****
****/
define("pageSource", ['ajax', 'mustache', 'consts', 'blockUI'], function (ajax, mustache, consts, blockUI) {
    var _c = consts.Types;
    var PageSource = function (option) {

        this.$divPageSearch =$("#" +  option.divPageSearch);
        this.$divResult = $("#" + option.divResultId);
        this.aSearch = $("#" + option.aSearch);
        this.$lbRecordId = $("#" + option.lbRecordId);
        this.$lbSumPageId = $("#" + option.lbSumPageId);
        this.$firstPageId = $("#" + option.firstPageId);
        this.$prevPageId = $("#" + option.prevPageId);
        this.$nextPageId = $("#" + option.nextPageId);
        this.$lastPageId = $("#" + option.lastPageId);
        this.$selectOption = $("#" + option.selectOptionId);
        this.selectOptionTemplate = option.selectOptionTemplateId;
        this.pageIndex = option.pageIndex || 1;
        this.pageSize = option.pageSize || 10;

        this.parameter = option.parameter || {};
        this.url = option.url || "";

        //callback
        this.callBackLoad = option.loadDataSource || null;
        this.callBackSearch = option.loadSerach || null;
        this.callback = option.firstCallback || null;

        //variable
        this.pageFlag = true;
        this.pageCount = 0;

        this.init();
    };

    PageSource.prototype = {

        //Initialize
        init: function () {
            var self = this;
            self.addBindEvent();
        },

        //load source
        load: function () {
            var self = this;
            var tempParameters = {
                "PageIndex": self.pageIndex,
                "PageSize": self.pageSize
            };
            //refactor self.parameter
            self.parameter = $.extend({}, self.parameter, tempParameters);
            
            ajax.getCommonSearch(
                {
                    params: self.parameter,
                    url: self.url,
                    onsuccess: $.proxy(self.render, self),
                    loadingShow: function () {
                        self.$divPageSearch.block({ css: { "border": "none" }});
                    },
                    error: function () { }
                });
        },

        //Bind html
        render: function (result) {
            var self = this;
            var data = result.Data;

            if (typeof self.callBackLoad === _c.Function) {
                self.callBackLoad(data);

                //first load
                if (self.pageFlag)
                    self.renderAfter(result);

                self.changeShowIco();
                self.$selectOption.val(self.pageIndex);
                // odd rows add styles
                self.$divResult.find("tr:odd").addClass("oddTr");
                self.$divPageSearch.unblock();
            }
        },

        //after Bind html
        renderAfter: function (result) {
            var self = this;

            var recordCount = result.DataRecordCount;
            var pageCount = Math.floor(recordCount / self.pageSize);
            if (recordCount % self.pageSize > 0)
                pageCount++;
            self.pageCount = pageCount;

            var dataSelectTemp = [];
            for (var i = 1; i <= self.pageCount; i++) {
                dataSelectTemp.push({ pageCurrent: i });
            }

            //invoke callback
            if (typeof self.callback === _c.Function)
                self.callback(self,dataSelectTemp);

            self.$lbRecordId.html(recordCount);
            self.$lbSumPageId.html(pageCount);
            self.pageFlag = false;
        },

        //add Click event
        addBindEvent: function () {
            var self = this;
            self.$firstPageId.click(function () { self.firstPageClick(); });
            self.$prevPageId.click(function () { self.prevPageClick(); });
            self.$nextPageId.click(function () { self.nextPageClick(); });
            self.$lastPageId.click(function () { self.lastPageClick(); });
            self.aSearch.click(function () {
                if (typeof self.callBackSearch === _c.Function) {
                    self.pageFlag = true;
                    self.pageIndex = 1;
                    self.callBackSearch(self);
                }
            });
        },

        firstPageClick: function () {
            var self = this;
            if (self.pageIndex != 1) {
                self.pageIndex = 1;
                self.load();
            }
        },

        prevPageClick: function () {
            var self = this;
            if (self.pageIndex > 1) {
                self.pageIndex--;
                self.load();
            }
        },

        nextPageClick: function () {
            var self = this;
            if (self.pageIndex < self.pageCount) {
                self.pageIndex++;
                self.load();
            }
            else {
                self.pageIndex = self.pageCount;
            }
        },

        lastPageClick: function () {
            var self = this;
            if (self.pageIndex != self.pageCount) {
                self.pageIndex = self.pageCount;
                self.load();
            }
        },

        //chanage page ico
        changeShowIco: function () {
            var self = this;
            if (self.pageIndex == 1 && self.pageCount == 1) {
                self.$firstPageId.removeClass("first_icon_hover");
                self.$prevPageId.removeClass("pre_icon_hover");
                self.$nextPageId.removeClass("next_icon_hover");
                self.$lastPageId.removeClass("last_icon_hover")
            }
            else if (self.pageIndex > 1 && self.pageIndex < self.pageCount) {
                self.$firstPageId.removeClass("first_icon_hover").addClass("first_icon_hover");
                self.$prevPageId.removeClass("pre_icon_hover").addClass("pre_icon_hover");
                self.$nextPageId.removeClass("next_icon_hover").addClass("next_icon_hover");
                self.$lastPageId.removeClass("last_icon_hover").addClass("last_icon_hover");
            }
            else if (self.pageCount > 1 && self.pageIndex == self.pageCount) {
                self.$firstPageId.removeClass("first_icon_hover").addClass("first_icon_hover");
                self.$prevPageId.removeClass("pre_icon_hover").addClass("pre_icon_hover");
                self.$nextPageId.removeClass("next_icon_hover");
                self.$lastPageId.removeClass("last_icon_hover");
            }
            else if (self.pageIndex == 1 && self.pageCount > 1) {
                self.$firstPageId.removeClass("first_icon_hover");
                self.$prevPageId.removeClass("pre_icon_hover");
                self.$nextPageId.removeClass("next_icon_hover").addClass("next_icon_hover");
                self.$lastPageId.removeClass("last_icon_hover").addClass("last_icon_hover");
            }
        }
    };

    return PageSource;
});