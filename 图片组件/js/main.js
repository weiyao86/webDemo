(function(factory) {
	if (typeof define === "function" && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
})(function($) {

	var defaults = {
			ratio: 1.1,
			maxRatio: Math.pow(1.1, 10), //最大可放大N倍
			minRatio: Math.pow(1.1, 10),//最大可缩小N倍
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
			onceset: true
		};

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
			operatorW = $operator.width(),
			operatorH = $operator.height(),
			globalRatioX, globalRatioY,
			iw, ih, rw, rh, it, il, dir;

		$img.on("mousewheel", function(e) {
			zoomImg(e.deltaY, e);
			//console.log($img.width());
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
			drag(this, $operator, e, {
				move: function(evt, objs) {

					$img.css({
						left: objs.disX * -globalRatioX - 2,
						top: objs.disY * -globalRatioY - 2
					});
				}
			});
			e.preventDefault();
		});
		var dir,
			dirNum;
		$slidebar.on("mousedown", function(e) {

			drag(this, $(this).parent(), e, {
				move: function(evt, objs) {
					var ratio = objs.disX / (operatorW);

					$snapHandle.css({
						width: operatorW - operatorW * ratio - 2,
						height: operatorH - operatorH * ratio - 2
					});

					if (dir) {

						if (objs.disX > dir)
							dirNum = 1;
						else {
							dirNum = -1;
						}
						dir > 0 && objs.moveDisX < operatorW && (zoomImg(dirNum), console.log(dirNum + '==='));
						$("#test").html(objs.disX + '====================' + dirNum);
					}
					dir = objs.disX;
				}
			});
			e.preventDefault();
		});

		var setSnapSize = function(val) {
			globalRatioX = val.width / operatorW;
			globalRatioY = val.height / operatorH;
			$snapHandle.css({
				width: operatorW - 2,
				height: operatorH - 2 // / globalRatioX
			});

			var $slideParent = $slidebar.parent();
			$slidebar.css({
				width: $slideParent.width() / globalRatioX
			});

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
			if (originAttr.onceset) {
				originAttr.top = it;
				originAttr.left = il;
				originAttr.width = iw;
				originAttr.height = ih;
				originAttr.onceset = false;
			}
			if (dir > 0) {
				rw = iw * opts.ratio;
				rh = ih * opts.ratio;
				percent = rw / originAttr.width;
			} else {
				rw = iw / opts.ratio;
				rh = ih / opts.ratio;
				percent = originAttr.width / rw;
			}

			console.log(percent +'---------'+ opts.maxRatio +'---------'+ opts.minRatio);
			if (percent > opts.maxRatio || percent > opts.minRatio) return;

			if (e && e.pageX) {
				var dirL = e.pageX - wrapInnerLeft;
				var dirT = e.pageY - wrapInnerTop;
				var proprtionX = (dirL - $img.position().left) / iw;
				var proprtionY = (dirT - $img.position().top) / ih;
				il = dirL - rw * proprtionX;
				it = dirT - rh * proprtionY;
			} else {
				il = ($wrapInner.width() - rw) / 2;
				it = ($wrapInner.height() - rh) / 2;
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
					if (callback && typeof callback.move) {
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