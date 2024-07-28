import { LevelsType } from "../types";

export function splitStringToArray(input: string): string[] {
  const trimmedInput = input.trim();
  const array = trimmedInput.split(",").map((item) => item.trim());

  return array;
}

export function splitStringToNumberArray(input: string): number[] {
  const trimmedInput = input.trim();
  const array = trimmedInput.split(",").map((item) => parseInt(item.trim()));

  return array;
}

export function arrayToString(arr: Array<string | number>): string {
  return arr.join(",");
}

export function splitCourseLevels(input: string): LevelsType {
  const trimmedInput = input.trim();
  const levels = trimmedInput.split("\n").map((item) => item.trim());

  const result: LevelsType = {};

  levels.forEach((level) => {
    const parts = level.split(":").map((item) => item.trim());

    // Ensure parts[0] (key) and parts[1] (fullName) are not empty
    if (parts.length !== 3 || !parts[0] || !parts[1]) {
      return;
    }

    const key = parseInt(parts[0], 10);
    const fullName = parts[1];
    const abbreviation = parts[2];
    result[key] = { fullName, abbreviation };

    // Validate types before assigning
    if (
      typeof key === "number" &&
      typeof fullName === "string" &&
      typeof abbreviation === "string"
    ) {
      result[key] = { fullName, abbreviation };
    }
  });

  return Object.keys(result).length > 0 ? result : null;
}

export function courseLevelsToString(levels: LevelsType): string {
  if (!levels) {
    return "";
  }
  const result: string = Object.keys(levels)
    .map((key) => {
      const { fullName, abbreviation } = levels[parseInt(key, 10)];
      return `${key}:${fullName}:${abbreviation}`;
    })
    .join("\n");

  return result;
}

export function spacesToUnderscores(input: string): string {
  return input.replace(/ /g, "_");
}

/**
 * Try to convert anything to string. Return empty string on fail.
 */
export function ForceToString(input: any) {
  const convert = String(input);
  return convert && convert != "null" ? convert : "";
}
