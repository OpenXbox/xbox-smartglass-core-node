import { DiscoverySocket } from "./DiscoverySocket";

export const TurnOn = (
  liveId: string,
  ip: string,
  discoverySocket: DiscoverySocket,
  timeout = 15000
) => {
  discoverySocket.startDiscovery();

  const powerOnInterval = setInterval(() => {
    discoverySocket.sendPowerOn(liveId, ip);
  }, 500);

  return Promise.race([
    new Promise<void>((_resolve, reject) =>
      setTimeout(() => reject(new Error("Power on timed out")), timeout)
    ),
    new Promise<void>((resolve) => {
      discoverySocket.on("discovery", (discoveryResponse) => {
        if (discoveryResponse.ip === ip) {
          resolve();
        }
      });
    }),
  ]).finally(() => {
    clearInterval(powerOnInterval);
    discoverySocket.stopDiscovery();
  });
};
