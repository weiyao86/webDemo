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

		$img.on("mousewheel", function(e) {
			if (originAttr.onceset) {
				zoomImg(e.deltaY, e);
			} else {
				alert("高清图还未准备好");
			}
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
					$img.css({
						left: objs.disX * -globalRatioX,
						top: objs.disY * -globalRatioY
					});
				}
			});

		});

		$slidebar.on("mousedown", function(e) {
			if (!originAttr.onceset) {
				return alert("高清图还未准备好");
			}
			e.preventDefault();

			var point = {
				x: containerDim.w / 2,
				y: containerDim.h / 2
			};

			drag(this, $(this).parent(), e, {
				move: function(evt, objs) {


					//大图的缩放根据滑块移动距离的
					var disbar = objs.disX / (operatorW - $slidebar.width());
					var t = opts.zoomMin + (opts.zoomMax - opts.zoomMin) * disbar;
					var ratio = t / 100,
						pos = $img.position(),
						iw = originAttr.width,
						ih = originAttr.height,
						newWidth = iw * ratio,
						newHeight = ih * ratio,
						//根据坐标居中 
						// newLeft = point.x - (point.x / iw) * newWidth,
						// newTop = point.y - (point.y / ih) * newHeight;
						newLeft = -((point.x - pos.left) * t / opts.zoomValue - point.x),
						newTop = -((point.y - pos.top) * t / opts.zoomValue - point.y);
					//若无固定坐标时默认居中
					// newLeft = (containerDim.w - newWidth) / 2,
					// newTop = (containerDim.h - newHeight) / 2 

					$img.css({
						width: newWidth,
						height: newHeight,
						left: newLeft,
						top: newTop
					});
					$("#test").html("--height:" + newHeight + "--ratio:" + ratio + "--top:" + newTop);
					opts.zoomValue = t;
					return;


					// globalRatioX = $img.width() / operatorW;
					// globalRatioY = $img.height() / operatorH;


					// var ratio = objs.disX / operatorW,
					// 	hw = containerDim.w / globalRatioX, //operatorW * (1 - ratio),
					// 	hh = containerDim.h / globalRatioY, //operatorH * (1 - ratio),
					// 	ht = $snapHandle.position().top,
					// 	hl = $snapHandle.position().left;

					// //hw = iw > ih ? containerDim.w / globalRatioX : iw * containerDim.w / globalRatioX / ih;
					// //hh = ih > iw ? containerDim.h / globalRatioY : ih * containerDim.h / globalRatioY / iw;


					// var newLeft = (operatorW - hw) / 2,
					// 	newTop = (operatorH - hh) / 2;

					// $("#test").html(hw);
					// $snapHandle.css({
					// 	top: newTop,
					// 	left: newLeft,
					// 	width: hw,
					// 	height: hh
					// });



				}
			});

		});

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

			if (el.complete && el.naturalWidth !== undefined) {
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
				maxX = $parent.width() - $target.outerWidth(),
				maxY = $parent.height() - $target.outerHeight();
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

					moveDisX < 0 && (moveDisX = 0);
					moveDisX > maxX && (moveDisX = maxX);
					moveDisY < 0 && (moveDisY = 0);
					moveDisY > maxY && (moveDisY = maxY);

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