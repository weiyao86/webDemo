/// <reference path="Scripts/customTabs.js" />
module.exports = function (grunt) {
  //require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // transport: {
        //    dialog: {
        //        files: [
        //            {
        //                src: '*',
        //                dest: 'dist'
        //            }
        //        ]
        //    }
        // },
        uglify: {
            builld: {
                files: {
                    "dist/build.js": ["js/test.js","js/bootstrap.js"]
                }
            }
        }
    });

    // grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ["uglify"]);
      //grunt.registerTask('default', []);
};