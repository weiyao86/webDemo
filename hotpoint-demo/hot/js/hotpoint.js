/*!
 * jQuery hotpoint plugin
 * Version 1.2-2014.12.01
 * @requires jQuery v1.4 or later 、mousewheel、jsDraw2D、scrollIntoView、css、text、normalize
 */

/****************************************
 *  For Example
 *
 *  var hotpoint = new Hotpoint({
 *      nopic : "",
 *      dock: "BR", 
 *      assistiveTool: "3", 
 *      bodyId: "part-list", 
 *      renderToId: "legend-render",
 *      selectedRowBgClass: "checkedTr"
 *  });
 
 *  hotpoint.bindLegend({
 *      src: "/res/gif/E1001001.gif",
 *      legendExist: true,
 *      swfLegendWidth: 2481,
 *      swfLegendWidth: 3508,
 *      data: data 
 *  }); 
 */
;
(function($) {

	/* Extend hotpoint method entrance */
	function setup(templates) {

		// Define default options
		var defaultOpts = (function() {
			return {
				maxZoom: 3,
				minZoom: 0.5,
				radius: 15,
				dock: "TC",
				imgError: false,
				assistiveTool: "1",
				tbodyId: "tbody",
				renderToId: "legend-render",
				nopic: "",
				selectedRowBgClass: "row-active",
				legendExist: false,
				isShowAssistiveTool: true,
				loading: true,
				swfLegendWidth: 0,
				swfLegendHeight: 0,
				legendLoadingImg: "",
				grabSrc: "",
				grabbingSrc: "",
				circleLineColor: {
					seekColor: "#FFDD00",
					checkedColor: "#FF1020"
				},
				callbacks: {
					onPrint: null,
					onToolClick: null,
					onBindPartList: null,
					onLegendDbClick: null,
					onLegendBeforeLoad: null,
					onLegendAfterLoad: null,
					onSelectionPartError: null
				}
			};
		})();

		// Load css file
		(function() {
			var link = document.createElement("link"),
				url = require.s.contexts._.config.baseUrl + basePath + 'css/hotpoint.css';

			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = url;
			document.getElementsByTagName("head")[0].appendChild(link);
		})();

		// Define Hotpoint constructor
		var Hotpoint = function(options) {
			this.opts = $.extend(true, {}, defaultOpts, options || {});

			// global const
			this.LEGEND_ID = "legend";
			this.LEGEND_IMG_ID = "legend-img";
			this.LEGEND_WRAP_ID = "legend-wrap";

			// global variable
			this.percent = 1;
			this.dictList = {};
			this.isDone = true;
			this.curCoords = [];
			this.curCallouts = [];
			this.dragLegendPosition = {};
			this.radius = this.opts.radius;
			this.data = this.opts.data || [];
			this.dragAssisactiveToolPosition = {};

			this.legendLoadingImg = this.opts.legendLoadingImg || '';
			this.grabSrc = this.opts.grabSrc || '';
			this.grabbingSrc = this.opts.grabbingSrc || '';
			// initialization
			this.init();
		}

		// Settings Hotpoint prototype
		Hotpoint.prototype = (function() {
			return {
				// Initialization
				init: function() {
					var self = this;

					// build dom element
					self.buildDomEl();

					// init graphics
					self.initGraphics();

					// register window resize callback
					self.bindResize();

					// bind event
					self.bindEvent();

					// build assistive tool
					self.buildAssistiveTool();
				},

				// Build jquery dom object
				buildDomEl: function() {
					var self = this,
						html = self.getLegendHTML();

					// build jquery dom object
					self.$renderTo = $("#" + self.opts.renderToId);
					self.$renderTo.append(html);
					self.$tbody = $("#" + self.opts.tbodyId);
					self.$legend = $("#" + self.LEGEND_ID);
					self.$legendWrap = $("#" + self.LEGEND_WRAP_ID);
				},

				// Get legend inner html
				getLegendHTML: function() {
					var self = this,
						html = [];

					html.push('<div id="' + self.LEGEND_WRAP_ID + '" class="legend-wrap">');
					html.push('<div id="' + self.LEGEND_ID + '" class="legend">');
					html.push('</div>');
					html.push('</div>');

					return html.join(' ');
				},

				// Initialization jsGraphics class
				initGraphics: function() {
					var self = this;

					self.graphics = new jsGraphics(self.$legend.get(0));
				},

				// Bind a legend
				bindLegend: function(options, fnImgLoaded) {
					var self = this;

					self.destroyLegend();
					self.data = options.data;
					self.swfLegendWidth = options.swfLegendWidth;
					self.swfLegendHeight = options.swfLegendHeight;
					self.setLegendSrc(options.src, fnImgLoaded);
				},

				// Destory bind legend
				destroyLegend: function() {
					var self = this;

					self.data = null;
					self.dictList = null;
					self.buildData = [];
					self.curCoords = [];
					self.opts.legendExist = false;
					self.resetLegend();
					self.clearHotpoint();
					self.$legend.html('');
				},

				// Setting image src
				setLegendSrc: function(src, fnImgLoaded) {
					var self = this,
						img = new Image(),
						onLegendBeforeLoad = self.opts.callbacks.onLegendBeforeLoad,
						onLegendAfterLoad = self.opts.callbacks.onLegendAfterLoad;

					if (typeof onLegendBeforeLoad === "function") {
						onLegendBeforeLoad.apply(self, []);
					}
					if (self.opts.loading) {
						self.loadingShow();
					}
					$(img).on("load", function() {
						if (typeof onLegendAfterLoad === "function") {
							onLegendAfterLoad.apply(self, [img]);
						}
						self.finishImgLoad(img, fnImgLoaded);
					}).on("error", function() {
						if (typeof onLegendAfterLoad === "function") {
							onLegendAfterLoad.apply(self, [img]);
						}
						self.loadErrorImg();
					}).attr("src", src);
				},

				// Finish legend load
				finishImgLoad: function(img, fnImgLoaded) {
					var self = this;

					self.opts.legendExist = true;
					self.legendRawSize = {
						width: img.width,
						height: img.height
					};
					self.settingSize();
					self.$legend.html(img);
					self.buildCoord(self.data);

					if (!self.existAssistiveTool) {

					}
					if (typeof fnImgLoaded === "function") {
						fnImgLoaded.apply(self, []);
					}
					if (self.opts.loading) {
						self.loadingHide();
					}
					self.disabledAccistiveTool();
				},

				// Load legend error 
				loadErrorImg: function() {
					var self = this,
						nopic = self.opts.nopic;

					self.opts.legendExist = false;
					self.legendRawSize = {
						width: 0,
						height: 0
					};

					self.$legend.empty().css("background", "url(" + nopic + ") no-repeat center center");
					self.disabledAccistiveTool();

					if (self.opts.loading) {
						self.loadingHide();
					}
				},

				// Setting object width and height
				settingSize: function() {
					var self = this,
						width = self.$legendWrap.parent().width(),
						height = self.$legendWrap.parent().height(),
						legendNewSize = self.opts.legendExist ? self.scalingDownCalc(self.legendRawSize.width, self.legendRawSize.height, width, height) : {
							top: 0,
							left: 0,
							width: width,
							height: height
						};

					// setting legend new size and new position
					self.$legend.css({
						"top": legendNewSize.top + "px",
						"left": legendNewSize.left + "px",
						"width": legendNewSize.width,
						"height": legendNewSize.height
					});

					// setting legend wrap new size and new position
					self.$legendWrap.css({
						"width": width,
						"height": height
					});

					// save current legend size and position
					self.legendWidth = self.$legend.width();
					self.legendHeight = self.$legend.height();
					self.legendOffsetTop = self.$legend.offset().top;
					self.legendOffsetLeft = self.$legend.offset().left;

					// Legend visible area position
					self.x1 = self.$legendWrap.offset().left;
					self.y1 = self.$legendWrap.offset().top;
					self.x2 = self.$legendWrap.offset().left + self.$legendWrap.width();
					self.y2 = self.$legendWrap.offset().top + self.$legendWrap.height();
				},

				// Build coord data
				buildCoord: function(data) {
					var self = this,
						radius = self.radius,
						callout, i = 0,
						j = 0,
						k = 0,
						el,
						x = 0,
						y = 0,
						minX = 0,
						maxX = 0,
						minY = 0,
						maxY = 0,
						key,
						ratioW = self.swfLegendWidth / self.legendWidth,
						ratioH = self.swfLegendHeight / self.legendHeight;

					self.dictList = {};
					self.buildData = [];
					for (; el = data[i]; i++) {
						if (!el.x || !el.y) continue;
						callout = el.callout;
						x = parseInt(el.x / ratioW);
						y = parseInt(el.y / ratioH);
						self.buildData.push({
							'x': x,
							'y': y,
							'callout': callout
						});
						minX = x - radius, maxX = x + radius;
						minY = y - radius, maxY = y + radius;
						for (j = minX; j < maxX; j++) {
							for (k = minY; k < maxY; k++) {
								key = j + '-' + k;
								self.dictList[key] = {
									"x": x,
									"y": y
								};
							}
						}
					}
				},

				// Window resize to reset legend object size and build coord
				bindResize: function() {
					var self = this;

					$(window).resize(function() {
						if (self.legendRawSize) {
							self.resizeToAdjust();
						}
					});
				},

				// Resize to adjust hotpoint
				resizeToAdjust: function() {
					var self = this;

					self.resetLegend();
					self.settingSize();
					self.buildCoord(self.data || []);
					self.redraw();
					self.assistiveToolDock();
					self.linkHotpoint(self.curCallouts);
				},

				// Bind dom object event
				bindEvent: function() {
					var self = this;

					// Bind legend dom object
					// 'click'、'mousemove'、'mousedown'、'dblclick'、'mousewheel'
					// event
					self.$legend.on({
						click: function(e) {
							if (self.opts.legendExist) self.clickLegend(e, this);
							e.preventDefault();
						},
						dblclick: function(e) {
							if (typeof self.opts.callbacks.onLegendDbClick === 'function') {
								self.opts.callbacks.onLegendDbClick.apply(self, []);
							} else if (self.opts.legendExist) {
								self.zoomLegend(1, e);
							}
							e.preventDefault();
						},
						mousemove: function(e) {
							if (self.opts.legendExist) self.seekHotpoint(e, this);
							e.preventDefault();
						},
						mousedown: function(e) {
							if (self.percent > 1 && self.opts.legendExist)
								self.startDragLegend(e, this);
							e.preventDefault();
						},
						mousewheel: function(e, delta) {
							if (self.opts.legendExist) self.zoomLegend(delta, e);
							e.preventDefault();
						}
					});

					self.$legend.on("mouseenter", "img", function() {
						$(this).css("cursor", 'url("' + self.grabSrc + '"),pointer');
					})

					// When 'onBindPartList' is null the Bind row click event
					if (self.opts.callbacks.onBindPartList === null) {
						self.$tbody.on('click', 'tr[data-callout]', function() {
							if (self.opts.legendExist) self.rowsClick(this);
						});
					}
				},

				// Build legend on assistive tool
				buildAssistiveTool: function() {
					var self = this,
						template = self.getAssistiveToolTemplate();

					self.$assistiveTool = $(template);
					self.$legendWrap.append(self.$assistiveTool);
					self.bindAssistiveToolEvent();
					self.assistiveToolDock();
					self.$assistiveTool.show();
					self.existAssistiveTool = true;
				},

				// diabled assistive tool
				disabledAccistiveTool: function() {
					var self = this,
						$zoomOut = self.$assistiveTool.find("[data-action=zoomout]"),
						$zoomIn = self.$assistiveTool.find("[data-action=zoomin]"),
						$reset = self.$assistiveTool.find("[data-action=reset]");

					if (self.opts.legendExist) {
						$zoomOut.removeClass("assistive-tool-zoomout-disabled").addClass("assistive-tool-zoomout");
						$zoomIn.removeClass("assistive-tool-zoomin-disabled").addClass("assistive-tool-zoomin");
						$reset.removeClass("assistive-tool-reset-disabled").addClass("assistive-tool-reset");
					} else {
						$zoomOut.removeClass("assistive-tool-zoomout").addClass("assistive-tool-zoomout-disabled");
						$zoomIn.removeClass("assistive-tool-zoomin").addClass("assistive-tool-zoomin-disabled");
						$reset.removeClass("assistive-tool-reset").addClass("assistive-tool-reset-disabled");
					}
				},

				// Bind assistive tool event
				bindAssistiveToolEvent: function() {
					var self = this,
						action;

					self.$assistiveTool.on("mousedown", function(e) {
						self.startDragAssistiveTool(e, this);
					});

					self.$assistiveTool.on("click", "a:not([class*='disabled'])", function(e) {
						action = $(this).attr("data-action");

						switch (action) {
							case "zoomin":
								self.zoomIn();
								break;
							case "zoomout":
								self.zoomOut();
								break;
							case "up":
								self.moveUp();
								break;
							case "right":
								self.moveRight();
								break;
							case "down":
								self.moveDown();
								break;
							case "left":
								self.moveLeft();
								break;
							case "reset":
								self.resetLegend();
								self.redraw();
								if (self.opts.callbacks.onReset)
									self.opts.callbacks.onReset.apply(null, []);
								break;
							case "print":
								if (self.opts.callbacks.onPrint)
									self.opts.callbacks.onPrint.apply(null, []);
								break;
							default:
								break;
						}
						if (self.opts.callbacks.onToolClick) {
							self.opts.callbacks.onToolClick.apply(null, [action]);
						}
					});
				},

				// Assistive tool it dock position
				assistiveToolDock: function() {
					if (!this.opts.legendExist) return;

					var self = this,
						dock = self.opts.dock,
						maxTop = self.$legendWrap.height() - self.$assistiveTool.height() - 5,
						maxLeft = self.$legendWrap.width() - self.$assistiveTool.width() - 5,
						content = (maxLeft / 2);

					switch (dock) {
						case "TL":
							self.$assistiveTool.css({
								"left": "5px",
								"top": "5px"
							});
							break;
						case "TC":
							self.$assistiveTool.css({
								"left": content + "px",
								"top": "5px"
							});
							break;
						case "TR":
							self.$assistiveTool.css({
								"left": maxLeft + "px",
								"top": "5px"
							});
							break;
						case "BL":
							self.$assistiveTool.css({
								"left": "5px",
								"top": maxTop + "px"
							});
							break;
						case "BC":
							self.$assistiveTool.css({
								"left": content + "px",
								"top": maxTop + "px"
							});
							break;
						case "BR":
							self.$assistiveTool.css({
								"left": maxLeft + "px",
								"bottom": "0px"
							});
							break;
						default:
							break;
					}

				},

				// Start drag move assistive tool
				startDragAssistiveTool: function(e, sender) {
					var self = this,
						movePosition = {},
						legendWrap = self.getSizeAndPosition(self.$legendWrap),
						assistiveTool = self.getSizeAndPosition(self.$assistiveTool);

					// Save click legend position
					self.dragAssisactiveToolPosition.top = e.pageY - legendWrap.offsetTop - assistiveTool.top;
					self.dragAssisactiveToolPosition.left = e.pageX - legendWrap.offsetLeft - assistiveTool.left;

					// Bind document object 'mousemove' and 'mouseup' event
					$(document).bind({
						"mousemove.hotpoint": function(e) {
							movePosition = self.movingRange(e, sender, self.dragAssisactiveToolPosition);
							self.dragMove(sender, movePosition);
							e.preventDefault();
						},
						"mouseup.hotpoint": function() {
							$(this).unbind("mousemove.hotpoint mouseup.hotpoint");
							e.preventDefault();
						}
					});
				},

				// Rows click event
				rowsClick: function(sender) {
					var self = this,
						callout = $(sender).attr("data-callout");

					self.linkHotpoint([callout]);
				},

				// Legend on mouse move to find hotpoint
				seekHotpoint: function(e, sender) {
					var self = this,
						drawPointId = "",
						position = self.getPosition(e, sender),
						seekColor = self.opts.circleLineColor.seekColor,
						coord = self.getCoord(position.left, position.top),
						curDrawPointId = self.$legend.find("div[id^='t-']").attr("id");

					//self.$legend.css("cursor", "default");
					if (typeof coord !== "undefined") {
						//self.$legend.css("cursor", "pointer");
						drawPointId = "t-" + coord.x + '-' + coord.y;
						if (curDrawPointId === drawPointId) {
							return
						}
						if (typeof curDrawPointId !== "undefined") {
							self.clearHotpoint(curDrawPointId);
						}
						if (self.checkCoordExist(coord)) {
							self.drawHotpoint(drawPointId, coord, seekColor);
						}
					} else if (typeof curDrawPointId !== "undefined") {
						self.clearHotpoint(curDrawPointId);
					}
				},

				// Check coord exist current coords
				checkCoordExist: function(coord) {
					var self = this,
						i = 0,
						el;

					for (; el = self.curCoords[i]; i++) {
						if (el.x == coord.x && el.y == coord.y) {
							return false;
						}
					}

					return true;
				},

				// Click legend on callout to activate hotpoint
				clickLegend: function(e, sender) {
					var self = this,
						callout, callouts = [],
						curCoords,
						position = self.getPosition(e, sender),
						coord = self.getCoord(position.left, position.top),
						onSelectionCallout = self.opts.callbacks.onSelectionCallout;

					if (typeof coord !== "undefined") {
						callout = self.getCallout(coord.x, coord.y);

						if (typeof callout !== "undefined") {
							callouts.push(callout);
							curCoords = self.getCalloutCoord(callouts);
							if (curCoords.length > 0) {
								self.clearHotpoint();
								self.activateHotpoint(curCoords, callouts);
								// selection callout callback
								if (typeof onSelectionCallout === "function") {
									onSelectionCallout.apply(self, [callouts]);
								}
							}
							self.curCoords = curCoords;
						}
						self.curCallouts = callouts;
					}
				},

				// Start drag move legend
				startDragLegend: function(e, sender) {
					var self = this,
						movePosition = {},
						legend = self.getSizeAndPosition(self.$legend),
						legendWrap = self.getSizeAndPosition(self.$legendWrap);

					// Save click legend position
					self.dragLegendPosition.top = e.pageY - legendWrap.offsetTop - legend.top;
					self.dragLegendPosition.left = e.pageX - legendWrap.offsetLeft - legend.left;

					self.$legend.find("img").css("cursor", 'url("' + self.grabbingSrc + '"),pointer');
					// Bind document object 'mousemove' and 'mouseup' event
					$(document).bind({
						"mousemove.hotpoint": function(e) {
							movePosition = self.getMovePosition(e, self.dragLegendPosition);
							self.dragMove(sender, movePosition);
							e.preventDefault();
						},
						"mouseup.hotpoint": function() {
							$(this).unbind("mousemove.hotpoint mouseup.hotpoint");
							self.$legend.find("img").css("cursor", 'url("' + self.grabSrc + '"),pointer');
							e.preventDefault();
						}
					});
				},

				// Coord x y value to get callout
				getCallout: function(x, y) {
					var self = this,
						i = 0,
						item = {},
						callout;

					for (; i < self.buildData.length; i++) {
						item = self.buildData[i];
						if (item.x === x && item.y === y) {
							callout = item.callout;
							break;
						}
					}

					return callout;
				},

				// Mouse coord to get hotpoint coord
				getCoord: function(x, y) {
					var self = this,
						key = x + "-" + y,
						coord = self.dictList[key];

					return coord;
				},

				// Legend on draw hotpoint
				drawHotpoint: function(drawPointId, coord, colorHxe) {
					if (!this.opts.legendExist) return;

					var self = this,
						p = self.percent,
						x = coord.x * p,
						y = coord.y * p,
						radius = self.radius * p,
						color = new jsColor(colorHxe),
						pen = new jsPen(color, 3),
						point = new jsPoint(x, y),
						drawObj = self.graphics.drawCircle(pen, point, radius);

					$(drawObj).attr({
						"id": drawPointId,
						"data-type": "hotpoint"
					});
				},

				// Activate hotpoint
				activateHotpoint: function(coords, callouts) {
					var self = this,
						i = 0,
						drawPointId,
						checkedColor = self.opts.circleLineColor.checkedColor;

					for (; i < coords.length; i++) {
						drawPointId = coords[i].x + "-" + coords[i].y;
						self.drawHotpoint(drawPointId, coords[i], checkedColor);
					}
				},

				// Callout link Hotpoint
				linkHotpoint: function(callouts) {
					var self = this;

					self.clearHotpoint();
					self.curCallouts = callouts;
					self.curCoords = self.getCalloutCoord(callouts);
					if (self.curCoords.length === 1) {
						self.legendToCenter(self.curCoords[0].x, self.curCoords[0].y);
						self.activateHotpoint(self.curCoords, callouts);
					} else {
						self.resetLegend();
						self.redraw();
					}
				},

				// Clear legend on hotpoint
				clearHotpoint: function(drawPointId) {
					var self = this;

					if (drawPointId) {
						self.$legend.find("#" + drawPointId).remove();
					} else {
						self.$legend.find("div[data-type='hotpoint']").remove();
					}
				},

				// Moving range
				movingRange: function(e, sender, position) {
					var self = this,
						minleft = 5,
						minTop = 5,
						movePosition = self.getMovePosition(e, position),
						maxLeft = self.$legendWrap.width() - $(sender).width() - 5,
						maxTop = self.$legendWrap.height() - $(sender).height() - 5;

					if (movePosition.left < minleft) {
						movePosition.left = minleft;
					}
					if (movePosition.top < minTop) {
						movePosition.top = minTop;
					}
					if (movePosition.left > maxLeft) {
						movePosition.left = maxLeft;
					}
					if (movePosition.top > maxTop) {
						movePosition.top = maxTop;
					}

					return movePosition;
				},

				// Drag move image position
				dragMove: function(sender, position) {
					var self = this;

					$(sender).css({
						"left": position.left + "px",
						"top": position.top + "px"
					});
				},

				// Get move object position
				getMovePosition: function(e, position) {
					var self = this,
						legendWrap = self.getSizeAndPosition(self.$legendWrap),
						top = (e.pageY - legendWrap.offsetTop - position.top),
						left = (e.pageX - legendWrap.offsetLeft - position.left);

					return {
						top: top,
						left: left
					};
				},

				// Zoom in or zoom out legend
				zoomLegend: function(delta, e) {
					var self = this,
						percent = 1,
						position,
						zoom = 1.2,
						newH = 0,
						newW = 0,
						x = 0,
						y = 0,
						top = 0,
						left = 0,
						legend = self.getSizeAndPosition(self.$legend),
						legendWrap = self.getSizeAndPosition(self.$legendWrap);

					if (delta > 0)
						newW = legend.width * zoom, newH = legend.height * zoom;
					else
						newW = legend.width / zoom, newH = legend.height / zoom;

					// Calculating zoom percentage
					percent = (newW / self.legendWidth);

					// Zoom in range
					if (percent >= self.opts.maxZoom || percent <= self.opts.minZoom)
						return;

					// Setting zoom in percent
					self.percent = percent;

					// Setting the new width and height
					self.$legend.width(newW).height(newH);

					// get zoom position
					if (typeof e === "undefined") {
						position = {
							top: (legendWrap.height - newH) / 2,
							left: (legendWrap.width - newW) / 2
						}
					} else {
						position = self.getZoomPosition(e, legend.width, legend.height, newW, newH);
					}

					self.$legend.css({
						"left": position.left + "px",
						"top": position.top + "px"
					});

					// Zoom in after redraw hotpoint
					self.redraw();
				},

				// Get legend zoom position
				getZoomPosition: function(e, oldWidth, oldHeight, newWidth, newHeight) {
					var self = this,
						position = self.getCursorPosition(e),
						legendWrap = self.getSizeAndPosition(self.$legendWrap),
						wLeft = e.pageX - legendWrap.offsetLeft,
						wTop = e.pageY - legendWrap.offsetTop,
						topPercent = (position.top / oldHeight).toFixed(2),
						leftPercent = (position.left / oldWidth).toFixed(2);

					return {
						top: wTop - (newHeight * topPercent),
						left: wLeft - (newWidth * leftPercent)
					};
				},

				// Get current cursor position
				getCursorPosition: function(e) {
					var self = this,
						legendWrap = self.getSizeAndPosition(self.$legendWrap),
						legend = self.getSizeAndPosition(self.$legend);

					return {
						top: e.pageY - legendWrap.offsetTop - legend.top,
						left: e.pageX - legendWrap.offsetLeft - legend.left
					};
				},

				// Get current mouse position
				getPosition: function(e) {
					var self = this,
						legend = self.getSizeAndPosition(self.$legend),
						legendWrap = self.getSizeAndPosition(self.$legendWrap),
						legendMarge = self.getLegendMarge(),
						t = parseInt((e.pageY - self.legendOffsetTop - legend.top + legendMarge.margeTop) / self.percent),
						l = parseInt((e.pageX - self.legendOffsetLeft - legend.left + legendMarge.margeLeft) / self.percent);

					return {
						top: t,
						left: l
					};
				},

				getLegendMarge: function() {
					var self = this,
						left = (self.$legendWrap.width() - self.legendWidth) / 2,
						top = (self.$legendWrap.height() - self.legendHeight) / 2;

					return {
						margeLeft: left,
						margeTop: top
					};
				},

				// Move legend to visible area
				legendToCenter: function(x, y) {
					var self = this,
						p = self.percent,
						legend = self.getSizeAndPosition(self.$legend),
						legendWrap = self.getSizeAndPosition(self.$legendWrap),
						x1 = self.x1,
						y1 = self.y1,
						x2 = self.x2,
						y2 = self.y2,
						topRange = legendWrap.offsetTop + (y * p) + legend.top - 15,
						leftRange = legendWrap.offsetLeft + (x * p) + legend.left - 15,
						moveTop = (legendWrap.height / 2) - (y * p) - 15,
						moveLeft = (legendWrap.width / 2) - (x * p) - 15;

					if ((leftRange > x1 && topRange > y1) && (leftRange < x2 && topRange < y2)) {
						return;
					}
					if ((legend.cssTop === 0 && legend.cssLeft === 0) && (legend.width === self.legendWidth && legend.height === self.legendHeight)) {
						return;
					}
					self.$legend.css({
						"left": moveLeft + "px",
						"top": moveTop + "px"
					});
				},

				// Get jquery obejct size and position
				getSizeAndPosition: function($domEl) {

					return {
						width: $domEl.width(),
						height: $domEl.height(),
						top: $domEl.position().top,
						left: $domEl.position().left,
						offsetTop: $domEl.offset().top,
						offsetLeft: $domEl.offset().left
					};
				},

				// Get callout be legend on coord
				getCalloutCoord: function(callouts) {
					var self = this,
						callout, coords = [],
						i = 0,
						buildData = self.buildData;

					for (; i < buildData.length; i++) {
						callout = buildData[i].callout.toString();
						if ($.inArray(callout, callouts) > -1) {
							coords.push({
								x: buildData[i].x,
								y: buildData[i].y
							});
						}
					}

					return coords;
				},

				// Zoom in legend size
				zoomIn: function(e) {
					var self = this;

					self.zoomLegend(1, e);
				},

				// Zoom out legend size
				zoomOut: function(e) {
					var self = this;

					self.zoomLegend(0, e);
				},

				// Reset image size and position
				resetLegend: function() {
					var self = this,
						top = (self.$legendWrap.height() - self.legendHeight) / 2,
						left = (self.$legendWrap.width() - self.legendWidth) / 2;

					self.percent = 1;
					self.$legend.css({
						top: top + "px",
						left: left + "px",
						width: self.legendWidth,
						height: self.legendHeight
					});
				},

				// Move up
				moveUp: function() {
					var self = this;

					if (self.isDone && self.percent > 1) {
						self.isDone = false;
						self.$legend.animate({
							top: '+=100px'
						}, "slow", function() {
							self.isDone = true;
						});
					}
				},

				// Move left
				moveLeft: function() {
					var self = this;

					if (self.isDone && self.percent > 1) {
						self.isDone = false;
						self.$legend.animate({
							left: '+=100px'
						}, "slow", function() {
							self.isDone = true;
						});
					}
				},

				// Move right
				moveRight: function() {
					var self = this;

					if (self.isDone && self.percent > 1) {
						self.isDone = false;
						self.$legend.animate({
							left: '-=100px'
						}, "slow", function() {
							self.isDone = true;
						});
					}
				},

				// Move down
				moveDown: function() {
					var self = this;

					if (self.isDone && self.percent > 1) {
						self.isDone = false;
						self.$legend.animate({
							top: '-=100px'
						}, "slow", function() {
							self.isDone = true;
						});
					}
				},

				// Redraw hotpoint
				redraw: function() {
					var self = this;

					if (self.curCoords.length > 0) {
						self.clearHotpoint();
						self.activateHotpoint(self.curCoords, self.curCallouts);
					}
				},

				// In proportion to calculate
				scalingDownCalc: function(iW, iH, mW, mH) {
					var newW, newH, top, left;

					if (iH / iW >= mH / mW) {
						if (iH > mH) {
							newH = mH;
							newW = (iW * mH) / iH;
						} else {
							newW = iW;
							newH = iH;
						}
					} else {
						if (iW > mW) {
							newW = mW;
							newH = (iH * mW) / iW;
						} else {
							newW = iW;
							newH = iH;
						}
					}

					top = (mH - newH) / 2;
					left = (mW - newW) / 2;

					return {
						width: newW,
						height: newH,
						top: top,
						left: left
					};
				},

				// Get assistive tool template
				getAssistiveToolTemplate: function() {
					var self = this,
						assistiveTool = self.opts.assistiveTool;

					return $(templates).wrap("<div></div>")
						.parent()
						.find("div[data-template-id='" + assistiveTool + "']")
						.get(0).outerHTML;
				},

				// Show loading
				loadingShow: function() {
					var self = this,
						msg = '<span style="display:block;line-height:28px;font-family:微软雅黑,font-size:10pt;height:28px;">loading...</span>';
					if (self.legendLoadingImg) {
						msg = "<img src='" + self.legendLoadingImg + "' />";
					}

					!self.$legendWrap.children(".blockUI").size() && self.$legendWrap.block({
						message: msg,
						baseZ: 900,
						css: {
							width: "15%",
							border: "none",
							background: "transparent"
						}
					});
				},

				// Hide loading
				loadingHide: function() {
					var self = this;

					self.$legendWrap.unblock();
				}
			};
		})();

		// return Hotpoint constructor
		return Hotpoint;
	}

	/* Using require js AMD standard */
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {

		var basePath = (function() {
			var splittedPath,
				config = require.s.contexts._.config,
				path = config.paths["hotpoint"];

			if (typeof path !== "undefined") {
				splittedPath = path.split(/\/+/g);
				return splittedPath.slice(0, splittedPath.length - 2).join("/") + "/";
			} else {
				alert("require config paths 'hotpoint' key not exist");
			}
		})();

		define(['text!' + basePath + 'template/assistive-template.htm',
				'mousewheel',
				'normalize',
				'jsDraw2D',
				'scrollIntoView'
			],
			setup);
	} else {
		setup(jQuery);
	}
})(jQuery);