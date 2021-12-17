# Changelog

## 0.6.10

    - Update dependencies
    
## 0.6.9

    - Fixed typo 'unavalable' to 'unavailable'
    - Bump jsrsasign from 8.0.19 to 10.3.0
    - Bump lodash from 4.17.20 to 4.17.21
    - Bump glob-parent from 5.1.1 to 5.1.2
    - Bump uuid from 3.4.0 to 8.3.2


## 0.6.8

    - Bump elliptic from 6.5.3 to 6.5.4
    - Bump Bump y18n from 4.0.0 to 4.0.1

## 0.6.7

    - Fixed an issue where the library would stop working when received an unknown packet that is not from Smartglass
    - Code cleanup

## 0.6.6

    - No new package release. CI Changes only

## 0.6.5

    - Bump jsrsasign from 8.0.13 to 8.0.19
    - Bump lodash from 4.17.15 to 4.17.19
    - Bump elliptic from 6.5.2 to 6.5.3

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
