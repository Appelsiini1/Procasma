import * as oso from "./osOperations";
import fs from "fs";
import log from "electron-log/node";
import { handleReadFileSync } from "./fileOperations";
import { SettingsType } from "../types";

export function getSettings() {
  const settingsFromFile = handleReadFileSync(oso.getSettingsFilepath());
  if (!settingsFromFile) {
    throw new Error("ui_load_settings_failed");
  } else {
    const settings: SettingsType = settingsFromFile.content;
    return settings;
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
