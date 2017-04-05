import { matchStations } from '../models/stations.es';
import lookupPostcode from '../services/postcodes-api.es';
import { allStations } from '../services/gauge-api.es';
import userPreferences from '../services/user-preferences.es';

const $ = require('jquery');
const _ = require('lodash');

/** Minimum number of characters in a search string */
const MIN_SEARCH_LENGTH = 2;

/** Maximum number of results to show by default */
const MAX_RESULTS = 20;

/** Nearness of location search results to a point, in km */
const LOCATION_SEARCH_KM = 10;

/** API call promise. Cancel to start afresh **/
let apiPromise;

/* Support functions */

/** Notify other components that the selection state has changed */
function triggerSelected(stationId, selected) {
  $('body').trigger('map.selected', [stationId, selected]);
}


/**
 * A view which listens to user inputs, and matches stations by name or
 * by location (expressed as a postcode)
 */
class SearchView {

  constructor() {
    this.initEvents();
  }

  /**
   * Bind UI affordances to actions in this view
   */
  initEvents() {
    const onSearchBound = _.bind(this.onSearch, this);
    const onChangeSelected = _.bind(this.onChangeSelected, this);

    this.ui().searchField.on('keyup', onSearchBound);
    this.ui().searchActionButton.on('click', (e) => {
      e.preventDefault();
      onSearchBound();
    });
    this.ui().searchResults.on('click', '.o-search-results--result a', onChangeSelected);
    this.ui().searchResults.on('click', '.js-action-show-all', (e) => {
      e.preventDefault();
      onSearchBound(e, true);
    });

    $('body').on('map.selected', _.bind(this.onStationSelected, this));
  }

  /**
   * User has typed into search box
   */
  onSearch(e, all) {
    const searchStr = this.ui().searchField.val();
    this.searchBy(searchStr, all);
  }

  /**
   * User has changed the selected status of a station
   */
  onChangeSelected(e) {
    e.preventDefault();
    e.stopPropagation();

    this.clearCurrentSearchResults();
    this.ui().searchField.val('');

    const elem = $(e.currentTarget);
    const stationId = String(elem.parents('[data-notation]').data('notation'));
    const selected = true;

    userPreferences.station = stationId;

    triggerSelected(stationId, selected);
  }

  /**
   * Search for a term against station names first, then
   * as a postcode.
   * @param {String} The search string to match against
   * @param {Boolean} If true, show all results
   */
  searchBy(searchStr, all) {
    if (apiPromise) { apiPromise.cancel(); }
    if (searchStr !== '' && searchStr.length >= MIN_SEARCH_LENGTH) {
      apiPromise = matchStations({ label: searchStr }).then((results) => {
        if (results.length > 0) {
          this.summariseSearchResults(results);
          this.showCurrentSearchResults(results, all);
        } else {
          this.postcodeSearch(searchStr);
        }
      });
    } else {
      this.clearCurrentSearchResults();
    }
  }

  /**
   * Search string has not matched a station name, so try it as a postcode
   * instead.
   * @param {String} search string that does not match any station names
   */
  postcodeSearch(searchStr) {
    if (apiPromise) { apiPromise.cancel(); }
    apiPromise = lookupPostcode(searchStr).then((result) => {
      if (result) {
        this.searchByLocation(result.latitude, result.longitude);
      } else {
        this.summariseSearchResults([]);
        this.ui().searchResults.removeClass('hidden');
      }
    }, () => {
      this.summariseSearchResults([]);
    });
  }

  searchByLocation(lat, lng) {
    allStations({
      lat,
      long: lng,
      dist: LOCATION_SEARCH_KM,
    }).then((results) => {
      this.summariseSearchResults(results, true);
      this.showCurrentSearchResults(results);
    });
  }

  /**
   * Remove all of the current search results
   */
  clearCurrentSearchResults() {
    this.ui().searchResults.addClass('hidden');
    this.ui().searchResultsList.empty();
  }

  /**
   * Display a list of current search results
   */
  showCurrentSearchResults(results, all) {
    const list = this.ui().searchResultsList;
    const formatResult = _.bind(this.presentResult, this);
    const limit = all ? results.length : MAX_RESULTS;
    const sortedResults = _.sortBy(results, result => result.label());
    const displayedResults = _.slice(sortedResults, 0, limit);
    const remainder = results.length - displayedResults.length;

    _.each(displayedResults, result => list.append(formatResult(result)));

    if (remainder > 0) {
      list.append(`<li class='o-search-results--expand'>${remainder} more ... <a href='#' class='js-action-show-all'>show all</a></li>`);
    }

    this.ui().searchResults.removeClass('hidden');
  }

  /**
   * Summarise the number of results found
   */
  summariseSearchResults(results, distanceSearch) {
    this.clearCurrentSearchResults();

    const summary = this.ui().searchResultsSummary;
    const location = distanceSearch ?
      ` near to ${this.ui().searchField.val().toLocaleUpperCase()}` :
      '';
    const resultType = distanceSearch ? ['location', 'locations'] : ['match', 'matches'];

    switch (results.length) {
      case 0:
        summary.html('No matches.');
        break;
      case 1:
        summary.html(`Found one ${resultType[0]}${location}.`);
        break;
      default:
        summary.html(`Found ${results.length} ${resultType[1]}${location}`);
    }
  }

  /** @return A formatted search result */
  presentResult(result) {
    return `<li class='o-search-results--result' data-notation='${result.notation()}'>` +
           `<a href="#">${result.label()}</a></li>\n`;
  }

  /**
   * Lazily initialise and return an object containing the UI elements
   * for this view
   * @return An object with a member for each UI element
   */
  ui() {
    if (!this.uiRef) {
      this.uiRef = {
        searchField: $('#searchField'),
        searchResults: $('.o-search-results'),
        searchResultsHeading: $('.o-search-results--heading'),
        searchResultsList: $('.o-search-results--list'),
        searchResultsSummary: $('.o-search-results--summary'),
        searchActionButton: $('.js-action-search'),
      };
    }

    return this.uiRef;
  }

  // events

  /** Ensure that checkbox state stays in sync with changes to selected state */
  onStationSelected(event, stationId, selected) {
    $(`[data-notation=${stationId}] input`).prop('checked', selected);
  }
}

export { SearchView as default };
