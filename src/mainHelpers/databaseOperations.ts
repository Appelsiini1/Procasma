import sqlite3 from "sqlite3";
import path from "path";
import {
  CodeAssignmentData,
  CodeAssignmentDatabase,
  GeneralResult,
  ModuleData,
  ModuleDatabase,
} from "../types";
import { isExpanding } from "./assignment";
import log from "electron-log/node";

// General

// Database connection
function _openDB(coursePath: string) {
  const dbPath = path.join(coursePath, "database", "database.db");
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        log.error("Error in _openDB():", err.message);
        reject(err);
      } else {
        //console.log("Connected to the database.");
        resolve({ content: db });
      }
    });
  });
}

async function _closeDB(db: sqlite3.Database) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        log.error("Error in _closeDB():", err.message);
        reject(err);
      }
      //console.log("Closed the database connection.");
      resolve({ message: "Closed the database connection." });
    });
  });
}

/**
 * A wrapper for all db operations. Opens the db, performs
 * the supplied function, and finally closes the db.
 */
async function _execDBOperation(
  coursePath: string,
  operation: (db: sqlite3.Database) => Promise<GeneralResult>
): Promise<GeneralResult> {
  let db: sqlite3.Database;

  try {
    const openResult: GeneralResult = await _openDB(coursePath);
    db = openResult.content as sqlite3.Database;

    const result = await operation(db);

    await _closeDB(db);

    return result;
  } catch (err) {
    log.error("Error in _execDBOperation():", err.message);
    throw err;
  }
}

/**
 * Performs 'select * from' for the supplied table, returning the content.
 */
async function _getAll(
  coursePath: string,
  table: string
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`SELECT * FROM ${table}`, (err, rows) => {
          if (err) {
            log.error("Error in _getAll():", err.message);
            reject(err);
          } else if (rows) {
            const content = rows;
            resolve({ content: content });
          } else {
            reject(new Error(`Could not find items in table ${table}.`));
          }
        });
      });
    });
  });
}

// Database initialization
export async function initDB(coursePath: string): Promise<GeneralResult> {
  return _execDBOperation(coursePath, async (db: sqlite3.Database) => {
    const initQueries: Array<string> = [
      `CREATE TABLE IF NOT EXISTS assignments (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    tags TEXT,
                    module INTEGER,
                    position TEXT NOT NULL,
                    level INTEGER,
                    isExpanding TEXT NOT NULL,
                    path TEXT NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS modules (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    tags TEXT,
                    assignments INTEGER,
                    subjects TEXT,
                    letters TEXT,
                    instructions TEXT);`,
      `CREATE TABLE IF NOT EXISTS tags (
                    name TEXT PRIMARY KEY,
                    assignments TEXT NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS moduleTags (
                      name TEXT PRIMARY KEY,
                      modules TEXT NOT NULL);`,
    ];
    try {
      await Promise.all(
        initQueries.map((query) =>
          db.serialize(() => {
            db.run(query, (err: Error) => {
              if (err) {
                log.error("Error in initDB():", err.message);
                throw err;
              }
            });
          })
        )
      );

      return { message: "Tables created successfully" };
    } catch (err) {
      log.error("Error in initDB():", err.message);
      throw err;
    }
  });
}

// CRUD Tags

async function _addTag(
  db: sqlite3.Database,
  tag: string,
  id: string,
  assignment = true
) {
  let table = "tags";
  let key = "assignments";
  if (!assignment) {
    table = "moduleTags";
    key = "modules";
  }
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        `SELECT ${key} rowKey FROM ${table} WHERE name = ?`,
        [tag],
        (err, row: { rowKey?: string }) => {
          try {
            if (err) {
              log.error("Error in _addTag():", err.message);
              reject(err);
            } else if (row) {
              const oldRow = row.rowKey.split(",");

              const idExists = oldRow.find((value) => {
                return value === id ? true : false;
              });
              if (!idExists) {
                const newRow = row.rowKey + `,${id}`;
                db.run(
                  `UPDATE ${table} SET ${key} = ? WHERE name = ?`,
                  [newRow, tag],
                  (err) => {
                    if (err) {
                      log.error("Error in _addTag():", err.message);
                      reject(err);
                    }
                    resolve({
                      message: `Tag '${tag}' updated in '${table}' successfully`,
                    });
                  }
                );
              }
              resolve({
                message: `ID already exists on row '${tag}' in '${table}'`,
              });
            } else {
              db.run(`INSERT INTO ${table} VALUES (?, ?)`, [tag, id], (err) => {
                if (err) {
                  log.error("Error in _addTag():", err.message);
                  reject(err);
                }
                resolve({
                  message: `Tag '${tag}' added to '${table}' successfully`,
                });
              });
            }
          } catch (err) {
            log.error("Error in _addTag():", err.message);
            reject(err);
          }
        }
      );
    });
  });
}

