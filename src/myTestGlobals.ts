import { CodeAssignmentData, CourseData } from "./types";

export const testCurrentCourse: CourseData = {
  title: "Ohjelmoinnin Perusteet",
  ID: "CT60A0203",
  modules: 2,
  moduleType: "week",
  language: "FI",
  codeLanguage: { name: "Python", fileExtensions: [".py"] },
  CodeGradeID: 12345,
  minLevel: 1,
  maxLevel: 3,
  levels: {
    1: {
      fullName: "Helppo",
      abbreviation: "H",
    },
    2: {
      fullName: "Vaikea",
      abbreviation: "V",
    },
  },
};

export const testCurrentAssignment: CodeAssignmentData = {
  assignmentID: "assignment_001",
  title: "Introduction to commands",
  tags: ["print", "try...except"],
  module: 1,
  assignmentType: "assignment",
  assignmentNo: [1, 2, 3],
  level: 5,
  next: ["nextAssignment1", "nextAssignment2"],
  previous: ["previousAssignment1", "previousAssignment2"],
  codeLanguage: "TypeScript",
  variations: {
    A: {
      instructions: "Complete the following tasks.",
      exampleRuns: {
        1: {
          generate: true,
          inputs: [1, 2, 3],
          cmdInputs: ["npm", "start"],
          output: "Output for run 1",
        },
      },
      files: [
        {
          fileName: "example1.txt",
          path: "/path/to/example1.txt",
          solution: true,
          fileContent: "data",
          showStudent: true,
          fileType: "text",
        },
      ],
      usedIn: ["course1", "course2"],
      cgConfig: {
        id: "cg1",
        atv2: {},
      },
    },
    B: {
      instructions: "Solve the problems below.",
      exampleRuns: {
        1: {
          generate: true,
          inputs: [4, 5, 6],
          cmdInputs: ["python", "script.py"],
          output: "Output for run 1 in variation 2",
        },
        2: {
          generate: false,
          inputs: [7, 8, 9],
          cmdInputs: ["node", "app.js"],
          output: "Output for run 2 in variation 2",
        },
      },
      files: [
        {
          fileName: "example2.js",
          path: "/path/to/example2.js",
          solution: false,
          fileContent: "code",
          showStudent: false,
          fileType: "code",
        },
        {
          fileName: "example3.py",
          path: "/path/to/example3.py",
          solution: true,
          fileContent: "code",
          showStudent: true,
          fileType: "code",
        },
      ],
      usedIn: ["course3"],
      cgConfig: {
        id: "cg2",
        atv2: {},
      },
    },
  },
};
