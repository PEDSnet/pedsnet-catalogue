/* global module, require, console */

var webpack = require('webpack'),
	shell = require('shelljs');


var srcDir = __dirname + '/src',
    buildDir = __dirname + '/build',
    distDir = __dirname + '/dist',
    nodeDir = __dirname + '/node_modules';


var config = {
    srcDir: 'src',
    specDir: 'spec',
    buildDir: 'build',
    distDir: 'dist',
    cdnDir: 'cdn',
    nodeDir: 'node_modules',
    bowerDir: 'bower_components',

    serve: {
        build: {
            options: {
                base: 'build/',
                keepalive: true,
                port: 8125
            }
        },
        dist: {
            options: {
                base: 'dist/',
                keepalive: true,
                port: 8125
            }
        }
    },

    watch: {
        grunt: {
            tasks: ['build'],
            files: ['Gruntfile.js'],
            options: {
                reload: true
            }
        },
        build: {
            tasks: ['sync:build'],
            files: [
                '<%= srcDir %>/**/*',
                '<%= bowerDir %>/**/*'
            ]
        },
        sass: {
            tasks: ['sass:build'],
            files: ['<%= srcDir %>/scss/**/*']
        },
        react: {
            tasks: ['webpack:build'],
            files: ['<%= srcDir %>/js/**/*.jsx']
        }
    },

    webpack: {
        options: {
            debug: true,

            resolve: {
                alias: {},

                extensions: ['', '.js', '.jsx']
            },

            // Where to find JS modules.
            context: srcDir,

            // Entrypoint of the application.
            entry: {
                vendors: [
                    'react',
                    'page',
                    'underscore'
                ],

                main: ['./js/main.jsx']
            },

            plugins: [
                // Combine vendor scripts.
                new webpack.optimize.CommonsChunkPlugin('vendors', 'js/vendors.js')
            ],

            devtool: 'source-map',

            module: {
                noParse: [
                    nodeDir + '/react/dist/react.js',
                    nodeDir + '/page/page.js',
                    nodeDir + '/underscore/underscore.js'
                ],

                loaders: [{
                    test: /\.jsx$/,
                    loader: 'jsx-loader'
                }]
            }
        },

        build: {
            output: {
                path: buildDir,
                filename: 'js/[name].js'
            }
        },

        dist: {
            output: {
                path: distDir,
                filename: 'js/[name].js'
            }
        }
    },

    sync: {
        build: {
            files: [{
                expand: true,
                flatten: true,
                cwd: '<%= nodeDir %>',
                src: [
                    'font-awesome/css/font-awesome.css',
                    'bootstrap/dist/css/bootstrap.css',
                    'bootstrap/dist/css/bootstrap.css.map',
                    'fixed-data-table/dist/fixed-data-table.css',
                ],
                dest: '<%= buildDir %>/css'
            }, {
                expand: true,
                flatten: true,
                cwd: '<%= nodeDir %>',
                src: [
                    'font-awesome/fonts/*'
                ],
                dest: '<%= buildDir %>/fonts'
            }, {
                expand: true,
                cwd: '<%= srcDir %>/img',
                src: '**/*',
                dest: '<%= buildDir %>/img'
            }, {
                expand: true,
                cwd: '<%= srcDir %>/js',
                src: '**/*.js',
                dest: '<%= buildDir %>/js'
            }, {
                expand: true,
                cwd: '<%= srcDir %>/html',
                src: '**/*',
                dest: '<%= buildDir %>'
            }]
        }
    },

    sass: {
        build: {
            options: {
                trace: true,
                style: 'expanded'
            },
            files: {
                '<%= buildDir %>/css/main.css': '<%= srcDir %>/scss/main.scss'
            }
        },
        dist: {
            options: {
                quiet: true,
                style: 'compressed'
            },
            files: {
                '<%= distDir %>/css/main.css': '<%= srcDir %>/scss/main.scss'
            }
        },
        cdn: {
            options: {
                quiet: true,
                sourcemap: false,
                style: 'compressed'
            },
            files: {
                '<%= cdnDir %>/css/main.css': '<%= srcDir %>/scss/main.scss'
            }
        }
    },

    copy: {
        build: {
            files: [{
                expand: true,
                src: ['bower.json', 'package.json'],
                dest: '<%= buildDir %>'
            }, {
                expand: true,
                cwd: '<%= srcDir %>/js',
                src: ['**/*'],
                dest: '<%= buildDir %>/js'
            }, {
                expand: true,
                flatten: true,
                cwd: '<%= nodeDir %>',
                src: [
                    'flux/dist/Flux.js',
                    'react/react.js',
                    'underscore/underscore.js',
                ],
                dest: '<%= buildDir %>/js'
            }]
        },

        dist: {
            files: [{
                expand: true,
                cwd: '<%= srcDir %>/html',
                src: ['**/*'],
                dest: '<%= distDir %>'
            }, {
                expand: true,
                src: ['bower.json', 'package.json'],
                dest: '<%= distDir %>'
            }, {
                expand: true,
                flatten: true,
                cwd: '<%= nodeDir %>',
                src: [
                    'font-awesome/css/font-awesome.css',
                    'bootstrap/dist/css/bootstrap.css',
                    'bootstrap/dist/css/bootstrap.css.map'
                ],
                dest: '<%= distDir %>/css'
            }, {
                expand: true,
                flatten: true,
                cwd: '<%= nodeDir %>',
                src: [
                    'font-awesome/fonts/*'
                ],
                dest: '<%= distDir %>/fonts'
            }]
        },

        cdn: {
            files: [{
                expand: true,
                cwd: '<%= srcDir %>/html',
                src: ['**/*'],
                dest: '<%= cdnDir %>'
            }]
        }
    },

    clean: {
        build: [
            '<%= buildDir %>'
        ],

        dist: [
            '<%= distDir %>'
        ]
    },

    jshint: {
        options: {
            camelcase: true,
            immed: true,
            indent: 4,
            latedef: true,
            noarg: true,
            noempty: true,
            undef: true,
            unused: true,
            trailing: true,
            maxdepth: 3,
            browser: true,
            eqeqeq: true,
            globals: {
                require: true
            },
            reporter: require('jshint-stylish'),
            ignores: [
                '<%= buildDir %>/js/underscore.js',
                '<%= buildDir %>/js/react.js',
                '<%= buildDir %>/js/flux.js'
            ]
        },
        src: ['<%= buildDir %>/js/**/*.js']
    }
};


