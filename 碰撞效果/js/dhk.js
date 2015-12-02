function onLoad(fn) {
	var old = window.onload;
	window.onload = function() {
		old && old();
		fn()
	}
}
if (typeof DockType == "undefined") {
	DockType = {
		LEFT: 1,
		RIGHT: 2,
		TOP: 4,
		BOTTOM: 8
	}
}
function Dock(oEle, iDirection, oDistance, fnOnBrowserChecked, fnOnResizeOrScroll) {
	var bIsIe6 = false;
	var obj = this;
	this.__oEle__ = oEle;
	this.__iDir__ = iDirection;
	this.__oDis__ = oDistance;
	this.fnOnResizeOrScroll = fnOnResizeOrScroll;
	if ( - 1 != window.navigator.userAgent.indexOf('MSIE 6.0')) {
		if ( - 1 != window.navigator.userAgent.indexOf('MSIE 7.0') || -1 != window.navigator.userAgent.indexOf('MSIE 8.0')) {
			bIsIe6 = false
		} else {
			bIsIe6 = true
		}
	} else {
		bIsIe6 = false
	}
	this.bIsIe6 = bIsIe6;
	if (fnOnBrowserChecked) {
		fnOnBrowserChecked(bIsIe6)
	}
	if (bIsIe6) {
		oEle.style.position = 'absolute'
	} else {
		oEle.style.position = 'fixed'
	}
	if (bIsIe6) {
		miaovAppendEventListener(window, "scroll",
		function() {
			obj.fixItem()
		})
	}
	miaovAppendEventListener(window, "resize",
	function() {
		obj.fixItem()
	});
	this.fixItem()
}
Dock.prototype.getScreen = function() {
	var t = document.body.scrollTop || document.documentElement.scrollTop;
	return {
		left: 0,
		right: document.documentElement.clientWidth,
		top: t,
		bottom: t + document.documentElement.clientHeight
	}
};
Dock.prototype.move = function(oDistance) {
	this.__oDis__ = oDistance;
	this.fixItem()
};
Dock.prototype.fixItem = function() {
	var t = document.body.scrollTop || document.documentElement.scrollTop;
	if (this.__iDir__ & DockType.LEFT) {
		this.__oEle__.style.left = this.__oDis__.left + 'px'
	} else if (this.__iDir__ & DockType.RIGHT) {
		this.__oEle__.style.left = document.documentElement.clientWidth - this.__oDis__.right - this.__oEle__.offsetWidth + 'px'
	} else if (this.__iDir__ & DockType.BOTTOM) {
		if (this.bIsIe6) {
			this.__oEle__.style.top = t + document.documentElement.clientHeight - this.__oDis__.bottom - this.__oEle__.offsetHeight
		} else {
			this.__oEle__.style.top = document.documentElement.clientHeight - this.__oDis__.bottom - this.__oEle__.offsetHeight
		}
	} else if (this.__iDir__ & DockType.TOP) {
		if (this.bIsIe6) {
			this.__oEle__.style.top = t + this.__oDis__.top + 'px'
		} else {
			this.__oEle__.style.top = this.__oDis__.top + 'px'
		}
	}
	if (this.fnOnResizeOrScroll) {
		this.fnOnResizeOrScroll({
			left: 0,
			right: document.documentElement.clientWidth,
			top: t,
			bottom: t + document.documentElement.clientHeight
		})
	}
};

function EffectBuffer(fDistanceCoefficient, iMinSpeed) {
	this.distanceCoefficient = fDistanceCoefficient;
	this.iMinSpeed = iMinSpeed
}
EffectBuffer.prototype.initMotion = function(aMotionData) {};
EffectBuffer.prototype.next = function(aMotionData) {
	var motion = null;
	var i = 0;
	var complete = true;
	for (i = 0; i < aMotionData.length; i++) {
		motion = aMotionData[i];
		motion.speed = (motion.target - motion.cur) / this.distanceCoefficient;
		motion.speed = ceilSpeed(motion.speed);
		if (Math.abs(motion.speed) < this.iMinSpeed) {
			motion.speed = this.iMinSpeed > 0 ? this.iMinSpeed: -this.iMinSpeed
		}
		if (Math.abs(motion.speed) > motion.speedMax) {
			motion.speed = (motion.speed > 0) ? motion.speedMax: -motion.speedMax
		}
		motion.cur += motion.speed;
		if (motion.cur != motion.target) {
			complete = false
		}
	}
	if (complete) {
		for (i = 0; i < aMotionData.length; i++) {
			aMotionData[i].cur = aMotionData[i].target;
			aMotionData[i].speed = 0
		}
		return true
	}
	return false
};

