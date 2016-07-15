$(function() {
	var tree = {
		previoursObj: {},
		objCount: 0,

		init: function() {
			var self = this;
			self.bindDom();
			self.buildEvent();
			self.load();
			self.initComplete();
		},

		bindDom: function() {
			var self = this;
			self.$tree = $("#tree");
			self.template = $("#template_tree").html();
			self.$partBody = $("#part_body");
			self.templateP = $("#template_part").html();
		},

		buildEvent: function() {
			var self = this;
			self.$tree.on("click", 'a', function() {
				self.previoursObj.treeNode && self.previoursObj.treeNode.removeClass("active");
				$(this).addClass("active");
				self.previoursObj.treeNode = $(this);

				var url = ['../../res/门板加序号-调整02.obj', '../../res/32_1172_N3082.obj', '../../res/20160704-加序号.obj', '../../res/20160707-01.obj'];

				self.hotpoint3D.loadOutMaterial(url[self.objCount]);

				self.objCount++;
				self.objCount > 2 && (self.objCount = 0);
			});

			self.$partBody.on("click", 'tr', function() {
				var callout = $(this).attr("data-callout");
				if (!self.previoursObj.partNode) {
					self.previoursObj.partNode = [];
				}

				$.each(self.previoursObj.partNode, function(idx, val) {
					$(val).removeClass("active");
				});


				var $trlist = self.$partBody
					.find("tr[data-callout='" + callout + "']")
					.addClass("active");

				self.previoursObj.partNode.length = 0;
				self.previoursObj.partNode = $trlist;


				self.hotpoint3D.click(callout);
			});

		},

		initComplete: function() {
			var self = this;

			Hotpoint3D && (self.hotpoint3D = new Hotpoint3D({
				callbacks: {
					AfterClick: $.proxy(self.clickPart, self)
				}
			}));
		},

		load: function() {
			var self = this;
			$.getJSON('../../data/tree.json', function(data) {
				data.Data = data.Data.filter(function(val) {
					return !!val.PId;
				});
				var view = Mustache.render(self.template, data);
				self.$tree.html(view);

			});

			$.getJSON('../../data/part.json', function(data) {
				var view = Mustache.render(self.templateP, data.Data);
				self.$partBody.html(view);

			});
		},

		clickPart: function(callout) {
			var self = this,
				$trlist = self.$partBody
				.find("tr[data-callout='" + callout + "']")
				.addClass("active");

			self.$partBody
				.find("tr[data-callout!='" + callout + "']")
				.removeClass("active");

			self.previoursObj.partNode = $trlist;
		}
	};
	tree.init();
});