// Adds vendor modules to the webpack options. This includes setting an
// alias and adding it to an array of modules to not parse for faster
// building.
var addWebpackVendor = function(aliases) {
    config.webpack.options.resolve.alias = aliases;

    for (var key in aliases) {
        config.webpack.options.module.noParse.push(aliases[key]);
    }
};


addWebpackVendor({
    'react': nodeDir + '/react/dist/react.js',
    'page': nodeDir + '/page/page.js',
    'underscore': nodeDir + '/underscore/underscore.js'
});

module.exports = function(grunt) {
    var changeVersion = function(fname, version) {
        var contents = grunt.file.readJSON(fname),
            current = contents.version;

        contents.version = version;
        grunt.file.write(fname, JSON.stringify(contents, null, 2));
        grunt.log.ok(fname + ': ' + current + ' => ' + version);
    };

    var replaceVersion = function(fname, current, version) {
        var options = {encoding: 'utf8'},
            content = grunt.file.read(fname, options),
            regexp = new RegExp("version: '" + current + "'");

        if (!regexp.test(content)) {
            grunt.fatal('File contents does not match version');
        }

        content = content.replace(regexp, "version: '" + version + "'");
        grunt.file.write(fname, content, options);
        grunt.log.ok('' + fname + ': ' + current + ' => ' + version);
    };

    var run = function(cmd) {
        grunt.log.ok(cmd);
        shell.exec(cmd);
    };

	config.pkg = grunt.file.readJSON('package.json');

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-sync');

    grunt.registerMultiTask('serve', 'Run a Node server for testing', function() {
        var http = require('http'),
            path = require('path'),
            url = require('url'),
            fs = require('fs');

        var contentTypes = {
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.html': 'text/html'
        };

        var options = this.options({
            hostname: 'localhost',
            base: '.',
            port: 8125,
            keepalive: false
        });

        var serveResponse = function(filename, response) {
            var extname = path.extname(filename),
                contentType = contentTypes[extname] || 'text/plain',
                stream = fs.createReadStream(filename);

            response.writeHead(200, {
                'Content-Type': contentType
            });

            stream.pipe(response);
        };

        var serve404 = function(filename, response) {
            response.writeHead(404);
            response.end();
        };

        var serve500 = function(filename, response) {
            response.writeHead(500);
            response.end();
        };

        var server = http.createServer(function(request, response) {
            var filename,
                pathname = url.parse(request.url).pathname,
                ext = path.extname(pathname);

            // Append index.html to file for directory-based matches
            if (ext === '' || !/^\.(js|css|jsx|png|jpg|woff|woff2|ttf|map)/.test(ext)) {
                filename = path.join(options.base, 'index.html');
            } else {
                filename = path.join(options.base, pathname);
            }

            fs.exists(filename, function(exists) {
                if (exists) {
                    fs.readFile(filename, function(error) {
                        if (error) {
                            serve500(filename, response);
                        } else {
                            serveResponse(filename, response);
                        }
                    });
                } else {
                    serve404(filename, response);
                }
            });
        });

        if (options.hostname === '*') options.hostname = null;
        if (options.port === '?') options.port = 0;

        var done = this.async();

        server.listen(options.port, options.hostname).on('listening', function() {
            var address, hostname;
            address = server.address();
            hostname = server.hostname || 'localhost';
            if (!options.keepalive) {
                done();
            } else {
                grunt.log.writeln('Listening on ' + hostname + ':' +
                                  address.port + '...');
            }
        }).on('error', function(error) {
            if (error.code === 'EADDRINUSE') {
                grunt.fatal('Port ' + options.port +
                                   ' is already in use by another process.');
            } else {
                grunt.fatal(error);
            }
        });
    });

    grunt.registerTask('build', 'Creates a build for local development', [
        'sass:build',
        'webpack:build',
        'sync:build'
    ]);

    grunt.registerTask('dist', 'Creates a build for distribution', [
        'clean:build',
        'copy:build',
        'webpack:build',
        'clean:dist',
        'sass:dist',
        'copy:dist',
        'clean:postdist'
    ]);

    grunt.registerTask('cdn', 'Creates a build for CDN distribution', [
        'clean:build',
        'copy:build',
        'clean:cdn',
        'sass:cdn',
        'copy:cdn',
        'clean:postcdn'
    ]);

    grunt.registerTask('work', 'Local build and starts a watch process', [
        'build',
        'sync',
        'watch'
    ]);

    grunt.registerTask('bump-final', 'Updates the version to final', function() {
        var svutil = require('semver-utils');

        var current = pkg.version,
            version = svutil.parse(pkg.version);

        if (version.release !== 'beta') {
            grunt.fatal('Version ' + current + ' not beta. Is this ready for release?');
        }

        version.release = '';
        version.build = '';

        pkg.version = svutil.stringify(version);

        replaceVersion('src/js/main.js', current, pkg.version);

        ['package.json', 'bower.json'].map(function(mod) {
            return changeVersion(mod, pkg.version);
        });
    });

    grunt.registerTask('bump-patch', 'Bumps version to next patch-release', function() {
        var svutil = require('semver-utils');

        var current = pkg.version,
            version = svutil.parse(pkg.version);

        console.log(version.release);

        if (version.release) {
            grunt.fatal('Version ' + current + ' not final. ' +
                        'Should this be bumped to a pre-release?');
        }

        version.patch = '' + (parseInt(version.patch, 10) + 1);
        version.release = 'beta';
        version.build = '';

        pkg.version = svutil.stringify(version);

        replaceVersion('src/js/main.js', current, pkg.version);

        ['package.json', 'bower.json'].map(function(mod) {
            changeVersion(mod, pkg.version);
        });

        run('git add bower.json package.json src/js/main.js');

        var versionString = [version.major, version.minor, version.patch].join('.');

        run('git commit -s -m "' + versionString + ' Beta"');
    });

    grunt.registerTask('tag-release', 'Create a release on master', function() {
        run('git add bower.json package.json src/js/main.js');
        run('git commit -s -m "' + pkg.version + ' Release"');
        run('git tag ' + pkg.version);
    });

    grunt.registerTask('release-binaries', 'Create a release binary', function() {
        var releaseDirName = pkg.name + '-' + pkg.version;

        run('rm -rf ' + pkg.name);
        run('mkdir -p ' + pkg.name);
        run('cp -r dist/* ' + pkg.name);
        run('zip -r ' + releaseDirName + '.zip ' + pkg.name);
        run('tar -Hzcf ' + releaseDirName + '.tar.gz ' + pkg.name);
        run('rm -rf ' + pkg.name);
        run('mkdir -p ' + pkg.name);
        run('cp -r build/* ' + pkg.name);
        run('zip -r ' + releaseDirName + '-src.zip ' + pkg.name);
        run('tar -Hzcf ' + releaseDirName + '-src.tar.gz ' + pkg.name);
        run('rm -rf ' + pkg.name);
    });

    grunt.registerTask('release-help', 'Prints the post-release steps', function() {
        grunt.log.ok('Push the code and tags: git push && git push --tags');
        grunt.log.ok('Go to ' + pkg.homepage + '/releases to update the release ' +
                     'descriptions and upload the binaries');
        grunt.log.ok('The CDN-ready files have been updated');
    });

    grunt.registerTask('release', 'Builds the distribution files, creates the ' +
                                  'release binaries, and creates a Git tag', [
        'bump-final',
        'build',
        'dist',
        'cdn',
        'clean:release',
        'release-binaries',
        'tag-release',
        'release-help',
        'bump-patch'
    ]);
};
