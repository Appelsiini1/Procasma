import showdown from "showdown";
import {
  CodeAssignmentData,
  CodeAssignmentSelectionData,
  CourseData,
  ExampleRunType,
  ExportSetData,
  FileData,
  FullAssignmentSetData,
  ModuleData,
} from "../types";
import { readFileSync } from "fs";
import path from "path";
import log from "electron-log/node";
import { parseUICodeMain } from "./language";
import { emptySpaceHeight, ShowdownOptions } from "../constants";
import hljs from "highlight.js/lib/common";
import { coursePath } from "../globalsMain";
import { getModulesDB } from "./databaseOperations";
import { createMainFunctionHandler } from "./ipcHelpers";
import {
  copyExportFilesFS,
  handleReadFileFS,
  saveSetFS,
} from "./fileOperations";
import { css as papercolorLight } from "../../resource/cssImports/papercolor-light";

const converter = new showdown.Converter(ShowdownOptions);

interface AssignmentInput {
  assignmentIndex: number;
  courseData: CourseData;
}

// Set converter
export function setToFullData(set: ExportSetData): FullAssignmentSetData {
  let assignmentArray: CodeAssignmentSelectionData[] = [];
  for (const setAssignment of set.assignments) {
    const assigPath = path.join(
      coursePath.path,
      setAssignment.folder,
      setAssignment.id + ".json"
    );
    const fullData = handleReadFileFS(assigPath) as CodeAssignmentData;
    let newAssignment: CodeAssignmentSelectionData = {
      variation: fullData.variations[setAssignment.variationId],
      variatioId: setAssignment.variationId,
      CGid: setAssignment.CGid,
      selectedPosition: setAssignment.selectedPosition,
      selectedModule: setAssignment.selectedModule,
      assignmentID: fullData.assignmentID,
      level: fullData.level,
      folder: fullData.folder,
      codeLanguage: fullData.codeLanguage,
      title: fullData.title,
    };
    assignmentArray.push(newAssignment);
  }
  assignmentArray.sort((a, b) => {
    if (a.selectedModule < b.selectedModule) {
      return -1;
    } else if (a.selectedModule > b.selectedModule) {
      return 1;
    } else if (a.selectedModule === b.selectedModule) {
      if (a.selectedPosition < b.selectedPosition) {
        return -1;
      } else if (a.selectedPosition > b.selectedPosition) {
        return 1;
      }
    }

    return 0;
  });
  const newSet: FullAssignmentSetData = {
    assignmentArray: assignmentArray,
    ...set,
  };
  return newSet;
}

// Set exporter
/**
 * Creates HTML strings from assignment sets and saves them to disk according to the format spesified in set data
 * @param setInput An array of ExportSetData objects with set information
 * @param coursedata A CourseData object with course information
 * @param savePath Path where to save the created file(s).
 */
