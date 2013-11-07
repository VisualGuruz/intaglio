module.exports = function (grunt) {
	
	grunt.initConfig({
		browserify: {
			client: {
				src: ['test/demo.js'],
				options: {
					ignore: ['node_modules/mysql/**/*']
				},
				dest: 'dist/intaglio.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('browser-dev', ['browserify']);
};