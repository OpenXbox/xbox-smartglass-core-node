import xboxSmartGlass from "../src";

// Start the discovery process.
xboxSmartGlass.startDiscovery();

xboxSmartGlass.once("discovery", async (xbox) => {
  // We found an xbox, so we can stop the discovery process.
  xboxSmartGlass.stopDiscovery();

  console.log(
    `Discovered xbox with ip address "${xbox.ip}" and liveId "${xbox.liveId}"`
  );

  // You must connect to the Xbox before you can power it off.
  // Generally, you should wrap calls to connect in a try/catch.
  await xbox.connect();

  console.log("Connected to Xbox! Powering off!");
  xbox.powerOff();
});
