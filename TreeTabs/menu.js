/** jquery.color.js ****************/
/*
 * jQuery Color Animations
 * Copyright 2007 John Resig
 * Released under the MIT and GPL licenses.
 */

(function (jQuery) {

    // We override the animation for all of these color styles
    jQuery.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function (i, attr) {
        jQuery.fx.step[attr] = function (fx) {
            if (fx.state == 0) {
                fx.start = getColor(fx.elem, attr);
                fx.end = getRGB(fx.end);
            }
            if (fx.start)
                fx.elem.style[attr] = "rgb(" + [
                    Math.max(Math.min(parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0]), 255), 0),
                    Math.max(Math.min(parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1]), 255), 0),
                    Math.max(Math.min(parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2]), 255), 0)
                ].join(",") + ")";
        }
    });

    // Color Conversion functions from highlightFade
    // By Blair Mitchelmore
    // http://jquery.offput.ca/highlightFade/

    // Parse strings looking for color tuples [255,255,255]
    function getRGB(color) {
        var result;

        // Check if we're already dealing with an array of colors
        if (color && color.constructor == Array && color.length == 3)
            return color;

        // Look for rgb(num,num,num)
        if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
            return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

        // Look for rgb(num%,num%,num%)
        if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
            return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];

        // Look for #a0b1c2
        if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
            return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];

        // Look for #fff
        if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
            return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];

        // Otherwise, we're most likely dealing with a named color
        return colors[jQuery.trim(color).toLowerCase()];
    }

    function getColor(elem, attr) {
        var color;

        do {
            color = jQuery.curCSS(elem, attr);

            // Keep going until we find an element that has color, or we hit the body
            if (color != '' && color != 'transparent' || jQuery.nodeName(elem, "body"))
                break;

            attr = "backgroundColor";
        } while (elem = elem.parentNode);

        return getRGB(color);
    };

    // Some named colors to work with
    // From Interface by Stefan Petre
    // http://interface.eyecon.ro/

    var colors = {
        aqua: [0, 255, 255],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        black: [0, 0, 0],
        blue: [0, 0, 255],
        brown: [165, 42, 42],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgrey: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkviolet: [148, 0, 211],
        fuchsia: [255, 0, 255],
        gold: [255, 215, 0],
        green: [0, 128, 0],
        indigo: [75, 0, 130],
        khaki: [240, 230, 140],
        lightblue: [173, 216, 230],
        lightcyan: [224, 255, 255],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        navy: [0, 0, 128],
        olive: [128, 128, 0],
        orange: [255, 165, 0],
        pink: [255, 192, 203],
        purple: [128, 0, 128],
        violet: [128, 0, 128],
        red: [255, 0, 0],
        silver: [192, 192, 192],
        white: [255, 255, 255],
        yellow: [255, 255, 0]
    };

})(jQuery);

/** jquery.lavalamp.js ****************/
/**
 * LavaLamp - A menu plugin for jQuery with cool hover effects.
 * @requires jQuery v1.1.3.1 or above
 *
 * http://gmarwaha.com/blog/?p=7
 *
 * Copyright (c) 2007 Ganeshji Marwaha (gmarwaha.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Version: 0.1.0
 */

/**
 * Creates a menu with an unordered list of menu-items. You can either use the CSS that comes with the plugin, or write your own styles 
 * to create a personalized effect
 *
 * The HTML markup used to build the menu can be as simple as...
 *
 *       <ul class="lavaLamp">
 *           <li><a href="#">Home</a></li>
 *           <li><a href="#">Plant a tree</a></li>
 *           <li><a href="#">Travel</a></li>
 *           <li><a href="#">Ride an elephant</a></li>
 *       </ul>
 *
 * Once you have included the style sheet that comes with the plugin, you will have to include 
 * a reference to jquery library, easing plugin(optional) and the LavaLamp(this) plugin.
 *
 * Use the following snippet to initialize the menu.
 *   $(function() { $(".lavaLamp").lavaLamp({ fx: "backout", speed: 700}) });
 *
 * Thats it. Now you should have a working lavalamp menu. 
 *
 * @param an options object - You can specify all the options shown below as an options object param.
 *
 * @option fx - default is "linear"
 * @example
 * $(".lavaLamp").lavaLamp({ fx: "backout" });
 * @desc Creates a menu with "backout" easing effect. You need to include the easing plugin for this to work.
 *
 * @option speed - default is 500 ms
 * @example
 * $(".lavaLamp").lavaLamp({ speed: 500 });
 * @desc Creates a menu with an animation speed of 500 ms.
 *
 * @option click - no defaults
 * @example
 * $(".lavaLamp").lavaLamp({ click: function(event, menuItem) { return false; } });
 * @desc You can supply a callback to be executed when the menu item is clicked. 
 * The event object and the menu-item that was clicked will be passed in as arguments.
 */
