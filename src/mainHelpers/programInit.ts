import { createFolderFS } from "./fileOperations";
import fs from "fs";
import { platform } from "node:process";
import { saveSettings } from "./settings";
import log from "electron-log/node";
import {
  getApplicationDir,
  getCacheDir,
  getDarwinSettingsDir,
  getSettingsFilepath,
} from "./osOperations";
import { globalSettings } from "../globalsMain";

export function initialize() {
  try {
    log.info("Initializing folders...");
    if (!fs.existsSync(getApplicationDir())) {
      createFolderFS(getApplicationDir());
    }
    if (!fs.existsSync(getCacheDir())) {
      createFolderFS(getCacheDir());
    }
    if (platform === "darwin") {
      if (!fs.existsSync(getDarwinSettingsDir())) {
        createFolderFS(getDarwinSettingsDir());
      }
    }
    if (!fs.existsSync(getSettingsFilepath())) {
      saveSettings(globalSettings.toJSON());
    }
    /* else {
    }*/
  } catch (err) {
    console.log(err);
    log.error(err);
  }
}
