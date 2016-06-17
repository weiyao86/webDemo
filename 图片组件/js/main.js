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
	var gratio = 0;
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
			$img = $wrapInner.children(),
			containerDim = {
				w: $wrapInner.width(),
				h: $wrapInner.height()
			},
			operatorW = $operator.innerWidth(),
			operatorH = $operator.innerHeight(),
			globalRatioX, globalRatioY,
			iw, ih, rw, rh, it, il, dir;
		var sc = 0;
		$img.on("mousewheel", function(e) {
			if (originAttr.onceset) {
				//zoomImg(e.deltaY, e);
				var barLeft = $slidebar.position().left;
				if (e.deltaY > 0) {
					barLeft += 5;
				} else {
					barLeft -= 5;
				}
				barLeft = Math.max(barLeft, 0);
				barLeft = Math.min(operatorW - $slidebar.width(), barLeft);

				$slidebar.css({
					left: barLeft
				});

				var perc = setPerc(barLeft);

				zoomView(perc, {
					x: e.pageX,
					y: e.pageY
				});
			} else {
				alert("高清图还未准备好");
			}
		});

		$img.on("mousedown", function(e) {
			e.preventDefault();

			drag(this, null, e, {
				move: function(evt, objs) {
					adjustHandler();
				}
			});
		});

		// $img.on({
		// 	"mousemove.drag": function(e) {
		// 		var $target = $(this),
		// 			$parent = $target.parent(),
		// 			distance = 1,
		// 			dirX = (e.pageX - $parent.offset().left) / $parent.width() >= 0.5 ? -distance : distance,
		// 			dirY = (e.pageY - $parent.offset().top) / $parent.height() >= 0.5 ? -distance : distance;

		// 		var dirX = $target.position().left + dirX;
		// 		var dirY = $target.position().top + dirY;
		// 		$target.css({
		// 			left: dirX,
		// 			top: dirY
		// 		});
		// 	}
		// });

		$btnUp.click(function() {
			zoomImg(1);
		});

		$btnDown.click(function() {
			zoomImg(-1);
		});


		$btnReset.on("click", function() {
			$img.css({
				width: originAttr.width,
				height: originAttr.height,
				left: originAttr.left,
				top: originAttr.top
			});
		});

		$snapHandle.on("mousedown", function(e) {
			e.preventDefault();
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
		});

		$slidebar.on("mousedown", function(e) {
			if (!originAttr.onceset) {
				return alert("高清图还未准备好");
			}
			e.preventDefault();

			drag(this, $(this).parent(), e, {
				move: function(evt, objs) {

					var perc = setPerc(objs.disX);
					// $("#test").html(objs.disX);
					zoomView(perc);
				}
			});
		});

		var setPerc = function(disX) {
			//缩放根据滑块移动比率
			var disbar = disX / (operatorW - $slidebar.width()),
				perc = opts.zoomMin + (opts.zoomMax - opts.zoomMin) * disbar;
			return perc;
		};

		function zoomView(perc, point) {
			var point = point || {
				x: containerDim.w / 2,
				y: containerDim.h / 2
			};

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


			$img.css({
				width: newWidth,
				height: newHeight,
				left: newLeft,
				top: newTop
			});

			adjustHandler(newWidth, newHeight, newLeft, newTop);
			opts.zoomValue = perc;
		}

		var adjustHandler = function(iWidth, iHeight, iLeft, iTop) {
			var iw = iWidth || originAttr.width * opts.zoomValue / 100,
				ih = iHeight || originAttr.height * opts.zoomValue / 100,
				hw = Math.min(containerDim.w / iw * 100, 100), //operatorW * (1 - ratio),
				hh = Math.min(containerDim.h / ih * 100, 100), //operatorH * (1 - ratio),
				hl = Math.max(-(iLeft || parseFloat($img.css("left"))) / iw * 100, 0),
				ht = Math.max(-(iTop || parseFloat($img.css("top"))) / ih * 100, 0);


			hl = Math.min(100 - hw, hl);
			ht = Math.min(100 - hh, ht);
			var iL = -hl * iw / 100;
			var iT = -ht * ih / 100;
			updateImgView(iL, iT);

			$snapHandle.css({
				top: ht + '%',
				left: hl + '%',
				width: hw + '%',
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

		var setSnapSize = function(val) {

			var imgWidth, imgHeight, iratio = val.width / val.height;
			imgWidth = iratio * operatorH > operatorW ? operatorW : iratio * operatorH;
			imgHeight = imgWidth / iratio;

			//初始化小框内图片的自适应
			$operator.children('img').css({
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
			}

		};

		$originImg.load(function() {
			setSnapSize(this);

		}).each(function(idx, el) {
			var src = el.src;

			if (el.complete && el.naturalWidth !== undefined && el.naturalWidth !== 0) {
				return setSnapSize(el);
			}
			if (el.readyState === undefined || el.complete) {
				el.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
				el.src = src;
			}
		}).attr("src", $originImg.attr("data-high-res-src"));

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

			console.log(percent + '---------' + opts.maxRatio + '---------' + opts.minRatio);

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

	};
});