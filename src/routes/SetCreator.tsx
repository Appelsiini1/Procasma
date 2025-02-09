import { useLoaderData, useNavigate } from "react-router";
import { dividerSX, DEVMODE } from "../constantsUI";
import {
  Box,
  Divider,
  Grid,
  List,
  Stack,
  Table,
  Tooltip,
  Typography,
} from "@mui/joy";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { useContext, useEffect, useState } from "react";
import NumberInput from "../components/NumberInput";
import ButtonComp from "../components/ButtonComp";
import SwitchComp from "../components/SwitchComp";
import StepperComp from "../components/StepperComp";
import {
  CodeAssignmentData,
  CodeAssignmentDatabase,
  CourseData,
  formatTypes,
  ModuleData,
  SetAlgoAssignmentData,
  SetAssignmentWithCheck,
  SetData,
  SetVariation,
} from "../types";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { useSet } from "../rendererHelpers/assignmentHelpers";
import { deepCopy } from "../rendererHelpers/utilityRenderer";
import { defaultSet, genericModule } from "../defaultObjects";
import { ForceToString } from "../rendererHelpers/converters";
import {
  generateChecklistExpandingAssignment,
  generateChecklistSetAssignment,
  generateChecklistVariation,
  setSelectedViaChecked,
  wrapWithCheckAndVariation,
} from "../rendererHelpers/browseHelpers";
import { ActiveObjectContext, UIContext } from "../components/Context";
import {
  calculateBadnesses,
  exportSetData,
  exportSetToDisk,
} from "../rendererHelpers/setHelpers";
import log from "electron-log/renderer";
import HelpText from "../components/HelpText";

interface LegalMove {
  module: number;
  position: number;
}

function findHighestPending(assignments: SetAssignmentWithCheck[]) {
  return assignments.reduce((highest, a) => {
    if (a.selectedModule === -2 && a.selectedPosition > highest) {
      return a.selectedPosition;
    } else {
      return highest;
    }
  }, 0);
}

