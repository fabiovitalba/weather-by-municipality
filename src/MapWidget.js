// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { html, LitElement } from 'lit-element';
import L from 'leaflet';
import leaflet_mrkcls from 'leaflet.markercluster';
import style__leaflet from 'leaflet/dist/leaflet.css';
import style__markercluster from 'leaflet.markercluster/dist/MarkerCluster.css';
import style from './scss/main.scss';
import { getStyle } from './utils.js';
import { fetchMunicipalities, fetchWeatherForecasts, fetchPointsOfInterest } from './api/ninjaApi.js';
import { addPointsOfInterestLayer } from './pointsOfInterest.js';
import { addMunicipalitiesLayer, addWeatherForecastToMunicipality } from './municipalities.js';

export class MapWidget extends LitElement {
  static get properties() {
    return {
      langAndLocale: {
        type: String,
        attribute: 'lang-and-locale'
      },
      logInfo: {
        type: Boolean,
        attribute: 'log-info'
      }
    };
  }

  constructor() {
    super();

    /* Map configuration */
    this.map_center = [46.479, 11.331];
    this.map_zoom = 10;
    this.map_layer = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png";
    this.map_attribution = '<a target="_blank" href="https://opendatahub.com">OpenDataHub.com</a> | &copy; <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a target="_blank" href="https://carto.com/attribution">CARTO</a>';

    /* Internationalization */
    this.language_default = 'en';
    this.language = this.language_default;
    this.locale_default = 'en-US';
    this.locale = this.locale_default;

    /* Debugging Info */
    this.logDebugging = false;

    /* Data fetched from Open Data Hub */
    this.municipalities = [];
    this.weatherForecasts = [];
    this.pointsOfInterest = [];
    this.lastClickedLatLong = null;

    this.colors = [
      "green",
      "blue",
      "red",
      "orange"
    ];

    /* Requests */
    this.fetchMunicipalities = fetchMunicipalities.bind(this);
    this.fetchWeatherForecasts = fetchWeatherForecasts.bind(this);
    this.fetchPointsOfInterest = fetchPointsOfInterest.bind(this);

    /* Map Layers */
    this.addMunicipalitiesLayer = addMunicipalitiesLayer.bind(this);
    this.addPointsOfInterestLayer = addPointsOfInterestLayer.bind(this);

    /* Data manipulation */
    this.addWeatherForecastToMunicipality = addWeatherForecastToMunicipality.bind(this);
  }

  async initComponent() {
    this.language = this.langAndLocale ? this.langAndLocale.slice(0,2) : this.language_default;
    this.locale = this.langAndLocale;
    this.logDebugging = this.logInfo ? this.logInfo : false;
  }

  async initializeMap() {
    let root = this.shadowRoot;
    let mapref = root.getElementById('map');

    this.map = L.map(mapref, {
      zoomControl: false
    }).setView(this.map_center, this.map_zoom);

    L.tileLayer(this.map_layer, {
      attribution: this.map_attribution
    }).addTo(this.map);
  }

  async drawMunicipalitiesMap() {
    if (this.municipalities.length === 0) {
      await this.fetchMunicipalities(this.language);
      await this.fetchWeatherForecasts(this.language);

      this.addWeatherForecastToMunicipality();
    }

    let municipality_markers_list = [];

    this.addMunicipalitiesLayer(municipality_markers_list);
  }

  async drawPoiMap() {
    let poi_markers_list = [];
    if (this.pointsOfInterest.length > 0)
      this.addPointsOfInterestLayer(poi_markers_list);
  }

  async firstUpdated() {
    this.initComponent();
    this.initializeMap();
    this.drawMunicipalitiesMap();
    this.drawPoiMap();
  }

  render() {
    return html`
      <style>
        ${getStyle(style__markercluster)}
        ${getStyle(style__leaflet)}
        ${getStyle(style)}
      </style>
      <div id="map_widget">
        <div id="map" class="map"></div>
      </div>
    `;
  }
}
