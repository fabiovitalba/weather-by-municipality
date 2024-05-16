// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ODHActivityPoi } from "./api/enums";

export const getStyle = array => array[0][1];

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
