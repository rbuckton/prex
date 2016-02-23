/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

var fs = require('fs')
  , gulp = require('gulp')
  , ts = require('gulp-typescript')
  , typescript = require('typescript')
  , sourcemaps = require('gulp-sourcemaps')
  , gutil = require("gulp-util")
  , del = require('del')
  , mocha = require('gulp-mocha')
  , istanbul = require('gulp-istanbul')
  , merge = require('merge2');

var lib = {
    project: "src/lib/tsconfig.json",
    src: ["src/lib/**/*.ts"],
};

var tests = {
    project: "src/tests/tsconfig.json",
    src: ["src/tests/**/*.ts"],
    main: "out/tests/index.js",
    coverage: {
        thresholds: {
            global: 80
        }
    }
};

var useCoverage = false;

gulp.task("build:lib", build(lib));
gulp.task("build:tests", build(tests));
gulp.task("build", ["build:lib", "build:tests"]);
gulp.task("clean", cb => del("out", cb));
gulp.task("cover", setCoverage());
gulp.task("test:pre-test", ["build"], preTest());
gulp.task("test", ["test:pre-test"], test(tests));
gulp.task("watch", watch(lib.src.concat(tests.src), ["test"]));
gulp.task("default", ["build"]);

function build(opts) {
    return function () {
        var tee = gulp
            .src(opts.src, { base: "src" })
            .pipe(sourcemaps.init())
            .pipe(ts(ts.createProject(opts.project, {
                typescript: typescript
            })));
        return merge([
            tee.dts.pipe(gulp.dest("out")),
            tee.js
                .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../../src/" }))
                .pipe(gulp.dest("out"))
        ]);
    };
}

function setCoverage() {
    return function () {
        useCoverage = true;
    };
}

function preTest() {
    return function () {
        if (useCoverage) {
            return gulp.src(['out/lib/*.js'])
                .pipe(istanbul())
                .pipe(istanbul.hookRequire());
        }
    };
}

function test(opts) {
    return function () {
        var stream = gulp
            .src(opts.main, { read: false })
            .pipe(mocha({ reporter: 'dot' }));
        return useCoverage
            ? stream
                .pipe(istanbul.writeReports({ reporters: ["text", "html"] }))
                .pipe(istanbul.enforceThresholds(opts.coverage))
            : stream;
    };
}

function watch(src, tasks) {
    return function () {
        return gulp.watch(src, tasks);
    };
}

