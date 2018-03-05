const WIN = 'win';
const OSX = 'osx';

module.exports = function(grunt) {  
  const os = WIN;
  const rm = (args) => {
    switch(os) {
      case WIN:
        return `if exist "${args}" rmdir /S /Q "${args}"`;
      case OSX:
        return `rm -rf ${args}`;
    }
  }

  const rename = (args) => { 
    switch(os) {
      case WIN:
        return `rename ${args}`;
      case OSX:
        return `mv ${args}`;
    }
  }

  grunt.initConfig({
    shell: {
      options: {
        stderr: false
      },
      createBundle: {
        command: [
          rm`./lib`,
          'cd ./src',
          'tsc --jsx react --outDir ../lib --declaration --preserveSymlinks --pretty',
          'cd ..',
          rm`./lib/__tests__`,
          rm`./lib/src/demo-app`,
          'cd ./lib',
          rename`src out`
        ].join('&&')
      }
    }
  });
  grunt.loadNpmTasks('grunt-shell');
  grunt.registerTask('default', ['shell:createBundle']);
};