import {
  CodeAssignmentData,
  CourseData,
  ExampleRunType,
  FileData,
  ModuleData,
  SetData,
  Variation,
} from "./types";

export const defaultFile: FileData = {
  fileName: "",
  path: "",
  solution: false,
  fileContent: "instruction",
  showStudent: false,
  fileType: "text",
};

export const defaultCourse: CourseData = {
  title: "",
  id: "",
  modules: 0,
  moduleType: "week",
  language: "FI",
  codeLanguage: { name: "Python", fileExtensions: [".py"] },
  CodeGradeID: null,
  minLevel: 1,
  maxLevel: 1,
  levels: [
    { fullName: "Minimitaso", abbreviation: "M" },
    { fullName: "Perustaso", abbreviation: "P" },
    { fullName: "Tavoitetaso", abbreviation: "T" },
  ],
};

export const defaultAssignment: CodeAssignmentData = {
  assignmentID: null,
  title: null,
  tags: [],
  module: 1,
  assignmentType: "assignment",
  position: [],
  level: null,
  next: null,
  previous: null,
  codeLanguage: "",
  variations: {},
  folder: "",
  extraCredit: false,
};

export const defaultProject: CodeAssignmentData = {
  assignmentID: null,
  title: null,
  tags: [],
  module: 0,
  assignmentType: "finalWork",
  position: [],
  level: null,
  next: null,
  previous: null,
  codeLanguage: null,
  variations: {},
  folder: "",
  extraCredit: false,
};

export const defaultVariation: Variation = {
  instructions: "",
  exampleRuns: {},
  files: [],
  usedIn: [],
  cgConfig: {
    id: "",
    atv2: {},
  },
};

export const defaultExampleRun: ExampleRunType = {
  generate: false,
  inputs: [],
  cmdInputs: [],
  output: "",
};

export const defaultModule: ModuleData = {
  id: 0,
  name: "",
  letters: true,
  assignments: 0,
  subjects: "",
  tags: [],
  instructions: "",
};

export const defaultSet: SetData = {
  id: "",
  fullCourse: true,
  module: null,
  name: "",
  visibleHeader: "",
  year: 2024,
  period: 0,
  export: false,
  format: null,
  exportCGConfigs: true,
  assignments: [],
  targetModule: null,
  targetPosition: null,
};

export const genericModule: ModuleData = {
  id: -3,
  name: "",
  letters: false,
  assignments: 5,
  subjects: "",
  tags: [],
  instructions: "",
};
