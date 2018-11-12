module.exports = function(config) {
  var testDir = 'tests/karma';

  config.set({

    basePath: './../../',

    client: {
      mocha: {
        timeout: 4000
      }
    },

    frameworks: ['browserify', 'mocha', 'chai-sinon', 'chai'],

    files: [
      './assets/js/polyfills.js',
      './assets/js/api/_load.js',
      './assets/js/**/*.spec.js',
      './components/**/*.spec.js',
      testDir + '/spec/**/*.js'
    ],

    preprocessors: {
      './assets/js/polyfills.js': ['browserify'],
      './assets/js/api/_load.js': ['browserify'],
      'tests/karma/spec/**/*.js': ['browserify'],
      './components/**/*.spec.js': ['browserify'],
      './assets/js/**/*.spec.js': ['browserify'],
    },

    plugins: [
      'karma-browserstack-launcher',
      'karma-chrome-launcher',
      'karma-mocha-reporter',
      'karma-browserify',
      'karma-mocha',
      'karma-chai-sinon',
      'karma-chai',
      'karma-coverage'
    ],

    browserify: {
      debug: true,
      transform: ['babelify'],
      paths: ['./node_modules', './assets/js/', 'components/']
    },

    reporters: ['mocha', 'progress', 'coverage', 'BrowserStack'],

    browsers: [
      'Chrome',
      'HeadlessChrome',
      //'bs_firefox_mac',
      //'bs_iphone5',
      'bs_window_10_IE_11'
    ],

    browserStack: {
      startTunnel: 'true',
      build: 'Karma unit tests',
      name: 'Karma',
      project: 'ONS - sdc-global-design-patterns',
      forcelocal: true
    },

    customLaunchers: {
      HeadlessChrome: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      },
      bs_firefox_mac: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: '63.0',
        os: 'OS X',
        os_version: 'Sierra'
      },
      bs_iphone5: {
        base: 'BrowserStack',
        device: 'iPhone 5',
        os: 'ios',
        os_version: '6.0'
      },
      bs_window_10_IE_11: {
        base: 'BrowserStack',
        os: 'Windows',
        os_version: '10',
        browser: 'IE',
        browser_version: '11',
      }
    },

    coverageReporter: {
      dir : 'coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcovonly', subdir: 'lcov' },
        { type: 'cobertura', subdir: 'cobertura' }
      ]
    },


    mochaReporter: {
      output: 'full'
    },

    colors: true,
    logLevel: config.LOG_DEBUG
  })
}
