var main = {
	init: function() {
		var self = this;
		self.initOpts();
		self.initComponent();
	},

	initOpts: function() {
		var self = this;
		// self.rotationOpts = {
		// 	singleShow: true, //是否渐隐渐现
		// 	isPause:false,
		// 	rotScope: '', //最外层窗口
		// 	ltArrow: '', //左箭头
		// 	rtArrow: '', //右箭头
		// 	scopePanel: 'caroufredsel_wrapper', //包裹轮播区域的容器
		// 	rotContent: 'main_slide', //轮播区域
		// 	spheric: '', //圆点按钮
		// 	distance: 5 * 1000, //循环定时间隔
		// 	roundCls: "" //圆点选中样式
		// };


		self.rotationOpts ={
	 				singleShow: true, //是否渐隐渐现
					isPause: true, //是否暂停标记
					isFullScreen:true, //整屏滚动
					rotScope: 'pxs_container', //最外层窗口
					ltArrow: 'arrow_lt', //左箭头
					rtArrow: 'arrow_rt', //右箭头
					scopePanel: 'rotation_panel', //包裹轮播区域的容器
					rotContent: 'rotation_ad', //轮播区域
					spheric: 'rotation_spheric', //圆点按钮
					distance: 3 * 1000, //循环定时间隔
					roundCls: "focus-selected", //圆点选中样式
					parallaxId:"parallaxId",	//视差底图容器
					pxsThumbnails:"pxs_thumbnails"　//小图
			 	};

		self.imgOpts = {
			rotateImg:$("#rotation_ad img"),
			imgList: $(".great-wrap img"), //$("#rotation_ad img") //
			after:function(){
				self.rotation = new Rotation(self.rotationOpts);
			}
		};
	},

	initComponent: function() {
		var self = this;
		
		self.imgLoaded= new ImgLoaded(self.imgOpts);
	
	}
};


main.init();