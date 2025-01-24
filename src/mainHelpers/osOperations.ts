import { env, platform } from "node:process";
import path from "node:path";

export function getApplicationDir() {
  const basePath = env.APPDATA || env.HOME;
  let appdata: string = null;
  if (platform === "darwin") {
    appdata = path.join(basePath, "Library");
  } else if (platform === "win32") {
    appdata = path.join(basePath, "Procasma");
  } else {
    appdata = path.join(basePath, ".Procasma");
  }
  return appdata;
}

export function getCacheDir() {
  if (platform === "darwin") {
    return path.join(getApplicationDir(), "Caches", "Procasma");
  } else {
    return getApplicationDir();
  }
}

export function getFileCacheDir() {
  const basePath = getCacheDir();
  return path.join(basePath, "FileCache");
}

export function getDarwinSettingsDir() {
  return path.join(getApplicationDir(), "Preferences", "Procasma");
}

export function getSettingsFilepath() {
  if (platform === "darwin") {
    return path.join(getDarwinSettingsDir(), "settings.json");
  } else {
    return path.join(getApplicationDir(), "settings.json");
  }
}

export function getRecentCoursesFilepath() {
  if (platform === "darwin") {
    return path.join(getDarwinSettingsDir(), "recentCourses.json");
  } else {
    return path.join(getApplicationDir(), "recentCourses.json");
  }
}
