// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { CodeAssignmentData, CourseData, ModuleData, Settings } from "./types";

contextBridge.exposeInMainWorld("api", {
  setTitle: (title: string) => ipcRenderer.send("set-title", title),
  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
  saveCourse: (course: CourseData, path: string) =>
    ipcRenderer.invoke("saveCourse", course, path),
  updateCourse: (course: CourseData, path: string) =>
    ipcRenderer.invoke("updateCourse", course, path),
  selectDir: () => ipcRenderer.invoke("selectDir"),
  selectFiles: () => ipcRenderer.invoke("selectFiles"),
  readCourse: (path: string) => ipcRenderer.invoke("readCourse", path),
  saveAssignment: (assignment: CodeAssignmentData, path: string) =>
    ipcRenderer.invoke("saveAssignment", assignment, path),
  updateAssignment: (assignment: CodeAssignmentData, path: string) =>
    ipcRenderer.invoke("updateAssignment", assignment, path),
  getAssignments: (path: string) => ipcRenderer.invoke("getAssignments", path),
  deleteAssignment: (coursePath: string, id: string) =>
    ipcRenderer.invoke("deleteAssignment", coursePath, id),
  getSettings: () => ipcRenderer.invoke("getSettings"),
  saveSettings: (settings: Settings) =>
    ipcRenderer.invoke("saveSettings", settings),

  saveModule: (module: ModuleData, path: string) =>
    ipcRenderer.invoke("saveModule", module, path),
  getModules: (path: string) => ipcRenderer.invoke("getModules", path),
  deleteModule: (coursePath: string, id: number) =>
    ipcRenderer.invoke("deleteModule", coursePath, id),
});
