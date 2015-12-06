// ======================= imagesLoaded Plugin ===============================
// https://github.com/desandro/imagesloaded

// $('#my-container').imagesLoaded(myFunction)
// execute a callback when all images have loaded.
// needed because .load() doesn't work on cached images

// callback function gets image collection as argument
//  this is the container

// original: mit license. paul irish. 2010.
// contributors: Oren Solomianik, David DeSandro, Yiannis Chatzikonstantinou

// blank image data-uri bypasses webkit log warning (thx doug jones)
var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
$.fn.imagesLoaded = function(callback) {
	var $this = this,
		deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
		hasNotify = $.isFunction(deferred.notify),
		$images = $this.find('img').add($this.filter('img')),
		loaded = [],
		proper = [],
		broken = [];

	// Register deferred callbacks
	if ($.isPlainObject(callback)) {
		$.each(callback, function(key, value) {
			if (key === 'callback') {
				callback = value;
			} else if (deferred) {
				deferred[key](value);
			}
		});
	}

	function doneLoading() {
		var $proper = $(proper),
			$broken = $(broken);

		if (deferred) {
			if (broken.length) {
				deferred.reject($images, $proper, $broken);
			} else {
				deferred.resolve($images);
			}
		}

		if ($.isFunction(callback)) {
			callback.call($this, $images, $proper, $broken);
		}
	}

	function imgLoaded(img, isBroken) {
		// don't proceed if BLANK image, or image is already loaded
		if (img.src === BLANK || $.inArray(img, loaded) !== -1) {
			return;
		}

		// store element in loaded images array
		loaded.push(img);

		// keep track of broken and properly loaded images
		if (isBroken) {
			broken.push(img);
		} else {
			proper.push(img);
		}

		// cache image and its state for future calls
		$.data(img, 'imagesLoaded', {
			isBroken: isBroken,
			src: img.src
		});

		// trigger deferred progress method if present
		if (hasNotify) {
			deferred.notifyWith($(img), [isBroken, $images, $(proper), $(broken)]);
		}
		// call doneLoading and clean listeners if all images are loaded
		if ($images.length === loaded.length) {
			setTimeout(doneLoading);
			$images.unbind('.imagesLoaded');
		}
	}

	// if no images, trigger immediately
	if (!$images.length) {
		doneLoading();
	} else {
		$images.on('load.imagesLoaded error.imagesLoaded', function(event) {
			// trigger imgLoaded

			imgLoaded(event.target, event.type === 'error');
		}).each(function(i, el) {
			var src = el.src;

			// find out if this image has been already checked for status
			// if it was, and src has not changed, call imgLoaded on it
			var cached = $.data(el, 'imagesLoaded');
			if (cached && cached.src === src) {
				imgLoaded(el, cached.isBroken);
				return;
			}

			// if complete is true and browser supports natural sizes, try
			// to check for image status manually
			if (el.complete && el.naturalWidth !== undefined) {
				imgLoaded(el, el.naturalWidth === 0 || el.naturalHeight === 0);
				return;
			}

			// cached images don't fire load sometimes, so we reset src, but only when
			// dealing with IE, or image is complete (loaded) and failed manual check
			// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
			if (el.readyState === undefined || el.complete) {
				el.src = BLANK;
				el.src = src;
			}
		});
	}

	return deferred ? deferred.promise($this) : $this;
};


$.fn.adaptive = function() {
	return this.find("img").add(this.filter("img")).each(function(idx, val) {
		var self = $(val),
			imgW = (self.width() || self.parent().width()) - 10,
			imgH = (self.height() || self.parent().height()) - 10,
			tempImg = new Image();
		$(tempImg).load(function() {
			var nativeW = this.width,
				nativeH = this.height,
				retW = imgW,
				retH = imgH,
				ratioW = imgW / nativeW,
				ratioH = imgH / nativeH,
				ratio = 1;
			imgW == 0 && imgH == 0 && (ratio = 1);
			imgW == 0 && ratioH < 1 && (ratio = ratioH);
			imgH == 0 && ratioW < 1 && (ratio = ratioW);
			(ratioW < 1 || ratioH < 1) && (ratio = ratioW > ratioH ? ratioH : ratioW);
			if (ratio < 1) {
				retW = nativeW * ratio;
				retH = nativeH * ratio;
			}
			self.width(retW).height(retH);

			var $parent = self.parent();
			if ($parent.size()) {
				console.info($parent.css("position"));
				if ($parent.css("position") == "static") {
					self.css({
						"marginLeft": ($parent.width() - retW) / 2,
						"marginTop": ($parent.height() - retH) / 2
					});
				} else {
					// self.css({
					// 	position: "relative",
					// 	left: ($parent.width() - retW) / 2,
					// 	top: ($parent.height() - retH) / 2,
					// 	margin:'0px'
					// });
				}
			}

		}).error().attr("src", val.src);
	});
};

