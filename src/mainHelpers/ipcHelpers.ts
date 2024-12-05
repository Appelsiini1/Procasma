import { IpcMainInvokeEvent, ipcMain, app, BrowserWindow } from "electron";
import { IpcResult } from "../types";
import log from "electron-log/node";

import { handleDirectorySelect, handleFilesOpen } from "./fileDialog";
import {
  handleGetAssignmentsFS,
  handleGetCourseFS,
  handleAddAssignmentFS,
  handleAddCourseFS,
  handleUpdateAssignmentFS,
  handleUpdateCourseFS,
  handleDeleteAssignmentsFS,
  addSetFS,
  updateSetFS,
  getSetsFS,
  deleteSetsFS,
  getTruncatedAssignmentsFS,
  importAssignmentsFS,
  autoGenerateModulesFS,
} from "./fileOperations";
import {
  getAssignmentsDB,
  getAssignmentTagsDB,
  getModuleTagsDB,
  getAssignmentCountDB,
  getModuleCountDB,
  getFilteredAssignmentsDB,
  getFilteredModulesDB,
  getModulesDB,
  addModuleDB,
  updateModuleDB,
  deleteModulesDB,
} from "./databaseOperations";
import { coursePath } from "../globalsMain";
import { exportManySetsFS, exportSetFS } from "./html";
import { getSettings, saveSettings } from "./settings";
import { version, DEVMODE } from "../constants";
import { fetchAutoTestConfig, getTenants, logInToCG } from "./codegrade";
import { checkCredentialExistance, saveCredentials } from "./encryption";

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
  mainFunction: (...args: any[]) => Promise<any> | any
): IpcHandler {
  return async (event: IpcMainInvokeEvent, ...args: any[]) => {
    try {
      const result = await mainFunction(...args);
      return { content: result };
    } catch (err) {
      log.error("Error in formatIPCResult():", err.message);
      log.error(mainFunction);
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

/**
 * Registers IPC handles
 */
export function registerHandles() {
  // One-way, Renderer to Main
  ipcMain.on("set-title", (event, title) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setTitle(title);
  });

  ipcMain.on("set-coursePath", (event, path) => {
    coursePath.path = path;
  });

  ipcMain.on("close-app", (event) => app.quit());

  // Bidirectional, renderer to main to renderer
  // General

  ipcMain.handle(
    "getAppVersion",
    formatIPCResult(() => version)
  );
  ipcMain.handle("getDevMode", () => DEVMODE);
  ipcMain.handle(
    "selectDir",
    formatIPCResult(() => handleDirectorySelect())
  );
  ipcMain.handle(
    "selectFiles",
    formatIPCResult(() => handleFilesOpen())
  );
  ipcMain.handle(
    "saveSettings",
    formatIPCResult((settings) => saveSettings(settings))
  );
  ipcMain.handle(
    "getSettings",
    formatIPCResult(() => getSettings())
  );

  // CRUD Course

  ipcMain.handle(
    "handleAddCourseFS",
    formatIPCResult((course, path) => handleAddCourseFS(course, path))
  );
  ipcMain.handle(
    "handleGetCourseFS",
    formatIPCResult((path) => handleGetCourseFS(path))
  );
  ipcMain.handle(
    "handleUpdateCourseFS",
    formatIPCResult((fileName, path) => handleUpdateCourseFS(fileName, path))
  );

  // CRUD Assignment

  ipcMain.handle(
    "handleAddAssignmentFS",
    formatIPCResult((assignment, path) =>
      handleAddAssignmentFS(assignment, path)
    )
  );
  ipcMain.handle(
    "handleGetAssignmentsFS",
    formatIPCResult((path, id) => handleGetAssignmentsFS(path, id))
  );
  ipcMain.handle(
    "getTruncatedAssignmentsFS",
    formatIPCResult((path) => getTruncatedAssignmentsFS(path))
  );
  ipcMain.handle(
    "getAssignmentsDB",
    formatIPCResult((path, ids) => getAssignmentsDB(path, ids))
  );
  ipcMain.handle(
    "handleUpdateAssignmentFS",
    formatIPCResult((assignment, path) =>
      handleUpdateAssignmentFS(assignment, path)
    )
  );
  ipcMain.handle(
    "handleDeleteAssignmentsFS",
    formatIPCResult((coursePath, ids) =>
      handleDeleteAssignmentsFS(coursePath, ids)
    )
  );
  ipcMain.handle(
    "getAssignmentCountDB",
    formatIPCResult((path) => getAssignmentCountDB(path))
  );
  ipcMain.handle(
    "getFilteredAssignmentsDB",
    formatIPCResult((path, filters) => getFilteredAssignmentsDB(path, filters))
  );
  ipcMain.handle(
    "importAssignmentsFS",
    formatIPCResult((path, importPath) => importAssignmentsFS(path, importPath))
  );

  // CRUD Module

  ipcMain.handle(
    "addModuleDB",
    formatIPCResult((path, module) => addModuleDB(path, module))
  );
  ipcMain.handle(
    "getModulesDB",
    formatIPCResult((path, ids) => getModulesDB(path, ids))
  );
  ipcMain.handle(
    "updateModuleDB",
    formatIPCResult((path, module) => updateModuleDB(path, module))
  );
  ipcMain.handle(
    "deleteModulesDB",
    formatIPCResult((coursePath, ids) => deleteModulesDB(coursePath, ids))
  );
  ipcMain.handle(
    "getModuleCountDB",
    formatIPCResult((path) => getModuleCountDB(path))
  );
  ipcMain.handle(
    "getFilteredModulesDB",
    formatIPCResult((path, filters) => getFilteredModulesDB(path, filters))
  );
  ipcMain.handle(
    "autoGenerateModulesFS",
    formatIPCResult((path) => autoGenerateModulesFS(path))
  );

  // CRUD Tag
  ipcMain.handle(
    "getAssignmentTagsDB",
    formatIPCResult((path) => getAssignmentTagsDB(path))
  );
  ipcMain.handle(
    "getModuleTagsDB",
    formatIPCResult((path) => getModuleTagsDB(path))
  );

  // CRUD Set
  ipcMain.handle(
    "addSetFS",
    formatIPCResult((path, set) => addSetFS(path, set))
  );
  ipcMain.handle(
    "getSetsFS",
    formatIPCResult((path, id) => getSetsFS(path, id))
  );
  ipcMain.handle(
    "updateSetFS",
    formatIPCResult((path, set) => updateSetFS(path, set))
  );
  ipcMain.handle(
    "deleteSetsFS",
    formatIPCResult((path, ids) => deleteSetsFS(path, ids))
  );

  // Export set
  ipcMain.handle(
    "exportSetFS",
    formatIPCResult((setInput, courseData, savePath) =>
      exportSetFS(setInput, courseData, savePath)
    )
  );
  ipcMain.handle(
    "exportManySetsFS",
    formatIPCResult((setInput, courseData, savePath) =>
      exportManySetsFS(setInput, courseData, savePath)
    )
  );

  // CodeGrade
  ipcMain.handle(
    "getTenants",
    formatIPCResult(() => getTenants())
  );
  ipcMain.handle(
    "CGLogin",
    formatIPCResult((loginDetails, fromSaved) =>
      logInToCG(loginDetails, fromSaved)
    )
  );

  // Credentials and encryption
  ipcMain.handle(
    "saveCredentials",
    formatIPCResult((loginDetails) => saveCredentials(loginDetails))
  );
  ipcMain.handle(
    "checkCredentialExistance",
    formatIPCResult(() => checkCredentialExistance())
  );
  ipcMain.handle(
    "getATV2Config",
    formatIPCResult((assigID) => fetchAutoTestConfig(assigID))
  );
}
