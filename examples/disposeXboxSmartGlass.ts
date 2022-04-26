/**
 * ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !
 * Only call `xboxSmartGlass.dispose()` when you are completely done with it
 * and all Xbox instances. It cannot be revived. And since xboxSmartGlass is a singleton
 * you cannot make a new one.
 *
 * This should only be called in order to cleanly shutdown your NodeJS process.
 *
 * Behavior of xboxSmartGlass and all Xbox instances is undefined after being disposed.
 */
import xboxSmartGlass from "../src";

// Start listening for Xbox consoles, just to demonstrate
// that the process will cleanly exit once disposed.
xboxSmartGlass.startDiscovery();

// Emits an Xbox console every time a discovery response is received.
xboxSmartGlass.on("discovery", async (xbox) => {
  console.log("Received Xbox discovery response!");
});

xboxSmartGlass.on("disposed", () => {
  console.log("XboxSmartGlass has been disposed!");
  console.log("You can now safely exit.");
});

setTimeout(() => {
  xboxSmartGlass.dispose();
}, 5000);
