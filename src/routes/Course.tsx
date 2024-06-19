import { useLoaderData, useNavigate } from "react-router-dom";
import texts from "../../resource/texts.json";
import { language, supportedModuleTypes, buttonShadow } from "../constantsUI";
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
import { useCourse } from "../helpers/assignmentHelpers";
import { newCourse } from "../myTestGlobals";
import { courseLevelsToString, splitCourseLevels } from "../helpers/converters";
import { CourseData } from "../types";

export default function Course({ activeCourse }: { activeCourse: CourseData }) {
  let pageType = useLoaderData();

  const initialCourseState = pageType == "create" ? newCourse : activeCourse;
  const [course, handleCourse] = useCourse(initialCourseState);
  const [path, setPath] = useState("");

  let pageTitle: string = null;
  let disableCourseFolderSelect = false;
  const [disableModuleOptions, setDisableModuleOptions] = useState(false);
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
    pageTitle = course.ID + " " + course.title;
    disableCourseFolderSelect = true;
  }
  const navigate = useNavigate();

  async function handleFolderOpen() {
    const folderPath: string = await window.api.selectDir();
    if (folderPath) {
      handlePath(folderPath);
    } else {
      // @TODO show an error
      console.log(folderPath);
    }
  }

  const handlePath = (value: string) => {
    setPath(value);
  };

  const handleCodeLangChange = (selectedName: string) => {
    const selectedCodeLanguage = codeLanguageOptions.find(
      (lang) => lang.name === selectedName
    );
    if (selectedCodeLanguage) {
      handleCourse("codeLanguage", selectedCodeLanguage);
    }
  };

  const moduleTypeOptions: string[] = ["ui_week", "ui_module", "ui_no_module"];

  /**
   * Get the moduleType from the Course state. Return
   * type in correct language.
   */
  const getModuleTypeUI = () => {
    const moduleType: string =
      texts[`ui_${course.moduleType}`]?.[language.current];

    if (!moduleType) {
      return texts[`ui_no_module`]?.[language.current];
    }
    return moduleType;
  };

  /**
   * Use the selected module type in current language to set the
   * Course state module type in the correct language/format.
   */
  const handleSetModuleType = (value: string) => {
    moduleTypeOptions.map((option) => {
      const translationObj = (texts as any)[option];
      const translation = (texts as any)[option]?.[language.current];

      if (translation === value) {
        if (translationObj["ENG"] === "No modules") {
          handleCourse("moduleType", null);
        } else {
          handleCourse("moduleType", translationObj["ENG"].toLowerCase());
        }
      }
    });
  };

  const handleSetLanguage = (value: string) => {
    languageOptions.map((option) => {
      if (option?.languageName === value) {
        handleCourse("language", option.abbreviation);
      }
    });
  };

  return (
    <>
      <PageHeaderBar
        pageName={texts.course_create[language.current]}
        courseID={activeCourse?.ID}
        courseTitle={activeCourse?.title}
      />
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
                <InputField
                  fieldKey="cIDInput"
                  defaultValue={course.ID}
                  onChange={(value: string) => handleCourse("ID", value, true)}
                />
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
                <InputField
                  fieldKey="cNameInput"
                  defaultValue={course.title}
                  onChange={(value: string) =>
                    handleCourse("title", value, true)
                  }
                />
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
                  disabled={true}
                  defaultValue={path}
                  placeholder={path}
                  onChange={null}
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
                  aria-label={
                    texts.ui_aria_open_course_folder[language.current]
                  }
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
                  defaultValue={getModuleTypeUI()}
                  onChange={(value: string) => handleSetModuleType(value)}
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
                  value={course.modules}
                  onChange={(value: number) => handleCourse("modules", value)}
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
                <InputField
                  fieldKey="cCourseLevelsInput"
                  isLarge={true}
                  defaultValue={courseLevelsToString(course.levels)}
                  onChange={(value: string) =>
                    handleCourse("levels", splitCourseLevels(value), true)
                  }
                />
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
                  defaultValue={
                    languageOptions.find(
                      (elem) => elem.abbreviation === course.language
                    )?.languageName
                  }
                  onChange={(value: string) => handleSetLanguage(value)}
                ></Dropdown>
              </td>
            </tr>

            <tr key="cCodeLanguage">
              <td>
                <Typography level="h4">
                  {texts.ui_code_lang[language.current]}
                </Typography>
              </td>
              <td>
                <Dropdown
                  name="cCodeLanguageInput"
                  labelKey="name"
                  defaultValue={course.codeLanguage.name}
                  options={codeLanguageOptions}
                  onChange={handleCodeLangChange}
                ></Dropdown>
              </td>
            </tr>

            <tr key="cCGID">
              <td>
                <Typography level="h4">CodeGrade ID</Typography>
              </td>
              <td>
                <InputField
                  fieldKey="cCGIDInput"
                  defaultValue={
                    course?.CodeGradeID ? String(course.CodeGradeID) : ""
                  }
                  onChange={(value: string) =>
                    handleCourse("CodeGradeID", parseInt(value), true)
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
            onClick={() => {
              if (path && path.length > 1) {
                window.api.saveCourse(course, path);
              } else {
                console.log("choose a folder path");
              }
            }}
            ariaLabel={texts.ui_aria_save[language.current]}
          >
            {texts.ui_save[language.current]}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => console.log(course)}
            ariaLabel={texts.ui_aria_save[language.current]}
          >
            log course state
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
