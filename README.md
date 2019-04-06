# Xbox-Smartglass-Core-Node

NodeJS smartglass library for controlling a Xbox

## Dependencies

- NPM

## How to install

```npm install xbox-smartglass-core-node --save```

## How to use

### Discover consoles on network

```
Smartglass.discovery({
    ip: '127.0.0.1' // Your consoles ip address (Optional)
}, function(device, address){
    console.log('- Device found: ' + device.device_name);
    console.log('Address: '+ address.address + ':' + address.port);
    console.log('LiveID: ' + device.device_certificate.subject.commonName);
    console.log('Certificate valid: ' + device.device_certificate.notBefore + ' - ' + device.device_certificate.notAfter);
    console.log('Certificate fingerprint: ' + device.device_certificate.fingerPrint);
});
```

### Boot the Xbox console

```
Smartglass.power_on({
    live_id: 'FD000000000000', // Put your console's live id here (Required)
    tries: 4, // Number of packets too issue the boot command (Optional)
    ip: '127.0.0.1' // Your consoles ip address (Optional)
}, function(result){
    if(result)
        console.log('Device booted successfully');
    else
        console.log('Failed to boot device');
});
```

### Shutdown the Xbox console

```
Smartglass.shutdown({
    ip: '127.0.0.1'
}, function(result){
    if(result === true){
        console.log('Xbox succesfully connected! Sending shutdown');
    } else {
        console.log('Failed to connect to xbox:', result);
    }
});
```

### Poll realtime information

```
var deviceStatus = {
    current_app: false,
    connection_status: false
}

var sgClient = Smartglass.connect({
    ip: '127.0.0.1'
}, function(result){
    if(result === true){
        console.log('Xbox succesfully connected!');
    } else {
        console.log('Failed to connect to xbox:', result);
    }
});

sgClient._on_console_status.push(function(response, device, smartglass){
    deviceStatus.connection_status = true

    if(response.packet_decoded.protected_payload.apps[0] != undefined){
        if(deviceStatus.current_app != response.packet_decoded.protected_payload.apps[0].aum_id){
            deviceStatus.current_app = response.packet_decoded.protected_payload.apps[0].aum_id
            console.log('Current active app:', deviceStatus)
        }
    }
}.bind(deviceStatus));
```

## Known Issues

- Broadcasting does not work properly yet.
- Callback when sending a power_on command always returns true for now.
- Protocol can be broken sometimes.

## Changelog

0.2.0:

    Big update! xbox-smartglass-node-core can connect to the Xbox! For now only polling the status of the active app and tuning off the console

0.1.3:

    Fixed a problem where old callbacks were still used when init a new client
