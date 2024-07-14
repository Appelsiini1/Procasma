import * as oso from "./osOperations";
import fs from "fs";
import log from "electron-log/node";
import { handleReadFileSync } from "./fileOperations";
import { Settings } from "../types";

export function getSettings() {
  const settingsFromFile = handleReadFileSync(oso.getSettingsFilepath());
  if (!settingsFromFile) {
    throw new Error("Could not load settings from file");
  } else {
    const settings: Settings = settingsFromFile.content;
    return settings;
  }
}

export function saveSettings(settings: Settings) {
  try {
    const path = oso.getSettingsFilepath();
    fs.writeFileSync(path, JSON.stringify(settings));
    return { success: "ui_settings_save_success" };
  } catch (err) {
    log.error("Error in saveSettings():", err.message);
    throw err;
  }
}
