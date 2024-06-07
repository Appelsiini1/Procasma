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
import PageHeaderBar from "../components/PageHeaderBar";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { useState } from "react";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import defaults from "../../resource/defaults.json";
import ButtonComp from "../components/ButtonComp";
import SwitchComp from "../components/SwitchComp";
import { addVariation } from "../helpers/variationHelpers";

export default function AssignmentInput() {
  const pageType = useLoaderData();
  const navigate = useNavigate();
  let pageTitle: string = null;
  const moduleDisable = currentCourse.moduleType !== null ? false : true;
  const levelsDisable = currentCourse.levels !== null ? false : true;
  const [assingmentLevel, setAssignmentLevel] = useState("0");
  const [moduleNo, setModuleNo] = useState("0");
  const [expanding, setExpanding] = useState(false);
  const [variationAccordion, setVariationAccordion] =
    useState<Array<React.JSX.Element>>(null);
  const codeLanguageOptions = defaults.codeLanguages; //get these from settings file later

  if (pageType === "new") {
    pageTitle = texts.ui_new_assignment[language.current];
  }
  return (
    <>
      <PageHeaderBar pageName={texts.ui_add_assignment[language.current]} />
      <div className="content">
        <Typography level="h1">{pageTitle}</Typography>
        <Table borderAxis="none">
          <tbody>
            <tr key="caTitle">
              <td style={{ width: "25%" }}>
                <Typography level="h4">
                  {texts.ui_assignment_title[language.current]}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="caTitleInput" />
              </td>
            </tr>

            <tr key="caLevel">
              <td>
                <Typography level="h4">
                  {texts.ui_assignment_level[language.current]}
                </Typography>
              </td>
              <td>
                <NumberInput
                  disabled={levelsDisable}
                  value={assingmentLevel}
                  setValue={setAssignmentLevel}
                ></NumberInput>
              </td>
            </tr>

            <tr key="caModule">
              <td>
                <Typography level="h4">
                  {texts.ui_module[language.current]}
                </Typography>
              </td>
              <td>
                <NumberInput
                  disabled={moduleDisable}
                  value={moduleNo}
                  setValue={setModuleNo}
                ></NumberInput>
              </td>
            </tr>

            <tr key="caPositions">
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
                      {texts.ui_assignment_no[language.current]}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText
                      text={texts.help_assignment_no[language.current]}
                    />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField fieldKey="caPositionsInput" />
              </td>
            </tr>

            <tr key="caTags">
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
                      {texts.ui_assignment_tags[language.current]}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText
                      text={texts.help_assignment_tags[language.current]}
                    />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField fieldKey="caTagsInput" />
              </td>
            </tr>

            <tr key="caCodeLanguage">
              <td>
                <Typography level="h4">
                  {texts.ui_code_lang[language.current]}
                </Typography>
              </td>
              <td>
                <Dropdown
                  name="caCodeLanguageInput"
                  options={codeLanguageOptions}
                  labelKey="name"
                  placeholder={
                    texts.help_clang_assignment[language.current] + "..."
                  }
                ></Dropdown>
              </td>
            </tr>

            <tr key="caExpanding">
              <td>
                <Typography level="h4">
                  {texts.ui_exp_assignment[language.current]}
                </Typography>
              </td>
              <td>
                <SwitchComp checked={expanding} setChecked={setExpanding} />
              </td>
            </tr>

            <tr key="caUsedIn">
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
                      {texts.ui_used_in[language.current]}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={texts.help_used_in[language.current]} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField fieldKey="caUsedInInput" />
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="emptySpace1" />
        <Divider
          sx={{
            padding: ".1rem",
            marginLeft: "2rem",
            bgcolor: dividerColor,
            marginRight: "40%",
          }}
          role="presentation"
        />
        <div className="emptySpace2" />

        <div style={{ marginLeft: "0.9rem", width: "100%" }}>
          <Typography level="h3">
            {texts.ui_variations[language.current]}
          </Typography>
          <div className="emptySpace1" />
          <ButtonComp
            buttonType="normal"
            onClick={() =>
              addVariation(variationAccordion, setVariationAccordion)
            }
          >
            {texts.ui_add_variation[language.current]}
          </ButtonComp>
          <div className="emptySpace2" />
          <Box
            sx={{
              maxHeight: "40rem",
              overflowY: "auto",
              width: "100%",
              overflowX: "hidden",
            }}
          >
            <AccordionGroup
              size="lg"
              sx={{ width: "100%", marginRight: "2rem" }}
            >
              {variationAccordion}
            </AccordionGroup>
          </Box>
        </div>

        <div className="emptySpace1" />
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <ButtonComp buttonType="normal" onClick={null}>
            {texts.ui_save[language.current]}
          </ButtonComp>
          <ButtonComp buttonType="normal" onClick={() => navigate(-1)}>
            {texts.ui_cancel[language.current]}
          </ButtonComp>
        </Stack>
      </div>
    </>
  );
}
