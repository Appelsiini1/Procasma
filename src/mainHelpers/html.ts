import showdown from "showdown";
import {
  CourseData,
  ExampleRunType,
  ExportSetData,
  FileData,
  FullAssignmentSetData,
  ModuleData,
} from "../types";
import { writeFileSync, readFileSync } from "fs";
import path from "path";
import log from "electron-log/node";
import { parseUICodeMain } from "./language";
import { version, ShowdownOptions } from "../constants";
import hljs from "highlight.js/lib/common";
import { coursePath } from "../globalsMain";
import { setToFullData } from "../generalHelpers/assignment";
import { getModulesDB } from "./databaseOperations";
import { createMainFunctionHandler } from "./ipcHelpers";
import { createPDF } from "./pdf";

const converter = new showdown.Converter(ShowdownOptions);

interface AssignmentInput {
  assignmentIndex: number;
  courseData: CourseData;
}

// Set exporter
/**
 * Creates one HTML string from an assignment set and saves it to disk according to the format spesified in setInput
 * @param setInput An ExportSetData object with set information
 * @param coursedata A CourseData object with course information
 * @param savePath Path where to save the created file.
 */
export async function exportSet(
  setInput: Array<ExportSetData>,
  coursedata: CourseData,
  savePath: string
) {
  for (const set of setInput) {
    const convertedSet = setToFullData(set);

    // HTML Base
    let html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="procasma-papercolor-light.min.css" />
  </head>
  <body>
    <div>`;
    let solutionHtml = html;

    // Main page header
    const mainHeader = formatMainHeader(convertedSet, coursedata);
    html += `<h1>${mainHeader}</h1>`;
    solutionHtml += `<h1>${mainHeader} ${parseUICodeMain(
      "answers"
    ).toUpperCase()}</h1>`;

    // Get correct module
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

    // Table of contents
    const toc = generateToC(coursedata, convertedSet);
    html += toc;
    solutionHtml += toc;

    // Assignments
    for (let index = 0; index < convertedSet.assignmentArray.length; index++) {
      const meta = { assignmentIndex: index, courseData: coursedata };
      const normalblock = generateBlock(meta, convertedSet);
      html += normalblock;
      solutionHtml += normalblock;
      solutionHtml += formatSolutions(meta, convertedSet);
    }

    // End body
    html += `</div>
  </body>
</html>`;
    solutionHtml += `</div>
  </body>
</html>`;

    const filename = mainHeader.replace(" ", "");
    const solutionFilename =
      mainHeader.replace(" ", "") + parseUICodeMain("answers").toUpperCase();
    if (convertedSet.format === "html") {
      saveHTML(html, savePath, filename + ".html");
      saveHTML(solutionHtml, savePath, solutionFilename + ".html");
    } else if (convertedSet.format === "pdf") {
      const moduleString = "";
      createPDF(
        {
          html: html,
          title: mainHeader,
          ...generateHeaderFooter(coursedata, moduleString),
        },
        path.join(savePath, filename + ".pdf")
      );
      createPDF(
        {
          html: html,
          title: mainHeader,
          ...generateHeaderFooter(coursedata, moduleString),
        },
        path.join(savePath, solutionFilename + ".pdf")
      );
    }
  }
}

// Formatters
/**
 * Formats a Markdown string into HTML
 * @param text String containing Markdown formatting
 * @returns HTML string
 */
function formatMarkdown(text: string): string {
  //Showdow
  return converter.makeHtml(text);
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
  let block = `<div class="code-background"><div class="code-inner-container"><pre><code class="hljs">`;
  block += hljs.highlight(code, { language: language }).value;
  block += `</code></pre></div></div>`;
  return block;
}

/**
 * Formats solution files
 * @param inputs FileInput object with assignment information, variation key and course path.
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
          file.fileName
        );
        const data = readFileSync(filePath, "utf8");
        block += `<h3>${parseUICodeMain("ex_solution")}: '${
          file.fileName
        }'</h3>`;
        block += highlightCode(
          data,
          set.assignmentArray[meta.assignmentIndex].codeLanguage
        );
      }
    }
    return block;
  } catch (err) {
    log.error(err.message);
    throw err;
  }
}

/**
 * Formats files that are not solution files. Will make titles based on file content type.
 * @param inputs FileInput object
 * @param type The type of file to format and make title for
 * @returns HTML string
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
    log.error(err.message);
    throw err;
  }
}

function formatMainHeader(set: FullAssignmentSetData, courseData: CourseData) {
  let title = ``;
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
  title += " " + parseUICodeMain("assignments");
  return title;
}

/**
 * Formats a title
 * @param inputs A BlockInputs object
 * @param toc A boolean whether the title is a table of contents title
 * @returns HTML string
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
    title += `(${
      meta.courseData.levels[set.assignmentArray[meta.assignmentIndex].level]
        .abbreviation
    })`;
  }
  return title;
}

// Block generators
/**
 * Generates the header and footer (for PDF files only)
 * @param courseData CourseData object with course information
 * @param moduleString String to use in the lower center with module information (if any)
 * @returns Object with header and footer HTML strings
 */
