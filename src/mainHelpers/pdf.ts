import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import log from "electron-log/node";
import { PDFHtmlInput } from "../types";
import { PDFFormat, PDFMargins, version } from "../constants";

export async function createPDF(input: PDFHtmlInput, path: string) {
  try {
    log.info("Starting PDF creation...");
    const browser = await puppeteer.launch();
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
    return 0;
  } catch (err) {
    log.error("Error in PDF creation:", err.message);
    throw err;
  }
}
