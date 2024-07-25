export const supportedLanguagesList: string[] = ["FI", "ENG"];
export type SupportedLanguages = "FI" | "ENG";

export type FileTypes = "text" | "image" | "code";

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
  ID: number;
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
  ID?: string;
  modules?: number;
  moduleType?: "week" | "module" | null;
  language?: SupportedLanguages;
  codeLanguage?: CodeLanguage | null;
  CodeGradeID?: number;
  minLevel?: number;
  maxLevel?: number;
  levels?: LevelsType | null;
}

export type CourseLoaderData = "create" | "manage";

export type SupportedModuleType = "week" | "module" | null;

export interface SettingsType {
  codeLanguages: Array<CodeLanguage>;
  language: string;
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
  //saveProject: (assignment: CodeAssignmentData, coursePath: string) => IpcResult;
  handleGetAssignmentsFS: (coursePath: string, id: string) => IpcResult;
  getAssignmentsDB: (coursePath: string) => IpcResult;
  handleUpdateAssignmentFS: (
    assignment: CodeAssignmentData,
    coursePath: string
  ) => IpcResult;
  handleDeleteAssignmentFS: (coursePath: string, id?: string) => IpcResult;
  getAssignmentCountDB: (coursePath: string) => IpcResult;
  getFilteredAssignments: (coursePath: string, filters: any) => IpcResult;

  // CRUD Module
  handleAddModuleFS: (module: ModuleData, coursePath: string) => IpcResult;
  handleGetModulesFS: (coursePath: string) => IpcResult;
  getModulesDB: (coursePath: string) => IpcResult;
  handleUpdateModuleFS: (module: ModuleData, coursePath: string) => IpcResult;
  deleteModuleDB: (coursePath: string, id: number) => IpcResult;
  getModuleCountDB: (coursePath: string) => IpcResult;

  // CRUD Tag
  getAssignmentTagsDB: (coursePath: string) => IpcResult;
  getModuleTagsDB: (coursePath: string) => IpcResult;
};
