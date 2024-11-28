import sqlite3 from "sqlite3";
import path from "path";
import {
  CodeAssignmentData,
  CodeAssignmentDatabase,
  ModuleData,
  ModuleDatabase,
} from "../types";
import { isExpanding } from "./assignment";
import log from "electron-log/node";

// General

// Database connection
function _openDB(coursePath: string): Promise<sqlite3.Database> {
  const dbPath = path.join(coursePath, "database", "database.db");
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        log.error("Error in _openDB():", err.message);
        reject(err);
      } else {
        //log.info("Connected to the database.");
        resolve(db);
      }
    });
  });
}

async function _closeDB(db: sqlite3.Database): Promise<string> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        log.error("Error in _closeDB():", err.message);
        reject(err);
      }
      //log.info("Closed the database connection.");
      resolve("Closed the database connection.");
    });
  });
}

/**
 * A wrapper for all db operations. Opens the db, performs
 * the supplied function, and finally closes the db.
 */
async function _execOperationDB(
  coursePath: string,
  operation: (db: sqlite3.Database) => Promise<any>
): Promise<any> {
  let db: sqlite3.Database = null;
  try {
    db = await _openDB(coursePath);
    const result = await operation(db);
    await _closeDB(db);

    return result;
  } catch (err) {
    log.error("Error in _execOperationDB():", err.message);
    throw err;
  }
}

/**
 * Performs 'select * from' for the supplied table, returning the content.
 */
async function _getAllDB(coursePath: string, table: string): Promise<any> {
  return _execOperationDB(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`SELECT * FROM ${table}`, (err, rows) => {
          if (err) {
            log.error("Error in _getAllDB():", err.message);
            reject(err);
          } else if (rows) {
            const content = rows;
            resolve(content);
          } else {
            reject(new Error(`Could not find items in table ${table}.`));
          }
        });
      });
    });
  });
}

// Database initialization
export async function initDB(coursePath: string): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    const initQueries: Array<string> = [
      `CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        tags TEXT,
        module INTEGER,
        position TEXT NOT NULL,
        level INTEGER,
        isExpanding INTEGER NOT NULL,
        path TEXT NOT NULL,
        extra INTEGER NOT NULL);`,
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

      return "Tables created successfully";
    } catch (err) {
      log.error("Error in initDB():", err.message);
      throw err;
    }
  });
}

/**
 * Helper for getting filtered assignments or modules. TODO explain
 */
export async function _getColumnByTagsDB(
  db: sqlite3.Database,
  tags: string[],
  column: string,
  table: string
): Promise<string[]> {
  try {
    const tagsPlaceholder = tags.map(() => "?").join(",");
    const query = `SELECT ${column} FROM ${table}
      WHERE name IN (${tagsPlaceholder})`;

    return await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(query, tags, (err, rows: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row: any) => row?.[column]));
          }
        });
      });
    });
  } catch (err) {
    log.error("Error in _getColumnByTagsDB():", err.message);
    throw err;
  }
}

// CRUD Tags

async function _addTagDB(
  db: sqlite3.Database,
  tag: string,
  id: string,
  assignment = true
): Promise<string> {
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
              log.error("Error in _addTagDB():", err.message);
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
                      log.error("Error in _addTagDB():", err.message);
                      reject(err);
                    }
                    resolve(`Tag '${tag}' updated in '${table}' successfully`);
                  }
                );
              }
              resolve(`ID already exists on row '${tag}' in '${table}'`);
            } else {
              db.run(`INSERT INTO ${table} VALUES (?, ?)`, [tag, id], (err) => {
                if (err) {
                  log.error("Error in _addTagDB():", err.message);
                  reject(err);
                }
                resolve(`Tag '${tag}' added to '${table}' successfully`);
              });
            }
          } catch (err) {
            log.error("Error in _addTagDB():", err.message);
            reject(err);
          }
        }
      );
    });
  });
}

async function _getTagDB(
  db: sqlite3.Database,
  name: string,
  isAssignment = true
): Promise<string> {
  let table = "tags";
  let key = "assignments";
  if (!isAssignment) {
    table = "moduleTags";
    key = "modules";
  }
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        `SELECT ${key} rowKey FROM ${table} WHERE name = ?`,
        [name],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row.rowKey);
          }
          resolve(`Tag ${name} not in database.`);
        }
      );
    });
  });
}

