// Convert a base-26 number to string representation
export const numberToString = (num: number): string => {
  let result = "";
  while (num >= 0) {
    result = String.fromCharCode((num % 26) + 65) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result;
};

// Convert a string representation to base-26 number
export const stringToNumber = (str: string): number => {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    result = result * 26 + (str.charCodeAt(i) - 65 + 1);
  }
  return result - 1;
};

/**
 * Takes in the current ids and generates the next
 * possible key in alphabetical order.
 * After Z, wraps to AA, AB, ...
 * Returns the new ID.
 */
export const getNextID = (IDs: string[]): string => {
  if (!IDs || IDs.length < 1) {
    return "A";
  }

  const maxID = IDs.reduce(
    (max, ID) => (stringToNumber(ID) > stringToNumber(max) ? ID : max),
    "A"
  );

  // Calculate the next ID
  const nextIDNum = stringToNumber(maxID) + 1;
  return numberToString(nextIDNum);
};

/**
 * Takes in the current ids and generates the next
 * possible key in ascending numerical order.
 * Returns the new ID.
 */
export const getNextIDNumeric = (IDs: string[]): string => {
  if (!IDs || IDs.length < 1) {
    return "1";
  }

  // Convert IDs to numbers
  const numericIDs = IDs.map((id) => parseInt(id, 10));

  const maxID = numericIDs.reduce((max, ID) => (ID > max ? ID : max), 1);

  // Calculate the next ID
  const nextIDNum = maxID + 1;
  return nextIDNum.toString();
};
