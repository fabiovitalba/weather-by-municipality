import { formatDateInLang } from "./utils";

export function addMunicipalitiesLayer(markers_list) {
    this.municipalities.map(municipality => {
        const pos = [
            municipality.Latitude,
            municipality.Longitude
        ];

        let fillChar = municipality.Id ? '🏠' : '&nbsp;';

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
                    popupCont += `<tr>
                        <td>${ formatDateInLang(ForeCastDaily.Date, this.locale) }</td>
                        <td>${ ForeCastDaily.WeatherDesc }</td>
                        <td><img src='${ ForeCastDaily.WeatherImgUrl }' /></td>
                    </tr>`;
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
            await this.fetchPointsOfInterest(this.language,1,100,latlng.lat,latlng.lng,1000,new Date());

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

export function addWeatherForecastToMunicipality() {
    this.municipalities = this.municipalities.map(municipality => {
        let weatherForecast = [];

        let apiWeatherForecast = this.weatherForecasts
            .filter(weatherForecast => weatherForecast.LocationInfo.MunicipalityInfo.Id === municipality.Id)
            .map(weatherForecast => weatherForecast.ForeCastDaily)[0];
        
        if ((apiWeatherForecast !== undefined) && (apiWeatherForecast.length > 0)) {
            const currentDate = new Date();
            // Set the time to midnight (00:00:00)
            currentDate.setHours(0, 0, 0, 0);
            weatherForecast = apiWeatherForecast
                .filter(dailyForecast => dailyForecast.WeatherDesc !== null)
                .filter(dailyForecast => {
                    return new Date(dailyForecast.Date) >= currentDate;
                })
                .slice(0,4);  // Limit to a maximum of 3 Entries
        }

        return {
            ...municipality,
            currentWeather: weatherForecast[0],
            weatherForecast: weatherForecast.slice(1),
        }
    })
}