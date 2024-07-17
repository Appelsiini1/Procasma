import * as oso from "./osOperations";
import { createFolder } from "./fileOperations";
import fs from "fs";
import { platform } from "node:process";
import defaults from "../../resource/defaults.json";
import { saveSettings } from "./settings";
import log from "electron-log/node";

export function initialize() {
  try {
    log.info("Initializing folders...");
    if (!fs.existsSync(oso.getApplicationDir())) {
      createFolder(oso.getApplicationDir());
    }
    if (!fs.existsSync(oso.getCacheDir())) {
      createFolder(oso.getCacheDir());
    }
    if (platform === "darwin") {
      if (!fs.existsSync(oso.getDarwinSettingsDir())) {
        createFolder(oso.getDarwinSettingsDir());
      }
    }
    if (!fs.existsSync(oso.getSettingsFilepath())) {
      saveSettings(defaults);
    } /* else {
    }*/
  } catch (err) {
    console.log(err);
    log.error(err);
  }
}
