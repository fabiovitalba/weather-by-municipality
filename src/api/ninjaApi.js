// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from "axios";
import config from "./config";
import { dateSeasonValue } from "../utils";
import { ODHActivityPoi } from "./enums";

export function callTourismGet(path, params, debugging) {
    return axios
        .get(config.TOURISM_API_BASE_URL + path, {
            params: params
        })
        .then(function(response) {
            if (debugging === true)
                console.log(path, response.data);
            return response.data;
        })
        .catch(function(error) {
            console.error(error.response);
            throw error;
        });
}

export async function fetchMunicipalities(lang) {
    return callTourismGet("/Municipality/", {
        fields: "Plz,Id,Detail,Region,GpsInfo,Gpstype,Latitude,Longitude,Altitude,Shortname",
        language: lang,
        langfilter: lang,
        distinct: true,
        origin: config.ORIGIN
    }, this.logDebugging)
    .then(response => {
        this.municipalities = response;
    })
    .catch(e => {
        console.error(e)
        throw e;
    });
}

export async function fetchSingleMunicipality(lang, munId) {
    return callTourismGet(`/Municipality/${munId}`, {
        fields: "GpsInfo,Gpstype,Latitude,Longitude,Altitude,Shortname",
        language: lang,
        langfilter: lang,
        distinct: true,
        origin: config.ORIGIN
    }, this.logDebugging)
    .then(response => {
        this.startMunicipality = response;
    })
    .catch(e => {
        console.error(e)
        throw e;
    });
}

export async function fetchWeatherForecasts(lang) {
    return callTourismGet("/Weather/Forecast/", {
        fields: "LocationInfo,ForeCastDaily",
        language: lang,
        langfilter: lang,
        distinct: true,
        origin: config.ORIGIN
    }, this.logDebugging)
    .then(response => {
        this.weatherForecasts = response;
    })
    .catch(e => {
        console.error(e)
        throw e;
    });
}

export async function fetchPointsOfInterest(lang, pageNumber, pageSize, latitude, longitude, radius, date = null) {
    return callTourismGet("/ODHActivityPoi/", {
        fields: "Id,Type,Shortname,Detail,GpsInfo",
        distinct: true,
        origin: config.ORIGIN,
        pagenumber: pageNumber,
        pagesize: pageSize,
        latitude: latitude,
        longitude: longitude,
        radius: radius,
        langfilter: lang,
        type: date ? dateSeasonValue(date) : ODHActivityPoi.ALL,
        activitytype: 16,
    }, this.logDebugging)
    .then(response => {
        this.pointsOfInterest = response.Items;
    })
    .catch(e => {
        console.error(e)
        throw e;
    });
}
