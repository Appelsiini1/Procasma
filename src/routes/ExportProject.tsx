import PageHeaderBar from "../components/PageHeaderBar";
import { useLoaderData, useNavigate } from "react-router-dom";
import texts from "../../resource/texts.json";
import { language, currentCourse, dividerColor } from "../constantsUI";
import {
  Box,
  Card,
  CardContent,
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
  { ID: "1", name: "T1 - Otsikko" },
  { ID: "2", name: "T2 - Otsikko" },
];

export default function ExportProject({
  activeCourse,
}: {
  activeCourse: CourseData;
}) {
  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const [moduleNumber, setmoduleNumber] = useState("1");
  const [stepperState, setStepperState] = useState<number>(0);
  const formats: object[] = [];
  const [splitLevels, setSplitLevels] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("A");
  const stepHeadings: string[] = [
    texts.ui_choose_project[language.current],
    texts.ui_cg_config[language.current],
  ];

  const handleStepperState = (navigation: number) => {
    setStepperState((prevState) => {
      const newState: number = prevState + navigation;
      if (newState >= 0 && newState <= 3) {
        return newState;
      }
      return prevState;
    });
  };

  return (
    <>
      <PageHeaderBar
        pageName={texts.ui_export_project[language.current]}
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
              {texts.ui_choose_project[language.current]}
            </Typography>

            <div className="emptySpace1" />
            <ButtonComp
              buttonType="normal"
              onClick={null}
              ariaLabel={texts.ui_aria_choose_project[language.current]}
            >
              {texts.ui_select[language.current]}
            </ButtonComp>

            {selectedLevel ? (
              <>
                <div className="emptySpace1" />
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="start"
                  spacing={0.5}
                  sx={{ width: "100%", height: "3.5rem" }}
                >
                  <Card variant="soft" sx={{ width: "100%" }}>
                    <CardContent>
                      <Typography level="title-md">{selectedLevel}</Typography>
                    </CardContent>
                  </Card>

                  <ButtonComp
                    buttonType="delete"
                    onClick={() => setSelectedLevel(null)}
                    ariaLabel={texts.ui_aria_delete_level[language.current]}
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

                <tr key="caSplitLevels">
                  <td style={{ width: "25%" }}>
                    <Typography level="h4">
                      {texts.ui_split_levels[language.current]}
                    </Typography>
                  </td>
                  <td>
                    <Checkbox
                      checked={splitLevels}
                      onChange={() => setSplitLevels(!splitLevels)}
                    ></Checkbox>
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
              {texts.ui_codegrade_autotest[language.current]}
            </Typography>{" "}
            <div className="emptySpace1" />
            <Typography level="h4">
              {`${
                texts.ui_project_work[language.current]
              } ${selectedLevel} - CodeGrade ${
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
              onClick={null}
              ariaLabel={texts.ui_aria_export_cg_configs[language.current]}
            >
              {texts.ui_export[language.current]}
            </ButtonComp>
          ) : (
            ""
          )}
          {stepperState < 1 ? (
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
