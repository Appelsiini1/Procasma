import { useLoaderData, useNavigate } from "react-router-dom";
import {
  dividerColor,
  pageTableMaxWidth,
  pageTableMinWidth,
  titleCellWidth,
} from "../constantsUI";
import { Box, Divider, Grid, List, Stack, Table, Typography } from "@mui/joy";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { useContext, useEffect, useState } from "react";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import defaults from "../../resource/defaults.json";
import ButtonComp from "../components/ButtonComp";
import SwitchComp from "../components/SwitchComp";
import { defaultAssignment } from "../defaultObjects";
import {
  AssignmentWithCheck,
  CodeAssignmentData,
  CodeAssignmentDatabase,
  CourseData,
  Variation,
} from "../types";
import {
  ForceToString,
  splitStringToArray,
  splitStringToNumberArray,
} from "../generalHelpers/converters";
import { useAssignment } from "../rendererHelpers/assignmentHelpers";
import VariationsGroup from "../components/VariationsGroup";
import { deepCopy } from "../rendererHelpers/utility";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { ActiveObjectContext, UIContext } from "../components/Context";
import {
  generateChecklist,
  setSelectedViaChecked,
  wrapWithCheck,
} from "../rendererHelpers/browseHelpers";
import { isExpanding } from "../rendererHelpers/assignment";

