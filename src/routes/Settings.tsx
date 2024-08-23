import texts from "../../resource/texts.json";
import { globalSettings, language } from "../globalsUI";
import { useNavigate } from "react-router-dom";
import { Stack, Table, Typography } from "@mui/joy";
import ButtonComp from "../components/ButtonComp";
import InputField from "../components/InputField";
import Dropdown from "../components/Dropdown";
import { SettingsType, SupportedLanguages } from "../types";
import { useContext, useEffect, useState } from "react";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import { parseUICode } from "../rendererHelpers/translation";
import { UIContext } from "../components/Context";
import SwitchComp from "../components/SwitchComp";
import NumberInput from "../components/NumberInput";
import {
  pageTableMaxWidth,
  pageTableMinWidth,
  titleCellWidth,
} from "../constantsUI";

export default function Settings() {
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const navigate = useNavigate();
  const [checked, setChecked] = useState<boolean>(globalSettings.shortenFiles);
  const [settings, setSettings] = useState<SettingsType>(globalSettings.values);
  const [maxLines, setMaxLines] = useState<number>(
    globalSettings.fileMaxLinesDisplay
  );

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
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }

  async function handleSaveSettings() {
    const newSettings: SettingsType = {
      ...settings,
      shortenFiles: checked,
      fileMaxLinesDisplay: maxLines,
    };
    setSettings(newSettings);

    let snackbarSeverity = "success";
    let snackbarText = "";
    try {
      snackbarText = await handleIPCResult(() =>
        window.api.saveSettings(newSettings)
      );
      globalSettings.values = newSettings;
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
  }

  useEffect(() => {
    handleHeaderPageName("ui_settings");
  }, []);

  return (
    <>
      <Typography level="h1">{parseUICode("ui_settings")}</Typography>
      <Table
        borderAxis="none"
        sx={{ minWidth: pageTableMinWidth, maxWidth: pageTableMaxWidth }}
      >
        <tbody>
          <tr key="sUsername">
            <td style={{ width: titleCellWidth }}>
              <Typography level="h4">
                {`CodeGrade ${parseUICode("ui_username")}`}
              </Typography>
            </td>
            <td>
              <InputField fieldKey="caSetName" onChange={null} />
            </td>
          </tr>

          <tr key="sPassword">
            <td style={{ width: titleCellWidth }}>
              <Typography level="h4">
                {`CodeGrade ${parseUICode("ui_password")}`}
              </Typography>
            </td>
            <td>
              <InputField fieldKey="caSetName" onChange={null} />
            </td>
          </tr>

          <tr key="sOrganisation">
            <td style={{ width: titleCellWidth }}>
              <Typography level="h4">
                {`CodeGrade ${parseUICode("ui_organisation")}`}
              </Typography>
            </td>
            <td>
              <InputField fieldKey="caSetName" onChange={null} />
            </td>
          </tr>

          <tr key="caSignIn">
            <td style={{ width: titleCellWidth }}>
              <ButtonComp
                buttonType="normalAlt"
                onClick={null}
                ariaLabel={parseUICode("ui_aria_cg_sign_in")}
              >
                {parseUICode("ui_sign_in")}
              </ButtonComp>
            </td>
          </tr>

          <tr key="sLanguage">
            <td>
              <Typography level="h4">
                {parseUICode("ui_interface_language")}
              </Typography>
            </td>
            <td>
              <Dropdown
                name="sLanguageInput"
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

          <tr key="sShortenFilesInput">
            <td style={{ width: "25%" }}>
              <Typography level="h4">
                {parseUICode("ui_shorten_files")}
              </Typography>
            </td>
            <td>
              <SwitchComp checked={checked} setChecked={setChecked} />
            </td>
          </tr>

          <tr key="sMaxLinesInput">
            <td style={{ width: "25%" }}>
              <Typography level="h4">{parseUICode("ui_max_lines")}</Typography>
            </td>
            <td>
              <NumberInput min={1} value={maxLines} onChange={setMaxLines} />
            </td>
          </tr>
        </tbody>
      </Table>

      <div className="emptySpace2" style={{ marginTop: "auto" }} />
      <ButtonComp
        buttonType="normalAlt"
        onClick={() => navigate("/licenses")}
        ariaLabel={parseUICode("ui_licenses")}
      >
        {parseUICode("ui_licenses")}
      </ButtonComp>
      <div className="emptySpace2" style={{ marginTop: "auto" }} />
      <Stack
        direction="row"
        justifyContent="left"
        alignItems="flex-start"
        spacing={2}
      >
        <ButtonComp
          buttonType="normal"
          onClick={() => {
            handleSaveSettings();
            navigate("/");
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
      </Stack>
    </>
  );
}
