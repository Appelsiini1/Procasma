import { Checkbox, ListItem, ListItemButton } from "@mui/joy";
import { ModuleDatabase, TagDatabase } from "../types";

export type filterState = {
  isChecked: boolean;
  value: string;
};

export type WithCheckWrapper = {
  isChecked: boolean;
  value: any;
};

export function wrapWithCheck(objects: any) {
  return objects.map((object: any) => {
    return {
      isChecked: false,
      value: object,
    };
  });
}

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

export function generateChecklist(
  items: WithCheckWrapper[],
  setItems: React.Dispatch<React.SetStateAction<WithCheckWrapper[]>>
) {
  return items
    ? items.map((item: WithCheckWrapper) => {
        const titleOrName = item.value.title ?? item.value.name ?? "";
        return (
          <ListItem
            key={item.value.id}
            startAction={
              <Checkbox
                checked={item.isChecked}
                onChange={() =>
                  handleCheckArray(item.value, !item.isChecked, setItems)
                }
              ></Checkbox>
            }
          >
            <ListItemButton
              selected={item.isChecked}
              onClick={() =>
                handleCheckArray(item.value, !item.isChecked, setItems)
              }
            >
              {titleOrName}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
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

/**
 * @returns A JSX list of unique filters with checkboxes
 */
export function generateFilterList(
  uniques: filterState[],
  setUniques: React.Dispatch<React.SetStateAction<filterState[]>>
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
              {String(unique.value)}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
  return filters;
}
