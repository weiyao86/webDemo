/***
***
***
***
***
***
****/
(function ($) {
    $.promptMes = function (m, o) {
        o = $.extend({}, $.promptMes.defaults, o);
        if ($("#divPromptMsg").size() == 0) $("<div id='divPromptMsg'></div>").appendTo('body');
        if ($("#divPromptMsg").data("position") && $("#divPromptMsg").data("position") != o.position) {
            $("#divPromptMsg").removeClass($("#divPromptMsg").data("position"));
        }
        $("#divPromptMsg").addClass(o.position).data("position", o.position).promptMes(m, o);
    };

    $.fn.promptMes = function (m, o) {
        $.fn.promptMes.prototype.defaults = $.extend({}, $.fn.promptMes.prototype.defaults, o);
        if ($.isFunction(this.each)) {
            var agrs = arguments;
            //(this.each())return jquery object for chained invoke
            return this.each(function () {
                var self = this;
                if (!$(self).data("Promapt.message")) {
                    $(self).data("Promapt.message", new $.fn.promptMes());
                    $(self).data("Promapt.message").startup(this);
                }

                $(self).data("Promapt.message").create(self, m);
            });
        }
    };
    $.extend($.fn.promptMes.prototype, {
        defaults: {
            header: "消息:",
            isRepeat: true,
            allClose_w: 220,
            fadeInTime: 800,
            delayTime: 5000,
            default_w: 0,
            isLinefeed: true,
            position: 'top_right',
            theme: "close_defaults",
            callback: {
                startBefore: null,
                endAfter: null
            },
            divAllClose: "<div>[ Close All ]</div>"
        },
        notifications: [],

        element: null,

        closer: true,

        create: function (sender, m) {
            var self = this;

            var $elTemp = $("<div class='prompt_message' data-enventPanel='panel'><span class='prompt_message_header' data-head='head'>" + self.defaults.header + "</span><a class='prompt_close' data-close='close'>X</a><span  data-content='content'>" + m + "</span></div>");
            if (self.defaults.isRepeat || (!self.defaults.isRepeat && !self.element)) self.element = $("div[data-close='allClose']").length == 1 ? $elTemp.insertBefore($("div[data-close='allClose']")) : $elTemp.appendTo(sender);
            else self.element.children("span[data-content='content']").html(m);
            if (typeof self.defaults.callback.startBefore == typeof Function) self.defaults.callback.startBefore.apply(self.element, [self.element, m]);
            self.render(sender);
        },

        render: function (sender) {
            var self = this;
            var lastWidth = 0;
            if (self.defaults.default_w) {
                lastWidth = self.defaults.default_w - parseInt(self.element.css("paddingLeft")) - parseInt(self.element.css("paddingRight"));
                var msgContent_w = self.calculate(lastWidth, "span[data-content='content']");
                var msgTitle_w = self.calculate(lastWidth, "span[data-head='head']") - self.element.children("a[data-close='close']").width();

                self.element.find("span[data-head='head']").width(msgTitle_w);
            }
            else lastWidth = self.element.width();

            if ($(sender).children("div[data-enventPanel='panel']").length > 1 && self.closer) {
                $(self.defaults.divAllClose).attr("data-close", "allClose").width(lastWidth).addClass(self.defaults.theme).appendTo($(sender));
                self.closer = false;
            }

            if (self.defaults.isLinefeed) self.element.children("span[data-content='content']").removeClass("prompt_message_span").addClass("prompt_message_span1");
            else self.element.children("span[data-content='content']").addClass("prompt_message_span");
            if (self.defaults.isRepeat) self.element.hide().css("width", lastWidth).fadeIn(self.defaults.fadeInTime).delay(self.defaults.delayTime).fadeOut(function () { $(this).remove(); self.shutdown(sender); });
            else self.element.attr("data-repeat", "yes").stop(false, true).show().css("width", lastWidth).fadeOut(self.defaults.delayTime, function () { });

            //if ($(sender).height() > $(window).height()) $(sender).css({ "overflow": "hidden", "height": $(window).height() });css("width", lastWidth/2).animate({ "width": lastWidth })

        },

        startup: function (sender) {
            var self = this;
            $(sender).addClass("position");
            self.addEvent(sender);
        },

        addEvent: function (sender) {
            var self = this;
            $(sender).delegate("a[data-close='close'],div[data-close='allClose']", "click", function () {
                var currentEl = $(this).attr("data-close");
                switch (currentEl) {
                    case "close":
                        $(this).parent().stop(false, true).fadeOut(function () {

                            if ($(this).attr("data-repeat") == "yes")
                                self.element = null;
                            $(this).remove(); self.shutdown(sender);
                        });
                        break;
                    case "allClose":
                        $(this).stop(false, true).fadeOut(function () {
                            $(this).parent().children("div[data-enventPanel='panel']").remove();
                            $(this).remove();
                            self.element = null;
                            self.closer = true;
                        });
                    default:
                }
            });
        },

        calculate: function (lastWidth, className) {
            var self = this;
            var $elspan = self.element.find(className);
            var result = lastWidth - parseInt(self.element.css("paddingLeft")) - parseInt(self.element.css("paddingRight")) - parseInt($elspan.css("marginLeft")) - parseInt($elspan.css("marginRight"));
            $elspan.width(result);
            return result;
        },

        shutdown: function (sender) {
            var self = this;

            if (typeof self.defaults.callback.endAfter == typeof Function) self.defaults.callback.endAfter.apply(self.element, []);
            var $childList = $(sender).children("div[data-enventPanel='panel']");

            if ($("div[data-repeat='yes']").length > 0) {
                $("div[data-repeat='yes']").remove();
                self.element = null;
            }

            if ($childList.length < 2) {
                $("div[data-close='allClose']").remove();
                self.closer = true;
                return;
            }
        }
    });

    $.promptMes.defaults = $.fn.promptMes.prototype.defaults;

})(jQuery)

/****
      var data=function(option){
        var data1="hello";
        var data2="hello2";
        var that=function(){
            addElement:function(){alert(data1);},
            delElement:function(){alert(data2);}
        };
        return that;
      };  //javascripot 调用  var d=new data(); d.addElement(option);


/******************我是华丽的分割线*********************************************************************/
/***
    $.class = {
        foo2:function(){},

        foo1:function(){}
    };   //使用命名空间 调用方式  $.class.foo1();

    $.fn.objPlugin = function () { }; //对象级别插件写法   $.fn.extend(obj);
    $.classPlugin = function () { }; //类级别插件写法      $.exend(obj);
***/