/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

// @ts-check
var gulp = require('gulp')
  , del = require('del')
  , mocha = require('gulp-mocha')
  , istanbul = require('gulp-istanbul')
  , { buildProject } = require('./scripts/build');

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

const build_lib = () => buildProject("src/lib/tsconfig.json");
const build_tests = () => buildProject("src/tests/tsconfig.json");

gulp.task("build:lib", build_lib);
gulp.task("build:tests", build_tests);
gulp.task("build", gulp.parallel(["build:lib", "build:tests"]));
gulp.task("clean", cb => del("out", cb));
gulp.task("cover", setCoverage());
gulp.task("test:pre-test", gulp.series("build", preTest()));
gulp.task("test", gulp.series("test:pre-test", test(tests)));
gulp.task("watch", watch(lib.src.concat(tests.src), gulp.series(["test"])));
gulp.task("default", gulp.series(["build"]));

function setCoverage() {
    return function () {
        useCoverage = true;
    };
}

function preTest() {
    return async function () {
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
            // @ts-ignore
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

