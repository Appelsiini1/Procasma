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
  handleDeleteAssignmentsFS: (coursePath: string, ids: string) =>
    ipcRenderer.invoke("handleDeleteAssignmentsFS", coursePath, ids),
  getAssignmentCountDB: (coursePath: string) =>
    ipcRenderer.invoke("getAssignmentCountDB", coursePath),
  getFilteredAssignmentsDB: (coursePath: string, filters: any) =>
    ipcRenderer.invoke("getFilteredAssignmentsDB", coursePath, filters),

  // CRUD Module
  addModuleDB: (coursePath: string, module: ModuleData) =>
    ipcRenderer.invoke("addModuleDB", coursePath, module),
  getModulesDB: (coursePath: string) =>
    ipcRenderer.invoke("getModulesDB", coursePath),
  deleteModulesDB: (coursePath: string, ids: number) =>
    ipcRenderer.invoke("deleteModulesDB", coursePath, ids),
  getFilteredModulesDB: (coursePath: string, filters: any) =>
    ipcRenderer.invoke("getFilteredModulesDB", coursePath, filters),

  // CRUD Tag
  getAssignmentTagsDB: (coursePath: string) =>
    ipcRenderer.invoke("getAssignmentTagsDB", coursePath),
  getModuleTagsDB: (coursePath: string) =>
    ipcRenderer.invoke("getModuleTagsDB", coursePath),
});
