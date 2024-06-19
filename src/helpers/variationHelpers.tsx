import { HandleAssignmentFn } from "../helpers/assignmentHelpers";

/**
 * Takes in any variation object (most likely
 * Variation or ExampleRunType) as a
 * dependency injection.
 */
export function addVariation(
  newObject: unknown,
  variations: { [key: string]: unknown },
  getNextIDfunction: (IDs: string[]) => string,
  pathInAssignment: string,
  handleAssignment: HandleAssignmentFn
) {
  const newVariation = newObject;

  // list the existing ids
  const varIDs = Object.keys(variations);

  // function to get next available varID
  const nextID = getNextIDfunction(varIDs);

  const newVariations = {
    ...variations,
    [nextID]: newVariation,
  };

  handleAssignment(pathInAssignment, newVariations);
}

export function removeVariation(
  varID: string,
  variations: { [key: string]: unknown },
  pathInAssignment: string,
  handleAssignment: HandleAssignmentFn
) {
  // remove the specified key from variations
  const { [varID]: _, ...remainingVariations } = variations;
  const newVariations = remainingVariations;

  handleAssignment(pathInAssignment, newVariations);
}
