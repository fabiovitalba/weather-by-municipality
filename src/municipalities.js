// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import captions from "./captions";
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
                <div id="WeatherForecast">
                    <h4>${captions.weatherForecast[this.language]}</h4>
                    <table>
                        <tr>${municipality.weatherForecast.map(f => `<td>${formatDateInLang(f.Date,this.locale)}</td>`).join('')}</tr>
                        <tr>${municipality.weatherForecast.map(f => `<td><img src='${f.WeatherImgUrl}' /></td>`).join('')}</tr>
                        <tr>${municipality.weatherForecast.map(f => `<td>${f.WeatherDesc}</td>`).join('')}</tr>
                    </table>
                </div>
            </div>
        </div>`;

        let popup = L.popup().setContent(popupCont);

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
            await this.fetchPointsOfInterest(this.language, 1, 100, latlng.lat, latlng.lng, 1000, new Date());

            // Redraw POI layer
            this.drawPoiMap();

            // Open the popup
            this.map.openPopup(popup, latlng);
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
