import { useLoaderData, useNavigate } from "react-router-dom";
import texts from "../../resource/texts.json";
import {
  language,
  currentCourse,
  supportedModuleTypes,
  buttonShadow,
} from "../constantsUI";
import { Grid, IconButton, Stack, Table, Typography } from "@mui/joy";
import PageHeaderBar from "../components/PageHeaderBar";
import InputField from "../components/InputField";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import Dropdown from "../components/Dropdown";
import { useState } from "react";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import defaults from "../../resource/defaults.json";
import ButtonComp from "../components/ButtonComp";

export default function Course() {
  let pageType = useLoaderData();
  let pageTitle: string = null;
  let disableCourseFolderSelect = false;
  const [disableModuleOptions, setDisableModuleOptions] = useState(false);
  const [moduleAmount, setModuleAmount] = useState("0");
  const languageOptions = texts.languages.map((value) => {
    return {
      languageName: value[language.current],
      abbreviation: value["abbreviation"],
    };
  });
  const codeLanguageOptions = defaults.codeLanguages; //get these from settings file later
  if (pageType == "create") {
    pageTitle = texts.course_create[language.current];
  } else {
    pageTitle = currentCourse.ID + " " + currentCourse.title;
    disableCourseFolderSelect = true;
  }
  const navigate = useNavigate();

  function handleFolderOpen() {
    console.log("Folder open");
  }
  function handleModuleDropdownChange(
    event: React.SyntheticEvent | null,
    newValue: string | null
  ) {
    console.log("New value: " + newValue);
    if (newValue === texts.ui_no_module[language.current]) {
      setDisableModuleOptions(true);
    } else {
      if (disableModuleOptions) {
        setDisableModuleOptions(false);
      }
    }
  }

  return (
    <>
      <PageHeaderBar pageName={texts.course_create[language.current]} />
      <div className="content">
        <Typography level="h1">{pageTitle}</Typography>
        <Table borderAxis="none">
          <tbody>
            <tr key="cID">
              <td style={{ width: "25%" }}>
                <Typography level="h4">
                  {texts.ui_course_id[language.current]}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="cIDInput" />
              </td>
              <td style={{ width: "20%" }}></td>
            </tr>

            <tr key="cName">
              <td>
                <Typography level="h4">
                  {texts.ui_course_name[language.current]}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="cNameInput" />
              </td>
            </tr>

            <tr key="cFolder">
              <td>
                <Typography level="h4">
                  {texts.ui_course_folder[language.current]}
                </Typography>
              </td>
              <td>
                <InputField
                  fieldKey="cFolderInput"
                  disabled={disableCourseFolderSelect}
                />
              </td>
              <td>
                <IconButton
                  disabled={disableCourseFolderSelect}
                  sx={{
                    backgroundColor: "#F8A866",
                    "&:hover": { backgroundColor: "#F68C35" },
                    boxShadow: buttonShadow,
                  }}
                  onClick={() => handleFolderOpen()}
                >
                  <FolderOpenIcon />
                </IconButton>
              </td>
            </tr>

            <tr key="cModuleType">
              <td>
                <Typography level="h4">
                  {texts.ui_module_type[language.current]}
                </Typography>
              </td>
              <td>
                <Dropdown
                  name="cModuleTypeInput"
                  options={supportedModuleTypes}
                  labelKey="typeName"
                  onChange={handleModuleDropdownChange}
                ></Dropdown>
              </td>
            </tr>

            <tr key="cModuleAmount">
              <td>
                <Typography level="h4">
                  {texts.ui_module_amount[language.current]}
                </Typography>
              </td>
              <td>
                <NumberInput
                  disabled={disableModuleOptions}
                  value={moduleAmount}
                  setValue={setModuleAmount}
                ></NumberInput>
              </td>
            </tr>

            <tr key="cCourseLevels">
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
                      {texts.ui_course_levels[language.current]}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText
                      text={texts.help_course_levels[language.current]}
                    />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField fieldKey="cCourseLevelsInput" isLarge={true} />
              </td>
            </tr>

            <tr key="cLanguage">
              <td>
                <Typography level="h4">
                  {texts.ui_course_language[language.current]}
                </Typography>
              </td>
              <td>
                <Dropdown
                  name="cLanguageInput"
                  options={languageOptions}
                  labelKey="languageName"
                ></Dropdown>
              </td>
            </tr>

            <tr key="cCodeLanguage">
              <td>
                <Typography level="h4">
                  {texts.ui_course_language[language.current]}
                </Typography>
              </td>
              <td>
                <Dropdown
                  name="cCodeLanguageInput"
                  options={codeLanguageOptions}
                  labelKey="name"
                ></Dropdown>
              </td>
            </tr>

            <tr key="cCGID">
              <td>
                <Typography level="h4">CodeGrade ID</Typography>
              </td>
              <td>
                <InputField fieldKey="cCGIDInput" />
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
