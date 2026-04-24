// Test-only Windows compatibility shim for the dev server.
//
// `server/index.ts` calls `httpServer.listen({ host: "0.0.0.0", port,
// reusePort: true })`. On Windows + Node 24 this throws ENOTSUP because
// SO_REUSEPORT isn't supported on IPv4 wildcards. We can't edit server
// code from a test-only PR (ticket #0003 hard rule), so this preload
// strips the offending option before Node hands it to libuv.
//
// Loaded via NODE_OPTIONS="--require ./tests/e2e/.win-listen-shim.cjs"
// when launching the Playwright web server outside the harness.
const net = require("net");
const origListen = net.Server.prototype.listen;
net.Server.prototype.listen = function patchedListen(...args) {
  if (args.length > 0 && args[0] && typeof args[0] === "object" && "reusePort" in args[0]) {
    const { reusePort: _ignored, ...rest } = args[0];
    args[0] = rest;
  }
  return origListen.apply(this, args);
};
