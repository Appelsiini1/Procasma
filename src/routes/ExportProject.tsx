import { useLoaderData, useNavigate } from "react-router";
import { DEVMODE, dividerSX } from "../constantsUI";
import {
  Card,
  CardContent,
  Checkbox,
  Divider,
  Grid,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { useContext, useEffect, useState } from "react";
import ButtonComp from "../components/ButtonComp";
import StepperComp from "../components/StepperComp";
import { parseUICode } from "../rendererHelpers/translation";
import { ActiveObjectContext, UIContext } from "../components/Context";
import {
  CodeAssignmentDatabase,
  CourseData,
  FormatType,
  formatTypes,
} from "../types";
import { ForceToString } from "../rendererHelpers/converters";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import HelpText from "../components/HelpText";
import SwitchComp from "../components/SwitchComp";

// Get list of assignments via IPC later
const testAssignments = [
  { id: "1", name: "T1 - Otsikko" },
  { id: "2", name: "T2 - Otsikko" },
];

export default function ExportProject() {
  const {
    activeAssignments,
    handleActiveAssignments,
    activeCourse,
    activePath,
  }: {
    activeAssignments: CodeAssignmentDatabase[];
    handleActiveAssignments: (value: CodeAssignmentDatabase[]) => void;
    activeCourse: CourseData;
    activePath: string;
  } = useContext(ActiveObjectContext);
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const [assignment, handleAssignment] = useState<CodeAssignmentDatabase>(null);
  const [navigateToBrowse, setNavigateToBrowse] = useState(false);
  const navigate = useNavigate();
  const [stepperState, setStepperState] = useState<number>(0);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const stepHeadings: string[] = [
    parseUICode("ui_choose_project"),
    parseUICode("ui_cg_config"),
  ];
  const formats: object[] = formatTypes.map((format) => {
    return {
      name: format,
    };
  });
  const [format, setFormat] = useState(formatTypes[0]);
  const [splitLevels, setSplitLevels] = useState(false);

  const handleStepperState = (navigation: number) => {
    setStepperState((prevState) => {
      const newState: number = prevState + navigation;
      if (newState >= 0 && newState <= 3) {
        return newState;
      }
      return prevState;
    });
  };

  useEffect(() => {
    handleHeaderPageName("ui_export_project");
  }, []);

  useEffect(() => {
    // use the assignment chose in the browser
    if (activeAssignments) {
      if (activeAssignments[0]) {
        handleAssignment(activeAssignments[0]);
        handleActiveAssignments(undefined);
      }
    }
  }, []);

  async function handleNavigateToBrowse() {
    try {
      handleActiveAssignments([]);
      setNavigateToBrowse(true);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  // Navigates to the assignment browse page by listening to activeAssignments
  useEffect(() => {
    if (typeof activeAssignments !== "undefined" && navigateToBrowse) {
      setNavigateToBrowse(false);
      navigate("/AssignmentBrowse");
    }
  }, [activeAssignments, navigateToBrowse]);

  async function exportProject() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_export_project_success";
    try {
      const savePath = await handleIPCResult(() => window.api.selectDir());
      if (savePath !== "") {
        // Get the full selected assignment
        const assignmentsResult = await handleIPCResult(() =>
          window.api.handleGetAssignmentsFS(activePath, assignment.id)
        );
        const projectInput = assignmentsResult[0];
        projectInput.format = format;
        await handleIPCResult(() =>
          window.api.exportProjectFS(
            projectInput,
            activeCourse,
            savePath,
            replaceExisting
          )
        );
      } else {
        snackbarSeverity = "info";
        snackbarText = "ui_action_canceled";
      }
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
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
          <Typography level="h1">{parseUICode("ui_choose_project")}</Typography>

          <div className="emptySpace1" />
          <ButtonComp
            buttonType="normal"
            onClick={() => handleNavigateToBrowse()}
            ariaLabel={parseUICode("ui_aria_choose_project")}
          >
            {parseUICode("ui_select")}
          </ButtonComp>

          {assignment ? (
            <>
              <div className="emptySpace1" />
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={0.5}
                sx={{ width: "100%", height: "3.5rem" }}
              >
                <Card variant="soft" sx={{ width: "100%" }}>
                  <CardContent>
                    <Typography level="title-md">{assignment.title}</Typography>
                  </CardContent>
                </Card>

                <ButtonComp
                  buttonType="delete"
                  onClick={() => handleAssignment(null)}
                  ariaLabel={parseUICode("ui_aria_delete_level")}
                >
                  {" "}
                </ButtonComp>
              </Stack>
            </>
          ) : (
            ""
          )}

          <Divider sx={dividerSX} role="presentation" />
          <Table borderAxis="none" sx={{ width: "70%" }}>
            <tbody>
              <tr key="caFormat">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">{parseUICode("ui_format")}</Typography>
                </td>
                <td>
                  <Dropdown
                    name="caModuleInput"
                    options={formats}
                    labelKey="name"
                    defaultValue={ForceToString(format)}
                    onChange={(value: string) => setFormat(value as FormatType)}
                  ></Dropdown>
                </td>
              </tr>

              <tr key="caSplitLevels">
                <td style={{ width: "25%" }}>
                  <Typography level="h4">
                    {parseUICode("ui_split_levels")}
                  </Typography>
                </td>
                <td>
                  <Checkbox
                    checked={splitLevels}
                    onChange={() => setSplitLevels(!splitLevels)}
                  ></Checkbox>
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
                    checked={replaceExisting}
                    setChecked={(value: boolean) => setReplaceExisting(value)}
                  />
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
          <Typography level="h1">
            {parseUICode("ui_codegrade_autotest")}
          </Typography>{" "}
          <div className="emptySpace1" />
          <Typography level="h4">
            {`${parseUICode(
              "ui_project_work"
            )} selected here - CodeGrade ${parseUICode(
              "ui_assignment"
            )} ${parseUICode("ui_ids")}`}
          </Typography>
          <Table borderAxis="none">
            <tbody>
              {testAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td style={{ width: "25%" }}>
                    <Typography level="h4">{assignment.name}</Typography>
                  </td>
                  <td>
                    <InputField fieldKey="caSetName" onChange={null} />
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

      <div className="emptySpace2" style={{ marginTop: "auto" }} />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        {stepperState === 1 ? (
          <ButtonComp
            buttonType="normal"
            onClick={() => exportProject()}
            ariaLabel={parseUICode("ui_aria_export_cg_configs")}
          >
            {parseUICode("ui_export")}
          </ButtonComp>
        ) : (
          ""
        )}
        {stepperState < 1 ? (
          <ButtonComp
            buttonType="normal"
            onClick={() => {
              assignment
                ? handleStepperState(1)
                : handleSnackbar({
                    error: parseUICode("error_no_project_work_selected"),
                  });
            }}
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
        {DEVMODE ? (
          <>
            <ButtonComp
              buttonType="debug"
              onClick={() => console.log(assignment)}
              ariaLabel={"debug"}
            >
              log assignment state
            </ButtonComp>
          </>
        ) : (
          ""
        )}
      </Stack>
    </>
  );
}
