module.exports = function(grunt) {
  grunt.initConfig({
    shell: {
      options: {
        stderr: false
      },
      target: {
        command: [
          'rm  -rf ./lib',
          'cd ./src',
          'tsc --jsx react --outDir ../lib --declaration --preserveSymlinks --pretty',
          'rm -rf ../lib/__tests__',
          'rm -rf ../lib/src/demo-app',
          'mv ../lib/src/* ../lib',
          'rm  -rf ../lib/src',
        ].join('&&') 
      }
    }
  });
  grunt.loadNpmTasks('grunt-shell');
  grunt.registerTask('default', ['shell']);
};