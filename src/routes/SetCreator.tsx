import { useLoaderData, useNavigate } from "react-router-dom";
import { dividerSX } from "../constantsUI";
import { Box, Divider, Grid, List, Stack, Table, Typography } from "@mui/joy";
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
import { deepCopy } from "../rendererHelpers/utility";
import { defaultSet } from "../defaultObjects";
import { ForceToString } from "../generalHelpers/converters";
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

interface LegalMove {
  module: number;
  position: number;
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
  }: {
    activePath: string;
    activeSet: SetData;
    handleActiveSet: (value: SetData) => void;
    activeAssignment: CodeAssignmentData;
    handleActiveAssignment: (value: CodeAssignmentData) => void;
    activeAssignments: CodeAssignmentDatabase[];
    handleActiveAssignments: (value: CodeAssignmentDatabase[]) => void;
    activeCourse: CourseData;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar, setIPCLoading } =
    useContext(UIContext);
  const [set, handleSet] = useSet(activeSet ?? deepCopy(defaultSet));
  const [allAssignments, setAllAssignments] = useState<
    Array<SetAssignmentWithCheck>
  >(set.assignments);

  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const [stepperState, setStepperState] = useState<number>(activeSet ? 2 : 0);
  const [allModules, setAllModules] = useState<Array<ModuleData>>([]);
  const formats: object[] = formatTypes.map((format) => {
    return {
      name: format,
    };
  });

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

  const stepHeadings: string[] = [
    parseUICode("ui_module_selection"),
    parseUICode("ui_set_details"),
    parseUICode("ui_choose_tasks"),
    parseUICode("ui_cg_config"),
  ];
  let assignments: Array<React.JSX.Element> = null;
  let variations: React.JSX.Element = null;

  if (pageType === "new") {
    pageTitle = parseUICode("ui_create_new_set");
  }

  if (pageType === "manage") {
    pageTitle = parseUICode("ui_edit_set");
  }

  async function getModules() {
    try {
      if (!activePath) {
        return;
      }

      const resultModules: ModuleData[] = await handleIPCResult(
        setIPCLoading,
        () => window.api.getModulesDB(activePath)
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

      resultModules.push(pendingAssignmentModule);
      resultModules.sort((a, b) => a.id - b.id);

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
      const assignments: SetAlgoAssignmentData[] = await handleIPCResult(
        setIPCLoading,
        () => window.api.getTruncatedAssignmentsFS(activePath)
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
    try {
      const exportedSet = exportSetData(set);

      console.log("exportedSet: ", exportedSet);
      if (pageType === "manage") {
        await handleIPCResult(setIPCLoading, () =>
          window.api.updateSetFS(activePath, exportedSet)
        );
        if (exportedSet.export) {
          const result = await exportSetToDisk(
            exportedSet,
            setIPCLoading,
            activeCourse
          );
          snackbarText = result.snackbarText;
          snackbarSeverity = result.snackbarSeverity;
        }
      } else {
        await handleIPCResult(setIPCLoading, () =>
          window.api.addSetFS(activePath, exportedSet)
        );
        if (exportedSet.export) {
          const result = await exportSetToDisk(
            exportedSet,
            setIPCLoading,
            activeCourse
          );
          snackbarText = result.snackbarText;
          snackbarSeverity = result.snackbarSeverity;
        }
      }
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
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

      const assignmentsResult = await handleIPCResult(setIPCLoading, () =>
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
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="flex-start"
      spacing={2}
    >
      <Box
        minHeight="4rem"
        width="100%"
        sx={{
          border: "2px solid lightgrey",
          borderRadius: "0.5rem",
        }}
      >
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
    </Stack>
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
            border: "2px solid lightgrey",
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

  // fetch modules on page load
  useEffect(() => {
    if (!activeSet) {
      getAllAssignments();
      //handleActiveSet(set);
    }
    getModules();
    handleHeaderPageName("ui_create_new_set");

    // use the target module and position in the set state to
    // define the use of the new assignment from the browser
    if (activeAssignments) {
      allAssignments.map((a) => {
        if (a.value.assignmentID === activeAssignments[0]?.id) {
          a.selectedModule = set.targetModule;
          a.selectedPosition = set.targetPosition;
          handleSet("targetModule", null);
          handleSet("targetPosition", null);
        }
        return a;
      });
      handleActiveAssignments(undefined);
    }
  }, []);

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
    if (activeAssignments && navigateToBrowse) {
      setNavigateToBrowse(false);
      navigate("/AssignmentBrowse");
    }
  }, [activeAssignments, navigateToBrowse]);

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
      setNavigateToBrowse(true);
    }

    assignments = generateChecklistSetAssignment(
      allAssignments.filter((a) => a.selectedModule === moduleId),
      setAllAssignments,
      assignmentsCount,
      legalMovePositions,
      moveToPosition,
      handleOpenAssignment,
      handleDeleteAssignment,
      handleTargetPosition,
      moduleId === -2 ? true : false
    );

    return (
      <div key={moduleId}>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={1}
        >
          <Grid xs={7}>
            <Typography level="h4">{moduleName}</Typography>
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="flex-start"
              spacing={2}
            >
              <Box
                minHeight="4rem"
                width="100%"
                sx={{
                  border: "2px solid lightgrey",
                  borderRadius: "0.5rem",
                }}
              >
                <List
                  sx={{
                    "--ListItem-minHeight": "3rem",
                  }}
                >
                  {assignments}
                </List>
              </Box>
            </Stack>
          </Grid>
          <Grid xs={5}>
            {showVarations ? (
              <>
                {selectedAssignments[0]?.previous?.length > 0 ? (
                  <>
                    <Typography level="h4">
                      {`${parseUICode("ui_prev_part")}`}
                    </Typography>
                    {prevOrNextAssignmentsWindow(true)}
                    <div className="emptySpace1" />
                  </>
                ) : null}
                <Typography level="h4">
                  {`${parseUICode("ui_variations")}`}
                </Typography>
                {variations}
                <div className="emptySpace1" />
                {selectedAssignments[0]?.next?.length > 0 ? (
                  <>
                    <Typography level="h4">
                      {`${parseUICode("ui_next_part")}`}
                    </Typography>
                    {prevOrNextAssignmentsWindow(false)}
                  </>
                ) : null}
              </>
            ) : null}
          </Grid>
        </Grid>

        <div className="emptySpace1" />
      </div>
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
      modulesToDisplay = allModules;
    }
    return modulesToDisplay.map((module) =>
      moduleWindow(
        module.name,
        module.id,
        module.assignments,
        selectedModule === module.id ? true : false
      )
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
              <tr key="caTitle">
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
                    options={allModules}
                    labelKey="name"
                    defaultValue={ForceToString(set?.module)}
                    disabled={set.fullCourse}
                    onChange={(value: string) => {
                      handleSet("module", value);
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
          <Table borderAxis="none">
            <tbody>
              <tr key="caSetName">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">
                    {parseUICode("ui_set_name")}
                  </Typography>
                </td>
                <td>
                  <InputField
                    fieldKey="caSetName"
                    defaultValue={ForceToString(set?.name)}
                    onChange={(value: string) => handleSet("name", value, true)}
                  />
                </td>
              </tr>

              <tr key="caYear">
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

              <tr key="caPeriod">
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

              <tr key="caExportSet">
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

              <tr key="caFormat">
                <td>
                  <Typography level="h4">{parseUICode("ui_format")}</Typography>
                </td>
                <td>
                  <Dropdown
                    name="caModuleInput"
                    options={formats}
                    labelKey="name"
                    defaultValue={ForceToString(set?.format)}
                    onChange={(value: string) => handleSet("format", value)}
                  ></Dropdown>
                </td>
              </tr>

              <tr key="caExportCodeGrade">
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

          <Box width="100%">
            <List>{moduleWindows()}</List>
          </Box>

          <Divider sx={dividerSX} role="presentation" />
        </>
      ) : (
        ""
      )}

      {stepperState === 3 ? (
        <>
          <Typography level="h1">
            {parseUICode("ui_codegrade_autotest")}
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
            onClick={() => handleStepperState(1)}
            ariaLabel={parseUICode("ui_aria_nav_next")}
          >
            {parseUICode("ui_next")}
          </ButtonComp>
        ) : (
          ""
        )}

        {stepperState === 3 && set.exportCGConfigs ? (
          <>
            <ButtonComp
              buttonType="normal"
              onClick={() => saveSet()}
              ariaLabel={parseUICode("ui_save")}
            >
              {parseUICode("ui_save")}
            </ButtonComp>
            <ButtonComp
              buttonType="normal"
              onClick={() => console.log("export CG configs")}
              ariaLabel={parseUICode("ui_aria_export_cg_configs")}
            >
              {parseUICode("ui_export")}
            </ButtonComp>
          </>
        ) : (
          ""
        )}
      </Stack>
      <div className="emptySpace2" style={{ marginTop: "auto" }} />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <ButtonComp
          buttonType="normal"
          onClick={() => console.log(allAssignments)}
          ariaLabel={" debug "}
        >
          log allAssignments
        </ButtonComp>
        <ButtonComp
          buttonType="normal"
          onClick={() => console.log(set)}
          ariaLabel={" debug "}
        >
          log set
        </ButtonComp>
        <ButtonComp
          buttonType="normal"
          onClick={() => console.log(activeSet)}
          ariaLabel={" debug "}
        >
          log activeSet
        </ButtonComp>
        <ButtonComp
          buttonType="normal"
          onClick={() => console.log(allModules)}
          ariaLabel={" debug "}
        >
          log allModules
        </ButtonComp>
      </Stack>
    </>
  );
}
