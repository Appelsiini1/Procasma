import type { ContextBridgeAPI } from "./types";

declare global {
  interface Window {
    api: ContextBridgeAPI;
    envVars: ContextBridgeEnvVars;
  }
}
