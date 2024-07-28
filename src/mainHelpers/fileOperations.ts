import fs from "fs";
import path from "path";
import {
  CodeAssignmentData,
  CourseData,
  FileData,
  ModuleData,
  SetData,
  Variation,
} from "../types";
import { spacesToUnderscores } from "../generalHelpers/converters";
import { courseMetaDataFileName } from "../constants";
import { createHash } from "crypto";
import {
  addAssignmentDB,
  addModuleDB,
  deleteAssignmentsDB,
  deleteModulesDB,
  initDB,
  updateModuleDB,
} from "./databaseOperations";
import log from "electron-log/node";

// General

/**
 * Reads a JSON file and uses JSON.parse(), returning the
 * data.
 */
export function handleReadFileFS(
  filePath: string,
  returnNullOnFail?: boolean
): any {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const content = JSON.parse(data);
    return content;
  } catch (err) {
    if (returnNullOnFail) {
      return null;
    }
    log.error("Error in handleReadFileFS():", err.message);
    throw err;
  }
}

/**
 * Creat folder at path if it does not already exist.
 */
export function createFolderFS(
  path: string,
  requireUnique?: boolean,
  options: object = null
) {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, options);
    } else {
      if (requireUnique) {
        throw new Error("ui_course_error_duplicate");
      }
    }
  } catch (err) {
    log.error("Error in createFolderFS():", err.message);
    throw err;
  }
}

function _SHAhashFS(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Remove a file or folder by force, checks if the path
 * contains "Procasma".
 */
function _removePathFS(path: string) {
  try {
    if (!path.includes("Procasma")) {
      throw new Error("ui_path_to_delete_not_in_project");
    }
    fs.rmSync(path, { recursive: true, force: true });
    return;
  } catch (err) {
    log.error("Error in _removePathFS():", err.message);
    throw err;
  }
}

function _getCourseRelativePathFS(targetPath: string, coursePath: string) {
  try {
    const parts = targetPath.split(coursePath);
    if (parts?.length < 2) {
      return null;
    }

    const relPath = parts[parts.length - 1];
    return relPath;
  } catch (err) {
    log.error("Error in _getCourseRelativePathFS():", err.message);
    throw err;
  }
}

// CRUD Course

export async function handleAddCourseFS(
  course: CourseData,
  coursesPath: string
) {
  try {
    // extract title
    const courseTitle: string = course.title;
    if (!courseTitle) {
      throw new Error("ui_add_course_title");
    }

    const courseTitleFormatted = spacesToUnderscores(courseTitle);
    const coursePath = path.join(coursesPath, courseTitleFormatted);

    // create course folder
    createFolderFS(coursePath, true);

    const metadata: string = JSON.stringify(course);

    // create course metadata.json
    const metadataPath = path.join(coursePath, courseMetaDataFileName);
    fs.writeFileSync(metadataPath, metadata, "utf8");

    const assignmentDataPath = path.join(coursePath, "assignment_data");
    createFolderFS(assignmentDataPath);

    const databasePath = path.join(coursePath, "database");
    createFolderFS(databasePath);

    // init db
    await initDB(coursePath);

    // create weeks.json
    const weeksPath = path.join(coursePath, "weeks.json");
    fs.writeFileSync(weeksPath, "", "utf8");

    // create sets.json
    const setsPath = path.join(coursePath, "sets.json");
    fs.writeFileSync(setsPath, "", "utf8");

    return "ui_course_save_success";
  } catch (err) {
    log.error("Error in handleAddCourseFS():", err.message);
    throw err;
  }
}

export function handleGetCourseFS(filePath: string): CourseData {
  try {
    if (!filePath || filePath.length < 1) {
      return null;
    }

    const filePathJoined = path.join(filePath, "course_info.json");
    return handleReadFileFS(filePathJoined);
  } catch (err) {
    log.error("Error in handleGetCourseFS():", err.message);
    throw err;
  }
}

export function handleUpdateCourseFS(course: CourseData, coursePath: string) {
  try {
    fs.accessSync(coursePath, fs.constants.R_OK | fs.constants.W_OK);

    const metadata: string = JSON.stringify(course);

    // create course metadata.json
    const metadataPath = path.join(coursePath, courseMetaDataFileName);
    fs.writeFileSync(metadataPath, metadata, "utf8");
    return "ui_course_save_success";
  } catch (err) {
    log.error("Error in handleUpdateCourseFS():", err.message);
    throw err;
  }
}

// CRUD Assignment

function _createAssignmentFolderFS(
  assignment: CodeAssignmentData,
  assignmentDataPath: string,
  hash: string
) {
  try {
    // create hash folder (overwrite if exists)
    const hashPath = path.join(assignmentDataPath, hash);
    if (fs.existsSync(hashPath)) {
      _removePathFS(hashPath);
    }
    createFolderFS(hashPath);

    // save metadata
    const hashFile = `${hash}.json`;
    const hashFilePath = path.join(hashPath, hashFile);

    const assignmentJSON: string = JSON.stringify(assignment);
    fs.writeFileSync(hashFilePath, assignmentJSON, "utf8");

    return;
  } catch (err) {
    log.error("Error in _createAssignmentFolderFS():", err.message);
    throw err;
  }
}

function _generateAssignmentHashFS(assignment: CodeAssignmentData) {
  try {
    // generate hash from assignment metadata
    const metadata: string = JSON.stringify(assignment);
    const hash: string = _SHAhashFS(metadata);

    // set assignmentID to hash
    assignment.assignmentID = hash;

    return hash;
  } catch (err) {
    log.error("Error in _generateAssignmentHashFS():", err.message);
    throw err;
  }
}

/**
 * Create folders for variations and copy material files into them.
 * Also update the paths of files to be relative to course root.
 */
function _copyVariationFilesFS(
  variations: {
    [key: string]: Variation;
  },
  hashFolderPath: string,
  coursePath: string
) {
  try {
    Object.keys(variations).map((varID) => {
      const variantPath: string = path.join(hashFolderPath, varID);
      createFolderFS(variantPath);

      // copy related files to the variation folder
      // paths may be relative or absolute
      const files: FileData[] = variations?.[varID]?.files;

      files.map((file) => {
        const fileName = path.basename(file.path);
        const newFilePath = path.join(variantPath, fileName);
        const newFilePathRelative = _getCourseRelativePathFS(
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
    log.error("Error in _copyVariationFilesFS():", err.message);
    throw err;
  }
}

async function _deleteOldFilesFromVariationsFS(
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
          _removePathFS(path.join(variationPath, fileName));
        }
      });
    });
  } catch (err) {
    log.error("Error in _deleteOldFilesFromVariationsFS():", err.message);
    throw err;
  }
}

