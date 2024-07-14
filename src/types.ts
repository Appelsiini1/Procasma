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

export interface Settings {
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
  message?: string;
  success: boolean;
}

export interface GeneralResult {
  content?: any;
  message?: string;
  error?: string;
}

export type ContextBridgeAPI = {
  setTitle: (title: string) => void;
  getAppVersion: () => IpcResult; //string;
  saveCourse: (course: CourseData, path: string) => IpcResult; //any;
  updateCourse: (course: CourseData, path: string) => IpcResult; //any;
  selectDir: () => IpcResult;
  selectFiles: () => IpcResult; //Array<string>;
  readCourse: (path: string) => IpcResult;
  saveAssignment: (assignment: CodeAssignmentData, path: string) => IpcResult; //any;
  updateAssignment: (assignment: CodeAssignmentData, path: string) => IpcResult; //any;
  saveProject: (assignment: CodeAssignmentData, path: string) => void;
  getAssignments: (path: string) => IpcResult; //CodeAssignmentData[];
  deleteAssignment: (coursePath: string, id: string) => IpcResult; //any;
  saveSettings: (settings: Settings) => IpcResult; //any;
  getSettings: () => IpcResult; //Settings;
  saveModule: (module: ModuleData, path: string) => void;
  getModules: (path: string) => IpcResult; //ModuleData[];
  deleteModule: (coursePath: string, id: number) => void;
};
