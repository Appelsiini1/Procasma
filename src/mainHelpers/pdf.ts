import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import log from "electron-log/node";
import { CourseData, PDFHtmlInput } from "../types";
import { PDFFormat, PDFMargins, version } from "../constants";
import { parseUICodeMain } from "./language";

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

export async function createPDF(input: PDFHtmlInput, path: string) {
  try {
    log.info("Starting PDF creation...");
    const browser = await puppeteer.launch({ headless: true });
    log.info("Puppeteer launched.");
    const page = await browser.newPage();
    await page.setContent(input.html);
    // page.pdf() is currently supported only in headless mode.
    // @see https://bugs.chromium.org/p/chromium/issues/detail?id=753118
    const pdfResult = await page.pdf({
      format: PDFFormat,
      printBackground: true,
      headerTemplate: input.header,
      footerTemplate: input.footer,
      displayHeaderFooter: true,
      margin: PDFMargins,
    });
    await browser.close();
    log.info("Puppeteer closed.");

    const pdfDoc = await PDFDocument.load(pdfResult);
    pdfDoc.setTitle(input.title);
    pdfDoc.setCreator(`Procasma v${version}`);
    const pdfBytes = await pdfDoc.save();
    log.info("PDF created.");

    fs.writeFileSync(path, pdfBytes);
    log.info("PDF saved.");
    return;
  } catch (err) {
    log.error("Error in PDF creation:", err.message);
    throw err;
  }
}
