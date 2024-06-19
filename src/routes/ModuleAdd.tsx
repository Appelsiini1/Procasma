import PageHeaderBar from "../components/PageHeaderBar";
import { useLoaderData, useNavigate } from "react-router-dom";
import texts from "../../resource/texts.json";
import { language, currentCourse, dividerColor } from "../constantsUI";
import {
  AccordionGroup,
  Box,
  Divider,
  Grid,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import InputField from "../components/InputField";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import Dropdown from "../components/Dropdown";
import { useState } from "react";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import defaults from "../../resource/defaults.json";
import ButtonComp from "../components/ButtonComp";
import SwitchComp from "../components/SwitchComp";
import { addVariation } from "../helpers/variationHelpers";
import { CourseData } from "../types";

export default function ModuleAdd({
  activeCourse,
}: {
  activeCourse: CourseData;
}) {
  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const [moduleNumber, setmoduleNumber] = useState("0");
  const [assignmentAmount, setAssignmentAmount] = useState("0");

  if (pageType === "new") {
    pageTitle = texts.ui_new_module[language.current];
  }
  return (
    <>
      <PageHeaderBar
        pageName={texts.ui_add_assignment[language.current]}
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
                  {texts.ui_assignment_title[language.current]}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="mTitleInput" />
              </td>
            </tr>

            <tr key="mModuleNumber">
              <td>
                <Typography level="h4">
                  {texts.ui_module_amount[language.current]}
                </Typography>
              </td>
              <td>
                <NumberInput
                  value={moduleNumber}
                  setValue={setmoduleNumber}
                  min={0}
                ></NumberInput>
              </td>
            </tr>

            <tr key="mAssignmentAmount">
              <td>
                <Typography level="h4">
                  {texts.ui_module[language.current]}
                </Typography>
              </td>
              <td>
                <NumberInput
                  value={assignmentAmount}
                  setValue={setAssignmentAmount}
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
                      {texts.ui_week_topics[language.current]}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={texts.help_week_topics[language.current]} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField fieldKey="mTopicInput" isLarge />
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
                    <Typography level="h4">
                      {texts.ui_inst[language.current]}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={texts.help_week_inst[language.current]} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField fieldKey="mInstructionInput" isLarge />
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
                      {texts.ui_week_tags[language.current]}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={texts.help_week_tags[language.current]} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField fieldKey="mTagInput" />
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
            onClick={null}
            ariaLabel={texts.ui_aria_save[language.current]}
          >
            {texts.ui_save[language.current]}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => navigate(-1)}
            ariaLabel={texts.ui_aria_cancel[language.current]}
          >
            {texts.ui_cancel[language.current]}
          </ButtonComp>
        </Stack>
      </div>
    </>
  );
}
