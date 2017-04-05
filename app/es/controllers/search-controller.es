import SearchView from '../views/search.es';
import MapView from '../views/map.es';
import StationDetailsView from '../views/station-details.es';
import ApiDetailsView from '../views/api-details.es';
import userPreferences from '../services/user-preferences.es';

/** Simple controller for displaying search/filter results */
class SearchController {
  constructor() {
    this.views = {
      searchView: new SearchView(userPreferences.selected),
      mapView: new MapView(userPreferences.station),
      detailsView: new StationDetailsView(),
      apiDetailsView: new ApiDetailsView(),
    };
  }
}

export { SearchController as default };
