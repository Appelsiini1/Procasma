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
