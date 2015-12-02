define("sideAnimate", ["ajax", "settings", "jquery", "amplify"],
	function (ajax, settings) {

	    var MySideAnimate = function (options) {
	        this.$aImag = $("#" + options.aImage || "");
	        this.$divLeftbar = $("#" + options.divLeftbar || "");
	        this.$divRightMain = $("#" + options.divRightMain || "");
	        this.init();
	    };

	    MySideAnimate.prototype = {
	        //init
	        init: function () {
	            var self = this;
	            self.load();
	        },

	        load: function () {
	            var self = this;
	            self.$aImag.toggle(
					function () {
					    var divWidth = $(this).width() - self.$divLeftbar.width() + 10;
					    self.$divLeftbar.animate({ "left": divWidth });
					    $(".main_frame").animate({ "marginLeft": $(this).width() + 10 }, function () {
					        amplify.publish(settings.amplifyConstName.tabpanelResize);
					    });
					    $(this).addClass("clickA");
					},
					function () {
					    self.$divLeftbar.animate({ "left": 0 });
					    $(".main_frame").animate({ "marginLeft": self.$divLeftbar.width() }, function () {
					        amplify.publish(settings.amplifyConstName.tabpanelResize);
					    });
					    $(this).removeClass("clickA");
					}
					);
	        }
	    };
	    return MySideAnimate;
	});