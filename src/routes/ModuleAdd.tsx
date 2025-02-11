import { useLoaderData, useNavigate } from "react-router";
import { Grid, Stack, Table, Typography } from "@mui/joy";
import InputField from "../components/InputField";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import ButtonComp from "../components/ButtonComp";
import { ModuleData } from "../types";
import { useModule } from "../rendererHelpers/assignmentHelpers";
import { defaultModule } from "../defaultObjects";
import { splitStringToArray } from "../rendererHelpers/converters";
import { parseUICode } from "../rendererHelpers/translation";
import { useContext, useEffect } from "react";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { ActiveObjectContext, UIContext } from "../components/Context";
import {
  pageTableMaxWidth,
  pageTableMinWidth,
  titleCellWidth,
  DEVMODE,
} from "../constantsUI";

export default function ModuleAdd() {
  const {
    activePath,
    activeModule,
  }: {
    activePath: string;
    activeModule?: ModuleData;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const [module, handleModule] = useModule(
    activeModule ? activeModule : defaultModule
  );

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
    if (!module.name || module.assignments == 0) {
      handleSnackbar({
        error: module.name
          ? parseUICode("error_assignment_count_required")
          : parseUICode("ui_add_module_name"),
      });
      return;
    }
    try {
      if (pageType === "manage") {
        await handleIPCResult(() =>
          window.api.updateModuleDB(activePath, module)
        );
      } else {
        await handleIPCResult(() => window.api.addModuleDB(activePath, module));
      }
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
    if (snackbarSeverity !== "error") navigate(-1);
  }

  useEffect(() => {
    handleHeaderPageName("ui_add_module");
  }, []);

  return (
    <>
      <div style={{ maxWidth: pageTableMaxWidth, minWidth: pageTableMinWidth }}>
        <Typography level="h1">{pageTitle}</Typography>
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
            <tr key="mTitle">
              <td style={{ width: titleCellWidth }}>
                <Typography level="h4">
                  {parseUICode("ui_module_title") + " *"}
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

            <tr key="mAssignmentCount">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_assignment_count") + " *"}
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

            <tr key="mModuleNumber">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_module_number")}
                </Typography>
              </td>
              <td>
                <NumberInput
                  value={module.id}
                  onChange={(value: number) => handleModule("id", value)}
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
                      {parseUICode("ui_module_topics")}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_module_topics")} />
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
                    <HelpText text={parseUICode("help_module_inst")} />
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
                      {parseUICode("ui_module_tags")}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_module_tags")} />
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
            onClick={() => navigate(-1)}
            ariaLabel={parseUICode("ui_aria_cancel")}
          >
            {parseUICode("ui_cancel")}
          </ButtonComp>

          {DEVMODE ? (
            <ButtonComp
              buttonType="debug"
              onClick={() => console.log(module)}
              ariaLabel={" debug "}
            >
              log module state
            </ButtonComp>
          ) : (
            ""
          )}
        </Stack>
      </div>
    </>
  );
}
