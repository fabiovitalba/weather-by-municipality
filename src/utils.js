// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ODHActivityPoi } from "./api/enums";

export const getStyle = array => array[0][1];

export function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

export function formatDateInLang(dateString, locale = 'en-US') {
    const date = new Date(dateString);

    // Define the month names
    const monthNames = {
        'en': [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        'de': [
            "Januar", "Februar", "März", "April", "Mai", "Juni",
            "Juli", "August", "September", "Oktober", "November", "Dezember"
        ],
        'fr': [
            "janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre"
        ],
        'ru': [
            "январь", "февраль", "март", "апрель", "май", "июнь",
            "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
        ],
        'it': [
            "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
            "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
        ]
    };

    // Get the day of the week and month
    const dayOfWeek = date.toLocaleDateString(locale, { weekday: 'long' });
    const month = monthNames[locale.slice(0,2)][date.getMonth()];

    // Get the year
    const year = date.getFullYear();

    // Form the desired string
    const formattedDateString = `${dayOfWeek}, ${month} ${year}`;

    return formattedDateString;
}

export function dateSeasonValue(date) {
    const month = date.getMonth() + 1; // Adding 1 because getMonth() returns zero-based index
    if (month >= 11 || month <= 3) {
        return ODHActivityPoi.WINTER;
    } else if (month >= 5 && month <= 9) {
        return ODHActivityPoi.SUMMER;
    } else {
        return ODHActivityPoi.WINTER + ODHActivityPoi.SUMMER;
    }
}