function initQuirkyPopup() {
	var oDiv = document.getElementById('messageBoardContainer');
	var oDivContent = oDiv.getElementsByTagName('div')[0];
	var oText = oDiv.getElementsByTagName('div')[2];
	var aSpan = oText.getElementsByTagName('span');
	var oCloseBtn = oDiv.getElementsByTagName('a')[0];
	var oBtnShow = document.getElementById('quirkyPopupShowBtn');
	var w = 354;
	var h = 294;
	var i = 0;
	var t = document.body.scrollTop || document.documentElement.scrollTop;
	oDiv.style.left = (document.documentElement.clientWidth - w) / 2 + 'px';
	oDiv.style.top = t + (document.documentElement.clientHeight) / 2 + 'px';
	for (i = 0; i < aSpan.length; i++) {
		aSpan[i].onmousedown = function(ev) {
			miaovCancelBubble(window.event || ev);
			return false
		}
	}
	var oQP = new QuirkyPopup(oDiv, oDiv, oBtnShow, oCloseBtn, {
		x: w,
		y: h
	},
	function() {
		return {
			x: oDiv.offsetLeft,
			y: oDiv.offsetTop
		}
	},
	function() {
		return {
			x: oDiv.offsetWidth,
			y: oDiv.offsetHeight
		}
	},
	function(x, y) {
		oDiv.style.left = x + 'px';
		oDiv.style.top = y + 'px'
	},
	function(x, y) {
		oDivContent.style.top = (y - h) / 2 + 'px';
		oDivContent.style.left = (x - w) / 2 + 'px';
		oDiv.style.width = x + 'px';
		oDiv.style.height = y + 'px'
	});
	setTimeout(function() {
		oQP.initShow()
	},
	1000);
	if (/msie 6/i.test(navigator.userAgent) && !/msie 7/i.test(navigator.userAgent) && !/msie 8/i.test(navigator.userAgent)) {
		oBtnShow.style.position = 'absolute';
		miaovAppendEventListener(window, 'scroll',
		function() {
			var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			oBtnShow.style.top = scrollTop + 'px'
		})
	}
}

function miaovCancelBubble(oEvent) {
	if (oEvent.stopPropagation) {
		oEvent.stopPropagation()
	} else {
		oEvent.cancelBubble = true
	}
}

