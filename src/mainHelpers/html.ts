import showdown from "showdown";
import {
  CodeAssignmentData,
  CodeAssignmentSelectionData,
  CourseData,
  ExampleRunType,
  ExportSetAssignmentData,
  ExportSetData,
  FileData,
  FullAssignmentSetData,
  ModuleData,
  ProjectInput,
  SupportedModuleType,
  Variation,
} from "../types";
import { readFileSync } from "node:fs";
import path from "node:path";
import log from "electron-log/node";
import { parseUICodeMain } from "./language";
import {
  emptySpaceHeight,
  MathJaxCSS,
  MathJaxHTMLOptions,
  fileFolderSeparator,
  ShowdownOptions,
} from "../constants";
import { coursePath, globalSettings } from "../globalsMain";
import { getModulesDB } from "./databaseOperations";
import { createMainFunctionHandler } from "./ipcHelpers";
import {
  copyExportFilesFS,
  copyExportProjectFilesFS,
  getBase64String,
  handleReadFileFS,
  saveSetModuleFS,
  setUsedIn,
} from "./fileOperations";
import { css as papercolorLight } from "../../resource/cssImports/papercolor-light";
import { platform } from "node:process";
import { genericModule } from "../defaultObjects";
import { highlightCode, parseLanguage } from "./highlighters";
import juice from "juice";

const converter = new showdown.Converter(ShowdownOptions);

