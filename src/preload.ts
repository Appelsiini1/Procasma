// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import {
  CodeAssignmentData,
  CourseData,
  ModuleData,
  SettingsType,
} from "./types";

contextBridge.exposeInMainWorld("api", {
  // One-way, Renderer to Main
  setTitle: (title: string) => ipcRenderer.send("set-title", title),

  // Bidirectional, renderer to main to renderer
  // General
  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
  selectDir: () => ipcRenderer.invoke("selectDir"),
  selectFiles: () => ipcRenderer.invoke("selectFiles"),
  saveSettings: (settings: SettingsType) =>
    ipcRenderer.invoke("saveSettings", settings),
  getSettings: () => ipcRenderer.invoke("getSettings"),

  // CRUD Course
  handleAddCourseFS: (course: CourseData, coursePath: string) =>
    ipcRenderer.invoke("handleAddCourseFS", course, coursePath),
  handleGetCourseFS: (coursePath: string) =>
    ipcRenderer.invoke("handleGetCourseFS", coursePath),
  handleUpdateCourseFS: (course: CourseData, coursePath: string) =>
    ipcRenderer.invoke("handleUpdateCourseFS", course, coursePath),

  // CRUD Assignment
  handleAddAssignmentFS: (assignment: CodeAssignmentData, coursePath: string) =>
    ipcRenderer.invoke("handleAddAssignmentFS", assignment, coursePath),
  handleUpdateAssignmentFS: (
    assignment: CodeAssignmentData,
    coursePath: string
  ) => ipcRenderer.invoke("handleUpdateAssignmentFS", assignment, coursePath),
  handleGetAssignmentsFS: (coursePath: string, id: string) =>
    ipcRenderer.invoke("handleGetAssignmentsFS", coursePath, id),
  getAssignmentsDB: (coursePath: string) =>
    ipcRenderer.invoke("getAssignmentsDB", coursePath),
  handleDeleteAssignmentFS: (coursePath: string, id: string) =>
    ipcRenderer.invoke("handleDeleteAssignmentFS", coursePath, id),
  getAssignmentCountDB: (coursePath: string) =>
    ipcRenderer.invoke("getAssignmentCountDB", coursePath),
  getFilteredAssignmentsDB: (coursePath: string, filters: any) =>
    ipcRenderer.invoke("getFilteredAssignmentsDB", coursePath, filters),

  // CRUD Module
  handleAddModuleFS: (module: ModuleData, coursePath: string) =>
    ipcRenderer.invoke("handleAddModuleFS", module, coursePath),
  handleGetModulesFS: (coursePath: string) =>
    ipcRenderer.invoke("handleGetModulesFS", coursePath),
  getModulesDB: (coursePath: string) =>
    ipcRenderer.invoke("getModulesDB", coursePath),
  deleteModuleDB: (coursePath: string, id: number) =>
    ipcRenderer.invoke("deleteModuleDB", coursePath, id),
  getFilteredModulesDB: (coursePath: string, filters: any) =>
    ipcRenderer.invoke("getFilteredModulesDB", coursePath, filters),

  // CRUD Tag
  getAssignmentTagsDB: (coursePath: string) =>
    ipcRenderer.invoke("getAssignmentTagsDB", coursePath),
  getModuleTagsDB: (coursePath: string) =>
    ipcRenderer.invoke("getModuleTagsDB", coursePath),
});