export async function exportSetFS(
  setInput: Array<ExportSetData>,
  coursedata: CourseData,
  savePath: string
): Promise<String> {
  try {
    for (const set of setInput) {
      let moduleString = "";
      const convertedSet = setToFullData(set);
      const css = papercolorLight;

      // HTML Base
      let html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${css}</style>
  </head>
  <body>`;
      let solutionHtml = html;

      // Main page header
      const mainHeader = formatMainHeader(convertedSet, coursedata);
      html += `<h1>${mainHeader}</h1>`;
      solutionHtml += `<h1>${mainHeader} ${parseUICodeMain(
        "answers"
      ).toUpperCase()}</h1>`;

      // Get correct module
      if (convertedSet.module != null) {
        const module = await createMainFunctionHandler(() =>
          getModulesDB(coursePath.path, [convertedSet.module])
        );
        if (module.errorMessage) {
          throw new Error(module.errorMessage);
        }

        // Starting instructions
        const startingInstructions = generateStart(module.content[0]);
        html += startingInstructions;
        solutionHtml += startingInstructions;

        // Module string for PDF footer

        switch (coursedata.moduleType) {
          case "lecture":
            moduleString +=
              parseUICodeMain("ui_lecture") +
              ` ${convertedSet.module.toString()}`;
            break;
          case "module":
            moduleString +=
              parseUICodeMain("ui_module") +
              ` ${convertedSet.module.toString()}`;
            break;
          case "week":
            moduleString +=
              parseUICodeMain("ui_week") + ` ${convertedSet.module.toString()}`;
            break;
          default:
            break;
        }
      }

      // Table of contents
      const toc = generateToC(coursedata, convertedSet);
      html += toc;
      solutionHtml += toc;

      // Assignments
      for (
        let index = 0;
        index < convertedSet.assignmentArray.length;
        index++
      ) {
        const meta = { assignmentIndex: index, courseData: coursedata };
        const normalblock = generateBlock(meta, convertedSet);
        html += normalblock;
        solutionHtml += normalblock;
        solutionHtml += formatSolutions(meta, convertedSet);
      }

      // End body
      html += `</body>
</html>`;
      solutionHtml += `</body>
</html>`;
      log.info("HTML created.");
      await saveSetFS(
        html,
        solutionHtml,
        mainHeader,
        convertedSet.format,
        coursedata,
        savePath,
        moduleString
      );
      const filename = mainHeader.replace(" ", "");
      savePath = path.join(savePath, filename);
      copyExportFilesFS(convertedSet, savePath);
    }
  } catch (err) {
    log.error("Error in HTML generation: " + err.message);
    throw new Error("ui_export_error");
  }
  return "ui_export_success";
}

// Formatters
/**
 * Formats a Markdown string into HTML
 * @param text String containing Markdown formatting
 * @returns HTML string
 */
function formatMarkdown(text: string): string {
  //Showdown
  try {
    return converter.makeHtml(text);
  } catch (err) {
    log.error("Error in Showdown converter: " + err.message);
    throw err;
  }
}

/**
 * Formats a string containing MathML or LaTeX mathematical formulas into HTML
 * @param text String containing MML or LaTeX formatting
 * @returns HTML string
 */
function formatMath(text: string): string {
  //Depends on MathJax
  return text;
}

/**
 * Formats a string into HTML with language-spesific highlighting
 * @param code String to highlight
 * @param language Language to use in highlighting
 * @returns HTML string
 */
function highlightCode(code: string, language: string): string {
  try {
    let block = `<div class="code-background"><div class="code-inner-container"><pre><code class="hljs">`;
    block += hljs.highlight(code, { language: language }).value;
    block += `</code></pre></div></div>`;
    return block;
  } catch (err) {
    log.error("Error in highlightCode(): " + err.message);
    throw err;
  }
}

/**
 * Formats solution files
 * @param meta Course data and assignment index
 * @param set Set data
 * @returns HTML string
 */
function formatSolutions(
  meta: AssignmentInput,
  set: FullAssignmentSetData
): string {
  try {
    let block = ``;
    const files = set.assignmentArray[meta.assignmentIndex].variation.files;
    for (const file of files) {
      if (file.solution && file.fileContent === "code") {
        const filePath = path.join(
          coursePath.path,
          set.assignmentArray[meta.assignmentIndex].folder,
          set.assignmentArray[meta.assignmentIndex].variatioId,
          file.fileName
        );
        const data = readFileSync(filePath, "utf8");
        block += `<div style="margin-top: 1cm;"></div>`;
        block += `<h2>${parseUICodeMain("ex_solution")}: '${
          file.fileName
        }'</h2>`;
        block += highlightCode(
          data,
          set.assignmentArray[meta.assignmentIndex].codeLanguage
        );
      }
    }
    return block;
  } catch (err) {
    log.error("Error in solution formatter: " + err.message);
    throw err;
  }
}

/**
 * Formats files that are not solution files. Will make titles based on file content type.
 * @param meta Course data and assignment index
 * @param set Set data
 * @param type Type of file to make title for
 * @returns
 */
function formatFiles(
  meta: AssignmentInput,
  set: FullAssignmentSetData,
  type: FileData["fileContent"]
): string {
  try {
    let block = ``;
    const files = set.assignmentArray[meta.assignmentIndex].variation.files;
    for (const file of files) {
      if (
        !file.solution &&
        file.showStudent &&
        (file.fileType === "code" || file.fileType === "text") &&
        file.fileContent === type
      ) {
        const filePath = path.join(
          coursePath.path,
          set.assignmentArray[meta.assignmentIndex].folder,
          file.fileName
        );
        const data = readFileSync(filePath, "utf8");
        block += `<h3>${parseUICodeMain(
          type === "data" ? "input_datafile" : "ex_resultfile"
        )}: '${file.fileName}'</h3>`;
        const language =
          file.fileContent === "code"
            ? set.assignmentArray[meta.assignmentIndex].codeLanguage
            : "plaintext";
        block += highlightCode(data, language);
      }
    }
    return block;
  } catch (err) {
    log.error("Error in file formatter: " + err.message);
    throw err;
  }
}

/**
 * Generates a main page header. If the set has no module, will not add a module letter or number to it.
 * @param set Set data
 * @param courseData Course data
 * @returns
 */
function formatMainHeader(set: FullAssignmentSetData, courseData: CourseData) {
  let title = ``;
  if (set.module != null) {
    const addToTitle = (ui_code: string) => {
      title += parseUICodeMain(ui_code);
      title += set.module.toString();
    };
    switch (courseData.moduleType) {
      case "lecture":
        addToTitle("lecture_letter");
        break;
      case "module":
        addToTitle("module_letter");
        break;
      case "week":
        addToTitle("week_letter");
        break;
      default:
        break;
    }
    title += " ";
  }
  title += parseUICodeMain("assignments");
  return title;
}

/**
 * Formats a title
 * @param meta Course data and assignment index
 * @param set Set data
 * @param toc A boolean whether the title is a table of contents title
 * @returns
 */
