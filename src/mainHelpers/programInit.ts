import { createFolderFS, saveRecentCoursesFS } from "./fileOperations";
import fs from "node:fs";
import { platform } from "node:process";
import { saveSettings } from "./settings";
import log from "electron-log/node";
import {
  getApplicationDir,
  getCacheDir,
  getDarwinSettingsDir,
  getFileCacheDir,
  getRecentCoursesFilepath,
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
    if (!fs.existsSync(getFileCacheDir())) {
      createFolderFS(getFileCacheDir());
    }
    if (platform === "darwin") {
      if (!fs.existsSync(getDarwinSettingsDir())) {
        createFolderFS(getDarwinSettingsDir());
      }
    }
    if (!fs.existsSync(getSettingsFilepath())) {
      saveSettings(globalSettings.toJSON());
    }
    if (!fs.existsSync(getRecentCoursesFilepath())) {
      saveRecentCoursesFS([]);
    }
    /* else {
    }*/
  } catch (err) {
    console.log(err);
    log.error(err);
  }
}
