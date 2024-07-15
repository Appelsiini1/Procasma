import { useLoaderData, useNavigate } from "react-router-dom";
import { dividerColor } from "../constantsUI";
import { currentCourse } from "../globalsUI";
import { Divider, Grid, Stack, Table, Typography } from "@mui/joy";
import PageHeaderBar from "../components/PageHeaderBar";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { useEffect, useState } from "react";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import defaults from "../../resource/defaults.json";
import ButtonComp from "../components/ButtonComp";
import SwitchComp from "../components/SwitchComp";
import { testCurrentAssignment } from "../myTestGlobals";
import { CodeAssignmentData, CourseData, Variation } from "../types";
import {
  splitStringToArray,
  splitStringToNumberArray,
} from "../helpers/converters";
import { useAssignment } from "../helpers/assignmentHelpers";
import VariationsGroup from "../components/VariationsGroup";
import SnackbarComp, {
  SnackBarAttributes,
  functionResultToSnackBar,
} from "../components/SnackBarComp";
import { deepCopy } from "../helpers/utility";
import { parseUICode } from "../helpers/translation";
import { handleIPCResult } from "../helpers/errorHelpers";

export default function AssignmentInput({
  activeCourse,
  activePath,
  activeAssignment,
}: {
  activeCourse: CourseData;
  activePath: string;
  activeAssignment?: CodeAssignmentData;
}) {
  const [assignment, handleAssignment] = useAssignment(
    activeAssignment ? activeAssignment : deepCopy(testCurrentAssignment)
  );
  const variations: { [key: string]: Variation } = assignment.variations;

  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const moduleDisable = currentCourse.moduleType !== null ? false : true;
  const levelsDisable = currentCourse.levels !== null ? false : true;
  const [expanding, setExpanding] = useState(false);
  const codeLanguageOptions = defaults.codeLanguages; //get these from settings file later
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "success", text: "" });

  if (pageType === "new") {
    pageTitle = parseUICode("ui_new_assignment");
  }

  if (pageType === "manage") {
    pageTitle = parseUICode("ui_edit_assignment");
  }

  useEffect(() => {
    // change the assignment type to assignment
    handleAssignment("assignmentType", "assignment");
  }, []);

  async function handleSaveAssignment() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_course_folder_opened";
    try {
      if (pageType === "manage") {
        snackbarText = await handleIPCResult(() =>
          window.api.updateAssignment(assignment, activePath)
        );
      } else {
        snackbarText = await handleIPCResult(() =>
          window.api.saveAssignment(assignment, activePath)
        );
      }
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }

    functionResultToSnackBar(
      { [snackbarSeverity]: parseUICode(snackbarText) },
      setShowSnackbar,
      setSnackBarAttributes
    );
  }

  return (
    <>
      <PageHeaderBar
        pageName={parseUICode("ui_add_assignment")}
        courseID={activeCourse?.ID}
        courseTitle={activeCourse?.title}
      />
      <div className="content">
        <Typography level="h1">{pageTitle}</Typography>
        <Table borderAxis="none">
          <tbody>
            <tr key="caTitle">
              <td style={{ width: "25%" }}>
                <Typography level="h4">
                  {parseUICode("ui_assignment_title")}
                </Typography>
              </td>
              <td>
                <InputField
                  fieldKey="caTitleInput"
                  defaultValue={assignment.title}
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
                  value={assignment.level}
                  onChange={(value: number) => handleAssignment("level", value)}
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
                  value={assignment.module}
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
                  defaultValue={assignment.assignmentNo.toString()}
                  onChange={(value: string) =>
                    handleAssignment(
                      "assignmentNo",
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
                  defaultValue={assignment.tags.toString()}
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
                  defaultValue={assignment.codeLanguage}
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

            <tr key="caUsedIn">
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
                      {parseUICode("ui_used_in")}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_used_in")} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField
                  fieldKey="caUsedInInput"
                  defaultValue={assignment.previous.toString()}
                  onChange={(value: string) =>
                    handleAssignment(
                      "previous",
                      splitStringToArray(value),
                      true
                    )
                  }
                />
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
          <Typography level="h3">{parseUICode("ui_variations")}</Typography>
          <div className="emptySpace1" />

          <VariationsGroup
            variations={variations}
            handleAssignment={handleAssignment}
          ></VariationsGroup>
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
            onClick={() => console.log(assignment)}
            ariaLabel={parseUICode("ui_aria_save")}
          >
            log assignment state
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => navigate(-1)}
            ariaLabel={parseUICode("ui_aria_cancel")}
          >
            {parseUICode("ui_cancel")}
          </ButtonComp>
        </Stack>
      </div>
      {showSnackbar ? (
        <SnackbarComp
          text={snackBarAttributes.text}
          color={snackBarAttributes.color}
          setShowSnackbar={setShowSnackbar}
        ></SnackbarComp>
      ) : null}
    </>
  );
}
