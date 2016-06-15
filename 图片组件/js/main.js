(function(factory) {
	if (typeof define === "function" && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
})(function($) {

	var defaults = {
			ratio: 1.05,
			maxRatio: Math.pow(1.05, 100), //最大可放大N倍
			minRatio: Math.pow(1.05, 100), //最大可缩小N倍
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


			drag(this, $(this).parent(), e, {
				move: function(evt, objs) {

					var ratio = objs.disX / (operatorW),
						hw = $wrapInner.width() / $img.width() * operatorW, //operatorW * (1 - ratio),
						hh = $wrapInner.height() / $img.height() * operatorH, //operatorH * (1 - ratio),
						ht = $snapHandle.position().top,
						hl = $snapHandle.position().left;

					// if (hw + hl >= operatorW) {
					// 	hl = operatorW - hw;
					// }
					// if (hh + ht >= operatorH) {
					// 	ht = operatorH - hh;
					// }

					var newLeft = (operatorW - hw) / 2,
						newTop = (operatorH - hh) / 2;


					$snapHandle.css({
						top: newTop,
						left: newLeft,
						width: hw,
						height: hh
					});
					//$("#test").html(hw);

					if (ratio) {
						var iw = originAttr.width + originAttr.width * ratio,
							ih = originAttr.height + originAttr.height * ratio,
							it = ht * -globalRatioY,
							il = hl * -globalRatioX;

						$img.css({
							width: iw,
							height: ih,
							left: il,
							top: it
						});
						globalRatioX = iw / operatorW;
						globalRatioY = ih / operatorH;
						var str = "ow:---" + originAttr.width + "oh:---" + originAttr.height + "iw:--" + iw + "ih:--" + ih + "it:--" + it + "il:--" + il + "hl:--" + hl;
						str = (hw / nw) + '====' + (originAttr.width + originAttr.width * ratio);
						$("#test").html(iw);
					}
				}
			});

		});

		var setSnapSize = function(val) {
			globalRatioX = val.width / operatorW;
			globalRatioY = val.height / operatorH;
			$snapHandle.css({
				//TODO
				width: $wrapInner.width() / globalRatioX, // operatorW,  TODO
				height: $wrapInner.height() / globalRatioY //operatorH //
			});



			var $slideParent = $slidebar.parent();
			$slidebar.css({
				width: $slideParent.width() / globalRatioX
			});

			if (val.width) {
				originAttr.top = parseFloat($img.css("top"));
				originAttr.left = parseFloat($img.css("left"));
				originAttr.width = val.width;
				originAttr.height = val.height;
				originAttr.onceset = true;
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
					if (callback && typeof callback.move == "function") {
						callback.move.call(null, evt, {
							moveDisX: moveDisX + $target.width(),
							moveDisY: moveDisY + $target.height(),
							disX: moveDisX,
							disY: moveDisY
						});
					}

					console.log(cc++)
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