export const supportedLanguagesList: string[] = ["FI", "ENG"];
export type SupportedLanguages = "FI" | "ENG";

export type FileTypes = "text" | "image" | "code";
export type SupportedModuleType = "week" | "module" | "lecture" | null;

export interface FileData {
  fileName: string;
  path: string;
  solution: boolean;
  fileContent: "instruction" | "result" | "code" | "data";
  showStudent: boolean;
  fileType: FileTypes;
}

export interface CGData {
  id: string;
  atv2: object;
}

export interface ExampleRunType {
  generate: boolean;
  inputs: Array<string | number>;
  cmdInputs: Array<string | number>;
  output: string;
}

export interface Variation {
  instructions: string;
  exampleRuns: {
    [key: string]: ExampleRunType;
  };
  files: Array<FileData>;
  usedIn: Array<string>;
  cgConfig: CGData;
}

export interface CommonAssignmentData {
  assignmentID: string;
  title: string;
  tags: Array<string>;
  module: number | null;
}

export interface CodeAssignmentData extends CommonAssignmentData {
  assignmentType: string;
  assignmentNo: Array<number>;
  level: number | null;
  next: Array<string> | null;
  previous: Array<string> | null;
  codeLanguage: string;
  variations: {
    [key: string]: Variation;
  };
}

export interface ModuleData {
  id: number;
  name: string;
  letters: boolean;
  assignments: number;
  subjects: string;
  tags: Array<string>;
  instructions: string;
}

export interface CodeLanguage {
  name: string;
  fileExtensions: Array<string>;
}

export interface LevelsType {
  [key: number]: {
    fullName: string;
    abbreviation: string;
  };
}

export interface CourseData {
  title?: string;
  id?: string;
  modules?: number;
  moduleType?: SupportedModuleType;
  language?: SupportedLanguages;
  codeLanguage?: CodeLanguage | null;
  CodeGradeID?: number;
  minLevel?: number;
  maxLevel?: number;
  levels?: LevelsType | null;
}

export type CourseLoaderData = "create" | "manage";

export interface SettingsType {
  codeLanguages: Array<CodeLanguage>;
  language: string;
}

export interface SetData {
  id: string;
  fullCourse: boolean;
  module: string;
  name: string;
  year: number;
  period: number;
  export: boolean;
  format: string; // check this type and the purpose
  exportCGConfigs: boolean;
  assignmentCGids: { [key: string]: string };
}

export type CodeAssignmentDatabase = {
  id: string;
  type: string;
  title: string;
  tags: string | null;
  module: number | null;
  position: string;
  level: number | null;
  isExpanding: boolean;
  path: string;
};

export type ModuleDatabase = {
  id: number;
  name: string;
  tags: string | null;
  assignments: number;
  subjects: string;
  letters: number;
  instructions: string;
};

export type TagDatabase = {
  name: string;
  assignments: string;
};

export interface IpcResult {
  content?: any;
  errorMessage?: string;
}

export interface GeneralResult {
  content?: any;
  message?: string;
  error?: string;
}

export interface PDFHtmlInput {
  html: string;
  header: string;
  footer: string;
  title: string;
}

export type ContextBridgeAPI = {
  // One-way, Renderer to Main
  setTitle: (title: string) => IpcResult;

  // Bidirectional, renderer to main to renderer
  // General
  getAppVersion: () => IpcResult;
  selectDir: () => IpcResult;
  selectFiles: () => IpcResult;
  saveSettings: (settings: SettingsType) => IpcResult;
  getSettings: () => IpcResult;

  // CRUD Course
  handleAddCourseFS: (course: CourseData, coursePath: string) => IpcResult;
  handleGetCourseFS: (coursePath: string) => IpcResult;
  handleUpdateCourseFS: (course: CourseData, coursePath: string) => IpcResult;

  // CRUD Assignment
  handleAddAssignmentFS: (
    assignment: CodeAssignmentData,
    coursePath: string
  ) => IpcResult;
  handleGetAssignmentsFS: (coursePath: string, id: string) => IpcResult;
  getAssignmentsDB: (coursePath: string) => IpcResult;
  handleUpdateAssignmentFS: (
    assignment: CodeAssignmentData,
    coursePath: string
  ) => IpcResult;
  handleDeleteAssignmentsFS: (coursePath: string, ids: string[]) => IpcResult;
  getAssignmentCountDB: (coursePath: string) => IpcResult;
  getFilteredAssignmentsDB: (coursePath: string, filters: any) => IpcResult;

  // CRUD Module
  addModuleDB: (coursePath: string, module: ModuleData) => IpcResult;
  getModulesDB: (coursePath: string) => IpcResult;
  updateModuleDB: (coursePath: string, module: ModuleData) => IpcResult;
  deleteModulesDB: (coursePath: string, ids: number[]) => IpcResult;
  getModuleCountDB: (coursePath: string) => IpcResult;
  getFilteredModulesDB: (coursePath: string, filters: any) => IpcResult;

  // CRUD Tag
  getAssignmentTagsDB: (coursePath: string) => IpcResult;
  getModuleTagsDB: (coursePath: string) => IpcResult;

  // CRUD Set
  addSetFS: (coursePath: string, set: SetData) => IpcResult;
  getSetsFS: (coursePath: string) => IpcResult;
  updateSetFS: (coursePath: string, set: SetData) => IpcResult;
  deleteSetsFS: (coursePath: string, ids: string[]) => IpcResult;
};
