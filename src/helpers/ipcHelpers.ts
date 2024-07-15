import { IpcMainInvokeEvent } from "electron";
import { IpcResult } from "../types";
import log from "electron-log";

type IpcHandler = (
  event: IpcMainInvokeEvent,
  ...args: any[]
) => Promise<IpcResult>;

/**
 * Wrapper for ipcMain.handle functions. Catches and extracts
 * the possible error message propagated by the supplied function
 * so that returned values are formatted properly
 * for the render process.
 */
export function formatIPCResult(
  databaseFunction: (...args: any[]) => Promise<any> | any
): IpcHandler {
  return async (event: IpcMainInvokeEvent, ...args: any[]) => {
    try {
      const result = await databaseFunction(...args);
      return { content: result };
    } catch (err) {
      log.error("Error in formatIPCResult():", err.message);
      return { errorMessage: err.message };
    }
  };
}

/**
 * The same as formatIPCResult but for calling database
 * functions within the main process such that errors and results
 * are formatted properly (e.g. for database tests).
 */
export async function createMainFunctionHandler(
  databaseFunction: () => Promise<any>
): Promise<IpcResult> {
  try {
    const result = await databaseFunction();
    return { content: result };
  } catch (err) {
    log.error("Error in formatIPCResult():", err.message);
    return { errorMessage: err.message };
  }
}
