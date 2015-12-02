var MyMenuAim = function (options) {
    this.data = options.tree || [];
    this.$ul = $("#" + options.ulId);
    this.count = 0;
    this.init();
};

MyMenuAim.prototype = {
    init: function () {
        var self = this;
        var data = self.data;
        $.each(data, function (index, val) {
            var id = val.id;
            var pid = val.pId;
            var name = val.name;
            var mem = [];
            mem = $.grep(data, function (dataval) { return dataval.id == pid });
            if (mem.length == 0) {
                self.count = 0;
                var $li = $("<li class='level_" + self.count + "' id='" + id + "' pid='" + pid + "'><a><span>" + name + "</span></a></li>");
                self.$ul.append($li);
                self.loadChild(id, $li);

            }
        });
    },


    loadChild: function (id, $li) {
        var self = this;
        self.count++;
        var $ulself = $("<ul></ul>");
        var mem = [];
        mem = $.grep(self.data, function (dataval) { return dataval.pId == id });
        $.each(mem, function (index, val) {
            if (id == val.pId) {
                var $litemp = $("<li class='level_" + self.count + "' id='" + val.id + "' pid='" + val.pId + "'><a><span>" + val.name + "</span></a></li>");
                $li.append($ulself.append($litemp));
                var memTemp = [];
                memTemp = $.grep(self.data, function (dataval) { return dataval.pId == val.id });
                if (memTemp.length > 0) {
                    self.loadChild(val.id, $litemp);
                    self.count = 1;
                }
            }
            else
                return;
        });
    }
};