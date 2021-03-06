(function(factory) {
	if (typeof define === "function" && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
})(function($) {

	var defaults = {
			ratio: 1.1,
			maxRatio: Math.pow(1.1, 20), //最大可放大N倍
			minRatio: Math.pow(1.1, 20), //最大可缩小N倍
			zoomValue: 100,
			zoomMax: 500,
			zoomMin: 100,
			wrap: 'wrap',
			wrapInner: 'wrap_inner',
			up: 'up',
			down: 'down',
			reset: 'reset'
		},
		originAttr = {
			width: 0,
			height: 0,
			left: 0,
			top: 0,
			onceset: false
		};
	var timer = null;

	$.Zoom = function(opts, callback) {
		var opts = $.extend({}, defaults, opts);
		var $wrap = $("#" + opts.wrap),
			$wrapInner = $("#" + opts.wrapInner),
			$btnUp = $("#" + opts.up),
			$btnDown = $("#" + opts.down),
			$btnReset = $("#" + opts.reset),
			//operator
			$operator = $("#operator"),
			$snapHandle = $("#snap_handle"),
			//slidbar
			$slidebar = $("#slidebar"),
			$originImg = $("img[data-high-res-src]"),
			wrapInnerLeft = $wrapInner.offset().left,
			wrapInnerTop = $wrapInner.offset().top,
			$img = $wrapInner.children().first(),
			containerDim = {
				w: $wrapInner.width(),
				h: $wrapInner.height()
			},
			operatorW = $operator.innerWidth(),
			operatorH = $operator.innerHeight(),
			//用于可放大的区域
			slideScopeW = operatorW - $slidebar.width(),
			//当前缩放比率(无缩放初始值为0)
			zoomRatio = 0,
			globalRatioX, globalRatioY,
			iw, ih, rw, rh, it, il, dir;


		// $snapHandle.on("mousewheel", function(e) {
		// 	zoomSnap(e.deltaY, e, $(this));
		// });

		$snapHandle.add($img).on("mousewheel", function(e) {
			var x = e.pageX,
				y = e.pageY,
				left;

			if (originAttr.onceset) {
				//zoomImg(e.deltaY, e);
				//滑轮滚动累加/累减值为 1/100
				if (e.deltaY > 0) {
					zoomRatio += 1 / 10;
				} else {
					zoomRatio -= 1 / 10;
				}

				zoomRatio = Math.max(zoomRatio, 0);
				zoomRatio = Math.min(1, zoomRatio);

				left = zoomRatio * slideScopeW;

				$slidebar.css({
					left: left
				});


				var pof = $(this).parent().offset(),
					point = {
						x: x - pof.left,
						y: y - pof.top
					};

				if (this === $snapHandle[0]) {
					point = null;
				}

				var perc = setPerc(zoomRatio);
				zoomView(perc, point);
			} else {
				alert("高清图还未准备好");
			}
		});

		$img.on("mousedown", function(e) {

			drag(this, null, e, {
				move: function(evt, objs) {
					adjustHandler();
				}
			});
			e.preventDefault();
		});

		$snapHandle.on("mousedown", function(e) {
			drag(this, $operator, e, {
				move: function(evt, objs) {
					var iw = originAttr.width * opts.zoomValue / 100,
						ih = originAttr.height * opts.zoomValue / 100;

					$img.css({
						left: -objs.disX / operatorW * iw,
						top: -objs.disY / operatorH * ih
					});
				}
			});

			e.preventDefault();
		});

		$slidebar.on("mousedown", function(e) {
			if (!originAttr.onceset) {
				return alert("高清图还未准备好");
			}
			e.preventDefault();

			drag(this, $(this).parent(), e, {
				move: function(evt, objs) {
					var ratio = objs.disX / slideScopeW,
						perc = setPerc(ratio);

					zoomRatio = ratio;

					zoomView(perc);
				}
			});
		});

		var setPerc = function(ratio) {
			//缩放的倍率
			var perc = opts.zoomMin + (opts.zoomMax - opts.zoomMin) * ratio;
			return perc;
		};

		function zoomView(perc, point) {
			var pof = $img.parent().offset(),
				point = point || {
					x: containerDim.w / 2,
					y: containerDim.h / 2
				};

			// cancelAnimationFrame(timer);

			// var curperc = opts.zoomValue,
			// 	step = 0;

			// function zoom() {
			// 	step++;
			// 	if (step < 20) {
			// 		timer = requestAnimationFrame(zoom);
			// 	}
			// 	var tickZoom = easeOutQuart(step, curperc, perc - curperc, 20);
			// 	var ratio = tickZoom / perc,
			// 		newWidth = originAttr.width * tickZoom / 100,
			// 		newHeight = originAttr.height * tickZoom / 100,
			// 		//根据坐标居中
			// 		pos = $img.position(),
			// 		newLeft = -((point.x - pos.left) * ratio / 100 - point.x),
			// 		newTop = -((point.y - pos.top) * ratio / 100 - point.y);

			// 	newLeft = Math.max(containerDim.w - newWidth, newLeft);
			// 	newTop = Math.max(containerDim.h - newHeight, newTop);

			// 	newLeft = Math.min(0, newLeft);
			// 	newTop = Math.min(0, newTop);

			// 	$img.css({
			// 		width: newWidth,
			// 		height: newHeight,
			// 		left: newLeft,
			// 		top: newTop
			// 	});

			// 	opts.zoomValue = tickZoom;

			// 	adjustHandler(newWidth, newHeight, newLeft, newTop);

			// }

			// zoom();
			var ratio = perc / 100,
				newWidth = originAttr.width * ratio,
				newHeight = originAttr.height * ratio,
				//根据坐标居中
				pos = $img.position(),

				// w = $img.width(),
				// h = $img.height(),
				// newLeft = point.x - (point.x - pos.left) / w * newWidth,
				// newTop = point.y - (point.y - pos.top) / h * newHeight;

				newLeft = -((point.x - pos.left) * perc / opts.zoomValue - point.x),
				newTop = -((point.y - pos.top) * perc / opts.zoomValue - point.y);
			//若无固定坐标时默认居中
			// newLeft = (containerDim.w - newWidth) / 2,
			// newTop = (containerDim.h - newHeight) / 2

			// if (perc < 120) {
			// 	newLeft = (containerDim.w - newWidth) / 2;
			// 	newTop = (containerDim.h - newHeight) / 2;
			// }
			newLeft = Math.max(containerDim.w - newWidth, newLeft);
			newTop = Math.max(containerDim.h - newHeight, newTop);

			newLeft = Math.min(0, newLeft);
			newTop = Math.min(0, newTop);

			$("#test").html(newWidth + '===' + newLeft + '===' + containerDim.w);

			$img.css({
				width: newWidth,
				height: newHeight,
				left: newLeft,
				top: newTop
			});
			opts.zoomValue = perc;

			adjustHandler(newWidth, newHeight, newLeft, newTop);
		}

		var adjustHandler = function(iWidth, iHeight, iLeft, iTop) {
			var iw = iWidth || originAttr.width * opts.zoomValue / 100,
				ih = iHeight || originAttr.height * opts.zoomValue / 100,
				hw = Math.min(containerDim.w / iw * 100, 100), //operatorW * (1 - ratio),
				hh = Math.min(containerDim.h / ih * 100, 100), //operatorH * (1 - ratio),
				hl = Math.max(-(iLeft || parseFloat($img.css("left"))) / iw * 100, 0),
				ht = Math.max(-(iTop || parseFloat($img.css("top"))) / ih * 100, 0);

			// if (parseInt(hl + hw) > 100) {
			// 	alert(hl + hw)
			// }

			// hl = Math.min(100 - hw, hl);
			// ht = Math.min(100 - hh, ht);
			// var iL = -hl * iw / 100;
			// var iT = -ht * ih / 100;
			// updateImgView(iL, iT);

			$snapHandle.css({
				top: ht + '%',
				left: hl + '%',
				width: hw + '%', // operatorW / opts.zoomValue * 100, //operatorW * containerDim.w / iw, // hw + '%',
				height: hh + '%'
			});
		};

		//更新View的值
		function updateImgView(iLeft, iTop) {
			$img.css({
				left: iLeft,
				top: iTop
			});
		}

		function resetZoom() {
			opts.zoomValue = 100;
			zoomView(opts.zoomValue);
		}

		var setSnapSize = function(val, success) {
			if (!success) {
				alert('图片加载失败，请重新加载!');
			}

			var imgWidth, imgHeight, iratio = val.width / val.height;
			imgWidth = operatorW;
			imgHeight = imgWidth / iratio;


			//初始化高宽随宽度的比率自适应
			operatorH = imgHeight;

			//初始化小框内图片的自适应
			$operator.css({
				height: imgHeight
			}).children('img').css({
				width: imgWidth,
				height: imgHeight
			});


			// globalRatioX = val.width / operatorW;
			// globalRatioY = val.height / operatorH;
			//初始化小框尺寸
			$snapHandle.css({
				//TODO
				width: imgWidth, // containerDim.w / globalRatioX, // operatorW,
				height: imgHeight // containerDim.h / globalRatioY //operatorH //
			});

			//初始化滑块尺寸
			var $slideParent = $slidebar.parent();
			// $slidebar.css({
			// 	width: $slideParent.width() / 20 // globalRatioX
			// });

			//保存图片初始参数
			if (val.width) {
				originAttr.top = parseFloat($img.css("top"));
				originAttr.left = parseFloat($img.css("left"));
				originAttr.width = iratio * containerDim.h > containerDim.w ? containerDim.w : iratio * containerDim.h; // val.width;
				originAttr.height = originAttr.width / iratio;
				originAttr.onceset = true;

				$img.css({
					width: originAttr.width,
					height: originAttr.height
				});
				containerDim = {
					w: originAttr.width,
					h: originAttr.height
				};
			}

		};

		$originImg.attr("src", $originImg.attr("data-high-res-src"));

		$originImg.on("load.zoom error.zoom", function(e) {
			setSnapSize(this, e.type === 'load');

		}).each(function(idx, el) {
			var src = el.src;

			if (el.complete && el.naturalWidth !== undefined && el.naturalWidth !== 0) {
				return setSnapSize(el, true);
			}
			if (el.readyState === undefined || el.complete) {
				el.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
				el.src = src;
			}
		});

		//TODO 暂时无用到
		function zoomImg(direction, e) {
			var percent;
			dir = direction;
			iw = $img.width();
			ih = $img.height();
			it = parseFloat($img.css("top"));
			il = parseFloat($img.css("left"));

			if (dir > 0) {
				rw = iw * opts.ratio;
				rh = ih * opts.ratio;
				percent = rw / originAttr.width;
			} else {
				rw = iw / opts.ratio;
				rh = ih / opts.ratio;
				percent = originAttr.width / rw;
			}


			if (percent > opts.maxRatio || percent > opts.minRatio) return;



			if (e && e.pageX) {
				var dirL = e.pageX - wrapInnerLeft;
				var dirT = e.pageY - wrapInnerTop;
				var proprtionX = (dirL - $img.position().left) / iw;
				var proprtionY = (dirT - $img.position().top) / ih;
				il = dirL - rw * proprtionX;
				it = dirT - rh * proprtionY;
			} else {
				il = (containerDim.w - rw) / 2;
				it = (containerDim.h - rh) / 2;
			}

			$img.css({
				width: rw,
				height: rh,
				left: il,
				top: it
			});
		}

		function drag(target, $parent, e, callback) {
			var $target = $(target),
				pos = {
					top: e.pageY - $target.position().top,
					left: e.pageX - $target.position().left
				},
				maxX = $parent && $parent.width() - $target.outerWidth(),
				maxY = $parent && $parent.height() - $target.outerHeight();
			if (window.attachEvent) {
				$target.one('selectstart', function() {
					return false;
					//拖拽div时禁止选中内容
					//-moz-user-select: none; -webkit-user-select: none;
				});
			} else {
				$target.css({
					"-moz-user-select": 'none',
					"-webkit-user-select": 'none'
				});
			}
			$(document).on({
				"mousemove.drag": function(evt) {
					var px = evt.pageX,
						py = evt.pageY,
						moveDisX = px - pos.left,
						moveDisY = py - pos.top;

					if ($parent) {
						moveDisX < 0 && (moveDisX = 0);
						moveDisX > maxX && (moveDisX = maxX);
						moveDisY < 0 && (moveDisY = 0);
						moveDisY > maxY && (moveDisY = maxY);
					}

					$target.css({
						top: moveDisY,
						left: moveDisX
					});
					if (callback && typeof callback.move == "function") {
						callback.move.call(null, evt, {
							moveDisX: moveDisX + $target.width(),
							moveDisY: moveDisY + $target.height(),
							disX: moveDisX,
							disY: moveDisY
						});
					}

					evt.preventDefault();
				},
				"mouseup.drag": function(e) {
					$(document).off(".drag");
					e.preventDefault();
				}
			});
		}



		function zoomSnap(direction, e, $target) {
			var percent,
				dir = direction,
				iw = $target.width(),
				ih = $target.height(),
				it = parseFloat($target.css("top")),
				il = parseFloat($target.css("left"));

			if (dir > 0) {
				rw = iw * opts.ratio;
				rh = ih * opts.ratio;
				percent = rw / originAttr.width;
			} else {
				rw = iw / opts.ratio;
				rh = ih / opts.ratio;
				percent = originAttr.width / rw;
			}

			var dirL = e.pageX - $target.parent().offset().left;
			var dirT = e.pageY - $target.parent().offset().top;
			var proprtionX = (dirL - il) / iw;
			var proprtionY = (dirT - it) / ih;
			il = dirL - rw * proprtionX;
			it = dirT - rh * proprtionY;

			$target.css({
				width: rw,
				height: rh,
				left: il,
				top: it
			});
		}

	};

	//由快到慢 ease out method  更多算法参考 src="../Scripts/jquery.easing.1.3.js">
	/*
	    t : current time,
	    b : intial value,
	    c : changed value,
	    d : duration
	*/
	function easeOutQuart(t, b, c, d) {
		t /= d;
		t--;
		return -c * (t * t * t * t - 1) + b;
	}
});