import $ from 'jquery';

import SearchController from './controllers/search-controller.es';

require('babel-polyfill');

$(() => new SearchController());