function _getTag(db: sqlite3.Database, name: string, assignment = true) {
  let table = "tags";
  let key = "assignments";
  if (!assignment) {
    table = "moduleTags";
    key = "modules";
  }
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        `SELECT ${key} rowKey FROM ${table} WHERE name = ?`,
        [name],
        (err, row: { rowKey?: string }) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({ content: row.rowKey });
          }
          resolve({ message: `Tag ${name} not in database.` });
        }
      );
    });
  });
}

async function _addAssignmentTags(
  db: sqlite3.Database,
  tags: Array<string>,
  assignmentID: string
): Promise<GeneralResult> {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        const results = await Promise.all(
          tags.map((tag) => _addTag(db, tag, assignmentID))
        );
        resolve({ content: results });
      } catch (err) {
        log.error("Error in _addAssignmentTags():", err.message);
        reject(err);
      }
    });
  });
}

function _updateTag(
  db: sqlite3.Database,
  name: string,
  newRow: string,
  assignment = true
) {
  let table = "tags";
  let key = "assignments";
  if (!assignment) {
    table = "moduleTags";
    key = "modules";
  }
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `UPDATE ${table} SET ${key} = ? WHERE name = ?`,
        [newRow, name],
        (err) => {
          if (err) {
            log.error("Error in _updateTag():", err.message);
            reject(err);
          } else {
            resolve({ content: "Tag updated succesfully." });
          }
        }
      );
    });
  });
}

async function _deleteFromTags(
  db: sqlite3.Database,
  name: string,
  id: string,
  assignment = true
) {
  let table = "tags";
  if (!assignment) {
    table = "moduleTags";
  }
  try {
    const row: GeneralResult = await _getTag(db, name);

    if (row.message) {
      return row;
    }

    if (!row.content.split(",").includes(id)) {
      return {
        message: `${
          assignment ? "Assignment" : "Module"
        } '${id}' not in tag '${name}', no changes made to database`,
      };
    }

    const newRow = row.content
      .split(",")
      .filter((value: string) => {
        value !== id;
      })
      .toString();

    let result: GeneralResult = {};
    if (newRow.length !== 0) {
      result = await _updateTag(db, name, newRow);
    } else {
      result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(`DELETE FROM ${table} WHERE name = ?`, [name], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                message: `Succesfully removed ${
                  assignment ? "assignment" : "module"
                } '${id}' from tag '${name}' in database.`,
              });
            }
          });
        });
      });
    }
    return result;
  } catch (err) {
    log.error("Error in _deleteFromTags():", err.message);
    throw err;
  }
}

async function _updateTags(
  db: sqlite3.Database,
  oldTags: string,
  newTags: Array<string>,
  id: string,
  assignment = true
) {
  try {
    const oldTagsArray = oldTags.split(",");

    const toDelete: Array<string> = [];
    const toAdd: Array<string> = [];
    oldTagsArray.forEach((value) => {
      if (!newTags.includes(value)) {
        toDelete.push(value);
      }
    });
    newTags.forEach((value) => {
      if (!oldTagsArray.includes(value)) {
        toAdd.push(value);
      }
    });

    await Promise.all(
      toDelete.map((value) => _deleteFromTags(db, value, id, assignment))
    );

    await Promise.all(toAdd.map((value) => _addTag(db, value, id, assignment)));

    return { message: "Tags updated." };
  } catch (err) {
    log.error("Error in _updateTags():", err.message);
    throw err;
  }
}

async function _addModuleTags(
  db: sqlite3.Database,
  tags: Array<string>,
  moduleID: string
) {
  return await new Promise((resolve, reject) => {
    db.serialize(() => {
      const promises = tags.map((tag) => _addTag(db, tag, moduleID, false));

      Promise.all(promises)
        .then(() => resolve({ message: "Module tags added." }))
        .catch((err) => reject(err));
    });
  });
}

// CRUD Assignment

