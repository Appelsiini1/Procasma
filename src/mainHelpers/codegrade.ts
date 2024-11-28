import { CodeGradeLogin } from "../types";
import { codegradeAPIEndpointV1 } from "../constants";
import log from "electron-log";
import { getApiv2, login } from "@codegrade/apiv2-client";
import { cgInstance } from "../globalsMain";
import { getCredentials } from "./encryption";

export async function getTenants() {
  const url = codegradeAPIEndpointV1 + "/tenants/";

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          log.error("Error fetching tenants: ", response.body);
          reject(new Error("error_get_tenants"));
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => {
        log.error("Error fetching tenants: ", error.message);
        reject(new Error("error_get_tenants"));
      });
  });
}

async function setInstance(token: string, hostname: string) {
  try {
    const instance = getApiv2({
      hostname: hostname,
      token: token,
    });
    cgInstance.apiInstance = instance;
  } catch (err) {
    log.error("Error in setInstance: ", err.message);
    throw err;
  }
}

export async function logInToCG(
  loginDetails: CodeGradeLogin | null,
  fromSaved: boolean
) {
  let credentials: CodeGradeLogin;

  if (!fromSaved && loginDetails === null) {
    throw new Error("No credentials given");
  } else if (fromSaved) {
    credentials = getCredentials();
    if (!credentials) {
      throw new Error("no_CG_credentials");
    }
  } else {
    credentials = loginDetails;
  }
  try {
    const token = await login(credentials);
    setInstance(token, credentials.hostname);
    return "ui_login_success";
  } catch (err) {
    log.error("Error in logInToCG: ", err.message);
    throw new Error("login_failed");
  }
}

export async function fetchAutoTestConfig(assignmentID: string) {
  log.debug("Getting autotest config for assignemnt ", assignmentID);
  if (!cgInstance.apiInstance) {
    await logInToCG(null, true);
  }
  log.debug("Logging ok");
  try {
    const output = await cgInstance.apiInstance.getAutoTestConfiguration({
      assignmentId: assignmentID,
    });
    if (output.$metadata.httpStatusCode === 200) {
      log.debug("Autotest fetch OK");
      const configString = JSON.stringify(output.configuration);
      return configString;
    }
    return null;
  } catch (err) {
    log.error("Error fetching autotest configuration: ", err.message);
    throw err;
  }
}