ImgLoaded = null;
(function() {
	var defaults = {},
		doc = window.document;

	ImgLoaded = function(opts) {
		this.opts = $.extend({}, defaults, opts);
		this.init();
	};

	ImgLoaded.prototype = {

		init: function() {

			var self = this;
			self.buildDom();
			self.initProgressBar();
			self.initBlockUI();
			self.progress();
			self.bindEvent();
		},

		buildDom: function() {
			var self = this;
			self.BLOCKUI = null;
			self.BARPANEL = null;
			self.counter = self.imgCount = 0;
			self.lastTime = null;
		},

		initBlockUI: function() {
			var self = this;
			self.BLOCKUI = doc.createElement("div");
			var style = self.BLOCKUI.style;
			style.position = "absolute";
			style.top = 0;
			style.left = 0;
			style.right=0;
			style.bottom=0;
			style.width = self.getGlobalSize().bodyW + "px";
			style.height = self.getGlobalSize().bodyH + "px";
			style.zIndex = 9999;
			style.display = "none";
			style.opacity = 1;
			style.filter = "alpha(opacity=100)";
			style.backgroundColor = "#000";
			doc.body.appendChild(self.BLOCKUI);
		},

		bindEvent: function() {
			var self = this;
			$(window).resize(self.resize.bind(self));
		},

		blockUI: function() {
			var self = this;
			self.BLOCKUI.style.display = "block";
		},

		unblockUI: function() {
			var self = this,
				clearT = null,
				count = 0;

			clearT = setInterval(function() {
				if (count == 10) {
					clearInterval(clearT);
					self.BLOCKUI.style.display = "none";
					return;
				}
				self.BLOCKUI.style.opacity -= 0.1;
				count++;
			}, 80);

		},

		unprogressBar: function() {
			var self = this;
			self.BARPANEL.style.display = "none";
		},

		getGlobalSize: function() {
			var self = this,
				bodyW = doc.body.clientWidth || doc.documentElement.clientWidth || window.innerWidth,
				bodyH = doc.body.clientHeight || doc.documentElement.clientHeight || window.innerHeight;
			return {
				bodyW: bodyW,
				bodyH: bodyH
			};
		},

		initProgressBar: function() {
			var self = this;
			self.BARPANEL = doc.createElement("div");
			var style = self.BARPANEL.style;
			style.width = "100%";
			style.height = "20px";
			style.position = "fixed";
			style.zIndex = 10000;
			style.top = "70%";
			style.left = "0";
			//style.backgroundColor = "#898989";
			style.borderRadius = "4px";
			doc.body.appendChild(self.BARPANEL);
			self.BARPANEL.innerHTML = "<div id='rect' style='background:#f00 url(../style/res/images/arrow.jpg) repeat scroll center center; height: 30%; width: 0%;overflow:hidden;color:white;border-radius:4px;text-align:center;box-shadow:0 0 25px;'></div>";
		},

		progress: function() {
			var self = this,
				img,
				src,
				//imgSrcList = ["../style/res/images/slide-img/001.jpg", "../style/res/images/slide-img/003.jpg", "../style/res/images/slide-img/004.jpg", "../style/res/images/slide-img/002.jpg", "../style/res/images/slide-img/005.jpg"];
				$rotateImg = self.opts.rotateImg,
				$imgSrcList = self.opts.imgList;
			self.blockUI();
			// for (var i = 0, item; item = imgSrcList[i]; i++) {
			// 	src = item.getAttribute("data-src") || item.src;
			// 	img = new Image();
			// 	self.finishImg(img);
			// 	img.src = src;
			// }

			var bar = self.BARPANEL.childNodes[0],
				clear = null,
				broken = [],
				speed;

			$imgSrcList.imagesLoaded().done(function($that) {
				console.log('done');
			}).fail(function($that, $proper, $broken) {
				var brokenList = [];
				$.each($broken, function(idx, val) {
					brokenList[idx] = "\n\t图片：" + $(val).attr("src") + "加载失败!";
				});
				brokenList.length && console.log(brokenList.join(''));
			}).progress(function(isBroken, $images, $proper, $broken) {
				speed = ($proper.length + $broken.length) / $images.length * 100;
			}).always(function($that, $poper, $broker) {
				speed = 100;
				$rotateImg.adaptive();
				$("#pxs_thumbnails").adaptive();
			});

			clear = setInterval(function() {

				if (speed == undefined) return;
				if (self.counter <= speed) {
					bar.style.width = (++self.counter) + "%";
				} else if (speed == 100) {
					self.unblockUI();
					self.unprogressBar();
					setTimeout(function() {
						typeof self.opts.after == "function" && self.opts.after.call(self);
					});
					clearInterval(clear);
				} else clearInterval(clear);
			}, 30);
		},

		finishImg: function(img) {
			var self = this,

				fn = function() {
					var count = self.opts.imgList.length,
						percentntage = self.imgCount / count,
						bar = self.BARPANEL.childNodes[0],
						w = percentntage * 100;
					var clear = setInterval(function() {
						bar.style.width = (++self.counter) + "%";
						(self.counter >= w || self.counter == 100) && clearInterval(clear);
						if (self.counter == 100) {
							self.unblockUI();
							self.unprogressBar();
						}
					}, 30);

					//阻止延迟卡在进度条处，时间到后不管有没有完成都执行
					clearTimeout(self.lastTime);
					self.lastTime = setTimeout(function() {
						bar.style.width = "100%";
						clearInterval(clear);
						self.unblockUI();
					}, 10 * 1000);

				};

			img.onload = function() {
				self.imgCount++;
				fn();
			};

			if (img.complete || typeof img.complete == undefined) {
				self.imgCount++;
				return fn();
			}
			if (img.complete || img.readyState) {
				self.imgCount++;
				return fn();
			}
		},

		resize: function() {
			var self = this;
			self.BLOCKUI.style.width = self.getGlobalSize().bodyW + "px";
			self.BLOCKUI.style.height = self.getGlobalSize().bodyH + "px";
		}
	};


	if (!Function.prototype.bind) {
		Function.prototype.bind = function(obj) {
			var self = this,
				args = arguments;
			return function() {
				self.apply(obj, [].slice.call(args, 1));
			};
		};
	}

})();