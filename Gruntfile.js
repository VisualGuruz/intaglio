module.exports = function (grunt) {
	
	grunt.initConfig({
		browserify: {
			build: {
				src: ['intaglio.js'],
				dest: 'dist/intaglio.js',
				options: {
					ignore: [
						// Ignore certain modules
						'mysql',
						'request',

						// Ignore the nodejs specific stuff
						'./lib/repositories/mysql/**/*',

						// Ignore the mocks
						'./lib/repositories/mock/**',
						'./lib/repositories/rest/driver/mock.js',
					],
					alias: [
						'./shims/underscore.js:underscore',
						'./shims/rsvp.js:rsvp'
					],
					browserifyOptions: {
						standalone: 'Intaglio'
					}
				}
			}
		},
		uglify: {
			build: {
				files: {
					'dist/intaglio.min.js': ['dist/intaglio.js']
				},
				options: {
					sourceMap: 'dist/intaglio.min.js.map'
				}
			}
		},
		copy: {
			bower: {
				src: ['bower.json'],
				dest: 'dist/'
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('build', ['browserify', 'uglify', 'copy:bower']);
};