// utils/deviceInfo.js
import { UAParser } from "ua-parser-js"; // v2+ named export; v1 use default `uap`

export const deviceInfo = async (req) => {
  const userAgent = (await req.headers["user-agent"]) || "";
  const parser = new UAParser(userAgent);
  const result = await parser.getResult();

  return {
    userAgent,
    ip: req.ip,

    // os
    os: result.os.name || "unknown",
    osVersion: result.os.version || "unknown",

    // browser
    browser: result.browser.name || "unknown",
    browserVersion: result.browser.version || "unknown",

    // device
    deviceType: result.device.type || "desktop", // mobile, tablet, console, smarttv, wearable, embedded
    deviceVendor: result.device.vendor || "unknown",
    deviceModel: result.device.model || "unknown",

    // engine (webkit, gecko, blink etc)
    engine: result.engine.name || "unknown",
    engineVersion: result.engine.version || "unknown",

    // cpu arch (amd64, arm etc) - not always available
    cpuArchitecture: result.cpu.architecture || "unknown",
  };
};
