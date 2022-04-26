import xboxSmartGlass from "../src";

// Start the discovery process.
xboxSmartGlass.startDiscovery();

xboxSmartGlass.on("discovery", (xbox) => {
  // Every time a discovery response is received from an Xbox,
  // log that Xbox's ip address and liveId.
  console.log(
    `Discovered xbox with ip address "${xbox.ip}" and liveId "${xbox.liveId}"`
  );

  // You can always see all discovered Xboxes by calling
  // xboxSmartGlass.getXboxConsoles().
  console.log(
    `Total discovered consoles: ${xboxSmartGlass.getXboxConsoles().length}`
  );
});
