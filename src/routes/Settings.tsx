import texts from "../../resource/texts.json";
import { globalSettings, language } from "../globalsUI";
import { useNavigate } from "react-router";
import { Grid, Stack, Table, Typography } from "@mui/joy";
import ButtonComp from "../components/ButtonComp";
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
import HelpText from "../components/HelpText";
import log from "electron-log/renderer";
import SpecialButton from "../components/SpecialButton";

export default function Settings() {
  const { handleHeaderPageName, handleSnackbar } = useContext(UIContext);
  const navigate = useNavigate();
  const [checkedFiles, setCheckedFiles] = useState<boolean>(
    globalSettings.shortenFiles
  );
  const [checkedCode, setCheckedCode] = useState<boolean>(
    globalSettings.shortenCode
  );
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
      shortenFiles: checkedFiles,
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
      language.current = newSettings.language as SupportedLanguages;
    } catch (err) {
      snackbarText = err.message;
      snackbarSeverity = "error";
    }
    handleSnackbar({ [snackbarSeverity]: parseUICode(snackbarText) });
    //log.debug(globalSettings);
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
            <td style={{ width: titleCellWidth }}>
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <Grid xs={10}>
                  <Typography level="h4">
                    {parseUICode("ui_shorten_files")}
                  </Typography>
                </Grid>
                <Grid xs={2}>
                  <HelpText text={parseUICode("help_shorten_files")} />
                </Grid>
              </Grid>
            </td>
            <td>
              <SwitchComp checked={checkedFiles} setChecked={setCheckedFiles} />
            </td>
          </tr>

          <tr key="sMaxLinesInput">
            <td style={{ width: titleCellWidth }}>
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <Grid xs={10}>
                  <Typography level="h4">
                    {parseUICode("ui_max_lines")}
                  </Typography>
                </Grid>
                <Grid xs={2}>
                  <HelpText text={parseUICode("help_max_lines")} />
                </Grid>
              </Grid>
            </td>
            <td>
              <NumberInput min={1} value={maxLines} onChange={setMaxLines} />
            </td>
          </tr>

          <tr key="sShortenCode">
            <td style={{ width: titleCellWidth }}>
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <Grid xs={10}>
                  <Typography level="h4">
                    {parseUICode("ui_shorten_code")}
                  </Typography>
                </Grid>
                <Grid xs={2}>
                  <HelpText text={parseUICode("help_shorten_code")} />
                </Grid>
              </Grid>
            </td>
            <td>
              <SwitchComp
                checked={checkedCode}
                setChecked={setCheckedCode}
                disabled={!checkedFiles}
              />
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
        <SpecialButton buttonType="cancel" />
      </Stack>
    </>
  );
}
