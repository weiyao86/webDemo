var imgObj = {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        pageX: 0,
        pageY: 0,
        disX: 0,
        disY: 0
    },
    distance = 1.1,
    /*倍率*/
    maxRatio = Math.pow(distance, 10),
    minRatio = Math.pow(distance, 10);
//滑轮放大图
function wheelzoomimg(img, e) {
    e = commonObj.evt(e);
    var active = e.detla > 0 ? "zoom" : "narrow";
    clickzooimg(active, img.id)
}

//点击放大
function clickzooimg(active, imgid) {
    var img = document.getElementById(imgid),
        style = commonObj.getStyle(img),
        parentEl = commonObj.getParent(img),
        pstyle = commonObj.getStyle(parentEl),
        iw = parseFloat(style.width),
        ih = parseFloat(style.height),
        lw, lt, l, t, ratio;


    setParentEl(parentEl);
    if (!imgObj.width) {
        imgObj.width = style.width;
        imgObj.height = style.height;
        imgObj.left = style.left;
        imgObj.top = style.top;
    }
    if (active != "zoom") { //缩小
        lw = iw / distance;
        lt = ih / distance;
        ratio = parseFloat(imgObj.width) / lw;
    } else { //放大
        lw = iw * distance;
        lt = ih * distance;
        ratio = lw / parseFloat(imgObj.width);
    }
    if (ratio >= maxRatio || ratio >= minRatio) {
        return;
    }
    if (imgObj.pageX) { //以某点为原点向周围发散
        l = imgObj.pageX - imgObj.disX * lw;
        t = imgObj.pageY - imgObj.disY * lt;
    } else {
        l = (parseFloat(pstyle.width) - lw) / 2;
        t = (parseFloat(pstyle.height) - lt) / 2;
    }

    img.style.width = lw + 'px';
    img.style.height = lt + 'px';
    img.style.left = l + "px";
    img.style.top = t + "px";
}

//还原图尺寸位置
function resetimg(imgid) {
    var img = document.getElementById(imgid);
    if (imgObj.width) {
        img.style.width = imgObj.width;
        img.style.height = imgObj.height;
        img.style.left = imgObj.left;
        img.style.top = imgObj.top;
    }
}

//拖动   
function drags(event) {
    event = event || window.event;
    var oimg = event.srcElement || event.target;
    try {

        return otherBrowser(oimg, event);
        if (!document.all) return otherBrowser(oimg, event);
        if (oimg.className == "drag") {
            if (oimg.src.indexOf("nopic.gif") > -1)
                return;
            dragapproved = true;
            z = event.srcElement;
            temp1 = z.style.pixelLeft;
            temp2 = z.style.pixelTop;
            x = event.clientX;
            y = event.clientY;
            document.onmousemove = move;
        }
    } catch (e) {}
}

function setParentEl(parentEl) {
    var pos = commonObj.getStyle(parentEl).position;
    if (pos === "static") {
        parentEl.style.position = "relative";
        parentEl.style.textAlign = "left";
    }
}

