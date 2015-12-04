;
var Rotation = null;
(function() {
	var defaults = {
		singleShow: false, //是否渐隐渐现
		isFullScreen: false, //是否满屏视差滚动
		isPause: false, //是否暂停标记	
		rotScope: '', //最外层窗口
		ltArrow: 'brand_link_lt', //左箭头
		rtArrow: 'brand_link_rt', //右箭头
		scopePanel: 'rotation_brand_panel', //包裹轮播区域的容器
		rotContent: 'rotation_brand_ad', //轮播区域
		spheric: 'rotation_brand_spheric', //圆点按钮
		distance: 3 * 1000, //循环定时间隔
		roundCls: "focus-selected", //圆点选中样式
		parallaxId: "parallaxId", //视差底图容器
		pxsThumbnails: "pxsThumbnails" //小图容器
	};

	Rotation = function(opts) {
		this.opts = $.extend([], defaults, opts);
		this.init();
	};

	Rotation.prototype = {

		init: function() {
			var self = this;

			self.buildDom();
			self.bindEvent();
			self.initSizeAndRound();
			self.timing();
		},

		initSizeAndRound: function() {
			var self = this,
				roundHtml = '<li><a class="icon round-icon" href="javascript:;"></a></li>',
				retHtml = [],
				$li = self.$rotContent.children("li"),
				$curLi = $li.first(),
				winW = $(window).width(),
				distance = (self.opts.isFullScreen && $li.width(winW) && winW) || $curLi.outerWidth(true),
				size = $li.size(),
				contentWidth = distance * (size);
			self.$rotContent.width(contentWidth);
			self.$curLi = self.$defaultLi = $curLi;

			for (var i = 0; i < size; i++) {
				retHtml[i] = roundHtml;
			}
			self.$spheric.html(retHtml.join(''));
			self.$spheric.children("li:first").find("a:first").addClass(self.roundCls);

			if (self.opts.isFullScreen) {
				var img_w = $li.children(":first").width(),
					thumb_l = img_w / (size + 1);

				self.position_nav = (winW - img_w) / 2;

				self.$ltArrow.css("left", self.position_nav);

				self.$rtArrow.css("right", self.position_nav);

				self.$parallaxCld.width(contentWidth);

				self.$pxsThumbnails.width(img_w);

				self.$pxsThumbnails.css("marginLeft", -img_w / 2);

				self.$pxsThumbnails.children().each(function(idx, val) {
					var angle = Math.floor(Math.random() * 41) - 20;
					$(val).css({
						left: thumb_l * (idx + 1) - $(val).width() / 2,
						'-webkit-transform': 'rotate(' + angle + 'deg)',
						'-moz-transform': 'rotate(' + angle + 'deg)',
						'transform': 'rotate(' + angle + 'deg)'
					});
				});
			}

			//移动参数变量
			self.liWidth = distance;
			self.panelWidth = contentWidth;
			self.scopeWidth = self.$scopePanel.width();
		},

		winResize:function(){
			var self=this;
			self.clearTiming();
			self.initSizeAndRound();
			self.parallaSlider(self.$curLi.next());
			self.timing();
		},

		buildDom: function() {
			var self = this;
			self.$rotScope = $("#" + self.opts.rotScope);
			self.$ltArrow = $("#" + self.opts.ltArrow);
			self.$rtArrow = $("#" + self.opts.rtArrow);
			self.$scopePanel = $("#" + self.opts.scopePanel);
			self.$rotContent = $("#" + self.opts.rotContent);
			self.$spheric = $("#" + self.opts.spheric);
			self.$parallaxPanel = $("#" + self.opts.parallaxId);
			self.$parallaxCld = self.$parallaxPanel.children();
			self.$pxsThumbnails = $("#" + self.opts.pxsThumbnails);
			//current el
			self.$curLi = null;
			self.$defaultLi = null;
			self.curIdx = 0;
			self.roundCls = self.opts.roundCls;
			//定时间隔
			self.distance = self.opts.distance;
			self.clearTime = null;

			//全屏浏览时左右箭头距离
			self.position_nav = 0;
			//多li时移动单个li距离
			self.liWidth = 70;
			//移动区域总宽度
			self.panelWidth = 1546;
			//移动区域外部容器宽度
			self.scopeWidth = 546;
			//动画时间
			self.speed = 1000;
			//记录移动过的距离(解决动画带来的距离延迟,获取不准确)
			self.recordDistance = 0; 
		},

		bindEvent: function() {
			var self = this,
				roundIdx = 0,
				$curEl = null;

			self.$ltArrow.on("click", function() {

				self.clearTiming();
				self.moveToLeft();
				self.timing();
			});

			self.$rtArrow.on("click", function() {

				self.clearTiming();
				self.moveToRight();
				self.timing();

			});

			self.$rotContent.on("mouseenter mouseleave", function(e) {
				if (e.type === "mouseenter") {
					if (self.opts.singleShow && self.opts.isPause) {
						self.clearTiming();
					}
				} else if (e.type === "mouseleave") {
					if (self.opts.singleShow && self.opts.isPause) {
						self.timing();
					}
				}
			});

			self.$spheric.on("mouseenter mouseleave", "li > a", function(e) {
				roundIdx = $(this).closest("li").index();
				if (e.type === "mouseenter") {
					self.clearTiming();
					$curEl = self.$rotContent.children("li:eq(" + roundIdx + ")");
					self.fade($curEl);
				} else if (e.type === "mouseleave") self.timing();
			});

			self.$rotScope.on("mouseenter mouseleave", function(e) {
				if (e.type === "mouseenter") {

					self.$ltArrow.animate({
						"left": self.position_nav + 12,
						"opacity": "show"
					});
					self.$rtArrow.animate({
						"right": self.position_nav + 12,
						"opacity": "show"
					});
				} else if (e.type === "mouseleave") {

					self.$ltArrow.animate({
						"left": self.position_nav,
						"opacity": "hide"
					});
					self.$rtArrow.animate({
						"right": self.position_nav,
						"opacity": "hide"
					});

				}
			});

			self.$pxsThumbnails.on("mouseenter mouseleave click", "li", function(e) {
				var roundIdx = $(this).index();
				if (e.type == "mouseenter") $(this).stop().animate({
					"top": -10
				}, 100); //.children().stop().animate({"opacity":1},100);
				else if (e.type == "mouseleave") $(this).stop().animate({
					"top": 0
				}, 100); //.children().stop().animate({"opacity":.7},100);
				else if (e.type == "click") {
					self.clearTiming();
					var $curEl = self.$rotContent.children("li:eq(" + roundIdx + ")");
					self.parallaSlider($curEl);
					self.timing();
				}
			});

			$(window).on("resize", function() {

				self.winResize();
				
			});
		},

		moveToLeft: function() {
			var self = this;
			self.$defaultLi = self.$rotContent.children("li:last");
			if (self.opts.isFullScreen && self.opts.singleShow) {
				self.parallaSlider(self.$curLi.prev());
			}
			else if (self.opts.singleShow) self.fade(self.$curLi.prev());
			else self.move("lt");
		},

		moveToRight: function() {
			var self = this;
			self.$defaultLi = self.$rotContent.children("li:first");
			if (self.opts.isFullScreen && self.opts.singleShow) {
				self.parallaSlider(self.$curLi.next());
			}
			else if (self.opts.singleShow) self.fade(self.$curLi.next());
			else self.move("rt");
		},

		fade: function($curEl) {
			var self = this,
				$li;
			//广告位渐隐渐现
			self.$curLi
				.add(self.$defaultLi)
				.add($curEl)
				.stop(true, false);
			if ($curEl.size()) {
				$li = self.$spheric.children("li:eq(" + $curEl.index() + ")");

				self.$curLi.animate({
					"opacity": "0"
				}).css("z-index", "0");
				$curEl.animate({
					"opacity": "1"
				}).css("z-index", "1");


				self.$curLi = $curEl;
			} else {

				$li = self.$spheric.children("li:eq(" + self.$defaultLi.index() + ")");

				self.$curLi.animate({
					"opacity": "0"
				}).css("z-index", "0");

				self.$defaultLi.animate({
					"opacity": "1"
				}).css("z-index", "1");
				self.$curLi = self.$defaultLi;
			}
			$li.find("a:first")
				.addClass(self.roundCls)
				.end()
				.siblings()
				.find("a")
				.removeClass(self.roundCls);
		},

		move: function(derection) {
			var self = this,
				scrollWidth = self.liWidth * Math.floor((self.panelWidth - self.scopeWidth) / self.liWidth),
				scrollLeft = self.recordDistance || self.$scopePanel.scrollLeft();

			self.$rotContent.stop(true, false);

			derection === "lt" && (scrollLeft >= self.liWidth) && self.$scopePanel.animate({
				"scrollLeft": "-=" + self.liWidth
			}) && (self.recordDistance = scrollLeft - self.liWidth);

			derection === "rt" && (scrollLeft < scrollWidth) && self.$scopePanel.animate({
				"scrollLeft": "+=" + self.liWidth
			}) && (self.recordDistance = scrollLeft + self.liWidth);
		},

		parallaSlider: function($curEl) {
			var self = this,
				countNum = [], //[8, 4, 2],
				curNum = 32,
				slide_to,
				curIdx;

			for (var i = 0; i < 4; i++) {
				curNum /= 2;
				countNum[countNum.length] = curNum;
			};

			self.$rotContent.stop();

			self.$curLi = $curEl.size() ? $curEl : self.$defaultLi;
			curIdx = self.$curLi.index();

			slide_to = -self.liWidth * curIdx;
			self.$rotContent.animate({
				"left": slide_to
			}, self.speed);

			//产生视差的三张底图
			self.$parallaxCld.each(function(idx, val) {
				$(val).stop().animate({
					"left": slide_to / countNum[idx]
				}, self.speed);
			});

			self.$pxsThumbnails
				.children(":eq(" + curIdx + ")")
				//.stop()
				.animate({"top":-10},100)
				.children()
				.css({"opacity": 1})
				.end()
				.siblings()
				//.stop()
				.animate({"top":0},100)
				.children()
				.css("opacity", .7);
		},

		timing: function() {
			var self = this;
			if (self.opts.singleShow) {
				self.clearTime = setInterval(function() {
					self.moveToRight();
				}, self.distance);
			}
		},

		clearTiming: function() {
			var self = this;
			clearInterval(self.clearTime);

		}
	};
})();