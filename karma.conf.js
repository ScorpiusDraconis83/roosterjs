const argv = require('minimist')(process.argv.slice(2));
const components = argv.components !== true && argv.components;
const runCoverage = typeof argv.coverage !== 'undefined';
const runFirefox = typeof argv.firefox !== 'undefined';
const runChrome = typeof argv.chrome !== 'undefined';

const rootPath = __dirname;

module.exports = function (config) {
    const plugins = [
        'karma-webpack',
        'karma-phantomjs-launcher',
        'karma-jasmine',
        'karma-sourcemap-loader',
    ];
    const launcher = [];

    if (runCoverage) {
        plugins.push('karma-coverage-istanbul-reporter');
    }

    if (runChrome) {
        plugins.push('karma-chrome-launcher');
        launcher.push('Chrome');
    }

    if (runFirefox) {
        plugins.push('karma-firefox-launcher');
        launcher.push('Firefox');
    }

    const tsConfig = {
        compilerOptions: {
            rootDir: rootPath,
            declaration: false,
            strict: false,
            downlevelIteration: true,
            paths: {
                '*': ['*', rootPath + '/packages/*'],
            },
        },
    };

    const rules = runCoverage
        ? [
              {
                  test: /lib(\\|\/).*\.ts$/,
                  use: [
                      { loader: '@jsdevtools/coverage-istanbul-loader' },
                      {
                          loader: 'ts-loader',
                          options: tsConfig,
                      },
                  ],
              },
              {
                  test: /test(\\|\/).*\.ts$/,
                  loader: 'ts-loader',
                  options: tsConfig,
              },
          ]
        : [
              {
                  test: /\.ts$/,
                  loader: 'ts-loader',
                  options: tsConfig,
              },
          ];

    const settings = {
        basePath: '.',
        plugins,
        client: {
            components: components,
            clearContext: false,
            captureConsole: true,
        },
        browsers: launcher,
        files: ['tools/karma.test.all.js'],
        frameworks: ['jasmine'],
        preprocessors: {
            'tools/karma.test.all.js': ['webpack', 'sourcemap'],
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,

        // to avoid DISCONNECTED messages
        browserDisconnectTimeout: 10000, // default 2000
        browserDisconnectTolerance: 1, // default 0
        browserNoActivityTimeout: 60000, //default 10000
        browserConsoleLogOptions: {
            level: 'log',
            format: '%b %T: %m',
            terminal: true,
        },

        singleRun: true,
        captureTimeout: 60000,

        webpack: {
            mode: 'development',
            devtool: 'inline-source-map',
            module: {
                rules,
            },
            resolve: {
                extensions: ['.ts', '.tsx', '.js'],
                modules: ['./packages', './node_modules'],
            },
            // Workaround karma-webpack issue https://github.com/ryanclark/karma-webpack/issues/493
            // Got this solution from https://github.com/ryanclark/karma-webpack/issues/493#issuecomment-780411348
            optimization: {
                splitChunks: false,
            },
        },

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
    };

    if (runCoverage) {
        settings.reporters = ['coverage-istanbul'];
        settings.coverageIstanbulReporter = {
            reports: ['html', 'lcovonly', 'text-summary'],
            dir: './dist/deploy/coverage',
        };
    }

    config.set(settings);
};
