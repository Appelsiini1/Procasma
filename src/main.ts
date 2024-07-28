import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import {
  handleDirectorySelect,
  handleFilesOpen,
} from "./mainHelpers/fileDialog";
import { version, DEVMODE } from "./constants";
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
} from "./mainHelpers/fileOperations";
import { initialize } from "./mainHelpers/programInit";
import { getSettings, saveSettings } from "./mainHelpers/settings";
import { testDatabase } from "./mainHelpers/testDatabase";
import log from "electron-log";
import { formatIPCResult } from "./mainHelpers/ipcHelpers";
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
} from "./mainHelpers/databaseOperations";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

log.initialize();
log.info("-- STARTING PROCASMA MAIN --");
log.info(`Procasma v${version}`);

const getVersion = () => {
  return version;
};

const createWindow = () => {
  // Create the browser window.

  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  if (DEVMODE) {
    mainWindow.webContents.openDevTools();
  }
};

// Disable default menu early for performance, see https://github.com/electron/electron/issues/35512
Menu.setApplicationMenu(null);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

initialize();

// One-way, Renderer to Main
ipcMain.on("set-title", (event, title) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
});

// Bidirectional, renderer to main to renderer

// General

ipcMain.handle(
  "getAppVersion",
  formatIPCResult(() => getVersion())
);
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
  formatIPCResult((assignment, path) => handleAddAssignmentFS(assignment, path))
);
ipcMain.handle(
  "handleGetAssignmentsFS",
  formatIPCResult((path, id) => handleGetAssignmentsFS(path, id))
);
ipcMain.handle(
  "getAssignmentsDB",
  formatIPCResult((path) => getAssignmentsDB(path))
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

// CRUD Module

ipcMain.handle(
  "addModuleDB",
  formatIPCResult((path, module) => addModuleDB(path, module))
);
ipcMain.handle(
  "getModulesDB",
  formatIPCResult((path) => getModulesDB(path))
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
  formatIPCResult((path) => getSetsFS(path))
);
ipcMain.handle(
  "updateSetFS",
  formatIPCResult((path, set) => updateSetFS(path, set))
);
ipcMain.handle(
  "deleteSetsFS",
  formatIPCResult((path, ids) => deleteSetsFS(path, ids))
);

testDatabase();
