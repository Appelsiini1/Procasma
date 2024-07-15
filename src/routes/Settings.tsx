import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language } from "../globalsUI";
import { useNavigate } from "react-router-dom";
import { Stack, Table, Typography } from "@mui/joy";
import ButtonComp from "../components/ButtonComp";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { CourseData, SettingsType, SupportedLanguages } from "../types";
import { useState } from "react";
import SnackbarComp, {
  SnackBarAttributes,
  functionResultToSnackBar,
} from "../components/SnackBarComp";
import { handleIPCResult } from "../helpers/errorHelpers";
import { parseUICode } from "../helpers/translation";

export default function Settings({
  activeCourse,
}: {
  activeCourse: CourseData;
}) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsType>({
    codeLanguages: [],
    language: "ENG",
  });
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "success", text: "" });

  const languageOptions = texts.languages.map((value) => {
    return {
      languageName: value[language.current],
      abbreviation: value["abbreviation"],
    };
  });

  function handleSetLanguage(value: string) {
    try {
      languageOptions.map((option) => {
        if (option?.languageName === value) {
          // attempt cast
          const abbreviation: SupportedLanguages =
            option.abbreviation as SupportedLanguages;

          // set the current global language
          language.current = abbreviation;

          setSettings((prevSettings) => {
            const newSettings = prevSettings;
            newSettings.language = abbreviation;
            return newSettings;
          });
        }
      });
    } catch (err) {
      functionResultToSnackBar(
        { error: parseUICode(err.message) },
        setShowSnackbar,
        setSnackBarAttributes
      );
    }
  }

  async function handleSaveSettings() {
    let snackbarSeverity = "success";
    let snackbarText = "";
    try {
      snackbarText = await handleIPCResult(() =>
        window.api.saveSettings(settings)
      );
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    functionResultToSnackBar(
      { [snackbarSeverity]: snackbarText },
      setShowSnackbar,
      setSnackBarAttributes
    );
  }

  return (
    <>
      <PageHeaderBar
        pageName={parseUICode("ui_settings")}
        courseID={activeCourse?.ID}
        courseTitle={activeCourse?.title}
      />
      <div className="content" style={{ height: "40rem", maxHeight: "80vh" }}>
        <Typography level="h1">{parseUICode("ui_settings")}</Typography>
        <Table borderAxis="none" sx={{ width: "70%" }}>
          <tbody>
            <tr key="caUsername">
              <td style={{ width: "40%" }}>
                <Typography level="h4">
                  {`CodeGrade ${parseUICode("ui_username")}`}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="caSetName" onChange={null} />
              </td>
            </tr>

            <tr key="caPassword">
              <td style={{ width: "25%" }}>
                <Typography level="h4">
                  {`CodeGrade ${parseUICode("ui_password")}`}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="caSetName" onChange={null} />
              </td>
            </tr>

            <tr key="caOrganisation">
              <td style={{ width: "25%" }}>
                <Typography level="h4">
                  {`CodeGrade ${parseUICode("ui_organisation")}`}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="caSetName" onChange={null} />
              </td>
            </tr>

            <tr key="caSignIn">
              <td style={{ width: "25%" }}>
                <ButtonComp
                  buttonType="normalAlt"
                  onClick={null}
                  ariaLabel={parseUICode("ui_aria_cg_sign_in")}
                >
                  {parseUICode("ui_sign_in")}
                </ButtonComp>
              </td>
            </tr>

            <tr key="caLanguage">
              <td>
                <Typography level="h4">
                  {parseUICode("ui_interface_language")}
                </Typography>
              </td>
              <td>
                <Dropdown
                  name="cLanguageInput"
                  options={languageOptions}
                  labelKey="languageName"
                  defaultValue={
                    languageOptions.find(
                      (elem) => elem.abbreviation === language.current
                    )?.languageName
                  }
                  onChange={(value: string) => handleSetLanguage(value)}
                ></Dropdown>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="emptySpace2" style={{ marginTop: "auto" }} />
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
        >
          <ButtonComp
            buttonType="normal"
            onClick={() => handleSaveSettings()}
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
        </Stack>
      </div>
      {showSnackbar ? (
        <SnackbarComp
          text={snackBarAttributes.text}
          color={snackBarAttributes.color}
          setShowSnackbar={setShowSnackbar}
        ></SnackbarComp>
      ) : null}
    </>
  );
}
