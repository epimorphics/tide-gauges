/* eslint-disable no-new */

import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import { stationMeasures } from '../services/gauge-api.es';

const Chartist = require('chartist');

window.Chartist = Chartist;
require('chartist-plugin-axistitle');

const DEFAULT_LIMIT = 3000; // 2976 for a month of results. 4 (hour) * 24 (day) * 31

/* Utility function to aggregate to group measures together */
function aggregateMeasures(measures) {
  return _.map(measures, measureGroups => [measureGroups.dateTime(), measureGroups.value()]);
}

/* Return the latest of a series of measures */
function latestMeasure(measures) {
  let latest = null;
  _.each(measures, (measure) => {
    if (!latest || measure.jsDate() > latest.jsDate()) {
      latest = measure;
    }
  });

  return latest;
}

/**
 * Transform an array of pairs of data, of the form `[data, value]` into
 * an array of dates and an array of values. This is similar to the Lodash
 * zip function, but we need to use the spread operator to expand the arrays
 */
function createSeries(totals) {
  return [{
    data: _.map(totals, pair => ({ x: pair[0], y: pair[1] })),
  }];
}

/* Return the period over which we display */
function readingDisplayPeriod() {
  return moment
    .utc()
    .subtract(1, 'months')
    .format();
}

/* Show the latest values for the given station */
function displayLatest(latest, stationId) {
  $(`[data-station-id='${stationId}'].js-reading-value`)
    .text(latest.value());
  $(`[data-station-id='${stationId}'].js-reading-date`)
    .text(latest.formattedDate());
  $(`[data-station-id='${stationId}'].js-reading-time`)
    .text(latest.formattedTime());
}


/**
 * View class that manages collecting a one-month window of data for a
 * given station and displaying that as a graph
 */
class ReadingsGraphView {
  constructor(station) {
    this.stationRef = station;
    stationMeasures(station.stationId(), {
      since: readingDisplayPeriod(),
      _limit: DEFAULT_LIMIT,
      _sorted: true,
    }).then(_.bind(this.collectMeasures, this));
  }

  collectMeasures(measures) {
    displayLatest(latestMeasure(measures), this.stationRef.stationId());
    const totals = aggregateMeasures(measures);
    const stationId = this.stationRef.stationId();
    const graphOptions = {
      axisX: {
        type: Chartist.FixedScaleAxis,
        divisor: 4,
        labelInterpolationFnc: value => moment(value).format('D MMM'),
      },
      axisY: {
        labelInterpolationFnc: value => `${value.toFixed(1)}`,
      },
      plugins: [
        Chartist.plugins.ctAxisTitle({
          axisY: {
            axisTitle: 'Tide Gauge (m OD)',
            axisClass: 'ct-axis-title',
            offset: {
              x: 0,
              y: 12,
            },
            textAnchor: 'middle',
            flipTitle: true,
          },
          axisX: {},
        }),
      ],
    };
    new Chartist.Bar(`li[data-station-id='${stationId}'] .ct-chart`,
                      { series: createSeries(totals) },
                      graphOptions);
  }
}

export { ReadingsGraphView as default };
