
/***
Data:2013/5/8
Remark:左菜单栏收起
*****/
/*=================================================================*/
define("slideLeft", ["jquery", "customplugin"], function () {
    var SlideLeft = function (options) {
        this.$aImag = $("#" + options.aIco || "aIco");
        this.$divLeftbar = $("#" + options.divLeft || "divLeft");
        this.$divRightMain = $("#" + options.divRight || "divRight");
        this.url = options.url;
        this.$divMove = $("#" + options.divMove || "div_Move");
        this.nativeX = 0, nativeY = 0, targetX = 0, targetY = 0;
        this.init();
    };

    SlideLeft.prototype = {
        //init
        init: function () {
            var self = this;
            self.load();
            self.addBindEvent();
            self.test();
        },

        load: function () {
            var self = this;
            self.$aImag.toggle(
                function () {
                    var divWidth = $(this).width() - self.$divLeftbar.width();
                    self.$divLeftbar.animate({ "left": divWidth });
                    self.$divMove.animate({ "left": $(this).width() });
                    self.$divRightMain.animate({ "marginLeft": $(this).width() }, function () {
                        //amplify.publish(settings.amplifyConstName.tabpanelResize);
                    });
                    $(this).addClass("clickA");
                },
                function () {
                    self.$divLeftbar.animate({ "left": 0 });
                    self.$divMove.animate({ "left": self.$divLeftbar.width() });
                    self.$divRightMain.animate({ "marginLeft": self.$divLeftbar.width() }, function () {
                        //amplify.publish(settings.amplifyConstName.tabpanelResize);
                    });
                    $(this).removeClass("clickA");
                }
                );
        },

        addBindEvent: function () {
            var self = this;
            self.$divMove.bind("mousedown", function (e) {
                self.move(e);
            });
        },

        move: function (sender) {
            var self = this;
            self.targetX = sender.pageX;
            self.targetY = sender.pageY;
            self.nativeX = sender.clientX - (sender.clientX - self.$divMove.offset().left);
            self.nativeY = sender.clientY - (sender.clientY - self.$divMove.offset().top);

            var _leftNativeX = parseInt(self.$divLeftbar.css("left")), _nativeLeft = 0, _left = 0;
            var $cloneDiv = self.$divMove.clone();
            $cloneDiv.appendTo("body");
            var $tempDiv = $("<div></div>");
            $tempDiv.appendTo("body");
            $tempDiv.css({
                "position": "absolute",
                "zIndex": "5",
                "width": "100%",
                "height": "100%",
                "top": 0
            });

            $(document).bind({
                "mousemove.hot": function (e) {
                    var x = e.pageX, y = e.pageY;
                    var left = self.nativeX + e.pageX - self.targetX;
                    var top = self.nativeY + e.pageY - self.targetY;
                    if (left > 250 || left < self.$aImag.width())
                        return;
                    _nativeLeft = _leftNativeX + (left - self.nativeX);
                    _left = left;

                    $tempDiv.css({
                        "left": _left
                    });
                },
                "mouseup.hot": function (e) {
                    self.$divLeftbar.css({ "width": _left });
                    self.$divRightMain.css({ "marginLeft": _left });
                    self.$divMove.css({ left: _left });
                    $cloneDiv.remove();
                    $tempDiv.remove();
                    $(document).unbind("mousemove.hot mouseup.hot");
                }
            });
        },

        test: function () {
            var self = this;
            $("#btnleft").click(function () {
                //self.$divLeftbar.promptMes("THIS IS ", {msgDefault_w:150, isRepeat: false });
                //$("div").promptMes("THIS IS TEST EXAMPLE", { msgDefault_w:250,isRepeat: false });
                $.promptMes("THIS IS TEST EXAMPLETHIS IS TEST EXAMPLETHIS IS TEST EXAMPLETHIS IS TEST EXAMPLETHIS IS TEST EXAMPLE", {
                    default_w: 220,
                    position: "top_left",
                    header: "this is a header",
                    isLinefeed: true,
                    callback: {
                        startBefore: function () { },
                        endAfter: function (msg, msg1) { }
                    }
                });
            });
            $("#btnleftBottom").click(function () {
                //self.$divLeftbar.promptMes("THIS IS TEST EXAMPLE");
                $.promptMes("THIS IS TEST EXAMPLE THIS IS TEST EXAMPLE THIS IS TEST EXAMPLE THIS IS TEST EXAMPLE", { default_w: 0, position: "leftBottom" });
            });
            $("#btnright").click(function () {
                //self.$divLeftbar.promptMes("THIS IS TEST EXAMPLE");
                $.promptMes("THIS IS TEST EXAMPLE btnright", { default_w: 300, position: "top_right" });
            });
            $("#btnrightBottom").click(function () {
                //self.$divLeftbar.promptMes("THIS IS TEST EXAMPLE");
                $.promptMes("THIS IS TEST EXAMPLE btnrightBottom", {
                    default_w: 320,
                    position: "rightBottom"
                });
            });
            $("#btncenter").click(function () {
                //self.$divLeftbar.promptMes("THIS IS TEST EXAMPLE");
                $.promptMes("THIS IS TEST EXAMPLE btnright", { default_w: 200, position: "prompt_center", "header": "this is header", isRepeat: false });
            });
            // var arr = new Array(1, 2, 4, 212, 532);
            // arr.push("f");
            // arr.push("b");
            // arr.reverse();
            // arr.forEach(function (val) {
            //     alert(val);
            // });
            //var flag= arr.every(function (val) {
            //     return val > 3;
            //});
            //alert(flag);  //false 有一个为false就返回false
            //flag = arr.some(function (val) {
            //    return val > 3; //有一个返回true就返回ture
            //});
            //alert(flag);  //true
            //arr.unshift("fff");
            //alert(arr.toString());
            //arr.shift("fff");
            //alert(arr.toString());
        }
    };
    return SlideLeft;
});