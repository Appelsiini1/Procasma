import PageHeaderBar from "../components/PageHeaderBar";
import { useLoaderData, useNavigate } from "react-router-dom";
import texts from "../../resource/texts.json";
import { language } from "../constantsUI";
import { Grid, Stack, Table, Typography } from "@mui/joy";
import InputField from "../components/InputField";
import { useState } from "react";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import ButtonComp from "../components/ButtonComp";
import { CourseData, ModuleData } from "../types";
import { useModule } from "../helpers/assignmentHelpers";
import { testModule } from "../myTestGlobals";
import { splitStringToArray } from "../helpers/converters";

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
    activeModule ? activeModule : testModule
  );

  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;

  if (pageType === "new") {
    pageTitle = texts.ui_new_module[language.current];
  }

  if (pageType === "manage") {
    pageTitle = texts.ui_edit_module[language.current];
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
                  {texts.ui_module_amount[language.current]}
                </Typography>
              </td>
              <td>
                <NumberInput
                  value={module.ID}
                  onChange={(value: number) => handleModule("ID", value)}
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
                  value={module.assignments}
                  onChange={(value: number) =>
                    handleModule("assignments", value)
                  }
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
                      {texts.ui_week_tags[language.current]}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={texts.help_week_tags[language.current]} />
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
            onClick={() => window.api.saveModule(module, activePath)}
            ariaLabel={texts.ui_aria_save[language.current]}
          >
            {texts.ui_save[language.current]}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => console.log(module)}
            ariaLabel={texts.ui_aria_save[language.current]}
          >
            log module state
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
