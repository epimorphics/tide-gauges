/* eslint-disable no-new */

import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import Dygraph from 'dygraphs';
import { stationMeasures, stationAlternative } from '../services/gauge-api.es';
import userPreferences from '../services/user-preferences.es';

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
  const time = moment.utc();
  if (userPreferences.filter && userPreferences.filter !== 30) {
    time.subtract(userPreferences.filter, 'days');
  } else {
    time.subtract(1, 'months');
  }
  return time.format();
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
  constructor() {
    this.stationRef = userPreferences.station;

    if (userPreferences.measure === 'local') {
      stationAlternative(this.stationRef).then((altId) => {
        this.stationRef = altId;
        this.loadData();
      });
    } else {
      this.loadData();
    }
  }

  loadData() {
    stationMeasures(this.stationRef, {
      since: readingDisplayPeriod(),
      _limit: DEFAULT_LIMIT,
      _sorted: true,
    }).then(_.bind(this.collectMeasures, this));
  }

  collectMeasures(measures) {
    displayLatest(latestMeasure(measures), this.stationRef);
    const totals = aggregateMeasures(measures);
    const datumStr = userPreferences.measure === 'local' ? 'm Local Datum' : 'm Ordnance Datum';
    new Dygraph($(`li[data-station-id='${this.stationRef}'] .ct-chart`).css({
      width: 'auto',
    }).get(0),
      totals, {
        fillGraph: true,
        labels: ['date', 'm'],
        xlabel: 'Date',
        ylabel: datumStr,
        sigFigs: 2,
      });
  }
}

export { ReadingsGraphView as default };
