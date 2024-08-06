import showdown from "showdown";
import {
  CodeAssignmentData,
  CourseData,
  ExampleRunType,
  FileData,
  ModuleData,
  SetData,
  SupportedModuleType,
} from "../types";
import { writeFileSync } from "fs";
import path from "path";
import log from "electron-log/node";
import { parseUICode } from "./language";
import { version, ShowdownOptions } from "../constants";
import hljs from "highlight.js/lib/common";
import fs from "fs";

const converter = new showdown.Converter(ShowdownOptions);

interface TitleInputs {
  moduleType: SupportedModuleType;
  moduleNumber: number;
  assignmentNumber: number;
}

interface BlockInputs extends TitleInputs {
  assignmentInput: CodeAssignmentData;
  variationKey?: string;
  courseData?: CourseData;
}

interface FileInput {
  assignmentInput: CodeAssignmentData;
  variationKey: string;
  coursePath: string;
}

// Module creators
/**
 * Creates multiple HTML sets and returns an array of HTML strings.
 * @param setInput A SetData object with set information
 * @param coursedata A CourseData object with course information
 * @param savePath Path where to save the created file.
 */
function createMultiple(
  setInput: Array<SetData>,
  courseData: CourseData,
  savePath: string
) {}

/**
 * Creates one HTML string from an assignment set
 * @param setInput A SetData object with set information
 * @param coursedata A CourseData object with course information
 * @param savePath Path where to save the created file.
 */
function createOne(
  setInput: SetData,
  coursedata: CourseData,
  savePath: string
) {}

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
function formatSolutions(inputs: FileInput): string {
  try {
    let block = ``;
    const files = inputs.assignmentInput.variations[inputs.variationKey].files;
    for (const file of files) {
      if (file.solution && file.fileContent === "code") {
        const filePath = path.join(
          inputs.coursePath,
          inputs.assignmentInput.folder,
          file.fileName
        );
        const data = fs.readFileSync(filePath, "utf8");
        block += `<h3>${parseUICode("ex_solution")}: '${file.fileName}'</h3>`;
        block += highlightCode(data, inputs.assignmentInput.codeLanguage);
      }
    }
    return block;
  } catch (err) {
    log.error(err.message);
    throw err;
  }
}

function formatFiles(inputs: FileInput) {}

/**
 * Formats a title
 * @param inputs A BlockInputs object
 * @param toc A boolean whether the title is a table of contents title
 * @returns HTML string
 */
function formatTitle(inputs: BlockInputs, toc = false) {
  let title = ``;
  const addToTitle = (ui_code: string) => {
    title += parseUICode(ui_code);
    title += inputs.moduleNumber.toString();
  };
  switch (inputs.moduleType) {
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
    parseUICode("assignment_letter") +
    inputs.assignmentNumber.toString() +
    ": ";
  title += inputs.assignmentInput.title;

  // if table of contents, add level abbreviation to the end of title
  if (toc && inputs.assignmentInput.level != null) {
    title += `(${
      inputs.courseData.levels[inputs.assignmentInput.level].abbreviation
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
          ${parseUICode("page")} <span class="pageNumber"></span><span> / </span
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
function generateBlock(inputs: BlockInputs): string {
  let block = `<div>
    `;
  // Title
  const title = `<h2 class="assig-title"><a id=${
    inputs.assignmentInput.assignmentID
  }>${formatTitle(inputs)}</a></h2>\n`;
  block += `${title}`;

  // Assignment level
  if (inputs.assignmentInput.level != null) {
    block += `<i>${parseUICode("ui_assignment_level")}: ${
      inputs.courseData.levels[inputs.assignmentInput.level].fullName
    }`;
  }

  //Instructions
  block += `<p>`;
  block += formatMarkdown(
    formatMath(
      inputs.assignmentInput.variations[inputs.variationKey].instructions
    )
  );
  block += `</p>`;

  // Example runs
  const exampleRuns =
    inputs.assignmentInput.variations[inputs.variationKey].exampleRuns;
  let runNumber = 1;
  for (const run in exampleRuns) {
    block += generateExampleRun(exampleRuns[run], runNumber);
    runNumber += 1;
  }

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
  block += `<h2>${parseUICode("ex_run")} ${runNumber}</h2>`;
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
  assignments: Array<CodeAssignmentData>,
  titleInputs: TitleInputs
): string {
  let block = `<div>`;
  block += `<h2>${parseUICode("toc")}</h2>\n`;
  for (const assig of assignments) {
    block += `<h3><a href="#${assig.assignmentID}>${formatTitle(
      {
        assignmentInput: assig,
        ...titleInputs,
      },
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
