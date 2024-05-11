import { html, LitElement } from 'lit-element';
import L from 'leaflet';
import leaflet_mrkcls from 'leaflet.markercluster';
import style__leaflet from 'leaflet/dist/leaflet.css';
import style__markercluster from 'leaflet.markercluster/dist/MarkerCluster.css';
import style from './scss/main.scss';
import { getStyle } from './utils.js';
import { fetchMunicipalities, fetchWeatherForecasts, fetchPointsOfInterest } from './api/ninjaApi.js';

export class MapWidget extends LitElement {

  /*
  static get properties() {
    return {
      propStationTypes: {
        type: String,
        attribute: 'station-types'
      },
    };
  }
  */

  constructor() {
    super();

    /* Map configuration */
    this.map_center = [46.479, 11.331];
    this.map_zoom = 9;
    this.map_layer = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png";
    this.map_attribution = '<a target="_blank" href="https://opendatahub.com">OpenDataHub.com</a> | &copy; <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a target="_blank" href="https://carto.com/attribution">CARTO</a>';

    /* Internationalization */
    this.language_default = 'en';
    this.language = 'de';

    /* Data fetched from Open Data Hub */
    this.municipalities = [];
    this.weatherForecasts = [];
    this.pointsOfInterest = [];

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

  async drawMap() {
    await this.fetchMunicipalities(1, 100);
    await this.fetchWeatherForecasts(1, 100);
    await this.fetchPointsOfInterest(1, 100);

    this.addWeatherForecastToMunicipality();

    let municipality_markers_list = [];
    let poi_markers_list = [];
    
    this.addMunicipalitiesLayer(municipality_markers_list);
    this.addPointsOfInterestLayer(poi_markers_list);
  }

  addWeatherForecastToMunicipality() {
    this.municipalities = this.municipalities.map(municipality => {
      let weatherForecast = [];

      let apiWeatherForecast = this.weatherForecasts.filter(weatherForecast => weatherForecast.LocationInfo.MunicipalityInfo.Id === municipality.Id);
      //console.log('###DEBUG: municipality',municipality);
      //console.log('###DEBUG: apiWeatherForecast',apiWeatherForecast);
      if ((apiWeatherForecast !== undefined) && (apiWeatherForecast[0] !== undefined)) {
        weatherForecast = apiWeatherForecast[0].ForeCastDaily.filter(dailyForecast => dailyForecast.WeatherDesc !== null);
      }

      return {
        ...municipality,
        weatherForecast: weatherForecast,
      }
    })
  }

  addMunicipalitiesLayer(markers_list) {
    this.municipalities.map(municipality => {
      const pos = [
        municipality.Latitude,
        municipality.Longitude
      ];

      let fillChar = municipality.Id ? 'M' : '&nbsp;';

      let icon = L.divIcon({
        html: '<div class="marker"><div style="background-color: black;">' + fillChar + '</div></div>',
        iconSize: L.point(25, 25)
      });

      /**  Popup Window Content  **/
      let popupCont = '<div class="popup"><h3>' + municipality.Plz + ' ' + municipality.Shortname + '</h3>';
      popupCont += '<h4>Weather Forecast</h4>'
      popupCont += '<table>';
      municipality.weatherForecast.forEach(ForeCastDaily => {
        popupCont += `<tr><td>${ForeCastDaily.Date}</td><td>${ForeCastDaily.WeatherDesc}</td><td><img src='${ForeCastDaily.WeatherImgUrl}' /></td></tr>`
      })
      popupCont += '</table>';
      /*
      //TODO: Add data relative to municipality
      Object.keys(station.smetadata).forEach(key => {
        let value = station.smetadata[key];
        if (value) {
          popupCont += '<tr>';
          popupCont += '<td>' + key + '</td>';
          if (value instanceof Object) {
            let act_value = value[this.language];
            if (typeof act_value === 'undefined') {
              act_value = value[this.language_default];
            }
            if (typeof act_value === 'undefined') {
              act_value = '<pre style="background-color: lightgray">' + JSON.stringify(value, null, 2) + '</pre>';
            }
            popupCont += '<td><div class="popupdiv">' + act_value + '</div></td>';
          } else {
            popupCont += '<td>' + value + '</td>';
          }
          popupCont += '</tr>';
        }
      });
      */
      popupCont += '</div>';

      let popup = L.popup().setContent(popupCont);

      let marker = L.marker(pos, {
        icon: icon,
      }).bindPopup(popup);

      marker.on('click', (e) => {
        //TODO: clear any currently shown POI
        //TODO: fetch POI based on latlong
        //TODO: display new POI on map

        console.log('clicked',e);
        const latlng = e.latlng; // contains .lat and .lng
        console.log(latlng);
      })

      markers_list.push(marker);
    });

    this.visibleMunicipalities = markers_list.length;
    let columns_layer = L.layerGroup(markers_list, {});

    /** Prepare the cluster group for municipality markers */
    this.municipalities_layer_columns = new L.MarkerClusterGroup({
      showCoverageOnHover: false,
      chunkedLoading: true,
      iconCreateFunction: function (cluster) {
        return L.divIcon({
          html: '<div class="marker_cluster__marker">' + cluster.getChildCount() + '</div>',
          iconSize: L.point(36, 36)
        });
      }
    });
    /** Add maker layer in the cluster group */
    this.municipalities_layer_columns.addLayer(columns_layer);
    /** Add the cluster group to the map */
    this.map.addLayer(this.municipalities_layer_columns);
  }

  async firstUpdated() {
    this.initializeMap();
    this.drawMap();
  }

  addPointsOfInterestLayer(markers_list) {
    this.pointsOfInterest.map(pointOfInterest => {
      const pos = [
        pointOfInterest.GpsPoints.position.Latitude,
        pointOfInterest.GpsPoints.position.Longitude
      ];

      let fillChar = pointOfInterest.Id ? 'M' : '&nbsp;';

      let icon = L.divIcon({
        html: '<div class="marker"><div style="background-color: green;">' + fillChar + '</div></div>',
        iconSize: L.point(25, 25)
      });

      /**  Popup Window Content  **/
      let popupCont = '<div class="popup"><h3>' + pointOfInterest.Detail.de.Title + '</h3>';
      //popupCont += '<h4>Weather Forecast</h4>'
      //popupCont += '<table>';
      //pointOfInterest.weatherForecast.forEach(ForeCastDaily => {
      //  popupCont += `<tr><td>${ForeCastDaily.Date}</td><td>${ForeCastDaily.WeatherDesc}</td><td><img src='${ForeCastDaily.WeatherImgUrl}' /></td></tr>`
      //})
      //popupCont += '</table>';
      /*
      //TODO: Add data relative to municipality
      Object.keys(station.smetadata).forEach(key => {
        let value = station.smetadata[key];
        if (value) {
          popupCont += '<tr>';
          popupCont += '<td>' + key + '</td>';
          if (value instanceof Object) {
            let act_value = value[this.language];
            if (typeof act_value === 'undefined') {
              act_value = value[this.language_default];
            }
            if (typeof act_value === 'undefined') {
              act_value = '<pre style="background-color: lightgray">' + JSON.stringify(value, null, 2) + '</pre>';
            }
            popupCont += '<td><div class="popupdiv">' + act_value + '</div></td>';
          } else {
            popupCont += '<td>' + value + '</td>';
          }
          popupCont += '</tr>';
        }
      });
      */
      popupCont += '</div>';

      let popup = L.popup().setContent(popupCont);

      let marker = L.marker(pos, {
        icon: icon,
      }).bindPopup(popup);

      markers_list.push(marker);
    });

    this.visiblePointsOfInterest = markers_list.length;
    let columns_layer = L.layerGroup(markers_list, {});

    /** Prepare the cluster group for points of interest markers */
    this.poi_layer_columns = new L.MarkerClusterGroup({
      showCoverageOnHover: false,
      chunkedLoading: true,
      iconCreateFunction: function (cluster) {
        return L.divIcon({
          html: '<div class="marker_cluster__marker">' + cluster.getChildCount() + '</div>',
          iconSize: L.point(36, 36)
        });
      }
    });
    /** Add maker layer in the cluster group */
    this.poi_layer_columns.addLayer(columns_layer);
    /** Add the cluster group to the map */
    this.map.addLayer(this.poi_layer_columns);
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
