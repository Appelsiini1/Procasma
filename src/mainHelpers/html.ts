import showdown from "showdown";
import {
  CodeAssignmentData,
  CourseData,
  ExampleRunType,
  ModuleData,
  SetData,
  SupportedModuleType,
} from "../types";
import { writeFileSync } from "fs";
import path from "path";
import log from "electron-log/node";
import { parseUICode } from "./language";
import { version } from "../constants";
import hljs from "highlight.js/lib/common";

interface TitleInputs {
  moduleType: SupportedModuleType;
  moduleNumber: number;
  assignmentNumber: number;
}

interface BlockInputs extends TitleInputs {
  assignmentInput: CodeAssignmentData;
  variationKey?: string;
}

function createMultiple(
  setInput: Array<SetData>,
  courseData: CourseData,
  savePath: string
) {}

function createOne(
  setInput: SetData,
  coursedata: CourseData,
  savePath: string
) {}

function formatMarkdown(text: string): string {
  //Showdown
  return "";
}

function formatMath(text: string): string {
  //Depends on MathJax
  return text;
}

function highlightCode(code: string, language: string): string {
  let block = `<div class="code-background"><div class="code-inner-container"><pre><code class="hljs">`;
  block += hljs.highlight(code, { language: language }).value;
  block += `</code></pre></div></div>`;
  return block;
}

function saveHTML(html: string, savePath: string, filename: string) {
  try {
    writeFileSync(path.join(savePath, filename), html, "utf-8");
  } catch (err) {
    log.error(err.message);
    throw err;
  }
}

function createHeaderFooter(
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

function createStart(moduleInput: ModuleData | null): string {
  if (!moduleInput) return "";

  let block = `<div>`;
  block += formatMarkdown(moduleInput.subjects);
  block += `<br />`;
  block += formatMarkdown(moduleInput.instructions);

  return block;
}

function formatTitle(inputs: BlockInputs) {
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
  return title;
}

function block_gen(inputs: BlockInputs): string {
  let block = `<div>
    `;
  const title = `<h2><a id=${inputs.assignmentInput.assignmentID}>${formatTitle(
    inputs
  )}</a></h2>\n`;
  block += `${title}`;

  block += formatMarkdown(
    formatMath(
      inputs.assignmentInput.variations[inputs.variationKey].instructions
    )
  );

  block += `</div>`;
  return block;
}

function generateExampleRun(
  runInput: ExampleRunType,
  runNumber: number
): string {
  let block = `<div>
    `;

  return block;
}

function generateToC(
  assignments: Array<CodeAssignmentData>,
  titleInputs: TitleInputs
): string {
  let block = `<div>`;
  block += `<h2>${parseUICode("toc")}</h2>\n`;
  for (const assig of assignments) {
    block += `<h3><a href="#${assig.assignmentID}>${formatTitle({
      assignmentInput: assig,
      ...titleInputs,
    })}`;
    block += `</a></h3>`;
  }

  block += `</div>`;
  return block;
}