export function handleGetAssignmentsFS(
  coursePath: string,
  id?: string
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
      if (id && file != id) {
        // if id is provided...
        return; // skip the file if id does not match.
      }
      const hashFile = `${file}.json`;
      const assignmentPath: string = path.join(
        assignmentDataPath,
        file,
        hashFile
      );

      const result = handleReadFileFS(assignmentPath);
      const assignment = result as CodeAssignmentData;

      assignments.push(assignment);
    });

    return assignments;
  } catch (err) {
    log.error("Error in handleGetAssignmentsFS():", err.message);
    throw err;
  }
}

function _AssignmentExistsFS(
  assignmentName: string,
  coursePath: string
): boolean {
  try {
    const assignments = handleGetAssignmentsFS(coursePath);

    const sameNameAssignment = assignments.find((prevAssignment) => {
      return prevAssignment?.title === assignmentName ? true : false;
    });

    return sameNameAssignment ? true : false;
  } catch (err) {
    log.error("Error in _AssignmentExistsFS():", err.message);
    throw err;
  }
}

async function _handleAddOrUpdateAssignmentFS(
  assignment: CodeAssignmentData,
  coursePath: string,
  oldAssignment: boolean
) {
  try {
    const title = assignment?.title;
    if (!title || title.length < 1) {
      throw new Error("ui_add_assignment_title");
    }

    const assignmentDataPath = path.join(coursePath, "assignment_data");
    let assignmentHash: string | null = assignment?.assignmentID;
    if (!assignmentHash) {
      assignmentHash = _generateAssignmentHashFS(assignment);
    }

    if (!oldAssignment) {
      // if saving new assignment, throw error if
      // identically named one exists
      if (_AssignmentExistsFS(assignment?.title, coursePath)) {
        throw new Error("ui_assignment_error_duplicate_title");
      }

      _createAssignmentFolderFS(assignment, assignmentDataPath, assignmentHash);
    }

    const hashFolderPath = path.join(assignmentDataPath, assignmentHash);

    // create variant folders and copy files
    const variations: { [key: string]: Variation } = assignment.variations;
    _copyVariationFilesFS(variations, hashFolderPath, coursePath);

    // clean the variation folder of deleted files
    _deleteOldFilesFromVariationsFS(variations, hashFolderPath);

    // save assignment data
    assignment.assignmentID = assignmentHash;
    const assignmentJSON: string = JSON.stringify(assignment);
    const hashFilePath = path.join(hashFolderPath, `${assignmentHash}.json`);

    fs.writeFileSync(hashFilePath, assignmentJSON, "utf8");

    await addAssignmentDB(coursePath, assignment);

    return "ui_assignment_save_success";
  } catch (err) {
    log.error("Error in _handleAddOrUpdateAssignmentFS():", err.message);
    throw err;
  }
}

