module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['lib/**/*.js', './*.js'],
      options: {
        globals: {
        }
      }
    },
    jsjsdoc: {
      main: {
        files: {'docs/main.md': ['./*.js', 'lib/**/*.js']},
      }
    },
    watch: {
      main: {
        options: {
          spawn: false
        },
        files: ['lib/**/*.js', './*.js'],
        tasks: ['default']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsjsdoc');

  grunt.registerTask('default', ['jshint', 'jsjsdoc', 'watch']);
  
};


