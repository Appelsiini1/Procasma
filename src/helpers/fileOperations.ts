import fs from "fs";
import path from "path";
import {
  CodeAssignmentData,
  CourseData,
  GeneralResult,
  FileData,
  ModuleData,
  Variation,
} from "../types";
import { spacesToUnderscores } from "./converters";
import { courseMetaDataFileName } from "../constants";
import { createHash } from "crypto";
import { deleteAssignmentFromDB } from "./databaseOperations";
import log from "electron-log/node";

// --- private --- //

function _hashSHA(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Remove a file or folder by force, checks if the path
 * contains "Procasma".
 */
function _removePathSyncForce(path: string) {
  try {
    if (!path.includes("Procasma")) {
      throw new Error("ui_path_to_delete_not_in_project");
    }
    fs.rmSync(path, { recursive: true, force: true });
    return;
  } catch (err) {
    log.error("Error in _removePathSyncForce():", err.message);
    throw err;
  }
}

function _createAssignmentFolderWithHash(
  assignment: CodeAssignmentData,
  assignmentDataPath: string,
  hash: string
) {
  try {
    // create hash folder (overwrite if exists)
    const hashPath = path.join(assignmentDataPath, hash);
    if (fs.existsSync(hashPath)) {
      _removePathSyncForce(hashPath);
    }
    createFolder(hashPath);

    // save metadata
    const hashFile = `${hash}.json`;
    const hashFilePath = path.join(hashPath, hashFile);

    const assignmentJSON: string = JSON.stringify(assignment);
    fs.writeFileSync(hashFilePath, assignmentJSON, "utf8");

    return;
  } catch (err) {
    log.error("Error in _createAssignmentFolderWithHash():", err.message);
    throw err;
  }
}

function _generateAssignmentHash(assignment: CodeAssignmentData) {
  try {
    // generate hash from assignment metadata
    const metadata: string = JSON.stringify(assignment);
    const hash: string = _hashSHA(metadata);

    // set assignmentID to hash
    assignment.assignmentID = hash;

    return hash;
  } catch (err) {
    log.error("Error in _generateAssignmentHash():", err.message);
    throw err;
  }
}

function _getRelativePathToCourse(targetPath: string, coursePath: string) {
  try {
    const parts = targetPath.split(coursePath);
    if (parts?.length < 2) {
      return null;
    }

    const relPath = parts[parts.length - 1];
    return relPath;
  } catch (err) {
    log.error("Error in _getRelativePathToCourse():", err.message);
    throw err;
  }
}

/**
 * Create folders for variations and copy material files into them.
 * Also update the paths of files to be relative to course root.
 */
function _copyVariationFiles(
  variations: {
    [key: string]: Variation;
  },
  hashFolderPath: string,
  coursePath: string
) {
  try {
    Object.keys(variations).map((varID) => {
      const variantPath: string = path.join(hashFolderPath, varID);
      createFolder(variantPath);

      // copy related files to the variation folder
      // paths may be relative or absolute
      const files: FileData[] = variations?.[varID]?.files;

      files.map((file) => {
        const fileName = path.basename(file.path);
        const newFilePath = path.join(variantPath, fileName);
        const newFilePathRelative = _getRelativePathToCourse(
          newFilePath,
          coursePath
        );

        try {
          // try to access the file to check if absolute path is valid
          fs.accessSync(file.path, fs.constants.R_OK | fs.constants.W_OK);

          // then copy the file, and change the path to be relative
          fs.copyFileSync(file.path, newFilePath);
          file.path = newFilePathRelative;
          return;
        } catch (err) {
          // Absolute path not valid, file already in assignment
        }

        return;
      });
    });
  } catch (err) {
    log.error("Error in _copyVariationFiles():", err.message);
    throw err;
  }
}

function _doesAssignmentExist(
  assignmentName: string,
  coursePath: string
): boolean {
  try {
    // check if assignment with the same name exists
    const assignments = handleGetAssignments(coursePath);

    const sameNameAssignment = assignments.find((prevAssignment) => {
      return prevAssignment?.title === assignmentName ? true : false;
    });

    return sameNameAssignment ? true : false;
  } catch (err) {
    log.error("Error in _doesAssignmentExist():", err.message);
    throw err;
  }
}

async function _removeOldFilesFromVariations(
  variations: {
    [key: string]: Variation;
  },
  hashFolderPath: string
) {
  try {
    Object.keys(variations).map((varID) => {
      const variationPath = path.join(hashFolderPath, varID);
      const variationFiles = variations[varID].files;
      const files = fs.readdirSync(variationPath);

      // loop through material files in variation folder
      // deleting if not in the variation object
      files.map((fileName) => {
        const foundFile = variationFiles.find(
          (file) => file.fileName === fileName
        );

        if (!foundFile) {
          _removePathSyncForce(path.join(variationPath, fileName));
        }
      });
    });
  } catch (err) {
    log.error("Error in _removeOldFilesFromVariations():", err.message);
    throw err;
  }
}

async function _handleSaveOrUpdateAssignment(
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
      assignmentHash = _generateAssignmentHash(assignment);
    }

    if (!oldAssignment) {
      // if saving new assignment, return if
      // identically named one exists
      if (_doesAssignmentExist(assignment?.title, coursePath)) {
        throw new Error("ui_assignment_error_duplicate_title");
      }

      _createAssignmentFolderWithHash(
        assignment,
        assignmentDataPath,
        assignmentHash
      );
    }

    const hashFolderPath = path.join(assignmentDataPath, assignmentHash);

    // create variant folders and copy files
    const variations: { [key: string]: Variation } = assignment.variations;
    _copyVariationFiles(variations, hashFolderPath, coursePath);

    // clean the variation folder of deleted files (fire and forget)
    _removeOldFilesFromVariations(variations, hashFolderPath);

    // save assignment data
    assignment.assignmentID = assignmentHash;
    const assignmentJSON: string = JSON.stringify(assignment);
    const hashFilePath = path.join(hashFolderPath, `${assignmentHash}.json`);

    fs.writeFileSync(hashFilePath, assignmentJSON, "utf8");

    return "ui_assignment_save_success";
  } catch (err) {
    log.error("Error in _handleSaveOrUpdateAssignment():", err.message);
    throw err;
  }
}

