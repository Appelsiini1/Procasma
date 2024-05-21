export type SupportedLanguages = "FI" | "ENG"

export type FileTypes = "text" | "image" | "code"

interface FileData {
  "file_name": string,
  "path": string,
  "solution": boolean,
  "result_file": boolean,
  "show_student": boolean,
  "fileType": FileTypes
  }

interface CGData {
  "id": string,
  "ATv2": object
}

export interface AssignmentData {
  "assignment_id": string,
  "assignment_type": "assignment",
  "assignment": {
      "title": string,
      "tags": Array<string>,
      "module": number | null,
      "assignment_no": Array<number>,
      "level": number | null,
      "next": Array<string> | null,
      "previous": Array<string> | null,
      "code_language": string,
      "variations": {
        [key:string]: {
          "instructions": string,
          "example_runs": {
            [key:string]: {
              "generate": boolean,
              "inputs": Array<string | number>,
              "cmd_inputs": Array<string | number>,
              "output": string,
              },
            },
          "files": Array<FileData>
          "used_in": Array<string>,
          "CG_config": CGData
      },
    },
  }
}
