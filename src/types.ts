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
  // General
  setTitle: (title: string) => IpcResult;
  getAppVersion: () => IpcResult; //string;
  selectDir: () => IpcResult; //string;
  selectFiles: () => IpcResult; //Array<string>;
  saveSettings: (settings: SettingsType) => IpcResult; //any;
  getSettings: () => IpcResult; //Settings;

  // CRUD Course
  saveCourse: (course: CourseData, path: string) => IpcResult; //any;
  readCourse: (path: string) => IpcResult;
  updateCourse: (course: CourseData, path: string) => IpcResult; //any;

  // CRUD Assignment
  saveAssignment: (assignment: CodeAssignmentData, path: string) => IpcResult; //any;
  saveProject: (assignment: CodeAssignmentData, path: string) => IpcResult;
  getAssignments: (path: string) => IpcResult; //CodeAssignmentData[];
  updateAssignment: (assignment: CodeAssignmentData, path: string) => IpcResult; //any;
  deleteAssignment: (coursePath: string, id: string) => IpcResult; //any;

  // CRUD Module
  saveModule: (module: ModuleData, path: string) => IpcResult;
  getModules: (path: string) => IpcResult; //ModuleData[];
  updateModule: (module: ModuleData, path: string) => IpcResult;
  deleteModule: (coursePath: string, id: number) => IpcResult;
};
