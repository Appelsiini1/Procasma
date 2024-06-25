import * as oso from "./osOperations";
import { createFolder } from "./fileOperations";
import fs from "fs";
import { platform } from "node:process";
import defaults from "../../resource/defaults.json";
import { saveSettings } from "./settings";

export function initialize() {
  try {
    if (!fs.existsSync(oso.getApplicationDir())) {
      createFolder(oso.getApplicationDir(), { recursive: true });
    }
    if (!fs.existsSync(oso.getCacheDir())) {
      createFolder(oso.getCacheDir(), { recursive: true });
    }
    if (platform === "darwin") {
      if (!fs.existsSync(oso.getDarwinSettingsDir())) {
        createFolder(oso.getDarwinSettingsDir(), { recursive: true });
      }
    }
    if (!fs.existsSync(oso.getSettingsFilepath())) {
      saveSettings(defaults);
    } else {
    }
  } catch (err) {
    console.log(err);
  }
}