export async function handleAddAssignmentFS(
  assignment: CodeAssignmentData,
  coursePath: string
) {
  return _handleAddOrUpdateAssignmentFS(assignment, coursePath, false);
}

export async function handleUpdateAssignmentFS(
  assignment: CodeAssignmentData,
  coursePath: string
) {
  return _handleAddOrUpdateAssignmentFS(assignment, coursePath, true);
}

export async function handleDeleteAssignmentsFS(
  coursePath: string,
  ids: string[]
) {
  try {
    ids.map((id) => {
      // remove the file hash folder and its contents
      const assignmentPath = path.join(coursePath, "assignment_data", id);

      _removePathFS(assignmentPath);
    });

    await deleteAssignmentsDB(coursePath, ids);

    return "ui_del_ok";
  } catch (err) {
    log.error("Error in handleDeleteAssignmentsFS():", err.message);
    throw err;
  }
}

// CRUD Assignment set

export function _handleAddOrUpdateSetFS(
  coursePath: string,
  set: SetData,
  oldSet: boolean
): string {
  try {
    let newSets: SetData[] = [];
    const name = set?.name;
    if (!name || name.length < 1) {
      throw new Error("ui_add_set_name");
    }

    const setsPath = path.join(coursePath, "sets.json");
    const oldSets: SetData[] = handleReadFileFS(setsPath, true);

    if (oldSets) {
      // find a set with a matching name
      let match = oldSets.find((oldSet) => oldSet.name === set.name);

      // a name match when adding a new set throws an error and
      // if the set is old, make sure that the id is the same
      if (match && (!oldSet || match.id !== set.id)) {
        throw new Error("ui_set_error_duplicate_name");
      }
    }

    // generate an id for the set if it is new
    if (!oldSet) {
      set.id = _SHAhashFS(JSON.stringify(set));
    }

    if (oldSets) {
      newSets = newSets.concat(oldSets);
    }
    newSets.push(set);

    fs.writeFileSync(setsPath, JSON.stringify(newSets));

    return "ui_set_save_success";
  } catch (err) {
    log.error("Error in _handleAddOrUpdateSetFS():", err.message);
    throw err;
  }
}

export async function addSetFS(
  coursePath: string,
  set: SetData
): Promise<string> {
  return _handleAddOrUpdateSetFS(coursePath, set, false);
}

export async function getSetsFS(coursePath: string): Promise<SetData[]> {
  try {
    const setsPath = path.join(coursePath, "sets.json");
    return handleReadFileFS(setsPath, true) ?? [];
  } catch (err) {
    log.error("Error in _handleAddOrUpdateSetFS():", err.message);
    throw err;
  }
}

export async function updateSetFS(
  coursePath: string,
  set: SetData
): Promise<string> {
  return _handleAddOrUpdateSetFS(coursePath, set, true);
}

export async function deleteSetsFS(
  coursePath: string,
  ids: string[]
): Promise<string> {
  try {
    const setsPath = path.join(coursePath, "sets.json");
    const oldSets: SetData[] = handleReadFileFS(setsPath, true);

    console.log("ids: ", ids);
    console.log("oldSets: ", oldSets);
    // filter out sets whose ids are found in the 'ids' array:
    const newSets = oldSets.filter((set) => !ids.find((id) => set.id === id));
    console.log("newSets: ", newSets);

    fs.writeFileSync(setsPath, JSON.stringify(newSets));

    return "ui_delete_success";
  } catch (err) {
    log.error("Error in _handleAddOrUpdateSetFS():", err.message);
    throw err;
  }
}
