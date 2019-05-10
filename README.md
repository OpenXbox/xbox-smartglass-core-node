# Xbox-Smartglass-Core-Node
[![Build Status](https://travis-ci.org/unknownskl/xbox-smartglass-core-node.svg?branch=release/0.4.1)](https://travis-ci.org/unknownskl/xbox-smartglass-core-node)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=alert_status&branch=release/0.4.1)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=alert_status)
[![Technical debt](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=sqale_index&branch=release/0.4.1)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=sqale_index)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=bugs&branch=release/0.4.1)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=bugs)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=coverage&branch=release/0.4.1)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=coverage)

NodeJS smartglass library for controlling a Xbox

## Dependencies

- NPM
- Python 2
- `pip install cryptography`

## How to install

`npm install xbox-smartglass-core-node --save`

## How to use

See the [examples](examples) folder for examples

## Known Issues

- Broadcasting does not work properly yet.
- Callback when sending a power_on command always returns true for now.
- Protocol can be broken sometimes.

## Changelog

0.4.1

    - TBD

0.4.0

    - Implemented events in the smartglass client
    - Refactored smartglass class
    - Booting a device will now check if a boot was successfully
    - Fixed docker image
    - Improved discovery callback

0.3.3

    - Improved timeout handling
    - Added `_on_timeout()` callback

0.3.2

    - Fixed discovery on network
    - Added disconnect function (See [examples/connect_and_disconnect.js](examples/connect_and_disconnect.js))

0.3.1

    - Added debug options using DEBUG=smartglass:*

0.3.0:

    - Refactored code
    - Code coverage using Mocha and SonarQube
    - Added examples to connect to the Xbox

0.2.2:

    - No code changes. Integrated Travis CI + Sonarqube

0.2.1:

    - Fixed a bug that caused the connection to fail because the path to the python signing component was invalid

0.2.0:

    - Big update! xbox-smartglass-node-core can connect to the Xbox! For now only polling the status of the active app and tuning off the console

0.1.3:

    - Fixed a problem where old callbacks were still used when init a new client
