<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Index.aspx.cs" Inherits="E" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <link href="Css/all.css" rel="stylesheet" />
    <link href="Css/promptMes.css" rel="stylesheet" />
    <script src="Scripts/Libs/require.js"></script>
    <link href="Css/jquery.jgrowl.css" rel="stylesheet" />
    <script type="text/javascript">
        require.config({
            paths: {
                jquery: "Scripts/Libs/jquery-1.8.1.min.js",
                slideLeft: "Scripts/Module/Index/slideLeft.js",
                customplugin: "Scripts/plugin.js"
            },
            shim: {
                jquery: { exports: "$" },
                customplugin: ['jquery']
            }
        });
    </script>
    <script src="Scripts/Module/Index/Index.js"></script>
    <script src="Scripts/jquery-1.4.1.js"></script>
    <script src="Scripts/jquery.jgrowl.js"></script>
    <script type="text/javascript">
        //require(["slideLeft", "jquery"], function (slideLeft) {
        //    $(function () {
        //        var slideLeftOptions = (function () {
        //            return {
        //                aIco: "aIco",
        //                divLeft: "div_left",
        //                divRight: "div_right",
        //                url:"data/access.txt"
        //            };
        //        })();

        //        new slideLeft(slideLeftOptions);
        //    });
        //});

                    /** 
            * window.onresize 事件 专用事件绑定器 v0.1 Alucelx 
            * http://www.cnblogs.com/Alucelx/archive/2011/10/20/2219263.html 
            * <description> 
            * 用于解决 lte ie8 & chrome 及其他可能会出现的 原生 window.resize 事件多次执行的 BUG. 
            * </description> 
            * <methods> 
            * add: 添加事件句柄 
            * remove: 删除事件句柄 
            * </methods> 
            */
        var onWindowResize = function () {
            //事件队列 
            var queue = [],
            indexOf = Array.prototype.indexOf || function () {
                var i = 0, length = this.length;
                for (; i < length; i++) {
                    if (this[i] === arguments[0]) {
                        return i;
                    }
                }
                return -1;
            };
            var isResizing = {}, //标记可视区域尺寸状态， 用于消除 lte ie8 / chrome 中 window.onresize 事件多次执行的 bug 
            lazy = true, //懒执行标记 
            listener = function (e) { //事件监听器 
                var h = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight,
                w = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || document.body.clientWidth;
                if (h === isResizing.h && w === isResizing.w) {
                    return;
                } else {
                    e = e || window.event;
                    var i = 0, len = queue.length;
                    for (; i < len; i++) {
                        queue[i].call(this, e);
                    }
                    isResizing.h = h,
                    isResizing.w = w;
                }
            };
            return {
                add: function (fn) {
                    if (typeof fn === 'function') {
                        if (lazy) { //懒执行 
                            if (window.addEventListener) {
                                window.addEventListener('resize', listener, false);
                            } else {
                                window.attachEvent('onresize', listener);
                            }
                            lazy = false;
                        }
                        queue.push(fn);
                    } else { }
                    return this;
                },
                remove: function (fn) {
                    if (typeof fn === 'undefined') {
                        queue = [];
                    } else if (typeof fn === 'function') {
                        var i = indexOf.call(queue, fn);
                        if (i > -1) {
                            queue.splice(i, 1);
                        }
                    }
                    return this;
                }
            };
        }.call(this);

        
        $(function () {
            alert('fdsafd');
            var str = [3, 32, 5];
            str.each(function (i, val) {
                
            });


            var _fn = function () { alert("resize"); };

            onWindowResize.add(_fn);
            $("#Button1").bind('click', function (e, f) {

                $.jGrowl("THIS IS TEST EXAMPLE THIS IS TEST EXAMPLE THIS IS TEST EXAMPLE THIS IS TEST EXAMPLE", { position: "bottom-left" });
            });
            $(".banner").trigger("test", "fsf");


            function test() { alert("f"); }
            //var clearT = setInterval(test, 3000);



        });


    </script>
</head>
<body>

    <form id="form1" runat="server">

        <!--banner-->
        <div id="div_banner" class="head">
            <span class="banner">测试专区</span>
            <input type="button" id="btnleft" value="Left" />
            <input type="button" id="btnleftBottom" value="LeftBottom" />
            <input type="button" id="btncenter" value="Center" />
            <input type="button" id="btnright" value="Right" />
            <input type="button" id="btnrightBottom" value="RightBottom" />
            <input type="button" id="Button1" value="jGrowl" />
        </div>
        <div class="main">
            <!---左边区域-->
            <div id="div_left" class="left">
                <div class="div_search">
                    <input id="txtSearch" value="" />
                    <a class="a_search">搜索</a>
                    <a id="aIco" class="div_img"></a>
                </div>
                <div class="tree">

                    <ul id="zTree">
                        <li>aaa</li>
                        <li>bbb</li>
                        <li>ccc</li>
                    </ul>
                </div>

            </div>
            <div id="div_move" class="move"></div>
            <!----右边区域----->
            <div id="right" class="right">
                <iframe id="iframeId" src="" width="99%" height="99%" frameborder="0" style="position: absolute; left: 0px;"></iframe>
            </div>
        </div>
        <%--    <div id="divshow" style="width:800px;margin:auto; position:absolute;left:50px;top:100px; height:300px;border:1px solid red;padding:50px 0;">
        </div>--%>
    </form>
</body>
</html>
