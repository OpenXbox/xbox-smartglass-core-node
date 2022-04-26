/**
 * This demonstrates powering on an Xbox when you know its liveId and ip address.
 * This can be used to power on an Xbox that was not on when your Node.js server started.
 * In order to get the liveId and ip address, you will first need to discover the Xbox through
 * the discovery process. You can then store those values somewhere and use them like this
 * to power on an undiscovered Xbox.
 */
import xboxSmartGlass from "../src";

const powerOnDemo = async () => {
  try {
    // An optional timeout can be provided to indicate how long you would like to
    // attempt to turn on the console.  If the timeout is omitted, the default timeout
    // will be used.
    const xbox = await xboxSmartGlass.powerOn(
      "FD00000000000000", // Put your liveId here
      "10.0.0.195",
      20000
    );

    console.log(`Xbox turned on!  Has ip address of ${xbox.ip}`);

    // Now we have the Xbox we just turned on, we can now connect to it if we want.
    // await Xbox.connect();
  } catch (err) {
    console.error("Failed to turn on Xbox", err);
  }
};

powerOnDemo();