function formatTitle(
  meta: AssignmentInput,
  set: FullAssignmentSetData,
  toc = false
) {
  let title = ``;
  const addToTitle = (ui_code: string) => {
    title += parseUICodeMain(ui_code);
    title +=
      set.assignmentArray[meta.assignmentIndex].selectedModule.toString();
  };
  switch (meta.courseData.moduleType) {
    case "lecture":
      addToTitle("lecture_letter");
      break;
    case "module":
      addToTitle("module_letter");
      break;
    case "week":
      addToTitle("week_letter");
      break;
    default:
      break;
  }
  title +=
    parseUICodeMain("assignment_letter") +
    set.assignmentArray[meta.assignmentIndex].selectedPosition.toString() +
    ": ";
  title += set.assignmentArray[meta.assignmentIndex].title;

  // if table of contents, add level abbreviation to the end of title
  if (toc && set.assignmentArray[meta.assignmentIndex].level != null) {
    title += ` (${
      meta.courseData.levels[set.assignmentArray[meta.assignmentIndex].level]
        .abbreviation
    })`;
  }
  return title;
}

// Block generators
/**
 * Generates the starting instructions
 * @param moduleInput ModuleData object with module information
 * @returns HTML string
 */
function generateStart(moduleInput: ModuleData | null): string {
  if (!moduleInput) return "";

  let block = `<div>`;
  const subjects = moduleInput.subjects.split("\n").map((value, index) => {
    return `<li id="${index}">${formatMarkdown(value)}</li>`;
  });
  block += "<ul>";
  for (const item of subjects) {
    block += item;
  }
  block += "</ul>";
  block += formatMarkdown(moduleInput.instructions);
  block += `<div style="height: ${emptySpaceHeight};"></div>`;
  block += "</div>";
  return block;
}

/**
 * Generates an assignment block
 * @param meta Course data and assignment index
 * @param set Set data
 * @returns HTML string
 */
function generateBlock(
  meta: AssignmentInput,
  set: FullAssignmentSetData
): string {
  let block = `<div>
    `;
  // Title
  const title = `<h2 class="assig-title"><a id="${
    set.assignmentArray[meta.assignmentIndex].assignmentID
  }">${formatTitle(meta, set)}</a></h2>\n`;
  block += `${title}`;

  // Assignment level
  if (set.assignmentArray[meta.assignmentIndex].level != null) {
    block += `<i>${parseUICodeMain("ui_assignment_level")}: ${
      meta.courseData.levels[set.assignmentArray[meta.assignmentIndex].level]
        .fullName
    }</i>`;
  }

  //Instructions
  // block += `<p>`;
  block += formatMarkdown(
    formatMath(set.assignmentArray[meta.assignmentIndex].variation.instructions)
  );
  // block += `</p>`;

  // Datafiles
  block += formatFiles(meta, set, "data");

  // Example runs
  const exampleRuns =
    set.assignmentArray[meta.assignmentIndex].variation.exampleRuns;
  let runNumber = 1;
  for (const run in exampleRuns) {
    block += generateExampleRun(exampleRuns[run], runNumber);
    runNumber += 1;
  }

  // Result files
  block += formatFiles(meta, set, "result");

  block += `</div>`;
  return block;
}

/**
 * Generates example run block
 * @param runInput Run information
 * @param runNumber Run number
 * @returns HTML string
 */
function generateExampleRun(
  runInput: ExampleRunType,
  runNumber: number
): string {
  let block = `<h2>${parseUICodeMain("ex_run")} ${runNumber}</h2>`;
  if (runInput.cmdInputs.length != 0 && runInput.cmdInputs[0] != "") {
    block += `<h3>${parseUICodeMain("cmd_input")}</h3>`;
    let cmdInputs = "";
    for (const input of runInput.cmdInputs) {
      cmdInputs += input + " ";
    }
    block += highlightCode(cmdInputs, "plaintext");
  }
  const inputFormatter = (inputs: Array<string | number>) => {
    let str = ``;
    for (const value of inputs) {
      str += `${typeof value === "string" ? value : value.toString()}\n`;
    }
    return str;
  };

  if (runInput.inputs.length != 0 && runInput.inputs[0] != "") {
    block += `<h3>${parseUICodeMain("ex_input")}</h3>`;
    block += highlightCode(inputFormatter(runInput.inputs), "plaintext");
  }
  if (runInput.output != "") {
    block += `<h3>${parseUICodeMain("ex_output")}</h3>`;
    block += highlightCode(runInput.output, "plaintext");
  }
  return block;
}

/**
 * Generates the table of contents
 * @param courseData Course data
 * @param set Set data
 * @returns HTML string
 */
function generateToC(
  courseData: CourseData,
  set: FullAssignmentSetData
): string {
  try {
    let block = `<h2>${parseUICodeMain("toc")}</h2>\n`;
    for (const assig of set.assignmentArray) {
      block += `<h3><a class="toc" href="#${assig.assignmentID}">${formatTitle(
        {
          assignmentIndex: set.assignmentArray.indexOf(assig),
          courseData: courseData,
        },
        set,
        true
      )}`;
      block += `</a></h3>`;
    }

    return block;
  } catch (err) {
    log.error("Error in generateTOC: " + err.message);
    throw err;
  }
}
