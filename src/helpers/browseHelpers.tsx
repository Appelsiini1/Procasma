import { Checkbox, ListItem, ListItemButton } from "@mui/joy";
import { CodeAssignmentData, ModuleData } from "../types";

export type filterState = {
  isChecked: boolean;
  value: string;
};

export type WithCheckWrapper = {
  isChecked: boolean;
  value: unknown;
};

export interface AssignmentWithCheck extends WithCheckWrapper {
  value: CodeAssignmentData;
}

export interface ModuleWithCheck extends WithCheckWrapper {
  value: ModuleData;
}

export function handleUpdateUniqueTags(
  allTags: Array<string>,
  setUniqueTags: React.Dispatch<React.SetStateAction<filterState[]>>
) {
  const tags: string[] = [];
  const tagsFilter: filterState[] = [];

  allTags.forEach((tag) => {
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  });

  tags.forEach((tag) => {
    const tagFilter: filterState = {
      isChecked: false,
      value: tag,
    };
    tagsFilter.push(tagFilter);
  });

  setUniqueTags(tagsFilter);
}

export function handleUpdateFilter(
  values: Array<string>,
  setter: React.Dispatch<React.SetStateAction<filterState[]>>
) {
  const uniques: string[] = [];
  const filters: filterState[] = [];

  values.forEach((value: string) => {
    const newUnique: string | null = value.toString();

    if (newUnique && !uniques.includes(newUnique)) {
      uniques.push(newUnique);
    }
  });

  uniques.forEach((unique) => {
    const uniqueFilter: filterState = {
      isChecked: false,
      value: unique.toString(),
    };
    filters.push(uniqueFilter);
  });
  setter(filters);
}

/**
 * Invert the checked state of the element specified by value.
 */
export function handleCheckArray(
  value: any,
  check: boolean,
  setter: React.Dispatch<React.SetStateAction<any[]>>
) {
  setter((prevState) => {
    const newState = prevState.filter((filter) => {
      if (filter.value === value) {
        filter.isChecked = check;
      }
      return filter;
    });

    return newState;
  });
}

/**
 * @param assignments The assignments along with checked states
 * @param setSelected The assignments setter
 * @returns The number of selected assignments
 */
export function setSelectedViaChecked(
  assignments: AssignmentWithCheck[],
  setSelected: React.Dispatch<React.SetStateAction<CodeAssignmentData[]>>
): number {
  const checkedAssignments = assignments.map((assignment) => {
    return assignment.isChecked ? assignment.value : null;
  });

  // remove empty elements and update assignments
  setSelected(checkedAssignments.filter((n) => n));

  const numChecked: number = checkedAssignments.reduce(
    (accumulator, currentValue) => {
      return accumulator + (currentValue ? 1 : 0);
    },
    0
  );

  return numChecked;
}

export function checkIfAnyCommonItems(array1: string[], array2: string[]) {
  return array1.some((item) => array2.includes(item));
}

export function checkIfShouldFilter(
  values: Array<string>,
  filterElements: filterState[]
): boolean {
  let shouldShow = true;
  let checkedCount = 0;

  const match = filterElements.find((filter) => {
    if (!filter.isChecked) {
      return false;
    }

    checkedCount = checkedCount + 1;
    const valuesArray: Array<string> = values as Array<string>;
    if (checkIfAnyCommonItems(valuesArray, [filter.value])) {
      return true;
    }

    return false;
  });

  if (!match) {
    shouldShow = false;
  }

  // if no filters, show all
  if (checkedCount === 0) {
    shouldShow = true;
  }

  return shouldShow;
}

/**
 * @returns A JSX list of unique filters with checkboxes
 */
export function generateFilter(
  uniques: filterState[],
  setUniques: React.Dispatch<React.SetStateAction<filterState[]>>,
  filterTextFunction?: (text: string) => string
): Array<React.JSX.Element> {
  const filters = uniques
    ? uniques.map((unique) => {
        return (
          <ListItem
            key={unique.value}
            startAction={
              <Checkbox
                checked={unique.isChecked}
                onChange={() =>
                  handleCheckArray(unique.value, !unique.isChecked, setUniques)
                }
              ></Checkbox>
            }
          >
            <ListItemButton
              selected={unique.isChecked}
              onClick={() =>
                handleCheckArray(unique.value, !unique.isChecked, setUniques)
              }
            >
              {filterTextFunction
                ? filterTextFunction(unique.value)
                : unique.value}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
  return filters;
}

export type filterType = {
  name: string;
  filters: filterState[];
};

/**
 * Generates the list of assignments, filtering based on the given
 * filters.
 * @param assignments
 * @param filters
 * @returns
 */
export function generateAssignments(
  assignments: AssignmentWithCheck[],
  setCourseAssignments: React.Dispatch<
    React.SetStateAction<AssignmentWithCheck[]>
  >,
  filters: filterType[],
  searchTerm: string
) {
  const filteredAssignments = assignments
    ? assignments.map((assignment: AssignmentWithCheck) => {
        let showAssignment = true;

        const tags: Array<string> = assignment.value?.tags;
        const tagFilter = filters.find((filter) => {
          filter.name === "tags";
        });
        showAssignment = checkIfShouldFilter(tags, tagFilter.filters)
          ? showAssignment
          : false;

        const module: string = assignment.value?.module?.toString();
        const moduleFilter = filters.find((filter) => {
          filter.name === "module";
        });
        showAssignment = checkIfShouldFilter([module], moduleFilter.filters)
          ? showAssignment
          : false;

        const type: string = assignment.value?.assignmentType;
        const typeFilter = filters.find((filter) => {
          filter.name === "type";
        });
        showAssignment = checkIfShouldFilter([type], typeFilter.filters)
          ? showAssignment
          : false;

        if (searchTerm && searchTerm.length > 0) {
          const titleFormatted = assignment.value.title.toLowerCase();
          const searchFormatted = searchTerm.toLowerCase();

          showAssignment = titleFormatted.includes(searchFormatted)
            ? true
            : false;
        }

        return showAssignment ? (
          <ListItem
            key={assignment.value.title}
            startAction={
              <Checkbox
                checked={assignment.isChecked}
                onChange={() =>
                  handleCheckArray(
                    assignment.value,
                    !assignment.isChecked,
                    setCourseAssignments
                  )
                }
              ></Checkbox>
            }
          >
            <ListItemButton
              selected={assignment.isChecked}
              onClick={() =>
                handleCheckArray(
                  assignment.value,
                  !assignment.isChecked,
                  setCourseAssignments
                )
              }
            >
              {assignment.value.title}
            </ListItemButton>
          </ListItem>
        ) : null;
      })
    : null;
  return filteredAssignments;
}

export async function handleDeleteSelected(
  selectedAssignments: CodeAssignmentData[],
  activePath: string,
  refreshAssignments: () => void
) {
  try {
    const deletePromises = selectedAssignments.map(async (assignment) => {
      const result = await window.api.deleteAssignment(
        activePath,
        assignment.assignmentID
      );
      return result;
    });

    const results = await Promise.all(deletePromises);

    // get the remaining assignments
    refreshAssignments();
  } catch (error) {
    console.error("Error deleting assignments:", error);
  }
}
