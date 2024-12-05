import { useLoaderData, useNavigate } from "react-router";
import { dividerSX } from "../constantsUI";
import {
  Card,
  CardContent,
  Checkbox,
  Divider,
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
import { UIContext } from "../components/Context";

// Get list of assignments via IPC later
const testAssignments = [
  { id: "1", name: "T1 - Otsikko" },
  { id: "2", name: "T2 - Otsikko" },
];

export default function ExportProject() {
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const pageType = useLoaderData();
  const navigate = useNavigate();
  const pageTitle: string = null;
  const [moduleNumber, setmoduleNumber] = useState("1");
  const [stepperState, setStepperState] = useState<number>(0);
  const formats: object[] = [];
  const [splitLevels, setSplitLevels] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("A");
  const stepHeadings: string[] = [
    parseUICode("ui_choose_project"),
    parseUICode("ui_cg_config"),
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

  useEffect(() => {
    handleHeaderPageName("ui_export_project");
  }, []);

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
            onClick={null}
            ariaLabel={parseUICode("ui_aria_choose_project")}
          >
            {parseUICode("ui_select")}
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
                    placeholder={"..."}
                    onChange={null}
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
            )} ${selectedLevel} - CodeGrade ${parseUICode(
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
            onClick={null}
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
    </>
  );
}