function otherBrowser(target, event) {
    if (target.className != "drag") return;

    var parentEl = commonObj.getParent(target),
        tstyle = commonObj.getStyle(target),
        dx = commonObj.getXY(event).x,
        dy = commonObj.getXY(event).y,
        cach_x = dx,
        cach_y = dy,
        offset = commonObj.getOffset(parentEl),
        x, y;

    setParentEl(parentEl);
    target.style.cursor = 'url("../PublicRes/grabbing.cur"),pointer';

    dx = dx - target.offsetLeft;
    dy = dy - target.offsetTop;

    if (!imgObj.width) {

        imgObj.width = tstyle.width;
        imgObj.height = tstyle.height;
        imgObj.left = tstyle.left;
        imgObj.top = tstyle.top;
    }

    imgObj.pageX = cach_x - offset.left;
    imgObj.pageY = cach_y - offset.top;
    imgObj.disX = (dx - offset.left) / parseFloat(tstyle.width);
    imgObj.disY = (dy - offset.top) / parseFloat(tstyle.height);

    function move(e) {
        var xy = commonObj.getXY(e);
        x = xy.x - dx;
        y = xy.y - dy;
        target.style.left = x + "px";
        target.style.top = y + "px";
    }

    function mouseup(e) {
        target.style.cursor = 'url("../PublicRes/grab.cur"),pointer';

        E.une(document, "mousemove", move);
        E.une(document, "mouseup", mouseup);
        if (target.releaseCapture) { //IE
            E.une(target, "losecapture", mouseup);
            target.releaseCapture();
        } else if (window.captureEvents) {
            E.une(window, "blur", mouseup);
        }
    }
    if (target.setCapture) {
        E.on(target, "losecapture", mouseup);
        target.setCapture();
        event.cancelBubble = true;
    } else if (window.captureEvents) {
        E.on(window, "blur", mouseup);
        event.stopPropagation();
        event.preventDefault();
    }

    E.on(document, "mousemove", move);
    E.on(document, "mouseup", mouseup);
}

var E = {
        "on": function(el, type, fun) {
            if (!el) return;
            if (type === "mousewheel" && document.mozHidden !== undefined) { //firefox dommousescroll
                type = "DOMMouseScroll";
            }
            el.addEventListener ? el.addEventListener(type, fun, false) : (el.attachEvent ? el.attachEvent("on" + type, fun) : el["on" + type] = fun);
        },
        "une": function(el, type, fun) {
            if (type === "mousewheel" && document.mozHidden !== undefined) {
                type = "DOMMouseScroll";
            }
            el.removeEventListener ? el.removeEventListener(type, fun, false) : (el.detachEvent ? el.detachEvent("on" + type, fun) : el['on' + type] = null);
        }
    },
    commonObj = {

        getStyle: function(el) {
            if (!el) return;
            return el.currentStyle ? el.currentStyle : getComputedStyle(el, null);
        },

        getParent: function(sub) {
            while (parentNode = sub.parentNode) {
                if (parentNode.nodeType != 3 || parentNode.nodeType == 1 || parentNode.nodeType == 9) break;
            }
            return parentNode;
        },
        getXY: function(e) {
            return {
                "x": e.clientX ? (e.clientX + document.body.scrollLeft + document.body.clientLeft) : e.pageX,
                "y": e.clientY ? (e.clientY + document.body.scrollTop + document.body.clientTop) : e.pageY
            };
        },
        getOffset: function(el) {
            //var left = 0, topy = 0;
            //while (el) {
            //    left += el.offsetLeft;
            //    topy += el.offsetTop;
            //    el = el.offsetParent;
            //}
            //return {
            //    left: left,
            //    top: topy
            //};
            if (typeof el == "string") {
                el = document.getElementById(el);
            }
            var box = el.getBoundingClientRect(),
                doc = el.ownerDocument,
                body = doc.body,
                html = doc.documentElement,
                clientTop = html.clientTop || body.clientTop || 0,
                clientLeft = html.clientLeft || body.clientLeft || 0,
                top = box.top + (html.scrollTop || body.scrollTop) - clientTop,
                left = box.left + (html.scrollLeft || body.scrollLeft) - clientLeft;
            return {
                'top': top,
                'left': left
            };
        },
        evt: function(e) {
            if (e.type === "DOMMouseScroll" || e.type === "mousewheel") {
                e.detla = e.wheelDelta ? e.wheelDelta / 120 : -(e.detail || 0) / 3; //evt.detla>0 上;
            }
            if (!e.target && e.srcElement) {
                e.target = e.srcElement;
            }
            if (!e.preventDefault && e.returnValue !== undefined) {
                e.preventDefault = function() {
                    e.returnValue = false;
                };
            }
            return e;
        }
    };

window._customAddEvent = E;