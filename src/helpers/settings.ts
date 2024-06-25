import * as oso from "./osOperations";
import { handleReadFile, writeToFile } from "./fileOperations";
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
  writeToFile(JSON.stringify(settings), path);
}
