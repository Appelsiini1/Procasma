import { Checkbox, ListItem, ListItemButton, Typography } from "@mui/joy";
import HistoryIcon from "@mui/icons-material/History";
import ExpandIcon from "@mui/icons-material/Expand";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  CodeAssignmentDatabase,
  ModuleData,
  ModuleDatabase,
  SetAlgoAssignmentData,
  SetAssignmentWithCheck,
  SetVariation,
  SupportedModuleType,
  TagDatabase,
  WithCheckWrapper,
} from "../types";
import { parseUICode } from "./translation";
import ButtonComp from "../components/ButtonComp";
import HelpText from "../components/HelpText";
import { currentCourse } from "../globalsUI";

export type filterState = {
  isChecked: boolean;
  value: string;
};

export function wrapWithCheck(objects: any) {
  return objects.map((object: any) => {
    return {
      isChecked: false,
      value: object,
    };
  });
}

export function wrapWithCheckAndVariation(
  assignments: SetAlgoAssignmentData[]
) {
  return assignments.map((assignment) => {
    const variation = Object.keys(assignment.variations)[0];
    return {
      isChecked: false,
      value: assignment,
      selectedPosition: assignment.position[0],
      selectedVariation: variation,
      selectedModule: -1, // assignment.module,
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
  setter: React.Dispatch<React.SetStateAction<any[]>>,
  singleCheckOnly?: boolean
) {
  setter((prevState) => {
    if (singleCheckOnly) {
      const newState = prevState.filter((filter) => {
        if (filter.value === value) {
          filter.isChecked = check;
        } else {
          filter.isChecked = false;
        }
        return filter;
      });
      return newState;
    }

    const newState = prevState.filter((filter) => {
      if (filter.value === value) {
        filter.isChecked = check;
      }
      return filter;
    });

    return newState;
  });
}

const UsedInBadnessIcon = ({ badness }: { badness: number }) => {
  let safeBadness = 0;
  if (badness >= 0 && badness <= 1) {
    safeBadness = badness;
  }
  const clampedBadness = Math.max(0, Math.min(1, safeBadness));

  // Convert the badness value to a channel value (0-255)
  const badValue = Math.round(clampedBadness * 255);
  const color = `rgb(${badValue}, ${255 - badValue}, 0)`;
  return (
    <HelpText text={parseUICode("help_badness")}>
      <HistoryIcon style={{ color }}>
        {/* Your icon content here */}
      </HistoryIcon>
    </HelpText>
  );
};

function getModuleLetter(moduleType: SupportedModuleType) {
  switch (moduleType) {
    case "lecture":
      return parseUICode("lecture_letter");
    case "module":
      return parseUICode("module_letter");
    case "week":
      return parseUICode("week_letter");
    default:
      throw new Error("Unsupported module type in getModuleLetter()!");
  }
}

export function generateChecklist(
  items: WithCheckWrapper[],
  setItems: React.Dispatch<React.SetStateAction<WithCheckWrapper[]>>,
  isAssignment?: boolean,
  disabled?: boolean
) {
  return items
    ? items.map((item: any) => {
        let titleOrName = "";
        const variation = item?.selectedVariation;
        if (isAssignment) {
          const assignment: CodeAssignmentDatabase = item.value;
          titleOrName = `L${assignment?.module}T${assignment?.position} - 
          ${assignment?.title}`;

          titleOrName += variation
            ? ` - ${parseUICode("ui_variation")} ${variation}`
            : "";
        } else {
          titleOrName = item?.value?.title ?? item?.value?.name ?? "";
        }
        const key = item?.value?.id ?? item?.value?.assignmentID;

        return (
          <ListItem
            sx={{ opacity: disabled ? "0.2" : "1.0" }}
            key={key}
            startAction={
              <Checkbox
                disabled={disabled}
                checked={item.isChecked}
                onChange={() =>
                  handleCheckArray(item.value, !item.isChecked, setItems)
                }
              ></Checkbox>
            }
          >
            <ListItemButton
              selected={item.isChecked}
              disabled={disabled}
              onClick={() =>
                handleCheckArray(item.value, !item.isChecked, setItems)
              }
            >
              {titleOrName}
              {item.value.isExpanding === "1" ? (
                <HelpText text={parseUICode("ui_exp_assignment")}>
                  <ExpandIcon />
                </HelpText>
              ) : null}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
}

export function generateChecklistSetAssignment(
  items: SetAssignmentWithCheck[],
  setItems: React.Dispatch<React.SetStateAction<WithCheckWrapper[]>>,
  assignmentsCount: number,
  legalMovePositions: number[],
  moveToPosition: (position: number) => void,
  handleOpenAssignment: () => void,
  handleDeleteAssignment: () => void,
  handleTargetPosition: (position: number) => void,
  isPendingModule?: boolean
) {
  return items
    ? Array(assignmentsCount ?? 1)
        .fill(1)
        .map((a, listIndex) => {
          // use the index to get the item at a specific assignment "position"
          listIndex += 1;
          const index = items.findIndex(
            (i) => i.selectedPosition === listIndex
          );
          if (index === -1) {
            // display an empty slot if none in the position
            let buttonType: any = "starAlt";
            if (!legalMovePositions?.find((pos) => pos === listIndex)) {
              buttonType = "grey";
            }

            return (
              <ListItem key={listIndex}>
                <ListItemButton selected={false} onClick={() => null}>
                  <Typography sx={{ opacity: "0.5" }} level="body-md">
                    {listIndex}
                  </Typography>
                  {isPendingModule ? (
                    ""
                  ) : (
                    <>
                      {legalMovePositions ? (
                        <div style={{ marginLeft: "1rem" }}>
                          <ButtonComp
                            buttonType={buttonType}
                            onClick={() => moveToPosition(listIndex)}
                            ariaLabel={parseUICode("ui_move_here")}
                          >
                            {parseUICode("ui_move_here")}
                          </ButtonComp>
                        </div>
                      ) : (
                        <div style={{ marginLeft: "1rem" }}>
                          <ButtonComp
                            buttonType="normal"
                            onClick={() => handleTargetPosition(listIndex)}
                            ariaLabel={parseUICode("ui_add")}
                          >
                            {parseUICode("ui_add")}
                          </ButtonComp>
                        </div>
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
            );
          }
          const item = items[index];

          let title = "";
          const position = item?.selectedPosition;
          const variation = item?.selectedVariation;
          const module = item?.selectedModule;

          const assignment: SetAlgoAssignmentData = item.value;
          if (!isPendingModule) {
            let lectureLetter: string = null;
            if (module !== -3) {
              lectureLetter = `${getModuleLetter(
                currentCourse.moduleType
              )}${module}`;
            } else {
              lectureLetter = "";
            }
            title += `${lectureLetter}${parseUICode(
              "assignment_letter"
            )}${position} - `;
          }

          title += assignment?.title;

          title += variation
            ? ` - ${parseUICode("ui_variation")} ${variation}`
            : "";

          const badness =
            items[index]?.value?.variations?.[variation]?.usedInBadness;

          const isExpanding =
            assignment?.previous?.length > 0 || assignment?.next?.length > 0;

          return (
            <ListItem
              key={listIndex}
              startAction={
                <Checkbox
                  checked={item.isChecked}
                  onChange={() =>
                    handleCheckArray(
                      item.value,
                      !item.isChecked,
                      setItems,
                      true
                    )
                  }
                ></Checkbox>
              }
            >
              <ListItemButton
                selected={item.isChecked}
                onClick={() =>
                  handleCheckArray(item.value, !item.isChecked, setItems, true)
                }
              >
                {title}
                <UsedInBadnessIcon badness={badness}></UsedInBadnessIcon>
                {isExpanding ? (
                  <HelpText text={parseUICode("ui_exp_assignment")}>
                    <ExpandIcon color={"primary"} />
                  </HelpText>
                ) : null}
                {item.isChecked ? (
                  <>
                    <ButtonComp
                      buttonType="delete"
                      onClick={() => handleDeleteAssignment()}
                      ariaLabel={parseUICode("ui_delete")}
                    >
                      {parseUICode("ui_delete")}
                    </ButtonComp>
                    <ButtonComp
                      buttonType="normal"
                      onClick={() => handleOpenAssignment()}
                      ariaLabel={parseUICode("ui_aria_show_assignment")}
                    >
                      {parseUICode("ui_show")}
                    </ButtonComp>
                  </>
                ) : null}
              </ListItemButton>
            </ListItem>
          );
        })
    : null;
}

export function generateChecklistExpandingAssignment(
  items: SetAssignmentWithCheck[],
  moveAssignmentIntoPending: (id: string) => void
) {
  return items
    ? items.map((item) => {
        const notYetAllocated = item.selectedModule === -1;
        return (
          <ListItem
            key={item.value.assignmentID}
            startAction={
              notYetAllocated ? (
                <Checkbox
                  checked={item.isChecked}
                  onChange={() =>
                    moveAssignmentIntoPending(item.value.assignmentID)
                  }
                  disabled={!notYetAllocated}
                ></Checkbox>
              ) : null
            }
          >
            <ListItemButton
              selected={item.isChecked}
              onClick={() => moveAssignmentIntoPending(item.value.assignmentID)}
              disabled={!notYetAllocated}
            >
              {item.value.title}
              {notYetAllocated ? (
                <HelpText text={parseUICode("help_expanding_unassigned")}>
                  <PendingIcon
                    style={{ color: `rgb(255, 191, 0)` }}
                  ></PendingIcon>
                </HelpText>
              ) : (
                <HelpText text={parseUICode("help_expanding_assigned")}>
                  <CheckCircleIcon
                    style={{ color: `rgb(0, 255, 0)` }}
                  ></CheckCircleIcon>
                </HelpText>
              )}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
}

export function generateChecklistVariation(
  items: {
    [key: string]: SetVariation;
  },
  assignmentId: string,
  handleSetAssignmentAttribute: <K extends keyof SetAssignmentWithCheck>(
    assignmentId: string,
    key: K[],
    value: SetAssignmentWithCheck[K][]
  ) => void
) {
  return items
    ? Object.keys(items).map((key) => {
        const usedIn = items[key]?.usedIn.join(", ");
        const badness = items[key]?.usedInBadness;
        return (
          <ListItem key={key}>
            <ListItemButton
              selected={false}
              onClick={() =>
                handleSetAssignmentAttribute(
                  assignmentId,
                  ["selectedVariation"],
                  [key]
                )
              }
            >
              {key}
              {usedIn ? (
                <Typography sx={{ opacity: "0.5" }} level="body-md">
                  {` - ${usedIn}`}
                </Typography>
              ) : (
                ""
              )}
              {badness ? (
                <UsedInBadnessIcon badness={badness}></UsedInBadnessIcon>
              ) : null}
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
}

export function generateChecklistModule(
  items: ModuleData[],
  assignmentId: string,
  handleSetAssignmentAttribute: <K extends keyof SetAssignmentWithCheck>(
    assignmentId: string,
    key: K[],
    value: SetAssignmentWithCheck[K][]
  ) => void
) {
  return items
    ? items.map((item) => {
        return (
          <ListItem key={item.id}>
            <ListItemButton
              selected={false}
              onClick={() =>
                handleSetAssignmentAttribute(
                  assignmentId,
                  ["selectedModule"],
                  [item.id]
                )
              }
            >
              {item.name}
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
