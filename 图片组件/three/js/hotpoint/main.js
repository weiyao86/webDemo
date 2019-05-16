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
	},

	buildDom: function() {

		var self = this;

		self.childrenList = [];
		self.cacheObjects = [];
		self.clickCls = 0xff0000;
		self.clickTextCls = 0xffffff;
		self.overCls = 0xffff00;
		self.overTextCls = 0x000000;
		self.outCls = 0xffffff;
		self.outTextCls = 0x000000;
		self.container = document.getElementById('hot_img_wrap');
		self._width = self.container.clientWidth;
		self._height = self.container.clientHeight;
		self.clock = null;
		self.previous = null;
		self.domEvents = null;
		self.stats = null;
		self.camera = null;
		self.scene = null;
		self.renderer = null;
		self.controls = null;
		self.manager = null;

		self.modelBox = new THREE.Box3();
		self.meshBox = new THREE.Box3();

		self.mouseX = 0;
		self.mouseY = 0;
	},

	onWindowResize: function() {
		var self = this;
		self._width = self.container.clientWidth;
		self._height = self.container.clientHeight;
		self.camera.aspect = self._width / self._height;
		self.camera.updateProjectionMatrix();

		self.renderer.setSize(self._width, self._height);
	},

	meshMouseover: function(e) {
		var self = this,
			target = e.target,
			meshs = self.getMeshlistByName(target.name);

		self.setCls(meshs, self.overTextCls, self.overCls);

		e.stopPropagation();
	},

	meshMouseout: function(e) {
		var self = this,
			target = e.target,
			arr = self.getMeshlistByName(target.name, self.cacheObjects),
			outCls;

		if (arr.length) {
			self.setCls(self.cacheObjects, self.clickTextCls, self.clickCls);
		} else {
			var meshs = self.getMeshlistByName(target.name);
			self.setCls(meshs, self.outTextCls);
		}
		e.stopPropagation();
	},

	meshClick: function(e) {
		var self = this,
			target = e.target,
			name = target.name;

		self.click(name);
		e.stopPropagation();
	},

	click: function(name) {
		var self = this;

		self.trrigerSetCls(name);

		name = name.replace(/(Text|Cylinder|DirectConnectNode)/, '');

		if (self.cacheObjects.length && typeof self.opts.callbacks.AfterClick === "function") {
			self.opts.callbacks.AfterClick.call(null, name);
		}
	},

	trrigerSetCls: function(name) {
		var self = this,
			meshs = self.getMeshlistByName(name),
			cls;

		if (!meshs.length) {
			return self.setCls(self.cacheObjects, self.outTextCls);
		}

		self.setCls(self.cacheObjects, self.outTextCls);
		self.setCls(meshs, self.clickTextCls, self.clickCls);
		self.cacheObjects = meshs;
	},

	setCls: function(arr, txtcls, circlecls) {
		var self = this,
			cls;

		arr.forEach(function(val) {
			cls = circlecls || val.userData['originColor'];

			if (val.name.indexOf("Text") > -1) {
				cls = txtcls;
			}

			val.material.color.set(cls);
		});

		return arr;
	},

	getMeshlistByName: function(name, list) {
		if (!name) return [];
		var self = this,
			rst = [],
			name = name.replace(/(Text|Cylinder|DirectConnectNode)/, ''),
			list = list || self.childrenList;

		list.forEach(function(item) {
			var iname;
			if (item.type === 'Mesh' && /(Text|Cylinder|DirectConnectNode)/.test(item.name)) {
				iname = item.name.replace(/(Text|Cylinder|DirectConnectNode)/, '');
				if (name == iname) {
					rst.push(item);
				}
			}
		});
		return rst;
	},

	recursiveChild: function(obj) {
		var self = this;
		return self.recursive(obj);
	},

	recursive: function(obj) {
		var self = this,
			arr = [];
		if (obj.children.length) {
			obj.children.forEach(function(val) {
				val.type === 'Mesh' && arr.push(val);
				if (val.children.length) {
					arr = arr.concat(self.recursive(val));
				}
			});
		}
		return arr;
	},

	initScene: function() {
		var self = this;
		self.scene = new THREE.Scene();
	},

	initCamera: function() {
		var self = this;
		self.camera = new THREE.PerspectiveCamera(45, self._width / self._height, 0.1, 1000);
		self.camera.position.set(50, 50, 100);
		self.camera.lookAt(self.scene.position);
		// self.camera.position.set(0, 0, 300);
		// // self.camera.rotation.set(-50, 50, -50);
	},

	initRenderer: function() {
		var self = this;
		self.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		self.renderer.setClearColor(0x464646, 1);
		self.renderer.setSize(self._width, self._height);
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
		//环境光
		var ambient = new THREE.AmbientLight(0x101030);
		self.scene.add(ambient);

		//点扩散
		var directionalLight = new THREE.DirectionalLight(0xffeedd, .6);

		directionalLight.position.set(0, 0, 1);

		directionalLight.shadowCameraNear = 50;

		directionalLight.shadowCameraFar = 3000;

		directionalLight.shadowCameraLeft = -1000;

		directionalLight.shadowCameraRight = 1000;

		directionalLight.shadowCameraTop = 1000;

		directionalLight.shadowCameraBottom = -1000;

		directionalLight.shadowDarkness = .2;

		directionalLight.shadowCameraVisible = true;

		self.scene.add(directionalLight);
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
		self.manager.onProgress = function(item, loaded, total) {
			console.log(item, loaded, total);
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
		self.controls.dampingFactor = 0.25;
		// self.controls.autoRotate = true;
		// self.controls.enableZoom = false;

		window.addEventListener('resize', self.onWindowResize.bind(self), false);

		//document.addEventListener("mousemove", self.onDocumentMouseMove.bind(self), false);
	},

	onDocumentMouseMove: function(event) {
		var self = this,
			$c = $(self.container);
		if (!$c.length) return;

		self.mouseX = (event.clientX - $c.offset().left - self._width / 2) * 2;

		self.mouseY = (event.clientY - $c.offset().top - self._height / 2) * 2;

	},

	changeLoader: function(url) {
		var self = this,
			suffixs = {
				obj: '.obj',
				gltf: '.glb'
			};
		if (!url) return;

		if (url.indexOf(suffixs.obj) > -1) {
			return new THREE.OBJLoader(self.manager);
		} else if (url.indexOf(suffixs.gltf) > -1) {
			return new THREE.GLTFLoader(self.manager)
		}
		return null;
	},

	loadOutMaterial: function(url) {
		var self = this,
			loader = self.changeLoader(url);
		if (!loader) return;

		if (self.previous) {
			//在不刷新页面的情况下清除上一次加载的模型对象
			// var len = self.previous.children.length;
			// while (--len > -1) {
			// 	self.previous.children[len].geometry.dispose();
			// 	//self.previous.children[len].material.dispose();

			// 	self.previous.remove(self.previous.children[len]);
			// }

			//移除上个元素并复位相机与鼠标控制原点
			self.scene.remove(self.previous);
			self.camera.position.set(50, 50, 100);
			self.controls.target.set(0, 0, 0);
			self.camera.lookAt(self.scene.position);
		};

		if (!url) return;

		$.blockUI();

		loader.load(url, function(obj) {

			$.unblockUI();

			//glb 操作在scene
			obj.scene && (obj = obj.scene);

			obj.position.set(0, 0, 0);

			self.scene.add(obj);

			self.previous = obj;

			self.animate();

			self.childrenList = obj.children;
			// obj.rotation.set(20 * Math.PI / 180, 0, 20 * Math.PI / 180);
			obj.scale.set(1, 1, 1);

			// var colors = [0x9900cc, 0x00ff00, 0x55555f, 0xffffff];
			// var geometry, material, meshR;
			// geometry = new THREE.SphereGeometry(2, 32, 32); //CylinderGeometry(0,10,30,4,4);

			// var r = 70,
			// 	n = 16,
			// 	cls, meshList = [],
			// 	meshPos = [];
			// for (var i = 0; i <= n; i++) {
			// 	var c = Math.PI / n * i;
			// 	for (var j = 1; j <= 2 * n; j++) {
			// 		var c2 = Math.PI / n * j;
			// 		cls = colors[Math.floor(Math.random() * colors.length)];
			// 		material = new THREE.MeshPhongMaterial({
			// 			color: cls,
			// 			shading: THREE.FlatShading,
			// 			side: THREE.DoubleSide
			// 		});
			// 		meshR = new THREE.Mesh(geometry, material);
			// 		meshR.position.x = r * Math.sin(c) * Math.cos(c2);
			// 		meshR.position.y = r * Math.cos(c);
			// 		meshR.position.z = r * Math.sin(c) * Math.sin(c2);
			// 		meshR.name = j % 2 == 0 ? 'db' : i;

			// 		// meshR.updateMatrix();
			// 		meshR.matrixAutoUpdate = true;
			// 		self.domEvents.addEventListener(meshR, "mouseover", over, false);
			// 		self.domEvents.addEventListener(meshR, "mouseout", out, false);
			// 		self.domEvents.addEventListener(meshR, "click", click, false);
			// 		self.scene.add(meshR);
			// 		meshList.push(meshR);
			// 		meshPos.push({
			// 			x: meshR.position.x,
			// 			y: meshR.position.y,
			// 			z: meshR.position.z
			// 		});
			// 	}
			// }
			self.modelBox.expandByObject(obj);

			//设置模型中心点
			self.modelWorldPs = new THREE.Vector3().addVectors(self.modelBox.max, self.modelBox.min).multiplyScalar(0.5);

			obj.traverse(function(child) {

				if (child.isMesh) {
					if (/Text/.test(child.name)) {
						self.setCls([child], 0x000000, 0xffffff);
					} else if (/Cylinder/.test(child.name) || /DirectConnectNode/.test(child.name)) {
						self.domEvents.addEventListener(child, "mouseover", over, false);
						self.domEvents.addEventListener(child, "mouseout", out, false);
						self.domEvents.addEventListener(child, "click", click, false);

						var tempCls = new THREE.Color().set(child.material.color);

						child.userData['originColor'] = tempCls;
					}


					self.meshBox.setFromObject(child);
					//获取每个mesh的中心点,爆炸方向为爆炸中心点指向mesh中心点
					var worldPs = new THREE.Vector3().addVectors(self.meshBox.max, self.meshBox.min).multiplyScalar(0.5);
					if (isNaN(worldPs.x)) return;
					//计算爆炸方向
					child.worldDir = new THREE.Vector3().subVectors(worldPs, self.modelWorldPs).normalize();
					//保存初始点
					child.userData['oldPs'] = child.getWorldPosition(new THREE.Vector3());


					if (!self.sortChild) self.sortChild = [];
					self.sortChild.push(child);

				}
			});

			function over(e) {
				self.meshMouseover(e);
			}

			function out(e) {
				self.meshMouseout(e);
			}

			function click(e) {

				self.meshClick(e);
			}

			function applyScalar(scalar, dir) {

				obj.traverse(function(value) {
					if (!value.isMesh || !value.worldDir) return;

					//爆炸公式
					value.position.copy(
						new THREE.Vector3().copy(value.userData.oldPs)
						.add(new THREE.Vector3().copy(value.worldDir)
							.multiplyScalar(scalar))
					);
				});
			}


			// document.getElementById("zoomIn").addEventListener("click", function() {
			// 	var r1 = 1.5;
			// 	self.meshList.forEach(function(val, idx) {

			// 		TweenMax.to(val.position, 2, {
			// 			x: meshPos[idx].x * r1,
			// 			y: meshPos[idx].y * r1,
			// 			z: meshPos[idx].z * r1,
			// 			delay: 0,
			// 			ease: Back.easeIn,
			// 			onComplete: function() {
			// 				// console.log(meshPos[idx].pos.x);
			// 			}
			// 		});
			// 	});
			// }, false);

			document.getElementById("reset").addEventListener("click", function() {
				// self.meshList.forEach(function(val, idx) {
				// 	TweenMax.to(val.position, 2, {
				// 		x: meshPos[idx].x,
				// 		y: meshPos[idx].y,
				// 		z: meshPos[idx].z,
				// 		delay: 0,
				// 		ease: Back.easeIn,
				// 		onComplete: function() {
				// 			// console.log(GreenSock);
				// 		}
				// 	});
				// });

				//tempFun(100, 'down');

				var queue = self.queue();
				for (var i = 0, item; i < self.sortChild.length; i++) {
					item = self.sortChild[i];

					(function(item) {
						queue.add(function(next) {
							anim(item, 100, next);
						});
					})(item);

				}
				queue.trigger();

				function anim(value, scalar, next) {

					window.requestAnimationFrame(function() {
						scalar--;
						if (scalar < 0) return next();
						else if (scalar == 30) {
							var count = 0,
								clsArr = [0xffcc00, 0x000000],
								timer;

							timer = setInterval(function() {
								if (count > 1){ return clearInterval(timer);}
								self.setCls([value], '', clsArr[count]);
								count++;
							}, 200);

							setTimeout(function() {
								console.log('当前暂停这:' + scalar);
								anim(value, scalar, next)
								self.setCls([value], '');
							}, 2000);
						} else {

							//爆炸公式
							var pos = new THREE.Vector3().copy(value.userData.oldPs)
								.add(new THREE.Vector3().copy(value.worldDir)
									.multiplyScalar(scalar));

							value.position.copy(pos);
							// self.camera.position.copy(pos);
							// self.camera.lookAt(pos);
							anim(value, scalar, next)

						}
					});
				}


			}, false);

			document.getElementById("scatter").addEventListener("input", function() {
				var scalar = this.value * 1;

				applyScalar(scalar, 'up');

			}, false);

			document.getElementById("scatterBtn").addEventListener("click", function() {

				tempFun(1, 'up');

			}, false);


			function tempFun(num, dir) {
				if (dir == "up" && num > 100) return;
				if (dir == "down" && num < 0) return;
				dir === "up" ? num++ : num--;
				window.requestAnimationFrame(function() {

					applyScalar(num, dir);
					tempFun(num, dir);
				});
			}
		});
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
		// self.camera.position.x += (self.mouseX - self.camera.position.x) * 0.05;
		// self.camera.position.y += (-self.mouseY - self.camera.position.y) * 0.05;
		// self.camera.lookAt(self.scene.position);
		self.renderer.clear();
		self.renderer.render(self.scene, self.camera);
	},

	queue: function() {
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
	}

};