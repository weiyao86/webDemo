var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
		$.fn.imagesLoaded = function(callback) {
			var $this = this,
				deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
				hasNotify = $.isFunction(deferred.notify),
				$images = $this.find("img").add($this.filter("img")),
				loaded = [],
				proper = [],
				broker = [];
			if ($.isPlainObject(callback)) {
				$.each(callback, function(key, val) {
					if (key === "callback") {
						callback = val;
					} else if (deferred) {
						deferred[key](val);
					}
				});
			}

			function doneLoading() {
				var $proper = $(proper),
					$broker = $(broker);
				if (deferred) {
					if (broker.length) {
						deferred.reject($images, $proper, $broker);
					} else {
						deferred.resolve($images);
					}
				}
				if ($.isFunction(callback)) {
					callback.call($this, $images, $proper, $broker);
				}
			}

			function imgLoaded(img, isbroker) {
				if (img.src === BLANK || $.inArray(img, loaded) !== -1) {
					return;
				}

				loaded.push(img);

				if (isbroker) {
					broker.push(img);
				} else {
					proper.push(img);
				}



				$.data(img, "imagesLoaded", {
					isbroker: isbroker,
					src: img.src
				});
				if (hasNotify) {
					deferred.notifyWith($(img), [isbroker, $images, $(proper), $(broker)]);
				}
				if ($images.length === loaded.length) {
					setTimeout(doneLoading);
					$images.off(".imagesLoaded");
				}

			}

			if (!$images.length) {
				doneLoading();
			} else {
				$images.on("load.imagesLoaded error.imagesLoaded", function(evt) {
					imgLoaded(evt.target, evt.type === "error");
				}).each(function(idx, el) {
					var src = el.src;

					var cached = $.data(el, "imagesLoaded");
					if (cached && cached.src === src) {
						imgLoaded(el, cached.isbroker);
						return;
					}
					if (el.complete && el.naturalWidth !== undefined) {
						imgLoaded(el, el.naturalWidth === 0 || el.naturalHeight === 0);
						return;
					}

					if (el.readyState === undefined || el.complete) {
						el.src = BLANK;
						el.src = src;
					}
				});

			}
			return deferred ? deferred.promise($this) : $this;
		};