const regexParentheses = /(?<=\\\().+?(?=\\\))/gs;
const regexBrackets = /(?<=\\\[).+?(?=\\\])/gs;
const regexImage = /(?<![\\`])!\[.*?\]\((\S*?)(?:\s*".*?")?(?:\s*=.*?)?\)/gm;

interface AssignmentInput {
  assignmentIndex: number;
  courseData: CourseData;
}

function sortAssignments(
  a: CodeAssignmentSelectionData,
  b: CodeAssignmentSelectionData
) {
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
}

// Set converter
export function setToFullData(set: ExportSetData): FullAssignmentSetData {
  try {
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
        extraCredit: fullData.extraCredit,
      };
      assignmentArray.push(newAssignment);
    }
    assignmentArray.sort((a, b) => sortAssignments(a, b));
    const newSet: FullAssignmentSetData = {
      assignmentArray: assignmentArray,
      ...set,
    };
    return newSet;
  } catch (err) {
    log.error("Error in setToFullData:", err.message);
    throw err;
  }
}

export function assignmentToFullData(
  assignments: ExportSetAssignmentData[]
): CodeAssignmentSelectionData[] {
  return assignments.map((assignment) => {
    const assignmentPath = path.join(
      coursePath.path,
      assignment.folder,
      assignment.id + ".json"
    );
    const fullData = handleReadFileFS(assignmentPath) as CodeAssignmentData;
    return {
      variation: fullData.variations[assignment.variationId],
      variatioId: assignment.variationId,
      CGid: assignment.CGid,
      selectedPosition: assignment.selectedPosition,
      selectedModule: assignment.selectedModule,
      assignmentID: fullData.assignmentID,
      level: fullData.level,
      folder: fullData.folder,
      codeLanguage: fullData.codeLanguage,
      title: fullData.title,
      extraCredit: fullData.extraCredit,
    };
  });
}

// Set exporters
/**
 * Exports multiple assignment sets
 * @param setInput Array of ExportSetData objects
 * @param courseData A CourseData object with course information
 * @param savePath Path where to save the created file(s)
 */
export async function exportManySetsFS(
  setInput: Array<ExportSetData>,
  courseData: CourseData,
  savePath: string
) {
  let result;
  for (const expSet of setInput) {
    result = await exportSetFS(expSet, courseData, savePath);
  }
  return result;
}

/**
 * Creates HTML strings from assignment sets and saves them to disk according to the format spesified in set data
 * @param setInput ExportSetData with set information
 * @param coursedata A CourseData object with course information
 * @param savePath Path where to save the created file(s).
 */
export async function exportSetFS(
  setInput: ExportSetData,
  coursedata: CourseData,
  savePath: string
): Promise<String> {
  try {
    const convertedSet = setToFullData(setInput);

    // get all course modules
    const selectedModules = setInput.assignments.map((a) => a.selectedModule);
    const uniqueModules = [...new Set(selectedModules)];

    const modulesResult = await createMainFunctionHandler(() =>
      getModulesDB(coursePath.path, uniqueModules)
    );
    if (modulesResult.errorMessage) {
      throw new Error(modulesResult.errorMessage);
    }
    const modules: ModuleData[] = modulesResult.content;

    // convert assignments to full
    const fullAssignments = assignmentToFullData(setInput.assignments);

    if (fullAssignments[0].selectedModule === -3) {
      modules.push({ ...genericModule, name: parseUICodeMain("assignments") });
    }

    // loop through modules
    await Promise.all(
      modules.map(async (module) => {
        // get assignments where selectedModule is correct
        const moduleAssignments = fullAssignments
          .filter((a) => a.selectedModule === module.id)
          .sort((a, b) => sortAssignments(a, b));

        let moduleString = "";
        const css = papercolorLight;

        const mainHeader =
          convertedSet?.visibleHeader === "" || !convertedSet?.visibleHeader
            ? formatMainHeader(module.id, coursedata.moduleType)
            : convertedSet.visibleHeader;

        // HTML Base
        let html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="script-src 'none'" />
    <title>${mainHeader}</title>
    <style>${css}</style>
  </head>
  <body>`;
        let solutionHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Security-Policy" content="script-src 'none'" />
    <meta charset="utf-8" />
    <title>${mainHeader} ${parseUICodeMain("answers").toUpperCase()}</title>
    <style>${css}</style>
  </head>
  <body>`;

        // Main page header
        html += `<h1>${mainHeader}</h1>`;
        solutionHtml += `<h1>${mainHeader} ${parseUICodeMain(
          "answers"
        ).toUpperCase()}</h1>`;

        // Starting instructions
        const startingInstructions = generateStart(
          module.subjects,
          module.instructions
        );
        html += startingInstructions;
        solutionHtml += startingInstructions;

        // Module string for PDF footer
        switch (coursedata.moduleType) {
          case "lecture":
            moduleString +=
              parseUICodeMain("ui_lecture") + ` ${module.id.toString()}`;
            break;
          case "module":
            moduleString +=
              parseUICodeMain("ui_module") + ` ${module.id.toString()}`;
            break;
          case "week":
            moduleString +=
              parseUICodeMain("ui_week") + ` ${module.id.toString()}`;
            break;
          default:
            break;
        }

        // Table of contents
        const toc = generateToC(coursedata, moduleAssignments);
        html += toc;
        solutionHtml += toc;

        // loop through assignments
        moduleAssignments.sort(
          (a, b) => a.selectedPosition - b.selectedPosition
        );
        moduleAssignments.forEach((assignment, index) => {
          // Assignments
          const meta = { assignmentIndex: index, courseData: coursedata };
          html += generateBlock(
            meta,
            assignment,
            assignment.variation,
            assignment.variatioId,
            false,
            false
          );
          solutionHtml += generateBlock(
            meta,
            assignment,
            assignment.variation,
            assignment.variatioId,
            false,
            true
          );
          const assignmentToFormat =
            convertedSet.assignmentArray[meta.assignmentIndex];
          solutionHtml += formatSolutions(
            assignmentToFormat,
            assignment.variation.files,
            assignment.variatioId
          );
        });

        // End body
        html += `</body>
</html>`;
        solutionHtml += `</body>
</html>`;
        log.info("HTML created.");

        const inlineHTML = juice(html);
        const inlineSolutionHTML = juice(solutionHtml);

        await saveSetModuleFS(
          inlineHTML,
          inlineSolutionHTML,
          mainHeader,
          convertedSet.format,
          coursedata,
          savePath,
          convertedSet.replaceExisting,
          moduleString
        );
        const filename = mainHeader.replace(" ", "");

        const filesPath = path.join(savePath, filename);
        copyExportFilesFS(moduleAssignments, filesPath);

        for (const setAssignment of convertedSet.assignmentArray) {
          const filePath = path.join(
            coursePath.path,
            setAssignment.folder,
            setAssignment.assignmentID + ".json"
          );
          setUsedIn(
            filePath,
            setAssignment.variatioId,
            `${convertedSet.year}/${convertedSet.period}`
          );
        }
      })
    );
  } catch (err) {
    log.error("Error in exportSetFS():", err.message);
    throw new Error("ui_export_error");
  }
  return "ui_export_success";
}

/**
 * Creates HTML strings from a project assignment and saves them to disk according to the format specified
 * @param projectInput CodeAssignmentData project
 * @param coursedata A CourseData object with course information
 * @param savePath Path where to save the created file(s).
 */
export async function exportProjectFS(
  projectInput: ProjectInput,
  coursedata: CourseData,
  savePath: string,
  replaceExisting: boolean
): Promise<string> {
  const splitLevels = true;
  let html = "";
  let solutionHtml = "";

  async function _exportProjectLevelFS(levelID: string, isLastLevel: boolean) {
    let moduleString = "";
    const css = papercolorLight;

    const mainHeader = formatMainHeaderProject(levelID);

    if (splitLevels || html.length === 0) {
      // HTML Base
      html = `<!DOCTYPE html>
 <html>
   <head>
     <meta charset="utf-8" />
     <title>${mainHeader}</title>
     <style>${css}</style>
   </head>
   <body>`;
      solutionHtml = `<!DOCTYPE html>
 <html>
   <head>
     <meta charset="utf-8" />
     <title>${mainHeader} ${parseUICodeMain("answers").toUpperCase()}</title>
     <style>${css}</style>
   </head>
   <body>`;
    }

    // Main page header
    html += `<h1>${mainHeader}</h1>`;
    solutionHtml += `<h1>${mainHeader} ${parseUICodeMain(
      "answers"
    ).toUpperCase()}</h1>`;

    moduleString += parseUICodeMain("ui_finalWork");

    // Assignments
    const meta = { assignmentIndex: 0, courseData: coursedata };
    const normalblock = generateBlock(
      meta,
      projectInput as unknown as CodeAssignmentSelectionData,
      projectInput.variations[levelID],
      levelID,
      true,
      false
    );
    const solutionblock = generateBlock(
      meta,
      projectInput as unknown as CodeAssignmentSelectionData,
      projectInput.variations[levelID],
      levelID,
      true,
      true
    );

    // Table of contents
    // Adds anchor tags to the ToC based on the generated block
    const toc = generateToCProject(normalblock);
    html += toc;
    const solutionToc = generateToCProject(solutionblock);
    solutionHtml += solutionToc;

    html += normalblock;
    solutionHtml += solutionblock;
    solutionHtml += formatSolutions(
      projectInput as unknown as CodeAssignmentSelectionData,
      projectInput.variations[levelID].files,
      levelID
    );

    let fileNameLevel =
      projectInput.variations[levelID].levelName ??
      "_" + parseUICodeMain("ui_level") + "_" + levelID;

    if (!splitLevels) {
      fileNameLevel = parseUICodeMain("all");
    }

    let fileName = parseUICodeMain("assignment_description") + fileNameLevel;
    if (splitLevels || isLastLevel) {
      // End body
      html += `</body>
    </html>`;
      solutionHtml += `</body>
    </html>`;
      log.info("HTML created.");
      const inlineHTML = juice(html);
      const inlineSolutionHTML = juice(solutionHtml);

      await saveSetModuleFS(
        inlineHTML,
        inlineSolutionHTML,
        fileName,
        projectInput.format,
        coursedata,
        savePath,
        replaceExisting,
        moduleString
      );
      fileName = fileName.replace(" ", "");

      const filesPath = path.join(savePath, fileName);
      copyExportProjectFilesFS(projectInput, filesPath, levelID);

      // TODO refactor setUsedIn for the case of a project
      /*for (const setAssignment of convertedSet.assignmentArray) {
          const filePath = path.join(
            coursePath.path,
            setAssignment.folder,
            setAssignment.assignmentID + ".json"
          );
          setUsedIn(
            filePath,
            setAssignment.variatioId,
            `${convertedSet.year}/${convertedSet.period}`
          );
        }*/
    }
  }

  try {
    // loop through levels individually
    // TODO levels combined export
    const levelKeys = Object.keys(projectInput.variations);
    await Promise.all(
      levelKeys.map((levelID, index) => {
        let isLastLevel = index === levelKeys.length - 1;

        // isLastLevel should only be true on the last iteration,
        // if the levels are to be split
        if (splitLevels) {
          isLastLevel = false;
        }
        _exportProjectLevelFS(levelID, isLastLevel);
      })
    );
  } catch (err) {
    log.error("Error in exportSetFS():", err.message);
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
 * Turns images into Base64 strings for embedding
 * @param text The text to search images from
 * @param files Array of filedata
 * @returns HTML string
 */
function formatImage(text: string, files: Array<FileData>): string {
  let newText = text;
  let matched: RegExpExecArray;
  while ((matched = regexImage.exec(text)) !== null) {
    const imageName = matched[1];
    const fullMatch = matched[0];

    const fileObject = files.find((value) => {
      if (platform === "win32") {
        if (path.win32.basename(value.fileName) === imageName) {
          return true;
        }
      } else {
        if (path.basename(value.fileName) === imageName) {
          return true;
        }
      }
      return false;
    });

    if (fileObject === undefined) continue;

    const imageData = getBase64String(
      path.join(coursePath.path, fileObject.path)
    );
    const newMatch = fullMatch.replace(imageName, imageData);
    newText = newText.replace(fullMatch, newMatch);
  }
  return newText;
}

/**
 * Formats a string containing MathML or LaTeX mathematical formulas into SVG images
 * @param text String containing MML or LaTeX formatting
 * @returns HTML string
 */
function formatMath(text: string): string {
  const { mathjax } = require("mathjax-full/js/mathjax.js");
  const { TeX } = require("mathjax-full/js/input/tex.js");
  const { SVG } = require("mathjax-full/js/output/svg.js");
  const { liteAdaptor } = require("mathjax-full/js/adaptors/liteAdaptor.js");
  const { RegisterHTMLHandler } = require("mathjax-full/js/handlers/html.js");
  const { AllPackages } = require("mathjax-full/js/input/tex/AllPackages.js");
  //Depends on MathJax
  const adaptor = liteAdaptor();
  const handler = RegisterHTMLHandler(adaptor);

  //
  //  Create input and output jax and a document using them on the content from the HTML file
  //
  const tex = new TeX({
    packages: AllPackages.sort()
      .join(", ")
      .split(/\s*,\s*/),
  });
  const svg = new SVG({
    fontCache: "local",
    scale: 2,
    minScale: 2,
    exFactor: 2,
  });
  // const chtml = new CHTML({
  //   fontURL: "[mathjax]/components/output/chtml/fonts/woff-v2",
  // });
  const html = mathjax.document("", { InputJax: tex, OutputJax: svg });

  //  Typeset the math from the command line
  //
  let matched: RegExpExecArray;
  let finalStr = text;
  let finalHtml: string;
  while ((matched = regexParentheses.exec(text)) !== null) {
    const node = html.convert(`${matched[0]}` || "", MathJaxHTMLOptions);
    finalHtml = adaptor
      .innerHTML(node)
      .replace(/<defs>/, `<defs><style>${MathJaxCSS}</style>`);
    finalStr = finalStr.replace(`\\(${matched[0]}\\)`, finalHtml);
  }
  while ((matched = regexBrackets.exec(text)) !== null) {
    const node = html.convert(`${matched[0]}` || "", MathJaxHTMLOptions);
    finalHtml = adaptor
      .innerHTML(node)
      .replace(/<defs>/, `<defs><style>${MathJaxCSS}</style>`);
    finalStr = finalStr.replace(`\\[${matched[0]}\\]`, finalHtml);
  }
  // log.debug(finalStr);

  return finalStr;
}

/**
 * Formats solution files
 * @param assignment
 * @returns HTML string
 */
function formatSolutions(
  assignment: CodeAssignmentSelectionData,
  files: FileData[],
  variationId: string
): string {
  try {
    let block = ``;
    for (const file of files) {
      if (file.solution && file.fileContent === "code") {
        const filePath = path.join(
          coursePath.path,
          assignment.folder,
          variationId,
          file.fileName
        );
        const data = readFileSync(filePath, "utf8");
        block += `<div style="margin-top: 1cm;"></div>`;
        block += `<h2>${parseUICodeMain("ex_solution")}: '${
          file.fileName
        }'</h2>`;
        block += highlightCode(data, assignment.codeLanguage);
      }
    }
    return block;
  } catch (err) {
    log.error("Error in solution formatter: " + err.message);
    throw err;
  }
}

