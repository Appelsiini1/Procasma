export const supportedLanguagesList: string[] = ["FI", "ENG"];
export type SupportedLanguages = "FI" | "ENG";
export type FormatType = "pdf" | "html";
export const formatTypes: FormatType[] = ["pdf", "html"];
export type FileTypes = "text" | "image" | "code";
export type FileContents = "instruction" | "result" | "code" | "data" | "other";
export type SupportedModuleType = "week" | "module" | "lecture" | null;
export enum AssignmentTypes {
  assignment = "assignment",
  finalWork = "finalWork",
}

export interface FileData {
  fileName: string;
  path: string;
  solution: boolean;
  fileContent: FileContents;
  showStudent: boolean;
  fileType: FileTypes;
}

export interface DropZoneFile {
  fileContent: ArrayBuffer;
  fileName: string;
}

export interface CGData {
  id: string;
  atv2: any;
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

export interface ProjectLevel extends Variation {
  levelName: string;
}

export interface CommonAssignmentData {
  assignmentID: string;
  title: string;
  tags: Array<string>;
  module: number | null;
  folder: string; // used to indicate the folder that the assignment is located in under assignmentData
  extraCredit: boolean;
}

export interface CodeAssignmentData extends CommonAssignmentData {
  assignmentType: string;
  position: Array<number>;
  level: number | null;
  next: Array<string> | null;
  previous: Array<string> | null;
  codeLanguage: string;
  variations: {
    [key: string]: Variation;
  };
}

export interface ProjectInput extends Omit<CodeAssignmentData, "variations"> {
  variations: {
    [key: string]: ProjectLevel;
  };
  format: "html" | "pdf";
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
  fullName: string;
  abbreviation: string;
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
  levels?: LevelsType[] | null;
}

export type CourseLoaderData = "create" | "manage";

export interface SettingsType {
  codeLanguages: Array<CodeLanguage>;
  language: string;
  shortenFiles: boolean;
  fileMaxLinesDisplay: number;
  shortenCode: boolean;
}

export interface SetVariation
  extends Omit<Variation, "instructions" | "exampleRuns" | "files"> {
  usedInBadness: number;
}

/**
 * A special version of CodeAssignmentData that uses a smaller,
 * simplified version of the variations type, for more lightweight
 * use in the SetCreator algorithm.
 */
export interface SetAlgoAssignmentData
  extends Omit<CodeAssignmentData, "variations"> {
  variations: {
    [key: string]: SetVariation;
  };
}

export type WithCheckWrapper = {
  isChecked: boolean;
  value: any;
};

export interface AssignmentWithCheck extends WithCheckWrapper {
  value: CodeAssignmentDatabase;
}

export interface SetWithCheck extends WithCheckWrapper {
  value: SetData;
}

export interface SetAssignmentWithCheck extends WithCheckWrapper {
  value: SetAlgoAssignmentData;
  selectedPosition: number;
  selectedVariation: string;
  selectedModule: number;
}

export interface SetData {
  id: string | null;
  fullCourse: boolean;
  module: number;
  name: string;
  visibleHeader: string;
  year: number;
  period: number;
  export: boolean;
  format: FormatType;
  exportCGConfigs: boolean;
  assignments: SetAssignmentWithCheck[];
  targetModule: number;
  targetPosition: number;
  replaceExisting: boolean;
}

export interface ExportSetAssignmentData {
  id: string;
  variationId: string;
  CGid: string;
  selectedModule: number;
  selectedPosition: number;
  folder: string;
}

export interface ExportSetData
  extends Omit<SetData, "assignments" | "targetModule" | "targetPosition"> {
  assignments: ExportSetAssignmentData[];
}

export interface CodeAssignmentSelectionData
  extends Omit<CommonAssignmentData, "module" | "tags"> {
  variation: Variation;
  CGid: string;
  selectedModule: number;
  selectedPosition: number;
  level: number;
  codeLanguage: string;
  variatioId: string;
}

export interface FullAssignmentSetData
  extends Omit<SetData, "assignments" | "targetModule" | "targetPosition"> {
  assignmentArray: CodeAssignmentSelectionData[];
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
  extraCredit: number;
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

export interface ImportAssignment {
  originalFolder: string;
  assignmentData: CodeAssignmentData;
}

export interface pathStack {
  previousPath: string;
  currentPath: string;
}

export interface CodeGradeLogin {
  username: string;
  password: string;
  tenantId: string;
  hostname: string;
}

export interface CodeGradeTenant {
  id: string;
  name: string;
  sso_provider_id: string;
  statistics: null;
  abbreviated_name: string;
  is_hidden: boolean;
  order_category: number;
  netloc: string;
  logo_default_url: string;
  logo_dark_url: string;
  price: number | null;
  contract_start: string;
}

export interface CGEncryptLogin extends CodeGradeLogin {
  OSUser: string;
}

export type ContextBridgeAPI = {
  // One-way, Renderer to Main
  setTitle: (title: string) => IpcResult;
  setCoursePath: (path: string) => IpcResult;
  closeApp: () => null;

  // Bidirectional, renderer to main to renderer
  // General
  getAppVersion: () => IpcResult;
  getDevMode: () => boolean;
  selectDir: () => IpcResult;
  selectFiles: () => IpcResult;
  saveSettings: (settings: SettingsType) => IpcResult;
  getSettings: () => IpcResult;
  getHash: (content: string) => IpcResult;

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
  getTruncatedAssignmentsFS: (coursePath: string) => IpcResult;
  getAssignmentsDB: (coursePath: string, ids?: string[]) => IpcResult;
  handleUpdateAssignmentFS: (
    assignment: CodeAssignmentData,
    coursePath: string
  ) => IpcResult;
  handleDeleteAssignmentsFS: (coursePath: string, ids: string[]) => IpcResult;
  getAssignmentCountDB: (coursePath: string) => IpcResult;
  getFilteredAssignmentsDB: (coursePath: string, filters: any) => IpcResult;
  importAssignmentsFS: (coursePath: string, importPath: string) => IpcResult;
  exportProjectFS: (
    assignment: CodeAssignmentData,
    coursedata: CourseData,
    savePath: string,
    replaceExisting: boolean
  ) => IpcResult;

  // CRUD Module
  addModuleDB: (coursePath: string, module: ModuleData) => IpcResult;
  getModulesDB: (coursePath: string, ids?: string[]) => IpcResult;
  updateModuleDB: (coursePath: string, module: ModuleData) => IpcResult;
  deleteModulesDB: (coursePath: string, ids: number[]) => IpcResult;
  getModuleCountDB: (coursePath: string) => IpcResult;
  getFilteredModulesDB: (coursePath: string, filters: any) => IpcResult;
  autoGenerateModulesFS: (coursePath: string) => IpcResult;

  // CRUD Tag
  getAssignmentTagsDB: (coursePath: string) => IpcResult;
  getModuleTagsDB: (coursePath: string) => IpcResult;

  // CRUD Set
  addOrUpdateSetFS: (coursePath: string, set: ExportSetData) => IpcResult;
  getSetsFS: (coursePath: string, id?: string) => IpcResult;
  deleteSetsFS: (coursePath: string, ids: string[]) => IpcResult;

  //Export set
  exportSetFS: (
    setInput: ExportSetData,
    coursedata: CourseData,
    savePath: string
  ) => IpcResult;
  exportManySetsFS: (
    setInput: Array<ExportSetData>,
    coursedata: CourseData,
    savePath: string
  ) => IpcResult;

  // CodeGrade
  getTenants: () => IpcResult;
  CGLogin: (loginDetails: CodeGradeLogin, fromSaved: boolean) => IpcResult;
  getATV2Config: (assigID: string) => IpcResult;

  // Credentials and encryption
  saveCredentials: (loginDetails: CodeGradeLogin) => IpcResult;
  checkCredentialExistance: () => IpcResult;

  // Other file system related
  saveCacheFiles: (fileList: DropZoneFile[]) => IpcResult;
};
