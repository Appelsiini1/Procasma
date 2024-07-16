import { codeExtensions, imageExtensions, textExtensions } from "../constants";
import { FileTypes } from "../types";

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
