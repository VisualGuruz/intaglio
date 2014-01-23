module.exports = function (grunt) {
	
	grunt.initConfig({
		browserify: {
			build: {
				src: ['intaglio.js'],
				options: {
					ignore: [
						// Ignore the nodejs specific stuff
						'lib/repositories/mysql/**',

						// Ignore the mocks
						'lib/repositories/mock/**',
						'lib/repositories/rest/driver/mock.js',

						// Ignore certain modules
						'node_modules/mysql/**',
						'node_modules/request/**',
						'node_modules/underscore/**',
						'node_modules/rsvp/**'
					],

					alias: [
						'shims/underscore.js:underscore',
						'shims/rsvp.js:rsvp'
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