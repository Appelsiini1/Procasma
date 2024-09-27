import fs from "fs";
import path from "path";
import {
  CodeAssignmentData,
  CourseData,
  ExampleRunType,
  FileContents,
  FileData,
  LevelsType,
  Variation,
} from "../types";
import {
  markdownAssignmentLevel,
  markdownCLIargument,
  markdownExampleRun,
  markdownInput,
  markdownOutput,
} from "../constants";
import {
  codeExtensions,
  dataExtensions,
  imageExtensions,
  textExtensions,
} from "../constantsUI";
import log from "electron-log/node";
import {
  deepCopy,
  getFileTypeUsingExtension,
} from "../rendererHelpers/utility";
import { defaultExampleRun, defaultFile } from "../defaultObjects";
import { globalSettings } from "../globalsMain";

export function getFileContentFromName(fileName: string): FileContents {
  const baseName = path.basename(fileName);
  const ext = path.extname(fileName).replace(".", "");

  if (baseName.includes("D")) {
    return "data";
  }

  // check if result
  const regex = /^[A-Za-z][0-9]+[A-Za-z][0-9]+T[0-9]+\.([a-zA-Z0-9]+)$/;
  if (regex.test(fileName)) {
    return "result";
  }

  if (textExtensions.includes(ext)) {
    return "instruction";
  } else if (imageExtensions.includes(ext)) {
    return "instruction";
  } else if (codeExtensions.includes(ext)) {
    return "code";
  } else if (dataExtensions.includes(ext)) {
    return "data";
  } else {
    return null;
  }
}

export function getCodeLanguageUsingExtension(ext: string): string {
  const languages = globalSettings.codeLanguages;
  // look through codeLanguages and return the "name" of
  // the language with any matching "fileExtensions" items
  const newName =
    languages.find((lang) => {
      return lang.fileExtensions.find(
        (extension) => extension.replace(".", "") === ext.replace(".", "")
      );
    })?.name ?? null;

  return newName;
}

/**
 * Based on the fileName, decide the fileType, fileContent,
 * showStudent, and solution attributes of the file.
 */
export function updatePythonFileAttributes(newFile: FileData) {
  const fileType = getFileTypeUsingExtension(newFile.fileName);
  newFile.fileType = fileType ?? "text";

  const fileContent = getFileContentFromName(newFile.fileName);
  newFile.fileContent = fileContent ?? "instruction";

  // check if should show to the student
  if (newFile.fileContent === "result") {
    newFile.showStudent = true;
  }

  // check if solution file
  if (newFile.fileType === "code") {
    // also check if the basename is solution file-like

    // checks for letter, number, letter, number, then file extension.
    // accepts e.g. "L12T1.py"
    const solutionRegex = /^[A-Za-z][0-9]+[A-Za-z][0-9]+\.([a-zA-Z0-9]+)$/;

    if (solutionRegex.test(newFile.fileName)) {
      newFile.solution = true;
    }

    // checks for letter, numbers, letter, numbers, string, then file extension.
    // accepts e.g. "L12T1Kirjasto.py"
    const solutionLibraryRegex =
      /^[A-Za-z][0-9]+[A-Za-z][0-9]+[A-Za-z]+\.([a-zA-Z0-9]+)$/;
    if (solutionLibraryRegex.test(newFile.fileName)) {
      newFile.solution = true;
    }

    // but if it contains "Runko", show it to the student
    if (newFile.fileName.includes("Runko")) {
      newFile.solution = false;
      newFile.showStudent = false;
    }
  }
}

/**
 * @param markdown
 * @returns A list of strings that contain the markdown text for
 *  each example run in order.
 */
export function splitMarkdownExampleRunsFS(markdown: string): string[] {
  // Split the content by line breaks
  const lines = markdown.split(/\r?\n/);

  // Initialize an array to store lines before the heading
  let runIndex = -1;
  const exampleRunMarkdowns: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // When reading e.g. the line "## Esimerkkiajo 1:", start a
    // new example run string
    if (line.includes("##") && line.includes(markdownExampleRun)) {
      runIndex++;
      exampleRunMarkdowns[runIndex] = line + "\n";
    } else if (runIndex > -1) {
      exampleRunMarkdowns[runIndex] += line + "\n";
    }
  }

  return exampleRunMarkdowns;
}

