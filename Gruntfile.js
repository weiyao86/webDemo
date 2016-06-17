module.exports = function(grunt) {

	//临时要使用sass压缩文件
	var scwd = "图片组件/", //监听目录
		sdest = "styles/css/", //生成的css文件存放目录
		wfiles = ["图片组件/styles/css/*.css"], //需要监听的css文件
		wsassfiles = ['图片组件/*.scss']; //需要监听的scss文件


	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			build: {
				options: {
					separator: '',
					stripBanners: false
				},
				files: {
					"<%= pkg.folder %>/release/js/all.js": ["<%= pkg.folder %>/test-uglify/myLibrary.js", "<%= pkg.folder %>/test-uglify/myJsClass.js"]
				}
			}
			// dist:{
			//     src:["<%= pkg.folder %>/test-uglify/myLibrary.js","<%= pkg.folder %>/test-uglify/myJsClass.js"],
			//     dest:"<%= pkg.folder %>/release/all.js"
			// }
		},
		uglify: {
			options: {
				banner: '/*! <%=pkg.name %><%=grunt.template.today("yyyy-mm-dd") %>*/\n'
			},
			//方法一
			build: { //直接压缩
				src: 'Scripts/test-uglify/myJsClass.js',
				dest: '<%= pkg.folder %>/release/js/<%=pkg.name %>.0.min.js'
			},

			//自定义方法二
			release: {
				options: {
					mangle: false, //不混淆变量名
					report: "min",
					preserveComments: 'all', //不删除注释，还可以为 false（删除全部注释），some（保留@preserve @license @cc_on等注释）
					enclose: {
						WINDOW: "window"
					}, //所有的代码在一个可配置的参数/参数列表中关闭
					footer: '\n/*! <%= pkg.name %>最后修改于:<%= grunt.template.today("yyyy-mm-dd") %> */' //添加footer
				},
				files: {
					'<%= pkg.folder %>/release/js/all.min.js': ['<%= pkg.folder %>/release/js/all.js']
				}
			},

			//自定义方法三
			my_target: { //压缩目录下的所有JS
				expand: true,
				cwd: '<%= pkg.folder %>/test-uglify/', //源文件相对目录
				src: '*.js', //所有js文件
				//src: ['**/*.js', '!**/*.min.js'],  //不包含某个js,某个文件夹下的js
				dest: '<%= pkg.folder %>/release/js/', //目标目录
				rename: function(dest, src) {

					var folder = src.substring(0, src.lastIndexOf('/'));
					var fileName = src.substring(src.lastIndexOf('/'), src.length);

					fileName = fileName.substring(0, fileName.lastIndexOf('.'));
					var fileresult = dest + folder + fileName + '.min.js';
					grunt.log.writeln("现处理文件:" + src + "处理后文件:" + fileresult);
					return fileresult;
				}
			}
		},

		//压缩css
		cssmin: {
			//文件头部输出信息
			options: {
				//keepSpecialComment: 0,
				banner: '/*! <%= pkg.name %>  <%= grunt.template.today("yyyy-mm-dd") %> \n*/',
				beautify: {
					//中文ascii化，非常有用！防止中文乱码的神配置
					ascii_only: true
				}
			},

			//方法一,合并多个文件到一个文件中
			compress: {
				files: {
					'<%= pkg.folder %>/release/css/all-uglify.min.css': ['Css/all.css', 'Css.base.css']
				}
			},

			//自定义方法二,将源目录下的所有css文件结构不变的压缩到其它目录下
			my_target: {
				files: [{
					expand: true,
					cwd: 'Css/', //源文件相对目录
					//src: '*.css', //所有js文件
					src: ['*.css', '!*.min.css'], //不包含某个js,某个文件夹下的js
					dest: '<%= pkg.folder %>/release/css/', //目标目录
					rename: function(dest, src) {

						var folder = src.substring(0, src.lastIndexOf('/'));
						var fileName = src.substring(src.lastIndexOf('/'), src.length);

						fileName = fileName.substring(0, fileName.lastIndexOf('.'));
						var fileresult = dest + folder + fileName + '.min.css';
						grunt.log.writeln("现处理文件:" + src + "处理后文件:" + fileresult);
						return fileresult;
					}
				}]
			}
		},


		sass: {
			dist: {
				options: {
					sourcemap: 'none',
					style: 'compact'
				},
				expand: true,
				cwd: scwd, //'downloadPage/'
				src: '*.scss',
				ext: '.css',
				dest: sdest //downloadPage/styles/css/
			}
		},

		//监听模式
		watch: {
			css: {
				files: wfiles, // ["downloadPage/styles/css/*.css"],
				options: {
					livereload: true
				}
			},
			sass: {
				files: wsassfiles, //['downloadPage/*.scss'],
				tasks: ['sass'],
				options: {
					livereload: false
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['concat', 'uglify', 'cssmin', 'sass']);
	grunt.registerTask('watch-ck', ['watch']);
};