export default function SetCreator() {
  const {
    activePath,
    activeSet,
    handleActiveSet,
    activeAssignment,
    handleActiveAssignment,
    activeAssignments,
    handleActiveAssignments,
    activeCourse,
    handleSelectAssignment,
    genericModuleAssignmentCount,
    handleGenericModuleAssignmentCount,
    previousPath,
    handlePreviousPath,
  }: {
    activePath: string;
    activeSet: SetData;
    handleActiveSet: (value: SetData) => void;
    activeAssignment: CodeAssignmentData;
    handleActiveAssignment: (value: CodeAssignmentData) => void;
    activeAssignments: CodeAssignmentDatabase[];
    handleActiveAssignments: (value: CodeAssignmentDatabase[]) => void;
    activeCourse: CourseData;
    selectAssignment: boolean;
    handleSelectAssignment: (value: boolean) => void;
    genericModuleAssignmentCount: number;
    handleGenericModuleAssignmentCount: (value: number) => void;
    previousPath: string;
    handlePreviousPath: (value: string) => void;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const [set, handleSet] = useSet(activeSet ?? deepCopy(defaultSet));
  const [allAssignments, setAllAssignments] = useState<
    Array<SetAssignmentWithCheck>
  >(set.assignments);

  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const [stepperState, setStepperState] = useState<number>(
    activeSet
      ? pageType === "manage" && !activeAssignment && !activeAssignments
        ? 1
        : 2
      : 0
  );
  const [allModules, setAllModules] = useState<Array<ModuleData>>([]);
  const formats: object[] = formatTypes.map((format) => {
    return {
      name: format,
    };
  });
  let ongoingSave = false;

  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<SetAlgoAssignmentData>
  >([]);

  const [selectedModule, setSelectedModule] = useState<number>(0);
  const [navigateToAssignment, setNavigateToAssignment] = useState(false);
  const [navigateToBrowse, setNavigateToBrowse] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const [assignmentVariations, setAssignmentVariations] = useState<{
    [key: string]: SetVariation;
  }>({});
  const [legalMoves, setLegalMoves] = useState<Array<LegalMove>>([]);
  const [hasGenericModule, setHasGenericModule] = useState<boolean>(null);

  const stepHeadings: string[] = [
    parseUICode("ui_module_selection"),
    parseUICode("ui_set_details"),
    parseUICode("ui_choose_tasks"),
    set.exportCGConfigs
      ? parseUICode("ui_cg_config")
      : parseUICode("ui_save_and_export"),
  ];
  let assignments: Array<React.JSX.Element> = null;
  let variations: React.JSX.Element = null;

  if (pageType === "new") {
    pageTitle = parseUICode("ui_create_new_set");
  }

  if (pageType === "manage") {
    pageTitle = parseUICode("ui_edit_set");
  }

  useEffect(() => {
    const yearNow = new Date().getFullYear();
    if (pageType === "new") handleSet("year", yearNow);
  }, []);

  async function getModules() {
    try {
      if (!activePath) {
        return;
      }

      const resultModules: ModuleData[] = await handleIPCResult(() =>
        window.api.getModulesDB(activePath)
      );

      const pendingAssignmentModule: ModuleData = {
        id: -2,
        name: parseUICode("ui_pending_assignments"),
        letters: false,
        assignments: 1,
        subjects: null,
        tags: null,
        instructions: null,
      };
      const genModule: ModuleData = genericModule;
      genModule.name = parseUICode("assignments");

      resultModules.push(pendingAssignmentModule);
      resultModules.sort((a, b) => a.id - b.id);
      if (set.module === -3 || set.targetModule === -3) {
        if (activeSet && genericModuleAssignmentCount) {
          genModule.assignments = genericModuleAssignmentCount;
        }
        resultModules.push(genModule);
        setHasGenericModule(true);
      }

      setAllModules(resultModules);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  async function getAllAssignments() {
    try {
      if (!activePath) {
        return;
      }

      // get truncated assignments
      const assignments: SetAlgoAssignmentData[] = await handleIPCResult(() =>
        window.api.getTruncatedAssignmentsFS(activePath)
      );

      // wrap with check and other fields
      const assignmentsWithCheck: SetAssignmentWithCheck[] =
        wrapWithCheckAndVariation(assignments);

      // calculate badness values for each variation based on "usedIn"
      const readyAssignments = calculateBadnesses(assignmentsWithCheck);

      setAllAssignments(readyAssignments);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  async function saveSet() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_set_save_success";
    if (!ongoingSave) {
      ongoingSave = true;

      try {
        handleSnackbar({ ["action"]: parseUICode("ui_export_status") });
        const exportedSet = exportSetData(set);
        if (pageType !== "manage" || exportedSet.id === null) {
          const newID = await handleIPCResult(() =>
            window.api.getHash(JSON.stringify(exportedSet))
          );
          exportedSet.id = newID;
        }

        await handleIPCResult(() =>
          window.api.addOrUpdateSetFS(activePath, exportedSet)
        );
        if (exportedSet.export) {
          const result = await exportSetToDisk(exportedSet, activeCourse);
          snackbarText = result.snackbarText;
          snackbarSeverity = result.snackbarSeverity;
        }
      } catch (err) {
        snackbarText = err.message;
        snackbarSeverity = "error";
      }
      handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
    }
  }

  function handleUpdateCGid(assignmentId: string, CGid: string) {
    setAllAssignments((prevAssignments) =>
      prevAssignments.map((prev) => {
        const newAssignment: SetAssignmentWithCheck = prev;
        newAssignment.isChecked = false;
        if (prev.value.assignmentID === assignmentId) {
          prev.value.variations[prev.selectedVariation].cgConfig.id = CGid;
        }
        return newAssignment;
      })
    );
  }

  function handleSetAssignmentAttribute<K extends keyof SetAssignmentWithCheck>(
    assignmentId: string,
    keys: K[],
    values: SetAssignmentWithCheck[K][]
  ) {
    setAllAssignments((prevAssignments) =>
      prevAssignments.map((prev) => {
        const newAssignment: SetAssignmentWithCheck = prev;
        newAssignment.isChecked = false;
        if (prev.value.assignmentID === assignmentId) {
          keys.forEach((newKey, index) => {
            newAssignment[newKey] = values[index];
          });
        }
        return newAssignment;
      })
    );
  }

  async function handleOpenAssignment() {
    try {
      handleActiveSet(set);

      const assignmentsResult = await handleIPCResult(() =>
        window.api.handleGetAssignmentsFS(
          activePath,
          selectedAssignments[0].assignmentID
        )
      );

      handleActiveAssignment(assignmentsResult[0]);
      setNavigateToAssignment(true);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  async function handleDeleteAssignment() {
    handleSetAssignmentAttribute(
      selectedAssignments[0].assignmentID,
      ["selectedModule"],
      [-1]
    );
  }

  variations = (
    <Box width="100%">
      <List>
        {assignmentVariations
          ? generateChecklistVariation(
              assignmentVariations,
              selectedAssignments[0]?.assignmentID,
              handleSetAssignmentAttribute
            )
          : null}
      </List>
    </Box>
  );

  function getPrevOrNextAssignments(isPrev: boolean): SetAssignmentWithCheck[] {
    const key: "previous" | "next" = isPrev ? "previous" : "next";
    return allAssignments.filter((a) =>
      selectedAssignments[0]?.[key]?.find((id) => a.value.assignmentID === id)
    );
  }

  function prevOrNextAssignmentsWindow(isPrev: boolean) {
    function moveAssignmentIntoPending(id: string) {
      const numAssignmentsPending = allAssignments.filter(
        (a) => a.selectedModule === -2
      )?.length;

      handleSetAssignmentAttribute(
        id,
        ["selectedModule", "selectedPosition"],
        [-2, numAssignmentsPending + 1]
      );
    }

    return (
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="flex-start"
        spacing={2}
      >
        <Box
          minHeight="1rem"
          width="100%"
          sx={{
            border: "1px solid lightgrey",
            borderRadius: "0.5rem",
          }}
        >
          <List>
            {selectedAssignments[0]
              ? generateChecklistExpandingAssignment(
                  getPrevOrNextAssignments(isPrev),
                  moveAssignmentIntoPending
                )
              : null}
          </List>
        </Box>
      </Stack>
    );
  }

  /**
   * Use the target module and position in the set state to
   * define where to put new assignments from the browser.
   *
   * If there are multiple active assignments, try to put them in the
   * desired modules/positions. In occupied cases put in the pending module.
   */
  function handleInsertActiveAssignments() {
    const assignmentsInSetModule = allModules.find((m) => m.id === set.module);

    setAllAssignments(() => {
      let newAssignments: SetAssignmentWithCheck[] = deepCopy(allAssignments);

      if (activeAssignments.length === 1) {
        const assignmentToUpdate = newAssignments.find(
          (newAssignment) =>
            newAssignment.value.assignmentID === activeAssignments[0].id
        );

        assignmentToUpdate.selectedModule = set.targetModule;
        assignmentToUpdate.selectedPosition = set.targetPosition;

        return newAssignments;
      }

      let nextPosition = findHighestPending(allAssignments) + 1;
      activeAssignments.map((active) => {
        // Check for a conflicting assignment
        const activePosition = parseInt(
          active.position.length > 0 ? active.position[0] : "1"
        );
        const activeModule = set.fullCourse ? active.module : set.module;
        const conflictingAssignment = newAssignments.findIndex(
          (a) =>
            a.selectedModule === activeModule &&
            a.selectedPosition === activePosition
        );

        // Update the assignment to be inserted
        const assignmentToUpdate = newAssignments.find(
          (newAssignment) => newAssignment.value.assignmentID === active.id
        );

        if (
          conflictingAssignment > -1 ||
          activePosition > assignmentsInSetModule?.assignments
        ) {
          assignmentToUpdate.selectedModule = -2;
          assignmentToUpdate.selectedPosition = nextPosition;
          nextPosition++;
        } else {
          assignmentToUpdate.selectedModule = activeModule;
          assignmentToUpdate.selectedPosition = activePosition;
        }
      });

      return newAssignments;
    });
  }

  // fetch modules on page load
  useEffect(() => {
    if (!activeSet) {
      getAllAssignments();
      //handleActiveSet(set);
    }
    getModules();
    handleHeaderPageName("ui_create_new_set");

    // else if (activeAssignments && setFromBrowse) {
    //   const newSet = set;
    //   for (const tempAssignment of activeAssignments) {
    //     const foundAssignment = allAssignments.find((value) => {
    //       if (tempAssignment.id === value.value.assignmentID) {
    //         return true;
    //       } else {
    //         return false;
    //       }
    //     });
    //     foundAssignment.selectedModule = -2;
    //     newSet.assignments.push(foundAssignment);
    //   }
    //   handleActiveAssignments(null);
    // }
  }, []);

  useEffect(() => {
    if (allModules.length > 0) {
      if (activeAssignments) {
        handleInsertActiveAssignments();
        handleSet("targetModule", null);
        handleSet("targetPosition", null);
        handleActiveAssignments(undefined);
      }
    }
  }, [allModules]);

  // Update the selected assignments counter
  useEffect(() => {
    const numChecked = setSelectedViaChecked(
      allAssignments,
      setSelectedAssignments
    );

    const newSelectedModule = allAssignments?.find(
      (a) => a.isChecked
    )?.selectedModule;

    // resets all isChecked states if recently deleted an assignment
    // and the selectedModule is module -1
    if (newSelectedModule === -1) {
      setAllAssignments((prev) =>
        prev.map((a) => {
          a.isChecked = false;
          return a;
        })
      );
    }

    const pending = allAssignments.filter((a) => a.selectedModule === -2);
    let highestPosition = 1;
    pending.forEach((p) => {
      if (p.selectedPosition > highestPosition) {
        highestPosition = p.selectedPosition;
      }
    });

    setAllModules((prev) => {
      return prev.map((m) => {
        if (m.id === -2) {
          m.assignments = highestPosition;
        }
        return m;
      });
    });

    setSelectedModule(newSelectedModule);

    setNumSelected(numChecked);

    // update the set
    handleSet("assignments", allAssignments);
  }, [allAssignments]);

  useEffect(() => {
    // if one assignment is selected, use its positions and variations in states
    if (numSelected === 1) {
      const possiblePositions = selectedAssignments[0].position;
      setAssignmentVariations(selectedAssignments[0].variations);

      const newMoves: LegalMove[] = [];

      allModules.forEach((module) => {
        const assignmentsCount = module.assignments;
        // check if spot empty in allAssignments
        Array(assignmentsCount)
          .fill(1)
          .forEach((a, position) => {
            position += 1;
            if (
              possiblePositions.find((pp) => pp === position) &&
              !allAssignments.find(
                (assignment) =>
                  assignment.selectedModule === module.id &&
                  assignment.selectedPosition === position
              )
            ) {
              const move: LegalMove = { module: module.id, position: position };
              newMoves.push(move);
            }
          });
      });

      setLegalMoves(newMoves);
    } else {
      setAssignmentVariations({});
      setLegalMoves(undefined);
    }
  }, [selectedAssignments]);

  // Navigates to an assignment page by listening to the active assignment.
  useEffect(() => {
    if (activeAssignment && navigateToAssignment && activeSet) {
      setNavigateToAssignment(false);

      const activeAssignmentType: string = activeAssignment.assignmentType;
      if (activeAssignmentType === "assignment") {
        navigate("/inputCodeAssignment");
      }
    }
  }, [activeAssignment, navigateToAssignment]);

  // Navigates to the assignment browse page by listening to activeAssignments
  useEffect(() => {
    if (
      activeAssignments &&
      previousPath === "/setCreator" &&
      navigateToBrowse
    ) {
      setNavigateToBrowse(false);
      navigate("/AssignmentBrowse");
    }
  }, [activeAssignments, previousPath, navigateToBrowse]);

  // checks if target module and position are set before priming
  // activeAssignments for navigation to the browse page
  useEffect(() => {
    try {
      if (
        typeof set.targetModule === "number" &&
        typeof set.targetPosition === "number" &&
        navigateToBrowse
      ) {
        handleActiveSet(set);
        handleActiveAssignments([]);
        handlePreviousPath("/setCreator");
      }
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }, [set.targetModule, set.targetPosition, navigateToBrowse]);

  function moduleWindow(
    moduleName: string,
    moduleId: number,
    assignmentsCount: number,
    showVarations: boolean
  ) {
    function moveToPosition(position: number) {
      handleSetAssignmentAttribute(
        selectedAssignments[0].assignmentID,
        ["selectedPosition", "selectedModule"],
        [position, moduleId]
      );
    }

    const legalMovePositions = legalMoves
      ?.filter((move) => move.module === moduleId)
      ?.map((move) => move.position);

    /**
     * Set the target module and positions for when adding an assignment
     * to a specific spot for the assignment browse function.
     */
    function handleTargetPosition(position: number) {
      handleSet("targetModule", moduleId);
      handleSet("targetPosition", position);
      handleSelectAssignment(true);
      setNavigateToBrowse(true);
    }

    const variationWindow = () => {
      if (!showVarations) {
        return <></>;
      }
      return (
        <>
          {selectedAssignments[0]?.previous?.length > 0 ? (
            <>
              <Typography level="h4">
                {`${parseUICode("ui_prev_part")}`}
              </Typography>
              {prevOrNextAssignmentsWindow(true)}
            </>
          ) : null}
          <Typography level="h4">
            {`${parseUICode("ui_variations")}`}
          </Typography>
          {variations}
          {selectedAssignments[0]?.next?.length > 0 ? (
            <>
              <Typography level="h4">
                {`${parseUICode("ui_next_part")}`}
              </Typography>
              {prevOrNextAssignmentsWindow(false)}
            </>
          ) : null}
        </>
      );
    };

    assignments = generateChecklistSetAssignment(
      allAssignments.filter((a) => a.selectedModule === moduleId),
      setAllAssignments,
      assignmentsCount,
      legalMovePositions,
      moveToPosition,
      handleOpenAssignment,
      handleDeleteAssignment,
      handleTargetPosition,
      variationWindow,
      moduleId === -2 ? true : false
    );

    return (
      <Box key={moduleId} sx={{ marginRight: "8px" }}>
        <Typography level="h4">{moduleName}</Typography>
        <Box
          minHeight="4rem"
          width="100%"
          sx={{
            border: "1px solid lightgrey",
            borderRadius: "0.5rem",
            backgroundColor: "var(--background)",
            boxShadow: "sm",
          }}
        >
          <List
            sx={{
              "--ListItem-minHeight": "3rem",
              overflow: "auto",
            }}
          >
            {assignments}
          </List>
        </Box>

        <div className="emptySpace1" />
      </Box>
    );
  }

  function moduleWindows() {
    let modulesToDisplay: ModuleData[] = [];
    if (typeof set.module === "number") {
      // full course is not set so display only the set module
      // and the pending assignments (module -2)
      modulesToDisplay = allModules.filter(
        (m) => m.id === set.module || m.id === -2
      );
    } else {
      modulesToDisplay = allModules.filter((m) => m.id);
    }
    const allToDisplay = modulesToDisplay.map((module) =>
      moduleWindow(
        module.name,
        module.id,
        module.assignments,
        selectedModule === module.id ? true : false
      )
    );
    const anyPending = allAssignments.some((a) => a.selectedModule === -2);
    return (
      <>
        <Grid xs={anyPending ? 6 : 10}>
          <Stack
            height="40rem"
            maxHeight="60vh"
            width="100%"
            sx={{
              paddingLeft: "8px",
              border: "1px solid lightgrey",
              borderRadius: "0.5rem",
              backgroundColor: "var(--content-background)",
              overflowX: "hidden",
            }}
            direction="column"
            justifyContent="start"
            alignItems="start"
          >
            <List sx={{ width: "calc(100% - 8px)", overflowX: "hidden" }}>
              {allToDisplay.slice(1)}
            </List>
          </Stack>
        </Grid>
        <Grid xs={anyPending ? 6 : 2}>
          <Box
            sx={{
              marginLeft: "16px",
              maxHeight: "60vh",
              overflowX: "hidden",
              padding: "8px",
            }}
          >
            {allToDisplay.slice(0, 1)}
          </Box>
        </Grid>
      </>
    );
  }

  const handleStepperState = (navigation: number, absolute?: boolean) => {
    setStepperState((prevState) => {
      const newState: number = absolute ? navigation : prevState + navigation;

      // get all assignments if "full course" enabled and navigating to page 3
      if (set?.fullCourse && newState === 2) {
        /*if (!activeSet) {
          getAllAssignments();
        }*/
      }

      if (newState >= 0 && newState <= 3) {
        return newState;
      }
      return prevState;
    });
  };

  function finalPageAssignments() {
    const filteredAssignments = allAssignments.filter(
      (a) => a.selectedModule !== -1
    );

    return filteredAssignments.map((a) => {
      const assignment = a.value;
      const variation = a.selectedVariation;

      let title = assignment.title;
      title += variation
        ? ` - ${parseUICode("ui_variation")} ${variation}`
        : "";

      return (
        <tr key={assignment.assignmentID}>
          <td style={{ width: "25%" }}>
            <Typography level="h4">{title}</Typography>
          </td>
          <td>
            <InputField
              fieldKey="caSetName"
              defaultValue={assignment.variations[variation]?.cgConfig?.id}
              onChange={(value: string) =>
                handleUpdateCGid(assignment.assignmentID, value)
              }
            />
          </td>
        </tr>
      );
    });
  }

  function handleNext() {
    // log.debug(stepperState, set.fullCourse, allModules);
    if (stepperState === 0 && !set.fullCourse && set.module == null) {
      handleSnackbar({ ["error"]: parseUICode("error_no_modules_in_set") });
    } else if (stepperState === 1 && (!set.name || !set.format)) {
      if (!set.name) {
        handleSnackbar({ error: parseUICode("error_add_set_name") });
      } else {
        handleSnackbar({ error: parseUICode("error_no_format") });
      }
    } else if (
      stepperState === 1 &&
      set.fullCourse &&
      allModules.length === 1
    ) {
      const copyModules = allModules;
      copyModules.push({ ...genericModule, name: parseUICode("assignments") });
      setAllModules(copyModules);
      handleSet("module", -3);
      handleActiveSet(set);
      handleGenericModuleAssignmentCount(5);

      setHasGenericModule(true);
      handleStepperState(1);
    } else if (
      (stepperState === 0 && set.fullCourse) ||
      (stepperState === 0 && !set.fullCourse && allModules.length > 0) ||
      stepperState > 0
    ) {
      // log.debug(allModules);
      setHasGenericModule(false);
      handleStepperState(1);
    } else {
      handleSnackbar({ ["error"]: parseUICode("error_no_modules_in_set") });
    }
  }

  function handleAddAssignment() {
    const copyModules: ModuleData[] = [];
    allModules.forEach((value) => {
      if (value.id === -3) {
        value.assignments += 1;
      }
      copyModules.push(value);
      setAllModules(copyModules);
      handleGenericModuleAssignmentCount(genericModuleAssignmentCount + 1);
    });
  }

  const modulesWithoutPending = allModules.filter((module) => module?.id > -2);

  return (
    <>
      <StepperComp
        stepperState={stepperState}
        headings={stepHeadings}
      ></StepperComp>

      <div className="emptySpace2" />
      {stepperState === 0 ? (
        <>
          <Typography level="h1">
            {parseUICode("ui_module_selection")}
          </Typography>
          <Table borderAxis="none">
            <tbody>
              <tr key="caFullCourse">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">
                    {parseUICode("ui_full_course")}
                  </Typography>
                </td>
                <td>
                  <SwitchComp
                    checked={set.fullCourse}
                    setChecked={(value: boolean) =>
                      handleSet("fullCourse", value)
                    }
                  />
                </td>
              </tr>

              <tr key="caModule">
                <td>
                  <Typography level="h4">{parseUICode("ui_module")}</Typography>
                </td>
                <td>
                  <Dropdown
                    name="caModuleInput"
                    options={modulesWithoutPending}
                    labelKey="name"
                    defaultValue={ForceToString(set?.module)}
                    disabled={
                      set.fullCourse || (allModules.length === 1 ? true : false)
                    }
                    onChange={(value: string) => {
                      handleSet(
                        "module",
                        allModules.find((m) => m.name === value)?.id
                      );
                    }}
                  ></Dropdown>
                </td>
              </tr>
            </tbody>
          </Table>
        </>
      ) : (
        ""
      )}

      {stepperState === 1 ? (
        <>
          <Typography level="h1">{parseUICode("ui_set_details")}</Typography>
          <Typography
            level="body-lg"
            fontStyle={"italic"}
            textColor={"red"}
            sx={{ marginTop: "1em" }}
          >
            {"* " + parseUICode("ui_required_field")}
          </Typography>
          <Table borderAxis="none">
            <tbody>
              <tr key="asSetName">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">
                    {parseUICode("ui_set_name") + " *"}
                  </Typography>
                </td>
                <td>
                  <InputField
                    fieldKey="asSetNameInput"
                    defaultValue={ForceToString(set?.name)}
                    onChange={(value: string) => handleSet("name", value, true)}
                  />
                </td>
              </tr>

              <tr key="asVisibleHeader">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">
                    {parseUICode("ui_custom_header")}
                  </Typography>
                </td>
                <td>
                  <InputField
                    fieldKey="asVisibleHeaderInput"
                    defaultValue={ForceToString(set?.visibleHeader)}
                    onChange={(value: string) =>
                      handleSet("visibleHeader", value, true)
                    }
                  />
                </td>
              </tr>

              <tr key="asYear">
                <td>
                  <Typography level="h4">{parseUICode("ui_year")}</Typography>
                </td>
                <td>
                  <NumberInput
                    disabled={false}
                    value={Number(set?.year)}
                    onChange={(value: number) => handleSet("year", value)}
                  ></NumberInput>
                </td>
              </tr>

              <tr key="asPeriod">
                <td>
                  <Typography level="h4">
                    {parseUICode("ui_study_period")}
                  </Typography>
                </td>
                <td>
                  <NumberInput
                    disabled={false}
                    value={Number(set?.period)}
                    onChange={(value: number) => handleSet("period", value)}
                  ></NumberInput>
                </td>
              </tr>

              <tr key="asExportSet">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">
                    {parseUICode("ui_export_set")}
                  </Typography>
                </td>
                <td>
                  <SwitchComp
                    checked={set?.export}
                    setChecked={(value: boolean) => handleSet("export", value)}
                  />
                </td>
              </tr>

              <tr key="asFormat">
                <td>
                  <Typography level="h4">
                    {parseUICode("ui_format") + " *"}
                  </Typography>
                </td>
                <td>
                  <Dropdown
                    name="asModuleInput"
                    options={formats}
                    labelKey="name"
                    defaultValue={ForceToString(set?.format)}
                    onChange={(value: string) => handleSet("format", value)}
                  ></Dropdown>
                </td>
              </tr>

              <tr key="asExportCodeGrade">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">
                    {parseUICode("ui_export_codegrade_config")}
                  </Typography>
                </td>
                <td>
                  <SwitchComp
                    checked={set?.exportCGConfigs}
                    setChecked={(value: boolean) =>
                      handleSet("exportCGConfigs", value)
                    }
                  />
                </td>
              </tr>

              <tr key="asReplaceExisting">
                <td style={{ width: "25%" }}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={1}
                  >
                    <Grid xs={10}>
                      <Typography level="h4">
                        {parseUICode("ui_replace_existing")}
                      </Typography>
                    </Grid>
                    <Grid xs={2}>
                      <HelpText text={parseUICode("help_replace_existing")} />
                    </Grid>
                  </Grid>
                </td>
                <td>
                  <SwitchComp
                    checked={
                      set?.replaceExisting === undefined
                        ? false
                        : set?.replaceExisting
                    }
                    setChecked={(value: boolean) =>
                      handleSet("replaceExisting", value)
                    }
                  />
                </td>
              </tr>

              <tr key="asShowLevels">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">
                    {parseUICode("ui_show_levels")}
                  </Typography>
                </td>
                <td>
                  <SwitchComp
                    checked={
                      set?.showLevels === undefined ? false : set?.showLevels
                    }
                    setChecked={(value: boolean) =>
                      handleSet("showLevels", value)
                    }
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </>
      ) : (
        ""
      )}

      {stepperState === 2 ? (
        <>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
          >
            <Typography level="h1">{parseUICode("ui_choose_tasks")}</Typography>
          </Stack>

          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={1}
            sx={{ paddingRight: "16px" }}
          >
            {moduleWindows()}
          </Grid>

          {hasGenericModule ? (
            <ButtonComp
              buttonType="normal"
              onClick={() => handleAddAssignment()}
              ariaLabel={parseUICode("ui_add_assignment")}
            >
              {parseUICode("ui_add_assignment")}
            </ButtonComp>
          ) : (
            ""
          )}
        </>
      ) : (
        ""
      )}

      {stepperState === 3 ? (
        <>
          <Typography level="h1">
            {set.exportCGConfigs
              ? parseUICode("ui_codegrade_autotest")
              : parseUICode("ui_save_and_export_set")}
          </Typography>
          {set.exportCGConfigs ? (
            <>
              {" "}
              <div className="emptySpace1" />
              <Typography level="h4">
                {`${parseUICode("ui_module")} ${ForceToString(
                  set.module
                )} - CodeGrade ${parseUICode("ui_assignment")} ${parseUICode(
                  "ui_ids"
                )}`}
              </Typography>
              <Table borderAxis="none">
                <tbody>{finalPageAssignments()}</tbody>
              </Table>
              <Divider sx={dividerSX} role="presentation" />
            </>
          ) : (
            ""
          )}
        </>
      ) : (
        ""
      )}

      <div className="emptySpace2" style={{ marginTop: "auto" }} />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <ButtonComp
          buttonType="normal"
          onClick={() => navigate(-1)}
          ariaLabel={parseUICode("ui_aria_close")}
        >
          {parseUICode("ui_close")}
        </ButtonComp>

        {stepperState > 0 ? (
          <ButtonComp
            buttonType="normal"
            onClick={() => handleStepperState(-1)}
            ariaLabel={parseUICode("ui_aria_nav_previous")}
          >
            {parseUICode("ui_previous")}
          </ButtonComp>
        ) : (
          ""
        )}

        {stepperState < 3 ? (
          <ButtonComp
            buttonType="normal"
            onClick={() => handleNext()}
            ariaLabel={parseUICode("ui_aria_nav_next")}
          >
            {parseUICode("ui_next")}
          </ButtonComp>
        ) : (
          ""
        )}

        {stepperState === 3 ? (
          <>
            <ButtonComp
              buttonType="normal"
              onClick={() => {
                saveSet();
                navigate("/");
              }}
              ariaLabel={parseUICode("ui_save")}
            >
              {parseUICode("ui_save")}
            </ButtonComp>
            {/*<ButtonComp
              buttonType="normal"
              onClick={() => console.log("export CG configs")}
              ariaLabel={parseUICode("ui_aria_export_cg_configs")}
              disabled={true}
            >
              {parseUICode("ui_export")}
            </ButtonComp>*/}
          </>
        ) : (
          ""
        )}
      </Stack>
      <div className="emptySpace2" style={{ marginTop: "auto" }} />
      {DEVMODE ? (
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <ButtonComp
            buttonType="debug"
            onClick={() => log.debug(allAssignments)}
            ariaLabel={" debug "}
          >
            log allAssignments
          </ButtonComp>
          <ButtonComp
            buttonType="debug"
            onClick={() => log.debug(set)}
            ariaLabel={" debug "}
          >
            log set
          </ButtonComp>
          <ButtonComp
            buttonType="debug"
            onClick={() => log.debug(activeSet)}
            ariaLabel={" debug "}
          >
            log activeSet
          </ButtonComp>
          <ButtonComp
            buttonType="debug"
            onClick={() => log.debug(allModules)}
            ariaLabel={" debug "}
          >
            log allModules
          </ButtonComp>
        </Stack>
      ) : (
        ""
      )}
    </>
  );
}
