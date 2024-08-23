import { useLoaderData, useNavigate } from "react-router-dom";
import {
  dividerColor,
  pageTableMaxWidth,
  pageTableMinWidth,
  titleCellWidth,
} from "../constantsUI";
import { Divider, Grid, Stack, Table, Typography } from "@mui/joy";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import ButtonComp from "../components/ButtonComp";
import { useAssignment } from "../rendererHelpers/assignmentHelpers";
import { defaultProject } from "../defaultObjects";
import { CodeAssignmentData, CourseData, Variation } from "../types";
import {
  ForceToString,
  splitStringToArray,
} from "../generalHelpers/converters";
import VariationsGroup from "../components/VariationsGroup";
import { useContext, useEffect } from "react";
import { deepCopy } from "../rendererHelpers/utility";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { ActiveObjectContext, UIContext } from "../components/Context";
import { globalSettings } from "../globalsUI";

export default function ProjectWorkInput() {
  const {
    activeCourse,
    activePath,
    activeAssignment,
  }: {
    activeCourse: CourseData;
    activePath: string;
    activeAssignment?: CodeAssignmentData;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const [assignment, handleAssignment] = useAssignment(
    activeAssignment ? activeAssignment : deepCopy(defaultProject)
  );
  const variations: { [key: string]: Variation } = assignment?.variations;

  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const moduleDisable = activeCourse?.moduleType !== null ? false : true;
  const codeLanguageOptions = globalSettings.codeLanguages;

  if (pageType === "new") {
    pageTitle = parseUICode("ui_new_project_work");
  }

  if (pageType === "manage") {
    pageTitle = parseUICode("ui_edit_project_work");
  }

  useEffect(() => {
    // change the assignment type to final project
    handleAssignment("assignmentType", "finalWork");
    handleHeaderPageName("ui_add_project_work");
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
        await handleIPCResult(() =>
          window.api.handleAddAssignmentFS(assignment, activePath)
        );
      }
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  return (
    <>
      <div style={{ maxWidth: pageTableMaxWidth, minWidth: pageTableMinWidth }}>
        <Typography level="h1">{pageTitle}</Typography>
        <Table borderAxis="none">
          <tbody>
            <tr key="caTitle">
              <td style={{ width: titleCellWidth }}>
                <Typography level="h4">{parseUICode("ui_title")}</Typography>
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

            <tr key="caModule">
              <td>
                <Typography level="h4">{parseUICode("ui_module")}</Typography>
              </td>
              <td>
                <NumberInput
                  disabled={moduleDisable}
                  value={Number(assignment?.module)}
                  onChange={(value: number) =>
                    handleAssignment("module", value)
                  }
                ></NumberInput>
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
                    <Typography level="h4">{parseUICode("ui_tags")}</Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_tags")} />
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
            useLevelsInstead={true}
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
            onClick={() => navigate(-1)}
            ariaLabel={parseUICode("ui_aria_cancel")}
          >
            {parseUICode("ui_cancel")}
          </ButtonComp>
        </Stack>
      </div>
    </>
  );
}
