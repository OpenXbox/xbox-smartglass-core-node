/**
 * In some cases, you may wish to dispose of an Xbox instance
 * and have it removed from memory. In order to do this, we need to
 * shut down its socket and remove all of its listeners.
 *
 * ! ! ! ! !
 * Once you dispose of an Xbox instance it cannot be revived. The behavior of
 * the Xbox instance is undefined once it is disposed. Do not hold a reference to it
 * after you call dispose.
 */
import xboxSmartGlass from "../src";

// Start listening for Xbox consoles.
xboxSmartGlass.startDiscovery();

// Emits an Xbox console every time a discovery response is received.
xboxSmartGlass.once("discovery", async (xbox) => {
  xboxSmartGlass.stopDiscovery();

  await xbox.connect();

  console.log("Successfully connected to Xbox");

  // Demonstrating that xboxSmartGlass currently knows about this Xbox.
  console.log(
    `xboxSmartGlass has a reference to this xbox: ${xboxSmartGlass
      .getXboxConsoles()
      .includes(xbox)}`
  );

  xbox.dispose();

  console.log(
    "Xbox has been disposed. Logs should indicate a complete shutdown"
  );

  // Demonstrating that xboxSmartGlass does NOT currently knows about this Xbox.
  console.log(
    `xboxSmartGlass has a reference to this xbox: ${xboxSmartGlass
      .getXboxConsoles()
      .includes(xbox)}`
  );
});