// --- public --- //

export function handleReadFileSync(filePath: string): GeneralResult {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const content = JSON.parse(data);
    return { content };
  } catch (err) {
    return null;
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
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, options);
    } else {
      if (requireUnique) {
        return { error: "ui_course_error_duplicate" };
      }
    }
    return null;
  } catch (err) {
    log.error("Error in createFolder():", err.message);
    throw err;
  }
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
    createFolder(coursePath, true);

    const metadata: string = JSON.stringify(course);

    // create course metadata.json
    const metadataPath = path.join(coursePath, courseMetaDataFileName);
    fs.writeFileSync(metadataPath, metadata, "utf8");

    const assignmentDataPath = path.join(coursePath, "assignment_data");
    createFolder(assignmentDataPath);

    const databasePath = path.join(coursePath, "database");
    createFolder(databasePath);

    // create weeks.json

    // create sets.json
    return "ui_course_save_success";
  } catch (err) {
    log.error("Error in handleSaveCourse():", err.message);
    throw err;
  }
}

export function handleReadCourse(filePath: string): CourseData {
  console.log("in handleReadCourse, filePath:", filePath);
  try {
    if (!filePath || filePath.length < 1) {
      return null;
    }

    const filePathJoined = path.join(filePath, "course_info.json");
    const GeneralResult = handleReadFileSync(filePathJoined);

    const course: CourseData = GeneralResult.content as CourseData;
    return course;
  } catch (err) {
    log.error("Error in handleReadCourse():", err.message);
    throw err;
  }
}

export function handleUpdateCourse(course: CourseData, coursePath: string) {
  try {
    fs.accessSync(coursePath, fs.constants.R_OK | fs.constants.W_OK);

    const metadata: string = JSON.stringify(course);

    // create course metadata.json
    const metadataPath = path.join(coursePath, courseMetaDataFileName);
    fs.writeFileSync(metadataPath, metadata, "utf8");
    return "ui_course_save_success";
  } catch (err) {
    log.error("Error in handleUpdateCourse():", err.message);
    throw err;
  }
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

    files.forEach(function (file) {
      const hashFile = `${file}.json`;
      const assignmentPath: string = path.join(
        assignmentDataPath,
        file,
        hashFile
      );

      const GeneralResult = handleReadFileSync(assignmentPath);
      const assignment = GeneralResult.content as CodeAssignmentData;

      assignments.push(assignment);
    });

    return assignments;
  } catch (err) {
    log.error("Error in handleGetAssignments():", err.message);
    throw err;
  }
}

export async function handleSaveAssignment(
  assignment: CodeAssignmentData,
  coursePath: string
) {
  return _handleSaveOrUpdateAssignment(assignment, coursePath, false);
}

export async function handleUpdateAssignment(
  assignment: CodeAssignmentData,
  coursePath: string
) {
  return _handleSaveOrUpdateAssignment(assignment, coursePath, true);
}

export function removeAssignmentById(coursePath: string, id: string) {
  try {
    // remove the file hash folder and its contents
    const assignmentPath = path.join(coursePath, "assignment_data", id);

    _removePathSyncForce(assignmentPath);

    deleteAssignmentFromDB(coursePath, id);
  } catch (err) {
    log.error("Error in removeAssignmentById():", err.message);
    throw err;
  }
}

export function handleSaveModule(module: ModuleData, coursePath: string) {
  try {
    // create modules.json if does not exist
    const modulesPath = path.join(coursePath, "modules.json");

    // read modules.json
    const GeneralResult = handleReadFileSync(modulesPath);

    // if no previous modules
    if (!GeneralResult?.content) {
      fs.writeFileSync(modulesPath, JSON.stringify([module]), "utf8");
    } else {
      const previousModules = GeneralResult.content as ModuleData[];
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
        fs.writeFileSync(modulesPath, JSON.stringify(newModules), "utf8");
      } else {
        previousModules.push(module);
        fs.writeFileSync(modulesPath, JSON.stringify(previousModules), "utf8");
      }
    }
  } catch (err) {
    log.error("Error in handleSaveModule():", err.message);
    throw err;
  }
}

export function handleGetModules(coursePath: string): ModuleData[] | null {
  try {
    const modulesPath = path.join(coursePath, "modules.json");

    // read modules.json
    const GeneralResult = handleReadFileSync(modulesPath);

    const modules = GeneralResult.content as ModuleData[];

    return modules;
  } catch (err) {
    log.error("Error in handleGetModules():", err.message);
    throw err;
  }
}

export function removeModuleById(coursePath: string, id: number): void {
  try {
    const prevModules = handleGetModules(coursePath);
    const newModules = prevModules.filter((module) => {
      return module.ID === id ? null : module;
    });

    // write remaining modules
    const modulesPath = path.join(coursePath, "modules.json");

    fs.writeFileSync(modulesPath, JSON.stringify(newModules), "utf8");
  } catch (err) {
    log.error("Error in removeModuleById():", err.message);
    throw err;
  }
}
