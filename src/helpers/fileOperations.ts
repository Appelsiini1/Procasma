import fs from "fs";
import path from "path";
import {
  CodeAssignmentData,
  CourseData,
  FileData,
  ModuleData,
  Variation,
} from "../types";
import { spacesToUnderscores } from "./converters";
import { courseMetaDataFileName } from "../constants";
import { createHash } from "crypto";
import { getFileNameFromPath } from "./utility";
import { promisify } from "util";

interface FileResult {
  content?: any;
  error?: string;
}

function hashSHA(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function handleRemoveFolder(path: string) {
  // add check to make sure path in course directory!
  try {
    fs.rmSync(path, { recursive: true, force: false });
  } catch (err) {
    return { error: (err as Error).message };
  }
  return null;
}

export function writeToFile(content: string, filePath: string) {
  fs.writeFile(filePath, content, "utf8", (err) => {
    if (err) {
      throw err;
    }
  });

  return;
}

export async function writeToFileSync(content: string, filePath: string) {
  try {
    fs.writeFileSync(filePath, content, "utf8");
  } catch (err) {
    return { error: (err as Error).message };
  }

  return null;
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

export function createAssignmentFolderWithHash(
  assignment: CodeAssignmentData,
  assignmentDataPath: string,
  hash: string
) {
  // create hash folder (overwrite if exists)
  const hashPath = path.join(assignmentDataPath, hash);
  if (fs.existsSync(hashPath)) {
    handleRemoveFolder(hashPath);
  }
  createFolder(hashPath);

  // save metadata
  const hashFile = `${hash}.json`;
  const hashFilePath = path.join(hashPath, hashFile);

  const assignmentJSON: string = JSON.stringify(assignment);
  writeToFile(assignmentJSON, hashFilePath);

  return;
}

export function generateAssignmentHash(assignment: CodeAssignmentData) {
  try {
    // generate hash from assignment metadata
    const metadata: string = JSON.stringify(assignment);
    const hash: string = hashSHA(metadata);

    // set assignmentID to hash
    assignment.assignmentID = hash;

    return hash;
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
    return null;
  }
}

const copyFile = promisify(fs.copyFile);

export function getRelativePathToCourse(
  targetPath: string,
  coursePath: string
) {
  const parts = targetPath.split(coursePath);
  if (parts?.length < 2) {
    return null;
  }

  const relPath = parts[parts.length - 1];
  return relPath;
}

/**
 * Create folders for variations and copy material files into them.
 * Also update the paths of files to be relative to course root.
 */
export async function copyVariationFiles(
  variations: {
    [key: string]: Variation;
  },
  hashFolderPath: string,
  coursePath: string
) {
  const variationPromises = Object.keys(variations).map(async (varID) => {
    const variantPath: string = path.join(hashFolderPath, varID);
    createFolder(variantPath);

    // copy related files to the variation folder
    const files: FileData[] = variations?.[varID]?.files;

    const copyPromises = files.map(async (file) => {
      const fileName = getFileNameFromPath(file.path);
      const newFilePath = path.join(variantPath, fileName);
      const newFilePathRelative = getRelativePathToCourse(
        newFilePath,
        coursePath
      );

      try {
        const newAbsoultePath = path.join(coursePath, newFilePath);
        console.log("newAbsoultePath");
        console.log(newAbsoultePath);
        try {
          fs.accessSync(newAbsoultePath, fs.constants.R_OK | fs.constants.W_OK);
          console.log("File exists, not copying");
        } catch {
          // file is not in course
          console.log("before copyfile:");
          console.log("file.path");
          console.log(file.path);
          console.log("newFilePath");
          console.log(newFilePath);

          await copyFile(file.path, newFilePath);
          file.path = newFilePathRelative;
          return file;
        }
      } catch (err) {
        console.log("Error Found:", err);
      }
      return null;
    });

    try {
      await Promise.all(copyPromises);
    } catch (err) {
      console.log("Error Found:", err);
    }
  });

  try {
    await Promise.all(variationPromises);
  } catch (err) {
    console.log("Error Found:", err);
  }
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

export function doesAssignmentExist(
  assignmentName: string,
  coursePath: string
): boolean {
  // check if assignment with the same name exists
  const assignments = handleGetAssignments(coursePath);

  const sameNameAssignment = assignments.find((prevAssignment) => {
    return prevAssignment?.title === assignmentName ? true : false;
  });

  return sameNameAssignment ? true : false;
}

export async function handleSaveOrUpdateAssignment(
  assignment: CodeAssignmentData,
  coursePath: string,
  updatingAssignment: boolean
) {
  try {
    const assignmentDataPath = path.join(coursePath, "assignment_data");
    let assignmentHash: string | null = assignment?.assignmentID;
    if (!assignmentHash) {
      assignmentHash = generateAssignmentHash(assignment);
    }

    if (!updatingAssignment) {
      // if saving new assignment, return if
      // identically named one exists
      if (doesAssignmentExist(assignment?.title, coursePath)) {
        throw new Error("Assignment with title already exists");
      }

      createAssignmentFolderWithHash(
        assignment,
        assignmentDataPath,
        assignmentHash
      );
    }

    const hashFolderPath = path.join(assignmentDataPath, assignmentHash);

    // create variant folders and copy files
    const variations: { [key: string]: Variation } = assignment.variations;

    await copyVariationFiles(variations, hashFolderPath, coursePath);

    // save assignment data
    assignment.assignmentID = assignmentHash;
    const assignmentJSON: string = JSON.stringify(assignment);

    const hashFilePath = path.join(hashFolderPath, `${assignmentHash}.json`);

    writeToFile(assignmentJSON, hashFilePath);
  } catch (err) {
    console.error("An error occurred:", (err as Error).message);
    return { error: (err as Error).message };
  }

  return null;
}

export async function handleSaveAssignment(
  assignment: CodeAssignmentData,
  coursePath: string
) {
  return handleSaveOrUpdateAssignment(assignment, coursePath, false);
}

export async function handleUpdateAssignment(
  assignment: CodeAssignmentData,
  coursePath: string
) {
  return handleSaveOrUpdateAssignment(assignment, coursePath, true);
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

export function handleSaveModule(module: ModuleData, coursePath: string) {
  // create modules.json if does not exist
  const modulesPath = path.join(coursePath, "modules.json");

  // read modules.json
  const fileResult = handleReadFile(modulesPath);

  // if no previous modules
  if (fileResult.error) {
    writeToFile(JSON.stringify([module]), modulesPath);
  } else {
    const previousModules = fileResult.content as ModuleData[];
    let foundSameId = false;

    // check if same id exists if the module array exists
    const newModules = previousModules.map((element: ModuleData) => {
      // if exists, overwrite the module
      if (element.ID == module.ID) {
        foundSameId = true;
        return module;
      }
      return element;
    });

    // if did not find the module in previous modules,
    // push the new module to the list and write to file
    if (foundSameId) {
      writeToFile(JSON.stringify(newModules), modulesPath);
    } else {
      previousModules.push(module);
      writeToFile(JSON.stringify(previousModules), modulesPath);
    }
  }

  return;
}

export function handleGetModules(coursePath: string): ModuleData[] | null {
  try {
    const modulesPath = path.join(coursePath, "modules.json");

    // read modules.json
    const fileResult = handleReadFile(modulesPath);
    if (fileResult.error) {
      return null;
    }

    const modules = fileResult.content as ModuleData[];

    return modules;
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
    return null;
  }
}

export function removeModuleById(coursePath: string, id: number): void {
  const prevModules = handleGetModules(coursePath);

  try {
    const newModules = prevModules.filter((module) => {
      return module.ID === id ? null : module;
    });

    // write remaining modules
    const modulesPath = path.join(coursePath, "modules.json");

    writeToFileSync(JSON.stringify(newModules), modulesPath);
  } catch (error) {
    console.error("An error occurred:", (error as Error).message);
  }

  return null;
}
