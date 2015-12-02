;
(function ($) {


    $.Loupe = function (panel, config) {

        var field = $.fn.Loupe.prototype.defaults.loupeField;
        $("#" + panel).find("div[data-field='" + field + "']").each(function (index, val) {
            $(val).Loupe(config);
        });
    };
    $.fn.Loupe = function (config) {
        if ($.isFunction(this.each)) {
            return this.each(function (idx, val) {
                var $target = $(val),
                    $large = $target.find("[data-field='move']"),
                    $small = $target.find("[data-field='img']"),
                    src = $small.attr('src').replace(/(\!500d)|(\!100d)/, ''),
                    flag = true;

                if ($(val).data("Loupe") == undefined) {
                    $(val).data("Loupe", new $.fn.Loupe());
                }
                if (config.filter) {

                    for (var i = 0; i < config.filter.length; i++) {
                        var reg = new RegExp(config.filter[i], 'ig');
                        if (reg.test(src)) {
                            flag = false;
                            break;
                        }
                    }
                }
                flag && $(val).data("Loupe").move(val, $large, $small, config);

            });
        }
    };
    $.fn.Loupe.prototype.defaults = {
        loupeField: 'Loupe',
        isNavigatorShow: true
    };
    $.extend($.fn.Loupe.prototype, {
        move: function (sender, $large, $small, config) {
            var self = this;
            self.arr = $.extend({}, $.fn.Loupe.prototype.defaults, {
                nativeW: 0,
                nativeH: 0,
                _width: $(sender).width(),
                _height: $(sender).height()
            }, config);

            var $showImg = $(self.arr.showImg),
                 showImgW = $showImg.width(),
                 showImgH = $showImg.height(),
                 largeWidth = $large.width(),
                 largeHeight = $large.height(),
                 m = $(sender).offset(),
                 nativeW,
                 nativeH,
                 targetWidth = self.arr._width,
                 targetHeight = self.arr._height,
                 maxX = self.arr._width - largeWidth,
                 maxY = self.arr._height - largeHeight,
                 minX = largeWidth / 2,
                 minY = largeHeight / 2,
                 blank = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

            $(sender).on({
                "mouseenter": function () {
                    var src = $small.attr("src").replace(/\!\w*$/, ''),
                        img = new Image();
                    nativeW = nativeH = 0;
                    $(img).on("load", function () {
                        nativeW = img.width;
                        nativeH = img.height;
                    }).each(function () {
                        // cached images don't fire load sometimes, so we reset src.
                        if (this.complete || this.complete === undefined) {
                            var src = this.src;
                            this.src = blank;
                            this.src = src;
                        }
                    });
                    img.src = src;

                    $(this).css("cursor", "move"); //crosshair

                    self.arr.isNavigatorShow && $large.css("background", "url('" + src + "') no-repeat");

                    $showImg.css({
                        "background": "#fff url('" + src + "') no-repeat"
                    }).show();

                    $large.show();
                },

                "mousemove": function (e) {

                    if (nativeW || nativeH) {
                        var mx = e.pageX - m.left,
                            my = e.pageY - m.top;

                        if ($large.is(":visible")) {
                            var backOffLeft = 0, backOffTop = 0,
                                yx = mx - largeWidth / 2,
                                yy = my - largeHeight / 2,
                                backPosition, l, t;

                            if (self.arr.isNavigatorShow) {
                                backOffLeft = Math.round(mx / targetWidth * nativeW - largeWidth / 2) * -1;
                                backOffTop = Math.round(my / targetHeight * nativeH - largeHeight / 2) * -1;
                            } else {
                                mx < minX && (yx = 0);
                                yx > maxX && (yx = maxX);
                                my < minY && (yy = 0);
                                yy > maxY && (yy = maxY);
                            }

                            backPosition = backOffLeft + "px" + " " + backOffTop + "px";

                            $large.css({
                                top: yy,
                                left: yx,
                                backgroundPosition: backPosition
                            });

                           // mx = $large.position().left + largeWidth / 2;
                           // my = $large.position().top + largeHeight/ 2;

                            l = Math.round(mx / targetWidth * nativeW-showImgH / 2) * -1;
                            t = Math.round(my / targetHeight * nativeH - showImgH / 2) * -1;

                            $showImg.css({
                                backgroundPosition: l + "px" + " " + t + "px"
                            });
                        }
                    }

                    e.preventDefault();
                    e.stopPropagation();
                },
                "mouseleave": function (e) {
                    $large.add($showImg).hide();
                    e.preventDefault();
                }
            });
        }
    });

})(jQuery)