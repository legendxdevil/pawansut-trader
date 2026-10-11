import os from "os";
import { spawn } from "child_process";

// 1. Resolve local network IPv4 address
const interfaces = os.networkInterfaces();
const addresses = [];

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name] || []) {
    if (iface.family === "IPv4" && !iface.internal) {
      addresses.push(iface.address);
    }
  }
}

const localIp = addresses[0] || "127.0.0.1";
const port = process.env.PORT || "3000";

console.log("\n  \x1b[1m\x1b[36m▲ Pawansut Trader Dev Server\x1b[0m");
console.log(`  - \x1b[1mLocal:\x1b[0m   \x1b[34mhttp://localhost:${port}\x1b[0m`);
console.log(`  - \x1b[1mNetwork:\x1b[0m \x1b[32m\x1b[1mhttp://${localIp}:${port}\x1b[0m  \x1b[90m(Open on phone/tablet over same Wi-Fi)\x1b[0m\n`);

// 2. Launch Next dev server bound to 0.0.0.0
const child = spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", String(port)], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});

process.on("SIGINT", () => {
  child.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
  process.exit(0);
});
