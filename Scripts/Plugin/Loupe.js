/**
 * auth: wei.yao
 * date:2015/9/24
 * desc: 三种方式实现查看高清图
 * 方式一:(isScroll=true)采用父容器滚动条的同比例移动
 * 方式二:(isImgmove=true)采用父容器内图片的定位同比例移动
 * 方式三:(isBackground=true)采用背景图backgroundPosition定位同比例移动
 * example-1:
 *   $.Loupe("panelTest",{
                fixed: "#showImg",
                isBackground:true,
                filter:['default.png']
            });
* example-2:
            $("[data-field='Loupe']").Loupe({
                fixed: "#showImg",
                isBackground:true,          
                filter:['default.png']  //过滤不需要显示的图
            });
 * 
 */
;
(function($) {

	function imagesLoaded($obj, callback) {
		var elems = $obj.filter('img'),
			len = elems.length,
			blank = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
		elems.on('load.imgloaded', function() {
			if (--len <= 0 && this.src !== blank) {
				elems.off('load.imgloaded');
				callback.call(elems, this);
			}
		}).each(function() {
			// cached images don't fire load sometimes, so we reset src.
			if (this.complete || this.complete === undefined) {
				var src = this.src;
				//webkit hack from 
				//data uri bypasses webkit log warning (thx doug jones)
				this.src = blank;
				this.src = src;
			}
		});
	};


	$.Loupe = function(panel, config) {

		var field = $.fn.Loupe.prototype.defaults.loupeField;
		$(panel).find("[data-field='" + field + "']").each(function(index, val) {
			$(val).Loupe(config);
		});
	};
	$.fn.Loupe = function(config) {
		var self = this,
			fun = function() {
				if ($.isFunction(self.each)) {
					return self.each(function(idx, val) {
						var $target = $(val),
							$small = $target.find("[data-target='self']"),
							src = $small.attr('src');

						if ($target.data("Loupe") == undefined) {
							$target.data("Loupe", new $.fn.Loupe());
						}
						$target.data("Loupe").move(val, $small, config);
					});
				}
			};

		self.jquery && imagesLoaded(self.find("[data-target='self']"), fun);
	};
	$.fn.Loupe.prototype.defaults = {
		loupeField: 'loupe'
	};
	$.extend($.fn.Loupe.prototype, {
		move: function(sender, $small, config) {
			var self = this,
				$sender = $(sender);

			self.configs = $.extend({}, $.fn.Loupe.prototype.defaults, {
				nativeW: 0,
				nativeH: 0,
				isScroll: false,
				isImgmove: false,
				isBackground: false,
				isShowInnerImg: false,
				iscursorFollow: false,
				_width: $sender.innerWidth(),
				_height: $sender.innerHeight()
			}, config);

			var $large = $(self.configs.large),
				$fixed = $(self.configs.fixed),
				$fixedImg = $fixed.find("img"),
				blank = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",

				showW = $fixed.width(),
				showH = $fixed.height(),
				largeWidth,
				largeHeight,
				nativeW,
				nativeH,
				maxX,
				maxY,
				minX,
				minY,
				scalex,
				scaley,
				largePos = function(e) {
					var field = $.fn.Loupe.prototype.defaults.loupeField,
						m = $(e.target).closest("[data-field='" + field + "']").offset(),
						mx = e.pageX - m.left,
						my = e.pageY - m.top,
						yx = mx - largeWidth / 2,
						yy = my - largeHeight / 2;

					mx < minX && (yx = 0);
					yx > maxX && (yx = maxX);
					my < minY && (yy = 0);
					yy > maxY && (yy = maxY);

					$large.css({
						top: yy,
						left: yx
					});
					return {
						mx: mx,
						my: my,
						yx: yx,
						yy: yy
					};
				};
			var events = $._data($sender[0], "events");
			if (events && events.mouseover && events.mouseover.length == 1) return;
			$sender.on({
				"mouseenter": function(evt) {
					var scope = this,
						field = $.fn.Loupe.prototype.defaults.loupeField,
						m = $(scope).closest("[data-field='" + field + "']").offset(),
						mx = evt.pageX - m.left,
						my = evt.pageY - m.top,
						src = $small.attr("src").replace(/\!\w*$/, '') || $small.attr("data-img"),
						img = new Image(),
						fun;

					nativeW = nativeH = 0;
					$(scope).css("cursor", "default");
					if (!src) return;

					if (self.configs.filter) {

						for (var i = 0; i < self.configs.filter.length; i++) {
							var reg = new RegExp(self.configs.filter[i], 'ig');
							if (reg.test(src)) {
								return;
							}
						}
					}
					fun = function(that) {
						var tsrc = that.src;
						nativeW = that.width;
						nativeH = that.height;

						scalex = nativeW / self.configs._width;
						scaley = nativeH / self.configs._height;

						largeWidth = showW / scalex;
						largeHeight = showH / scaley;

						maxX = self.configs._width - largeWidth;
						maxY = self.configs._height - largeHeight;
						minX = largeWidth / 2;
						minY = largeHeight / 2;

						$large.css({
							width: largeWidth,
							height: largeHeight
						}).appendTo($sender);

						largePos(evt); //position

						$fixedImg.attr("src", tsrc);

						$large.add($fixed).show();

						self.configs.isShowInnerImg && $large.css("background", "url('" + tsrc + "') no-repeat");

						self.configs.isBackground && $fixed.css("background", "url('" + tsrc + "') no-repeat");
					};
					img.src = src;
					imagesLoaded($(img), fun);

					$(scope).css("cursor", "move");
				},

				"mousemove": function(e) {

					if (nativeW || nativeH) {


						if ($large.is(":visible")) {
							var distance = largePos(e),
								mx = distance.mx,
								my = distance.my,
								yx = distance.yx,
								yy = distance.yy,
								l, t;

							l = yx * scalex;
							t = yy * scaley;

							if (self.configs.isScroll)
								$fixed.scrollLeft(l).scrollTop(t);
							else if (self.configs.isImgmove)
								$fixedImg.css({
									left: -l,
									top: -t
								});
							else if (self.configs.isBackground)
								$fixed.css({
									backgroundPosition: l * -1 + 'px' + ' ' + t * -1 + 'px'
								});

							if (self.configs.isShowInnerImg) {
								var bx = (mx * scalex - largeWidth / 2),
									by = (my * scaley - largeHeight / 2);

								$large.css({
									backgroundPosition: bx * -1 + 'px' + ' ' + by * -1 + 'px'
								});
							}
							if (self.configs.iscursorFollow) {
								$fixed.css({
									top: e.pageY + 15,
									left: e.pageX + 35
								});
							}
						}
					}
					e.preventDefault();
					e.stopPropagation();
				},
				"mouseleave": function(e) {
					$large.add($fixed).hide();
					e.preventDefault();
				}
			});
		}
	});

})(jQuery)