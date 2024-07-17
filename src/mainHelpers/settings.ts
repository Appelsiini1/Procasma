import * as oso from "./osOperations";
import fs from "fs";
import log from "electron-log/node";
import { handleReadFileSync } from "./fileOperations";
import { SettingsType } from "../types";

export function getSettings() {
  try {
    const settings = handleReadFileSync(oso.getSettingsFilepath());
    return settings;
  } catch (err) {
    // "ui_load_settings_failed"
    log.error("Error in getSettings():", err.message);
    throw err;
  }
}

export function saveSettings(settings: SettingsType) {
  try {
    const path = oso.getSettingsFilepath();
    fs.writeFileSync(path, JSON.stringify(settings));
    return "ui_settings_save_success";
  } catch (err) {
    log.error("Error in saveSettings():", err.message);
    throw err;
  }
}