function QuirkyPopup(oEleMove, oEleDrag, oEleBtn, oCloseBtn, oMaxSize, fnGetPos, fnGetSize, fnDoMove, fnDoResize, fnOnShowEnd, fnOnHideEnd) {
	var obj = this;
	var oSize = fnGetSize();
	var oPos = fnGetPos();
	this.__oEleMove__ = oEleMove;
	this.__oEleDrag__ = oEleDrag;
	this.__oEleBtn__ = oEleBtn;
	this.__oMaxSize__ = oMaxSize;
	this.__fnGetPos__ = fnGetPos;
	this.__fnGetSize__ = fnGetSize;
	this.__fnDoMove__ = fnDoMove;
	this.__fnDoResize__ = fnDoResize;
	this.__fnOnShowEnd__ = fnOnShowEnd;
	this.__fnOnHideEnd__ = fnOnHideEnd;
	this.__oDivOuter__ = document.createElement('div');
	this.__oDivOuter__.style.display = 'none';
	this.__oDivOuter__.style.background = 'white';
	this.__oDivOuter__.style.width = '100%';
	this.__oDivOuter__.style.filter = 'alpha(opacity=0)';
	this.__oDivOuter__.style.opacity = '0';
	this.__oDivOuter__.style.top = '0px';
	this.__oDivOuter__.style.left = '0px';
	this.__oDivOuter__.style.position = 'absolute';
	this.__oDivOuter__.style.zIndex = '3003';
	this.__oDivOuter__.style.overflow = 'hidden';
	this.__oDivOuter__.style.height = document.body.offsetHeight + "px";
	document.body.appendChild(this.__oDivOuter__);
	this.__oDrag__ = new PerfectDrag(oEleDrag, fnGetPos,
	function(x, y) {
		var top = document.body.scrollTop || document.documentElement.scrollTop;
		if (x < 0) {
			x = 0
		} else if (x + obj.__oMaxSize__.x > document.body.offsetWidth) {
			x = document.body.offsetWidth - obj.__oMaxSize__.x
		}
		if (y < top) {
			y = top
		} else if (y + obj.__oMaxSize__.y > top + document.documentElement.clientHeight) {
			y = top + document.documentElement.clientHeight - obj.__oMaxSize__.y
		}
		oEleMove.style.left = x + 'px';
		oEleMove.style.top = y + 'px';
		obj.__oSpeed__.x = x - obj.__oLastPos__.x;
		obj.__oSpeed__.y = y - obj.__oLastPos__.y;
		obj.__oLastPos__.x = x;
		obj.__oLastPos__.y = y
	},
	function() {
		obj.__oLastPos__ = obj.__fnGetPos__();
		obj.stopMove();
		obj.__oDivOuter__.style.display = 'block'
	},
	function() {
		obj.startMove();
		obj.__oDivOuter__.style.display = 'none'
	});
	this.__oDrag__.disable();
	this.__oLastPos__ = {
		x: 0,
		y: 0
	};
	this.__oSpeed__ = {
		x: 0,
		y: 0
	};
	this.__oMoveTimer__ = null;
	this.__oMLResize__ = new MoveLib([oSize.x, oSize.y], [60, 60],
	function(arr) {
		obj.__fnDoMove__(oPos.x, oPos.y - arr[1].cur / 2);
		obj.__fnDoResize__(arr[0].cur, arr[1].cur)
	},
	function() {
		obj.__oDrag__.enable();
		obj.startMove();
		oCloseBtn.onmousedown = function() {
			obj.hide();
			return false
		}
	},
	MoveLibType.BUFFER);
	this.__oMLMove__ = new MoveLib([0, 0], [40, 40],
	function(arr) {
		obj.__fnDoMove__(arr[0].cur, arr[1].cur)
	},
	function() {
		obj.startShowBtn();
		obj.__oDock__.fnOnResizeOrScroll = function(oPos) {
			obj.__oEleMove__.left = -obj.__oMaxSize__.x + 'px'
		}
	},
	MoveLibType.BUFFER);
	this.__oMLBtn__ = new MoveLib([0], [40],
	function(arr) {
		obj.__oDock__.move({
			left: arr[0].cur,
			top: 0
		})
	},
	function() {
		if (this.isOpening) {
			obj.__oSpeed__.x = 150 + Math.ceil(Math.random() * 150);
			obj.__oSpeed__.y = 0;
			obj.startMove();
			obj.__oDrag__.enable();
			this.isOpening = false
		}
	},
	MoveLibType.BUFFER);
	this.__oMLBtn__.isOpening = false;
	this.iAcc = 3;
	this.fScale = -0.7;
	this.__oEleBtn__.style.display = 'block';
	this.__oDock__ = new Dock(oEleBtn, DockType.LEFT | DockType.TOP, {
		left: -oEleBtn.offsetWidth,
		top: 0
	},
	null, null);
	this.__oEleBtn__.onclick = function() {
		var top = document.body.scrollTop || document.documentElement.scrollTop;
		oEleMove.style.top = top + 'px';
		obj.show()
	}
}
QuirkyPopup.prototype.initShow = function() {
	var obj = this;
	this.__oMLResize__.setTarget([this.__oMaxSize__.x, this.__oMaxSize__.y])
};
QuirkyPopup.prototype.show = function() {
	this.__oDrag__.disable();
	this.stopMove();
	this.__oMLBtn__.setCurrent([0]);
	this.__oMLBtn__.setTarget([ - this.__oEleBtn__.offsetWidth]);
	this.__oMLBtn__.isOpening = true
};
QuirkyPopup.prototype.hide = function() {
	var obj = this;
	var oPos = this.__fnGetPos__();
	var oSize = this.__oDock__.getScreen();
	var top = document.body.scrollTop || document.documentElement.scrollTop;
	this.__oDrag__.disable();
	this.stopMove();
	this.__oMLMove__.setCurrent([oPos.x, oPos.y]);
	this.__oMLMove__.setTarget([ - this.__oMaxSize__.x, oSize.top]);
	this.__oDock__.fnOnResizeOrScroll = function(oSize) {
		obj.__oMLMove__.setTarget([ - obj.__oMaxSize__.x, oSize.top])
	}
};
QuirkyPopup.prototype.startShowBtn = function() {
	this.__oMLBtn__.setCurrent([ - this.__oEleBtn__.offsetWidth]);
	this.__oMLBtn__.setTarget([0])
};
QuirkyPopup.prototype.startMove = function() {
	var obj = this;
	if (this.__oMoveTimer__) {
		clearInterval(this.__oMoveTimer__)
	}
	this.__oMoveTimer__ = setInterval(function() {
		obj.__doMove__()
	},
	30)
};
QuirkyPopup.prototype.stopMove = function() {
	clearInterval(this.__oMoveTimer__);
	this.__oMoveTimer__ = null
};
QuirkyPopup.prototype.__doMove__ = function() {
	var oPos = this.__fnGetPos__();
	var r = document.body.offsetWidth - this.__oMaxSize__.x;
	var t = document.body.scrollTop || document.documentElement.scrollTop;
	var b = t + document.documentElement.clientHeight - this.__oMaxSize__.y;
	this.__oSpeed__.y += this.iAcc;
	oPos.x += this.__oSpeed__.x;
	oPos.y += this.__oSpeed__.y;
	if (Math.abs(this.__oSpeed__.x) < 1) {
		this.__oSpeed__.x = 0
	}
	if (Math.abs(this.__oSpeed__.y) < 1) {
		this.__oSpeed__.y = 0
	}
	if (oPos.x <= 0) {
		oPos.x = 0;
		this.__oSpeed__.x *= this.fScale
	} else if (oPos.x >= r) {
		oPos.x = r;
		this.__oSpeed__.x *= this.fScale
	}
	if (oPos.y <= t) {
		oPos.y = t;
		this.__oSpeed__.y *= this.fScale
	} else if (oPos.y >= b) {
		oPos.y = b;
		this.__oSpeed__.y *= this.fScale;
		this.__oSpeed__.x *= -this.fScale
	}
	if (Math.abs(this.__oSpeed__.x) > 0 || Math.abs(this.__oSpeed__.y) > 0) {
		this.__fnDoMove__(oPos.x, oPos.y)
	}
};
if (typeof MoveLibType == "undefined") {
	MoveLibType = {
		COLLISION: 1,
		ELASTICITY: 2,
		BUFFER: 3,
		DIRECT: 4,
		DIRECT_SLOW: 5,
		DIRECT_FAST: 6,
		BUFFER_CUSTOM: 7
	}
}
if (typeof ceilSpeed == "undefined") {
	ceilSpeed = function(fSpeed) {
		return fSpeed > 0 ? Math.ceil(fSpeed) : -Math.ceil( - fSpeed)
	}
}
function MoveLib(aCur, aSpeedMax, fnDoMove, fnMoveEnd, iEffectType) {
	var i = 0;
	switch (iEffectType) {
	case MoveLibType.COLLISION:
		this.__oEffect__ = new EffectCollision( - 0.6, 3);
		break;
	case MoveLibType.ELASTICITY:
		this.__oEffect__ = new EffectElasticity(4, 0.65);
		break;
	case MoveLibType.BUFFER:
		this.__oEffect__ = new EffectBuffer(8);
		break;
	case MoveLibType.DIRECT:
		this.__oEffect__ = new EffectDirect(10);
		break;
	case MoveLibType.DIRECT_SLOW:
		this.__oEffect__ = new EffectDirect(20);
		break;
	case MoveLibType.DIRECT_FAST:
		this.__oEffect__ = new EffectDirect(5);
		break;
	case MoveLibType.BUFFER_CUSTOM:
		this.__oEffect__ = new EffectBuffer(parseInt(arguments[5]), parseInt(arguments[6]));
		break;
	default:
		alert('未知的类型' + iEffectType);
		return
	}
	this.motionDatas = [];
	for (i = 0; i < aCur.length; i++) {
		this.motionDatas[i] = {
			target: aCur[i],
			speed: 0,
			speedMax: aSpeedMax[i],
			cur: aCur[i]
		}
	}
	this.fnDoMove = fnDoMove;
	this.fnMoveEnd = fnMoveEnd;
	this.interval = 40;
	this.timer = null;
	this.lastTimer = 0;
	this.enabled = true;
	this.pause = false
}
MoveLib.prototype.setTarget = function(aValue) {
	var t = (new Date()).getTime();
	var allSame = true;
	var i = 0;
	for (i = 0; i < aValue.length; i++) {
		this.motionDatas[i].target = parseInt(aValue[i]);
		if (this.motionDatas[i].target != this.motionDatas[i].cur) {
			allSame = false
		}
	}
	if (allSame) {
		if (!this.timer) {
			this.start()
		}
		return
	}
	this.__oEffect__.initMotion(this.motionDatas);
	if (this.enabled) {
		if (!this.timer) {
			this.start()
		}
		if (t - this.lastTimer > this.interval) {
			this.__timerHandler__();
			this.lastTimer = t
		}
	}
};
MoveLib.prototype.setCurrent = function(aValue) {
	var i = 0;
	for (i = 0; i < aValue.length; i++) {
		this.motionDatas[i].cur = parseInt(aValue[i])
	}
};
MoveLib.prototype.start = function() {
	var obj = this;
	if (!this.enabled) {
		return
	}
	if (this.timer) {
		clearInterval(this.timer)
	} else {
		this.timer = setInterval(function() {
			obj.__timerHandler__()
		},
		this.interval)
	}
	this.iStartTime = ((new Date()).getTime());
	this.iCounter = 0
};
MoveLib.prototype.stop = function() {
	if (this.timer) {
		clearInterval(this.timer);
		this.timer = null
	}
};
MoveLib.prototype.__timerHandler__ = function() {
	var bEnd = false;
	if (this.pause) {
		return
	}
	bEnd = this.__oEffect__.next(this.motionDatas);
	if (bEnd) {
		if (this.fnMoveEnd) {
			this.fnMoveEnd(this.motionDatas)
		}
		this.fnDoMove(this.motionDatas);
		this.stop()
	} else {
		this.iCounter++;
		this.fnDoMove(this.motionDatas)
	}
	this.lastTimer = ((new Date()).getTime())
};

