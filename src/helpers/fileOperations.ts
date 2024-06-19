import fs from "fs";
import path from "path";
import { CourseData } from "../types";
import { spacesToUnderscores } from "./converters";
import { courseMetaDataFileName } from "../constants";

interface FileResult {
  content?: any;
  error?: string;
}

export function writeToFile(content: string, filePath: string) {
  fs.writeFile(filePath, content, "utf8", (err) => {
    if (err) {
      throw err;
    }
  });

  return;
}

export function handleReadFile(filePath: string): FileResult {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const content = JSON.parse(data);
    return { content };
  } catch (err) {
    return { error: (err as Error).message };
  }
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
    const metadataPath = path.join(coursePath, courseMetaDataFileName);
    writeToFile(metadata, metadataPath);

    const assignmentDataPath = path.join(coursePath, "assignment_data");
    createFolder(assignmentDataPath);

    const databasePath = path.join(coursePath, "database");
    createFolder(databasePath);

    // assignment stuff maybe in a different route/handler
    // create assignment_data
    //  create assignments by hash
    //    create variants by ID
    //      create variant data folder

    // create weeks.json

    // create sets.json
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
    return false;
  }

  return true;
}

export function handleReadCourse(filePath: string): CourseData {
  const filePathJoined = path.join(filePath, "course_info.json");
  const fileResult = handleReadFile(filePathJoined);

  if (fileResult.error) {
    return null;
  }

  try {
    const course: CourseData = fileResult.content as CourseData;
    return course;
  } catch (err) {
    return null;
  }
}

export function handleUpdateCourse(course: CourseData, coursePath: string) {
  try {
    fs.accessSync(coursePath, fs.constants.R_OK | fs.constants.W_OK);

    const metadata: string = JSON.stringify(course);

    // create course metadata.json
    const metadataPath = path.join(coursePath, courseMetaDataFileName);
    writeToFile(metadata, metadataPath);
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
    return false;
  }

  return true;
}
