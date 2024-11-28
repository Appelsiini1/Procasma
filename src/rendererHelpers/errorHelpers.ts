import { DEVMODE } from "../constantsUI";
import { IpcResult } from "../types";
import { parseUICode } from "./translation";
import log from "electron-log/renderer";

/**
 * Wrapper for calls to main from the render process. Throws
 * an error if the IpcResult contains an errorMessage, otherwise
 * returns the 'content' property of the call. Also throws an
 * error if content is falsy.
 *
 * Uses parseUICode to convert message codes to text.
 */
export async function handleIPCResult(IpcCall: () => IpcResult): Promise<any> {
  let result: IpcResult = {};
  try {
    result = await IpcCall();
    if (DEVMODE) log.debug(IpcCall);
  } catch (err) {
    throw new Error(parseUICode(err.message));
  }

  if (!result) {
    throw new Error(parseUICode("ui_no_result_from_ipc_call"));
  }
  if (result.errorMessage) {
    throw new Error(parseUICode(result.errorMessage));
  }
  if (typeof result.content === "undefined") {
    throw new Error(parseUICode("ui_no_result_from_ipc_call"));
  }
  return result.content;
}
