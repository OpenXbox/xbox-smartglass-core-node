/**
 * This demo will do the following:
 *  1. Start the discovery process.
 *  2. Listen for discovered Xboxes.
 *  3. Stop the discovery process once the first Xbox is discovered.
 *  4. Setup listeners to turn on and off the Xbox.
 *  5. Constantly press the Nexus button every 3 seconds.
 *
 * When the demo is run, you should see your Xbox turn on and of forever.
 * While the Xbox is on, you should see the side menu toggle in and out.
 * Automatic reconnection is enabled by default.
 * This can be turned off by calling `xbox.setAutoReconnect(false);`
 */
import xboxSmartGlass from "../src";

// Start listening for Xbox consoles.
xboxSmartGlass.startDiscovery();

// Emits an Xbox console every time a discovery response is received.
xboxSmartGlass.once("discovery", async (xbox) => {
  // Stop listening now that we have a console.
  // We won't receive any more discover events now.
  xboxSmartGlass.stopDiscovery();

  // Whenever the Xbox becomes disconnected,
  // we'll wait 15 seconds and power it on.
  xbox.on("disconnected", () => {
    setTimeout(() => {
      // Adding a longer timeout here, since we just turned it off
      // it may need some time to shutdown before we can turn it on again.
      xbox.powerOn(30000);
    }, 15000);
  });

  // Whenever the Xbox is connected,
  // we'll wait 30 seconds and power it off.
  xbox.on("connected", () => {
    setTimeout(() => {
      xbox.powerOff();
    }, 30000);
  });

  // Connect to the discovered xbox.
  await xbox.connect();

  // Constantly do a quick press of the Nexus button
  // every 3 seconds, just to demonstrate we're connected.
  setInterval(() => {
    xbox.controller.quickPressButton(xbox.Buttons.Nexus);
  }, 3000);
});
