import PageHeaderBar from "../components/PageHeaderBar";
import { useLoaderData, useNavigate } from "react-router-dom";
import texts from "../../resource/texts.json";
import { dividerColor } from "../constantsUI";
import { language } from "../globalsUI";
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
    texts.ui_module_selection[language.current],
    texts.ui_set_details[language.current],
    texts.ui_choose_tasks[language.current],
    texts.ui_cg_config[language.current],
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
    pageTitle = texts.ui_create_new_set[language.current];
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
        key={value.ID}
        startAction={
          <Checkbox
            checked={boxState}
            onChange={() =>
              handleSelectedAssignments(value.ID, boxState, setBoxState)
            }
          ></Checkbox>
        }
      >
        <ListItemButton
          selected={boxState}
          onClick={() =>
            handleSelectedAssignments(value.ID, boxState, setBoxState)
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
        pageName={texts.ui_create_new_set[language.current]}
        courseID={activeCourse?.ID}
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
              {texts.ui_module_selection[language.current]}
            </Typography>
            <Table borderAxis="none">
              <tbody>
                <tr key="caTitle">
                  <td style={{ width: "25%" }}>
                    <Typography level="h4">
                      {texts.ui_full_course[language.current]}
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
                      {texts.ui_module[language.current]}
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
            <Typography level="h1">
              {texts.ui_set_details[language.current]}
            </Typography>
            <Table borderAxis="none">
              <tbody>
                <tr key="caSetName">
                  <td style={{ width: "25%" }}>
                    <Typography level="h4">
                      {texts.ui_set_name[language.current]}
                    </Typography>
                  </td>
                  <td>
                    <InputField fieldKey="caSetName" />
                  </td>
                </tr>

                <tr key="caYear">
                  <td>
                    <Typography level="h4">
                      {texts.ui_year[language.current]}
                    </Typography>
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
                      {texts.ui_study_period[language.current]}
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
                      {texts.ui_export_set[language.current]}
                    </Typography>
                  </td>
                  <td>
                    <SwitchComp checked={exportSet} setChecked={setExportSet} />
                  </td>
                </tr>

                <tr key="caFormat">
                  <td>
                    <Typography level="h4">
                      {texts.ui_format[language.current]}
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
                      {texts.ui_export_codegrade_config[language.current]}
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
            <Typography level="h1">
              {texts.ui_choose_tasks[language.current]}
            </Typography>
            <Table borderAxis="none">
              <tbody>
                <tr key="caSetName">
                  <td style={{ width: "25%" }}>
                    <Typography level="h4">
                      {`${texts.ui_module[language.current]} ${moduleNumber}`}
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
                        ariaLabel={
                          texts.ui_aria_show_assignment[language.current]
                        }
                      >
                        {texts.ui_show[language.current]}
                      </ButtonComp>
                      <ButtonComp
                        buttonType="normal"
                        onClick={null}
                        ariaLabel={
                          texts.ui_aria_delete_assignment[language.current]
                        }
                      >
                        {texts.ui_delete[language.current]}
                      </ButtonComp>
                      <ButtonComp
                        buttonType="normal"
                        onClick={null}
                        ariaLabel={
                          texts.ui_aria_add_assignment[language.current]
                        }
                      >
                        {texts.ui_add[language.current]}
                      </ButtonComp>
                      <ButtonComp
                        buttonType="normal"
                        onClick={null}
                        ariaLabel={
                          texts.ui_aria_change_assignment[language.current]
                        }
                      >
                        {texts.ui_change[language.current]}
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
              {texts.ui_codegrade_autotest[language.current]}
            </Typography>
            {exportCGConfigs ? (
              <>
                {" "}
                <div className="emptySpace1" />
                <Typography level="h4">
                  {`${
                    texts.ui_module[language.current]
                  } ${moduleNumber} - CodeGrade ${
                    texts.ui_assignment[language.current]
                  } ${texts.ui_ids[language.current]}`}
                </Typography>
                <Table borderAxis="none">
                  <tbody>
                    {testAssignments.map((assignment) => (
                      <tr key={assignment.ID}>
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
              ariaLabel={texts.ui_aria_export_cg_configs[language.current]}
            >
              {texts.ui_export[language.current]}
            </ButtonComp>
          ) : (
            ""
          )}
          {stepperState < 3 ? (
            <ButtonComp
              buttonType="normal"
              onClick={() => handleStepperState(1)}
              ariaLabel={texts.ui_aria_nav_next[language.current]}
            >
              {texts.ui_next[language.current]}
            </ButtonComp>
          ) : (
            ""
          )}

          <ButtonComp
            buttonType="normal"
            onClick={() => navigate(-1)}
            ariaLabel={texts.ui_aria_close[language.current]}
          >
            {texts.ui_close[language.current]}
          </ButtonComp>

          {stepperState > 0 ? (
            <ButtonComp
              buttonType="normal"
              onClick={() => handleStepperState(-1)}
              ariaLabel={texts.ui_aria_nav_previous[language.current]}
            >
              {texts.ui_previous[language.current]}
            </ButtonComp>
          ) : (
            ""
          )}
        </Stack>
      </div>
    </>
  );
}
