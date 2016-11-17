'use strict';

/*
 * Create a new Fractal instance and export it for use elsewhere if required
 */

const fractal = module.exports = require('@frctl/fractal').create();

/*
 * General project configuration.
 */

fractal.set('project.title', 'eQ Pattern Library');

/*
 * Configure components.
 */

fractal.components.set('path', `${__dirname}/components`);
fractal.components.set('default.preview', '@preview');
/*
* Custom status types for components
*/
fractal.components.set('statuses', {
    prototype: {
        label: "Prototype",
        description: "Do not implement.",
        color: "#FF3333"
    },
    testing: {
      label: "Testing",
      description: "Undergoing user testing",
      color: "#4990E2"
    },
    wip: {
        label: "WIP",
        description: "Work in progress. Implement with caution.",
        color: "#FF9233"
    },
    ready: {
        label: "Ready",
        description: "Ready to implement.",
        color: "#29CC29"
    },
});
/*
 * Configure the Handlebars template engine used by components
 *
 * Components use Handlebars templates by default, so this step normally not required.
 * However in this example we are expicitly loading the handlebars adapter
 * to demonstrate how to add custom Handlebars helpers that you can then use
 * in your components.
 *
 * See https://github.com/frctl/handlebars for more information on the Handlebars
 * adapter and bundled helpers.
 */

const handlebarsAdapter = require('@frctl/handlebars');

const hbs = handlebarsAdapter({
    helpers: {
        uppercase: function(str) {
            return str.toUpperCase();
        },
        lowercase: function(str) {
            return str.toLowerCase();
        }
    }
});

fractal.components.engine(hbs);

/*
 * Configure docs.
 */

fractal.docs.set('path', `${__dirname}/docs`);

/*
 * Configure the template engine used for documentation pages.
 *
 * In this example we are going to use Nunjucks as a templating engine for
 * our documentation pages, instead of Handlebars (the default). This example
 * also demonstrates how to customise the standard Nunjucks install with a bespoke filter.
 *
 * See https://github.com/frctl/nunjucks for more details on using Nunjucks with Fractal.
 */

const nunjucksAdapter = require('@frctl/nunjucks');

const nunj = nunjucksAdapter({
    paths: [require.resolve('@frctl/mandelbrot') + '/../views'],
    globals: {
        frctl: fractal
    }
});

fractal.docs.engine(nunj);

/*
 * Configure the web interface.
 */

fractal.web.set('static.path', `${__dirname}/public`);
fractal.web.set('builder.dest', 'dist');

const theme = require('@frctl/mandelbrot')({
    skin: 'white',
    nav: ['docs', 'components'],
    panels: ["notes", "html", "info", "context"],
    static: {
      "mount": "theme",
    }
});

fractal.web.theme(theme);