async function _addToAssignments(
  db: sqlite3.Database,
  assignmentPath: string,
  assignment: CodeAssignmentData
) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `INSERT INTO assignments(id, type, title, tags, module, position, level, isExpanding, path) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          assignment.assignmentID,
          assignment.assignmentType,
          assignment.title,
          assignment.tags.toString(),
          assignment.module,
          assignment.assignmentNo.toString(),
          assignment.level,
          isExpanding(assignment) ? 1 : 0,
          assignmentPath,
        ],
        (err) => {
          if (err) {
            log.error("Error in _addToAssignments():", err.message);
            reject(err);
          } else {
            resolve({
              message: `Assignment ${assignment.assignmentID} inserted successfully`,
            });
          }
        }
      );
    });
  });
}

export async function addAssignmentToDB(
  coursePath: string,
  assignment: CodeAssignmentData
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      // This may need to be changed in the future!!
      const assignmentPath = path.join(
        "assignmentData",
        assignment.assignmentID
      );

      const result: GeneralResult = await _addToAssignments(
        db,
        assignmentPath,
        assignment
      );

      await _addAssignmentTags(db, assignment.tags, assignment.assignmentID);
      return result;
    } catch (err) {
      log.error("Error in addAssignmentToDB():", err.message);
      throw err;
    }
  });
}

export async function getAssignmentFromDB(
  coursePath: string,
  id: string
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`SELECT * FROM assignments WHERE id = ?`, [id], (err, row) => {
          if (err) {
            log.error("Error in getAssignmentFromDB():", err.message);
            reject(err);
          } else if (row) {
            const content = row as CodeAssignmentDatabase;
            content.isExpanding = content.isExpanding ? true : false;
            resolve({ content: content });
          } else {
            reject(new Error("Could not find assignment in database."));
          }
        });
      });
    });
  });
}

export async function updateAssignmentInDB(
  coursePath: string,
  assignment: CodeAssignmentData
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getAssignmentFromDB(
        coursePath,
        assignment.assignmentID
      );
      if (!getResult.content) {
        throw new Error(
          "Assignment does not exist in the database, cannot update."
        );
      }
      const oldAssignment = getResult.content as CodeAssignmentDatabase;

      let sql = `UPDATE assignments SET `;
      const params: any = [];
      let result = {} as GeneralResult;

      if (oldAssignment.title !== assignment.title) {
        sql += `title = ?,`;
        params.push(assignment.title);
      }
      if (oldAssignment.tags !== assignment.tags.toString()) {
        result = await _updateTags(
          db,
          oldAssignment.tags,
          assignment.tags,
          assignment.assignmentID
        );
      }
      if (oldAssignment.module !== assignment.module) {
        sql += `module = ?,`;
        params.push(assignment.module);
      }
      if (oldAssignment.position !== assignment.assignmentNo.toString()) {
        sql += `position = ?,`;
        params.push(assignment.assignmentNo.toString());
      }
      if (oldAssignment.level !== assignment.level) {
        sql += `level = ?,`;
        params.push(assignment.level);
      }
      if (oldAssignment.isExpanding !== isExpanding(assignment)) {
        sql += `isExpanding = ?,`;
        params.push(isExpanding(assignment) ? 1 : 0);
      }

      if (sql !== `UPDATE assignments SET `) {
        if (sql.endsWith(",")) {
          sql = sql.slice(0, sql.length - 1);
        }
        sql += `WHERE id = ?`;
        params.push(assignment.assignmentID);

        result = await new Promise((resolve, reject) => {
          db.serialize(() => {
            db.run(sql, params, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  message: `Assignment '${assignment.assignmentID}' updated.`,
                });
              }
            });
          });
        });
      }
      return result;
    } catch (err) {
      log.error("Error in updateAssignmentInDB():", err.message);
      throw err;
    }
  });
}

export async function deleteAssignmentFromDB(
  coursePath: string,
  assignmentID: string
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getAssignmentFromDB(coursePath, assignmentID);
      const oldAssignment = getResult.content as CodeAssignmentDatabase;

      await Promise.all(
        oldAssignment.tags
          .split(",")
          .map((tag) => _deleteFromTags(db, tag, assignmentID))
      );
      const result: GeneralResult = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            `DELETE FROM assignments WHERE id = ?`,
            [assignmentID],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  message: `Deleted assignment '${assignmentID}' from database`,
                });
              }
            }
          );
        });
      });

      return result;
    } catch (err) {
      log.error("Error in deleteAssignmentFromDB():", err.message);
      throw err;
    }
  });
}

export async function getAllAssignments(coursePath: string) {
  return await _getAll(coursePath, "assignments");
}

export async function getAssignmentCount(
  coursePath: string
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`SELECT COUNT(*) FROM assignments`, (err, count) => {
          if (err) {
            log.error("Error in getAssignmentCount():", err.message);
            reject(err);
          } else {
            resolve({ content: count });
          }
        });
      });
    });
  });
}

export async function getAllAssignmentTags(coursePath: string) {
  return await _getAll(coursePath, "tags");
}

// CRUD Module

export async function addModuleToDB(
  coursePath: string,
  module: ModuleData
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            `INSERT INTO modules(id, name, tags, assignments, subjects, letters, instructions) 
        VALUES(?, ?, ?, ?, ?, ?, ?)`,
            [
              module.ID,
              module.name,
              module.tags.toString(),
              module.assignments,
              module.subjects,
              module.letters ? 1 : 0,
              module.instructions,
            ],
            (err) => {
              if (err) {
                log.error("Error in addModuleToDB():", err.message);
                reject(err);
              } else {
                resolve({
                  message: `Added module '${module.ID}' to database`,
                });
              }
            }
          );
        });
      });
      await _addModuleTags(db, module.tags, module.ID.toString());
      return result;
    } catch (err) {
      log.error("Error in addModuleToDB():", err.message);
      throw err;
    }
  });
}

export async function getModuleFromDB(
  coursePath: string,
  moduleId: number
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(
          `SELECT * FROM modules WHERE id = ?`,
          [moduleId],
          (err, row: ModuleDatabase) => {
            if (err) {
              log.error("Error in getModuleFromDB():", err.message);
              reject(err);
            } else if (row) {
              const content = {} as ModuleData;
              content.ID = row.id;
              content.name = row.name;
              content.tags = row.tags.split(",");
              content.assignments = row.assignments;
              content.subjects = row.subjects;
              content.letters = row.letters ? true : false;
              content.instructions = row.instructions;
              resolve({ content: content });
            } else {
              reject(new Error("Could not find module in database."));
            }
          }
        );
      });
    });
  });
}

export async function updateModuleInDB(
  coursePath: string,
  module: ModuleData
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getModuleFromDB(coursePath, module.ID);
      if (!getResult.content) {
        return {
          error: "Module does not exist in the database, cannot update.",
        };
      }
      const oldModule = getResult.content;

      let sql = `UPDATE modules SET `;
      const params: any = [];
      let result = {} as GeneralResult;

      if (oldModule.name !== module.name) {
        sql += `name = ?,`;
        params.push(module.name);
      }
      if (oldModule.tags.toString() !== module.tags.toString()) {
        result = await _updateTags(
          db,
          oldModule.tags.toString(),
          module.tags,
          module.ID.toString(),
          false
        );
      }
      if (oldModule.assignments !== module.assignments) {
        sql += `assignments = ?,`;
        params.push(module.assignments);
      }
      if (oldModule.subjects !== module.subjects) {
        sql += `subjects = ?,`;
        params.push(module.subjects);
      }
      if (oldModule.letters !== module.letters) {
        sql += `letters = ?,`;
        params.push(module.letters ? 1 : 0);
      }
      if (oldModule.instructions !== module.instructions) {
        sql += `instructions = ?,`;
        params.push(module.instructions);
      }

      if (sql !== `UPDATE assignments SET `) {
        if (sql.endsWith(",")) {
          sql = sql.slice(0, sql.length - 1);
        }
        sql += `WHERE id = ?`;
        params.push(module.ID);

        result = await new Promise((resolve, reject) => {
          db.serialize(() => {
            db.run(sql, params, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve({ message: `Module '${module.ID}' updated.` });
              }
            });
          });
        });
      }

      return result;
    } catch (err) {
      log.error("Error in updateModuleInDB():", err.message);
      throw err;
    }
  });
}

export async function deleteModule(
  coursePath: string,
  moduleID: number
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getModuleFromDB(coursePath, moduleID);
      const oldModule = getResult.content as ModuleData;

      await Promise.all(
        oldModule.tags.map((tag) =>
          _deleteFromTags(db, tag, moduleID.toString(), false)
        )
      );

      const result: GeneralResult = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(`DELETE FROM modules WHERE id = ?`, [moduleID], (err) => {
            if (err) {
              reject(err.message);
            } else {
              resolve({
                message: `Deleted module '${moduleID}' from database`,
              });
            }
          });
        });
      });

      return result;
    } catch (err) {
      log.error("Error in deleteModule():", err.message);
      throw err;
    }
  });
}

export async function getAllModules(coursePath: string) {
  return await _getAll(coursePath, "modules");
}

export async function getModuleCount(
  coursePath: string
): Promise<GeneralResult> {
  return _execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get("SELECT COUNT(*) AS count FROM modules", (err, row) => {
          if (err) {
            log.error("Error in getModuleCount():", err.message);
            reject(err);
          } else {
            resolve({ content: row }); // should it be row.count?
          }
        });
      });
    });
  });
}

export async function getAllModuleTags(coursePath: string) {
  return await _getAll(coursePath, "moduleTags");
}
