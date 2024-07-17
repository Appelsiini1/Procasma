import { CodeAssignmentData, CourseData, FileData, ModuleData } from "./types";

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
  ID: "",
  modules: 0,
  moduleType: "week",
  language: "FI",
  codeLanguage: { name: "Python", fileExtensions: [".py"] },
  CodeGradeID: null,
  minLevel: 1,
  maxLevel: 1,
  levels: null,
};

export const defaultAssignment: CodeAssignmentData = {
  assignmentID: null,
  title: null,
  tags: [],
  module: 0,
  assignmentType: "assignment",
  assignmentNo: [],
  level: null,
  next: null,
  previous: null,
  codeLanguage: "",
  variations: {},
};

export const defaultProject: CodeAssignmentData = {
  assignmentID: null,
  title: null,
  tags: [],
  module: 0,
  assignmentType: "finalWork",
  assignmentNo: [],
  level: null,
  next: null,
  previous: null,
  codeLanguage: null,
  variations: {},
};

export const defaultModule: ModuleData = {
  ID: 0,
  name: "",
  letters: true,
  assignments: 0,
  subjects: "",
  tags: [],
  instructions: "",
};
