import fs from "fs";
import path from "path";
import {
  CodeAssignmentData,
  CodeAssignmentDatabase,
  CodeAssignmentSelectionData,
  CourseData,
  ExportSetData,
  FileData,
  FormatType,
  ImportAssignment,
  ModuleData,
  SetAlgoAssignmentData,
  SetVariation,
  Variation,
} from "../types";
import { spacesToUnderscores } from "../generalHelpers/converters";
import {
  assignmentDataFolder,
  courseMetaDataFileName,
  fileFolderSeparator,
} from "../constants";
import { createHash } from "crypto";
import {
  addAssignmentDB,
  addModuleDB,
  deleteAssignmentsDB,
  getAssignmentByTitleDB,
  getAssignmentsDB,
  getModulesDB,
  initDB,
  updateAssignmentDB,
  updateModuleDB,
} from "./databaseOperations";
import log from "electron-log/node";
import { createPDF, generateHeaderFooter } from "./pdf";
import { parseUICodeMain } from "./language";
import { platform } from "process";
import { deepCopy } from "../rendererHelpers/utility";
import {
  defaultAssignment,
  defaultModule,
  defaultVariation,
} from "../defaultObjects";
import { addFileToVariation } from "./OPCourseParsers";
import { coursePath } from "../globalsMain";

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
): Promise<string> {
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

    const assignmentDataPath = path.join(coursePath, assignmentDataFolder);
    createFolderFS(assignmentDataPath);

    const databasePath = path.join(coursePath, "database");
    createFolderFS(databasePath);

    // init db
    await initDB(coursePath);

    // create sets.json
    const setsPath = path.join(coursePath, "sets.json");
    fs.writeFileSync(setsPath, "", "utf8");

    return coursePath;
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
        const baseName = path.basename(file.path);
        const dirName = path.basename(path.dirname(file.path));
        let newName = baseName;
        // check if file.fileName has a directory before the file.
        if (baseName !== file.fileName) {
          // if so, add the directory name to the file file name
          newName = `${dirName}${fileFolderSeparator}${baseName}`;
        }

        const newFilePath = path.join(variantPath, newName);
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
        const foundFile = variationFiles.find((file) => {
          // if the file was originally in a directory,
          // it should currently be part of the basename, separated
          // by a dash "-"
          const baseName = path.basename(file.fileName);
          const dirName = path.dirname(file.fileName);
          if (file.fileName === fileName) {
            return true;
          }
          if (`${dirName}-${baseName}` === fileName) {
            return true;
          }
          return false;
        });

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

export async function handleGetAssignmentsFS(
  coursePath: string,
  id?: string
): Promise<CodeAssignmentData[]> {
  try {
    if (!coursePath || coursePath.length === 0) {
      throw new Error("ui_no_course_path_selected");
    }
    const assignments: CodeAssignmentData[] = [];

    // Loop through all the files in the temp directory
    const assignmentsDB = await getAssignmentsDB(coursePath);

    assignmentsDB.forEach(function (assignmentDB) {
      const currentID = assignmentDB.id;
      if (id && currentID !== id) {
        // if id is provided...
        return; // skip the file if id does not match.
      }
      const hashFile = `${currentID}.json`;
      const assignmentPath: string = path.join(
        coursePath,
        assignmentDB.path,
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

/**
 * Get assignments from the file system, then truncate the
 * example run attributes such that only the information
 * relevant to (e.g.) the set generation algorithm is kept.
 */
export async function getTruncatedAssignmentsFS(
  coursePath: string,
  id?: string
): Promise<SetAlgoAssignmentData[]> {
  try {
    const originals = await handleGetAssignmentsFS(coursePath, id);
    const truncateds: SetAlgoAssignmentData[] = originals.map((assignment) => {
      const oldVariations = assignment.variations;
      const truncatedVariations = Object.keys(oldVariations).reduce(
        (acc, key) => {
          // Deconstructing the old variation to remove unwanted fields
          const { instructions, exampleRuns, files, ...newVariation } =
            oldVariations[key];
          acc[key] = { ...newVariation, usedInBadness: 0 };
          return acc;
        },
        {} as { [key: string]: SetVariation }
      );

      // Deconstructing the old assignment to remove the old variations
      const { variations, ...newAssignment } = assignment;

      // adding the new (truncated) variations to the assignment
      const updatedAssignment: SetAlgoAssignmentData = {
        ...newAssignment,
        variations: truncatedVariations,
      };

      return updatedAssignment;
    });
    return truncateds;
  } catch (err) {
    log.error("Error in getTruncatedAssignmentsFS():", err.message);
    throw err;
  }
}

async function _AssignmentExistsFS(
  assignmentName: string,
  coursePath: string
): Promise<boolean> {
  try {
    const assignments = await handleGetAssignmentsFS(coursePath);

    const sameNameAssignment = assignments.find((prevAssignment) => {
      return prevAssignment?.title === assignmentName ? true : false;
    });

    return sameNameAssignment ? true : false;
  } catch (err) {
    log.error("Error in _AssignmentExistsFS():", err.message);
    throw err;
  }
}

/**
 * Add or delete an assignment id from the "next" or "previous"
 * array of the assignments specified by ids.
 * @param id The assignment id to remove
 * @param ids The assignment ids who to remove from
 * @param fieldName Either "next" or "previous".
 * @param add True to add, false to delete
 */
function _modifyConsecutiveAssignmentsFS(
  coursePath: string,
  id: string,
  ids: string[],
  fieldName: "next" | "previous",
  add?: boolean
) {
  try {
    // loop through id/id.json files
    const assignmentDataPath = path.join(coursePath, assignmentDataFolder);

    const assignmentFolders = fs.readdirSync(assignmentDataPath);
    assignmentFolders.map((folder) => {
      const folderId = path.basename(folder);

      // return if the folder assignment id is not in "ids"
      if (!ids?.find((consecutive) => consecutive === folderId)) {
        return;
      }

      const metadataPath = path.join(
        assignmentDataPath,
        folder,
        `${folderId}.json`
      );
      const assignment: CodeAssignmentData = handleReadFileFS(metadataPath);

      // if the current assignment id does not yet exist in next, push it
      if (!assignment[fieldName]) {
        assignment[fieldName] = [];
      }

      if (add) {
        // add the id
        if (!assignment[fieldName].find((consecutive) => consecutive === id)) {
          assignment[fieldName].push(id);
        }
      } else {
        // remove the id
        const index = assignment[fieldName].indexOf(id);
        if (index > -1) {
          assignment[fieldName].splice(index, 1);
        }
      }

      fs.writeFileSync(metadataPath, JSON.stringify(assignment), "utf8");
    });

    return;
  } catch (err) {
    log.error("Error in _modifyConsecutiveAssignmentsFS():", err.message);
    throw err;
  }
}

async function _handleAddOrUpdateAssignmentFS(
  assignment: CodeAssignmentData,
  coursePath: string,
  oldAssignment: boolean
): Promise<CodeAssignmentData> {
  try {
    const title = assignment?.title;
    if (!title || title.length < 1) {
      throw new Error("ui_add_assignment_title");
    }

    const assignmentDataPath = path.join(coursePath, assignmentDataFolder);
    let assignmentHash: string | null = assignment?.assignmentID;
    if (!assignmentHash) {
      assignmentHash = _generateAssignmentHashFS(assignment);
    }

    let hashFolderPath;
    let assignmentPath;
    if (!oldAssignment) {
      // if saving new assignment, throw error if
      // identically named one exists
      const exists = await _AssignmentExistsFS(assignment?.title, coursePath);
      if (exists) {
        throw new Error("ui_assignment_error_duplicate_title");
      }

      _createAssignmentFolderFS(assignment, assignmentDataPath, assignmentHash);
      hashFolderPath = path.join(assignmentDataPath, assignmentHash);

      assignmentPath = _getCourseRelativePathFS(hashFolderPath, coursePath);
      assignment.folder = assignmentPath;
    } else {
      hashFolderPath = path.join(coursePath, assignment.folder);
    }

    // create variant folders and copy files
    const variations: { [key: string]: Variation } = assignment.variations;
    _copyVariationFilesFS(variations, hashFolderPath, coursePath);

    // clean the variation folder of deleted files
    _deleteOldFilesFromVariationsFS(variations, hashFolderPath);

    assignment.assignmentID = assignmentHash;

    const assignmentJSON: string = JSON.stringify(assignment);
    const hashFilePath = path.join(hashFolderPath, `${assignmentHash}.json`);

    // if updating, get the old version of this assignment,
    // take the "previous" array, compare it to the new,
    // and for each missing one in the new array,
    // go and remove the current id from the relevant "next" arrays

    if (oldAssignment) {
      const oldAssignmentVersion: CodeAssignmentData =
        handleReadFileFS(hashFilePath);

      // get the ids of assignments that are no longer in "previous"
      const oldPrevious = oldAssignmentVersion.previous;
      if (oldPrevious) {
        const idsToClear = oldPrevious.filter(
          (oldPrev) => !assignment.previous.find((prev) => prev === oldPrev)
        );

        _modifyConsecutiveAssignmentsFS(
          coursePath,
          assignment.assignmentID,
          idsToClear,
          "next",
          false
        );
      }
    }

    // add the id to the "next" field of all "previous" assignments
    _modifyConsecutiveAssignmentsFS(
      coursePath,
      assignment.assignmentID,
      assignment.previous,
      "next",
      true
    );

    // save assignment data
    fs.writeFileSync(hashFilePath, assignmentJSON, "utf8");

    if (oldAssignment) {
      await updateAssignmentDB(coursePath, assignment);
    } else {
      await addAssignmentDB(coursePath, assignment);
    }

    // return the assignment with the new id
    return assignment;
  } catch (err) {
    log.error("Error in _handleAddOrUpdateAssignmentFS():", err.message);
    throw err;
  }
}

export async function handleAddAssignmentFS(
  assignment: CodeAssignmentData,
  coursePath: string
): Promise<CodeAssignmentData> {
  return _handleAddOrUpdateAssignmentFS(assignment, coursePath, false);
}

export async function handleUpdateAssignmentFS(
  assignment: CodeAssignmentData,
  coursePath: string
): Promise<CodeAssignmentData> {
  return _handleAddOrUpdateAssignmentFS(assignment, coursePath, true);
}

export async function handleDeleteAssignmentsFS(
  coursePath: string,
  ids: string[]
) {
  try {
    ids.map(async (id) => {
      // delete the id from the "next" field of other assignments
      const assignmentsResult = await handleGetAssignmentsFS(coursePath, id);
      _modifyConsecutiveAssignmentsFS(
        coursePath,
        assignmentsResult[0].assignmentID,
        assignmentsResult[0].previous,
        "next",
        false
      );

      // delete the id from the "previous" field of other assignments
      _modifyConsecutiveAssignmentsFS(
        coursePath,
        assignmentsResult[0].assignmentID,
        assignmentsResult[0].next,
        "previous",
        false
      );

      // remove the file hash folder and its contents
      const assignmentPath = path.join(coursePath, assignmentDataFolder, id);

      _removePathFS(assignmentPath);
    });

    await deleteAssignmentsDB(coursePath, ids);

    return "ui_del_ok";
  } catch (err) {
    log.error("Error in handleDeleteAssignmentsFS():", err.message);
    throw err;
  }
}

/**
 * Read each variation directory in an assignment folder and parse them
 * into variations.
 */
function parseAssignmentFolderVariations(
  assignment: CodeAssignmentData,
  assignmentPath: string
) {
  try {
    let newCodeLanguage: string = null;

    const variationFolders = fs.readdirSync(assignmentPath, {
      withFileTypes: true,
    });
    variationFolders.forEach((varFolder) => {
      if (varFolder.isDirectory()) {
        const variationId = varFolder.name;
        try {
          const variationPath = path.join(assignmentPath, variationId);
          const newVariation: Variation = deepCopy(defaultVariation);

          assignment.variations[variationId] = newVariation;

          // parse each file inside a variation
          const variationFiles = fs.readdirSync(variationPath);
          variationFiles.forEach((variationFile) => {
            // check if dir
            const newFilePath = path.join(variationPath, variationFile);
            const isDir = path.extname(variationFile) === "";
            if (isDir) {
              const innerFiles = fs.readdirSync(newFilePath);
              innerFiles.forEach((innerFile) => {
                const innerFilePath = path.join(
                  variationPath,
                  variationFile,
                  innerFile
                );
                const codeLanguage = addFileToVariation(
                  innerFilePath,
                  innerFile,
                  assignment,
                  variationId,
                  true
                );
                if (!newCodeLanguage && codeLanguage) {
                  newCodeLanguage = codeLanguage;
                }
              });
            } else {
              const codeLanguage = addFileToVariation(
                newFilePath,
                variationFile,
                assignment,
                variationId
              );
              if (!newCodeLanguage && codeLanguage) {
                newCodeLanguage = codeLanguage;
              }
            }
          });
        } catch (err) {
          log.error(err.name);
          throw err;
        }
      }
    });

    assignment.codeLanguage = newCodeLanguage;
    return;
  } catch (err) {
    log.error("Error in parseAssignmentFolderVariations():", err.message);
  }
}

export async function _handleAddImportedAssignmentWithSameFolderFS(
  assignmentData: ImportAssignment,
  coursePath: string
) {
  try {
    const assignment = assignmentData.assignmentData;
    const assignmentFolder = assignmentData.originalFolder;
    const title = assignment?.title;
    if (!title || title.length < 1) {
      throw new Error("ui_add_assignment_title");
    }
    const assignmentDataPath = path.join(
      coursePath,
      assignmentDataFolder,
      assignmentFolder
    );
    let assignmentHash: string | null = assignment?.assignmentID;
    if (!assignmentHash) {
      assignmentHash = _generateAssignmentHashFS(assignment);
    }

    assignment.folder = path.join(assignmentDataFolder, assignmentFolder);

    // create variant folders and copy files
    const variations: { [key: string]: Variation } = assignment.variations;
    _copyVariationFilesFS(variations, assignmentDataPath, coursePath);

    assignment.assignmentID = assignmentHash;

    const assignmentJSON: string = JSON.stringify(assignment);
    const hashFilePath = path.join(
      assignmentDataPath,
      `${assignmentHash}.json`
    );

    // add the id to the "next" field of all "previous" assignments
    _modifyConsecutiveAssignmentsFS(
      coursePath,
      assignment.assignmentID,
      assignment.previous,
      "next",
      true
    );

    // save assignment data
    fs.writeFileSync(hashFilePath, assignmentJSON, "utf8");

    await addAssignmentDB(coursePath, assignment);
  } catch (err) {
    log.error("Error in _handleAddOrUpdateAssignmentFS():", err.message);
    throw err;
  }
}

/**
 * Check if there is a JSON metadata in folder. If there is, add it.
 * @param folder String of folder path
 * @param coursePath CoursePath string
 * @returns Boolean true if there was a JSON added
 */
async function checkJSONInFolder(
  folder: string,
  coursePath: string,
  addAssignment = true
): Promise<{ result: 0 | 1 | -1; data: CodeAssignmentData | null }> {
  try {
    const assignmentFolders = fs.readdirSync(folder, {
      withFileTypes: true,
    });
    const possibleJSON = assignmentFolders.find((value) => {
      if (value.name.toLowerCase().endsWith(".json")) {
        return true;
      } else {
        return false;
      }
    });
    if (possibleJSON) {
      const readjson: CodeAssignmentData = handleReadFileFS(
        path.join(folder, possibleJSON.name)
      );
      if (readjson.title && readjson.assignmentType === "assignment") {
        if (!readjson.assignmentID) {
          readjson.assignmentID = _generateAssignmentHashFS(readjson);
        } else {
          const assig = await getAssignmentsDB(coursePath, [
            readjson.assignmentID,
          ]);
          if (assig.length !== 0) return { result: 0, data: null };
        }
        if (addAssignment) {
          await addAssignmentDB(coursePath, readjson);
          _modifyConsecutiveAssignmentsFS(
            coursePath,
            readjson.assignmentID,
            readjson.next,
            "next",
            true
          );
          _modifyConsecutiveAssignmentsFS(
            coursePath,
            readjson.assignmentID,
            readjson.previous,
            "previous",
            true
          );
        }
        return { result: 1, data: readjson };
      }
    }
    return { result: -1, data: null };
  } catch (err) {
    log.error("Error in checkJSONInFolder: ", err.message);
    throw err;
  }
}

/**
 * Read an assignment directory and import all the contained assignments.
 */
export async function importAssignmentsFS(
  coursePath: string,
  importPath: string
) {
  let newAssignments: ImportAssignment[] = [];
  let assignmentCount = 0;
  try {
    // parse each assignment
    const assignmentFolders = fs.readdirSync(importPath, {
      withFileTypes: true,
    });
    const folderMaxLength = Math.max(
      ...assignmentFolders.map((value) => {
        if (value.isDirectory()) {
          return value.name.length;
        } else return 0;
      })
    );
    if (folderMaxLength <= 3) {
      const possibleJSON = assignmentFolders.find((value) => {
        if (value.name.toLowerCase().endsWith(".json")) {
          return true;
        } else {
          return false;
        }
      });
      if (possibleJSON) {
        const readjson: CodeAssignmentData = handleReadFileFS(
          path.join(importPath, possibleJSON.name)
        );
        if (readjson.title && readjson.assignmentType === "assignment") {
          if (!readjson.assignmentID)
            readjson.assignmentID = _generateAssignmentHashFS(readjson);
          await addAssignmentDB(coursePath, readjson);
          _modifyConsecutiveAssignmentsFS(
            coursePath,
            readjson.assignmentID,
            readjson.next,
            "next",
            true
          );
          _modifyConsecutiveAssignmentsFS(
            coursePath,
            readjson.assignmentID,
            readjson.previous,
            "previous",
            true
          );
          return `${1} ${parseUICodeMain("ui_imported_assignments")}`;
        } else {
          throw new Error("error_unsupported_json_import");
        }
      } else {
        const newAssignment: ImportAssignment = {
          assignmentData: deepCopy(defaultAssignment),
          originalFolder: path.basename(importPath),
        };
        const fileNameParts = path.basename(importPath).split(" ");
        const letterAndModule = fileNameParts.shift();
        newAssignment.assignmentData.module = parseInt(
          letterAndModule.slice(1)
        );
        newAssignment.assignmentData.title = fileNameParts.join(" ");

        // parse each variation
        parseAssignmentFolderVariations(
          newAssignment.assignmentData,
          importPath
        );
        newAssignments.push(newAssignment);
      }
    } else {
      newAssignments = await Promise.all(
        assignmentFolders.map(async (assignmentFolder) => {
          const checkJson = await checkJSONInFolder(
            path.join(importPath, assignmentFolder.name),
            coursePath,
            false
          );
          if (checkJson.result === -1) {
            const folderPath = path.join(
              assignmentFolder.parentPath,
              assignmentFolder.name
            );
            const newAssignment: ImportAssignment = {
              assignmentData: deepCopy(defaultAssignment),
              originalFolder: assignmentFolder.name,
            };

            // extract the module and title from the folder name
            const fileNameParts = assignmentFolder.name
              .replaceAll("_", " ")
              .split(" ");
            const letterAndModule = fileNameParts.shift();
            newAssignment.assignmentData.module = parseInt(
              letterAndModule.slice(1)
            );
            newAssignment.assignmentData.title = fileNameParts.join(" ");

            // parse each variation
            parseAssignmentFolderVariations(
              newAssignment.assignmentData,
              folderPath
            );
            return newAssignment;
          } else if (checkJson.result === 0) {
            return null;
          } else {
            if (importPath !== path.join(coursePath, assignmentDataFolder)) {
              const assignment = checkJson.data;
              for (const variation in assignment.variations) {
                delete assignment.variations[variation].files;
                assignment.variations[variation].files = [];
              }
              parseAssignmentFolderVariations(
                assignment,
                path.join(importPath, assignmentFolder.name)
              );
              return {
                assignmentData: assignment,
                originalFolder: assignmentFolder.name,
              };
            }
            await addAssignmentDB(coursePath, checkJson.data);
            _modifyConsecutiveAssignmentsFS(
              coursePath,
              checkJson.data.assignmentID,
              checkJson.data.next,
              "next",
              true
            );
            _modifyConsecutiveAssignmentsFS(
              coursePath,
              checkJson.data.assignmentID,
              checkJson.data.previous,
              "previous",
              true
            );

            return null;
          }
        })
      );
    }

    // write the assignments
    await Promise.all(
      newAssignments.map(async (importedAssignment) => {
        if (importedAssignment === null) return;

        const newAssignment = importedAssignment.assignmentData;
        const fullAssignmentDataFolder = path.join(
          coursePath,
          assignmentDataFolder
        );
        if (
          fullAssignmentDataFolder !== importPath &&
          fullAssignmentDataFolder !== path.dirname(importPath)
        ) {
          await handleAddAssignmentFS(newAssignment, coursePath);
          assignmentCount++;
        } else if (
          fullAssignmentDataFolder === importPath ||
          fullAssignmentDataFolder === path.dirname(importPath)
        ) {
          _handleAddImportedAssignmentWithSameFolderFS(
            importedAssignment,
            coursePath
          );
          assignmentCount++;
        }
      })
    );

    return `${assignmentCount} ${parseUICodeMain("ui_imported_assignments")}`;
  } catch (err) {
    log.error("Error in importAssignmentsFS():", err.message);
    throw err;
  }
}

// CRUD Assignment set

export function _handleAddOrUpdateSetFS(
  coursePath: string,
  set: ExportSetData,
  isOldSet: boolean
): string {
  try {
    let newSets: ExportSetData[] = [];
    const name = set?.name;
    if (!name || name.length < 1) {
      throw new Error("ui_add_set_name");
    }

    const setsPath = path.join(coursePath, "sets.json");
    let oldSets: ExportSetData[] = handleReadFileFS(setsPath, true);

    let isOldSet: boolean;
    if (oldSets) {
      // find a set with a matching name
      const match = oldSets.find((isOldSet) => isOldSet.id === set.id);

      isOldSet = match ? true : false;
      // add the old sets to the new array
      newSets = newSets.concat(oldSets);
    } else {
      oldSets = [];
      isOldSet = false;
    }

    // generate an id for the set if it is new
    if (!isOldSet) {
      set.id = _SHAhashFS(JSON.stringify(set));
      newSets.push(set);
    } else {
      // update the given set
      newSets = oldSets.map((oldSet) => {
        if (oldSet.id === set.id) {
          return set;
        }
        return oldSet;
      });
    }

    fs.writeFileSync(setsPath, JSON.stringify(newSets));

    return "ui_set_save_success";
  } catch (err) {
    log.error("Error in _handleAddOrUpdateSetFS():", err.message);
    throw err;
  }
}

export async function addSetFS(
  coursePath: string,
  set: ExportSetData
): Promise<string> {
  return _handleAddOrUpdateSetFS(coursePath, set, false);
}

export async function getSetsFS(
  coursePath: string,
  id?: string
): Promise<ExportSetData[]> {
  try {
    const setsPath = path.join(coursePath, "sets.json");
    const sets: ExportSetData[] = handleReadFileFS(setsPath, true) ?? [];

    // if an id is provided, try to find the set
    if (sets && id) {
      const foundSet = sets.find((set) => set.id === id);
      return foundSet ? [foundSet] : [];
    }

    return sets;
  } catch (err) {
    log.error("Error in _handleAddOrUpdateSetFS():", err.message);
    throw err;
  }
}

export async function updateSetFS(
  coursePath: string,
  set: ExportSetData
): Promise<string> {
  return _handleAddOrUpdateSetFS(coursePath, set, true);
}

export async function deleteSetsFS(
  coursePath: string,
  ids: string[]
): Promise<string> {
  try {
    const setsPath = path.join(coursePath, "sets.json");
    const oldSets: ExportSetData[] = handleReadFileFS(setsPath, true);

    // filter out sets whose ids are found in the 'ids' array:
    const newSets = oldSets.filter((set) => !ids.find((id) => set.id === id));

    fs.writeFileSync(setsPath, JSON.stringify(newSets));

    return "ui_delete_success";
  } catch (err) {
    log.error("Error in _handleAddOrUpdateSetFS():", err.message);
    throw err;
  }
}

/**
 * Checks whether a file path exists. If it does, adds an index to the end of the filename.
 * @param pathToCheck Path as a string
 * @returns Path as a string. If path does not exist, will not change the path.
 */
export function checkFileExistanceFS(pathToCheck: string) {
  try {
    let index = 1;
    const getNext = (base: string, pathToChange: string) => {
      const baseSplit = base.split(".");
      let newBase = "";
      if (base.includes(`(${index})`)) {
        newBase =
          baseSplit[0].replace(`(${index})`, `(${index + 1})`) +
          "." +
          baseSplit[1];
        index += 1;
        pathToChange = path.join(path.dirname(pathToChange), newBase);
      } else {
        newBase = baseSplit[0] + ` (${index})` + "." + baseSplit[1];
        pathToChange = path.join(path.dirname(pathToChange), newBase);
      }
      return pathToChange;
    };
    let value = fs.existsSync(pathToCheck);
    while (value) {
      if (platform === "win32") {
        const base = path.win32.basename(pathToCheck);
        pathToCheck = getNext(base, pathToCheck);
      } else {
        const base = path.basename(pathToCheck);
        pathToCheck = getNext(base, pathToCheck);
      }
      value = fs.existsSync(pathToCheck);
    }
    return pathToCheck;
  } catch (err) {
    log.error(err.message);
    throw err;
  }
}

/**
 * Saves the set module to disk according to the format.
 * @param html HTML string to save
 * @param solutionHtml HTML string (including solutions) to save
 * @param title Page title (that will be used as a filename)
 * @param format Save format
 * @param courseData CourseData object
 * @param savePath Path to save. Will create a folder inside and place the files there.
 * @param moduleString String that will be used in the footer of a PDF document. Only required if the format is PDF.
 */
export async function saveSetModuleFS(
  html: string,
  solutionHtml: string,
  title: string,
  format: FormatType,
  courseData: CourseData,
  savePath: string,
  moduleString?: string
) {
  try {
    const filename = title.replace(" ", "");
    const solutionFilename =
      title.replace(" ", "") + parseUICodeMain("answers").toUpperCase();

    createFolderFS(path.join(savePath, filename));
    savePath = path.join(savePath, filename);
    if (format === "html") {
      let newSavePathHTML = checkFileExistanceFS(
        path.join(savePath, filename) + ".html"
      );
      fs.writeFileSync(newSavePathHTML, html, "utf-8");

      newSavePathHTML = checkFileExistanceFS(
        path.join(savePath, solutionFilename + ".html")
      );
      fs.writeFileSync(newSavePathHTML, solutionHtml, "utf-8");
    } else if (format === "pdf") {
      let newSavePathPDF = checkFileExistanceFS(
        path.join(savePath, filename) + ".pdf"
      );
      await createPDF(
        {
          html: html,
          title: title,
          ...generateHeaderFooter(courseData, moduleString),
        },
        newSavePathPDF
      );

      newSavePathPDF = checkFileExistanceFS(
        path.join(savePath, solutionFilename) + ".pdf"
      );
      const answerTitle =
        title + " " + parseUICodeMain("answers").toUpperCase();
      await createPDF(
        {
          html: solutionHtml,
          title: answerTitle,
          ...generateHeaderFooter(courseData, moduleString),
        },
        newSavePathPDF
      );
    }
  } catch (err) {
    log.error("Error in saving set to disk: " + err.message);
    throw err;
  }
}

// CRUD Module

/**
 * Automatically generate modules for the assignments
 * currently in the course.
 */
export async function autoGenerateModulesFS(coursePath: string) {
  try {
    let addedModules = 0;
    const assignments = await handleGetAssignmentsFS(coursePath);

    // store the highest assignment position for each module
    const newModules: { [key: number]: number } = {};

    // iterate through assignments, updating the highest position
    // for its module
    assignments.forEach((assignment) => {
      const oldPosition = newModules[assignment.module];
      let highest = assignment.position[0] ?? 0;
      assignment.position.forEach((position) => {
        if (position > highest) {
          highest = position;
        }
      });

      if (typeof oldPosition === "undefined" || oldPosition < highest) {
        newModules[assignment.module] = highest;
      }
    });

    // add new modules if the module does not exist
    const existingModules = await getModulesDB(coursePath);
    await Promise.all(
      Object.keys(newModules).map(async (k) => {
        const key = parseInt(k);
        const moduleIndex = existingModules.findIndex(
          (existing) => existing.id === key
        );
        const newModule: ModuleData = deepCopy(defaultModule);
        newModule.assignments = newModules[key];

        if (moduleIndex === -1) {
          newModule.id = key;
          newModule.name = `${parseUICodeMain("ui_week")} ${key}`;

          await addModuleDB(coursePath, newModule);
          addedModules++;
        } else {
          // if module exists, update that module but only
          // change the "assignments" number, so that the module
          // reflects the new highest position

          // get the old module
          const oldModules = await getModulesDB(coursePath, [
            existingModules[moduleIndex].id,
          ]);
          const oldModule = oldModules[0];

          // update it
          oldModule.assignments = newModule.assignments;
          await updateModuleDB(coursePath, oldModule);
        }
      })
    );

    return `${parseUICodeMain(
      "ui_generated"
    )} ${addedModules} ${parseUICodeMain("ui_modules_")}.`;
  } catch (err) {
    log.error("Error in autoGenerateModulesFS():", err.message);
    throw err;
  }
}

export function copyExportFilesFS(
  assignments: CodeAssignmentSelectionData[],
  exportPath: string
) {
  log.info("Copying assignment files...");
  let amount = 0;
  assignments.forEach((assignment) => {
    const variationPath = path.join(
      coursePath.path,
      assignment.folder,
      assignment.variatioId
    );
    const copyFiles = (pathToCopy: string, oldPath: string) => {
      try {
        // try to access the file to check if absolute path is valid
        fs.accessSync(oldPath, fs.constants.R_OK | fs.constants.W_OK);

        // then copy the file
        fs.copyFileSync(oldPath, pathToCopy);
        amount += 1;
        return;
      } catch (err) {
        log.error("Error in copyExportFilesFS(): " + err.message);
      }
    };
    for (const file of assignment.variation.files) {
      let filePath = path.join(variationPath, file.fileName);
      const newExportPath = path.join(
        exportPath,
        `${parseUICodeMain("assignment_letter")}${assignment.selectedPosition}`
      );
      createFolderFS(newExportPath);

      // check if the file is in a subdirectory
      const baseName = path.basename(file.fileName);
      const dirName = path.basename(path.dirname(file.fileName));

      // check if file.fileName has a directory before the file.
      if (baseName !== file.fileName) {
        createFolderFS(path.join(newExportPath, dirName));

        const oldNameWithFolder = `${dirName}${fileFolderSeparator}${baseName}`;
        filePath = path.join(variationPath, oldNameWithFolder);
      }
      copyFiles(path.join(newExportPath, file.fileName), filePath);
    }
  });

  log.info(`${amount} files copied to '${exportPath}'`);
}

export function getBase64String(filepath: string): string {
  try {
    const data = fs.readFileSync(filepath, "base64");
    const extension = path.extname(filepath);
    let dataString = `data:image/`;
    switch (extension.replace(".", "")) {
      case "png":
        dataString += "png";
        break;
      case "jpg":
        dataString += "jpeg";
        break;
      case "jpeg":
        dataString += "jpeg";
        break;
      case "gif":
        dataString += "gif";
        break;
      case "svg":
        dataString += "svg+xml";
        break;
      default:
        throw new Error("error_unsupported_image");
    }
    dataString += `;base64,${data}`;
    return dataString;
  } catch (err) {
    log.error("Error in getBase64String():", err.message);
    throw err;
  }
}
