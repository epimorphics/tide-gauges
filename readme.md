# Tide Gauge App

The Environment Agency publish a range of linked open datasets, including readings from tide gauges around England. Current and historical data from these gaages is availble via an [API](http://environment.data.gov.uk/flood-monitoring/doc/tidegauge).

## Application features

  * Search for tide gauge stations by name
  * Search for tide gauge stations near to a postcode in England
  * browse a map of the UK to find tide gauge stations
  * select a stations via the map or via the search facility
  * for the selected station, present key information from the underlying linked data, show the latest tide gauge reading and show a graph of historical tide gauge readings over the previous month
  * provide a cheat-sheet of example API endpoints for features of a given station

![screenshot of demo app](https://github.com/epimorphics/tide-gauges/blob/master/docs/screenshot.png?raw=true "Tide Gauge App")

## Code layout

Roughly speaking, we follow an MVC pattern for the application:

  * `app/es/controllers` hosts the single controller that is responsible for instantiating the view components.
  * `app/es/views` hosts for the main operating components of the application: textual search, map search, listing station details, displaying tide gauge graphs and the endpoints suggestion dialogue.
  * `/app/es/models` contain value-object wrappers that provide a convenience API around the JSON values returned from the API
  * `/app/es/services` contain service objects that provide a JavaScript API for the HTTP APIs available from the Tide Gauge API itself, and the postcode lookup service which resolves postcodes in England to WGS84 (i.e. latitude/longitude) points.

CSS is built from a single Sass file `app/scss/app.scss`. This file `@import`s the other stylesheets for the application, and supporting stylesheets from libraries in `node_modules`.

HTML code is built from page files in `app/pages`, which pulls in component layouts and partials from `app/templates` and `app/templates/partials` respectively.

## Build tools

The app is built using [gulp](http://gulpjs.com/). To see the various build targets, from the command line do:

    gulp -T

Commonly useful targets include:

  * `build:clean` to remove previously built artefacts from `./build`
  * `build` to rebuild all of the HTML, JavaScript and CSS code
  * `test:unit` to run unit tests
  * `test:functional-and-cleanup` to run integration tests via Selenium (and then close the Selenium process)
  * `watch` to start a local development server on `localhost:3000`, and automatically watch for code changes and update the running application.

# Contributing

You are encouraged to fork this repo and copy code to the degree that it is useful. You are also welcome to submit pull-requests with updates or bug-fixes. Significant extensions to the functionality of this application will be considered on a case-by-case basis. If you want to make significant extensions, you're probably best to create a new project based on this app.

## Code of conduct

We endorse the [code of conduct](CODE_OF_CONDUCT.md) for open-source projects and contributors.

# License

> Copyright (c) 2017 Environment Agency

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Data published via the Tide gauge API is available under the [Open Government License](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/)
