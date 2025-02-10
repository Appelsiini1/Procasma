import { CSSContainerWidth } from "../constantsUI";
import {
  codeExtensions,
  imageExtensions,
  textExtensions,
} from "../../resource/extensions.json";
import { FileTypes } from "../types";
import log from "electron-log/renderer";
import { cssToString } from "./converters";

/**
 * dev sleep
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getFileNameFromPath(str: string) {
  return str.split("\\").pop().split("/").pop();
}

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

const specialRegex = /(?:[!@#$%^&*().?":{}|<>=])/gim;

export function checkSpecial(str: string) {
  const result = specialRegex.test(str);
  return result;
}

export function addCSSWidth(css: string) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  for (const rule of sheet.cssRules) {
    if (rule.constructor.name == "CSSStyleRule") {
      const ruleTyped = rule as CSSStyleRule;
      if (
        ruleTyped.selectorText == ".container" ||
        ruleTyped.selectorText == ".code-background"
      ) {
        ruleTyped.style.setProperty("width", CSSContainerWidth);
      }
    }
    log.debug(rule.cssText);
  }

  window.api.cssValue(cssToString(sheet));
}
