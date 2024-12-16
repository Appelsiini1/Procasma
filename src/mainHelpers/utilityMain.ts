import { app, BrowserWindow } from "electron";
import {
  codeExtensions,
  imageExtensions,
  textExtensions,
} from "../../resource/extensions.json";
import { FileTypes } from "../types";
import { clearFileCache } from "./fileOperations";
import { createHash } from "node:crypto";

/**
 * Deep copy using the JSON stringify -> parse method
 */
export function deepCopy(content: any) {
  return JSON.parse(JSON.stringify(content));
}

export function getFileTypeUsingExtension(str: string): FileTypes {
  const substrings = str.split(".");

  const ext = substrings?.[substrings.length - 1]?.toLowerCase();

  if (textExtensions.includes(ext)) {
    return "text";
  } else if (imageExtensions.includes(ext)) {
    return "image";
  } else if (codeExtensions.includes(ext)) {
    return "code";
  } else {
    return null;
  }
}

/**
 * Closes all open windows and clears the file cache.
 * On MacOS, this will not quit the app entirely as per macOS procedure.
 * Will quit the app on other platforms.
 */
export function appQuitHelper() {
  const openWindows = BrowserWindow.getAllWindows();
  openWindows.forEach((window) => {
    window.close();
  });
  clearFileCache(() => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

export function createSHAhash(content: string) {
  return createHash("sha256").update(content).digest("hex");
}
