/*!
 * jQuery tabs plugin
 * Version 1.0
 * @requires jQuery v1.4.1 or later
 * date 2013-6-28
 * 
 */


; (function () {
    
    function step($) {
        $.customMessage = function () { };

        $.fn.customMessage=function(){};

        $.extend($.customMessage.prototype);
    }

    if (typeof define === "function" && define.amd && define.amd.jQuery)
        define(["jquery"], step);
    else
        step(jQuery);
})();