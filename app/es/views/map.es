/* eslint no-param-reassign: ["error", { "props": false }] */

import L from 'leaflet';
import _ from 'lodash';
import $ from 'jquery';
import { stationsCollection } from '../models/stations.es';
import userPreferences from '../services/user-preferences.es';

require('leaflet.markercluster');

/* Support functions */

let selectedMarker;

/* Return the marker for a selected site */
function selectedMarkerIcon() {
  return L.icon({
    iconUrl: 'images/marker-icon-selected.png',
    iconAnchor: [12, 41],
  });
}

/* Return the marker for a site by status */
function markerIconForStatus(selected) {
  return selected ? selectedMarkerIcon() : new L.Icon.Default();
}

/** Notify other components that the selection state has changed */
function triggerSelected(stationId, selected) {
  userPreferences.set('station', selected ? stationId : undefined);
  $('body').trigger('map.selected', [stationId, selected]);
}

/** Select the given marker */
function selectMarker(marker, selected, noTrigger) {
  if (marker.options.selected !== selected) { // If changing state
    marker.options.selected = selected;
    marker.setIcon(markerIconForStatus(selected));
    if (!noTrigger) {
      triggerSelected(marker.options.stationId, selected);
    }
  }
}

function onMarkerClick(e) {
  const marker = e.target;
  if (selectedMarker) { // De-select previous marker
    selectMarker(selectedMarker, false);
  }
  if (selectedMarker !== marker) {
    selectedMarker = marker;
    selectMarker(marker, true);
  } else {
    selectedMarker = null;
    selectMarker(marker, false);
  }
}


class MapView {
  constructor() {
    this.initMap();
    this.addStationMarkers();
    this.initEvents();
  }

  initMap() {
    this.mapRef = L.map('map', {
      maxBounds: [
        [
          47.309034247,
          -13.88671875,
        ],
        [
          62.91523303,
          8.525390625,
        ]],
    }).setView([51.505, -0.09], 13);

    const osmUrl = 'https://env-tile-service.s3.amazonaws.com/{z}/{x}/{y}.png';
    const osmAttrib = "Map data © <a href='//openstreetmap.org'>OpenStreetMap</a> contributors";
    const osm = new L.TileLayer(osmUrl, { minZoom: 5, maxZoom: 10, attribution: osmAttrib });

    // start the map in South-East England
    this.mapRef.setView(new L.LatLng(55.5, -2), 5);
    this.mapRef.addLayer(osm);

    // marker images path
    L.Icon.Default.imagePath = 'images/';
  }

  initEvents() {
    $('body').on('map.selected', _.bind(this.onStationSelected, this));
  }

  addStationMarkers() {
    const createMarkerFn = _.bind(this.createMarkerFor, this);
    const map = this.mapRef;

    stationsCollection().then((stations) => {
      const markersGroup = L.featureGroup();

      _.each(stations, (station) => {
        if (station.locationWgs84().isDefined()) {
          markersGroup.addLayer(createMarkerFn(station));
        }
      });

      map.addLayer(markersGroup);
    }).then(() => {
      if (userPreferences.get('station')) {
        this.onStationSelected(null, userPreferences.get('station'), true);
      }
    });
  }

  createMarkerFor(station) {
    const icon = markerIconForStatus(false);
    const marker = L.marker(station.locationWgs84().asLatLng(), {
      icon,
      title: station.label(),
      stationId: station.notation(),
      selected: false,
    });

    marker.bindTooltip(station.get('label'), {
    //  permanent: true,
    }).openTooltip();

    marker.on('click', _.bind(onMarkerClick, this));
    return marker;
  }

  // events

  /** Ensure that map marker status stays in sync with selection status from other components */
  onStationSelected(event, stationId, selected) {
    const selectMarkerFn = _.bind(selectMarker, this);

    this.mapRef.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        if (layer.options.stationId === stationId) {
          selectMarkerFn(layer, selected, true);
        } else {
          selectMarkerFn(layer, false, true);
        }
      }
    });
  }
}

export { MapView as default };
