<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: CC0-1.0
-->

# day-trip-planner
This project is a webcomponent to display weather by municipality and hiking trails for the selected municipality.
We started using the [webcomp-generic-map](https://github.com/noi-techpark/webcomp-generic-map) component provided by NOI Techpark and the [Open Data
Hub](https://opendatahub.com).

Our idea was to provide a simple webcomponent that can be used by hotels, bed and breakfasts and other tourism platforms. The component should help tourists (or locals) find hiking trails in the vicinity with information about the weather, to know if they can plan for a trail.

## Table of contents

- [Usage](#usage)
- [Gettings started](#getting-started)
- [Deployment](#deployment)
- [Docker environment](#docker-environment)
- [Information](#information)

## Usage

Include the Javascript file `dist/day_trip_map_widget.min.js` in your HTML and define the web component like this:

```html
<day-trip-map-widget lang-and-locale="de-DE" log-info></day-trip-map-widget>
```

### Attributes

#### lang-and-locale

Type: multiselect
Options: "en-US", "en-UK", "de-DE", "de-AT", "de-CH", "it-IT", "it-CH"
Default: "en-US"

#### log-info

Type: boolean
Options: true, false
Default: false
_Simply omit this attribute if you do not wish to see any logs in the console._

## Getting started

These instructions will get you a copy of the project up and running
on your local machine for development and testing purposes.

### Prerequisites

To build the project, the following prerequisites must be met:

- Node 12 / NPM 8.1.2

For a ready to use Docker environment with all prerequisites already installed and prepared, you can check out the [Docker environment](#docker-environment) section.

### Source code

Get a copy of the repository:

```bash
git clone https://github.com/fabiovitalba/weather-by-municipality.git
```

Change directory:

```bash
cd weather-by-municipality/
```

### Dependencies

Download all dependencies:

```bash
npm install
```

### Build

Build and start the project:

```bash
npm run watch
```

The application will be served and can be accessed at [http://localhost:8080](http://localhost:8080).

## Deployment

To create the distributable files, execute the following command:

```bash
npm run build
```

## Docker environment

For the project a Docker environment is already prepared and ready to use with all necessary prerequisites.

These Docker containers are the same as used by the continuous integration servers.

### Installation

Install [Docker](https://docs.docker.com/install/) (with Docker Compose) locally on your machine.

### Dependenices

First, install all dependencies:

```bash
docker-compose run --rm app /bin/bash -c "npm install"
```

### Start and stop the containers

Before start working you have to start the Docker containers:

```
docker-compose up --build --detach
```

After finished working you can stop the Docker containers:

```
docker-compose stop
```

### Running commands inside the container

When the containers are running, you can execute any command inside the environment. Just replace the dots `...` in the following example with the command you wish to execute:

```bash
docker-compose run --rm app /bin/bash -c "..."
```

Some examples are:

```bash
docker-compose run --rm app /bin/bash -c "npm run build"
```

## Information

### Support

For support, please contact [info@opendatahub.com](mailto:info@opendatahub.com).

### Contributing

If you'd like to contribute, please follow the following instructions:

- Fork the repository.

- Checkout a topic branch from the `development` branch.

- Make sure the tests are passing.

- Create a pull request against the `development` branch.

A more detailed description can be found here: [https://github.com/noi-techpark/documentation/blob/master/contributors.md](https://github.com/noi-techpark/documentation/blob/master/contributors.md).

### Boilerplate

The project uses this boilerplate: [https://github.com/noi-techpark/webcomp-boilerplate](https://github.com/noi-techpark/webcomp-boilerplate).

### License

The code in this project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3 license. See the [LICENSE.md](LICENSE.md) file for more information.

### REUSE

This project is [REUSE](https://reuse.software) compliant, more information about the usage of REUSE in NOI Techpark repositories can be found [here](https://github.com/noi-techpark/odh-docs/wiki/Guidelines-for-developers-and-licenses#guidelines-for-contributors-and-new-developers).

Since the CI for this project checks for REUSE compliance you might find it useful to use a pre-commit hook checking for REUSE compliance locally. The [pre-commit-config](.pre-commit-config.yaml) file in the repository root is already configured to check for REUSE compliance with help of the [pre-commit](https://pre-commit.com) tool.

Install the tool by running:
```bash
pip install pre-commit
```
Then install the pre-commit hook via the config file by running:
```bash
pre-commit install
```

