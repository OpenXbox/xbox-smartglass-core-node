# Xbox-Smartglass-Core-Node
[![Build Status](https://travis-ci.org/unknownskl/xbox-smartglass-core-node.svg?branch=release/0.4.3)](https://travis-ci.org/unknownskl/xbox-smartglass-core-node)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=alert_status&branch=release/0.4.3)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=alert_status)
[![Technical debt](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=sqale_index&branch=release/0.4.3)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=sqale_index)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=bugs&branch=release/0.4.3)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=bugs)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=xbox-smartglass-core-node&metric=coverage&branch=release/0.4.3)](https://sonarcloud.io/component_measures?id=xbox-smartglass-core-node&metric=coverage)
[![Discord](https://img.shields.io/badge/discord-OpenXbox-blue.svg)](https://openxbox.org/discord)


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

See [changelog](CHANGELOG.md)
