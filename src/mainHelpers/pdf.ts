import { PDFDocument } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";
import log from "electron-log/node";
import { CourseData, PDFHtmlInput } from "../types";
import {
  PDFFormat,
  PDFMargins,
  version,
  workerWindowPreferences,
} from "../constants";
import { parseUICodeMain } from "./language";
import { BrowserWindow } from "electron";
import { getFileCacheDir } from "./osOperations";
import { createSHAhash } from "./utilityMain";

/**
 * Generates the header and footer (for PDF files only)
 * @param courseData CourseData object with course information
 * @param moduleString String to use in the lower center with module information (if any)
 * @returns Object with header and footer HTML strings
 */
export function generateHeaderFooter(
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
  <hr style="border: 1px solid black; width: 100%; margin-top: 0.1cm;" />
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

export async function createPDF(input: PDFHtmlInput, savePath: string) {
  const win: BrowserWindow = null;
  try {
    log.info("Saving interrim HTML...");
    const tempHTMLPath = path.join(
      getFileCacheDir(),
      createSHAhash(input.html) + ".html"
    );
    fs.writeFileSync(tempHTMLPath, input.html, { encoding: "utf-8" });
    log.info("Interrim HTML saved. Starting PDF creation...");
    const win = new BrowserWindow(workerWindowPreferences);
    win.loadFile(tempHTMLPath);

    win.webContents.on("did-finish-load", () => {
      log.info("Worker window loaded.");
      win.webContents
        .printToPDF({
          pageSize: PDFFormat,
          printBackground: true,
          headerTemplate: input.header,
          footerTemplate: input.footer,
          displayHeaderFooter: true,
          margins: PDFMargins,
        })
        .then((data) => {
          log.info("PDF created, adding metadata...");
          return PDFDocument.load(data);
        })
        .then((pdfDoc) => {
          pdfDoc.setTitle(input.title);
          pdfDoc.setCreator(`Procasma v${version}`);
          return pdfDoc.save();
        })
        .then((pdfBytes) => {
          log.info("Saving PDF to file...");
          fs.writeFileSync(savePath, pdfBytes);
          log.info("PDF saved.");
        })
        .then(() => {
          win.close();
          log.info("Worker window closed.");
        });
    });
  } catch (err) {
    log.error("Error in PDF creation:", err.message);
    throw err;
  }
  return;
}