(function ($) {
    $.fn.lavaLamp = function (o) {
        o = $.extend({ fx: "linear", speed: 500, click: function () { } }, o || {});

        return this.each(function (index) {

            var me = $(this), noop = function () { },
                $back = $('<li class="back"><div class="left"></div></li>').appendTo(me),
                $li = $(">li", this), curr = $("li.current", this)[0] || $($li[0]).addClass("current")[0];

            $li.not(".back").hover(function () {
                move(this);
            }, noop);

            $(this).hover(noop, function () {
                move(curr);
            });

            $li.click(function (e) {
                setCurr(this);
                return o.click.apply(this, [e, this]);
            });

            setCurr(curr);

            function setCurr(el) {
                $back.css({ "left": el.offsetLeft + "px", "width": el.offsetWidth + "px" });
                curr = el;
            };

            function move(el) {
                $back.each(function () {
                    $.dequeue(this, "fx");
                }
                ).animate({
                    width: el.offsetWidth,
                    left: el.offsetLeft
                }, o.speed, o.fx);
            };

            if (index == 0) {
                $(window).resize(function () {
                    $back.css({
                        width: curr.offsetWidth,
                        left: curr.offsetLeft
                    });
                });
            }

        });
    };
})(jQuery);

/** jquery.easing.js ****************/
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright В© 2008 George McGinley Smith
 * All rights reserved.
 */
jQuery.easing['jswing'] = jQuery.easing['swing']; jQuery.extend(jQuery.easing, { def: 'easeOutQuad', swing: function (x, t, b, c, d) { return jQuery.easing[jQuery.easing.def](x, t, b, c, d) }, easeInQuad: function (x, t, b, c, d) { return c * (t /= d) * t + b }, easeOutQuad: function (x, t, b, c, d) { return -c * (t /= d) * (t - 2) + b }, easeInOutQuad: function (x, t, b, c, d) { if ((t /= d / 2) < 1) return c / 2 * t * t + b; return -c / 2 * ((--t) * (t - 2) - 1) + b }, easeInCubic: function (x, t, b, c, d) { return c * (t /= d) * t * t + b }, easeOutCubic: function (x, t, b, c, d) { return c * ((t = t / d - 1) * t * t + 1) + b }, easeInOutCubic: function (x, t, b, c, d) { if ((t /= d / 2) < 1) return c / 2 * t * t * t + b; return c / 2 * ((t -= 2) * t * t + 2) + b }, easeInQuart: function (x, t, b, c, d) { return c * (t /= d) * t * t * t + b }, easeOutQuart: function (x, t, b, c, d) { return -c * ((t = t / d - 1) * t * t * t - 1) + b }, easeInOutQuart: function (x, t, b, c, d) { if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b; return -c / 2 * ((t -= 2) * t * t * t - 2) + b }, easeInQuint: function (x, t, b, c, d) { return c * (t /= d) * t * t * t * t + b }, easeOutQuint: function (x, t, b, c, d) { return c * ((t = t / d - 1) * t * t * t * t + 1) + b }, easeInOutQuint: function (x, t, b, c, d) { if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b; return c / 2 * ((t -= 2) * t * t * t * t + 2) + b }, easeInSine: function (x, t, b, c, d) { return -c * Math.cos(t / d * (Math.PI / 2)) + c + b }, easeOutSine: function (x, t, b, c, d) { return c * Math.sin(t / d * (Math.PI / 2)) + b }, easeInOutSine: function (x, t, b, c, d) { return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b }, easeInExpo: function (x, t, b, c, d) { return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b }, easeOutExpo: function (x, t, b, c, d) { return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b }, easeInOutExpo: function (x, t, b, c, d) { if (t == 0) return b; if (t == d) return b + c; if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b; return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b }, easeInCirc: function (x, t, b, c, d) { return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b }, easeOutCirc: function (x, t, b, c, d) { return c * Math.sqrt(1 - (t = t / d - 1) * t) + b }, easeInOutCirc: function (x, t, b, c, d) { if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b; return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b }, easeInElastic: function (x, t, b, c, d) { var s = 1.70158; var p = 0; var a = c; if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3; if (a < Math.abs(c)) { a = c; var s = p / 4 } else var s = p / (2 * Math.PI) * Math.asin(c / a); return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b }, easeOutElastic: function (x, t, b, c, d) { var s = 1.70158; var p = 0; var a = c; if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3; if (a < Math.abs(c)) { a = c; var s = p / 4 } else var s = p / (2 * Math.PI) * Math.asin(c / a); return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b }, easeInOutElastic: function (x, t, b, c, d) { var s = 1.70158; var p = 0; var a = c; if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5); if (a < Math.abs(c)) { a = c; var s = p / 4 } else var s = p / (2 * Math.PI) * Math.asin(c / a); if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b; return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b }, easeInBack: function (x, t, b, c, d, s) { if (s == undefined) s = 1.70158; return c * (t /= d) * t * ((s + 1) * t - s) + b }, easeOutBack: function (x, t, b, c, d, s) { if (s == undefined) s = 1.70158; return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b }, easeInOutBack: function (x, t, b, c, d, s) { if (s == undefined) s = 1.70158; if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b; return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b }, easeInBounce: function (x, t, b, c, d) { return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b }, easeOutBounce: function (x, t, b, c, d) { if ((t /= d) < (1 / 2.75)) { return c * (7.5625 * t * t) + b } else if (t < (2 / 2.75)) { return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b } else if (t < (2.5 / 2.75)) { return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b } else { return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b } }, easeInOutBounce: function (x, t, b, c, d) { if (t < d / 2) return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b; return jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b } });
/*
 * jQuery Easing Compatibility v1 - http://gsgd.co.uk/sandbox/jquery.easing.php
 *
 * Adds compatibility for applications that use the pre 1.2 easing names
 *
 * Copyright (c) 2007 George Smith
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 */
jQuery.extend(jQuery.easing, { easeIn: function (x, t, b, c, d) { return jQuery.easing.easeInQuad(x, t, b, c, d) }, easeOut: function (x, t, b, c, d) { return jQuery.easing.easeOutQuad(x, t, b, c, d) }, easeInOut: function (x, t, b, c, d) { return jQuery.easing.easeInOutQuad(x, t, b, c, d) }, expoin: function (x, t, b, c, d) { return jQuery.easing.easeInExpo(x, t, b, c, d) }, expoout: function (x, t, b, c, d) { return jQuery.easing.easeOutExpo(x, t, b, c, d) }, expoinout: function (x, t, b, c, d) { return jQuery.easing.easeInOutExpo(x, t, b, c, d) }, bouncein: function (x, t, b, c, d) { return jQuery.easing.easeInBounce(x, t, b, c, d) }, bounceout: function (x, t, b, c, d) { return jQuery.easing.easeOutBounce(x, t, b, c, d) }, bounceinout: function (x, t, b, c, d) { return jQuery.easing.easeInOutBounce(x, t, b, c, d) }, elasin: function (x, t, b, c, d) { return jQuery.easing.easeInElastic(x, t, b, c, d) }, elasout: function (x, t, b, c, d) { return jQuery.easing.easeOutElastic(x, t, b, c, d) }, elasinout: function (x, t, b, c, d) { return jQuery.easing.easeInOutElastic(x, t, b, c, d) }, backin: function (x, t, b, c, d) { return jQuery.easing.easeInBack(x, t, b, c, d) }, backout: function (x, t, b, c, d) { return jQuery.easing.easeOutBack(x, t, b, c, d) }, backinout: function (x, t, b, c, d) { return jQuery.easing.easeInOutBack(x, t, b, c, d) } });


