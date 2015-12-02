
require(["zTree", "zTree_Menu", "ulTab", "sideAnimate","settings","customPlugin","domReady!", "jquery"],
    function (zTree, zTree_Menu, ulTab, sideAnimate, settings) {
        var windowHeight = $(window).height();
        var bannerHeight = $(".head").height();
        var contentHeight = parseInt(windowHeight) - parseInt(bannerHeight);
        
        //ztree options
        var zTreeOptions = (function () {
            return {
                url: settings.actions.menu,//menu,
                iframeUrl: settings.context.host,
                menuId: "treeDemo"
            };
        })();

        //tabpanel options
        var tabPanelOptions = (function () {
            return {
                tablePanel: "divFrame",
                firstLoad: settings.context.homePage,
                frameHeight: contentHeight
            };
        })();
        //side bar
        var sideAnimateOptions = (function () {
            return {
                aImage: "asideImage",
                divLeftbar: "divSidebar",
                divRightMain: "divMain"
            };
        })();

        //Initialize
        (function () {
            //menu manage
            new zTree_Menu(zTreeOptions);

            //table
            new ulTab(tabPanelOptions);

            //sideAnimateOptions
            new sideAnimate(sideAnimateOptions);
            //pageSource
            //new pageSource(pageSourceOptions);
        })();

    });