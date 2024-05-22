// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { html } from 'lit-element';
import captions from "./captions";
import { getWeekdayInLang } from "./utils";

const munPopupContainer = (municipality, locale, language, day1, day2, day3) => {
    return html`
        <div class="popup">
            <div class="popup-header">
                <h3>${municipality.Plz} ${municipality.Shortname}</h3>
            </div>
            <div class="popup-body">
                ${munPopupTabs(municipality, locale, language, day1, day2, day3)}
            </div>
        </div>`;
}

const munPopupTabs = (municipality, locale, language, day1, day2, day3) => {
    const tabIds = ["daily_forecast","hourly_forecast_day_1","hourly_forecast_day_2","hourly_forecast_day_3"];

    return html`
        <div class="popup-body">
            <div class="tabs">
                <button class="tablinks" data-tab=${tabIds[0]}>${captions.weatherForecast[language]}</button>
                <button class="tablinks" data-tab=${tabIds[1]}>${getWeekdayInLang(day1, locale)}</button>
                <button class="tablinks" data-tab=${tabIds[2]}>${getWeekdayInLang(day2, locale)}</button>
                <button class="tablinks" data-tab=${tabIds[3]}>${getWeekdayInLang(day3, locale)}</button>
            </div>
            ${dailyForecastTabContent(tabIds[0], municipality.weatherForecast, locale, language)}
            ${hourlyForecastTabContent(tabIds[1], day1, municipality.hourlyForecast, locale, language)}
            ${hourlyForecastTabContent(tabIds[2], day2, municipality.hourlyForecast, locale, language)}
            ${hourlyForecastTabContent(tabIds[3], day3, municipality.hourlyForecast, locale, language)}
        </div>`;
}

const dailyForecastTabContent = (tabId, dailyForecast, locale, language) => {
    return html`
        <div id=${tabId} class="tabcontent active">
            <table>    
            ${dailyForecast.map(f => html`
                <tr>
                    <td>${getWeekdayInLang(f.Date, locale)}</td>
                    <td><img src=${f.WeatherImgUrl} /></td>
                    <td>${f.WeatherDesc}</td>
                </tr>
            `)}
            </table>
        </div>`;
}

const hourlyForecastTabContent = (tabId, date, hourlyForecast, locale, language) => {
    return html`
        <div id=${tabId} class="tabcontent">
            <div class="forecast">
                <div class="forecast-header">
                    <span>${captions.time[language]}</span><span>${captions.temperature[language]}</span><span>${captions.precipitationProb[language]}</span>
                </div>
                ${hourlyForecast
                    .filter(f => new Date(f.Date).toLocaleDateString(locale) === date.toLocaleDateString(locale))
                    .map(f => hourlyForecastRow(f, locale))}
            </div>
        </div>`;
}

const hourlyForecastRow = (forecast, locale) => {
    return html`
        <div class="forecast-row">
            <span>${new Date(forecast.Date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
            <span>${forecast.Temperature}°C</span>
            <span>${forecast.PrecipitationProbability}%</span>
        </div>`;
}

export const munPopupBuilder = (locale, language, municipality,) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    const dayAfterDayAfterTomorrow = new Date(today);
    dayAfterDayAfterTomorrow.setDate(today.getDate() + 3);

    return html`${munPopupContainer(municipality, locale, language, tomorrow, dayAfterTomorrow, dayAfterDayAfterTomorrow)}`;
}