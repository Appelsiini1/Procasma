import { Checkbox, ListItem, ListItemButton } from "@mui/joy";
import { ModuleDatabase, TagDatabase } from "../types";

export type filterState = {
  isChecked: boolean;
  value: string;
};

export type filterType = {
  name: string;
  filters: filterState[];
};

export type WithCheckWrapper = {
  isChecked: boolean;
  value: unknown;
};

export function handleUpdateUniqueTags(
  allTags: TagDatabase[],
  setUniqueTags: React.Dispatch<React.SetStateAction<filterState[]>>
) {
  const tagsFilter: filterState[] = [];

  allTags.forEach((tag) => {
    const tagFilter: filterState = {
      isChecked: false,
      value: tag.name,
    };
    tagsFilter.push(tagFilter);
  });

  setUniqueTags(tagsFilter);
}

export function handleUpdateFilter(
  values: ModuleDatabase[],
  setter: React.Dispatch<React.SetStateAction<filterState[]>>
) {
  const filters: filterState[] = [];

  values.forEach((value) => {
    const uniqueFilter: filterState = {
      isChecked: false,
      value: value.name,
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
 * Set the selected elements and return their count.
 * @param elements The elements along with checked states
 * @param setSelected The elements setter
 * @returns The number of selected elements
 */
export function setSelectedViaChecked(
  elements: WithCheckWrapper[],
  setSelected: React.Dispatch<React.SetStateAction<unknown[]>>
): number {
  const checkedElements = elements.map((element) => {
    return element.isChecked ? element?.value : null;
  });

  // remove empty elements and update elements
  const checked = checkedElements.filter((n) => n);
  setSelected(checked);

  return checked.length;
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
    ? uniques.map((unique, index) => {
        return (
          <ListItem
            key={index}
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
              {String(
                filterTextFunction
                  ? filterTextFunction(unique.value)
                  : unique.value
              )}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
  return filters;
}
