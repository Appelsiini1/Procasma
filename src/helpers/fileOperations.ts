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

/**
 * Remove a file or folder by force, checks if the path
 * contains "Procasma".
 */
export function removePathSyncForce(path: string) {
  try {
    if (!path.includes("Procasma")) {
      throw new Error("ui_path_to_delete_not_in_project");
    }
    fs.rmSync(path, { recursive: true, force: true });
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

export function writeToFileSync(content: string, filePath: string) {
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

/**
 * Creat folder at path if it does not already exist.
 */
export function createFolder(
  path: string,
  requireUnique?: boolean,
  options: object = null
) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, options);
  } else {
    if (requireUnique) {
      return { error: "ui_course_error_duplicate" };
    }
  }
  return null;
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
    const result = createFolder(coursePath, true);
    if (result?.error) {
      throw new Error(result?.error);
    }

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
  } catch (err) {
    console.error("An error occurred:", (err as Error).message);
    return { error: (err as Error).message };
  }

  return { success: "ui_course_save_success" };
}

export function handleReadCourse(filePath: string): CourseData {
  if (!filePath || filePath.length < 1) {
    return null;
  }

  const filePathJoined = path.join(filePath, "course_info.json");
  const fileResult = handleReadFile(filePathJoined);

  if (fileResult?.error) {
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
  } catch (err) {
    console.error("An error occurred:", (err as Error).message);
    return { error: (err as Error).message };
  }

  return { success: "ui_course_save_success" };
}

export function createAssignmentFolderWithHash(
  assignment: CodeAssignmentData,
  assignmentDataPath: string,
  hash: string
) {
  // create hash folder (overwrite if exists)
  const hashPath = path.join(assignmentDataPath, hash);
  if (fs.existsSync(hashPath)) {
    const result = removePathSyncForce(hashPath);

    if (result?.error) {
      return result;
    }
  }
  createFolder(hashPath);

  // save metadata
  const hashFile = `${hash}.json`;
  const hashFilePath = path.join(hashPath, hashFile);

  const assignmentJSON: string = JSON.stringify(assignment);
  writeToFile(assignmentJSON, hashFilePath);

  return null;
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
    // paths may be relative or absolute
    const files: FileData[] = variations?.[varID]?.files;

    const copyPromises = files.map(async (file) => {
      const fileName = getFileNameFromPath(file.path);
      const newFilePath = path.join(variantPath, fileName);
      const newFilePathRelative = getRelativePathToCourse(
        newFilePath,
        coursePath
      );

      try {
        // try to access the file to check if absolute path is valid
        fs.accessSync(file.path, fs.constants.R_OK | fs.constants.W_OK);

        // then copy the file, and change the path to be relative
        await copyFile(file.path, newFilePath);
        file.path = newFilePathRelative;
        return;
      } catch (err) {
        // Absolute path not valid, file already in assignment
      }

      return;
    });
    await Promise.all(copyPromises);
  });
  await Promise.all(variationPromises);
}

export function handleGetAssignments(
  coursePath: string
): CodeAssignmentData[] | null {
  try {
    if (!coursePath || coursePath.length === 0) {
      throw new Error("ui_no_course_path_selected");
    }

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

export async function removeOldFilesFromVariations(
  variations: {
    [key: string]: Variation;
  },
  hashFolderPath: string
) {
  const errors = [];

  for (const varID of Object.keys(variations)) {
    const variationPath = path.join(hashFolderPath, varID);
    const variationFiles = variations[varID].files;

    if (!variationFiles) {
      errors.push({ varID, error: "no variation files" });
      continue;
    }

    // loop through material files in variation folder
    // deleting if not in the variation object
    try {
      const files = fs.readdirSync(variationPath);

      for (const fileName of files) {
        const foundFile = variationFiles.find(
          (file) => file.fileName === fileName
        );

        if (!foundFile) {
          const result = removePathSyncForce(
            path.join(variationPath, fileName)
          );

          if (result?.error) {
            throw new Error(result.error);
          }
        }
      }
    } catch (err) {
      errors.push({ varID, error: err.message });
    }
  }

  if (errors.length > 0) {
    console.log(errors);
  }

  return; //return errors.length > 0 ? errors : null;
}

export async function handleSaveOrUpdateAssignment(
  assignment: CodeAssignmentData,
  coursePath: string,
  oldAssignment: boolean
) {
  try {
    if (!coursePath || coursePath.length === 0) {
      throw new Error("ui_no_course_path_selected");
    }

    const assignmentDataPath = path.join(coursePath, "assignment_data");
    let assignmentHash: string | null = assignment?.assignmentID;
    if (!assignmentHash) {
      assignmentHash = generateAssignmentHash(assignment);
    }

    if (!oldAssignment) {
      // if saving new assignment, return if
      // identically named one exists
      if (doesAssignmentExist(assignment?.title, coursePath)) {
        throw new Error("ui_assignment_error_duplicate_title");
      }

      const result = createAssignmentFolderWithHash(
        assignment,
        assignmentDataPath,
        assignmentHash
      );

      if (result?.error) {
        throw new Error(result.error);
      }
    }

    const hashFolderPath = path.join(assignmentDataPath, assignmentHash);

    // create variant folders and copy files
    const variations: { [key: string]: Variation } = assignment.variations;
    await copyVariationFiles(variations, hashFolderPath, coursePath);

    // clean the variation folder of deleted files (fire and forget)
    removeOldFilesFromVariations(variations, hashFolderPath);

    // save assignment data
    assignment.assignmentID = assignmentHash;
    const assignmentJSON: string = JSON.stringify(assignment);
    const hashFilePath = path.join(hashFolderPath, `${assignmentHash}.json`);

    const result = writeToFileSync(assignmentJSON, hashFilePath);
    if (result?.error) {
      throw new Error(result.error);
    }
  } catch (err) {
    console.error("An error occurred:", (err as Error).message);
    return { error: (err as Error).message };
  }

  return { success: "ui_assignment_save_success" };
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

export function removeAssignmentById(coursePath: string, id: string) {
  try {
    // remove the file hash folder and its contents
    const assignmentPath = path.join(coursePath, "assignment_data", id);

    const result = removePathSyncForce(assignmentPath);
    if (result?.error) {
      throw new Error(result.error);
    }
  } catch (err) {
    return { error: (err as Error).message };
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
