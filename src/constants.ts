import { ConverterOptions } from "showdown";
import { version as packageVersion } from "../package.json";
import { devmode } from "./DEVMODE.json";
import { join } from "node:path";

export const version = packageVersion;
export const courseMetaDataFileName = "course_info.json";
export const DEVMODE = devmode;
export const PDFMargins = {
  bottom: 0.8267716535, // 2.1 cm in inches
  top: 0.8267716535,
  left: 0.5905511811, // 1.5 cm in inches
  right: 0.5905511811,
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
export const StorageKey = process.env.STORAGE_KEY;
export const codegradeAPIEndpointV1 = "https://app.codegra.de/api/v1";
export const workerWindowPreferences = {
  webPreferences: {
    contextIsolation: true,
    spellcheck: false,
    preload: join(__dirname, "preload.js"),
  },
  show: false,
};
