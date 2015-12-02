
/**
* @描述 {Class} SuperGrid
* This is the main class of Super Grid.
*/

define("SuperGrid", ["ajax",
                     "consts",
                     "mustache",
                     "settings",
                     "permission",
                     "jquery",
                     "json2",
                     "blockUI",
                     "linq",
                     "colResizable",
                     "jqExtend"],

    function (ajax, consts, Mustache, Settings) {

        var Types = consts.Types;

        var SuperGrid = function (options, callbacks) {

            //global
            this.xhr = "";
            this.data = [];
            this.mode = "";
            this.sort = "";
            this.timeout = "";
            this.loadTimeout = 30000;
            this.params = {};
            this.gridTemplate = "";
            this.curKeysValue = {};
            callbacks = callbacks || {};
            this.systemTableName = options.systemTableName || "";
            this.validationRuleUrl = Settings.context.validationRuleUrl;
            this.validationRule = null;

            //search
            with (options) {
                var searchId = search.id || "search";
                this.$search = $("#" + searchId);
                this.searchButtonId = search.searchButtonId || "btnSearch";
                this.clearButtonId = search.clearButtonId || "btnClear";
            }

            //grid
            with (options) {
                var gridId = grid.id || "grid";
                this.keys = grid.keys || [];
                this.$grid = $("#" + gridId);
                this.isAutoWidth = grid.isAutoWidth || true;
                this.toolbarId = grid.toolBar || "result_toolbar";
                this.templateId = grid.templateId || "gridTemplate";
                this.url = this.$grid.attr("data-url");
                this.deleteUrl = this.$grid.attr("data-delete-url");
                this.updateUrl = this.$grid.attr("data-update-url");
                this.insertUrl = this.$grid.attr("data-insert-url");
                this.addButtonId = grid.addButtonId || "btnAdd";
                this.deleteButtonId = grid.deleteButtonId || "btnDel";
                this.editButtonId = grid.editButtonId || "btnEdit";
                this.filters = grid.filters || [];
                this.firstRender = (typeof grid.firstRender === Types.Undefined ? true : grid.firstRender);
                this.colResizable = (typeof grid.colResizable === Types.Undefined ? true : grid.colResizable);
                this.isAutoWidth = (typeof grid.isAutoWidth === Types.Undefined ? true : grid.isAutoWidth);
            }

            //paging
            with (options) {
                this.currentIndex = 1;
                this.pageCount = 0;
                this.recordCount = 0;
                this.pageSize = paging.pageSize || 10;
                this.topPageId = paging.topPageId || "btnTopPage";
                this.prevPageId = paging.prevPageId || "btnPrevPage";
                this.nextPageId = paging.nextPageId || "btnNextPage";
                this.bottomPageId = paging.bottomPageId || "btnBottomPage";
                this.gotoPageId = paging.gotoPageId || "btnGoTo";
                this.currentPageId = paging.currentPageId || "tbCurrentPageIndex";
                this.recordCountId = paging.recordCountId || "spRecordCount";
                this.pageCountId = paging.pageCountId || "spPageCount";
            }

            //edit
            with (options) {
                this.editId = edit.id;
                this.$edit = $("#" + edit.id);
                this.saveId = edit.saveId;
                this.cancelId = edit.cancelId;
                this.addId = edit.addId;
                this.dialogWidth = edit.dialogWidth || this.$edit.width();
                this.dialogHeight = edit.dialogHeight || this.$edit.height();
            }

            //export
            if (options.exports) {
                this.exportButtonId = options.exports.exportButtonId || "";
                this.exportUrl = options.exports.exportUrl || "";
                this.formWrapId = options.exports.formWrapId || "";
            }

            //callbacks
            this.rowClicked = callbacks.rowClicked || null;
            this.deleteBefore = callbacks.deleteBefore || null;
            this.deleteAfter = callbacks.deleteAfter || null;
            this.onRenderAfter = callbacks.onRenderAfter || null;
            this.openEditDialogBefore = callbacks.openEditDialogBefore || null;

            this.init();
        };

        SuperGrid.prototype = {
            /**************
             Common block
            ***************/
            //initialization register event
            init: function () {


                with (this) {

                    var $toolbar = $("#" + toolbarId);

                    //bind search event
                    bindSearchEvent();

                    //bind search data
                    bindSelectData();

                    //bind grid header event
                    bindGridHeaderEvent();

                    //setting grid width

                    if (isAutoWidth) settingGridWidth();

                    //fixed grid column
                    if (!($.browser.msie && parseInt($.browser.version) < 9)) {
                        fixedGridColumn();
                    }

                    //window resize after reset fixed grid 
                    $(window).resize(function () {
                        if (!($.browser.msie && parseInt($.browser.version) < 9)) {
                            fixedGridColumn();
                        }
                    });

                    //bind search permission
                    //Permission.bind([$search, $toolbar, $edit]);

                    //bind paging event
                    bindPagingEvent();

                    //bind edit event
                    bindEditEvent();

                    //  loadRule();

                    //bind export event
                    bindExportEvent();

                    //Append export form
                    appendExportForm();

                    //register edit text box constraint 
                    registerConstraint();

                    //settings grid template
                    gridTemplate = $("#" + templateId).html();

                    //first render grid
                    if (firstRender) {
                        params = getCondition();
                        invoke(params);
                    }
                }

            },

            //invoke server side data
            invoke: function (condition) {

                var self = this;
                var item = condition || self.getCondition();
                var params = {
                    Sorting: self.sort,
                    PageSize: self.pageSize,
                    CurrentIndex: self.currentIndex,
                    Filters: item
                };
                self.xhr = ajax.invoke({
                    contentType: "application/json",
                    url: self.url,
                    params: JSON.stringify(params),
                    onsuccess: $.proxy(self.load, self),
                    onfailed: $.proxy(self.failed, self),
                    loadingShow: $.proxy(self.loadingShow, self),
                    loadingHide: $.proxy(self.loadingHide, self)
                });
            },

            //invoke server side failed
            failed: function (error) {
                alert("加载数据失败, 详细信息: '" + error.reason + "'");
            },

            //data load success callback
            load: function (result) {
                var self = this;
                with (self) {
                    
                    data = result.Data || [];
                    recordCount = result.DataRecordCount || 0;
                    pageCount = (recordCount % pageSize == 0) ? (parseInt(recordCount / pageSize)) : (parseInt(recordCount / pageSize) + 1);
                    render(self.data);
                    settingPagination();
                }
            },

            //get Search condition
            getCondition: function () {
                var self = this;
                var conditions = [];
                var selector = "";
                var $search = self.$search;
                var tags = ["input[type='text']", "input[type='hidden']", "select"];

                $.each(tags, function (index, item) {
                    selector += item + "[data-area],";
                });
                selector = selector.substring(0, selector.length - 1);

                //search bar the conditions
                $search.find(selector).each(function () {
                    var field = $(this).attr("data-field");
                    var value = $(this).val();
                    var operator = $(this).attr("data-operator");
                    var op = operator ? operator : 1;
                    conditions.push({ Name: field, Value: value, Operator: op });
                });

                //additional search the conditions
                $.each(self.filters, function (index, item) {
                    conditions.push({ Name: item.field, Value: item.value, Operator: item.operator });
                });

                return conditions;
            },

            //render select tag options
            renderSelect: function (data, $select) {

                $.each(data, function (index, item) {
                    $select.append($("<option></option>")
                        .attr("value", item.value)
                        .text(item.text));
                });
            },

            //bind select option data
            bindSelectData: function () {
                var self = this;
                var $select = null, url = "";

                var loadSelectData = function (ele) {
                    $select = $(ele);
                    url = $select.attr("data-url");

                    ajax.invoke({
                        url: url,
                        onsuccess: function (result) {
                            self.renderSelect(result.Data, $select);
                        }
                    });
                }
                self.$edit.find("select[data-url]").each(function () {
                    loadSelectData(this);
                });
                self.$search.find("select[data-url]").each(function () {
                    loadSelectData(this);
                });
            },

            //the display load the layer
            loadingShow: function () {
                var self = this;

                var msg = '<span style="display:block;line-height:28px;font-family:微软雅黑,font-size:10pt;height:28px;">正在加载...</span>';

                $.blockUI({ message: msg, baseZ: 900 });

                self.timeout = setTimeout(function () {
                    $.unblockUI({
                        onUnblock: function () {
                            if (self.xhr != null) self.xhr.abort();
                            alert("加载数据超时, 请稍后重试!");
                        }
                    });
                }, self.loadTimeout);
            },

            //the hide load the layer
            loadingHide: function () {
                var self = this;

                clearTimeout(self.timeout);
                $.unblockUI();
            },


            /**************
             Search block
            **************/
            //bind search area dom element event
            bindSearchEvent: function () {
                var self = this;

                //click search
                $("#" + self.searchButtonId).click(function () {
                    self.search();
                });

                //keyup search
                self.$search.find("input[data-area='search'][type='text']").keyup(function (e) {
                    if (e.keyCode === 13) self.search();
                });

                //click clear
                $("#" + self.clearButtonId).click(function () {
                    self.clear();
                });
            },

            //clear current search condition
            clear: function () {
                var self = this;

                //clear text
                self.$search.find("input[data-area='search'][type='text']").val("");

                //clear select
                self.$search.find("select[data-area='search']").each(function () {
                    $(this).get(0).selectedIndex = 0;
                });
            },

            //current conditions search result
            search: function () {

                with (this) {
                    sort = "";
                    params = getCondition();
                    currentIndex = 1;
                    invoke();
                }
            },


            /**************
             Grid block
            **************/
            //grid render result
            render: function (data) {
                var self = this;
                var $template = $("#" + self.templateId);

                var output = Mustache.render("{{#records}}" + self.gridTemplate + "{{/records}}", { records: data });
                $template.html(output).show();
                self.renderAfter($template);
            },

            //Gride render after
            renderAfter: function ($template) {
                var self = this;

                self.$grid.show();
                //Permission.bind($template);
                self.bindGridBodyEvent();
                if (self.colResizable) self.$grid.colResizable();
                if (self.onRenderAfter) self.onRenderAfter.apply(null, [self.$grid]);
            },

            //bind grid header event
            bindGridHeaderEvent: function () {
                var self = this;
                var $ths = self.$grid.find("th");

                $("#" + self.addButtonId).click(function (e) {
                    self.addSettings(this, e);
                });
                $ths.each(function () {
                    var field = $(this).attr("data-sort-field");
                    if ($.type(field) !== "undefined") $(this).css("cursor", "pointer");
                });
                $ths.dblclick(function () {
                    var field = $(this).attr("data-sort-field");
                    if ($.type(field) !== "undefined") self.sortRecords(this);
                });
            },

            //bind grid row dom element event
            bindGridBodyEvent: function () {
                var self = this;

                with (self) {
                    $grid.find("tr").click(function (e) {
                        if (this.rowIndex > 0) self.rowClick(this, e);
                        e.stopPropagation();
                    });
                    $grid.find("a[id*='" + self.deleteButtonId + "']").click(function (e) {
                        self.deleteSettings(this, e);
                        e.stopPropagation();
                    });
                    $grid.find("a[id*='" + self.editButtonId + "']").click(function (e) {

                        self.editSettings(this, e);
                        e.stopPropagation();
                    });
                }
            },

            //delete before settigns
            deleteSettings: function (sender, e) {
                var self = this;
                var params = $(sender).attr("data-delete-params");

                if (typeof params == Types.Undefined) {
                    throw new Error("未能设置正确的删除参数");
                }
                if (self.deleteBefore != null) {
                    if (self.deleteBefore(sender, e, params)) self.deleteRecord(sender);
                } else if (confirm("您确认删除当前行记录吗？")) {
                    self.deleteRecord(sender);
                }
            },

            //edit before settings
            editSettings: function (sender, e) {
                var self = this;
                var params = $(sender).attr("data-edit-params");

                if (typeof params == Types.Undefined) {
                    throw new Error("未设置正确的编辑参数");
                }
                if (self.openEditDialogBefore !== null) {
                    if (self.openEditDialogBefore(sender, e, params)) {
                        self.openEditDialog();
                        self.bindEditData(sender);
                    }
                } else {
                    self.openEditDialog();
                    self.bindEditData(sender);
                }

                self.mode = "update";
            },

            //add before settings
            addSettings: function () {
                var self = this;

                self.mode = "insert";
                self.openEditDialog();
            },

            //delete a record
            deleteRecord: function (sender) {
                var self = this;
                var delParams = "[" + $(sender).attr("data-delete-params") + "]";

                ajax.invoke({
                    url: self.deleteUrl,
                    params: delParams,
                    contentType: "application/json",
                    onsuccess: function (result) {
                        if (result.IsSuccess) {
                            self.currentIndex = 1;
                            self.invoke();
                        } else {
                            alert("删除失败");
                        }
                    }
                });

            },

            //sort current records
            sortRecords: function (sender) {
                var self = this;
                var field = $(sender).attr("data-sort-field");
                var mode = $(sender).attr("data-sort-mode") || "ASC";

                if (mode === "ASC") {
                    $(sender).attr("data-sort-mode", "DESC");
                } else {
                    $(sender).attr("data-sort-mode", "ASC");
                }

                self.currentIndex = 1;
                self.sort = field + " " + mode;
                self.invoke(self.params);
            },

            //open edit box dialog
            openEditDialog: function () {
                var self = this;
                var dialogWidth = parseInt(self.dialogWidth);
                var dialogHeight = parseInt(self.dialogHeight);

                $.blockUI({
                    message: $('#' + self.editId),
                    css: {
                        top: ($(window).height() - dialogHeight) / 2 + 'px',
                        left: ($(window).width() - dialogWidth) / 2 + 'px',
                        width: dialogWidth + 'px',
                        height: dialogHeight + 'px',
                        cursor: 'auto',
                        border: "0",
                        backgroundColor: "transparent"
                    }
                });
            },

            //rows click
            rowClick: function (sender, e) {
                var self = this;

                if (self.rowClicked) {
                    var cells = {};
                    var $cells = $(sender).find("td");
                    $cells.each(function (index, item) {
                        var field = $(item).attr("data-field");
                        var value = $(item).attr("data-value");
                        if (field && value) cells[field] = value;
                    });
                    self.rowClicked.apply(sender, [e, cells]);
                }
            },

            //setting grid width
            settingGridWidth: function () {
                var self = this;
                var width = 0;

                self.$grid.find("th").each(function () {
                    width += (parseInt($(this).width()) + 1);
                });

                if (!$.browser.mozilla) {
                    width = width - 15;
                }

                self.$grid.css("width", width + "px");
            },

            //fixed grid column
            fixedGridColumn: function () {
                var self = this;
                var gridWidth = 0;
                var gridWrapWidth = self.$grid.parent().width();
                var $fixedColumn = self.$grid.find("th[data-fixed='true'],td[data-fixed='true']");
                var $ths = self.$grid.find("th");

                //get total width
                $ths.each(function () {
                    gridWidth += (parseInt($(this).width()) + 2);
                });

                if (parseInt(gridWidth) > parseInt(gridWrapWidth)) {
                    var left = parseInt(gridWrapWidth) - parseInt($fixedColumn.width());
                    $fixedColumn.css({
                        "position": "absolute",
                        "z-index": 0,
                        "left": (left + 10) + "px"
                    });
                }
            },


            /*************
             Paging block
            *************/
            //bind paging dom element event
            bindPagingEvent: function () {
                var self = this;

                with (self) {
                    $("#" + topPageId).click(function () {
                        if ($(this).attr("class").indexOf("first_icon_hover") > -1) {
                            topPage();
                            invoke(params);
                        }
                    });
                    $("#" + prevPageId).click(function () {
                        if ($(this).attr("class").indexOf("pre_icon_hover") > -1) {
                            prevPage();
                            invoke(params);
                        }
                    });
                    $("#" + nextPageId).click(function () {
                        if ($(this).attr("class").indexOf("next_icon_hover") > -1) {
                            nextPage();
                            invoke(params);
                        }
                    });
                    $("#" + bottomPageId).click(function () {
                        if ($(this).attr("class").indexOf("last_icon_hover") > -1) {
                            bottomPage();
                            invoke(params);
                        }
                    });
                    $("#" + gotoPageId).click(function () {
                        gotoPage();
                        invoke(params);
                    });
                    $("#" + currentPageId).keyup(function (e) {
                        if (e.keyCode === 13) {
                            gotoPage();
                            invoke(params);
                        }
                    });
                }
            },

            //top page
            topPage: function () {
                var self = this;

                if (self.pageCount > 1)
                    self.currentIndex = 1;
            },

            //previous page
            prevPage: function () {
                var self = this;

                if (self.currentIndex > 1)
                    self.currentIndex--;
            },

            //next page
            nextPage: function () {
                var self = this;

                if (self.currentIndex < self.pageCount)
                    self.currentIndex++;
            },

            //bottom page
            bottomPage: function () {
                var self = this;

                if (self.pageCount > 1 && self.currentIndex != self.pageCount)
                    self.currentIndex = self.pageCount;
            },

            //go to page
            gotoPage: function () {
                var self = this;

                var gotoPageIndex = $("#" + self.currentPageId).val();
                if (!/^[0-9]+$/.test(gotoPageIndex)) {
                    gotoPageIndex = 1;
                }
                if (parseInt(gotoPageIndex) > self.pageCount)
                    self.currentIndex = 1;
                else
                    self.currentIndex = parseInt(gotoPageIndex);
            },

            //setting pagination
            settingPagination: function () {
                var self = this;

                with (self) {
                    $("#" + pageCountId).html(pageCount);
                    $("#" + recordCountId).html(recordCount);
                    $("#" + currentPageId).val(currentIndex);
                }

                self.settingPageButtonStatus();
            },

            //settting paging button status
            settingPageButtonStatus: function () {
                var self = this;
                var $topPage = $("#" + self.topPageId);
                var $prevPage = $("#" + self.prevPageId);
                var $nextPage = $("#" + self.nextPageId);
                var $bottomPage = $("#" + self.bottomPageId);

                //$topPage.removeClass().addClass("numfrist");
                //$prevPage.removeClass().addClass("numpre");
                //$nextPage.removeClass().addClass("numnext");
                //$bottomPage.removeClass().addClass("numlast");

                if (self.pageCount === 1 || self.pageCount === 0) {
                    $topPage.removeClass("first_icon_hover");//.addClass("disablenumfrist");
                    $prevPage.removeClass("pre_icon_hover");//.addClass("disablenumpre");
                    $nextPage.removeClass("next_icon_hover");//.addClass("disablenumnext");
                    $bottomPage.removeClass("last_icon_hover");//.addClass("disablenumlast");
                } else if (self.currentIndex === 1) {
                    //$topPage.removeClass().addClass("disablenumfrist");
                    //$prevPage.removeClass().addClass("disablenumpre");
                    $topPage.removeClass("first_icon_hover");
                    $prevPage.removeClass("pre_icon_hover");
                    $nextPage.removeClass("next_icon_hover").addClass("next_icon_hover");
                    $bottomPage.removeClass("last_icon_hover").addClass("last_icon_hover");

                } else if (self.pageCount === self.currentIndex) {
                    //$nextPage.removeClass().addClass("disablenumnext");
                    //$bottomPage.removeClass().addClass("disablenumlast");

                    $topPage.removeClass("first_icon_hover").addClass("first_icon_hover");
                    $prevPage.removeClass("pre_icon_hover").addClass("pre_icon_hover");
                    $nextPage.removeClass("next_icon_hover");
                    $bottomPage.removeClass("last_icon_hover");
                }
            },

            /*************
             Edit block
            *************/
            bindEditEvent: function () {
                var self = this;
                var selector = "input[data-area='edit'][type='text'],input[data-area='edit'][type='PassWord']";

                //register save button click event
                $("#" + self.saveId).click(function () {
                    self.saveRecord();
                });

                //registger cancel button click event
                $("#" + self.cancelId).click(function () {
                    self.closeEditDialog();
                });
            },

            //bind edit data
            bindEditData: function (sender) {
                var self = this;
                var params = $.escapeSpecialChars($(sender).attr("data-edit-params"));
                var editParams = JSON.parse(params);
                var selector = "input[data-area='edit'],select[data-area='edit']";
                var $editBox = self.$edit.find(selector);

                $editBox.each(function () {
                    var field = $(this).attr("data-field");
                    if (this.tagName.toUpperCase() === "INPUT"
                        && (this.type.toUpperCase() === "TEXT" || this.type.toUpperCase() === "HIDDEN")
                        && editParams[field]) {
                        $(this).val(editParams[field]);
                    }
                    if (this.tagName.toUpperCase() === "SELECT" && editParams[field]) {
                        $(this).val(editParams[field]);
                    }
                    if ($.inArray(field, self.keys) > -1) {
                        var keyObj = this;
                        setTimeout(function () {
                            $(keyObj).attr("disabled", true);
                        }, 200);
                    }
                });

                //save current edit row key and value
                $.each(self.keys, function (index, item) {
                    self.curKeysValue[item] = editParams[item];
                });
            },

            //register edit object constraint
            registerConstraint: function () {
                var self = this;
                var editBox = {};
                var validationRule = self.validationRule;
                var $editBox = self.$edit.find("input[data-area='edit']");

                $editBox.each(function () {
                    var field = $(this).attr("data-field");
                    editBox[field] = this;
                });

                if (validationRule !== null) {
                    for (var key in validationRule) {
                        if (typeof editBox[key] !== Types.Undefined) {
                            var length = validationRule[key].length;
                            if (typeof length !== Types.Undefined) {
                                $(editBox[key]).attr("maxlength", length);
                            }
                        }
                    }
                }
            },

            //validation edit box
            editValidation: function (sender) {
                var self = this;
                var isPass = true;
                var value = $(sender).val();
                var field = $(sender).attr("data-field");
                var validationRule = self.validationRule;

                if (validationRule !== null) {
                    if (typeof validationRule[field] !== Types.Undefined) {

                        var errorMsg = "";
                        var intReg = /^[0-9]+$/;
                        var type = validationRule[field].Type;
                        var nullable = validationRule[field].AllowNull;

                        //check current text box can be empty
                        if ($.trim(value).length === 0 && !nullable) {
                            errorMsg = "不可为空 ";
                        }

                        //check current field type
                        switch (type) {
                            case "int":
                                if (!intReg.test(value)) errorMsg += "必须是一个非负整型 ";
                                break;
                            case "numeric":
                                if (!$.isNumeric(value)) errorMsg += "必须是一个数字类型 ";
                                break;
                            default:
                                break;
                        }

                        //error message not is empty the show
                        if (errorMsg.length > 0) {
                            isPass = false;
                            $(sender).bind({
                                mouseout: function () {
                                    $(this).hideTip();
                                },
                                mouseover: function () {
                                    $(this).showTip();
                                },
                                focusout: function () {
                                    self.clearTip(this);
                                },
                                keyup: function () {
                                    self.clearTip(this);
                                }
                            });
                            $(sender).css("border", "1px solid red").data("tip", errorMsg);
                        }
                    }
                }

                return isPass;
            },

            //clear tip message
            clearTip: function (sender) {
                var self = this;
                $(sender).unbind();
                $(sender).css("border", "");
                $.removeData(sender, "tip");
            },

            //update a records
            saveRecord: function () {
                var self = this;
                var isPass = true;
                var params = {};
                var selector = "input[data-area='edit'],select[data-area='edit']";
                var $editBox = self.$edit.find(selector);
                var url = self.mode === "insert" ? self.insertUrl : self.updateUrl;

                for (var key in self.curKeysValue) {
                    params[key] = self.curKeysValue[key];
                }

                $editBox.each(function () {
                    var field = $(this).attr("data-field");
                    var value = $(this).val();
                    params[field] = value;
                    if (!self.editValidation(this)) {
                        isPass = false;
                    }
                });

                if (!isPass) return;

                self.xhr = ajax.invoke({
                    contentType: "application/json",
                    url: url,
                    params: JSON.stringify(params),
                    onsuccess: $.proxy(self.saveSuccess, self),
                    onfailed: $.proxy(self.saveFailed, self),
                    loadingShow: $.proxy(self.saveLoadingShow, self),
                    loadingHide: $.proxy(self.saveLoadingHide, self)
                });
            },

            //save success
            saveSuccess: function (result) {
                var self = this;

                if (result.IsSuccess) {
                    alert("保存成功");
                    self.closeEditDialog();
                    self.invoke();
                } else {
                    alert("保存失败");
                }
            },

            //save failed
            saveFailed: function (error) {
                alert("保存失败: " + error.reason);
            },

            //close current edit dialog
            closeEditDialog: function () {
                var self = this;

                self.mode = "";
                self.curKeysValue = {};
                self.clearEditBox();
                $.unblockUI();
            },

            //clear edit Box
            clearEditBox: function () {
                var self = this, field = "";
                var $edit = self.$edit.find("input[data-area='edit'][data-isclear!='false']");

                //clear text box value
                $edit.val("");

                //clear edit box disabled
                $edit.each(function () {
                    var field = $(this).attr("data-field");

                    if ($.inArray(field, self.keys) > -1) {
                        var keyObj = this;
                        setTimeout(function () {
                            $(keyObj).attr("disabled", false);
                        }, 200);
                    }
                });

                //clear select
                self.$edit.find("select[data-area='edit']").each(function () {
                    $(this).get(0).selectedIndex = 0;
                    $(this).attr("disabled", false);
                });


            },

            //load validation rule
            loadRule: function () {
                var self = this;

                ajax.invoke({
                    url: self.validationRuleUrl,
                    params: { "name": self.systemTableName },
                    onsuccess: function (result) {
                        self.validationRule = result.Data;
                    }
                });
            },

            //save show loading
            saveLoadingShow: function () {
                var self = this;
                var $dialogbox = self.$edit.parent();
                var msg = '<span style="display:block;line-height:28px;font-family:微软雅黑,font-size:10pt;height:28px;">保存数据中...</span>';

                $dialogbox.block({ message: msg, baseZ: 900 });

                self.timeout = setTimeout(function () {
                    $dialogbox.unblock({
                        onUnblock: function () {
                            if (self.xhr != null) self.xhr.abort();
                            alert("保存数据超时, 请稍后重试!");
                        }
                    });
                }, self.loadTimeout);

            },

            //save hide loading
            saveLoadingHide: function () {
                var self = this;
                var $dialogbox = self.$edit.parent();

                clearTimeout(self.timeout);
                $dialogbox.unblock();
            },

            //show error message
            showError: function (sender, errorMsg) {
                var id = $(sender).attr("id");
                var top = $(sender).position().top + $(sender).height() + 2;
                var left = $(sender).position().left;
                var width = $(sender).width();

                var $html = $('<div id="' + id + '_msg"></div>')
                    .css({
                        "position": "absolute",
                        "top": top + "px",
                        "left": left + "px",
                        "width": width + "px",
                        "min-height": "20px",
                        "line-height": "20px",
                        "background-color": "#F1F2F7",
                        "color": "#000000",
                        "border": "1px solid red"
                    })
                    .html(errorMsg);

                $(sender).after($html);
            },

            //hide error messge
            hideError: function (sender) {
                var self = this;
                var id = $(sender).attr("id");

                self.$edit.find("#" + id + "_msg").remove();
            },

            /*************
             Export block
            *************/
            //Bind export button click event
            bindExportEvent: function () {
                var self = this;
                $("#" + self.exportButtonId).click(function () {
                    self.exportCurrentRecords();
                });
            },

            //Append export form
            appendExportForm: function () {
                var self = this;
                var $form = $("<form>", {
                    id: "export-form",
                    action: self.exportUrl,
                    method: "post"
                });

                var $hidden = $("<input>", {
                    id: "export-hidden",
                    type: "hidden",
                    name: "Export"
                });

                $form.append($hidden);
                $("#" + self.formWrapId).append($form);
            },

            //export data
            exportCurrentRecords: function () {
                var self = this;
                var params = JSON.stringify(self.params);
                $("#export-hidden").val(params);
                $("#export-form").submit();
            }
        };

        return SuperGrid;
    });

