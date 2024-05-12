import { html, LitElement } from 'lit-element';
import L from 'leaflet';
import leaflet_mrkcls from 'leaflet.markercluster';
import style__leaflet from 'leaflet/dist/leaflet.css';
import style__markercluster from 'leaflet.markercluster/dist/MarkerCluster.css';
import style from './scss/main.scss';
import { formatDateInLang, getStyle } from './utils.js';
import { fetchMunicipalities, fetchWeatherForecasts, fetchPointsOfInterest } from './api/ninjaApi.js';

export class MapWidget extends LitElement {
  static get properties() {
    return {
      langAndLocale: {
        type: String,
        attribute: 'lang-and-locale'
      },
      
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
  }

  async initComponent() {
    this.language = this.langAndLocale ? this.langAndLocale.slice(0,2) : this.language_default;
    this.locale = this.langAndLocale;
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

  addWeatherForecastToMunicipality() {
    this.municipalities = this.municipalities.map(municipality => {
      let weatherForecast = [];

      let apiWeatherForecast = this.weatherForecasts
        .filter(weatherForecast => weatherForecast.LocationInfo.MunicipalityInfo.Id === municipality.Id)
        .map(weatherForecast => weatherForecast.ForeCastDaily)[0];
      
      if ((apiWeatherForecast !== undefined) && (apiWeatherForecast.length > 0)) {
        weatherForecast = apiWeatherForecast
          .filter(dailyForecast => dailyForecast.WeatherDesc !== null)
          .filter(dailyForecast => {
            return new Date(dailyForecast.Date) > new Date();
          })
          .slice(0,3);  // Limit to a maximum of 3 Entries
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

      /** Popup Window Content **/
      let popupCont = `
      <div class="popup">
        <div class="popup-header">
          <h3>${municipality.Plz} ${municipality.Shortname}</h3>
        </div>
        <div class="popup-body">
          <div class="tabs">
            <button class="tablinks" data-tab="WeatherForecast">Weather Forecast</button>
            <button class="tablinks" data-tab="Details">Details</button>
          </div>
          <div id="WeatherForecast" class="tabcontent" style="display: block;">
            <h4>Weather Forecast</h4>
            <table>`;
            municipality.weatherForecast.forEach(ForeCastDaily => {
              popupCont += `<tr><td>${ formatDateInLang(ForeCastDaily.Date) }</td><td>${ ForeCastDaily.WeatherDesc }</td><td><img src='${ ForeCastDaily.WeatherImgUrl }' /></td></tr>`;
            });
            popupCont += `</table>
          </div>
          <div id="Details" class="tabcontent" style="display: none;">
            <h4>Details</h4>
            <p>More details here...</p>
          </div>
        </div>
      </div>`;

      let popup = L.popup().setContent(popupCont);

      popup.on('add', () => {
        this.openTab(null, 'WeatherForecast');  // Stellt sicher, dass 'Weather' sofort sichtbar ist
      });

      let marker = L.marker(pos, {
        icon: icon,
      }).bindPopup(popup);

      marker.on('click', async (e) => {
        const latlng = e.latlng;
        if ((this.lastClickedLatLong !== null) && (this.lastClickedLatLong.lat === latlng.lat) && (this.lastClickedLatLong.lng === latlng.lng))
          return; // No action required
        this.lastClickedLatLong = latlng;

        // Clear existing layer of POI
        if (this.poi_layer_columns !== undefined) {
          this.map.removeLayer(this.poi_layer_columns);
        }

        // Fetch POI near selected Lat/Lon
        await this.fetchPointsOfInterest(this.language,1,100,latlng.lat,latlng.lng,1000);

        // Redraw POI layer
        this.drawPoiMap();
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
          html: '<div class="muc_marker_cluster__marker">' + cluster.getChildCount() + '</div>',
          iconSize: L.point(36, 36)
        });
      }
    });

    /** Add maker layer in the cluster group */
    this.municipalities_layer_columns.addLayer(columns_layer);
    /** Add the cluster group to the map */
    this.map.addLayer(this.municipalities_layer_columns);

    // Add Event Listener after a popup is opened
    this.map.on('popupopen', () => {
      this.addPopupTabs();
      this.openTab(null, 'WeatherForecast');  // Automatisch den 'WeatherForecast' Tab öffnen
    });
  }



  async firstUpdated() {
    this.initComponent();
    this.initializeMap();
    this.drawMunicipalitiesMap();
    this.drawPoiMap();

    this.addPopupTabs();
  }

  addPointsOfInterestLayer(markers_list) {
    this.pointsOfInterest.map(pointOfInterest => {
      const pos = [
        pointOfInterest.GpsInfo[0].Latitude,
        pointOfInterest.GpsInfo[0].Longitude
      ];

      let fillChar = pointOfInterest.Id ? 'P' : '&nbsp;';

      let icon = L.divIcon({
        html: '<div class="marker"><div style="background-color: #97be0e;">' + fillChar + '</div></div>',
        iconSize: L.point(25, 25)
      });

      let poiDescription = pointOfInterest.Detail[this.language].BaseText ? pointOfInterest.Detail[this.language].BaseText : pointOfInterest.Detail[this.language].IntroText;
      if ((poiDescription === undefined) || (poiDescription === null))
        poiDescription = pointOfInterest.Detail[this.language].MetaDesc;
      
      /**  Popup Window Content  **/
      let popupCont = '<div class="popup"><h3>' + pointOfInterest.Detail[this.language].Title + '</h3>';
        popupCont += '<p>' + poiDescription + '</p>';
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
          html: '<div class="poi_marker_cluster__marker">' + cluster.getChildCount() + '</div>',
          iconSize: L.point(36, 36)
        });
      }
    });
    /** Add maker layer in the cluster group */
    this.poi_layer_columns.addLayer(columns_layer);
    /** Add the cluster group to the map */
    this.map.addLayer(this.poi_layer_columns);
  }

  // functions for popup tabs
  openTab(evt, tabName) {
    const currentTarget = evt ? evt.currentTarget : this.shadowRoot.querySelector(`.tablinks[data-tab='${tabName}']`);
    const tabcontent = this.shadowRoot.querySelectorAll(".tabcontent");
    tabcontent.forEach(tc => tc.style.display = "none");
    const tablinks = this.shadowRoot.querySelectorAll(".tablinks");
    tablinks.forEach(tl => tl.classList.remove("active"));
    this.shadowRoot.querySelector(`#${tabName}`).style.display = "block";
    currentTarget.classList.add("active");
  }

  // Helper method for adding event listeners to the tab buttons
  addPopupTabs() {
    const buttons = this.shadowRoot.querySelectorAll(".tablinks");
    if (buttons === null)
      return;

    buttons.forEach(button => {
      button.addEventListener('click', (e) => this.openTab(e, button.getAttribute('data-tab')));
    });

    // Activate the first tab by default
    const firstTab = buttons[0];
    if (firstTab) {
      this.openTab({ currentTarget: firstTab }, firstTab.getAttribute('data-tab'));
    }
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