export default function AssignmentInput() {
  const {
    activeCourse,
    activePath,
    activeAssignment,
    handleActiveAssignment,
    activeAssignments,
    handleActiveAssignments,
  }: {
    activeCourse: CourseData;
    activePath: string;
    activeAssignment: CodeAssignmentData;
    handleActiveAssignment: (value: CodeAssignmentData) => void;
    activeAssignments: CodeAssignmentDatabase[];
    handleActiveAssignments: (value: CodeAssignmentDatabase[]) => void;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const [assignment, handleAssignment] = useAssignment(
    activeAssignment ?? deepCopy(defaultAssignment)
  );
  const [prevAssignments, setPrevAssignments] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentDatabase>
  >([]);
  const [numSelected, setNumSelected] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const [navigateToBrowse, setNavigateToBrowse] = useState(false);
  const variations: { [key: string]: Variation } = assignment?.variations;

  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const moduleDisable = activeCourse?.moduleType !== null ? false : true;
  const levelsDisable = activeCourse?.levels !== null ? false : true;
  const [expanding, setExpanding] = useState(isExpanding(assignment));
  const codeLanguageOptions = defaults.codeLanguages; //get these from settings file later
  let prevAssignmentsChecklist: Array<React.JSX.Element> = null;

  if (pageType === "new") {
    pageTitle = parseUICode("ui_new_assignment");
  }

  if (pageType === "manage") {
    pageTitle = parseUICode("ui_edit_assignment");
  }

  /**
   * Gets the ids from the global "activeAssignments" and
   * assignment.previous, combining them into prevAssignments.
   * @param ids The ids of assignments to add.
   */
  async function getPrevAssignments(ids?: string[]) {
    try {
      let newPrevAssignments: CodeAssignmentDatabase[] = [];
      let assignmentsResult: CodeAssignmentDatabase[] = [];

      // get the assignments from activeAssignments
      if (activeAssignments) {
        newPrevAssignments = newPrevAssignments.concat(activeAssignments);
        handleActiveAssignments(undefined);
      }

      // get the assignment's previous assignments and concat
      if (ids || assignment.previous) {
        assignmentsResult = await handleIPCResult(() =>
          window.api.getAssignmentsDB(activePath, ids ?? assignment.previous)
        );
      }

      // add only the new ids to newPrevAssignments
      assignmentsResult.forEach((resultAssignment) => {
        if (
          !newPrevAssignments.find(
            (newPrev) => newPrev.id === resultAssignment.id
          )
        ) {
          newPrevAssignments.push(resultAssignment);
        }
      });

      setPrevAssignments(wrapWithCheck(newPrevAssignments));
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  useEffect(() => {
    if (!activePath) {
      return;
    }
    // change the assignment type to assignment
    if (pageType === "new") {
      handleAssignment("assignmentType", "assignment");
    }
    handleHeaderPageName("ui_add_assignment");

    // use the global "activeAssignment" as the page assignment to manage
    if (activeAssignment) {
      handleAssignment("", activeAssignment);
    }
    getPrevAssignments();
  }, []);

  async function handleSaveAssignment() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_assignment_save_success";
    try {
      if (pageType === "manage") {
        await handleIPCResult(() =>
          window.api.handleUpdateAssignmentFS(assignment, activePath)
        );
      } else {
        const addedAssignment: CodeAssignmentData = await handleIPCResult(() =>
          window.api.handleAddAssignmentFS(assignment, activePath)
        );
        // use the generated id from main
        handleAssignment("assignmentID", addedAssignment.assignmentID);
      }
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  // Update the selected assignments
  useEffect(() => {
    if (!prevAssignments) {
      return;
    }

    // Add the ids from the prevAssignments to the assignment
    const prevIds = prevAssignments.map((prev) => prev.value.id);
    handleAssignment("previous", prevIds);

    const numChecked = setSelectedViaChecked(
      prevAssignments,
      setSelectedAssignments
    );

    setNumSelected(numChecked);
  }, [prevAssignments]);

  function handleRemoveSelected() {
    // remove selected assignments from prevAssignments
    const newPrevAssignments = prevAssignments.filter(
      (prev) =>
        !selectedAssignments.find((selected) => selected.id === prev.value.id)
    );
    setPrevAssignments(newPrevAssignments);
  }

  async function handleOpenPrevAssignment() {
    try {
      // First save the in-progress assignment
      if (pageType === "manage") {
        await handleIPCResult(() =>
          window.api.handleUpdateAssignmentFS(assignment, activePath)
        );
      } else {
        await handleIPCResult(() =>
          window.api.handleAddAssignmentFS(assignment, activePath)
        );
      }

      // Then get the full selected assignment
      const assignmentsResult = await handleIPCResult(() =>
        window.api.handleGetAssignmentsFS(activePath, selectedAssignments[0].id)
      );

      // Use the selected assignment as the page assignment
      handleAssignment("", assignmentsResult[0]);

      // force a re-render of the form with the prev assignment data
      setFormKey(formKey + 1);

      // Get the new prevAssignments for the assignment
      getPrevAssignments(assignmentsResult[0].previous ?? []);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  // Navigates to the assignment browse page by listening to activeAssignments
  useEffect(() => {
    if (activeAssignments && navigateToBrowse) {
      setNavigateToBrowse(false);
      navigate("/AssignmentBrowse");
    }
  }, [activeAssignments, navigateToBrowse]);

  async function handleNavigateToBrowse() {
    try {
      // save the in-progress assignment, and use the received
      // assignment, because it has the generated id from main
      let addedAssignment: CodeAssignmentData = null;
      if (assignment.assignmentID) {
        addedAssignment = await handleIPCResult(() =>
          window.api.handleUpdateAssignmentFS(assignment, activePath)
        );
      } else {
        addedAssignment = await handleIPCResult(() =>
          window.api.handleAddAssignmentFS(assignment, activePath)
        );
      }
      handleActiveAssignment(addedAssignment);
      handleActiveAssignments([]);
      setNavigateToBrowse(true);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  function handleLevelValue() {
    if (assignment && activeCourse?.minLevel !== 0) {
      if (assignment?.level === null) {
        return activeCourse?.minLevel;
      }
      return Number(assignment?.level);
    } else {
      return 0;
    }
  }

  prevAssignmentsChecklist = generateChecklist(
    prevAssignments,
    setPrevAssignments,
    true,
    !expanding
  );

  return (
    <>
      <div
        key={formKey}
        style={{ maxWidth: pageTableMaxWidth, minWidth: pageTableMinWidth }}
      >
        <Typography level="h1">{pageTitle}</Typography>
        <Table borderAxis="none">
          <tbody>
            <tr key="caTitle">
              <td style={{ width: titleCellWidth }}>
                <Typography level="h4">
                  {parseUICode("ui_assignment_title")}
                </Typography>
              </td>
              <td>
                <InputField
                  fieldKey="caTitleInput"
                  defaultValue={ForceToString(assignment?.title)}
                  onChange={(value: string) =>
                    handleAssignment("title", value, true)
                  }
                />
              </td>
            </tr>

            <tr key="caLevel">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_assignment_level")}
                </Typography>
              </td>
              <td>
                <NumberInput
                  disabled={levelsDisable}
                  value={handleLevelValue()}
                  onChange={(value: number) => handleAssignment("level", value)}
                  min={activeCourse?.minLevel}
                  max={activeCourse?.maxLevel}
                ></NumberInput>
              </td>
            </tr>

            <tr key="caModule">
              <td>
                <Typography level="h4">{parseUICode("ui_module")}</Typography>
              </td>
              <td>
                <NumberInput
                  disabled={moduleDisable}
                  value={moduleDisable ? 0 : Number(assignment?.module)}
                  onChange={(value: number) =>
                    handleAssignment("module", value)
                  }
                ></NumberInput>
              </td>
            </tr>

            <tr key="caPositions">
              <td>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid xs={10}>
                    <Typography level="h4">
                      {parseUICode("ui_assignment_no")}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_assignment_no")} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField
                  fieldKey="caPositionsInput"
                  defaultValue={ForceToString(assignment?.position)}
                  onChange={(value: string) =>
                    handleAssignment(
                      "position",
                      splitStringToNumberArray(value),
                      true
                    )
                  }
                />
              </td>
            </tr>

            <tr key="caTags">
              <td>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid xs={10}>
                    <Typography level="h4">
                      {parseUICode("ui_assignment_tags")}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_assignment_tags")} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField
                  fieldKey="caTagsInput"
                  defaultValue={ForceToString(assignment?.tags)}
                  onChange={(value: string) =>
                    handleAssignment("tags", splitStringToArray(value), true)
                  }
                />
              </td>
            </tr>

            <tr key="caCodeLanguage">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_code_lang")}
                </Typography>
              </td>
              <td>
                <Dropdown
                  name="caCodeLanguageInput"
                  options={codeLanguageOptions}
                  labelKey="name"
                  defaultValue={ForceToString(assignment?.codeLanguage)}
                  onChange={(value: string) =>
                    handleAssignment("codeLanguage", value)
                  }
                ></Dropdown>
              </td>
            </tr>

            <tr key="caExpanding">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_exp_assignment")}
                </Typography>
              </td>
              <td>
                <SwitchComp checked={expanding} setChecked={setExpanding} />
              </td>
            </tr>

            <tr key="caPrevious">
              <td>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid xs={10}>
                    <Typography level="h4">
                      {parseUICode("ui_prev_part")}
                    </Typography>
                  </Grid>
                </Grid>
              </td>
              <td>
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
                    <List>{prevAssignmentsChecklist}</List>
                  </Box>
                </Stack>
              </td>
            </tr>

            <tr key="caPreviousButtons">
              <td></td>
              <td>
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={2}
                >
                  <ButtonComp
                    buttonType="normal"
                    onClick={() => {
                      handleNavigateToBrowse();
                    }}
                    ariaLabel={parseUICode("ui_add")}
                    disabled={expanding ? false : true}
                  >
                    {parseUICode("ui_add")}
                  </ButtonComp>{" "}
                  <ButtonComp
                    buttonType="normal"
                    onClick={() => handleRemoveSelected()}
                    ariaLabel={parseUICode("ui_aria_remove_selected")}
                    disabled={numSelected > 0 ? false : true}
                  >
                    {`${parseUICode("ui_delete")}`}
                  </ButtonComp>
                  <ButtonComp
                    buttonType="normal"
                    onClick={() => {
                      handleOpenPrevAssignment();
                    }}
                    ariaLabel={parseUICode("ui_aria_show_edit")}
                    disabled={numSelected > 0 ? false : true}
                  >
                    {parseUICode("ui_show_edit")}
                  </ButtonComp>
                </Stack>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="emptySpace1" />
        <Divider
          sx={{
            padding: ".1rem",
            marginLeft: "2rem",
            bgcolor: dividerColor,
            marginRight: "40%",
          }}
          role="presentation"
        />

        <div className="emptySpace2" />
        <div style={{ marginLeft: "0.9rem", width: "100%" }}>
          <VariationsGroup
            variations={variations}
            handleAssignment={handleAssignment}
          ></VariationsGroup>
        </div>
      </div>

      <div className="emptySpace1" />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <ButtonComp
          buttonType="normal"
          onClick={() => handleSaveAssignment()}
          ariaLabel={parseUICode("ui_aria_save")}
        >
          {parseUICode("ui_save")}
        </ButtonComp>
        <ButtonComp
          buttonType="normal"
          onClick={() => navigate(-1)}
          ariaLabel={parseUICode("ui_aria_cancel")}
        >
          {parseUICode("ui_cancel")}
        </ButtonComp>
        <ButtonComp
          buttonType="debug"
          onClick={() => console.log(assignment)}
          ariaLabel={"debug"}
        >
          log assignment state
        </ButtonComp>
        <ButtonComp
          buttonType="debug"
          onClick={() => console.log(activeAssignment)}
          ariaLabel={"debug"}
        >
          log active assignment
        </ButtonComp>
      </Stack>
    </>
  );
}
