// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from "axios";
import config from "./config";

export function callTourismGet(path, params) {
	return axios
		.get(config.TOURISM_API_BASE_URL + path, {
			params: params
		})
		.then(function(response) {
			console.log(path,response.data);
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
		})
		.then(response => {
			this.municipalities = response;
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
	})
	.then(response => {
		this.weatherForecasts = response;
	})
	.catch(e => {
		console.error(e)
		throw e;
	});
}

export async function fetchPointsOfInterest(lang, pageNumber, pageSize, latitude, longitude, radius) {
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
		type: 6,
		activitytype: 16,
	})
	.then(response => {
		this.pointsOfInterest = response.Items;
	})
	.catch(e => {
		console.error(e)
		throw e;
	});
}
