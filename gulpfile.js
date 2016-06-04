"use strict";

const fs = require( "fs" );
const del = require( "del" );

const gulp = require( "gulp" );
const util = require( "gulp-util" );
const runSequence = require( "run-sequence" );

const sourcemaps = require( "gulp-sourcemaps" );
const ts = require( "gulp-typescript" );

const jeditor = require( "gulp-json-editor" );

const tslint = require( "gulp-tslint" );

const Builder = require( "jspm" ).Builder;

const karma = require( "karma" );
const jasmine = require( "gulp-jasmine" );

const config = {
	dist: {
		all: "dist/**/*",
		dir: "dist",
		definitions: "dist",
		typescript: "dist",
		sfxBundle: "dist/bundles/core.sfx.js"
	},
	src: {
		all: [
			"typings/typings.d.ts",
			"src/**/*.ts"
		],
		dir: "src",
		test: "/**/*.spec.js",
		typescript: [
			"typings/typings.d.ts",
			"src/**/*.ts",
			"!src/**/*.spec.ts"
		]
	},
	temp: "temp"
};

gulp.task( "build", ( done ) => {
	runSequence(
		"lint",
		"clean:dist",
		[ "build:prepare-npm-package", "compile:typescript" ],
		done
	);
} );

gulp.task( "build:prepare-npm-package", ( done ) => {
	runSequence(
		[ "build:prepare-npm-package:copy:docs", "build:prepare-npm-package:copy:package-json", "build:sfx" ],
		done
	);
} );

gulp.task( "build:prepare-npm-package:copy:docs", () => {
	return gulp.src( [
		"README.md",
		"CHANGELOG.md",
		"LICENSE",
	] ).pipe( gulp.dest( config.dist.dir ) );
} );

gulp.task( "build:prepare-npm-package:copy:package-json", () => {
	return gulp.src( "package.json" )
		.pipe( jeditor( ( json ) => {
			delete json.private;
			delete json.scripts;
			delete json.devDependencies;

			json.main = json.main.replace( "dist/", "" );
			json.typings = json.typings.replace( "dist/", "" );

			return json;
		} ) )
		.pipe( gulp.dest( config.dist.dir ) )
		;
} );


gulp.task( "build:sfx", ( done ) => {
	let builder = new Builder();
	builder.buildStatic( "build/sfx.js", config.dist.sfxBundle, {
		"sourceMaps": "inline",
		"mangle": false,
		"lowResSourceMaps": false,
	} ).then( () => {
		done();
	} ).catch( ( error ) => {
		util.log( error );
		done( error );
	} );
} );

gulp.task( "compile:typescript", () => {
	let tsProject = ts.createProject( "tsconfig.json", {
		declaration: true
	} );

	let tsResults = gulp.src( config.src.typescript )
		.pipe( sourcemaps.init() )
		.pipe( ts( tsProject ) );

	tsResults.dts.pipe( gulp.dest( config.dist.dir ) );

	return tsResults.js
		.pipe( sourcemaps.write( "." ) )
		.pipe( gulp.dest( config.dist.typescript ) )
		;
} );

gulp.task( "clean:dist", ( done ) => {
	return del( config.dist.all, done );
} );

gulp.task( "clean:temp", ( done ) => {
	return del( config.temp, done );
} );

gulp.task( "default", [ "build" ] );

gulp.task( "lint", [ "lint:typescript" ] );

gulp.task( "lint:typescript", () => {
	return gulp.src( config.src.typescript )
		.pipe( tslint( {
			tslint: require( "tslint" )
		} ) )
		.pipe( tslint.report( "prose" ) )
		;
} );

gulp.task( "test", [ "test:browser", "test:node" ] );

gulp.task( "test:browser", ( done ) => {
	new karma.Server( {
		configFile: __dirname + "/karma.conf.js",
		singleRun: true
	}, done ).start();
} );

gulp.task( "test:node", ( done ) => {
	runSequence(
		"test:node:exec",
		"clean:temp",
		done
	);
} );

gulp.task( "test:node:compile", [ "clean:temp" ], () => {
	let tsProject = ts.createProject( "tsconfig.json" );
	let tsResults = gulp.src( config.src.all )
		.pipe( ts( tsProject ) );

	return tsResults.js
		.pipe( gulp.dest( config.temp ) );
} );

gulp.task( "test:node:exec", [ "test:node:compile" ], () => {
	return gulp.src( config.temp + config.src.test )
		.pipe( jasmine() );
} );
