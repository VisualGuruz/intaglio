module.exports = function (grunt) {
	
	grunt.initConfig({
		browserify: {
			build: {
				src: ['intaglio.js'],
				options: {
					ignore: [
						// Ignore the nodejs specific stuff
						'lib/repositories/mysql/**',
						'lib/repositories/rest/driver/node.js',

						// Ignore certain modules
						'node_modules/mysql/**',
						'node_modules/request/**',
						'node_modules/underscore/**',
						'node_modules/rsvp/**',
						'node_modules/inflection/**'
					],
					standalone: 'Intaglio'
				},
				dest: 'dist/intaglio.js'
			}
		},
		uglify: {
			build: {
				files: {
					'dist/intaglio.min.js': ['dist/intaglio.js']
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('build', ['browserify', 'uglify']);
};