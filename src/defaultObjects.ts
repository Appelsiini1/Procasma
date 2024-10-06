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
  levels: {
    "1": { fullName: "Minimitaso", abbreviation: "M" },
    "2": { fullName: "Perustaso", abbreviation: "P" },
    "3": { fullName: "Tavoitetaso", abbreviation: "T" },
  },
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

export const defaultATv2Config: object = {
  assignmentId: null,
  publishedSnapshot: {
    published: null,
  },
  setup: {
    metadata: {
      baseImageId: "base-image-2023-10-04-v1",
    },
    steps: [
      {
        installPython: {
          id: null,
          version: "3.11",
        },
      },
      {
        uploadFiles: {
          description: {
            behavior: "collapse",
            value: "",
          },
          files: [
            /*{ SG_testi.sh appears in all OP assignments
                          "id": "37857c03-10e4-448a-88ae-055f72c98763",
                          "path": "SG_testi.sh",
                          "size": 363
                      },*/
          ],
          id: null,
          name: "",
        },
      },
      {
        script: {
          description: {
            behavior: "collapse",
            value: "",
          },
          id: null,
          name: "",
          script:
            "# Write your bash script here.\npython3 -m pip install semgrep",
        },
      },
    ],
  },
  test: {
    steps: [],
  },
};

export const defaultConnectRubric: object = {
  connectRubric: {
    children: [],
    id: null,
    rubricRowId: null,
  },
};

export const defaultIoTest: object = {
  ioTest: {
    children: [],
    id: null,
    name: null,
    script: null,
  },
};

export const defaultSimpleMatch: object = {
  simpleMatch: {
    caseSensitivity: "sensitive",
    description: {
      behavior: "collapse",
      value: "",
    },
    id: null,
    inputText: null,
    name: "Testi 1",
    outputText: null,
    whitespacesPolicy: "include",
  },
};
