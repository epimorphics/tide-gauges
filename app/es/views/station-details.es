import $ from 'jquery';
import _ from 'lodash';
import { stationWithId } from '../models/stations.es';
import GraphView from './readings-graph.es';
import userPreferences from '../services/user-preferences.es';
import { stationAlternative } from '../services/gauge-api.es';

/* Support functions */

function removeAllStationDetails() {
  $('.c-station-detail').remove();
}

function stationSummary(station) {
  const buf = [
    "<ul class='c-station-detail--summary-list'>",
  ];

  buf.push(`<li>Station ID: ${station.stationId()}</li>`);

  if (station.status()) {
    buf.push(`<li>Status: ${station.status()}</li>`);
  }

  const location = station.location('wgs84');
  if (location.isDefined()) {
    buf.push(`<li>Lat, long: ${location.y.toFixed(2)}, ${location.x.toFixed(2)}</li>`);
  }

  if (station.get('gridReference')) {
    buf.push(`<li>Grid ref: ${station.get('gridReference')}</li>`);
  }

  buf.push('</ul>');
  return buf.join('\n');
}

function stationLatestReading(station) {
  const idRef = `data-station-id='${station.stationId()}' `;

  return `<h4 class='c-station-latest-reading--heading'>Latest reading</h4>
    <ul class='c-station-latest-reading--list'>
    <li>date: <span class='js-reading-date' ${idRef}></span></li>
    <li>time: <span class='js-reading-time' ${idRef}></span></li>
    <li>Measurement (m): <span class='js-reading-value' ${idRef}></span></li>
    </ul>`;
}

function optionSelected(val, expected) {
  return val === expected ? 'selected' : '';
}

function stationDescription(station) {
  const dsi = `data-station-id='${station.stationId()}'`;
  const dsn = `data-station-name='${station.label()}'`;
  const label = station.label();
  const summary = stationSummary(station);
  const latestReadings = stationLatestReading(station);

  return `<div class='row'>
      <div class='col-sm-12'>
        <div class='pull-right'>
          <select class="c-data-filter">
            <option value="30" ${optionSelected(userPreferences.get('filter'), '30')}>30 Days</option>
            <option value="7" ${optionSelected(userPreferences.get('filter'), '7')}>7 Days</option>
            <option value="1" ${optionSelected(userPreferences.get('filter'), '1')}>1 Day</option>
          </select>
          <select class="c-data-measure">
            <option value="ordnance" ${optionSelected(userPreferences.get('measure'), 'ordnance')}>Ordnance Datum</option>
            <option value="local" ${optionSelected(userPreferences.get('measure'), 'local')}>Local Datum</option>
          </select>
        </div>
        <h3 class='c-station-detail--title'>${label}
          <button type="button" class="c-api-details-btn js-action-show-api-details" ${dsi} ${dsn}>get the data</button>
        </h3>
      </div>
      <div class='col-sm-12'>
        <div class='row'>
          <div class='col-sm-6'>
            ${summary}
          </div>
          <div class='col-sm-6'>
            ${latestReadings}
          </div>
        </div>
      </div>
      <div class='col-sm-12'>
        <div class='c-readings-graph ct-chart ct-double-octave' ${dsi}></div>
      </div>
    </div>`;
}


function showOrHidePrompt() {
  const hidePrompt = ($('.c-station-detail').length > 0);
  $('.o-station-details--list__default-message').toggleClass('hidden', hidePrompt);
}

function onChangeMeasure(e) {
  // Find new station ID based on this
  userPreferences.set('measure', e.target.value);
  $('body').trigger('map.selected', [userPreferences.get('station'), true]);
}

function onChangeFilter(e) {
  userPreferences.set('filter', e.target.value);
  $('body').trigger('map.selected', [userPreferences.get('station'), true]);
}

/**
 * A view that maintains a list of the selected stations shown with details */
class StationDetailsView {
  constructor() {
    this.initEvents();
    if (userPreferences.get('station')) {
      this.onStationSelected(null, userPreferences.get('station'), true);
    }
  }

  initEvents() {
    $('body').on('map.selected', _.bind(this.onStationSelected, this));
    // Set measure type
    $('body').on('change', '.c-data-measure', onChangeMeasure);
    $('body').on('change', '.c-data-filter', onChangeFilter);
  }

  onStationSelected(event, stationId, selected) {
    removeAllStationDetails();
    // Get correct station ID internally
    if (!selected) {
      showOrHidePrompt();
      return;
    }

    if (userPreferences.get('measure') === 'local') {
      stationAlternative(stationId).then((altId) => {
        this.dataStationRef = altId;
        this.loadData(this.dataStationRef);
      });
    } else {
      this.loadData(stationId);
    }
  }

  loadData(stationId) {
    stationWithId(stationId).then((station) => {
      this.showStationDetails(station);
      showOrHidePrompt();
    });
  }

  showStationDetails(station) {
    const stationDesc = stationDescription(station);
    const elem =
      `<li class='c-station-detail' data-station-id='${station.notation()}'>${stationDesc}</li>`;
    this.ui().stationDetailsList.append(elem);

    return new GraphView(station);
  }

  ui() {
    if (!this.uiRef) {
      this.uiRef = {
        stationDetails: $('.o-station-details'),
        stationDetailsHeading: $('.o-station-details--heading'),
        stationDetailsList: $('.o-station-details--list'),
      };
    }

    return this.uiRef;
  }
}

export { StationDetailsView as default };
