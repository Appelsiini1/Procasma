import {
  Box,
  Card,
  Checkbox,
  Chip,
  Divider,
  ListDivider,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/joy";
import HistoryIcon from "@mui/icons-material/History";
import ExpandIcon from "@mui/icons-material/Expand";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  CodeAssignmentData,
  CodeAssignmentDatabase,
  ModuleData,
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

/**
 * Update the unique filter options to be displayed and set checked to false.
 * @param elements Any array of filter string values
 * @param setter The setter for the unique filter
 */
export function handleUpdateFilter(
  elements: string[],
  setter: React.Dispatch<React.SetStateAction<filterState[]>>,
  defaultChecked?: boolean
) {
  const filters: filterState[] = [];

  elements.forEach((element) => {
    const uniqueFilter: filterState = {
      isChecked: defaultChecked ?? false,
      value: element,
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
    const newState = [...prevState];
    const index = newState.findIndex((filter) => filter.value === value);

    if (index !== -1) {
      if (singleCheckOnly) {
        newState.forEach((filter) => (filter.isChecked = false));
      }
      newState[index].isChecked = check;
    }

    return newState;
  });
}

const UsedInBadnessIcon = ({
  children,
  badness,
}: {
  children?: React.ReactNode;
  badness: number;
}) => {
  let safeBadness = 0;
  if (badness >= 0 && badness <= 1) {
    safeBadness = badness;
  }
  const clampedBadness = Math.max(0, Math.min(1, safeBadness));

  // Convert the badness value to a channel value (0-255)
  const badValue = Math.round(clampedBadness * 255);
  const colorWithOpacity = (opacity: number) =>
    `rgba(${badValue}, ${255 - badValue}, 0, ${opacity})`;
  const color = colorWithOpacity(1.0);

  return (
    <Chip
      sx={{
        backgroundColor: colorWithOpacity(0.2),
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {children}
        <HelpText text={parseUICode("help_badness")}>
          <HistoryIcon style={{ color }}></HistoryIcon>
        </HelpText>
      </Box>
    </Chip>
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
    case null:
      return "";
    default:
      throw new Error("Unsupported module type in getModuleLetter()!");
  }
}

function sortAssignments(a: CodeAssignmentData, b: CodeAssignmentData) {
  if (a.module < b.module) {
    return -1;
  } else if (a.module > b.module) {
    return 1;
  } else if (a.module === b.module) {
    if (Math.min(...a.position) < Math.min(...b.position)) {
      return -1;
    } else if (Math.min(...a.position) > Math.min(...b.position)) {
      return 1;
    }
  }

  return 0;
}

export function generateChecklist(
  items: WithCheckWrapper[],
  setItems: React.Dispatch<React.SetStateAction<WithCheckWrapper[]>>,
  handleOpen: (id: string) => void,
  isAssignment?: boolean,
  isSet?: boolean,
  disabled?: boolean
) {
  items.sort((a, b) => {
    if (isSet) {
      const valueStr = new String(a.value?.name);
      return valueStr.localeCompare(b.value?.name);
    } else if (!isAssignment && !isSet) {
      const valueStr = new String(a.value?.title);
      return valueStr.localeCompare(b.value?.title);
    } else {
      return sortAssignments(a.value, b.value);
    }
  });
  return items
    ? items.map((item: any) => {
        let titleOrName = "";
        const variation = item?.selectedVariation;
        if (isAssignment) {
          const assignment: CodeAssignmentDatabase = item.value;
          let titlePart: string = "";
          if (currentCourse.moduleType)
            titlePart += `${getModuleLetter(currentCourse.moduleType)}${
              assignment?.module
            }`;
          titleOrName = `${titlePart}${parseUICode("assignment_letter")}${
            assignment?.position
          } - 
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
              sx={{ userSelect: "none" }}
              disabled={disabled}
              onClick={() =>
                handleCheckArray(item.value, !item.isChecked, setItems)
              }
              onDoubleClick={() => handleOpen(item?.value?.id)}
            >
              <Typography level="body-md" sx={{ fontWeight: "normal" }}>
                {titleOrName}
              </Typography>
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
  variationElement: () => JSX.Element,
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
          const variation = item?.selectedVariation;
          const assignment: SetAlgoAssignmentData = item.value;

          const badness =
            items[index]?.value?.variations?.[variation]?.usedInBadness;

          const isExpanding =
            assignment?.previous?.length > 0 || assignment?.next?.length > 0;

          return (
            <Box
              key={listIndex}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                justifyContent: "center",
              }}
            >
              <ListItem
                startAction={
                  isPendingModule ? (
                    ""
                  ) : (
                    <Chip>
                      <Typography level="title-md">
                        {`${parseUICode("assignment_letter")}${listIndex}`}
                      </Typography>
                    </Chip>
                  )
                }
                sx={{ width: "100%" }}
              >
                <ListItemButton
                  selected={item.isChecked}
                  onClick={() =>
                    handleCheckArray(
                      item.value,
                      !item.isChecked,
                      setItems,
                      true
                    )
                  }
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    overflow: "auto",
                  }}
                >
                  <Typography
                    level="body-md"
                    sx={{ fontWeight: "normal", marginLeft: "4px" }}
                  >
                    {assignment?.title}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      justifyContent: "flex-end",
                    }}
                  >
                    {isExpanding ? (
                      <HelpText text={parseUICode("ui_exp_assignment")}>
                        <ExpandIcon color={"primary"} />
                      </HelpText>
                    ) : null}

                    <UsedInBadnessIcon badness={badness}>
                      <HelpText
                        text={`${parseUICode("ui_variation")} ${variation}`}
                      >
                        <Typography level="body-md" sx={{ fontWeight: "bold" }}>
                          {variation}
                        </Typography>
                      </HelpText>
                    </UsedInBadnessIcon>
                  </Box>
                </ListItemButton>
              </ListItem>
              {item.isChecked ? (
                <Card
                  sx={{
                    margin: "8px",
                    marginBottom: "16px",
                    padding: "8px",
                    overflow: "auto",
                    width: "fit-content",
                    maxWidth: "calc(100% - 36px)",
                    backgroundColor: "var(--content-background-inner)",
                    boxShadow: "sm",
                  }}
                >
                  <Stack
                    gap={1}
                    direction="row"
                    sx={{
                      alignItems: "center",
                      justifyContent: "start",
                    }}
                  >
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
                  </Stack>
                  <Typography level="h4">
                    {`${parseUICode("ui_positioning")}`}
                  </Typography>
                  <Stack gap={1}>
                    <Stack
                      gap={1}
                      direction="row"
                      sx={{
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "8px",
                      }}
                    >
                      <Typography level="body-md">
                        {`${parseUICode("ui_module")}`}
                      </Typography>
                      <Typography level="body-md" sx={{ fontWeight: "bold" }}>
                        {item.value.module}
                      </Typography>
                      <Divider orientation="vertical" />
                      <Typography level="body-md">
                        {`${parseUICode("ui_positions")}`}
                      </Typography>
                      <Typography level="body-md" sx={{ fontWeight: "bold" }}>
                        {item.value.position.join(", ")}
                      </Typography>
                    </Stack>

                    {variationElement()}
                  </Stack>
                </Card>
              ) : (
                ""
              )}
            </Box>
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
              <Typography level="body-md" sx={{ fontWeight: "normal" }}>
                {item.value.title}
              </Typography>
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
    ? Object.keys(items).map((key, index, array) => {
        const usedIn = items[key]?.usedIn.join(", ");
        const badness = items[key]?.usedInBadness;
        return (
          <div key={key}>
            <ListItem>
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {badness ? (
                    <UsedInBadnessIcon badness={badness}>
                      <HelpText text={`${parseUICode("ui_variation")} ${key}`}>
                        <Typography level="body-md" sx={{ fontWeight: "bold" }}>
                          {key}
                        </Typography>
                      </HelpText>
                    </UsedInBadnessIcon>
                  ) : null}
                  {usedIn ? (
                    <Typography sx={{ opacity: "0.5" }} level="body-md">
                      {usedIn}
                    </Typography>
                  ) : (
                    ""
                  )}
                </Box>
              </ListItemButton>
            </ListItem>
            {index < array.length - 1 && <ListDivider />}
          </div>
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
  setUniques: React.Dispatch<React.SetStateAction<filterState[]>>,
  parseUICodes?: boolean
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
              <Typography level="body-md" sx={{ fontWeight: "normal" }}>
                {parseUICodes
                  ? parseUICode(`ui_${String(unique.value)}`)
                  : String(unique.value)}
              </Typography>
            </ListItemButton>
          </ListItem>
        );
      })
    : null;
  return filters;
}