/**
 * Extract a string's rows that exist between the last given "before" string
 * and the single "after" string.
 * @param before Strings that should exist in order within the markdown.
 * @param after A break string that will cut off the rest of the markdown
 */
export function splitMarkdown(
  markdown: string,
  before: string[],
  after: string
): string[] {
  let beforeIndex = 0;

  // Split the content by line breaks
  const lines = markdown.split(/\r?\n/);

  // Initialize an array to store lines before the heading
  const extractedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // if all "before" items have been found
    // begin pushing lines to extractedLines
    if (beforeIndex >= before.length) {
      if (line.includes(after)) {
        break;
      }

      // Add the line to the extracted lines
      extractedLines.push(line);
      continue;
    }

    if (line.includes(before[beforeIndex])) {
      beforeIndex++;
    }
  }

  return extractedLines;
}

/**
 * Find the line within a markdown that contains the assignment level
 * keyword and parse the difficulty into the assignment.
 */
export function markdownExtractLevel(
  assignment: CodeAssignmentData,
  markdown: string,
  levels: LevelsType[]
) {
  if (!assignment.level) {
    const lines = markdown.split(/\r?\n/);
    const lineWithLevel = lines.find((line) =>
      line.includes(markdownAssignmentLevel)
    );

    if (lineWithLevel) {
      levels.forEach((level, index) => {
        const levelName = level.fullName;
        if (lineWithLevel.includes(levelName)) {
          assignment.level = index;
        }
      });
    }
  }
}

/**
 * Reads an assignment variation markdown file and extracts
 * the Variation attributes.
 */
export function parseMarkDownVariationFS(
  markdownPath: string,
  assignment: CodeAssignmentData,
  variationId: string,
  course: CourseData
): Variation {
  try {
    const variation = assignment.variations[variationId];
    const markdown = fs.readFileSync(markdownPath, { encoding: "utf8" });

    // assignment level
    // TODO: get levels dictionary from course

    markdownExtractLevel(assignment, markdown, course.levels);

    // instructions
    variation.instructions = splitMarkdown(
      markdown,
      [markdownAssignmentLevel],
      markdownExampleRun
    ).join("\n");

    // example runs
    const exampleRunMarkdowns = splitMarkdownExampleRunsFS(markdown);

    exampleRunMarkdowns.forEach((runMarkdown, index) => {
      const newRun: ExampleRunType = deepCopy(defaultExampleRun);

      // extract example run attributes from runMarkdown
      const cmdInputs = splitMarkdown(
        runMarkdown,
        [markdownCLIargument, "```"],
        "```"
      )?.[0]; // get the one and only line with cmd arguments in the md.
      newRun.cmdInputs = cmdInputs?.split(" ") ?? [];
      newRun.inputs = splitMarkdown(runMarkdown, [markdownInput, "```"], "```");
      newRun.output = splitMarkdown(
        runMarkdown,
        [markdownOutput, "```"],
        "```"
      ).join("\n");

      variation.exampleRuns[index + 1] = newRun;
    });

    return null;
  } catch (err) {
    log.error("Error in parseMarkDownVariationFS():", err.message);
    throw err;
  }
}

/**
 * Add a file to a variation. Sets the file attributes based on the file
 * name.
 */
export function addFileToVariation(
  filePath: string,
  fileName: string,
  assignment: CodeAssignmentData,
  variationId: string,
  course: CourseData,
  isInner?: boolean
) {
  const newFile: FileData = deepCopy(defaultFile);

  newFile.path = filePath;
  if (isInner) {
    const dirName = path.dirname(filePath);
    const dirBaseName = path.basename(dirName);
    newFile.fileName = path.join(dirBaseName, fileName);
  } else {
    newFile.fileName = fileName;
  }

  // update the file attributes based on the OP course standards
  updatePythonFileAttributes(newFile);

  // add the file to the variation files
  assignment.variations[variationId].files.push(newFile);

  const newExtension = path.extname(fileName);
  // use the assignment position number on the .md file
  // as a possible assignment position
  if (newExtension === ".md") {
    const markdownFile = path.basename(fileName);
    const markdownParts = markdownFile.split("T");
    const position = parseInt(markdownParts[1]);
    const positionExists = assignment.position.findIndex((p) => p === position);
    if (positionExists === -1) {
      assignment.position.push(position);
    }

    // parse the markdown file into the variation
    parseMarkDownVariationFS(filePath, assignment, variationId, course);
  }

  return getCodeLanguageUsingExtension(newExtension);
}
