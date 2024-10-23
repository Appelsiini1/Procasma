import { CodeGradeLogin } from "../types";
import { codegradeAPIEndpointV1 } from "../constants";
import log from "electron-log";
import { getApiv2, login } from "@codegrade/apiv2-client";
import { cgInstance } from "../globalsMain";

export async function getTenants() {
  const url = codegradeAPIEndpointV1 + "/tenants/";

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          log.error("Error fetching tenants: ", response.body);
          throw new Error("error_get_tenants");
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

export async function setInstance(loginDetails: CodeGradeLogin) {
  try {
    const token = await login(loginDetails);
    const instance = getApiv2({
      hostname: loginDetails.hostname,
      token: token,
    });
    cgInstance.apiInstance = instance;
  } catch (err) {
    log.error("Error in getAccessToken: ", err.message);
    throw err;
  }
}
