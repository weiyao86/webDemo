
//jQuery mthod extend

(function ($) {

    // Extend jquery object method
    $.fn.extend({

        building: function (params) {
            var $select = this,
                val, data, rule = {};

            rule[params.text] = "text";
            rule[params.value] = "value";

            $select.on("change", function () {
                val = $(this).getVal();
                data = $.mappingJSON(params.data[val] || [], rule, []);
                params.el.bindSelectOption(data);
                if (typeof params.changed === "function") params.changed.apply(this, [val]);
            });
        },

        bindSelectOption: function (data) {
            var $select = this, $options;

            $select.find("option").remove();

            $.each(data, function (index, item) {
                $("<option/>").appendTo($select)
                              .prop({ "text": item.text, "value": item.value });
            });

            $select.get(0).selectedIndex = 0;

            return this;
        },

        loadAppointScope: function (data) {

            this.find("input,select,a,span,div,textarea").each(function (index, element) {
                var type, key = $(element).attr("data-field");
                if (key == undefined)
                    return;
                var tagN = element.tagName.toUpperCase();
                if (tagN == "INPUT") {
                    type = $(element).attr("type");

                    switch (type) {
                        case "text":
                            $(element).val(data[key]);
                            break;
                        case "checkbox":
                            $(element).attr("checked", data[key]);
                            break;
                        case "hidden":
                            $(element).val(data[key]);
                            break;
                        default:
                            break;
                    };
                }
                else if (tagN == "SELECT") {
                    $(element).val(data[key]);
                }
                else if (tagN == "A") {
                    $(element).text(data[key]);
                }
                else if (tagN == "DIV" || element.tagName == "SPAN") {
                    $(element).html(data[key]);
                }
                else if (tagN == "TEXTAREA") {
                    $(element).text(data[key]);
                }

            });
        },

        // return selected object list
        selectedAllAppointScope: function () {

            var resultObj = {};
            this.find("input,select,a,span,div,textarea").each(function (index, element) {
                var type, key = $(element).attr("data-field");
                if (key == undefined)
                    return;
                if (element.tagName == "INPUT") {
                    type = $(element).attr("type");

                    switch (type) {
                        case "text":
                            resultObj[key] = $(element).val();
                            break;
                        case "checkbox":
                            resultObj[key] = $(element).is(":checked");
                            break;
                        case "hidden":
                            resultObj[key] = $(element).val();
                            break;
                        default:
                            break;
                    };
                }
                else if (element.tagName == "SELECT") {
                    if ($(element).val().length == 0)
                        resultObj[key] = "";
                    else
                        resultObj[key] = $(element).val();// { "text": $(element).find("option:selected").text(), "value": $(element).val() };
                }
                else if (element.tagName == "A") {
                    resultObj[key] = $(element).html();
                }
                else if (element.tagName == "DIV" || element.tagName == "SPAN") {
                    resultObj[key] = $(element).html();
                }
                else if (element.tagName == "TEXTAREA") {
                    resultObj[key] = $(element).val() || $(element).text();
                }
            });
            return resultObj;
        },

        // return selected object list
        clearAllAppointScope: function () {

            this.find("input,select,a,span,div,textarea").each(function (index, element) {
                var type, key = $(element).attr("data-field");
                if (key == undefined)
                    return;
                if (element.tagName == "INPUT") {
                    type = $(element).attr("type");

                    switch (type) {
                        case "text":
                        case "hidden":
                            $(element).val("");
                            break;
                        case "checkbox":
                            $(element).attr("checked", false);
                            break;
                        default:
                            $(element).val("");
                            break;
                    };
                }
                else if (element.tagName == "SELECT") {
                    $(element).val("")
                }
                else if (element.tagName == "DIV") {
                    $(element).html("");
                }
                else if (element.tagName == "SPAN") {
                    $(element).html("");
                }
                else if (element.tagName == "TEXTAREA") {
                    $(element).text("");
                    $(element).val("");
                }
            });
        },

        adaptive: function (opts) {
            //#region 自适应图片
            if (this.each) {
                return this.each(function (index, val) {
                    var self = $(val),
                        nativeImg = new Image(),
                        curWidth = self.parent().width() || self.width(),
                        curHeight = self.parent().height() || self.height();

                    // 去掉时间截
                    nativeImg.src = self.attr("src");

                    $(nativeImg).load(function () {
                        var nativeWidth = nativeImg.width,
                            nativeHeight = nativeImg.height,
                            wRatio = curWidth / nativeWidth,
                            hRatio = curHeight / nativeHeight,
                            Ratio = 1;
                        if (!opts.isAdaptive) return;
                        if (curWidth == 0 && curHeight == 0)
                            Ratio = 1;
                        else if (curWidth == 0) {
                            if (hRatio < 1)
                                Ratio = hRatio;
                        }
                        else if (curHeight == 0) {
                            if (wRatio < 1)
                                Ratio = wRatio;
                        }
                        else if (wRatio < 1 || hRatio < 1) {
                            Ratio = wRatio <= hRatio ? wRatio : hRatio;
                        }
                        if (Ratio < 1) {
                            nativeWidth = nativeWidth * Ratio;
                            nativeHeight = nativeHeight * Ratio;
                        }
                        $(val).width(nativeWidth || curWidth);
                        $(val).height(nativeHeight || curHeight);

                        if ($(val).parent()) {
                            var l = ($(val).parent().width() - $(val).width()) / 2,
                                t = ($(val).parent().height() - $(val).height()) / 2;
                            if ($(val).css("position") == 'static') {
                                $(val).css({
                                    marginLeft: l,
                                    marginTop: t
                                });
                            } else {
                                $(val).css({
                                    left: l,
                                    top: t
                                });
                            }
                        }
                        if (typeof opts.callback.success === "function") {
                            opts.callback.success.apply(this, [self]);
                        }
                    }).error(function () {
                        if (typeof opts.callback.error === "function") {
                            opts.callback.error.apply(this, [self]);
                        }
                    });
                });
            }
            //#endregion
        },


        initPlaceholder: function (opts) {
            var defaults = {
                lfdistance: 10
            };
            defaults = $.extend({}, defaults, opts);
            if (!("placeholder" in document.createElement("input"))) {
                this.each(function (idx, val) {

                    var $el = $(this),
                        placeholder = $el.attr('placeholder'),
                        _resetPlaceHolder = null,
                        elId, $label;
                    if (placeholder) {
                        elId = $el.attr("id");
                        if (!elId) {
                            var now = new Date();
                            elId = 'lbl_placeholder' + now.getSeconds() + now.getMilliseconds();
                            $el.attr("id", elId);
                        }
                        $label = $('<label>', {
                            html: $el.val() ? '' : placeholder,
                            'for': elId,
                            css: {
                                position: 'absolute',
                                left: $el.position().left + defaults.lfdistance,
                                top: $el.position().top,
                                height: $el.outerHeight(true),
                                lineHeight: $el.outerHeight(true) + 'px',
                                color: "#C3C3C3",
                                cursor: 'text'
                            }
                        }).insertAfter($el);
                        _resetPlaceHolder = function (e) {
                            if ($el.val()) {
                                $label.html('');
                            }
                            else
                                $label.html(placeholder);
                        };

                        $el.on('focus blur input keyup propertychange', _resetPlaceHolder);
                        _resetPlaceHolder();
                    }

                });
            }
        }
    });

    // Extend jquery 'mappingJSON' function
    $.extend({

        /** "mappingJSON"
        * data: need to mapping of the original data
        * rule: mapping rule
        * container: store mapping after data
        **/
        mappingJSON: function (data, rule, container) {

            for (var i = 0; i < data.length; i++) {
                var temp = {};
                var item = data[i];

                for (var key in item) {
                    var newKey = rule[key] || key;

                    if ($.type(item[key]) === "array" && item[key].length > 0) {
                        temp[newKey] = [];
                        this.mappingJSON(item[key], rule, temp[newKey]);
                    } else {
                        temp[newKey] = item[key];
                    }
                }
                container.push(temp);
            }

            return container;
        },

        /** "escapeSpecialChars"
        * str: need to convert char
        **/
        escapeSpecialChars: function (str) {
            return str.replace(/[\\]/g, '\\\\');
        },

        // Validate is integer
        isInteger: function (val) {
            return /^[1-9]*[1-9][0-9]*$/.test(val);
        },

        // Validate is float
        isFloat: function (val, decimalLength) {
            decimalLength = decimalLength || "1";

            var pattern = "^-?\\d+(\\.\\d{1," + decimalLength + "})$";

            return (new RegExp(pattern)).test(val);
        },

        getParameterByName: function (name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.search);
            if (results == null)
                return "";
            else
                return decodeURIComponent(results[1].replace(/\+/g, " "));
        },

        downloadFileByUrl: function (url) {
            var frameId = 'frameId_download_' + (new Date()).getTime(),
                iframeSrc = /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
                $iframe = $('<iframe name="' + frameId + '" id="' + frameId + '" src="' + iframeSrc + '" style="display:none;"></iframe>'),
                iform = '<form action="' + url + '" method="POST" target="' + frameId + '"></form>',
                $form = $(iform);
            $("body").append($iframe);
            var idoc = $iframe.get(0).contentDocument || $iframe.get(0).contentWindow.document;
            idoc.open();

            try {
                idoc.appendChild($form.get(0));
            } catch (e) {
                //for lte ie8
                iform = idoc.createElement(iform);
                idoc.appendChild(iform);
            }
            idoc.close();
            $iframe.on('load', function () {
                alert('file download error');
                $iframe.remove();
            });

            $(idoc).find("form").submit();

            window.setTimeout(function () {
                $iframe.remove();
            }, 2000);

        },

        isExistScroll: function ($sourceScope, $targetScope) {
            var self = this,
                $scrollDiv = $("<div></div>"),
                scrollW = $sourceScope.outerWidth(true) - $sourceScope.find("table:first").outerWidth(true),
                wrapW = $targetScope.outerWidth(true),
                tableW = (wrapW - scrollW) / wrapW * 100,
                percent = '100%',
                isFloat = 'none';

            if (scrollW) {
                percent = tableW + '%';
                isFloat = 'left';
                $targetScope.append($scrollDiv.css({
                    "width": scrollW,
                    "height": 1,
                    "float": isFloat
                }));
            } else {
                $targetScope.find($scrollDiv).remove();
            }
            $targetScope.find("table:first").css({
                "width": percent,
                "float": isFloat
            });
        },

        /*
         * [ATTRIBUTE]
         * link:链接
         * arr:数组或字符串
         * key:参数名
         * comma:分隔符
         * single:是否为单个参数中间无任何分隔
         * 
         * */
        redirectLink: function (link, arr, key, comma, single) {
            var self = this,
                isExistReg = new RegExp("[?&]" + key + "=([^&]*)", "i"),
                reg = new RegExp("([?&])" + key + "=([^&]*)(&?)", "i"),
                symbol = /\?/.test(link),
                comma = comma || ',',
                ret = {},
                arrStr = "";
            if (arr == undefined) return link;
            arrStr = ($.type(arr) == "array") ? arr.join(',') : arr;

            if (isExistReg.test(link)) {
                link = link.replace(reg, function (str, firstComma, subStr, lastComma) {
                    var prevStr = subStr + comma,
                    	keyStr = firstComma + key,
                        replaceCommaAndKey = function () {
                            //key不存在值时清除参数返回特殊字符
                            if (firstComma == "&") return lastComma;
                            else {
                                return lastComma ? "?" : "";
                            }
                        };

                    if (single) {
                        var retStr = arrStr ? keyStr + '=' + arrStr + lastComma : replaceCommaAndKey();
                        return retStr;
                    }
                    if (comma == ",") {
                        var strArr = subStr.split(','),
                            tmepArr = arrStr.split(','),
                            strSingle = "";
                        for (var i = 0; i < strArr.length; i++) {
                            strSingle = strArr[i];
                            for (var j = 0; j < tmepArr.length; j++) {
                                if (strSingle == tmepArr[j]) strArr.splice(i, 1);
                            }
                        }
                        subStr = strArr.join(',');
                        if (subStr) {
                            prevStr = subStr + comma;
                        } else {
                            prevStr = "";
                        }
                        return (arrStr || arrStr.length) ? keyStr + "=" + prevStr + arr + lastComma : replaceCommaAndKey();
                    } else {
                        return keyStr + "=" + arr + lastComma;
                    }
                });
            } else {
                if (symbol) {
                    link = link + "&" + key + "=" + arrStr;
                } else {
                    link = link + "?" + key + "=" + arrStr;
                }
            }
            return link;
        },

        moveBox: function (selector) {
            var $this = $("#" + selector);
            if (!$this.size()) return;
            var w = $this.width(), h = $this.height(), top = 0, maxY = $(window).height() - h;
            $this.on("mousedown", function (e) {
                top = e.pageY - $(this).offset().top,
                move($(this));
                e.preventDefault();
            });

            function move($box) {
                var moveY;
                $(document).on({
                    "mousemove.online": function (e) {
                        moveY = e.pageY - top;
                        moveY < 0 && (moveY = 0);
                        moveY > maxY && (moveY = maxY);
                        $box.css("top", moveY);
                    },
                    "mouseup.online": function () {
                        $(document).off(".online");
                    }
                });
            }
        },

        moveTips: function ($parentEl, selector, $imgTipsScope, config) {
            var clearTimer = null, clearOut = null, c = 0, posConfig, $arrow = $imgTipsScope.find(".tip-arrow");


            $parentEl.on("mouseenter mouseleave", selector, function (e) {
                var eventType = e.type,
                    that = this,
                    evt = e;



                $(that).removeProp("title").removeAttr("title");
                if (eventType === "mouseenter") {
                    window.clearTimeout(clearOut);
                    $(that).append($imgTipsScope);
                    clearTimer = window.setTimeout(function () {
                        var context = $(that).attr("data-content");
                        if (!context) {
                            window.clearTimeout(clearTimer);
                            $imgTipsScope.hide();
                            return;
                        }
                        $imgTipsScope.find("[data-field='content']").html(context);
                        setPosition(that, evt, config);
                    }, 500);
                }
                else {
                    window.clearTimeout(clearTimer);
                    clearOut = window.setTimeout(function () {
                        $imgTipsScope.hide();
                    }, 800);
                }
                e.stopPropagation();
            });

            $imgTipsScope.on("mouseenter", function (e) {
                window.clearTimeout(clearOut);
                e.stopPropagation();
            });

            function setPosition(sender, e, config) {
                var $that = $(sender),
                    position = $that.position(),
                    tipH2 = $imgTipsScope.height() / 2,
                    $parentOffset = $that.offsetParent(),
                    top = position.top - tipH2 + $parentOffset.scrollTop(),
                    left = position.left + $that.width(),
                    maxW = $parentOffset.width(),
                    w = $imgTipsScope.outerWidth(true);

                if (config && config.isTitle) {
                    top = top + $that.height() + tipH2;
                    left = left - $that.width() + 50;
                    $arrow.hide();
                    $imgTipsScope.addClass("move-tip-append");
                } else {
                    top = top + ($that.height()) / 2;
                    $imgTipsScope.removeClass("move-tip-append");
                    $arrow.show();
                }



                if (maxW - left < w)
                    left = maxW - w;
                if (w > maxW) {
                    $imgTipsScope.width(maxW - 50);
                }
                $imgTipsScope.animate({
                    left: left,
                    top: top
                }, function () {
                    if (config && config.callback && config.callback.afterStopMove) {
                        config.callback.afterStopMove.apply(null, [$that]);
                    }
                }).show();
            }
        }
    });

})(jQuery);


