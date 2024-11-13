// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import {
  CodeAssignmentData,
  CodeGradeLogin,
  CourseData,
  ExportSetData,
  ModuleData,
  SetData,
  SettingsType,
} from "./types";

contextBridge.exposeInMainWorld("api", {
  // One-way, Renderer to Main
  setTitle: (title: string) => ipcRenderer.send("set-title", title),
  setCoursePath: (path: string) => ipcRenderer.send("set-coursePath", path),
  closeApp: () => ipcRenderer.send("close-app"),

  // Bidirectional, renderer to main to renderer
  // General
  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
  getDevMode: () => ipcRenderer.invoke("getDevMode"),
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
  getTruncatedAssignmentsFS: (coursePath: string) =>
    ipcRenderer.invoke("getTruncatedAssignmentsFS", coursePath),
  getAssignmentsDB: (coursePath: string, ids: string[]) =>
    ipcRenderer.invoke("getAssignmentsDB", coursePath, ids),
  handleDeleteAssignmentsFS: (coursePath: string, ids: string) =>
    ipcRenderer.invoke("handleDeleteAssignmentsFS", coursePath, ids),
  getAssignmentCountDB: (coursePath: string) =>
    ipcRenderer.invoke("getAssignmentCountDB", coursePath),
  getFilteredAssignmentsDB: (coursePath: string, filters: any) =>
    ipcRenderer.invoke("getFilteredAssignmentsDB", coursePath, filters),
  importAssignmentsFS: (coursePath: string, importPath: string) =>
    ipcRenderer.invoke("importAssignmentsFS", coursePath, importPath),

  // CRUD Module
  addModuleDB: (coursePath: string, module: ModuleData) =>
    ipcRenderer.invoke("addModuleDB", coursePath, module),
  getModulesDB: (coursePath: string, ids: string[]) =>
    ipcRenderer.invoke("getModulesDB", coursePath, ids),
  updateModuleDB: (coursePath: string, module: ModuleData) =>
    ipcRenderer.invoke("updateModuleDB", coursePath, module),
  deleteModulesDB: (coursePath: string, ids: number) =>
    ipcRenderer.invoke("deleteModulesDB", coursePath, ids),
  getFilteredModulesDB: (coursePath: string, filters: any) =>
    ipcRenderer.invoke("getFilteredModulesDB", coursePath, filters),
  autoGenerateModulesFS: (coursePath: string) =>
    ipcRenderer.invoke("autoGenerateModulesFS", coursePath),

  // CRUD Tag
  getAssignmentTagsDB: (coursePath: string) =>
    ipcRenderer.invoke("getAssignmentTagsDB", coursePath),
  getModuleTagsDB: (coursePath: string) =>
    ipcRenderer.invoke("getModuleTagsDB", coursePath),

  // CRUD Set
  addSetFS: (coursePath: string, set: SetData) =>
    ipcRenderer.invoke("addSetFS", coursePath, set),
  getSetsFS: (coursePath: string, id: string) =>
    ipcRenderer.invoke("getSetsFS", coursePath, id),
  updateSetFS: (coursePath: string, set: SetData) =>
    ipcRenderer.invoke("updateSetFS", coursePath, set),
  deleteSetsFS: (coursePath: string, ids: string[]) =>
    ipcRenderer.invoke("deleteSetsFS", coursePath, ids),

  // Export set to disk
  exportSetFS: (
    setInput: ExportSetData,
    courseData: CourseData,
    savePath: string
  ) => ipcRenderer.invoke("exportSetFS", setInput, courseData, savePath),
  exportManySetsFS: (
    setInput: Array<ExportSetData>,
    courseData: CourseData,
    savePath: string
  ) => ipcRenderer.invoke("exportManySetsFS", setInput, courseData, savePath),

  // CodeGrade
  getTenants: () => ipcRenderer.invoke("getTenants"),
  CGLogin: (loginDetails: CodeGradeLogin, fromSaved: boolean) =>
    ipcRenderer.invoke("CGLogin", loginDetails, fromSaved),
  saveCredentials: (loginDetails: CodeGradeLogin) =>
    ipcRenderer.invoke("saveCredentials", loginDetails),
});
