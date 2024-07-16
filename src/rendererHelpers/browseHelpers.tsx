import { Checkbox, ListItem, ListItemButton } from "@mui/joy";

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
  setSelected(checkedElements.filter((n) => n));

  let numChecked = 0;
  checkedElements.forEach((element) => {
    numChecked += element ? 1 : 0;
  });

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
