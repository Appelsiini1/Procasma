import {
  Alert,
  CircularProgress,
  Modal,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import { parseUICode } from "../rendererHelpers/translation";
import { useContext, useEffect, useState } from "react";
import Dropdown from "../components/Dropdown";
import { handleIPCResult } from "../rendererHelpers/errorHelpers";
import log from "electron-log/renderer";
import { UIContext } from "../components/Context";
import InputField from "../components/InputField";
import {
  pageTableMaxWidth,
  pageTableMinWidth,
  titleCellWidth,
} from "../constantsUI";
import { CodeGradeLogin, CodeGradeTenant } from "../types";
import ButtonComp from "../components/ButtonComp";
import { capitalizeFirstLetter } from "../rendererHelpers/capitalize";
import SwitchComp from "../components/SwitchComp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";

export default function CodeGradeSettings() {
  const { handleSnackbar } = useContext(UIContext);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenants, setTenants] = useState<Array<CodeGradeTenant>>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [loginDetails, setLoginDetails] = useState<CodeGradeLogin>({
    username: "",
    password: "",
    tenantId: "",
    hostname: "",
  });
  const [hasLoginDetails, setHasLoginDetails] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(true);
  const [hasSavedCredentials, setHasSavedCredentials] =
    useState<boolean>(false);

  async function getTenants() {
    try {
      const result = await handleIPCResult(() => window.api.getTenants());
      setTenants(result);
    } catch (err) {
      handleSnackbar({ error: parseUICode(err.message) });
    }
  }
  async function loginWrapper(
    loginDetails: CodeGradeLogin,
    saveDetails: boolean
  ) {
    try {
      const result = await handleIPCResult(() =>
        window.api.CGLogin(loginDetails, false)
      );
      if (saveDetails) {
        await handleIPCResult(() => window.api.saveCredentials(loginDetails));
      }
      handleSnackbar({ success: parseUICode(result) });
    } catch (err) {
      handleSnackbar({ error: err.message });
    }
  }

  async function checkCredentials() {
    const result = await handleIPCResult(() =>
      window.api.checkCredentialExistance()
    );
    setHasSavedCredentials(result);
  }

  useEffect(() => {
    getTenants();
    checkCredentials();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [tenants]);

  useEffect(() => {
    if (
      loginDetails.username !== "" &&
      loginDetails.password !== "" &&
      loginDetails.hostname !== ""
    ) {
      setHasLoginDetails(true);
    }
  }, [loginDetails]);

  useEffect(() => {
    //log.debug(selectedTenant);
    if (tenants) {
      const tenant = tenants.find((value) => {
        if (value.name === selectedTenant) {
          return true;
        }
        return false;
      });
      setLoginDetails({
        ...loginDetails,
        tenantId: tenant.id,
        hostname: tenant.netloc,
      });
    }
  }, [selectedTenant]);

  return (
    <>
      <Modal
        open={open}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress color="primary" size="md" variant="soft" />
          <Typography level="h3">{parseUICode("ui_loading")}</Typography>
        </Stack>
      </Modal>

      <Typography level="h1" sx={{ marginBottom: "1em" }}>
        {parseUICode("ui_cg") + " " + parseUICode("ui_settings")}
      </Typography>
      <div style={{ maxWidth: "80%", minWidth: "50%" }}>
        {hasSavedCredentials ? (
          <Alert
            key={"foundCredentialsAlert"}
            sx={{
              alignItems: "flex-start",
              minWidth: pageTableMinWidth,
              maxWidth: pageTableMaxWidth,
            }}
            startDecorator={<CheckCircleIcon />}
            variant="soft"
            color={"success"}
          >
            <div>
              <Typography level="body-sm" color={"success"}>
                {parseUICode("credentials_found")}
              </Typography>
            </div>
          </Alert>
        ) : (
          <Alert
            key={"credentialsNotFoundAlert"}
            sx={{
              alignItems: "flex-start",
              minWidth: pageTableMinWidth,
              maxWidth: pageTableMaxWidth,
            }}
            startDecorator={<InfoIcon />}
            variant="soft"
            color={"warning"}
          >
            <div>
              <Typography level="body-sm" color={"warning"}>
                {parseUICode("credentials_not_found")}
              </Typography>
            </div>
          </Alert>
        )}
        <Table
          borderAxis="none"
          sx={{ minWidth: pageTableMinWidth, maxWidth: pageTableMaxWidth }}
        >
          <tbody>
            <tr key="cgUsername">
              <td style={{ width: titleCellWidth }}>
                <Typography level="h4">
                  {`${capitalizeFirstLetter(parseUICode("ui_username"))}`}
                </Typography>
              </td>
              <td>
                <InputField
                  fieldKey="cgUsernameInput"
                  onChange={(value: string) => {
                    setLoginDetails({ ...loginDetails, username: value });
                  }}
                />
              </td>
            </tr>
            <tr key="cgPassword">
              <td style={{ width: titleCellWidth }}>
                <Typography level="h4">
                  {`${capitalizeFirstLetter(parseUICode("ui_password"))}`}
                </Typography>
              </td>
              <td>
                <InputField
                  fieldKey="cgPasswordInput"
                  type="password"
                  onChange={(value: string) => {
                    setLoginDetails({ ...loginDetails, password: value });
                  }}
                />
              </td>
            </tr>
            <tr key="cgTenant">
              <td style={{ width: titleCellWidth }}>
                <Typography level="h4">
                  {`${capitalizeFirstLetter(parseUICode("ui_organisation"))}`}
                </Typography>
              </td>
              <td>
                <Dropdown
                  labelKey="name"
                  name="Tenant dropdown"
                  onChange={setSelectedTenant}
                  options={tenants ? tenants : [{ name: "" }]}
                  defaultValue="LUT University"
                />
              </td>
            </tr>
            <tr key="cgSaveCredentials">
              <td style={{ width: titleCellWidth }}>
                <Typography level="h4">
                  {`${capitalizeFirstLetter(
                    parseUICode("ui_save_credentials")
                  )}`}
                </Typography>
              </td>
              <td>
                <SwitchComp checked={checked} setChecked={setChecked} />
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
      <div style={{ marginTop: "2em" }}></div>
      <ButtonComp
        buttonType="normalAlt"
        onClick={() => loginWrapper(loginDetails, checked)}
        ariaLabel={parseUICode("ui_aria_cg_sign_in")}
        disabled={!hasLoginDetails}
      >
        {parseUICode("ui_sign_in")}
      </ButtonComp>
    </>
  );
}
