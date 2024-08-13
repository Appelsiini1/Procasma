import {
  codeExtensions,
  dataExtensions,
  imageExtensions,
  textExtensions,
} from "../constants";
import defaults from "../../resource/defaults.json";
import { FileContents, FileTypes } from "../types";

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

export function getFileContentUsingExtension(str: string): FileContents {
  const substrings = str.split(".");

  const ext = substrings?.[substrings.length - 1]?.toLowerCase();

  if (textExtensions.includes(ext)) {
    return "instruction";
  } else if (imageExtensions.includes(ext)) {
    return "instruction";
  } else if (codeExtensions.includes(ext)) {
    return "code";
  } else if (dataExtensions.includes(ext)) {
    return "data";
  } else {
    return null;
  }
}

export function getCodeLanguageUsingExtension(str: string): string {
  const substrings = str.split(".");
  const newExtension = substrings?.[substrings.length - 1]?.toLowerCase();

  const languages = defaults.codeLanguages;
  // look through codeLanguages and return the "name" of
  // the language with any matching "fileExtensions" items
  const newName =
    languages.find((lang) => {
      return lang.fileExtensions.find(
        (extension) =>
          extension.replace(".", "") === newExtension.replace(".", "")
      );
    })?.name ?? null;

  return newName;
}
