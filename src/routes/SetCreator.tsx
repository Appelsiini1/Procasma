import PageHeaderBar from "../components/PageHeaderBar";
import { useLoaderData, useNavigate } from "react-router-dom";
import { dividerColor } from "../constantsUI";
import {
  Box,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { useState } from "react";
import NumberInput from "../components/NumberInput";
import ButtonComp from "../components/ButtonComp";
import SwitchComp from "../components/SwitchComp";
import StepperComp from "../components/StepperComp";
import { CourseData } from "../types";
import { parseUICode } from "../rendererHelpers/translation";

const dividerSX = { padding: ".1rem", margin: "2rem", bgcolor: dividerColor };

// Get list of assignments via IPC later
const testAssignments = [
  { ID: "1", name: "L01T1 - Otsikko" },
  { ID: "2", name: "L01T2 - Otsikko" },
];

export default function SetCreator({
  activeCourse,
}: {
  activeCourse: CourseData;
}) {
  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const [moduleNumber, setmoduleNumber] = useState("1");
  const [fullCourse, setFullCourse] = useState(false);
  const [stepperState, setStepperState] = useState<number>(0);
  const modules: object[] = [];
  const formats: object[] = [];
  const [assignmentSetYear, setAssignmentSetYear] = useState("2024");
  const [studyPeriod, setStudyPeriod] = useState("1");
  const [exportSet, setExportSet] = useState(true);
  const [exportCGConfigs, setExportCGConfigs] = useState(true);
  const [selectedAssignments, setSelectedAssignments] = useState<Array<string>>(
    []
  );
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

  function handleSelectedAssignments(
    moduleID: string,
    state: boolean,
    setBoxState: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    if (state) {
      setSelectedAssignments(
        selectedAssignments.filter((value) => value !== moduleID)
      );
      setBoxState(!state);
    } else {
      setSelectedAssignments([...selectedAssignments, moduleID]);
      setBoxState(!state);
    }
  }

  assignments = testAssignments.map((value) => {
    const [boxState, setBoxState] = useState(false);
    return (
      <ListItem
        key={value.id}
        startAction={
          <Checkbox
            checked={boxState}
            onChange={() =>
              handleSelectedAssignments(value.id, boxState, setBoxState)
            }
          ></Checkbox>
        }
      >
        <ListItemButton
          selected={boxState}
          onClick={() =>
            handleSelectedAssignments(value.id, boxState, setBoxState)
          }
        >
          {value.name}
        </ListItemButton>
      </ListItem>
    );
  });

  return (
    <>
      <PageHeaderBar
        pageName={parseUICode("ui_create_new_set")}
        courseID={activeCourse?.id}
        courseTitle={activeCourse?.title}
      />
      <div className="content" style={{ minHeight: "50rem" }}>
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
                      checked={fullCourse}
                      setChecked={setFullCourse}
                    />
                  </td>
                </tr>

                <tr key="caModule">
                  <td>
                    <Typography level="h4">
                      {parseUICode("ui_module")}
                    </Typography>
                  </td>
                  <td>
                    <Dropdown
                      name="caModuleInput"
                      options={modules}
                      labelKey="name"
                      placeholder={"..."}
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
                    <InputField fieldKey="caSetName" />
                  </td>
                </tr>

                <tr key="caYear">
                  <td>
                    <Typography level="h4">{parseUICode("ui_year")}</Typography>
                  </td>
                  <td>
                    <NumberInput
                      disabled={false}
                      value={assignmentSetYear}
                      setValue={setAssignmentSetYear}
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
                      value={studyPeriod}
                      setValue={setStudyPeriod}
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
                    <SwitchComp checked={exportSet} setChecked={setExportSet} />
                  </td>
                </tr>

                <tr key="caFormat">
                  <td>
                    <Typography level="h4">
                      {parseUICode("ui_format")}
                    </Typography>
                  </td>
                  <td>
                    <Dropdown
                      name="caModuleInput"
                      options={formats}
                      labelKey="name"
                      placeholder={"..."}
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
                      checked={exportCGConfigs}
                      setChecked={setExportCGConfigs}
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
                      {`${parseUICode("ui_module")} ${moduleNumber}`}
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
            {exportCGConfigs ? (
              <>
                {" "}
                <div className="emptySpace1" />
                <Typography level="h4">
                  {`${parseUICode(
                    "ui_module"
                  )} ${moduleNumber} - CodeGrade ${parseUICode(
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
                          <InputField fieldKey="caSetName" />
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
          {stepperState === 3 && exportCGConfigs ? (
            <ButtonComp
              buttonType="normal"
              onClick={null}
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
      </div>
    </>
  );
}
