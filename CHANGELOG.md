# Changelog

## 0.6.4

    - Implemented authentication using a userhash and xsts token
    - Added game_dvr_record() function to record the last 60 seconds

## 0.6.3

    - Update handlebars to version 4.5.3

## 0.6.2

    - Fixed a bug that prevented multiple connections

## 0.6.1

    - Added commands to TvRemote channel to get more information about the provider and channel lineups

## 0.6.0

    - Smartglass class rewritten to support promises (API breaking changes)
    - Performance improvements

## 0.5.1

    - Implemented support for JSON fragments (for TvRemote configuration)
    - Compatibility for NodeJS 12 by removing the x509 package

## 0.5.0

    - Removed cli client from package
    - Big update to the API interface of Smartglass (Massive breaking changes)

## 0.4.3

    - Added IR commands to control the tv and stb using the xbox (volume, channel, etc..)

## 0.4.2

    - Added media control (play/pause)

## 0.4.1

    - Added gamepad control
    - Media status implemented
    - Improved stability in connection

## 0.4.0

    - Implemented events in the smartglass client
    - Refactored smartglass class
    - Booting a device will now check if a boot was successfully
    - Fixed docker image
    - Improved discovery callback

## 0.3.3

    - Improved timeout handling
    - Added `_on_timeout()` callback

## 0.3.2

    - Fixed discovery on network
    - Added disconnect function (See [examples/connect_and_disconnect.js](examples/connect_and_disconnect.js))

## 0.3.1

    - Added debug options using DEBUG=smartglass:*

## 0.3.0:

    - Refactored code
    - Code coverage using Mocha and SonarQube
    - Added examples to connect to the Xbox

## 0.2.2:

    - No code changes. Integrated Travis CI + Sonarqube

## 0.2.1:

    - Fixed a bug that caused the connection to fail because the path to the python signing component was invalid

## 0.2.0:

    - Big update! xbox-smartglass-node-core can connect to the Xbox! For now only polling the status of the active app and tuning off the console

## 0.1.3:

    - Fixed a problem where old callbacks were still used when init a new client
