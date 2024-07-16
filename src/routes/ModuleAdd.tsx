import PageHeaderBar from "../components/PageHeaderBar";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Grid, Stack, Table, Typography } from "@mui/joy";
import InputField from "../components/InputField";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import ButtonComp from "../components/ButtonComp";
import { CourseData, ModuleData } from "../types";
import { useModule } from "../rendererHelpers/assignmentHelpers";
import { defaultModule } from "../defaultObjects";
import { splitStringToArray } from "../generalHelpers/converters";
import { parseUICode } from "../rendererHelpers/translation";
import { useState } from "react";
import SnackbarComp, {
  functionResultToSnackBar,
  SnackBarAttributes,
} from "../components/SnackBarComp";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";

export default function ModuleAdd({
  activeCourse,
  activePath,
  activeModule,
}: {
  activeCourse: CourseData;
  activePath: string;
  activeModule?: ModuleData;
}) {
  const [module, handleModule] = useModule(
    activeModule ? activeModule : defaultModule
  );
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "success", text: "" });

  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;

  if (pageType === "new") {
    pageTitle = parseUICode("ui_new_module");
  }

  if (pageType === "manage") {
    pageTitle = parseUICode("ui_edit_module");
  }

  async function handleSaveModule() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_module_save_success";
    try {
      if (pageType === "manage") {
        // Update currently just overwrites the existing module
        // in fileOperations
        snackbarText = await handleIPCResult(() =>
          window.api.updateModule(module, activePath)
        );
      } else {
        snackbarText = await handleIPCResult(() =>
          window.api.saveModule(module, activePath)
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
        pageName={parseUICode("ui_add_module")}
        courseID={activeCourse?.ID}
        courseTitle={activeCourse?.title}
      />
      <div className="content">
        <Typography level="h1">{pageTitle}</Typography>
        <Table borderAxis="none">
          <tbody>
            <tr key="mTitle">
              <td style={{ width: "25%" }}>
                <Typography level="h4">
                  {parseUICode("ui_assignment_title")}
                </Typography>
              </td>
              <td>
                <InputField
                  fieldKey="mTitleInput"
                  defaultValue={module.name}
                  onChange={(value: string) =>
                    handleModule("name", value, true)
                  }
                />
              </td>
            </tr>

            <tr key="mModuleNumber">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_module_amount")}
                </Typography>
              </td>
              <td>
                <NumberInput
                  value={module.assignments}
                  onChange={(value: number) =>
                    handleModule("assignments", value)
                  }
                  min={0}
                ></NumberInput>
              </td>
            </tr>

            <tr key="mAssignmentAmount">
              <td>
                <Typography level="h4">{parseUICode("ui_module")}</Typography>
              </td>
              <td>
                <NumberInput
                  value={module.ID}
                  onChange={(value: number) => handleModule("ID", value)}
                  min={0}
                ></NumberInput>
              </td>
            </tr>

            <tr key="mTopics">
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
                      {parseUICode("ui_week_topics")}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_week_topics")} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField
                  fieldKey="mTopicInput"
                  isLarge
                  defaultValue={module.subjects}
                  onChange={(value: string) =>
                    handleModule("subjects", value, true)
                  }
                />
              </td>
            </tr>

            <tr key="mInstructions">
              <td>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid xs={10}>
                    <Typography level="h4">{parseUICode("ui_inst")}</Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_week_inst")} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField
                  fieldKey="mInstructionInput"
                  isLarge
                  defaultValue={module.instructions}
                  onChange={(value: string) =>
                    handleModule("instructions", value, true)
                  }
                />
              </td>
            </tr>

            <tr key="mTags">
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
                      {parseUICode("ui_week_tags")}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_week_tags")} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField
                  fieldKey="mTagInput"
                  defaultValue={module.tags.toString()}
                  onChange={(value: string) =>
                    handleModule("tags", splitStringToArray(value), true)
                  }
                />
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="emptySpace1" />
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <ButtonComp
            buttonType="normal"
            onClick={() => handleSaveModule()}
            ariaLabel={parseUICode("ui_aria_save")}
          >
            {parseUICode("ui_save")}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => console.log(module)}
            ariaLabel={parseUICode("ui_aria_save")}
          >
            log module state
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
