	/**
		 * 	example:
		 *  $.MouseZoom({
	            //拖动容器
	            snapHandle: "snap_handle",
	            //显示容器
	            fixed: "fixed",
	            //源容器
	            wrap: "wrap",
	            //大图id
	            viewImg: "view_img",
	            //显示容器位置
	            posFixedLeft:500
	        });
		 */
	/**
	 * [description]requestAnimationFrame 兼容
	 * @return {[type]} [description]
	 */
	(function() {
		var verdons = ['ms', 'webkit', 'moz', 'o'],
			lastTime = 0;
		for (var i = 0, l = verdons.length; i < l && !window.requestAnimationFrame; i++) {
			window.requestAnimationFrame = window[verdons[i] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[verdons[i] + 'CancelAnimationFrame'] || window[verdons[i] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function(fn) {

				var curTime = new Date().getTime(),
					timeTocall = Math.max(0, 16 - (curTime - lastTime)),
					id = window.setTimeout(function() {
						fn(curTime + timeTocall);
					}, timeTocall);
				lastTime = curTime + timeTocall;
				return id;
			};
		}
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function(id) {
				window.clearTimeout(id);
			};
		}
	})();

	(function(factory) {
		if (typeof define === "function" && define.amd) {
			define(['jquery'], factory);
		} else {
			factory(jQuery);
		}
	})(function($) {

		/**
		 * 由快到慢 ease out method  更多算法参考 src="../Scripts/jquery.easing.1.3.js">
		 *  t : current time,
		    b : intial value,
		    c : changed value,
		    d : duration
		**/
		function easeOutQuart(t, b, c, d) {
			t /= d;
			t--;
			return -c * (t * t * t * t - 1) + b;
		}


		$.MouseZoom = function(opts) {
			return new MouseZoom(opts);
		};

		var MouseZoom = function(opts) {
			this.opts = $.extend(true, {}, $.MouseZoom.defaultsOpts, opts);
			this.init();
		};

		$.extend(MouseZoom.prototype, {

			init: function() {
				var self = this;

				self.buildDom();
				self.bindEvent();
			},

			buildDom: function() {
				var self = this;
				self.$snapHandle = $("#" + self.opts.snapHandle);
				self.$fixed = $("#" + self.opts.fixed);
				self.$wrap = $("#" + self.opts.wrap);
				self.$viewImg = $("#" + self.opts.viewImg);
				//setSnapSize 方法内重新计算
				self.operatorW = self.$wrap.width() || self.opts.operatorW;
				self.operatorH = self.$wrap.height() || self.opts.operatorH;

				self.contentDim = {
					fw: self.$fixed.width() || self.opts.contentDim.fw,
					fh: self.$fixed.height() || self.opts.contentDim.fh
				};
				//setSnapSize 方法内重新计算
				self.zoomRatio = self.opts.zoomRatio;
				self.zoomMin = self.opts.zoomMin;
				self.zoomMax = self.opts.zoomMax;
				self.preZoom = self.opts.preZoom;
				self.objX = self.opts.objX;
				self.objY = self.opts.objY;

				self.ra = self.rh = self.ow = self.oh = self.na = self.timer = self.timer1 = null;

			},

			bindEvent: function() {
				var self = this;

				self.$viewImg.on("load.zoom error.zoom", function(e) {

					self.setSnapSize(this, e.type === 'load');

				}).each(function(idx, el) {
					var src = el.src;

					if (el.complete && el.naturalWidth !== undefined && el.naturalWidth !== 0) {
						return self.setSnapSize(el, true);
					}
					if (el.readyState === undefined || el.complete) {
						el.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
						el.src = src;
					}
				});

				self.$snapHandle.on({

					mouseenter: function() {
						self.$fixed.animate({
							top: self.opts.posFixedTop,
							left: self.opts.posFixedLeft,
							width: self.contentDim.fw,
							height: self.contentDim.fh,
							opacity: 1
						});
					},

					mouseleave: function(e) {
						self.$fixed.animate({
							top: e.pageY,
							left: e.pageX,
							width: 0,
							height: 0,
							opacity: 0
						});
					},

					mousedown: function(e) {
						self.drag(this, self.$wrap, e, {
							move: function(evt, objs) {
								if (!objs.disX && !objs.disY) return;
								self.clearFrames();
								self.ani(objs);
							}
						});
						e.preventDefault();
					},

					mousewheel: function(e) {
						var x = e.pageX,
							y = e.pageY,
							left;

						//滑轮滚动累加/累减值为 1/100
						if (e.deltaY > 0) {
							self.zoomRatio += 1 / 10;
						} else {
							self.zoomRatio -= 1 / 10;
						}

						self.zoomRatio = Math.max(self.zoomRatio, self.zoomMin);
						self.zoomRatio = Math.min(self.zoomMax, self.zoomRatio);

						if (self.preZoom == self.zoomRatio) return;

						var pof = $(this).parent().offset();
						x = x - pof.left;
						y = y - pof.top;

						var w = self.$snapHandle.width(),
							h = self.$snapHandle.height(),
							nw = self.zoomRatio * self.operatorW,
							nh = self.zoomRatio * self.operatorH,
							l = x - (x - self.$snapHandle.position().left) / w * nw,
							t = y - (y - self.$snapHandle.position().top) / h * nh;

						l = Math.min(self.operatorW - nw, l);
						t = Math.min(self.operatorH - nh, t);

						l = Math.max(l, 0);
						t = Math.max(t, 0);


						self.$snapHandle.css({
							width: nw,
							height: nh,
							left: l,
							top: t
						});

						self.clearFrames();
						$("#srl").empty();
						var perc = 100 * self.zoomRatio,
							curperc = self.preZoom,
							step = 0,
							vw = self.contentDim.fw * self.operatorW / nw, //* operatorW/nw,
							vh = self.contentDim.fh * self.operatorH / nh, //* operatorH/nh,
							vl = -vw * (l / self.operatorW),
							vt = -vh * (t / self.operatorH);


						function zoomView() {
							step++;

							if (step < 20) {
								self.timer1 = window.requestAnimationFrame(zoomView);
							}
							var tickZoom = easeOutQuart(step, curperc, perc - curperc, 20);

							var ratio = tickZoom / perc;

							self.$viewImg.css({
								width: vw * ratio,
								height: vh * ratio,
								left: vl * ratio,
								top: vt * ratio
							});

							var str = '<p>' + tickZoom + '</p>'
							$("#srl").append(str).scrollTop(99999);

							self.preZoom = tickZoom;
						}

						zoomView();

						self.objX = l * 100;
						self.objY = t * 100;
					}

				});
			},

			setSnapSize: function(that, success) {
				var self = this;
				if (success) {
					var iratio = that.width / that.height;
					//reset size
					self.operatorW = self.$wrap.width();
					self.operatorH = self.$wrap.height();

					var fw = self.contentDim.fw,
						fh = self.contentDim.fh;

					self.contentDim.fw = iratio * fh > fw ? fw : iratio * fh;
					self.contentDim.fh = fw / iratio;

					self.$viewImg.css({
						width: self.contentDim.fw / self.zoomRatio,
						height: self.contentDim.fh / self.zoomRatio
					});

					self.$fixed.css({
						height: self.$fixed.width() / iratio
					});

					self.$snapHandle.css({
						width: self.contentDim.fw / that.width * self.operatorW, // zoomRatio*operatorW,
						height: self.contentDim.fh / that.height * self.operatorH // zoomRatio*operatorH
					});

				}
			},

			ani: function(objs) {
				var self = this,
					iw = self.contentDim.fw / self.zoomRatio,
					ih = self.contentDim.fh / self.zoomRatio,
					perc = 100 * objs.disX,
					topperc = 100 * objs.disY,
					curperc = self.objX,
					curpercY = self.objY,
					step = 0,
					ox = objs.disX / self.operatorW * iw,
					oy = objs.disY / self.operatorH * ih;

				function zoomView(t) {
					step++;

					if (step < 60) {
						self.timer = window.requestAnimationFrame(zoomView);
					} else if (step == 60) {
						self.clearFrames();
					}

					var tickZoom = easeOutQuart(step, curperc, perc - curperc, 60);
					var tickZoomY = easeOutQuart(step, curpercY, topperc - curpercY, 60);

					var ratio = tickZoom / perc;
					var ratioY = tickZoomY / topperc;

					self.$viewImg.css({
						left: -ox * ratio,
						top: -oy * ratioY
					});

					var str = "<p>" + tickZoom + '=====' + ratio + "</p>";
					$("#srl").append(str).scrollTop(99999);

					self.objX = tickZoom;
					self.objY = tickZoomY;
				}
				zoomView();
			},

			clearFrames: function() {
				var self = this;
				window.cancelAnimationFrame(self.timer);
				window.cancelAnimationFrame(self.timer1);
			},

			drag: function(target, $parent, e, callback) {
				var self = this,
					$target = $(target),
					pos = {
						top: e.pageY - $target.position().top,
						left: e.pageX - $target.position().left
					},
					maxX = $parent && $parent.width() - $target.width(),
					maxY = $parent && $parent.height() - $target.height();
				if (window.attachEvent) {
					$target.one('selectstart', function() {
						return false;
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
			},

			destroy: function() {
				var self = this;
				if ($(self).data("MouseZoom.zoom")) {
					$(self).removeData("MouseZoom.zoom");
				}
			}

		});

		/**
		 * defaults config params
		 * @type {Object}
		 */
		$.MouseZoom.defaultsOpts = {
			snapHandle: "snap_handle",
			fixed: "fixed",
			wrap: "wrap",
			viewImg: "view_img",
			operatorW: 360,
			operatorH: 200,
			contentDim: {
				fw: 500,
				fh: 280
			},
			zoomRatio: 0.4,
			zoomMin: 0.2,
			zoomMax: 1,
			preZoom: 0,
			objX: 0,
			objY: 0,
			posFixedTop: 200,
			posFixedLeft: 200
		};
	});