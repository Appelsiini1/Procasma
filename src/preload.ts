// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { CodeAssignmentData, CourseData } from "./types";

contextBridge.exposeInMainWorld("api", {
  setTitle: (title: string) => ipcRenderer.send("set-title", title),
  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
  saveCourse: (course: CourseData, path: string) =>
    ipcRenderer.invoke("saveCourse", course, path),
  updateCourse: (course: CourseData, path: string) =>
    ipcRenderer.invoke("updateCourse", course, path),
  selectDir: () => ipcRenderer.invoke("selectDir"),
  readCourse: (path: string) => ipcRenderer.invoke("readCourse", path),
  saveAssignment: (assignment: CodeAssignmentData, path: string) =>
    ipcRenderer.invoke("saveAssignment", assignment, path),
  getAssignments: (path: string) => ipcRenderer.invoke("getAssignments", path),
  deleteAssignment: (coursePath: string, id: string) =>
    ipcRenderer.invoke("deleteAssignment", coursePath, id),
});
