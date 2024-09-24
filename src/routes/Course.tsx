import { useLoaderData, useNavigate } from "react-router-dom";
import texts from "../../resource/texts.json";
import {
  supportedModuleTypes,
  buttonShadow,
  pageTableMaxWidth,
  pageTableMinWidth,
  titleCellWidth,
  DEVMODE,
} from "../constantsUI";
import { globalSettings, language } from "../globalsUI";
import { Grid, IconButton, Stack, Table, Typography } from "@mui/joy";
import InputField from "../components/InputField";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import Dropdown from "../components/Dropdown";
import { useContext, useEffect, useState } from "react";
import NumberInput from "../components/NumberInput";
import HelpText from "../components/HelpText";
import ButtonComp from "../components/ButtonComp";
import { useCourse } from "../rendererHelpers/assignmentHelpers";
import { defaultCourse } from "../defaultObjects";
import {
  courseLevelsToString,
  splitCourseLevels,
} from "../generalHelpers/converters";
import { CourseData } from "../types";
import { parseUICode } from "../rendererHelpers/translation";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { ActiveObjectContext, UIContext } from "../components/Context";

export default function Course() {
  const {
    activeCourse,
    activePath,
    handleActiveCourse,
    handleActivePath,
  }: {
    activeCourse: CourseData;
    activePath?: string;
    handleActiveCourse?: React.Dispatch<React.SetStateAction<CourseData>>;
    handleActivePath: React.Dispatch<React.SetStateAction<string>>;
  } = useContext(ActiveObjectContext);
  const {
    handleHeaderPageName,
    handleHeaderCourseID,
    handleHeaderCourseTitle,
  } = useContext(UIContext);

  let pageType = useLoaderData();

  if (!activeCourse) {
    pageType = "create";
  }

  const initialCourseState =
    pageType == "create" ? defaultCourse : activeCourse;
  const [course, handleCourse] = useCourse(initialCourseState);
  const [path, setPath] = useState(pageType == "create" ? "" : activePath);
  const { handleSnackbar } = useContext(UIContext);
  const [navigateToMenu, setNavigateToMenu] = useState(false);

  let pageTitle: string = null;
  let disableCourseFolderSelect = false;
  const [disableModuleOptions, setDisableModuleOptions] = useState(false);
  const languageOptions = texts.languages.map((value) => {
    return {
      languageName: value[language.current],
      abbreviation: value["abbreviation"],
    };
  });
  const codeLanguageOptions = globalSettings.codeLanguages;
  //get these from settings file later

  if (pageType == "create") {
    pageTitle = parseUICode("course_create");
  } else {
    pageTitle = course.id + " " + course.title;
    disableCourseFolderSelect = true;
  }
  const navigate = useNavigate();

  async function handleFolderOpen() {
    try {
      const path: string = await handleIPCResult(() => window.api.selectDir());
      handlePath(path);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
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

  const moduleTypeOptions: string[] = [
    "ui_week",
    "ui_module",
    "ui_lecture",
    "ui_no_module",
  ];

  const getModuleTypeUI = () => {
    const code = `ui_${course.moduleType}`;
    const moduleType = parseUICode(code);

    if (moduleType == code) {
      return parseUICode("ui_no_module");
    }
    return moduleType;
  };

  /**
   * Use the selected module type in current language to set the
   * Course state module type in the correct language/format.
   */
  const handleSetModuleType = (value: string) => {
    try {
      moduleTypeOptions.map((option) => {
        const translationObj = (texts as any)[option];
        const translation = (texts as any)[option]?.[language.current];

        if (translation === value) {
          if (translationObj["ENG"] === "No modules") {
            handleCourse("moduleType", null);
            setDisableModuleOptions(true);
            handleCourse("modules", 0);
          } else {
            handleCourse("moduleType", translationObj["ENG"].toLowerCase());
            setDisableModuleOptions(false);
          }
        }
      });
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  };

  const handleSetLanguage = (value: string) => {
    languageOptions.map((option) => {
      if (option?.languageName === value) {
        handleCourse("language", option.abbreviation);
      }
    });
  };

  async function handleSaveCourse() {
    let snackbarSeverity = "success";
    let snackbarText = "ui_course_folder_opened";
    try {
      if (!path || path.length < 1) {
        handleSnackbar({ info: parseUICode("ui_choose_folder_path") });
        return;
      }

      if (pageType == "manage") {
        snackbarText = await handleIPCResult(() =>
          window.api.handleUpdateCourseFS(course, path)
        );

        handleActiveCourse(course);
        setNavigateToMenu(true);
      } else {
        const newCoursePath = await handleIPCResult(() =>
          window.api.handleAddCourseFS(course, path)
        );

        setNavigateToMenu(true);
        handleActiveCourse(course);
        handleActivePath(newCoursePath);
      }
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  function handleLevelsChange(value: string) {
    let levels = splitCourseLevels(value);
    let amount = 0;
    for (const level in levels) {
      amount += 1;
    }
    if (amount > 1) {
      handleCourse("maxLevel", amount);
      handleCourse("minLevel", 1);
    } else {
      handleCourse("maxLevel", 0);
      handleCourse("minLevel", 0);
    }

    handleCourse("levels", levels, true);
  }

  useEffect(() => {
    handleHeaderPageName("course_create");
    if (pageType == "create") {
      handleActiveCourse(null);
      handleActivePath(null);
      handleHeaderCourseID(null);
      handleHeaderCourseTitle(null);
    }
  }, []);

  //Navigates to the main menu after saving a new course
  useEffect(() => {
    if (activeCourse && activePath && navigateToMenu) {
      setNavigateToMenu(false);
      navigate("/");
    }
  }, [activeCourse, activePath, navigateToMenu]);

  return (
    <>
      <div style={{ maxWidth: pageTableMaxWidth, minWidth: pageTableMinWidth }}>
        <Typography level="h1">{pageTitle}</Typography>
        <Table borderAxis="none">
          <tbody>
            <tr key="cID">
              <td style={{ width: titleCellWidth }}>
                <Typography level="h4">
                  {parseUICode("ui_course_id")}
                </Typography>
              </td>
              <td>
                <InputField
                  fieldKey="cIDInput"
                  defaultValue={course.id}
                  onChange={(value: string) => handleCourse("id", value, true)}
                />
              </td>
              <td style={{ width: "5%" }}></td>
            </tr>

            <tr key="cName">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_course_name")}
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
                  {parseUICode("ui_course_folder")}
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
                  aria-label={parseUICode("ui_aria_open_course_folder")}
                >
                  <FolderOpenIcon />
                </IconButton>
              </td>
            </tr>

            <tr key="cModuleType">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_module_type")}
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
                  {parseUICode("ui_module_count")}
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
                      {parseUICode("ui_course_levels")}
                    </Typography>
                  </Grid>
                  <Grid xs={2}>
                    <HelpText text={parseUICode("help_course_levels")} />
                  </Grid>
                </Grid>
              </td>
              <td>
                <InputField
                  fieldKey="cCourseLevelsInput"
                  isLarge={true}
                  defaultValue={courseLevelsToString(course.levels)}
                  onChange={(value: string) => handleLevelsChange(value)}
                />
              </td>
            </tr>

            <tr key="cLanguage">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_course_language")}
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
                  {parseUICode("ui_code_lang")}
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
              handleSaveCourse();
            }}
            ariaLabel={parseUICode("ui_aria_save")}
          >
            {parseUICode("ui_save")}
          </ButtonComp>
          <ButtonComp
            buttonType="normal"
            onClick={() => navigate(-1)}
            ariaLabel={parseUICode("ui_aria_cancel")}
          >
            {parseUICode("ui_cancel")}
          </ButtonComp>
          {DEVMODE ? (
            <ButtonComp
              buttonType="debug"
              onClick={() => console.log(course)}
              ariaLabel={" debug "}
            >
              log course state
            </ButtonComp>
          ) : (
            ""
          )}
        </Stack>
      </div>
    </>
  );
}
