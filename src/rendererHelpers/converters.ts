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
  return arr.join(", ");
}

export function splitCourseLevels(input: string, check = false): LevelsType[] {
  const trimmedInput = input.trim();
  if (trimmedInput === "") return null;
  const levels = trimmedInput.split("\n").map((item) => item.trim());

  const result: LevelsType[] = [];

  levels.forEach((level) => {
    const parts = level.split(":").map((item) => item.trim());

    // Ensure parts[0] (key) and parts[1] (fullName) are not empty
    if (check && (parts.length !== 2 || !parts[0] || !parts[1])) {
      throw new Error("ui_level_error");
    }

    const fullName = parts[0];
    const abbreviation = parts[1];

    result.push({ fullName, abbreviation });
  });

  console.log(result);
  return result.length > 0 ? result : null;
}

export function courseLevelsToString(levels: LevelsType[] | null): string {
  if (!levels || levels.length === 0) {
    return "";
  }
  const result: string = levels
    .map((value) => {
      const { fullName, abbreviation } = value;
      return `${fullName}:${abbreviation}`;
    })
    .join("\n");

  return result;
}

/**
 * Try to convert anything to string. Return empty string on fail.
 */
export function ForceToString(input: any) {
  const convert = String(input);
  return convert && convert != "null" ? convert : "";
}