async function _addAssignmentTagsDB(
  db: sqlite3.Database,
  tags: Array<string>,
  assignmentID: string
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        const results = await Promise.all(
          tags.map((tag) => _addTagDB(db, tag, assignmentID))
        );
        resolve(results);
      } catch (err) {
        log.error("Error in _addAssignmentTagsDB():", err.message);
        reject(err);
      }
    });
  });
}

function _updateTagDB(
  db: sqlite3.Database,
  name: string,
  newRow: string,
  isAssignment = true
): Promise<string> {
  let table = "tags";
  let key = "assignments";
  if (!isAssignment) {
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
            log.error("Error in _updateTagDB():", err.message);
            reject(err);
          } else {
            resolve("Tag updated succesfully.");
          }
        }
      );
    });
  });
}

async function _deleteTagDB(
  db: sqlite3.Database,
  name: string,
  id: string,
  isAssignment = true
): Promise<string> {
  let table = "tags";
  if (!isAssignment) {
    table = "moduleTags";
  }
  try {
    const tag = await _getTagDB(db, name, isAssignment);

    if (!tag.split(",").includes(id)) {
      return `${
        isAssignment ? "Assignment" : "Module"
      } '${id}' not in tag '${name}', no changes made to database`;
    }

    const newRow = tag
      .split(",")
      .filter((value: string) => {
        value !== id;
      })
      .toString();

    let result = "";
    if (newRow.length !== 0) {
      result = await _updateTagDB(db, name, newRow, isAssignment);
    } else {
      result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(`DELETE FROM ${table} WHERE name = ?`, [name], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(
                `Succesfully removed ${
                  isAssignment ? "assignment" : "module"
                } '${id}' from tag '${name}' in database.`
              );
            }
          });
        });
      });
    }
    return result;
  } catch (err) {
    log.error("Error in _deleteTagDB():", err.message);
    throw err;
  }
}

async function _updateTagsDB(
  db: sqlite3.Database,
  oldTags: string,
  newTags: Array<string>,
  id: string,
  isAssignment = true
): Promise<string> {
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
      toDelete.map((value) => _deleteTagDB(db, value, id, isAssignment))
    );

    await Promise.all(
      toAdd.map((value) => _addTagDB(db, value, id, isAssignment))
    );

    return "Tags updated.";
  } catch (err) {
    log.error("Error in _updateTagsDB():", err.message);
    throw err;
  }
}

async function _addModuleTagsDB(
  db: sqlite3.Database,
  tags: Array<string>,
  moduleID: string
): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        const results = await Promise.all(
          tags.map((tag) => _addTagDB(db, tag, moduleID, false))
        );
        resolve(results);
      } catch (err) {
        log.error("Error in _addModuleTagsDB():", err.message);
        reject(err);
      }
    });
  });
}

// CRUD Assignment

