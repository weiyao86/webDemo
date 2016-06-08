require(['hotpoint', 'jquery', 'blockUI', 'domReady!'], function(Hotpoint) {

	var Point = {
		init: function() {
			var self = this;

			self.hotpoint = new Hotpoint({
				radius: 10,
				dock: "TL",
				renderToId: "legend_wrap",
				assistiveTool: "2",
				nopic: ''
			});

			var legend = {
					"width": self.getParameterByName('w') || 596,
					"height": self.getParameterByName('h') || 842
				},
				calloutData = [{
					"callout": "1",
					"x": "136.05",
					"y": "510.05"
				}, {
					"callout": "1",
					"x": "454.3",
					"y": "493.75"
				}],
				gifPath = "http://res2.dev.servision.com.cn/tis/epc/sgmw/legend/image/05df1ac18036ca6c2969879949de67a2.gif";
			// $("#legend_path").val();


			self.hotpoint.bindLegend({
				src: gifPath,
				data: calloutData,
				legendExist: true,
				swfLegendWidth: legend.width,
				swfLegendHeight: legend.height
			}, function() {
				self.hotpoint.linkHotpoint(["1"]);
			});
		},

		getParameterByName: function(name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(window.location.search);
			if (results == null)
				return "";
			else
				return decodeURIComponent(results[1].replace(/\+/g, " "));
		}
	};

	Point.init();

});