/** apycom menu ****************/
jQuery(window).load(function () {
    alert
    var $ = jQuery;

    // retarder

    $.fn.retarder = function (delay, method) {

        var node = this;

        if (node.length) {

            if (node[0]._timer_) clearTimeout(node[0]._timer_);

            node[0]._timer_ = setTimeout(function () { method(node); }, delay);

        }

        return this;

    };

    (function () {

        var links = document.getElementsByTagName('a');

        for (var i = 0; i < links.length; i++) {

            if (links[i].href && /^http:\/\/(?:www\.|)apycom\.com[\/]*$/i.test(links[i].href))

                return true;

        }



        return false;

    })();; var html = $('#menu').html().replace(/(<div[^>]*>)/ig, '<span class="spanbox">$1').replace(/(<\/div>)/ig, '$1</span>'); $('#menu').addClass('active').html(html).find('span.spanbox').css('display', 'none'); setTimeout(function () { var div = $('#menu .columns'); var names = ['one', 'two', 'three', 'four', 'five']; for (var i = 0; i < div.length; i++) { for (var j = 0; j < names.length; j++) { if (div.eq(i).hasClass(names[j])) div.eq(i).parent().css({ width: 200 * (j + 1), paddingTop: 14 }) } } }, 100); $('#menu .menu>li').hover(function () { var box = $('span.spanbox:first', this); var div = box.find('div:first'); if (box.length) { div.retarder(400, function (i) { box.css({ display: 'block', visibility: 'visible' }); if (!box[0].hei) { box[0].hei = box.height() + 50; box[0].wid = box.width(); div.css('height', box.height()) } box.css({ height: box[0].hei, width: box[0].wid, overflow: 'hidden' }); i.css('top', -(box[0].hei)).stop(true, true).animate({ top: 0 }, { easing: 'backout', duration: 300, complete: function () { div.css('top', 0); box.css('height', box[0].hei - 50) } }) }) } }, function () { var box = $('span.spanbox:first', this); var div = box.find('div:first'); if (box.length) { if (!box[0].hei) { box[0].hei = box.height() + 50; box[0].wid = box.width() } var animate = { from: { top: 0 }, to: { top: -(box[0].hei) } }; if (!$.browser.msie) { animate.from.opacity = 1; animate.to.opacity = 0 } $('span.spanbox span.spanbox', this).css('visibility', 'hidden'); div.retarder(150, function (i) { box.css({ height: box[0].hei - 50, width: box[0].wid, overflow: 'hidden' }); i.css(animate.from).stop(true, true).animate(animate.to, { duration: 200, complete: function () { if (!$.browser.msie) div.css('opacity', 1); box.css('display', 'none') } }) }) } }); $('#menu ul ul li').hover(function () { var box = $('span.spanbox:first', this); var div = box.find('div:first'); if (box.length) { div.retarder(180, function (i) { box.parent().parent().parent().parent().css('overflow', 'visible'); box.css({ display: 'block', visibility: 'visible' }); if (!box[0].hei) { box[0].hei = box.height(); box[0].wid = box.width() + 50; div.css('height', box.height()) } box.css({ height: box[0].hei, width: box[0].wid, overflow: 'hidden' }); i.css({ left: -(box[0].wid) }).stop(true, true).animate({ left: 0 }, { easing: 'backout', duration: 200, complete: function () { div.css('left', 0); box.css('width', box[0].wid - 50) } }) }) } }, function () { var box = $('span.spanbox:first', this); var div = box.find('div:first'); if (box.length) { if (!box[0].hei) { box[0].hei = box.height(); box[0].wid = box.width() + 50 } var animate = { from: { left: 0 }, to: { left: -(box[0].wid) } }; if (!$.browser.msie) { animate.from.opacity = 1; animate.to.opacity = 0 } div.retarder(150, function (i) { box.css({ height: box[0].hei, width: box[0].wid - 50, overflow: 'hidden' }); i.css(animate.from).stop(true, true).animate(animate.to, { duration: 200, complete: function () { if (!$.browser.msie) div.css('opacity', 1); box.css('display', 'none') } }) }) } }); var timer = 0; $('#menu>ul>li>a').css('background', 'none'); $('#menu>ul>li>a span').css('background-position', 'right -4px'); $('#menu>ul>li>a.parent span').css('background-position', 'right -49px'); $('#menu ul.menu').lavaLamp({ speed: 300 }); $('#menu>ul>li').hover(function () { var li = this; if (timer) clearTimeout(timer); timer = setTimeout(function () { if ($('>a', li).hasClass('parent')) $('>li.back', li.parentNode).removeClass('current-back').addClass('current-parent-back'); else $('>li.back', li.parentNode).removeClass('current-parent-back').addClass('current-back') }, 300) }, function () { if (timer) clearTimeout(timer); $('>li.back', this.parentNode).removeClass('current-parent-back').removeClass('current-back') }); $('#menu div a span').css('background-color', 'transparent'); $('#menu div a.parent span').css('background-position', '-576px bottom'); $('#menu ul ul a').css('background', 'none').not('.parent').hover(function () { $(this).stop(true, true).css('backgroundColor', 'rgb(83,83,83)').animate({ backgroundColor: 'rgb(54,54,54)' }, 300, 'easeIn', function () { $(this).css('backgroundColor', 'rgb(54,54,54)') }) }, function () { $(this).stop(true, true).animate({ backgroundColor: 'rgb(83,83,83)' }, 300, 'easeInOut', function () { $(this).css('background', 'none') }) }); $('#menu ul ul li').hover(function () { $('>a.parent', this).stop(true, true).css('backgroundColor', 'rgb(83,83,83)').animate({ backgroundColor: 'rgb(54,54,54)' }, 300, 'easeIn', function () { $(this).css('backgroundColor', 'rgb(54,54,54)').find('span').css('background-position', '-960px bottom') }) }, function () { $('>a.parent', this).stop(true, true).animate({ backgroundColor: 'rgb(83,83,83)' }, 300, 'easeInOut', function () { $(this).css('background', 'none').find('span').css('background-position', '-576px bottom') }).find('span').css('background-position', '-576px bottom') }); $('body').append('<div class="menu-images-preloading"><div class="columns-png"></div><div class="subitem-png"></div></div>'); setTimeout(function () { $('body>div.menu-images-preloading').hide() }, 7500)
});