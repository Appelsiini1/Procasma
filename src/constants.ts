import { ConverterOptions } from "showdown";
import { LevelsType } from "./types";

export const version = "0.14.0";
export const courseMetaDataFileName = "course_info.json";
export const DEVMODE = true;
export const textExtensions = ["txt", "md"];
export const dataExtensions = ["csv", "yml", "yaml", "log"];
export const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
export const codeExtensions = [
  "js",
  "ts",
  "py",
  "cpp",
  "c",
  "cs",
  "html",
  "css",
  "json",
];
export const COURSE_PERIODS = 4;
export const PDFMargins = {
  bottom: "2.1cm",
  top: "2.1cm",
  left: "1.5cm",
  right: "1.5cm",
};
export const PDFFormat = "A4";
export const ShowdownOptions: ConverterOptions = {
  excludeTrailingPunctuationFromURLs: true,
  headerLevelStart: 2,
  omitExtraWLInCodeBlocks: true,
  parseImgDimensions: true,
  simpleLineBreaks: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  splitAdjacentBlockquotes: true,
  tables: true,
  tablesHeaderId: true,
  tasklists: true,
};
export const assignmentDataFolder = "assignmentData";
export const emptySpaceHeight = "0.5cm";
export const markdownAssignmentLevel = "Tehtävän taso";
export const markdownExampleRun = "Esimerkkiajo";
export const markdownInput = "Syötteet";
export const markdownOutput = "Tuloste";
export const markdownCLIargument = "Komentoriviparametrit";
export const levelsTEMPORARY: LevelsType = {
  "1": { fullName: "Minimitaso", abbreviation: "M" },
  "2": { fullName: "Perustaso", abbreviation: "P" },
  "3": { fullName: "Tavoitetaso", abbreviation: "T" },
};
export const fileFolderSeparator = "-";
export const defaultCSS = ["papercolor-light.css"];
export const MathJaxCSS = [
  "svg a{fill:blue;stroke:blue;}",
  '[data-mml-node="merror"]>g{fill:red;stroke:red}',
  '[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
  "[data-frame],[data-line]{stroke-width:70px;fill:none}",
  ".mjx-dashed{stroke-dasharray:140}",
  ".mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}",
  "use[data-c]{stroke-width:2px}",
].join("");
export const MathJaxHTMLOptions = {
  display: true,
  em: 17,
  ex: 9,
  containerWidth: 90 * 20,
};
