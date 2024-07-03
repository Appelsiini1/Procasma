import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import {
  handleDirectorySelect,
  handleFileOpen,
  handleFilesOpen,
} from "./helpers/fileDialog";
import { version, DEVMODE } from "./constants";
import {
  handleGetAssignments,
  handleGetModules,
  handleReadCourse,
  handleSaveAssignment,
  handleSaveCourse,
  handleSaveModule,
  handleUpdateAssignment,
  handleUpdateCourse,
  removeAssignmentById,
  removeModuleById,
} from "./helpers/fileOperations";
import { Settings } from "./types";
import { initialize } from "./helpers/programInit";
import { getSettings, saveSettings } from "./helpers/settings";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

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

  // One-way, Renderer to Main
  ipcMain.on("set-title", (event, title) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setTitle(title);
  });

  ipcMain.handle("selectDir", handleDirectorySelect);
  ipcMain.handle("selectFiles", handleFilesOpen);
  ipcMain.handle("saveCourse", (event, course, path) =>
    handleSaveCourse(course, path)
  );
  ipcMain.handle("readCourse", (event, path) => handleReadCourse(path));
  ipcMain.handle("updateCourse", (event, fileName, path) =>
    handleUpdateCourse(fileName, path)
  );
  ipcMain.handle("saveAssignment", (event, assignment, path) =>
    handleSaveAssignment(assignment, path)
  );
  ipcMain.handle("updateAssignment", (event, assignment, path) =>
    handleUpdateAssignment(assignment, path)
  );

  ipcMain.handle("getAssignments", (event, path) => handleGetAssignments(path));
  ipcMain.handle("deleteAssignment", (event, coursePath, id) =>
    removeAssignmentById(coursePath, id)
  );

  ipcMain.handle("saveModule", (event, module, path) =>
    handleSaveModule(module, path)
  );
  ipcMain.handle("getModules", (event, path) => handleGetModules(path));
  ipcMain.handle("deleteModule", (event, coursePath, id) =>
    removeModuleById(coursePath, id)
  );

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
ipcMain.on("saveSettings", (event, settings: Settings) => {
  saveSettings(settings);
});

// Bidirectional, renderer to main to renderer
ipcMain.handle("dialog:openFile", handleFileOpen);
ipcMain.handle("getAppVersion", getVersion);
ipcMain.handle("getSettings", getSettings);
