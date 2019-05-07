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

				//var url = ['../../res/P1.obj', '../../res/P3.obj', '../../res/bumper test.obj', '../../res/20160707-01.obj'];
				var id = self.previoursObj.treeNode.attr("data-code");
				var url = self.previoursObj.treeNode.attr("data-url");
				// switch (id) {
				// 	case "EC35-101":
				// 		url = '../../res/door.obj';
				// 		break;
				// 	case "EC35-102":
				// 		url = '../../res/body.obj';
				// 		break;
				// 	default:
				// 		url = '../../res/5306001-8101-1.obj';
				// 		break;
				// }

				self.hotpoint3D.loadOutMaterial(url);

				self.objCount++;
				self.objCount > 1 && (self.objCount = 0);
			});

			self.$partBody.on("click", 'tr', function() {
				var callout = $(this).attr("data-callout");
				if (!self.previoursObj.partNode) {
					self.previoursObj.partNode = $();
				}

				self.previoursObj.partNode.removeClass("active");

				var $trlist = self.$partBody
					.find("tr[data-callout='" + callout + "']")
					.addClass("active");

				self.previoursObj.partNode = $trlist;

				self.hotpoint3D.trrigerSetCls(callout ? ('' + callout) : '');
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
				
				var view = Mustache.render(self.template, data);
				self.$tree.html(view);

				// self.previoursObj.treeNode = self.$tree.find("li:first>a").addClass("active");

			});

			$.getJSON('../../data/part.json', function(data) {

				var view = Mustache.render(self.templateP, data.Data);
				self.$partBody.html(view);

			});
		},

		clickPart: function(callout) {
			var self = this,
				$trlist;

			self.$partBody.find(".active").removeClass("active");

			$trlist = self.$partBody
				.find("tr[data-callout='" + callout + "']")
				.addClass("active");

			self.previoursObj.partNode = $trlist;
		}
	};
	tree.init();
});