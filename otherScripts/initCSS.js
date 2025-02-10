//@ts-check

import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "fs";
import { extname, join, basename } from "path";

const folderPath = "./resource/css";
const outFolder = "./resource/cssImports";
const commentRegex = /\/\*[\s\S]*?\*\//gm;

function folderContents() {
  const filesRaw = readdirSync(folderPath);
  const filesFiltered = [];
  filesRaw.forEach((value) => {
    if (extname(value) == ".css") {
      filesFiltered.push(value);
    }
  });
  return filesFiltered;
}
/**
 * @param {import("fs").PathOrFileDescriptor} filePath
 */
function readCSS(filePath) {
  const content = readFileSync(filePath, "utf-8");
  //console.log(commentRegex.exec(content));
  const filtered = content.replaceAll(commentRegex, "");
  return filtered;
}

/**
 * @param {string} content
 */
function makeTS(content) {
  return `const css = \`${content}\`\n\nexport default css;`;
}

/**
 *
 * @param {string} content
 * @param {string} filePath
 */

function writeCSS(content, filePath) {
  const newPath = join(outFolder, basename(filePath, ".css") + ".ts");
  writeFileSync(newPath, content, "utf-8");
}

function main() {
  const files = folderContents();
  if (!existsSync(outFolder)) {
    mkdirSync(outFolder);
  }
  //console.log(files);
  for (const file of files) {
    const content = readCSS(join(folderPath, file));
    const text = makeTS(content);
    writeCSS(text, file);
  }
}

main();
