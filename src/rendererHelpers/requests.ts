import log from "electron-log/renderer";
import { handleIPCResult } from "./errorHelpers";

export const refreshTitle = async () => {
  try {
    const vers = await handleIPCResult(() => window.api.getAppVersion());
    const title = "Procasma " + vers;
    window.api.setTitle(title);
  } catch (err) {
    log.error(err);
  }
};
