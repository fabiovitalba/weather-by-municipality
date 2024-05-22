// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export function addPointsOfInterestLayer(markers_list) {
    this.pointsOfInterest.map(pointOfInterest => {
        const pos = [
            pointOfInterest.GpsInfo[0].Latitude,
            pointOfInterest.GpsInfo[0].Longitude
        ];

        let fillChar = pointOfInterest.Id ? '👣' : '&nbsp;';

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
