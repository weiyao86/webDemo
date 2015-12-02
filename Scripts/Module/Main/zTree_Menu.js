
/***********************首页菜单类***********************************************/
/*treeDemo-----Jquery对象*/
define(["ajax", "consts", "settings", "Fader", "zTree", "jquery", "amplify"],
    function (ajax, c, settings) {
        //style 
        var switchName = ["siderbar_permissions", "siderbar_task", "siderbar_team",
                "siderbar_parts", "siderbar_packerMaterial", "siderbar_packerCraft",
                "siderbar_packCraft", "siderbar_report"], switchCount = 0;

        var Types = c.Types;
        //建一JS类初始化Ztree相关信息
        var myMenu = function (options) {
            
            $.ajaxSetup({ cache: false });
            this.curMenu = null;
            this.zTree_Menu = null;
            this.optionUrl = options.url || "";
            this.iframeUrl = options.iframeUrl || "";
            this.$treeDemo = $("#" + (options.menuId || ""));
            //this.optionOnclick = options.callback.onclick || null;
            //设置ZTREE插件基本参数
            this.setting = {
                view: {
                    showLine: false,
                    showIcon: true,
                    selectedMulti: false,
                    dblClickExpand: false,
                    addDiyDom: this.addDiyDom
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    onClick: $.proxy(this.onClick_Temp, this)
                }
            };
            this.init();
        };
        myMenu.prototype = {
            //初始化
            init: function () {
                this.load();
            },
            //加载数据
            load: function () {
                var self = this;
                //调用ajax回调函数
                var ajaxOptions = {
                    type: "post",
                    url: self.optionUrl,
                    contextType: "application/json",
                    cache: false,
                    params: "[]",
                    dataType: "json",
                    onsuccess: $.proxy(self.success, self)  //绑定自身作用域
                };
                var ajaxResult = ajax.invoke(ajaxOptions);

                //var _success = $.getJSON(self.optionUrl, $.proxy(self.success, self));
            },
            //回调函数加载数据成功后进行绑定
            success: function (result) {
                var self = this;
                var zNodes = result.Data;
                
                //load skin
                for (var i = 0; i < zNodes.length; i++) {
                    if (zNodes[i].pId == "0") {
                        if (switchCount == switchName.length) {
                            switchCount = 0;
                        }
                        zNodes[i].iconSkin = switchName[switchCount];
                        switchCount++;
                    }
                }

                var treeObj = self.$treeDemo;
                $.fn.zTree.init(treeObj, self.setting, zNodes);
                self.zTree_Menu = $.fn.zTree.getZTreeObj(treeObj.attr("id"));

                self.curMenu = self.zTree_Menu.getNodes()[0];

                self.zTree_Menu.selectNode(self.curMenu);

                //
                treeObj.find("li>a").hover(function () {

                    var $ico = $(this).find("span[id*=_ico]");
                    var ico_css = $ico.attr("class");
                    if (ico_css.indexOf("_close") > -1) {
                        $ico.removeClass().addClass(ico_css.replace("_close", "_open"));
                    }
                }, function () {
                    var $ico = $(this).find("span[id*=_ico]");
                    if ($ico.data("_open") || $ico.data("_open") === undefined) {
                        var ico_css = $ico.attr("class");
                        if (ico_css.indexOf("_open") > -1) {
                            $ico.removeClass().addClass(ico_css.replace("_open", "_close"));
                        }
                    }
                });
            },
            //控制间距
            addDiyDom: function (treeId, treeNode) {
                var spaceWidth = 5;
                var switchObj = $("#" + treeNode.tId + "_switch"),
                icoObj = $("#" + treeNode.tId + "_ico");
                switchObj.remove();
                icoObj.before(switchObj);
                if (treeNode.level > 1) {
                    var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level) + "px'></span>";
                    switchObj.before(spaceStr);
                }
            },
            //鼠标单击事件
            onClick_Temp: function (e, treeId, treeNode) {
                var self = this;//treeDemo
                
                var url = typeof treeNode.treeUrl == Types.Undefined ? "" : treeNode.treeUrl;
                //本身是父节点并有下级节点
                // && treeNode.isParent
                if (treeNode.parentTId == null) {
                    var zTreeTemp = $.fn.zTree.getZTreeObj(self.$treeDemo.attr("id"));
                    zTreeTemp.expandNode(treeNode);

                    var icoObj = $("#" + treeNode.tId + "_ico");
                    icoObj.data("_open", icoObj.attr("class").indexOf("_close") > -1)

                }
                    //本身是父节点但没有下级节点或本身就是子节点,调用回调函数操作
                else //(typeof (self.optionOnclick) === Types.Function)
                {
                    var options = {
                        id: treeNode.id,
                        name: treeNode.name,
                        url: self.iframeUrl+"/"+treeNode.treeUrl
                    };
                    amplify.publish(settings.amplifyConstName.ulScroll, options);
                }
            }
        };
        return myMenu;
    });