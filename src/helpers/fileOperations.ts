import fs from "fs";
import path from "path";
import { CodeAssignmentData, CourseData, Variation } from "../types";
import { spacesToUnderscores } from "./converters";
import { courseMetaDataFileName } from "../constants";
import { createHash } from "crypto";

interface FileResult {
  content?: any;
  error?: string;
}

function hashSHA(content: string) {
  return createHash("sha256").update(content).digest("hex");
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

export function createFolder(path: string, options: object = null) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, options);
  } /*else {
    throw new Error("Course folder already exists");
  }*/
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

export function generateAssignmentFolder(
  assignment: CodeAssignmentData,
  coursePath: string
) {
  try {
    // generate hash from assignment metadata
    const metadata: string = JSON.stringify(assignment);
    const hash: string = hashSHA(metadata);

    // set assignmentID to hash
    assignment.assignmentID = hash;
    const assignmentJSON: string = JSON.stringify(assignment);

    // create hash folder
    const hashPath = path.join(coursePath, hash);
    createFolder(hashPath);

    // save metadata
    const hashFile = `${hash}.json`;
    const hashFilePath = path.join(hashPath, hashFile);
    writeToFile(assignmentJSON, hashFilePath);

    return hash;
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
    return null;
  }
}

export function generateAssignmentPath(
  assignmentHash: string | null,
  coursePath: string
) {
  const hashFolderPath = path.join(coursePath, assignmentHash);

  return hashFolderPath;
}

export function generateAssignmentHashPath(
  assignmentHash: string | null,
  coursePath: string
) {
  const hashFile = `${String(assignmentHash)}.json`;
  const hashFolderPath = path.join(coursePath, assignmentHash);
  const hashFilePath = path.join(hashFolderPath, hashFile);

  return hashFilePath;
}

export function handleSaveAssignment(
  assignment: CodeAssignmentData,
  coursePath: string
) {
  try {
    const assignmentDataPath = path.join(coursePath, "assignment_data");

    let assignmentHash: string | null = assignment?.assignmentID;
    let hashFilePath: string = generateAssignmentHashPath(
      assignmentHash,
      assignmentDataPath
    );

    // generate new assignment folder if no assignmentID or
    // no existing hash/hash.json
    if (!assignmentHash || !fs.existsSync(hashFilePath)) {
      assignmentHash = generateAssignmentFolder(assignment, assignmentDataPath);
    } else {
      // save metadata
      hashFilePath = generateAssignmentHashPath(
        assignmentHash,
        assignmentDataPath
      );

      // save assignment data
      assignment.assignmentID = assignmentHash;
      const assignmentJSON: string = JSON.stringify(assignment);

      writeToFile(assignmentJSON, hashFilePath);
    }

    const hashFolderPath: string = generateAssignmentPath(
      assignmentHash,
      assignmentDataPath
    );
    // write variant folders
    const variations: { [key: string]: Variation } = assignment.variations;

    Object.keys(variations).map((varID) => {
      const variantPath: string = path.join(hashFolderPath, varID);
      createFolder(variantPath);
    });
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
    return false;
  }

  return true;
}

export function handleGetAssignments(
  coursePath: string
): CodeAssignmentData[] | null {
  try {
    const assignmentDataPath = path.join(coursePath, "assignment_data");
    const assignments: CodeAssignmentData[] = [];

    // Loop through all the files in the temp directory
    const files = fs.readdirSync(assignmentDataPath);

    files.forEach(function (file, index) {
      const hashFile = `${file}.json`;
      const assignmentPath: string = path.join(
        assignmentDataPath,
        file,
        hashFile
      );

      const fileResult = handleReadFile(assignmentPath);

      if (fileResult.error) {
        return null;
      }

      const assignment = fileResult.content as CodeAssignmentData;

      assignments.push(assignment);
    });

    return assignments;
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
    return null;
  }
}

export function removeAssignmentById(coursePath: string, id: string): void {
  try {
    // remove the file hash folder and its contents
    const assignmentPath = path.join(coursePath, "assignment_data", id);

    fs.rmSync(assignmentPath, { recursive: true, force: true });
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
  }
  return null;
}
