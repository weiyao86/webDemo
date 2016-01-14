(function(factory) {
	if (typeof define === "function" && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
})(function($) {

	var defaults = {
			ratio: 1.1,
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
			onceset:true
		};

	$.Zoom = function(opts, callback) {
		var opts = $.extend({}, defaults, opts);
		var $wrap = $("#" + opts.wrap),
			$wrapInner = $("#" + opts.wrapInner),
			$btnUp = $("#" + opts.up),
			$btnDown = $("#" + opts.down),
			$btnReset = $("#" + opts.reset),
			wrapInnerLeft = $wrapInner.offset().left,
			wrapInnerTop = $wrapInner.offset().top,
			$img = $wrapInner.children(),
			iw, ih, rw, rh, it, il, dir;

		$img.on("mousewheel", function(e) {
			zoomImg(e.deltaY, e);
			//console.log($img.width());
		});

		$img.on({
			"mousemove.drag": function(e) {
				var $target = $(this),
					$parent = $target.parent(),
					distance = 1,
					dirX = (e.pageX - $parent.offset().left) / $parent.width() >= 0.5 ? -distance : distance,
					dirY = (e.pageY - $parent.offset().top) / $parent.height() >= 0.5 ? -distance : distance;

				var dirX = $target.position().left + dirX;
				var dirY = $target.position().top + dirY;
				$target.css({
					left: dirX,
					top: dirY
				});
			}
		});

		$btnUp.click(function() {
			zoomImg(1);
		});

		$btnDown.click(function() {
			zoomImg(-1);
		});

		$btnReset.click(function(){
			$img.css({
				width: originAttr.width,
				height: originAttr.height,
				left: originAttr.left,
				top: originAttr.top
			});
		});

		function zoomImg(direction, e) {
			dir = direction;
			iw = $img.width();
			ih = $img.height();
			it = parseFloat($img.css("top"));
			il = parseFloat($img.css("left"));
			if(originAttr.onceset){
				originAttr.top=it;
				originAttr.left=il;
				originAttr.width=iw;
				originAttr.height=ih;
				originAttr.onceset=false;
			}
			if (dir > 0) {
				rw = iw * opts.ratio;
				rh = ih * opts.ratio;
			} else {
				rw = iw / opts.ratio;
				rh = ih / opts.ratio;
			}
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

			console.log(it);
			$img.css({
				width: rw,
				height: rh,
				left: il,
				top: it
			});
		}

	};
});