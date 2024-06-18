// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { CodeAssignmentData, CourseData } from "./types";

contextBridge.exposeInMainWorld("api", {
  setTitle: (title: string) => ipcRenderer.send("set-title", title),
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
  saveCourse: (course: CourseData, path: string) =>
    ipcRenderer.invoke("saveCourse", course, path),
  saveAssignment: (assignment: CodeAssignmentData, path: string) =>
    ipcRenderer.send("saveAssignment", assignment, path),
  saveProject: (assignment: CodeAssignmentData, path: string) =>
    ipcRenderer.send("saveProject", assignment, path),
  selectDir: () => ipcRenderer.invoke("selectDir"),
});
