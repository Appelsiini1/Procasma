import {
  Box,
  Grid,
  List,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import { useContext, useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import ButtonComp from "../components/ButtonComp";
import { ActiveObjectContext, UIContext } from "../components/Context";
import Dropdown from "../components/Dropdown";
import HelpText from "../components/HelpText";
import InputField from "../components/InputField";
import NumberInput from "../components/NumberInput";
import SpecialButton from "../components/SpecialButton";
import SwitchComp from "../components/SwitchComp";
import VariationsGroup from "../components/VariationsGroup";
import {
  pageTableMaxWidth,
  pageTableMinWidth,
  titleCellWidth,
} from "../constantsUI";
import { defaultAssignment } from "../defaultObjects";
import { globalSettings } from "../globalsUI";
import { useAssignment } from "../rendererHelpers/assignmentHelpers";
import {
  generateChecklist,
  setSelectedViaChecked,
  wrapWithCheck,
} from "../rendererHelpers/browseHelpers";
import {
  arrayToString,
  ForceToString,
  splitStringToArray,
  splitStringToNumberArray,
} from "../rendererHelpers/converters";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { parseUICode } from "../rendererHelpers/translation";
import { checkSpecial, deepCopy } from "../rendererHelpers/utilityRenderer";
import {
  AssignmentWithCheck,
  CodeAssignmentData,
  CodeAssignmentDatabase,
  CodeLanguage,
  CourseData,
  Variation,
} from "../types";
import AssignmentSelect from "./AssignmentSelect";
import DebugButtonStack from "./DebugButtonStack";

interface AssignmentEditProps {
  useAsModalSelect: boolean;
  parentAssignment?: CodeAssignmentData;
  handleParentAssignment?: (value: CodeAssignmentData) => void;
}

/**
 * Modify an assignment.
 * @param useAsModalSelect Defines whether the editor should be in a modal.
 * @param parentAssignment The assignment, which will be deep copied. Setting
 *   this to undefined will close the modal.
 * @param handleParentAssignment The handler for the parentAssignment state.
 */
export default function AssignmentEdit({
  useAsModalSelect,
  parentAssignment,
  handleParentAssignment,
}: AssignmentEditProps) {
  const {
    activeCourse,
    activePath,
    activeAssignment,
  }: {
    activeCourse: CourseData;
    activePath: string;
    activeAssignment: CodeAssignmentData;
  } = useContext(ActiveObjectContext);
  const { handleSnackbar } = useContext(UIContext);

  const [assignment, handleAssignment] = useAssignment(
    useAsModalSelect
      ? parentAssignment ?? deepCopy(defaultAssignment)
      : activeAssignment ?? deepCopy(defaultAssignment)
  );

  const [browserAssignments, setBrowserAssignments] =
    useState<CodeAssignmentDatabase[]>(undefined);
  const [assignmentToEdit, setAssignmentToEdit] =
    useState<CodeAssignmentData>(undefined);
  const [prevAssignments, setPrevAssignments] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentDatabase>
  >([]);
  const [numSelected, setNumSelected] = useState(0);
  const [extraCredit, setExtraCredit] = useState(
    assignment?.extraCredit ? assignment.extraCredit : false
  );
  const defaultCodeLanguage =
    assignment?.codeLanguage ?? activeCourse?.codeLanguage?.name;
  const variations: { [key: string]: Variation } = assignment?.variations;
  let pageType = useLoaderData();
  let pageTitle: string = null;
  const moduleDisable = activeCourse?.moduleType !== null ? false : true;
  const levelsDisable = activeCourse?.levels !== null ? false : true;
  const codeLanguageOptions: CodeLanguage[] = deepCopy(
    globalSettings.codeLanguages
  );
  let prevAssignmentsChecklist: Array<React.JSX.Element> = null;

  if (pageType === "new") {
    pageTitle = parseUICode("ui_new_assignment");
  }

  if (pageType === "manage") {
    pageTitle = parseUICode("ui_edit_assignment");
  }

  function handleBrowserAssignments(value: CodeAssignmentDatabase[]) {
    setBrowserAssignments(value);
  }

  function handleAssignmentToEdit(value: CodeAssignmentData) {
    setAssignmentToEdit(value);
  }

  /**
   * Gets the ids from browserAssignments and
   * assignment.previous, combining them into prevAssignments.
   * @param ids The ids of assignments to add.
   */
  async function getPrevAssignments(ids?: string[]) {
    try {
      let newPrevAssignments: CodeAssignmentDatabase[] = [];
      let assignmentsResult: CodeAssignmentDatabase[] = [];

      newPrevAssignments = prevAssignments.map((a) => a.value);

      // get the assignments from browserAssignments
      if (browserAssignments?.length > 0) {
        newPrevAssignments = newPrevAssignments.concat(browserAssignments);
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

      if (browserAssignments?.length > 0) {
        handleBrowserAssignments(undefined);
      }
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  async function handleSaveAssignment() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_assignment_save_success";
    const assignmentToSave = assignment;

    if (assignment.level === null && activeCourse?.levels !== null) {
      assignmentToSave.level = 0;
    }
    if (assignment.codeLanguage === null) {
      assignmentToSave.codeLanguage = activeCourse.codeLanguage.name;
    }
    if (!assignment.title) {
      handleSnackbar({ error: parseUICode("ui_add_assignment_title") });
      return;
    }

    if (checkSpecial(assignment.title)) {
      handleSnackbar({ error: parseUICode("error_special_in_title") });
    } else if (checkSpecial(arrayToString(assignment.tags))) {
      handleSnackbar({ error: parseUICode("error_special_in_tags") });
    } else {
      try {
        // TODO make sure assignment is being save correctly in modal
        if (pageType === "manage") {
          await handleIPCResult(() =>
            window.api.handleUpdateAssignmentFS(assignmentToSave, activePath)
          );
        } else {
          const addedAssignment: CodeAssignmentData = await handleIPCResult(
            () => window.api.handleAddAssignmentFS(assignmentToSave, activePath)
          );
          // use the generated id from main
          handleAssignment("assignmentID", addedAssignment.assignmentID);
        }
        if (handleParentAssignment) {
          handleParentAssignment(undefined);
        }
        pageType = "manage";
      } catch (err) {
        snackbarText = err.message;
        snackbarSeverity = "error";
      }
      handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
    }
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

  useEffect(() => {
    if (!activePath) {
      return;
    }
    getPrevAssignments();
  }, [browserAssignments]);

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
      // Then get the full selected assignment
      const assignmentsResult = await handleIPCResult(() =>
        window.api.handleGetAssignmentsFS(activePath, selectedAssignments[0].id)
      );

      handleAssignmentToEdit(assignmentsResult[0]);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  function handleLevelValue() {
    try {
      if (assignment && activeCourse?.levels !== null) {
        if (assignment?.level === null) {
          return activeCourse?.levels[0].fullName;
        }
        return activeCourse?.levels[assignment?.level].fullName;
      }
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
    return "";
  }

  useEffect(() => {
    handleAssignment("extraCredit", extraCredit);
  }, [extraCredit]);

  prevAssignmentsChecklist = generateChecklist(
    prevAssignments,
    setPrevAssignments,
    handleOpenPrevAssignment,
    true,
    false,
    useAsModalSelect
  );

  const buttons = () => {
    return (
      <>
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
          {useAsModalSelect ? (
            <ButtonComp
              buttonType="normal"
              onClick={() => handleParentAssignment(undefined)}
              ariaLabel={parseUICode("ui_aria_cancel")}
            >
              {parseUICode("ui_close")}
            </ButtonComp>
          ) : (
            <SpecialButton buttonType="cancel" />
          )}
          <DebugButtonStack items={{ assignment, parentAssignment }} />
        </Stack>
      </>
    );
  };

  const content = () => {
    return (
      <>
        <Stack
          gap={2}
          style={{ maxWidth: pageTableMaxWidth, minWidth: pageTableMinWidth }}
        >
          <Typography level="body-lg" fontStyle={"italic"} textColor={"red"}>
            {"* " + parseUICode("ui_required_field")}
          </Typography>
          <Table borderAxis="none">
            <tbody>
              <tr key="caTitle">
                <td style={{ width: titleCellWidth }}>
                  <Typography level="h4">
                    {parseUICode("ui_assignment_title") + " *"}
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
                  <Dropdown
                    options={!activeCourse?.levels ? [] : activeCourse.levels}
                    labelKey="fullName"
                    onChange={(value: string) => {
                      let index = activeCourse.levels.findIndex(
                        (element) => value === element.fullName
                      );
                      if (index === -1) index = null;
                      handleAssignment("level", index);
                    }}
                    defaultValue={handleLevelValue()}
                    name="caLevel"
                    disabled={levelsDisable}
                  ></Dropdown>
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
                    min={0}
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
                    defaultValue={assignment?.tags?.join(", ")}
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
                    defaultValue={ForceToString(defaultCodeLanguage)}
                    onChange={(value: string) =>
                      handleAssignment("codeLanguage", value)
                    }
                  ></Dropdown>
                </td>
              </tr>

              <tr key="caExtraCredit">
                <td>
                  <Typography level="h4">
                    {parseUICode("ui_extracredit")}
                  </Typography>
                </td>
                <td>
                  <SwitchComp
                    checked={extraCredit}
                    setChecked={setExtraCredit}
                  ></SwitchComp>
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
                        border: "1px solid lightgrey",
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
                      onClick={() => handleBrowserAssignments([])}
                      ariaLabel={parseUICode("ui_add")}
                      disabled={useAsModalSelect}
                    >
                      {parseUICode("ui_add")}
                    </ButtonComp>
                    <ButtonComp
                      buttonType="normal"
                      onClick={() => handleRemoveSelected()}
                      ariaLabel={parseUICode("ui_aria_remove_selected")}
                      disabled={
                        useAsModalSelect || numSelected === 0 ? true : false
                      }
                    >
                      {`${parseUICode("ui_delete")}`}
                    </ButtonComp>
                    <ButtonComp
                      buttonType="normal"
                      onClick={() => {
                        handleOpenPrevAssignment();
                      }}
                      ariaLabel={parseUICode("ui_aria_show_edit")}
                      disabled={
                        useAsModalSelect || numSelected !== 1 ? true : false
                      }
                    >
                      {parseUICode("ui_show_edit")}
                    </ButtonComp>
                  </Stack>
                </td>
              </tr>
            </tbody>
          </Table>

          <VariationsGroup
            variations={variations}
            handleAssignment={handleAssignment}
          ></VariationsGroup>
        </Stack>
      </>
    );
  };

  return (
    <>
      {useAsModalSelect ? (
        <Modal
          open={typeof parentAssignment !== "undefined"}
          onClose={() => handleParentAssignment(undefined)}
        >
          <ModalDialog variant="plain" size="sm">
            <ModalClose />
            <Stack gap={2}>
              <Typography level="h1">{pageTitle}</Typography>
              <Stack
                sx={{
                  width: "90vw",
                  height: "70vh",
                  border: "1px solid lightgrey",
                  borderRadius: "0.5rem",
                  backgroundColor: "var(--content-background)",
                  overflowX: "hidden",
                }}
                direction="column"
                justifyContent="start"
                alignItems="start"
              >
                <Box
                  sx={{
                    width: "calc(100% - 8px)",
                    overflowY: "scroll",
                  }}
                >
                  <Box sx={{ padding: "1rem" }}>{content()}</Box>
                </Box>
              </Stack>
              {buttons()}
            </Stack>
          </ModalDialog>
        </Modal>
      ) : (
        <>
          <Stack gap={2}>
            <Typography level="h1">{pageTitle}</Typography>
            {content()}
            {buttons()}
          </Stack>
          <AssignmentSelect
            useAsModalSelect={true}
            parentAssignments={browserAssignments}
            handleParentAssignments={handleBrowserAssignments}
            typeFilters={["assignment"]}
          />
          {typeof assignmentToEdit !== "undefined" ? (
            <AssignmentEdit
              useAsModalSelect={true}
              parentAssignment={assignmentToEdit}
              handleParentAssignment={handleAssignmentToEdit}
            />
          ) : null}
        </>
      )}
    </>
  );
}
