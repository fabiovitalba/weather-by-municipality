// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from "axios";
import config from "./config";

export function callTourismGet(path, params) {
	console.log("call = " + config.TOURISM_API_BASE_URL + path);
	console.log("call params = ");
	console.log(params);
	return axios
		.get(config.TOURISM_API_BASE_URL + path, {
			params: params
		})
		.then(function(response) {
			console.log("call response = ");
			console.log(response.data);
			console.log(response.config);
			return response.data;
		})
		.catch(function(error) {
			console.log(error.response);
			throw error;
		});
}

export async function fetchMunicipalities(pageNumber, pageSize) {
	console.log(pageNumber,pageSize)
	//TODO: retrieve only data that is relevant
	return callTourismGet("/Municipality/", {
		limit: -1,
		select: "Plz,Id,Detail,Region,GpsInfo,Gpstype,Latitude,Longitude,Altitude",
		where: "odhactive.eq.true,active.eq.true",
		distinct: true,
		origin: config.ORIGIN
	})
	.then(response => {
		this.municipalities = response;
	})
	.catch(e => {
		console.log(e)
		throw e;
	});
}

export async function fetchWeatherForecast(pageNumber, pageSize) {
	console.log(pageNumber,pageSize)
	//TODO: retrieve only data that is relevant
	return callTourismGet("/Weather/Forecast/", {
		limit: -1,
		select: "",
		where: "odhactive.eq.true,active.eq.true",
		distinct: true,
		origin: config.ORIGIN
	})
	.then(response => {
		this.weatherForecasts = response;
	})
	.catch(e => {
		console.log(e)
		throw e;
	});
}

/*export async function fetchWeatherForecast(pageNumber, pageSize) {
    console.log(pageNumber, pageSize);
    // Verwenden korrekter Parameter für Paging und spezifische Auswahl
    return callTourismGet("/Forecast/", {
        limit: pageSize,  // Verwendung von pageSize statt -1
        offset: (pageNumber - 1) * pageSize, // Berechnet den Offset basierend auf der Seitennummer
        select: "Shortname,Latitude,Longitude,Altitude,ForeCastDaily,Forecast3HoursInterval",
        where: "odhactive.eq.true,active.eq.true",
        distinct: true,
        origin: config.ORIGIN
    })
    .then(response => {
        this.forecast = response;
        return response; // Geben Sie die Antwort zurück, falls weitere Verarbeitung erforderlich ist
    })
    .catch(e => {
        console.log(e);
        throw e;
    });
}

export async function fetchWeatherForecast(pageNumber, pageSize) {
    console.log(pageNumber, pageSize);
    // Anpassung der Parameter gemäß der API-Dokumentation
    return callTourismGet("/Forecast/", {
        pagenumber: pageNumber, // korrekter Parameter für die Seitennummer
        pagesize: pageSize,     // korrekter Parameter für die Seitengröße
        locfilter: '',          // optional, setze einen Wert, wenn nötig
        language: 'en',         // Setzt die Sprache, wenn nötig
        fields: ['Shortname', 'Latitude', 'Longitude', 'Altitude'], // Felder, die zurückgegeben werden sollen
    })
    .then(response => {
        this.forecast = response;
        return response; // Geben Sie die Antwort zurück, falls weitere Verarbeitung erforderlich ist
    })
    .catch(e => {
        console.log(e);
        throw e;
    });
}*/