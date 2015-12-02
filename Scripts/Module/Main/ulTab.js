define("ulTab", ["settings", "TabPanel", "amplify"], function (settings) {


    var ulTable = function (options) {
        // global variable
        
        this.tabpl = null;
        this.firstLoad = options.firstLoad;
        this.contextHeight = options.frameHeight;

        //jquery object

        // tab
        this.tablePanel = options.tablePanel;
        
        //
        this.init();
    };

    ulTable.prototype = {

        init: function () {
            var self = this;

            // first load
            self.load();

            self.subscribe();
        },

        load: function () {
            var self = this;
            
            self.tabpl = new TabPanel({
                renderTo: self.tablePanel,
                width: "100%",
                height: "100%",
                active: 0,
                autoResizable: true,
                items: [
                    {
                        id: self.firstLoad.id,
                        title: self.firstLoad.title,
                        html: '<iframe  src=' + self.firstLoad.url + ' scrolling="no" name="iframe_Name" width="100%" height="' + self.contextHeight + 'px"  frameborder="0"></iframe>',
                        closable: false,
                        disabled: false
                    }]
            });
        },

        subscribe: function () {
            var self = this;
            amplify.subscribe(settings.amplifyConstName.ulScroll, function (options) {
                var frame = '<iframe  src="' + options.url + '"  width="100%" height="99.9%"  scrolling="no" frameborder="0"></iframe>';
                var childFram = ({
                    id: options.id.toString(),
                    title: options.name,
                    html: frame,
                    closable: true,
                    disabled: false,
                    icon: ""
                });

                self.tabpl.addTab(childFram);
            });

           
            amplify.subscribe(settings.amplifyConstName.tabpanelResize, function () {
                self.tabpl.resize();
            });
        }
    };

    return ulTable;
});