export async function addAssignmentDB(
  coursePath: string,
  assignment: CodeAssignmentData
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            `INSERT INTO assignments(id, type, title, tags, module, position, 
            level, isExpanding, path, extra) 
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              assignment.assignmentID,
              assignment.assignmentType,
              assignment.title,
              assignment.tags.toString(),
              assignment.module,
              assignment.position.toString(),
              assignment.level,
              isExpanding(assignment) ? 1 : 0,
              assignment.folder,
              assignment.extraCredit ? 1 : 0,
            ],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(
                  `Assignment ${assignment.assignmentID} inserted successfully`
                );
              }
            }
          );
        });
      });
      await _addAssignmentTagsDB(db, assignment.tags, assignment.assignmentID);
      return result;
    } catch (err) {
      log.error("Error in addAssignmentDB():", err.message);
      throw err;
    }
  });
}

/**
 * Gets all assignments when passing only the coursePath.
 * If passing in ids, remember to override the query.
 */
async function _getAssignmentsDB(
  coursePath: string,
  ids?: (string | number)[],
  queryOverride?: string
): Promise<CodeAssignmentDatabase[]> {
  return _execOperationDB(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const query = queryOverride ?? `SELECT * FROM assignments`;
        db.all(query, ids, (err, rows) => {
          if (err) {
            log.error("Error in _getAssignmentsDB():", err.message);
            reject(err);
          } else if (rows) {
            const formattedRows = rows.map((row) => {
              return row;
            });
            resolve(formattedRows);
          } else {
            reject(undefined);
          }
        });
      });
    });
  });
}

export async function getAssignmentsDB(
  coursePath: string,
  ids?: (string | number)[]
) {
  if (typeof ids !== "undefined") {
    const placeholders = ids.map(() => "?").join(",");
    const queryOverride = `SELECT * FROM 
    assignments WHERE id IN (${placeholders})`;
    return _getAssignmentsDB(coursePath, ids, queryOverride);
  }
  return _getAssignmentsDB(coursePath);
}

export async function getAssignmentByTitleDB(
  coursePath: string,
  title: string
) {
  const queryOverride = `SELECT * FROM 
    assignments WHERE title IN (?)`;
  return _getAssignmentsDB(coursePath, [title], queryOverride);
}

export async function updateAssignmentDB(
  coursePath: string,
  assignment: CodeAssignmentData
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      const queryOverride = `SELECT * FROM assignments WHERE id IN (?)`;
      const getResult = await _getAssignmentsDB(
        coursePath,
        [assignment.assignmentID],
        queryOverride
      );
      if (!getResult) {
        throw new Error(
          "Assignment does not exist in the database, cannot update."
        );
      }
      const oldAssignment = getResult[0];

      let sql = `UPDATE assignments SET `;
      const params: any = [];
      let result = "";

      if (oldAssignment.title !== assignment.title) {
        sql += `title = ?,`;
        params.push(assignment.title);
      }
      if (oldAssignment.tags !== assignment.tags.toString()) {
        await _updateTagsDB(
          db,
          oldAssignment.tags,
          assignment.tags,
          assignment.assignmentID
        );
        sql += `tags = ?,`;
        params.push(assignment.tags.toString());
      }
      if (oldAssignment.module !== assignment.module) {
        sql += `module = ?,`;
        params.push(assignment.module);
      }
      if (oldAssignment.position !== assignment.position.toString()) {
        sql += `position = ?,`;
        params.push(assignment.position.toString());
      }
      if (oldAssignment.level !== assignment.level) {
        sql += `level = ?,`;
        params.push(assignment.level);
      }
      if (oldAssignment.isExpanding !== isExpanding(assignment)) {
        sql += `isExpanding = ?,`;
        params.push(isExpanding(assignment) ? 1 : 0);
      }
      if (oldAssignment.extraCredit !== (assignment.extraCredit ? 1 : 0)) {
        sql += `extra = ?,`;
        params.push(assignment.extraCredit ? 1 : 0);
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
                resolve(`Assignment '${assignment.assignmentID}' updated.`);
              }
            });
          });
        });
      }
      return result;
    } catch (err) {
      log.error("Error in updateAssignmentDB():", err.message);
      throw err;
    }
  });
}

export async function deleteAssignmentsDB(
  coursePath: string,
  ids: string[]
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      const placeholders = ids.map(() => "?").join(",");
      const sql = `SELECT * FROM assignments WHERE id IN (${placeholders})`;
      const assignments = await _getAssignmentsDB(coursePath, ids, sql);

      await Promise.all(
        assignments.map((assignment) => {
          return assignment.tags
            .split(",")
            .map((tag) => _deleteTagDB(db, tag, assignment.id));
        })
      );

      const result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            `DELETE FROM assignments WHERE id IN (${placeholders})`,
            ids,
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(`Deleted assignments from database`);
              }
            }
          );
        });
      });

      return result;
    } catch (err) {
      log.error("Error in deleteAssignmentsDB():", err.message);
      throw err;
    }
  });
}

export async function getAssignmentCountDB(
  coursePath: string
): Promise<number> {
  return _execOperationDB(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`SELECT COUNT(*) AS count FROM assignments`, (err, row: any) => {
          if (err) {
            log.error("Error in getAssignmentCountDB():", err.message);
            reject(err);
          } else {
            resolve(row.count);
          }
        });
      });
    });
  });
}

export async function getAssignmentTagsDB(coursePath: string) {
  return await _getAllDB(coursePath, "tags");
}

export async function getFilteredAssignmentsDB(
  coursePath: string,
  filters: any
): Promise<CodeAssignmentDatabase[]> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      // prepare the query with the assignment title substring search
      let query = "";
      let queryExtension = "";
      let ids: any[] = [];
      let assignmentIds: string[] = [];

      // form the query extension for the title search
      if (filters?.title?.length > 0) {
        query = `SELECT assignments.*, 
        instr (assignments.title, ?) titlePosition
        FROM modules RIGHT JOIN assignments 
        ON modules.id = assignments.module`;

        ids.push(filters.title);
        queryExtension += ` titlePosition > 0`;
      } else {
        query = `SELECT assignments.* 
        FROM modules RIGHT JOIN assignments 
        ON modules.id = assignments.module`;
      }

      // get assignment ids based on selected tags
      const columnResult = filters.tags
        ? await _getColumnByTagsDB(db, filters.tags, "assignments", "tags")
        : [];

      columnResult.forEach((idString) => {
        assignmentIds = assignmentIds.concat(idString.split(","));
      });
      const uniqueIds = [...new Set(assignmentIds)];

      // form the query extension for the assignment ids
      if (uniqueIds.length > 0) {
        if (filters.title.length > 0) {
          queryExtension += " AND";
        }

        ids = ids.concat(uniqueIds);
        const assignmentPlaceholders = uniqueIds.map(() => "?").join(",");
        queryExtension += ` assignments.id IN (${assignmentPlaceholders})`;
      }

      // form the query extension for the modules
      if (filters?.module?.length > 0) {
        if (uniqueIds.length > 0) {
          queryExtension += " AND";
        }

        const filterPlaceholders = filters.module.map(() => "?").join(",");
        queryExtension += ` modules.name IN (${filterPlaceholders})`;
        ids = ids.concat(filters.module);
      }

      if (queryExtension.length > 0) {
        queryExtension = " WHERE" + queryExtension;
      }

      return await _getAssignmentsDB(coursePath, ids, query + queryExtension);
    } catch (err) {
      log.error("Error in getFilteredAssignmentsDB():", err.message);
      throw err;
    }
  });
}

export async function assignmentExistsDB(
  assignmentName: string,
  coursePath: string
): Promise<boolean> {
  try {
    const assignments = await getAssignmentsDB(coursePath);

    const sameNameAssignment = assignments.find((prevAssignment) => {
      return prevAssignment?.title === assignmentName ? true : false;
    });

    return sameNameAssignment ? true : false;
  } catch (err) {
    log.error("Error in _AssignmentExistsFS():", err.message);
    throw err;
  }
}

// CRUD Module

export async function addModuleDB(
  coursePath: string,
  module: ModuleData
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      if (!module.name || module.name.length < 1) {
        throw new Error("ui_add_module_name");
      }
      const existingModules = await getModulesDB(coursePath, [module.id]);
      if (existingModules?.length > 0) {
        throw new Error("ui_module_error_duplicate_number");
      }
      const result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            `INSERT INTO modules(id, name, tags, assignments, subjects, letters, instructions) 
        VALUES(?, ?, ?, ?, ?, ?, ?)`,
            [
              module.id,
              module.name,
              module.tags.toString(),
              module.assignments,
              module.subjects,
              module.letters ? 1 : 0,
              module.instructions,
            ],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(`Added module '${module.id}' to database`);
              }
            }
          );
        });
      });
      await _addModuleTagsDB(db, module.tags, module.id.toString());
      return result;
    } catch (err) {
      log.error("Error in addModuleDB():", err.message);
      throw err;
    }
  });
}

/**
 * When passing only the coursePath, gets all modules.
 * If passing in ids, remember to override the query.
 */
export async function _getModulesDB(
  coursePath: string,
  ids?: (string | number)[],
  queryOverride?: string
): Promise<ModuleData[]> {
  return _execOperationDB(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const query = queryOverride ?? `SELECT * FROM modules`;
        db.all(query, ids, (err, rows) => {
          if (err) {
            log.error("Error in _getModulesDB():", err.message);
            reject(err);
          } else if (rows) {
            const formattedRows = rows.map((row: ModuleDatabase) => {
              const content = {} as ModuleData;
              content.id = row.id;
              content.name = row.name;
              content.tags = row.tags.split(",");
              content.assignments = row.assignments;
              content.subjects = row.subjects;
              content.letters = row.letters ? true : false;
              content.instructions = row.instructions;
              return content;
            });
            resolve(formattedRows);
          } else {
            reject(new Error("Could not find module in database."));
          }
        });
      });
    });
  });
}

export async function getModulesDB(
  coursePath: string,
  ids?: (string | number)[]
): Promise<ModuleData[]> {
  if (ids?.length > 0) {
    const placeholders = ids.map(() => "?").join(",");
    const queryOverride = `SELECT * FROM 
    modules WHERE id IN (${placeholders})`;
    return _getModulesDB(coursePath, ids, queryOverride);
  }
  return _getModulesDB(coursePath);
}

export async function updateModuleDB(
  coursePath: string,
  module: ModuleData
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      const queryOverride = `SELECT * FROM modules WHERE id IN (?)`;
      const getResult = await _getModulesDB(
        coursePath,
        [module.id],
        queryOverride
      );
      if (!getResult) {
        return {
          error: "Module does not exist in the database, cannot update.",
        };
      }
      const oldModule = getResult[0];

      let sql = `UPDATE modules SET `;
      const params: any = [];
      let result = "";

      if (oldModule.name !== module.name) {
        sql += `name = ?,`;
        params.push(module.name);
      }
      if (oldModule.tags.toString() !== module.tags.toString()) {
        result = await _updateTagsDB(
          db,
          oldModule.tags.toString(),
          module.tags,
          module.id.toString(),
          false
        );
        sql += `tags = ?,`;
        params.push(module.tags.toString());
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

      if (sql !== `UPDATE modules SET `) {
        if (sql.endsWith(",")) {
          sql = sql.slice(0, sql.length - 1);
        }
        sql += `WHERE id = ?`;
        params.push(module.id);

        result = await new Promise((resolve, reject) => {
          db.serialize(() => {
            db.run(sql, params, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(`Module '${module.id}' updated.`);
              }
            });
          });
        });
      }

      return result;
    } catch (err) {
      log.error("Error in updateModuleDB():", err.message);
      throw err;
    }
  });
}

export async function deleteModulesDB(
  coursePath: string,
  ids: number[]
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      const placeholders = ids.map(() => "?").join(",");
      const sql = `SELECT * FROM modules WHERE id IN (${placeholders})`;
      const modules = await _getModulesDB(coursePath, ids, sql);

      await Promise.all(
        modules.map((module) => {
          return module.tags.map((tag) =>
            _deleteTagDB(db, tag, module.id.toString(), false)
          );
        })
      );

      const result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            `DELETE FROM modules WHERE id IN (${placeholders})`,
            ids,
            (err) => {
              if (err) {
                reject(err.message);
              } else {
                resolve(`Deleted modules from database`);
              }
            }
          );
        });
      });

      return result;
    } catch (err) {
      log.error("Error in deleteModulesDB():", err.message);
      throw err;
    }
  });
}

export async function getModuleCountDB(coursePath: string): Promise<number> {
  return _execOperationDB(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get("SELECT COUNT(*) AS count FROM modules", (err, row: any) => {
          if (err) {
            log.error("Error in getModuleCountDB():", err.message);
            reject(err);
          } else {
            resolve(row.count ?? 0);
          }
        });
      });
    });
  });
}

export async function getModuleTagsDB(coursePath: string) {
  return await _getAllDB(coursePath, "moduleTags");
}

export async function getFilteredModulesDB(
  coursePath: string,
  filters: any
): Promise<CodeAssignmentDatabase[]> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      let query = "SELECT * FROM modules";
      let ids: any[] = [];
      let moduleIds: string[] = [];

      // get module ids based on selected tags
      const columnResult = filters.tags
        ? await _getColumnByTagsDB(db, filters.tags, "modules", "moduleTags")
        : [];

      columnResult.forEach((idString) => {
        moduleIds = moduleIds.concat(idString.split(","));
      });
      const uniqueIds = [...new Set(moduleIds)];

      // form the query extension for the module ids
      if (uniqueIds.length > 0) {
        ids = ids.concat(uniqueIds);
        const modulePlaceholders = uniqueIds.map(() => "?").join(",");
        query += ` WHERE id IN (${modulePlaceholders})`;
      }

      return await _getModulesDB(coursePath, ids, query);
    } catch (err) {
      log.error("Error in getFilteredModulesDB():", err.message);
      throw err;
    }
  });
}
