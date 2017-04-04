/* eslint-disable no-new */

import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import Dygraph from 'dygraphs';
import { stationMeasures } from '../services/gauge-api.es';

const DEFAULT_LIMIT = 3000; // 2976 for a month of results. 4 (hour) * 24 (day) * 31

/* Utility function to aggregate to group measures together */
function aggregateMeasures(measures) {
  return _.map(measures, measureGroups => [measureGroups.jsDate(), measureGroups.value()]).reverse();
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
    new Dygraph($(`li[data-station-id='${stationId}'] .ct-chart`).css({
      width: 'auto',
    }).get(0),
      totals, {
        fillGraph: true,
        labels: ['date', 'm'],
        xlabel: 'Date',
        ylabel: 'mOD',
      });
  }
}

export { ReadingsGraphView as default };