/**
 * Shortens the filedata to the spesified length if the length is long enough.
 * @param data File data as string
 * @param language Highlight language
 * @returns Formatted file contents
 */
function shortenFileData(data: string, language: string) {
  let block = "";
  if (
    data.split("\n").length > globalSettings.fileMaxLinesDisplay &&
    globalSettings.shortenFiles
  ) {
    const splitLines = data.split("\n");
    const half = globalSettings.fileMaxLinesDisplay / 2;
    const firstHalf = splitLines.slice(0, half);
    const secondHalf = splitLines.slice(-(half + 1));

    const newData = `${firstHalf.join("\n")}\n...\n${secondHalf.join("\n")}`;

    block += `<p style="color: red; font-style: italic;">${parseUICodeMain(
      "file_shortened"
    )}</p>`;
    block += highlightCode(newData, language);
  } else {
    block += highlightCode(data, language);
  }
  return block;
}

/**
 * Formats files that are not solution files. Will make titles based on file content type.
 * @param assignment
 * @param type Type of file to make title for
 * @returns
 */
function formatFiles(
  assignment: CodeAssignmentSelectionData,
  type: FileData["fileContent"],
  variationID: string,
  files: FileData[],
  includeAnswer: boolean,
  addAnchor?: boolean
): string {
  try {
    let block = ``;
    for (const file of files) {
      if (
        !file.solution &&
        (file.showStudent === true || includeAnswer === true) &&
        (file.fileType === "code" || file.fileType === "text") &&
        file.fileContent === type
      ) {
        // check if the file is in a subdirectory
        const baseName = path.basename(file.fileName);
        const dirName = path.basename(path.dirname(file.fileName));

        let newName = file.fileName;
        // check if file.fileName has a directory before the file.
        if (baseName !== file.fileName) {
          newName = `${dirName}${fileFolderSeparator}${baseName}`;
        }
        const filePath = path.join(
          coursePath.path,
          assignment.folder,
          variationID,
          newName
        );
        const data = readFileSync(filePath, "utf8");
        let header;
        if (type === "data") {
          header = parseUICodeMain("input_datafile");
        } else if (type === "result") {
          header = parseUICodeMain("ex_resultfile");
        } else if (type === "code") {
          header = parseUICodeMain("ui_codefile");
        } else {
          header = parseUICodeMain("file");
        }
        if (addAnchor) {
          block += `<h3><a id="${file.fileName}">${header}: '${file.fileName}'</a></h3>`;
        } else {
          block += `<h3>${header}: '${file.fileName}'</h3>`;
        }
        const fileLanguage = parseLanguage(filePath, assignment.codeLanguage);
        const language =
          file.fileContent === "code" ? fileLanguage : "plaintext";
        //log.debug(globalSettings);
        if (file.fileContent !== "code" || globalSettings.shortenCode) {
          block += shortenFileData(data, language);
        } else {
          block += highlightCode(data, language);
        }
      } else if (
        !file.solution &&
        (file.showStudent === true || includeAnswer === true) &&
        file.fileType === "image" &&
        file.fileContent === type
      ) {
        // check if the file is in a subdirectory
        const baseName = path.basename(file.fileName);
        const dirName = path.basename(path.dirname(file.fileName));

        let newName = file.fileName;
        // check if file.fileName has a directory before the file.
        if (baseName !== file.fileName) {
          newName = `${dirName}${fileFolderSeparator}${baseName}`;
        }
        const filePath = path.join(
          coursePath.path,
          assignment.folder,
          variationID,
          newName
        );
        const data = getBase64String(filePath);
        block += `<h3>${parseUICodeMain(
          type === "data" ? "input_datafile" : "ex_resultfile"
        )}: '${file.fileName}'</h3>`;

        block += `<img src="${data}" alt="${file.fileName}" />`;
      }
    }
    //log.debug(block);
    return block;
  } catch (err) {
    log.error("Error in file formatter: " + err.message);
    throw err;
  }
}

