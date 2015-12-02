(function(window) {

    var core_slice = Array.prototype.slice,
        core_version = '0.0.1',
        core_deletedIds = [],
        core_push = core_deletedIds.push,
        class2type = {},
        core_toString = class2type.toString;
    //通过ID获取元素
    weiLib = {
        $: function(el) {
            if (typeof el === 'string') el = document.getElementById(el);
            return el;
        },
        proxy: function(fn, context) {
            if (typeof context === "string") {
                tmp = fn[context];
                context = fn;
                fn = tmp;
            }

            // Quick check to determine if target is callable, in the spec
            // this throws a TypeError, but we will just return undefined.
            if (typeof fn !== "function") {
                return undefined;
            }

            // Simulated bind
            args = core_slice.call(arguments, 2);
            proxy = function() {
                return fn.apply(context || this, args.concat(core_slice.call(arguments)));
            };

            // Set the guid of unique handler to the same of original handler, so it can be removed
            proxy.guid = fn.guid = fn.guid || weiLib.guid++;

            return proxy;
        },
        //返回距离doc文档(0,0)的坐标
        offset: function(el) {
            var offset = {
                left: el.offsetLeft,
                top: el.offsetTop
            };
            while (el = el.offsetParent) {
                offset.left += el.offsetLeft;
                offset.top += el.offsetTop;
            }
            return offset;
        },

        rand: function(min, max) {
            return Math.round(min + (Math.random() * (max - min)));
        },
        //移动动画(后期加入队列)
        animate: function(el, styleObj, timer, fn) {
            if (!el) return;
            if (!timer) timer = 4 * 1000;
            var start = (new Date()).getTime(),
                position = {},
                count=0;
                clrTime = null;
            weiLib.queue(el, 'animate', function(next) {

                el.style.position = 'absolute';
               // window.clearTimeout(clrTime);
                starAnimate();

                function starAnimate() {
                    var now = (new Date()).getTime();
                    var fragin = now - start;
                    var f = fragin / timer;
                    var navStyle = null,
                        elStyle = null,
                        timeflag;

                    if (f < 1) {
                        for (var o in styleObj) {
                            navStyle = styleObj[o];
                            elStyle = weiLib.offset(el)[o] || 0;

                            if (position[o] == undefined) position[o] = parseInt(weiLib.getStyle(el, o)) || 0;
                            timeflag = Math.round(elStyle) != navStyle;
                            if (timeflag) {
                                elStyle = position[o] + (navStyle - position[o]) * f;
                                el.style[o] = elStyle + 'px';
                            }
                        }

                        clrTime = setTimeout(starAnimate, Math.min(25, timer - fragin));
                    } else {
                        stop(next);
                    }
                };
            });
            weiLib.dequeue(el, 'animate');

            function reset() {};

            function stop(next) {
                var now = (new Date()).getTime(),
                    time = now - start;
                console.log("'i'am come in method:stop--startDate:" + start + "--endDate:" + now + "--result:" + time);
                window.clearTimeout(clrTime);
                for (var o in styleObj) {
                    el.style[o] = styleObj[o] + 'px';
                }
                setTimeout(function() {
                    typeof fn === "function" && fn.call(el, time);
                }, 20);
                next();
            }
        },

        guid: 1,

        on: function(el, type, fn) {
            el.addEventListener ?
                el.addEventListener(type, fn, false) :
                el.attachEvent ?
                el.attachEvent("on" + type, fn) :
                el['on' + type] = fn;
        },
        un: function(el, type, fn) {
            el.removeEventListener ?
                el.removeEventListener(type, fn, false) :
                el.detachEvent ?
                el.detachEvent("on" + type, fn) :
                el['on' + type] = null;
        },
        evt: function(e) {
            return e || window.event;
        },

        ready: function(fn) {
            window.onload = fn;
        },

        error: function(msg) {
            throw new Error(msg);
        },

        getStyle: function(obj, attr) {
            if (window.currentStyle) {
                return obj.currentStyle[attr];
            } else {
                return window.getComputedStyle(obj, null)[attr];
            }
        },

        cache: {},

        uuid: 0,

        expando: "weiLib" + (core_version + Math.random()).replace(/\D/g, ""),

        data: function(elem, key, value) {

            //检查元素上能否绑定数据(!flash)暂没做
            var thisCache, ret, internalKey = weiLib.expando,
                getByName = typeof key === "string",
                isNode = elem.nodeType === 1,
                cache = weiLib.cache,
                id = elem[internalKey] ? elem[internalKey] : elem[internalKey] && internalKey;
            if (!id) {
                if (isNode) {
                    elem[internalKey] = id = ++weiLib.uuid;
                } else {
                    id = internalKey;
                }
            }
            if (!cache[id]) {
                cache[id] = {};
            }
            thisCache = cache[id];
            if (!thisCache.data) {
                thisCache.data = {};
            }
            thisCache = thisCache.data;


            if (value !== undefined) {
                thisCache[key] = value;
            }

            if (getByName) {
                ret = thisCache[key];
            } else {
                ret = thisCache;
            }
            if (!ret) return;
            return arguments.length > 2 ? elem : ret;
        },

        //入队
        queue: function(el, type, data) {
            var q;
            if (el) {
                type = (type || 'fx') + 'queue';
                q = weiLib.data(el, type);
                if (data) {
                    if (!q) {
                        q = weiLib.data(el, type, weiLib.makeArray(data));
                    } else {
                        q.push(data);
                    }
                }
                return q || [];
            }
        },

        //出队
        dequeue: function(el, type) {
            type = type || 'fx';
            //取出事件列表
            var queue = weiLib.queue(el, type),
                fn = queue.shift(),
                next = function() {
                    weiLib.dequeue(el, type);
                },
                hooks = {};
            if (fn) {
                fn.call(el, next, hooks);
            }
        },

        clearqueue: function(el, type) {
            return weiLib.queue(el, type, []);
        },

        isEmptyObject: function(obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },

        makeArray: function(arr, results) {
            var ret = results || [];
            if (arr != null) {
                if (isArrayLike(arr)) {
                    weiLib.merage(ret,
                        typeof arr === "string" ?
                        [arr] : arr
                    );
                } else {
                    core_push.call(ret, arr);
                }
            }
            return ret;
        },

        merage: function(first, second) {
            var l = first.length,
                s = second.length,
                j = 0;
            if (typeof s === "number") {
                for (; j < s; j++) {
                    first[l++] = second[j];
                }
            } else {
                while (second[j] !== undefined) {
                    first[l++] = second[j++];
                }
            }
            first.length = j;
            return first;
        },

        type: function(obj) {
            if (obj == null) {
                return String(obj);
            }
            return typeof obj === "object" || typeof obj === "function" ? class2type[core_toString.call(obj)] || "object" : typeof obj;
        }

    };

    function isArrayLike(obj) {
        var length = obj.lenght,
            type = weiLib.type(obj);
        if (obj.nodeType === 1 && length) return true;
        return type === "array" || type !== "function" && (length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj);
    }


    window.weiLib = window.w$ = weiLib;
})(window);/**
JS封装类方法一
**/
function myClass() {
    this.name = "zhangshan";
}
myClass.prototype = {
    init: function () {
        alert("init");
    },
    load:function(){
        alert("load");
    }
}
/**
JS封装类方法二
**/
var my=function(){
    this.name = "zhangshan";
}
my.prototype = {
    init: function () {
        alert("init");
    },
    load: function () {
        alert("load");
    }
}
/**
JS封装类方法三
**/
var Moduls = Moduls || {};
(function () {
    Moduls.myClassTest = function () {
        this.name = "lisi";
        this.age = 29;
    };
    Moduls.youClassTest = function () {
        this.override = "override";
    }
    Moduls.myClassTest.prototype ={
        init: function () { alert("封包Jquery"); },
        load: function () { alert("封包Jquery的Load方法");}
    }
    Moduls.youClassTest.prototype = {
        init:function(){
            alert("init");
        }
    }
})();