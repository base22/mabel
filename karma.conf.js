module.exports = ( config ) => {
	let configuration = {
		frameworks: [ "jspm", "jasmine" ],

		jspm: {
			config: "jspm.config.js",
			stripExtension: false,
			loadFiles: [
				"node_modules/jasmine-ajax/lib/mock-ajax.js",
				"node_modules/es6-shim/es6-shim.min.js",

				"src/**/*.spec.ts",
			],
			serveFiles: [
				"tsconfig.json",
				"src/**/!(*.spec).ts",
			]
		},

		reporters: [ "mocha" ],

		port: 9876,

		colors: true,

		// Level of logging
		// Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// Enable / Disable watching file and executing tests whenever any file changes
		autoWatch: false,
		// Continuous integration mode
		// If true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		browserNoActivityTimeout: 60 * 1000,

		// Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: [ "Chrome" ],
		customLaunchers: {
			chromeTravis: {
				base: "Chrome",
				flags: [ "--no-sandbox" ]
			},
		},
	};

	if( "TRAVIS" in process.env ) {
		configuration.browsers = [ "chromeTravis" ];
	}

	config.set( configuration );
};