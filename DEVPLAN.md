# Development Plan
## 1. Development / Deployment on Docker
* In order to release changes to the docker environment run: `docker-compose run --rm app /bin/bash -c "npm run build"`
* Start the container using: `docker-compose up --build --detach`
* Stop the container using: `docker-compose stop`

## 2. Resources
* https://github.com/noi-techpark/webcomp-generic-map
* https://github.com/noi-techpark/webcomp-boilerplate
* https://tourism.api.opendatahub.com 
* https://mobility.api.opendatahub.com

## 3. To-Do List
* Copy `webcomp-generic-map` repository
* Fetch current weather for municipalities
* Fetch weather-forecast for municipalities
* Fetch events for municipalities
* Fetch historic weather for municipalities
* Show weather for municipalities on generic map
* Show detailed weather for municipalities (including weather-forecast)
* Show detailed weather for municipalities (including historic weather)
* Show events for municipalities

## 4. Features
* Show current weather by municipality
* Show weather forecast by municipality
* Show Historic weather by municipality
* Show Events by municipality
* Show webcams by municipality?

## 5. Which APIs to use?
TBD
* 
