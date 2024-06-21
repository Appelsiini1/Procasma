import { env, platform } from "node:process";

export function getApplicationDir() {
  const path = env.APPDATA || env.HOME;
  let appdata: string = null;
  if (platform === "darwin") {
    appdata = path + "/Library";
  } else if (platform === "win32") {
    appdata = path + "/Procasma/";
  } else {
    appdata = path + "/.Procasma/";
  }
  return appdata;
}

export function getCacheDir() {
  if (platform === "darwin") {
    return getApplicationDir() + "/Caches/Procasma";
  } else {
    return getApplicationDir();
  }
}

export function getDarwinSettingsDir() {
  return getApplicationDir() + "/Preferences/Procasma/";
}

export function getSettingsFilepath() {
  if (platform === "darwin") {
    return getDarwinSettingsDir() + "settings.json";
  } else {
    return getApplicationDir() + "settings.json";
  }
}
