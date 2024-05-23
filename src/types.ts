export type SupportedLanguages = "FI" | "ENG"

export type FileTypes = "text" | "image" | "code"

export interface FileData {
  "fileName": string,
  "path": string,
  "solution": boolean,
  "resultFile": boolean,
  "show_student": boolean,
  "fileType": FileTypes
  }

export interface CGData {
  "id": string,
  "atv2": object
}

export interface AssignmentData {
  "assignmentID": string,
  "assignmentType": "assignment",
  "assignment": {
      "title": string,
      "tags": Array<string>,
      "module": number | null,
      "assignmentNo": Array<number>,
      "level": number | null,
      "next": Array<string> | null,
      "previous": Array<string> | null,
      "codeLanguage": string,
      "variations": {
        [key:string]: {
          "instructions": string,
          "exampleRuns": {
            [key:string]: {
              "generate": boolean,
              "inputs": Array<string | number>,
              "cmdInputs": Array<string | number>,
              "output": string,
              },
            },
          "files": Array<FileData>
          "usedIn": Array<string>,
          "cgConfig": CGData
      },
    },
  }
}
