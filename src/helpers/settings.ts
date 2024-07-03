import * as oso from "./osOperations";
import { handleReadFile, writeToFileSync } from "./fileOperations";
import { Settings } from "../types";

export function getSettings() {
  const settingsFromFile = handleReadFile(oso.getSettingsFilepath());
  if (settingsFromFile.error) {
    throw new Error("Could not load settings from file");
  } else {
    const settings: Settings = settingsFromFile.content;
    return settings;
  }
}

export function saveSettings(settings: Settings) {
  const path = oso.getSettingsFilepath();
  const result = writeToFileSync(JSON.stringify(settings), path);
  if (result?.error) {
    return { error: result.error };
  }
  return { success: "ui_settings_save_success" };
}
