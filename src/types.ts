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

export interface CommonAssignmentData {
  assignmentID: string;
  title: string;
  tags: Array<string>;
  module: number | null;
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

export interface CodeAssignmentData extends CommonAssignmentData {
  assignmentType: "assignment";
  assignmentNo: Array<number>;
  level: number | null;
  next: Array<string> | null;
  previous: Array<string> | null;
  codeLanguage: string;
  variations: {
    [key: string]: Variation;
  };
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

export type ContextBridgeAPI = {
  setTitle: (title: string) => void;
  openFile: () => string;
  getAppVersion: () => string;
};

export type SupportedModuleType = "week" | "module" | null;
