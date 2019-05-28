;
!Function.prototype.bind && (Function.prototype.bind = function(content) {
	var slice = [].slice,
		args = slice.call(arguments, 1);
	if (typeof this !== "function") {
		throw new TypeError("Function...error");
	}
	var self = this,
		noop = function() {},
		round = function() {
			return self.apply(this instanceof noop ? this : content || this,
				args.concat(slice.call(arguments, 1)));
		};
	noop.prototype = self.prototype;
	round.prototype = new noop();
	return round;
});

var defaults = {
	callbacks: {
		AfterClick: null
	}
};

var Hotpoint3D = function(opts) {
	this.opts = $.extend({}, defaults, opts);
	this.init();
};

Hotpoint3D.prototype = {

	init: function() {

		var self = this;

		self.buildDom();

		self.initScene();

		self.initCamera();

		self.initRenderer();

		self.initLights();

		self.initMaterial();

		self.initManage();

		self.initDomEvent();

		self.loadOutMaterial();

		self.animate();
	},

	buildDom: function() {

		var self = this;

		self.loadLocal = true;

		self.childrenList = [];
		self.cacheObjects = [];
		self.clickCls = "#ffff00";
		self.overCls = "#ffff00";
		self.container = document.getElementById('hot_img_wrap');
		self._width = self.container.clientWidth;
		self._height = self.container.clientHeight;
		self.clock = null;
		self.lastObj3D = null;
		self.domEvents = null;
		self.stats = null;
		self.camera = null;
		self.scene = null;
		self.renderer = null;
		self.controls = null;
		self.manager = null;

		self.timers = {
			time: [],
			interval: [],
			animation: []
		};

		//播放/暂停
		self.playObj = {
			isPause: false,
			lastPlayDoc: null
		};

		//鼠标三维向量
		self.mouseVector = new THREE.Vector3();
		//光线投射用于进行鼠标拾取
		self.raycaster = new THREE.Raycaster();

	},

	onWindowResize: function() {
		var self = this;
		self._width = self.container.clientWidth;
		self._height = self.container.clientHeight;
		self.camera.aspect = self._width / self._height;
		self.camera.updateProjectionMatrix();

		self.renderer.setSize(self._width, self._height);
	},

	initScene: function() {
		var self = this;
		self.scene = new THREE.Scene();

		self.scene.background = new THREE.Color(0xa0a0a0);
		//场景雾化
		self.scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
	},

	initCamera: function() {
		var self = this;
		self.camera = new THREE.PerspectiveCamera(45, self._width / self._height, 0.01, 1000);
		self.camera.position.set(100, 200, 300);
		self.camera.lookAt(self.scene.position);
	},

	initRenderer: function() {
		var self = this;
		self.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		self.renderer.setClearColor(0x000000, 1); //0x464646
		self.renderer.setSize(self._width, self._height);
		//阴影
		// self.renderer.shadowMap.enabled =true;
		self.container.appendChild(self.renderer.domElement);

		self.clock = new THREE.Clock();
		self.stats = new Stats();
		self.stats.dom.style.position = 'absolute';
		self.stats.dom.style.top = 'auto';
		self.stats.dom.style.bottom = '0';
		self.stats.dom.style.left = '40%';
		self.stats.dom.style.zIndex = 10;

		self.container.appendChild(self.stats.dom);

	},

	initLights: function() {
		var self = this;

		//坐标轴
		var axes = new THREE.AxesHelper(100);
		self.scene.add(axes);

		//环境光
		var ambient = new THREE.AmbientLight(0x000000);
		self.scene.add(ambient);

		//点光源
		var pointLight = new THREE.PointLight(0xffffff, 1, 100);
		pointLight.position.set(3, 200, 10);
		self.scene.add(pointLight);

		//聚光灯
		var spotLight = new THREE.SpotLight(0xffffff, 1, 100, 0.06);
		spotLight.position.set(0, 200, 200);
		spotLight.castShadow = true;
		self.scene.add(spotLight);

		//平行光
		var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.castShadow = true;
		directionalLight.position.set(0, 200, 0);

		self.scene.add(directionalLight);

		//半球光
		var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
		hemiLight.position.set(0, 20, 0);
		self.scene.add(hemiLight);

		var grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
		grid.material.opacity = 0.2;
		grid.material.transparent = true;
		self.scene.add(grid);

		var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({
			color: 0x999999,
			depthWrite: false
		}));
		mesh.rotation.x = -Math.PI / 2;
		mesh.receiveShadow = true;
		self.scene.add(mesh);

	},

	initMaterial: function() {
		var self = this;
		var material = new THREE.MeshBasicMaterial({
			color: 'yellow',
			side: THREE.DoubleSide
		});
	},

	initManage: function() {
		var self = this;
		self.manager = new THREE.LoadingManager();

		self.manager.onStart = function(url, itemsLoaded, itemsTotal) {

			console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

		};

		self.manager.onLoad = function() {
			$.unblockUI();
			console.log('Loading complete!');
		};


		self.manager.onProgress = function(url, itemsLoaded, itemsTotal) {

			console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

		};

		self.manager.onError = function(url) {
			$.unblockUI();
			self.lastObj3D = null;
			alert('加载模型文件!');
			console.log('There was an error loading ' + url);

		};
	},

	initDomEvent: function() {
		var self = this;
		//父容器作为事件容器
		self.domEvents = new THREEx.DomEvents(self.camera, self.renderer.domElement);

		//鼠标控制
		self.controls = new THREE.OrbitControls(self.camera, self.renderer.domElement);
		self.controls.target.set(0, 0, 0);
		self.controls.enableDamping = true;
		self.controls.dampingFactor = 0.55;


		document.getElementById("start").addEventListener("click", function() {
			if (!self.existObj3D()) return alert('请加载模型');
			var that = this;
			self.goPlay(that);

		}, false);

		document.getElementById("scatter").addEventListener("input", function() {
			if (!self.existObj3D()) return alert('请加载模型');
			var scalar = this.value * 1;

			self.applyScalar(scalar, 'up');

		}, false);

		document.getElementById("reset").addEventListener("click", function() {
			if (!self.existObj3D()) return alert('请加载模型');
			self.stopReset();

		}, false);

		document.getElementById("scatterBtn").addEventListener("click", function() {
			if (!self.existObj3D()) return alert('请加载模型');
			self.tempFun(1, 'up');

		}, false);

		self.container.addEventListener('click', function(event) {
			event.preventDefault();

			self.mouseClick();

		}, false);

		self.container.addEventListener('mousemove', function(event) {
			event.preventDefault();

			self.mousemove(event);

		}, false);

		window.addEventListener('resize', self.onWindowResize.bind(self), false);
	},

	stopReset: function() {
		var self = this;
		self.camera.position.set(100, 200, 300);
		self.controls.target.set(0, 0, 0);
		self.queue.clear();
		self.clearDelay();
		self.tempFun(100, 'down');
		self.playObj.lastPlayDoc = null;
	},

	clearDelay: function() {
		var self = this,
			id;
		while (self.timers.animation.length) {
			id = self.timers.animation.pop();
			window.cancelAnimationFrame(id);
		}

		while (self.timers.time.length) {
			id = self.timers.time.pop();
			window.clearTimeout(id);
		}

		while (self.timers.interval.length) {
			id = self.timers.interval.pop();
			window.clearInterval(id);
		}

	},

	mouseClick: function() {
		var self = this;

		if (self.clickObj) {
			self.rmClickFlag(self.clickObj);
		}

		self.clickObj = [];

		if (!self.existObj3D()) return;

		var intersects = self.getIntersects();

		if (intersects.length > 0) {
			var res = intersects.filter(function(res) {
				return res && res.object;
			})[0];

			if (res && res.object) {
				self.clickObj = [res.object];
				self.addClickFlag(self.clickObj);
			}
		}

		if (typeof self.opts.callbacks.AfterClick === "function") {
			self.opts.callbacks.AfterClick.call(null, self.clickObj[0]);
		}
	},


	setCls: function(arr, newCls, fn) {
		var self = this,
			cls;

		arr.forEach(function(val) {
			cls = newCls || val.userData['originColor'];
			val.material.color.set(cls);
			if (typeof fn == "function") fn.call(self, val);
		});

		return arr;
	},

	trrigerSetCls: function(name) {
		var self = this,
			meshs = self.getMeshlistByName(name),
			cls;

		if (self.clickObj) {
			self.rmClickFlag(self.clickObj);
		}

		self.addClickFlag(meshs);
		self.clickObj = meshs;
	},

	addClickFlag: function(meshs) {
		var self = this;
		self.setCls(meshs, self.clickCls, function(obj) {
			obj.userData['clickCls'] = self.clickCls;
		});
	},

	rmClickFlag: function(meshs) {
		var self = this;
		self.setCls(meshs, '', function(obj) {
			delete obj.userData['clickCls'];
		});
	},

	getMeshlistByName: function(name) {
		if (!name) return [];
		var self = this,
			rst = [],
			list = list || self.childrenList;

		list.forEach(function(item) {
			var iname;
			if (item.isMesh) {
				iname = item.name;
				if (name == iname) {
					rst.push(item);
				}
			}
		});
		return rst;
	},

	mousemove: function(event) {
		var self = this;

		if (!self.existObj3D()) return;

		self.setMouseCoordinate(event.x, event.y);

		if (self.selectObj) {
			var cls = self.selectObj.userData['originColor'],
				ckCls = self.selectObj.userData['clickCls'];

			ckCls && (cls = ckCls);
			self.selectObj.material.color.set(cls);
			self.selectObj.material.opacity = 1;
			self.selectObj = null;
		}

		var intersects = self.getIntersects();

		if (intersects.length > 0) {
			var res = intersects.filter(function(res) {
				return res && res.object;
			})[0];

			if (res && res.object) {
				self.selectObj = res.object;
				self.selectObj.material.opacity = .5;
				// var cls = self.overCls;
				// if (!self.selectObj.userData['clickCls']) {
				// 	self.selectObj.material.color.set(cls);
				// }
			}
		}
	},

	getIntersects: function() {
		var self = this;
		self.raycaster.setFromCamera(self.mouseVector, self.camera);
		return self.raycaster.intersectObject(self.lastObj3D, true);
	},

	setMouseCoordinate: function(x, y) {
		var self = this;
		x = (event.clientX - $(self.container).offset().left) / self._width * 2 - 1;
		y = -(event.clientY - $(self.container).offset().top) / self._height * 2 + 1;
		self.mouseVector.set(x, y, 0.5);
	},

	goPlay: function(that) {
		var self = this;

		if (that.value == "Play") {
			that.value = "Pause";
			self.playObj.isPause = false;

			if (typeof self.playObj.lastPlayDoc === "function") {

				self.playObj.lastPlayDoc.call();

			} else {

				self.playObj.lastPlayDoc = null;

				for (let i = 0, item; item = self.sortChild[i]; i++) {
					// if(i==0){
					// 	continue;
					// }

					self.queue.add(function(next) {
						//console.log(item.name);
						self.anim(item, 100, next);
					});
				}

				self.queue.trigger();
			}
		} else {
			that.value = "Play";
			self.playObj.isPause = true;
		}
	},

	anim: function(value, scalar, next) {
		var self = this;
		if (self.playObj.isPause) {
			console.log('暂停位置:---' + scalar);
			return self.playObj.lastPlayDoc = function() {
				console.log('继暂停后开始:---' + scalar);
				self.anim(value, scalar, next);
			};
		}
		var at1 = window.requestAnimationFrame(function() {
			scalar--;
			if (scalar < 0) {
				function inner() {
					var innerC = 100;
					var t = setInterval(function() {
						if (innerC == 300) return clearInterval(t);

						self.camera.position.setZ(innerC += 10);
					}, 17);
					self.timers.interval.push(t);
				}

				var t2 = setTimeout(function() {

					inner();
					next();

				}, 2000);

				self.timers.time.push(t2);
				return;
			} else if (scalar == 10) {
				var count = 0,
					clsArr = [0xffcc00, 0x000000, 0xffcc00, 0x000000, 0xffcc00, 0x000000],
					timer;

				function inner() {
					var innerC = 300;
					var t3 = setInterval(function() {
						if (innerC == 100) return clearInterval(t3);
						self.camera.position.setZ(innerC -= 10);
					}, 17);
					self.timers.interval.push(t3);
				}
				inner();
				//self.camera.position.setX(Math.random() * 100 + 1);
				// self.camera.position.setY(Math.random() * 100 + 1);
				var t4 = setTimeout(function() {
					//console.log('当前暂停这:' + scalar);

					self.anim(value, scalar, next)
					self.setCls([value]);
				}, 2000);

				self.timers.time.push(t4);
			} else {

				//爆炸公式
				var pos = new THREE.Vector3().copy(value.userData.oldPs)
					.add(new THREE.Vector3().copy(value.worldDir)
						.multiplyScalar(scalar));

				value.position.copy(pos);
				value.visible = true;
				// self.camera.position.copy(pos);
				// self.camera.lookAt(pos);
				self.anim(value, scalar, next)

			}
		});

		self.timers.animation.push(at1);
	},

	applyScalar: function(scalar, dir) {
		var self = this;
		for (var i = 0, value; value = self.sortChild[i]; i++) {

			if (!value.isMesh || !value.worldDir) return;

			//爆炸公式
			value.position.copy(
				new THREE.Vector3().copy(value.userData.oldPs)
				.add(new THREE.Vector3().copy(value.worldDir)
					.multiplyScalar(scalar))
			);
		}
	},

	tempFun: function(num, dir, fn) {
		var self = this;

		if ((dir == "up" && num > 100) || (dir == "down" && num < 0)) {
			if (typeof fn == "function")
				fn.call(self);
			return;
		}
		dir === "up" ? num++ : num--;
		var at = window.requestAnimationFrame(function() {

			self.applyScalar(num, dir);
			self.tempFun(num, dir, fn);
		});
		self.timers.animation.push(at);
	},

	existObj3D: function() {
		var self = this;
		return self.lastObj3D;
	},

	changeLoader: function(url) {
		var self = this,
			suffixs = {
				obj: '.obj',
				gltf: '.glb',
				fbx: '.fbx'
			};
		if (!url) return;

		if (new RegExp(suffixs.obj + "$", 'i').test(url)) {
			if (!self.objsuffix) {
				self.objsuffix = new THREE.OBJLoader(self.manager);
			}
			return self.objsuffix;

		} else if (new RegExp(suffixs.gltf + "$", 'i').test(url)) {
			if (!self.glbsuffix) {
				self.glbsuffix = new THREE.GLTFLoader(self.manager);
			}
			return self.glbsuffix;

		} else if (new RegExp(suffixs.fbx + "$", 'i').test(url)) {
			if (!self.fbxsuffix) {
				self.fbxsuffix = new THREE.FBXLoader(self.manager);
			}
			return self.fbxsuffix;

		}
		return null;
	},

	loadOutMaterial: function(url) {
		var self = this,
			localData = window['localJsonData'],
			loader = self.changeLoader(url);
		if (!loader) return;

		if (self.lastObj3D) {

			function deleteGroup(group) {
				//console.log(group);
				if (!group) return;
				// 删除掉所有的模型组内的mesh
				group.traverse(function(item) {
					if (item instanceof THREE.Mesh) {
						item.geometry.dispose(); // 删除几何体
						item.material.dispose(); // 删除材质
					}
				});
				group.parent.remove(group);
			}

			//移除上个元素并复位相机与鼠标控制原点

			while (self.lastObj3D.children.length > 0) {
				deleteGroup(self.lastObj3D.children[0]);
			}
			self.scene.remove(self.lastObj3D);

			self.camera.position.set(100, 200, 300);
			self.controls.target.set(0, 0, 0);
			self.camera.lookAt(self.scene.position);

			self.queue.clear();
		};

		if (!url) return;

		self.sortChild = [];

		if (self.loadLocal) {
			if (!localData) return alert("本地json文件未加载!");
			obj = self.loadLocalObj(localData);
			operationObj(obj);
			console.log('加载本地文件');
		} else {
			$.blockUI();

			loader.load(url, function(obj) {
				operationObj(obj);
			});
			console.log('加载服务端文件');
		}

		function operationObj(obj) {

			//glb 操作在scene
			obj.scene && (obj = obj.scene);

			self.lastObj3D = obj;

			obj.position.set(0, 0, 0);

			self.scene.add(obj);

			self.childrenList = obj.children;
			// obj.rotation.set(20 * Math.PI / 180, 0, 20 * Math.PI / 180);

			//在3D空间中表示一个盒子或立方体。这个的主要目的是表示对象的最小边界框
			self.modelBox = new THREE.Box3();
			self.meshBox = new THREE.Box3();
			self.modelBox.expandByObject(obj);

			//设置模型中心点
			self.modelWorldPs = new THREE.Vector3().addVectors(self.modelBox.max, self.modelBox.min).multiplyScalar(0.5);

			obj.traverse(function(child) {

				if (child.isMesh) {
					var tempCls = new THREE.Color().set(child.material.color);

					child.userData['originColor'] = tempCls;

					self.meshBox.setFromObject(child);
					//获取每个mesh的中心点,爆炸方向为爆炸中心点指向mesh中心点
					var worldPs = new THREE.Vector3().addVectors(self.meshBox.max, self.meshBox.min).multiplyScalar(0.5);
					if (isNaN(worldPs.x)) return;
					//计算爆炸方向
					child.worldDir = new THREE.Vector3().subVectors(worldPs, self.modelWorldPs).normalize();
					//保存初始点
					child.userData['oldPs'] = child.getWorldPosition(new THREE.Vector3());

					self.sortChild.push(child);

					// child.material.transparent = true;
					//阴影
					// child.castShadow = true;
					// child.receiveShadow = true;

				}
			});
		}

	},

	//TODO 2019/5/20
	loadLocalObj: function(obj) {
		var self = this;

		var objectLoader = new THREE.ObjectLoader(self.manager);


		return objectLoader.parse(obj, function(obj) {});
	},

	animate: function() {
		var self = this;

		window.requestAnimationFrame(self.animate.bind(self));
		self.controls.update(self.clock.getDelta());
		self.stats.update();
		self.render();

	},

	render: function() {
		var self = this;

		self.renderer.clear();
		self.renderer.dispose();
		self.renderer.render(self.scene, self.camera);
	},

	queue: (function() {
		var pending = [];

		function next() {
			var fn = pending.shift();
			if (fn) {
				fn(next);
			}
		}

		return {
			add: function(fn) {
				if (typeof fn === "function") pending.push(fn);
			},

			getQueue: function() {
				return pending;
			},

			clear: function() {
				pending.length = 0;
			},

			trigger: function() {
				next();
			}
		}
	})()

};