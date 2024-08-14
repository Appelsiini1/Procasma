import { ConverterOptions } from "showdown";

export const version = "0.9.1";
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
export const assignmentDataFolder = "assignment_data";
export const assignmentDataFolderCamel = "assignmentData";
export const emptySpaceHeight = "0.5cm";
export const markdownAssignmentLevel = "Tehtävän taso";
export const markdownExampleRun = "Esimerkkiajo";
export const markdownInput = "Syötteet";
export const markdownOutput = "Tuloste";
export const markdownCLIargument = "Komentoriviparametrit";
