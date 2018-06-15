# Xbox-Smartglass-Core-Node

NodeJS smartglass library for controlling a Xbox

## Dependencies

- NodeJS 9 (X509 package is not compatible with Node 10 yet)
- NPM
- 

## How to use

### Boot the Xbox console

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

### Discover consoles on network

    Smartglass.discovery({
        ip: '127.0.0.1' // Your consoles ip address (Optional)
    }, function(device, address){
        console.log('- Device found: ' + device.device_name);
        console.log('Address: '+ address.address + ':' + address.port);
        console.log('LiveID: ' + device.device_certificate.subject.commonName);
        console.log('Certificate valid: ' + device.device_certificate.notBefore + ' - ' + device.device_certificate.notAfter);
        console.log('Certificate fingerprint: ' + device.device_certificate.fingerPrint);
    });

## Known Issues

- Broadcasting does not work properly yet
- Callback when sending a power_on command always returns true for now.
