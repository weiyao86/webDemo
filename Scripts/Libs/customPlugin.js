define("customPlugin", ['jquery', 'blockUI'], function (blockUI) {
    (function () {

        $.fn.extend({
            clearAllBySearch: function () {
                var $inputList = this.find("input,select");
                $inputList.each(function (index, val) {

                    if (val.tagName == "INPUT") {
                        var type = $(val).attr("type");
                        switch (type) {
                            case "text":
                                $(val).val("");
                                break;
                            case "checkbox":
                                $(val).attr("checked", false);
                                break;
                            default:
                                break;
                        };
                    }
                    else if (val.tagName == "SELECT") {
                        val.selectedIndex = 0;
                    }
                });
            }
        });

        $.fn.openBlockUI = function () {
            var dataFlag = this.attr("data-flag");
            var dataSource = this.attr("data-source");
            if (dataFlag.toLowerCase() == 'update') {

            }
            else if (dataFlag.toLowerCase() == 'add') {
            }
        };

    })();


});