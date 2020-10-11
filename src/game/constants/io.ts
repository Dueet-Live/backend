// eslint-disable-next-line @typescript-eslint/no-namespace
export const DisconnectReason = {
  transportError: 'transport error', // Transport error
  serverNamespaceDisconnect: 'server namespace disconnect', // Server performs a socket.disconnect()
  clientNamespaceDisconnect: 'client namespace disconnect', // Got disconnect packet from client
  pingTimeout: 'ping timeout', // Client stopped responding to pings in the allowed amount of time (per the pingTimeout config setting)
  transportClose: 'transport close', // Client stopped sending data
};
