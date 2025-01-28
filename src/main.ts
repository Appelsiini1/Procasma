import { config } from "dotenv";
// Dotenv config
config();
import { app, BrowserWindow, Menu } from "electron";
import path from "node:path";
import { version, DEVMODE } from "./constants";
import { initialize } from "./mainHelpers/programInit";
import log from "electron-log";
import { registerHandles } from "./mainHelpers/ipcHelpers";
import { appQuitHelper } from "./mainHelpers/utilityMain";
import { workerID } from "./globalsMain";
import started from "electron-squirrel-startup";
import { devmodeString } from "./DEVMODE";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

log.initialize();
log.info("-- STARTING PROCASMA MAIN --");
log.info(`Procasma v${version}`);

const createWindows = () => {
  // Create the browser windows.

  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      additionalArguments: [`--devmode=${devmodeString}`],
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      spellcheck: false,
    },
    icon: "../resource/icons/icon",
    show: false,
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Worker window
  const workerWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      spellcheck: false,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });

  if (WORKER_WINDOW_VITE_DEV_SERVER_URL) {
    workerWindow.loadURL(WORKER_WINDOW_VITE_DEV_SERVER_URL + "/worker.html");
  } else {
    workerWindow.loadFile(
      path.join(__dirname, `../renderer/${WORKER_WINDOW_VITE_NAME}/worker.html`)
    );
  }
  workerID.id = workerWindow.id;

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open the DevTools.
  if (DEVMODE) {
    mainWindow.webContents.openDevTools();
    workerWindow.webContents.openDevTools();
  }
};

// Disable default menu early for performance, see https://github.com/electron/electron/issues/35512
Menu.setApplicationMenu(null);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindows();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  appQuitHelper();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

initialize();

registerHandles();