function miaovAppendEventListener(obj, sEventName, fnEvent) {
	if (obj.attachEvent) {
		obj.attachEvent('on' + sEventName, fnEvent)
	} else {
		obj.addEventListener(sEventName, fnEvent, false)
	}
}
function miaovRemoveEventListener(obj, sEventName, fnEvent) {
	if (obj.detachEvent) {
		obj.detachEvent('on' + sEventName, fnEvent)
	} else {
		obj.removeEventListener(sEventName, fnEvent, false)
	}
}
function miaovCancelBubble(oEvent) {
	if (oEvent.stopPropagation) {
		oEvent.stopPropagation()
	} else {
		oEvent.cancelBubble = true
	}
}

function PerfectDrag(oElementDrag, fnGetPos, fnDoMove, fnOnDragStart, fnOnDragEnd) {
	var obj = this;
	this.oElement = oElementDrag;
	this.oElement.style.overflow = 'hidden';
	this.fnGetPos = fnGetPos;
	this.fnDoMove = fnDoMove;
	this.fnOnDragStart = fnOnDragStart;
	this.fnOnDragEnd = fnOnDragEnd;
	this.__oStartOffset__ = {
		x: 0,
		y: 0
	};
	this.oElement.onmousedown = function(ev) {
		obj.startDrag(window.event || ev);
		return false
	};
	this.fnOnMouseUp = function(ev) {
		obj.stopDrag(window.event || ev)
	};
	this.fnOnMouseMove = function(ev) {
		obj.doDrag(window.event || ev)
	}
}
PerfectDrag.prototype.enable = function() {
	var obj = this;
	this.oElement.onmousedown = function(ev) {
		obj.startDrag(window.event || ev);
		return false
	}
};
PerfectDrag.prototype.disable = function() {
	this.oElement.onmousedown = null
};
PerfectDrag.prototype.startDrag = function(oEvent) {
	var oPos = this.fnGetPos();
	var x = oEvent.clientX;
	var y = oEvent.clientY;
	if (this.fnOnDragStart) {
		this.fnOnDragStart()
	}
	this.__oStartOffset__.x = x - oPos.x;
	this.__oStartOffset__.y = y - oPos.y;
	if (this.oElement.setCapture) {
		this.oElement.setCapture();
		this.oElement.onmouseup = this.fnOnMouseUp;
		this.oElement.onmousemove = this.fnOnMouseMove
	} else {
		document.addEventListener("mouseup", this.fnOnMouseUp, true);
		document.addEventListener("mousemove", this.fnOnMouseMove, true);
		window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP)
	}
};
PerfectDrag.prototype.stopDrag = function(oEvent) {
	if (this.oElement.releaseCapture) {
		this.oElement.releaseCapture();
		this.oElement.onmouseup = null;
		this.oElement.onmousemove = null
	} else {
		document.removeEventListener("mouseup", this.fnOnMouseUp, true);
		document.removeEventListener("mousemove", this.fnOnMouseMove, true);
		window.releaseEvents(Event.MOUSE_MOVE | Event.MOUSE_UP)
	}
	if (this.fnOnDragEnd) {
		if (oEvent.clientX == this.__oStartOffset__.x && oEvent.clientY == this.__oStartOffset__.y) {
			this.fnOnDragEnd(false)
		} else {
			this.fnOnDragEnd(true)
		}
	}
};
PerfectDrag.prototype.doDrag = function(oEvent) {
	var x = oEvent.clientX;
	var y = oEvent.clientY;
	this.fnDoMove(x - this.__oStartOffset__.x, y - this.__oStartOffset__.y)
};