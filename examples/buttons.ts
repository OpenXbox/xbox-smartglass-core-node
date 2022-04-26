/**
 * This demo works best if you have a video app like Hulu open.
 * But works ok on the home screen as well.
 */
import xboxSmartGlass from "../src";

// Start the discovery process.
xboxSmartGlass.startDiscovery();

xboxSmartGlass.on("discovery", async (xbox) => {
  xboxSmartGlass.stopDiscovery();

  await xbox.connect();

  // TODO we need an event for letting us know the channel is ready.
  // Also need a way to only turn the channel on if the user wants it.
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // All of the button options can be accessed like this.
  // xbox.Buttons.[Button Name]

  // Calling quickPress handles both pressing and releasing a button.
  // The button will be pressed for approximately 200ms.
  // If you have Hulu open with something playing, you'll now have the seeker bar displayed.
  xbox.controller.quickPressButton(xbox.Buttons.DPadRight);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Calls to pressButton do not automatically release.
  // If you have Hulu open, you'll now be seeking backwards.
  xbox.controller.pressButton(xbox.Buttons.DPadLeft);

  // Wait 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Now release the button.
  xbox.controller.releaseButton(xbox.Buttons.DPadLeft);

  // Wait 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // You can supply a timeout to pressButton and then it WILL automatically
  // release after the given time in ms.
  await xbox.controller.pressButton(xbox.Buttons.DPadRight, 2000);

  // Quick press A to start playing again.
  xbox.controller.quickPressButton(xbox.Buttons.A);
});
