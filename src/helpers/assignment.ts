import { CodeAssignmentData, FileData, CGData } from "../types";

export class Assignment implements CodeAssignmentData {
  assignmentID: string;
  assignmentType: "assignment";
  assignment: {
    title: string;
    tags: Array<string>;
    module: number | null;
    assignmentNo: Array<number>;
    level: number | null;
    next: Array<string> | null;
    previous: Array<string> | null;
    codeLanguage: string;
    variations: {
      [key: string]: {
        instructions: string;
        exampleRuns: {
          [key: string]: {
            generate: boolean;
            inputs: Array<string | number>;
            cmdInputs: Array<string | number>;
            output: string;
          };
        };
        files: Array<FileData>;
        usedIn: Array<string>;
        cgConfig: CGData;
      };
    };
  };

  constructor(
    assignmentID: string,
    title: string,
    tags: Array<string>,
    module: number | null,
    assignmentNo: Array<number>,
    level: number | null,
    next: Array<string> | null,
    previous: Array<string> | null,
    codeLanguage: string,
    variations: {}
  ) {
    this.assignmentID = assignmentID;
    this.assignmentType = "assignment";
    this.assignment = {
      title: title,
      tags: tags,
      module: module,
      assignmentNo: assignmentNo,
      level: level,
      next: next,
      previous: previous,
      codeLanguage: codeLanguage,
      variations: variations,
    };
  }

  // Getter and Setter for assignmentID
  getAssignmentID(): string {
    return this.assignmentID;
  }

  setAssignmentID(value: string): void {
    this.assignmentID = value;
  }

  // Getter and Setter for assignmentType
  getAssignmentType(): "assignment" {
    return this.assignmentType;
  }

  // No setter for assignmentType as it's hardcoded

  // Getter and Setter for title
  getTitle(): string {
    return this.assignment.title;
  }

  setTitle(value: string): void {
    this.assignment.title = value;
  }

  // Getter and Setter for tags
  getTags(): Array<string> {
    return this.assignment.tags;
  }

  setTags(value: Array<string>): void {
    this.assignment.tags = value;
  }

  // Getter and Setter for module
  getModule(): number | null {
    return this.assignment.module;
  }

  setModule(value: number | null): void {
    this.assignment.module = value;
  }

  // Getter and Setter for assignmentNo
  getAssignmentNo(): Array<number> {
    return this.assignment.assignmentNo;
  }

  setAssignmentNo(value: Array<number>): void {
    this.assignment.assignmentNo = value;
  }

  // Getter and Setter for level
  getLevel(): number | null {
    return this.assignment.level;
  }

  setLevel(value: number | null): void {
    this.assignment.level = value;
  }

  // Getter and Setter for next
  getNext(): Array<string> | null {
    return this.assignment.next;
  }

  setNext(value: Array<string> | null): void {
    this.assignment.next = value;
  }

  // Getter and Setter for previous
  getPrevious(): Array<string> | null {
    return this.assignment.previous;
  }

  setPrevious(value: Array<string> | null): void {
    this.assignment.previous = value;
  }

  // Getter and Setter for codeLanguage
  getCodeLanguage(): string {
    return this.assignment.codeLanguage;
  }

  setCodeLanguage(value: string): void {
    this.assignment.codeLanguage = value;
  }

  // Getter and Setter for variations
  getVariations(): {
    [key: string]: {
      instructions: string;
      exampleRuns: {
        [key: string]: {
          generate: boolean;
          inputs: Array<string | number>;
          cmdInputs: Array<string | number>;
          output: string;
        };
      };
      files: Array<FileData>;
      usedIn: Array<string>;
      cgConfig: CGData;
    };
  } {
    return this.assignment.variations;
  }

  setVariations(value: {
    [key: string]: {
      instructions: string;
      exampleRuns: {
        [key: string]: {
          generate: boolean;
          inputs: Array<string | number>;
          cmdInputs: Array<string | number>;
          output: string;
        };
      };
      files: Array<FileData>;
      usedIn: Array<string>;
      cgConfig: CGData;
    };
  }): void {
    this.assignment.variations = value;
  }
}
