import { IpcResult } from "../types";
import { parseUICode } from "./translation";

/**
 * Wrapper for calls to main from the render process. Throws
 * an error if the IpcResult contains an errorMessage, otherwise
 * returns the 'content' property of the call. Also throws an
 * error if content is falsy.
 *
 * Uses parseUICode to convert message codes to text.
 */
export async function handleIPCResult(
  IpcCall: () => IpcResult,
  setIPCLoading?: (process: string, pushing: boolean) => void
): Promise<any> {
  if (setIPCLoading) {
    setIPCLoading(IpcCall.toString(), true);
  }
  const result: IpcResult = await IpcCall();
  if (setIPCLoading) {
    setIPCLoading(IpcCall.toString(), false);
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
