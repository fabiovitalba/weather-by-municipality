// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from "axios";
import config from "./config";

export function callMobilityGet(path, params) {
	console.log("call = " + config.MOBILITY_API_BASE_URL + path);
	console.log("call params = ");
	console.log(params);
	return axios
		.get(config.MOBILITY_API_BASE_URL + path, {
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

export async function fetchWeatherForecasts(pageNumber, pageSize) {
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

export async function fetchPointsOfInterest(pageNumber, pageSize, latitude, longitude, radius) {
	console.log(pageNumber,pageSize)
	//TODO: retrieve only data that is relevant
	return callTourismGet("/ODHActivityPoi/", {
		fields: "Id,Type,Shortname,Detail.de.Title,GpsInfo",
		origin: config.ORIGIN,
		pagenumber: pageNumber,
		pagesize: pageSize,
		latitude: latitude,
		longitude: longitude,
		radius: radius,
		type: 6,
		activitytype: 16,
	})
	.then(response => {
		this.pointsOfInterest = response.Items;
	})
	.catch(e => {
		console.log(e)
		throw e;
	});
}

/*
export async function fetchStations(type) {
	console.log(type)
	return callMobilityGet("/flat/" + (type || '*'), {
			limit: -1,
			select: "scode,stype,sname,sorigin,scoordinate,smetadata,pcode",
			where: "scoordinate.neq.null,sactive.eq.true",
			distinct: true,
			origin: config.ORIGIN
		})
		.then(response => {
			this.stations = response.data;
		})
		.catch(e => {
			console.log(e)
			throw e;
		});
}
*/
