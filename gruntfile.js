const WIN = 'win';
const OSX = 'osx';

module.exports = function(grunt) {  
  const os = [WIN, OSX].includes(grunt.option('os')) ? grunt.option('os') : OSX;
  
  const rm = (args) => {
    switch(os) {
      case WIN:
        return `if exist "${args}" rmdir /S /Q "${args}"`;
      case OSX:
        return `rm -rf ${args}`;
    }
  }

  const cp = (args) => {
    switch(os) {
      case WIN:
        return `copy ${args}`;
      case OSX:
        return `cp ${args}`;
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
          cp`./src/sass/_aux-functions.scss ./lib/src/sass/_aux-functions.scss`,
          cp`./src/sass/hp-slider.scss ./lib/src/sass/hp-slider.scss`,
          cp`./src/sass/hp-slider.scss.d.ts ./lib/src/sass/hp-slider.scss.d.ts`,
          cp`./src/sass/hp-time-series-chart.scss ./lib/src/sass/hp-time-series-chart.scss`,
          cp`./src/sass/hp-time-series-chart.scss.d.ts ./lib/src/sass/hp-time-series-chart.scss.d.ts`,
          'cd ./lib',
          rename`src out`
        ].join('&&')
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-shell');
  grunt.registerTask('default', ['shell:createBundle']);
};