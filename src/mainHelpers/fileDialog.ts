import { dialog } from "electron";
import { sleep } from "../rendererHelpers/utility";

export async function handleFileOpen() {
  // see https://www.electronjs.org/docs/latest/api/dialog for dialog options
  const { canceled, filePaths } = await dialog.showOpenDialog({});
  return !canceled ? filePaths[0] : null;
}

export async function handleFilesOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  });
  return !canceled ? filePaths : null;
}

export async function handleDirectorySelect() {
  //await sleep(2000);
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return !canceled ? filePaths[0] : "";
}