//跨浏览器实现backgroundPosition
(function ($) {
    // if (!document.defaultView || !document.defaultView.getComputedStyle) {
    var oldCurCSS = $.css;
    $.css = function (elem, name, force) {

        if (name === 'background-position') {
            name = 'backgroundPosition';
        }
        if (name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[name]) {
            return oldCurCSS.apply(this, arguments);
        }
        var style = elem.style;
        if (!force && style && style[name]) {
            return style[name];
        }
        return oldCurCSS(elem, 'backgroundPositionX', force) + ' ' + oldCurCSS(elem, 'backgroundPositionY', force);
    };
    //}

    var oldAnim = $.fn.animate;
    $.fn.animate = function (prop) {
        if ('background-position' in prop) {
            prop.backgroundPosition = prop['background-position'];
            delete prop['background-position'];
        }
        if ('backgroundPosition' in prop) {
            prop.backgroundPosition = '(' + prop.backgroundPosition + ')';
        }
        return oldAnim.apply(this, arguments);
    };

    function toArray(strg) {
        strg = strg.replace(/left|top/g, '0px');
        strg = strg.replace(/center/g, '50%');
        strg = strg.replace(/right|bottom/g, '100%');
        strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g, "$1px$2");
        var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
        return [parseFloat(res[1], 10), res[2], parseFloat(res[3], 10), res[4]];
    }

    $.fx.step.backgroundPosition = function (fx) {
        if (!fx.bgPosReady) {
            var start = $.css(fx.elem, 'backgroundPosition');

            if (!start) {//FF2 no inline-style fallback
                start = '0px 0px';
            }

            start = toArray(start);

            fx.start = [start[0], start[2]];

            var end = toArray(fx.end);
            fx.end = [end[0], end[2]];

            fx.unit = [end[1], end[3]];
            fx.bgPosReady = true;
        }

        var nowPosX = [];
        nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
        nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];
        fx.elem.style.backgroundPosition = nowPosX[0] + ' ' + nowPosX[1];
    };
})(jQuery);
