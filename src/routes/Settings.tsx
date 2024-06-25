import PageHeaderBar from "../components/PageHeaderBar";
import texts from "../../resource/texts.json";
import { language } from "../constantsUI";
import { useNavigate } from "react-router-dom";
import { Stack, Table, Typography } from "@mui/joy";
import ButtonComp from "../components/ButtonComp";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { CourseData, Settings, SupportedLanguages } from "../types";
import { useState } from "react";

export default function Settings({
  activeCourse,
}: {
  activeCourse: CourseData;
}) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({
    codeLanguages: [],
    language: "ENG",
  });

  const languageOptions = texts.languages.map((value) => {
    return {
      languageName: value[language.current],
      abbreviation: value["abbreviation"],
    };
  });

  function handleSetLanguage(value: string) {
    languageOptions.map((option) => {
      if (option?.languageName === value) {
        try {
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
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  function handleSaveSettings() {
    window.api.saveSettings(settings);
  }

  return (
    <>
      <PageHeaderBar
        pageName={texts.ui_settings[language.current]}
        courseID={activeCourse?.ID}
        courseTitle={activeCourse?.title}
      />
      <div className="content" style={{ minHeight: "50rem" }}>
        <Typography level="h1">
          {texts.ui_settings[language.current]}
        </Typography>
        <Table borderAxis="none" sx={{ width: "70%" }}>
          <tbody>
            <tr key="caUsername">
              <td style={{ width: "40%" }}>
                <Typography level="h4">
                  {`CodeGrade ${texts.ui_username[language.current]}`}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="caSetName" onChange={null} />
              </td>
            </tr>

            <tr key="caPassword">
              <td style={{ width: "25%" }}>
                <Typography level="h4">
                  {`CodeGrade ${texts.ui_password[language.current]}`}
                </Typography>
              </td>
              <td>
                <InputField fieldKey="caSetName" onChange={null} />
              </td>
            </tr>

            <tr key="caOrganisation">
              <td style={{ width: "25%" }}>
                <Typography level="h4">
                  {`CodeGrade ${texts.ui_organisation[language.current]}`}
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
                  ariaLabel={texts.ui_aria_cg_sign_in[language.current]}
                >
                  {texts.ui_sign_in[language.current]}
                </ButtonComp>
              </td>
            </tr>

            <tr key="caLanguage">
              <td>
                <Typography level="h4">
                  {texts.ui_interface_language[language.current]}
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
