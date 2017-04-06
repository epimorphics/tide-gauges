import queryString from 'query-string';
import $ from 'jquery';
import _ from 'lodash';

/** The singleton instance of the preference model */
let currentPreferenceModel = null;

/* Support functions */

/** Encapsulates the user's current search prefernce, which can also be
 *  instantiated from URL parameters
 */
class UserPreferences {
  /** @return The current user preferences singleton. If not yet initialised,
   *  create a new one with the optional parameters.
   *  @param params Optional parameters to instantiate user preferences
   */
  static currentPreference(params) {
    if (!currentPreferenceModel) {
      currentPreferenceModel = new UserPreferences(params);
    }
    return currentPreferenceModel;
  }

  /**
   * @param params If defined, use the `.location.hash` property as the source
   * to parse the current state. If not defined, use `window.location.search`.
   */
  constructor(params) {
    this.preferences = queryString.parse((params || window).location.hash);
    this.initialiseValues();
    this.bindEvents();
  }

  /* eslint-disable class-methods-use-this */
  /**
   * Listen to changes in the fields representing model values
   */
  bindEvents() {
  }

  get(param) {
    return this.preferences[param];
  }

  set(param, val) {
    this.preferences[param] = val;

    const stringified = queryString.stringify(this.preferences);
    location.hash = stringified;
  }

  /**
   * Set initial field values based on the model contents
   */
  initialiseValues() {
    _.forEach(this.preferences, (value, key) => {
      if (value && value !== '') {
        $(`[name=${key}]`).val(value);
      }
    });
  }
}

const rtn = UserPreferences.currentPreference();
window.prefs = rtn;

export { rtn as default };
