import log from "electron-log/renderer";
import { handleIPCResult } from "./errorHelpers";

export const refreshTitle = async (
  setIPCLoading: (process: string, pushing: boolean) => void
) => {
  try {
    const vers = await handleIPCResult(setIPCLoading, () =>
      window.api.getAppVersion()
    );
    const title = "Procasma " + vers;
    window.api.setTitle(title);
  } catch (err) {
    log.error(err);
  }
};