function generateHeaderFooter(
  courseData: CourseData,
  moduleString: string
): { header: string; footer: string } {
  const headerString = `<div style="margin-left: 1.5cm; margin-top: 0.6cm">
  <table id="header-table" style="width: 18cm">
    <tbody>
      <tr>
        <td
          id="header-course-title"
          style="
            border-color: #ffffff;
            font-size: 13px;
            text-align: left;
            vertical-align: top;
            width: 50%;
          "
        >
          ${courseData.id + " " + courseData.title}
        </td>
        <td
          id="header-page-number"
          style="
            border-color: #ffffff;
            font-size: 13px;
            text-align: right;
            vertical-align: top;
            width: 50%;
          "
        >
          ${parseUICodeMain(
            "page"
          )} <span class="pageNumber"></span><span> / </span
          ><span class="totalPages"></span>
        </td>
      </tr>
    </tbody>
  </table>
  <hr style="width: 100%; margin-top: 0.1cm" />
</div>`;
  const footerString = `<div style="margin-left: 1.5cm; margin-bottom: 0.6cm">
  <table id="footer-table" style="width: 18cm">
    <tbody>
      <tr>
        <td
          id="footer-version"
          style="
            border-color: #ffffff;
            font-size: 13px;
            text-align: left;
            vertical-align: top;
            width: 33%;
          "
        >
          Procasma v${version}<br />
        </td>
        <td
          id="footer-module-number"
          style="
            border-color: #ffffff;
            font-size: 13px;
            text-align: center;
            vertical-align: top;
            width: 34%;
          "
        >
        ${moduleString}<br />
        </td>
        <td id="footer-empty-space" style="width: 33%"></td>
      </tr>
    </tbody>
  </table>
</div>`;

  return { header: headerString, footer: footerString };
}

/**
 * Generates the starting instructions
 * @param moduleInput ModuleData object with module information
 * @returns HTML string
 */
function generateStart(moduleInput: ModuleData | null): string {
  if (!moduleInput) return "";

  let block = `<div>`;
  block += formatMarkdown(moduleInput.subjects);
  block += `<br />`;
  block += formatMarkdown(moduleInput.instructions);

  return block;
}

/**
 * Generates an assignment block
 * @param inputs BlockInputs object
 * @returns HTML string
 */
function generateBlock(
  meta: AssignmentInput,
  set: FullAssignmentSetData
): string {
  let block = `<div>
    `;
  // Title
  const title = `<h2 class="assig-title"><a id=${
    set.assignmentArray[meta.assignmentIndex].assignmentID
  }>${formatTitle(meta, set)}</a></h2>\n`;
  block += `${title}`;

  // Assignment level
  if (set.assignmentArray[meta.assignmentIndex].level != null) {
    block += `<i>${parseUICodeMain("ui_assignment_level")}: ${
      meta.courseData.levels[set.assignmentArray[meta.assignmentIndex].level]
        .fullName
    }`;
  }

  //Instructions
  block += `<p>`;
  block += formatMarkdown(
    formatMath(set.assignmentArray[meta.assignmentIndex].variation.instructions)
  );
  block += `</p>`;

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
  let block = `<div>
    `;
  block += `<h2>${parseUICodeMain("ex_run")} ${runNumber}</h2>`;
  if (runInput.cmdInputs) {
    block += highlightCode(runInput.cmdInputs.toString(), "plaintext");
  }
  const inputFormatter = (inputs: Array<string | number>) => {
    let str = ``;
    for (const value of inputs) {
      str += `${typeof value === "string" ? value : value.toString()}\n`;
    }
    return str;
  };

  if (runInput.inputs) {
    block += highlightCode(inputFormatter(runInput.inputs), "plaintext");
  }
  if (runInput.output) {
    block += highlightCode(runInput.output, "plaintext");
  }
  return block;
}

/**
 * Generates the table of contents
 * @param assignments An array of assignment objects
 * @param titleInputs An object with rest of the necessary data
 * @returns HTML string
 */
function generateToC(
  courseData: CourseData,
  set: FullAssignmentSetData
): string {
  let block = `<div>`;
  block += `<h2>${parseUICodeMain("toc")}</h2>\n`;
  for (const assig of set.assignmentArray) {
    block += `<h3><a href="#${assig.assignmentID}>${formatTitle(
      {
        assignmentIndex: set.assignmentArray.indexOf(assig),
        courseData: courseData,
      },
      set,
      true
    )}`;
    block += `</a></h3>`;
  }

  block += `</div>`;
  return block;
}

// Other helpers
/**
 * Saves the HTML string to disk.
 * @param html HTML string
 * @param savePath Where to save the file
 * @param filename Filename to save with
 */
function saveHTML(html: string, savePath: string, filename: string) {
  try {
    writeFileSync(path.join(savePath, filename), html, "utf-8");
  } catch (err) {
    log.error(err.message);
    throw err;
  }
}
