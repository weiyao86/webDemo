(function ($) {

            $.Loupe = function (divPanel, showImg) {
                $("#" + divPanel).Loupe(showImg);
            };
            $.fn.Loupe = function (showImg) {
                if ($.isFunction(this.each)) {
                    return this.each(function () {
                        $(this).find("div[data-field='Loupe']").each(function (index, val) {
                            var self = this;
                            var $large = $(self).find("div").first();
                            var $small = $(self).find("img").first();
                            if ($(self).data("Loupe") == undefined) {
                                $(self).data("Loupe", new $.fn.Loupe());
                                $(self).data("Loupe").move(self, $large, $small, showImg);
                            }
                        });
                    });
                }
            };
            $.extend($.fn.Loupe.prototype, {
                nativeW: 0,
                nativeH: 0,
                _showImg: "",
                _width: "",
                _height: "",
                arr: {},
                move: function (sender, $large, $small, showImg) {
                    var self = this;
                    self.arr = $.extend({}, $.fn.Loupe.prototype.defaults, {
                        _showImg: showImg,
                        _width: $(sender).width(),
                        _height: $(sender).height()
                    });
                    self.$small = $small;
                    self.$large = $large;
                    self.$showImg = $("#" + self.arr._showImg);
                    self.$large.css("background", "url('" + self.$small.attr("src") + "') no-repeat");
                    $(sender).on("mousemove", function (e) {
                        var self_obj = this;
                        $(self_obj).css("cursor", "crosshair");

                        var nativeW = self.arr.nativeW;
                        var nativeH = self.arr.nativeH;
                        if (!nativeW && !nativeH) {
                            var img = new Image();
                            img.src = self.$small.attr("src");
                            self.arr.nativeW = img.width;
                            self.arr.nativeH = img.height;
                        }
                        else {
                            var m = $(self_obj).offset();
                            var mx = e.pageX - m.left;
                            var my = e.pageY - m.top;
                            $("#txtCoord").val("mx-" + mx + "-w-" + self.arr._width);
                            $("#Text1").val("my-" + my + "-w-" + self.arr._height);

                            if (mx > 0 && my > 0 && mx < self.arr._width && my < self.arr._height) {
                                self.$large.show();
                            }
                            else {
                                self.$large.hide();
                                self.$showImg.hide();
                            }
                            if (self.$large.is(":visible")) {
                                var backOffLeft = Math.round(mx / self.$small.width() * nativeW - self.$large.width() / 2) * -1;
                                var backOffTop = Math.round(my / self.$small.height() * nativeH - self.$large.height() / 2) * -1;
                                var backPosition = backOffLeft + "px" + " " + backOffTop + "px";

                                var yy = mx - self.$large.width() / 2;
                                var yx = my - self.$large.height() / 2;
                                self.$large.css({ top: yx, left: yy, backgroundPosition: backPosition });

                                var l = Math.round(mx / self.$small.width() * nativeW - self.$showImg.width() / 2) * -1;
                                var t = Math.round(my / self.$small.height() * nativeH - self.$showImg.height() / 2) * -1;

                                self.$showImg.css({ "background": "url('" + self.$small.attr("src") + "') no-repeat", backgroundPosition: l + "px" + " " + t + "px" }).show();
                            }
                        }
                        e.preventDefault();
                    });
                }
            });

        })(jQuery)

        $(function () {
            $.Loupe("panelTest", "showImg");
        });