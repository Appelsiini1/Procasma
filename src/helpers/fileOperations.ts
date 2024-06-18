import fs from "fs";
import path from "path";
import { CourseData } from "../types";
import { spacesToUnderscores } from "./converters";

export function writeToFile(content: string, filePath: string) {
  fs.writeFile(filePath, content, "utf8", (err) => {
    if (err) {
      throw err;
    }
  });

  return;
}

export function createFolder(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  } else {
    throw new Error("Course folder already exists");
  }
  return;
}

export function handleSaveCourse(course: CourseData, coursesPath: string) {
  try {
    // extract title
    const courseTitle: string = course?.title;
    if (!courseTitle) {
      throw new Error("Course title not found");
    }

    const courseTitleFormatted = spacesToUnderscores(courseTitle);
    const coursePath = path.join(coursesPath, courseTitleFormatted);

    // create course folder
    createFolder(coursePath);

    const metadata: string = JSON.stringify(course);

    // create course metadata.json
    const metadataPath = path.join(coursePath, "metadata.json");
    writeToFile(metadata, metadataPath);
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
    return false;
  }

  return true;
}
