define("", [],
    function () {
        
        var Menu = function (options) {
            this.txtUrl = options.url || "";
            this.init();
        };

        Menu.prototype = {
            init: function () { },

            load: function () { },

            addBindEvent: function () { }
        };


        return Menu;


    });