/**
 * Generates a main page header. If the set has no module, will not add a module letter or number to it.
 * @param module Module number
 * @param moduleType The type of module
 * @returns The title string.
 */
function formatMainHeader(module: number, moduleType: SupportedModuleType) {
  let title = ``;
  if (module != null) {
    const addToTitle = (ui_code: string) => {
      title += parseUICodeMain(ui_code);
      title += module.toString();
    };
    switch (moduleType) {
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
 * Generates a main page header for a project.
 * @param level The project level.
 * @returns The title string.
 */
function formatMainHeaderProject(level: string) {
  let title = ``;
  const addToTitle = (ui_code: string) => {
    title += parseUICodeMain(ui_code);
  };
  switch (level) {
    case "1":
      addToTitle("project_minimum_level_assignment_description");
      break;
    case "2":
      addToTitle("project_basic_level_assignment_description");
      break;
    case "3":
      addToTitle("project_target_level_assignment_description");
      break;
    default:
      addToTitle("project_assignment_description");
      break;
  }
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
  assignment: CodeAssignmentSelectionData,
  toc = false
) {
  let title = ``;
  const addToTitle = (ui_code: string) => {
    title += parseUICodeMain(ui_code);
    title += assignment.selectedModule.toString();
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
    assignment.selectedPosition.toString() +
    ": ";
  title += assignment.title;

  // if table of contents, add level abbreviation to the end of title
  if (toc && assignment.level != null) {
    title += ` (${meta.courseData.levels[assignment.level].abbreviation})`;
  }

  if (assignment.extraCredit) {
    title += " (*)";
  }
  return title;
}

// Block generators
/**
 * Generates the starting instructions
 * @param subjects
 * @param instructions
 * @returns HTML string
 */
function generateStart(subjects: string, instructions: string): string {
  if (!subjects || !instructions) return "";

  let block = `<div>`;
  const splitSubjects = subjects.split("\n").map((value, index) => {
    return `<li id="${index}">${formatMarkdown(value)
      .replaceAll("<p>", "")
      .replaceAll("</p>", "")}</li>`;
  });
  block += '<ul class="start">';
  for (const item of splitSubjects) {
    block += item;
  }
  block += "</ul>";
  block += formatMarkdown(instructions);
  block += `<div style="height: ${emptySpaceHeight};"></div>`;
  block += "</div>";
  return block;
}

function addAnchorTagsToHeadings(html: string): string {
  let newHtml = html;

  // Function to process each heading (h2 or h3)
  const addAnchorToHeading = (
    match: string,
    tag: string,
    attributes: string,
    titleText: string
  ) => {
    const sanitizedTitle = titleText.trim().replace(/\s+/g, "-"); // Convert spaces to dashes for valid ids
    return `<${tag}${attributes}><a id="${sanitizedTitle}">${titleText}</a></${tag}>`;
  };

  // Replace all h2 and h3 tags with arbitrary attributes inside
  newHtml = newHtml.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/g, addAnchorToHeading);

  return newHtml;
}

/**
 * Generates an assignment block
 * @param meta Course data and assignment index
 * @param assignment The assignment
 * @param includeAnswer Boolean whether to include blocks not shown to students
 * @returns HTML string
 */
function generateBlock(
  meta: AssignmentInput,
  assignment: CodeAssignmentSelectionData,
  variation: Variation,
  variationID: string,
  isProject: boolean = false,
  includeAnswer: boolean
): string {
  let block = `<div>
    `;

  if (!isProject) {
    // Title
    const title = `<h2 class="assig-title"><a id="${
      assignment.assignmentID
    }">${formatTitle(meta, assignment)}</a></h2>\n`;
    block += `${title}`;

    // Assignment level
    if (assignment.level != null) {
      block += `<i>${parseUICodeMain("ui_assignment_level")}: ${
        meta.courseData.levels[assignment.level].fullName
      }</i>`;
    }
  }

  if (assignment?.extraCredit) {
    block += `<p style="color: red; font-style: italic;"><b>${parseUICodeMain(
      "extracredit_long"
    )}</b></p>`;
  }

  //Instructions
  // block += `<p>`;
  block += formatMarkdown(
    formatMath(formatImage(variation.instructions, variation.files))
  );

  if (isProject) {
    block = addAnchorTagsToHeadings(block);
  }

  // block += `</p>`;

  // Datafiles
  block += formatFiles(
    assignment,
    "data",
    variationID,
    variation.files,
    isProject,
    includeAnswer
  );

  // Example runs
  const exampleRuns = variation.exampleRuns;
  let runNumber = 1;
  for (const run in exampleRuns) {
    block += generateExampleRun(exampleRuns[run], runNumber, isProject);
    runNumber += 1;
  }

  // Result files
  block += formatFiles(
    assignment,
    "result",
    variationID,
    variation.files,
    includeAnswer,
    isProject
  );
  block += formatFiles(
    assignment,
    "code",
    variationID,
    variation.files,
    includeAnswer,
    isProject
  );
  block += formatFiles(
    assignment,
    "other",
    variationID,
    variation.files,
    includeAnswer,
    isProject
  );
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
  runNumber: number,
  addAnchor?: boolean
): string {
  let block = "";
  const titleText = `${parseUICodeMain("ex_run")} ${runNumber}`;

  if (addAnchor) {
    block += `<h2><a id="${titleText}">${titleText}</a></h2>`;
  } else {
    block += `<h2>${titleText}</h2>`;
  }

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
  assignments: CodeAssignmentSelectionData[]
): string {
  let hasExtraCredit = false;
  try {
    let block = `<h2>${parseUICodeMain("toc")}</h2>\n`;
    assignments.forEach((assignment, index) => {
      block += `<h3><a class="toc" href="#${
        assignment.assignmentID
      }">${formatTitle(
        {
          assignmentIndex: index,
          courseData: courseData,
        },
        assignment,
        true
      )}`;
      block += `</a></h3>`;
      if (assignment.extraCredit) hasExtraCredit = true;
    });

    if (hasExtraCredit) {
      block += `<h4><i>${parseUICodeMain("extracredit_toc")}</i></h4>`;
    }
    return block;
  } catch (err) {
    log.error("Error in generateTOC: " + err.message);
    throw err;
  }
}

function getAnchorTagIdsAndText(html: string): { id: string; text: string }[] {
  // Regular expression to match <a> tags, capturing the id attribute and inner text
  const anchorTagRegex = /<a[^>]*\sid=["']([^"']+)["'][^>]*>(.*?)<\/a>/g;
  const result: { id: string; text: string }[] = [];
  let match;

  while ((match = anchorTagRegex.exec(html)) !== null) {
    result.push({
      id: match[1],
      text: match[2].trim(),
    });
  }

  return result;
}

/**
 * Generates the table of contents
 * @param courseData Course data
 * @param set Set data
 * @returns HTML string
 */
function generateToCProject(html: string): string {
  try {
    // parse through html to find and extract anchor tags to list
    const anchorIdsAndTexts = getAnchorTagIdsAndText(html);

    let block = `<h2>${parseUICodeMain("toc")}</h2>\n`;
    anchorIdsAndTexts.forEach((anchorIdAndText) => {
      block += `<h3><a class="toc" href="#${anchorIdAndText.id}">${anchorIdAndText.text}`;
      block += `</a></h3>`;
    });

    return block;
  } catch (err) {
    log.error("Error in generateToCProject: " + err.message);
    throw err;
  }
}
