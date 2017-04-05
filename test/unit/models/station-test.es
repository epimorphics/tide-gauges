/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import Station from '../../../app/es/models/station.es';

const STATION_FIXTURE = {
  '@id': 'http://environment.data.gov.uk/flood-monitoring/id/stations/E72639',
  RLOIid: '3014',
  catchmentName: 'England - South Coast',
  dateOpened: '2012-02-24',
  eaAreaName: 'Anglian - Wessex',
  eaRegionName: 'Anglian',
  easting: 349530,
  gridReference: 'ST 4953 7815',
  label: 'Avonmouth Portbury',
  lat: 51.49999,
  long: -2.728468,
  measures: 'http://environment.data.gov.uk/flood-monitoring/id/measures/E72639-level-tidal_level-Mean-15_min-mAOD',
  northing: 178147,
  notation: 'E72639',
  riverName: 'Tide',
  stageScale: 'http://environment.data.gov.uk/flood-monitoring/id/stations/E72639/stageScale',
  stationReference: 'E72639',
  status: 'http://environment.data.gov.uk/flood-monitoring/def/core/statusActive',
  statusDate: '2015-11-18T12:15:00',
  town: 'Avonmouth',
  type: [
    'http://environment.data.gov.uk/flood-monitoring/def/core/Coastal',
    'http://environment.data.gov.uk/flood-monitoring/def/core/Station',
    'http://environment.data.gov.uk/flood-monitoring/def/core/TideGauge',
  ],
};

describe('Station', () => {
  it('can be created with a JSON object', () => {
    const station = new Station({});
    expect(station).to.not.be.null;
  });

  it('can return the URI of the station', () => {
    const station = new Station(STATION_FIXTURE);
    expect(station.uri()).to.equal(STATION_FIXTURE['@id']);
  });

  it('can return the location of the station given a spatial reference system', () => {
    const station = new Station(STATION_FIXTURE);

    const eastingNorthing = station.location('osgb');
    expect(eastingNorthing.x).to.equal(STATION_FIXTURE.easting);
    expect(eastingNorthing.y).to.equal(STATION_FIXTURE.northing);
    expect(eastingNorthing.srs).to.equal('osgb');

    const longLat = station.location('wgs84');
    expect(longLat.x).to.be.closeTo(STATION_FIXTURE.long, 0.001);
    expect(longLat.y).to.be.closeTo(STATION_FIXTURE.lat, 0.0001);
    expect(longLat.srs).to.equal('wgs84');
  });

  it('should return the label if defined', () => {
    const station = new Station(STATION_FIXTURE);
    expect(station.label()).to.equal(STATION_FIXTURE.label);
  });

  it('should return an empty string if the label is not defined', () => {
    const station = new Station({});
    expect(station.label()).to.equal('');
  });

  it('should return the river name if defined', () => {
    const station = new Station({ riverName: 'Cuckmere' });
    expect(station.riverName()).to.equal('Cuckmere');
  });

  it('should return an empty string if the river name is not defined', () => {
    const station = new Station({});
    expect(station.riverName()).to.equal('');
  });

  it('should return the catchment name if defined', () => {
    const station = new Station({ catchmentName: 'Cuckmere and Pevensey Levels' });
    expect(station.catchmentName()).to.equal('Cuckmere and Pevensey Levels');
  });

  it('should return an empty string if the catchment name is not defined', () => {
    const station = new Station({});
    expect(station.catchmentName()).to.equal('');
  });

  it('should return the station ID via the notation method', () => {
    const station = new Station({ notation: 'E1234' });
    expect(station.notation()).to.equal('E1234');
  });

  it('should return the status of the station', () => {
    const station = new Station({ status: 'active' });
    expect(station.status()).to.equal('active');
  });

  it('should return null if the status of the station is not known', () => {
    const station = new Station({});
    expect(station.status()).to.be.null;
  });

  it('should allow json paths to be evaluated', () => {
    const station = new Station({ measures: [{ period: 900 }] });
    expect(station.get('measures[0].period')).to.equal(900);
  });
});
