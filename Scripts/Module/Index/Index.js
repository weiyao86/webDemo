require(["slideLeft", "jquery"], function (slideLeft) {
    $(function () {
        
        var fun = function () {
            var winHeight = $(window).height();
            var flagheight = winHeight - $("#div_banner").height();
            $("#div_left").height(flagheight);
            $("#right").height(flagheight);
            $("#div_move").height(flagheight);
            var tempHeight = function () { return flagheight;}
            return tempHeight;
        }

        var slideLeftOptions = (function () {
            return {
                aIco: "aIco",
                divLeft: "div_left",
                divRight: "right",
                url: "data/access.txt",
                divMove: "div_move"
            };
        })();
        
        new slideLeft(slideLeftOptions);

        fun();
        $(window).resize(fun);
    });
});