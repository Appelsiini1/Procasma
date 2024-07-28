import { useLoaderData, useNavigate } from "react-router-dom";
import { dividerSX } from "../constantsUI";
import { Box, Divider, List, Stack, Table, Typography } from "@mui/joy";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { useContext, useEffect, useState } from "react";
import NumberInput from "../components/NumberInput";
import ButtonComp from "../components/ButtonComp";
import SwitchComp from "../components/SwitchComp";
import StepperComp from "../components/StepperComp";
import { CodeAssignmentDatabase, ModuleData, SetData } from "../types";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { useSet } from "../rendererHelpers/assignmentHelpers";
import { deepCopy } from "../rendererHelpers/utility";
import { defaultSet } from "../defaultObjects";
import { ForceToString } from "../generalHelpers/converters";
import { AssignmentWithCheck } from "./AssignmentBrowse";
import {
  generateChecklist,
  setSelectedViaChecked,
  wrapWithCheck,
} from "../rendererHelpers/browseHelpers";
import { ActiveObjectContext, UIContext } from "../components/Context";

export default function SetCreator() {
  const { activePath, activeSet }: { activePath: string; activeSet: SetData } =
    useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar, setIPCLoading } =
    useContext(UIContext);
  const [set, handleSet] = useSet(activeSet ?? deepCopy(defaultSet));
  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const [stepperState, setStepperState] = useState<number>(0);
  const [modules, setModules] = useState<Array<ModuleData>>([]);
  const formats: object[] = [];
  const [allAssignments, setAllAssignments] = useState<
    Array<AssignmentWithCheck>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<
    Array<CodeAssignmentDatabase>
  >([]);

  const stepHeadings: string[] = [
    parseUICode("ui_module_selection"),
    parseUICode("ui_set_details"),
    parseUICode("ui_choose_tasks"),
    parseUICode("ui_cg_config"),
  ];
  let assignments: Array<React.JSX.Element> = null;

  const handleStepperState = (navigation: number) => {
    setStepperState((prevState) => {
      const newState: number = prevState + navigation;
      if (newState >= 0 && newState <= 3) {
        return newState;
      }
      return prevState;
    });
  };

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

      const modules = await handleIPCResult(setIPCLoading, () =>
        window.api.getModulesDB(activePath)
      );

      setModules(modules);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  async function getAssignmentsByModule(name: string) {
    try {
      if (!activePath) {
        return;
      }

      const filters = {
        module: [name],
      };

      const assignments = await handleIPCResult(setIPCLoading, () =>
        window.api.getFilteredAssignmentsDB(activePath, filters)
      );

      const assignmentsWithCheck: AssignmentWithCheck[] =
        wrapWithCheck(assignments);

      setAllAssignments(assignmentsWithCheck);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  async function saveSet() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_set_save_success";
    try {
      if (pageType === "manage") {
        await handleIPCResult(setIPCLoading, () =>
          window.api.updateSetFS(activePath, set)
        );
      } else {
        await handleIPCResult(setIPCLoading, () =>
          window.api.addSetFS(activePath, set)
        );
      }
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  // fetch modules on page load
  useEffect(() => {
    getModules();
    getAssignmentsByModule(set.module);
    handleHeaderPageName("ui_create_new_set");
  }, []);

  // Update the selected assignments counter
  useEffect(() => {
    setSelectedViaChecked(allAssignments, setSelectedAssignments);
  }, [allAssignments]);

  assignments = generateChecklist(allAssignments, setAllAssignments);

  function handleUpdateCGids(assignmentTitle: string, CGid: string) {
    handleSet(`assignmentCGids.[${assignmentTitle}]`, CGid);
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
                    options={modules}
                    labelKey="name"
                    defaultValue={ForceToString(set?.module)}
                    onChange={(value: string) => {
                      handleSet("module", value);
                      getAssignmentsByModule(value);
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
                    disabled={true}
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
          <Typography level="h1">{parseUICode("ui_choose_tasks")}</Typography>
          <Table borderAxis="none">
            <tbody>
              <tr key="caSetName">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">
                    {`${parseUICode("ui_module")} ${ForceToString(set.module)}`}
                  </Typography>
                </td>
              </tr>

              <tr key="caAssignments">
                <td style={{ width: "25%" }}>
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Box
                      height="16rem"
                      width="100%"
                      sx={{
                        border: "2px solid lightgrey",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <List>{assignments}</List>
                    </Box>
                  </Stack>
                </td>
              </tr>

              <tr key="caActions">
                <td style={{ width: "25%" }}>
                  <Stack
                    direction="row"
                    justifyContent="start"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <ButtonComp
                      buttonType="normal"
                      onClick={null}
                      ariaLabel={parseUICode("ui_aria_show_assignment")}
                    >
                      {parseUICode("ui_show")}
                    </ButtonComp>
                    <ButtonComp
                      buttonType="normal"
                      onClick={null}
                      ariaLabel={parseUICode("ui_aria_delete_assignment")}
                    >
                      {parseUICode("ui_delete")}
                    </ButtonComp>
                    <ButtonComp
                      buttonType="normal"
                      onClick={null}
                      ariaLabel={parseUICode("ui_aria_add_assignment")}
                    >
                      {parseUICode("ui_add")}
                    </ButtonComp>
                    <ButtonComp
                      buttonType="normal"
                      onClick={null}
                      ariaLabel={parseUICode("ui_aria_change_assignment")}
                    >
                      {parseUICode("ui_change")}
                    </ButtonComp>
                  </Stack>
                </td>
              </tr>
            </tbody>
          </Table>

          <div className="emptySpace1" />
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
                <tbody>
                  {selectedAssignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td style={{ width: "25%" }}>
                        <Typography level="h4">{assignment.title}</Typography>
                      </td>
                      <td>
                        <InputField
                          fieldKey="caSetName"
                          defaultValue={ForceToString(
                            set.assignmentCGids[assignment.title]
                          )}
                          onChange={(value: string) =>
                            handleUpdateCGids(assignment.title, value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
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
        {stepperState === 3 && set.exportCGConfigs ? (
          <ButtonComp
            buttonType="normal"
            onClick={() => saveSet()}
            ariaLabel={parseUICode("ui_aria_export_cg_configs")}
          >
            {parseUICode("ui_export")}
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

        <ButtonComp
          buttonType="normal"
          onClick={() => navigate(-1)}
          ariaLabel={parseUICode("ui_aria_close")}
        >
          {parseUICode("ui_close")}
        </ButtonComp>

        <ButtonComp
          buttonType="normal"
          onClick={() => console.log(set)}
          ariaLabel={" debug "}
        >
          log set
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
      </Stack>
    </>
  );
}
