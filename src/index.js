// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { MapWidget } from './MapWidget.js';

if (!window.customElements.get('map-widget')) {
  window.customElements.define('map-widget', MapWidget);
}
