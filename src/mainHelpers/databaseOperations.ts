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

      return "Tables created successfully";
    } catch (err) {
      log.error("Error in initDB():", err.message);
      throw err;
    }
  });
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
  assignment = true
): Promise<string> {
  let table = "tags";
  if (!assignment) {
    table = "moduleTags";
  }
  try {
    const tag = await _getTagDB(db, name);

    if (!tag.split(",").includes(id)) {
      return `${
        assignment ? "Assignment" : "Module"
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
      result = await _updateTagDB(db, name, newRow);
    } else {
      result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(`DELETE FROM ${table} WHERE name = ?`, [name], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(
                `Succesfully removed ${
                  assignment ? "assignment" : "module"
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
  assignment = true
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
      toDelete.map((value) => _deleteTagDB(db, value, id, assignment))
    );

    await Promise.all(
      toAdd.map((value) => _addTagDB(db, value, id, assignment))
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
): Promise<string> {
  return await new Promise((resolve, reject) => {
    db.serialize(() => {
      const promises = tags.map((tag) => _addTagDB(db, tag, moduleID, false));

      Promise.all(promises)
        .then(() => resolve("Module tags added."))
        .catch((err) => reject(err));
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
      // This may need to be changed in the future!!
      const assignmentPath = path.join(
        "assignmentData",
        assignment.assignmentID
      );

      const result = await new Promise((resolve, reject) => {
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

export async function getAssignmentDB(
  coursePath: string,
  ids?: (string | number)[],
  queryExtension?: string,
  queryOverride?: string
): Promise<CodeAssignmentDatabase[]> {
  return _execOperationDB(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const query =
          queryOverride ??
          `SELECT assignments.* FROM modules RIGHT JOIN assignments 
          ON modules.id = assignments.module` + queryExtension;

        console.log("query: ", query);
        db.all(query, ids, (err, rows) => {
          if (err) {
            log.error("Error in getAssignmentDB():", err.message);
            reject(err);
          } else if (rows) {
            const formattedRows = rows.map((row) => {
              const content = row as CodeAssignmentDatabase;
              content.isExpanding = content.isExpanding ? true : false;
              return content;
            });
            resolve(formattedRows);
          } else {
            reject(new Error("Could not find assignment in database."));
          }
        });
      });
    });
  });
}

export async function updateAssignmentDB(
  coursePath: string,
  assignment: CodeAssignmentData
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getAssignmentDB(coursePath, [
        assignment.assignmentID,
      ]);
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

export async function deleteAssignmentDB(
  coursePath: string,
  assignmentID: string
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getAssignmentDB(coursePath, [assignmentID]);
      const oldAssignment = getResult[0];

      await Promise.all(
        oldAssignment.tags
          .split(",")
          .map((tag) => _deleteTagDB(db, tag, assignmentID))
      );
      const result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            `DELETE FROM assignments WHERE id = ?`,
            [assignmentID],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(`Deleted assignment '${assignmentID}' from database`);
              }
            }
          );
        });
      });

      return result;
    } catch (err) {
      log.error("Error in deleteAssignmentDB():", err.message);
      throw err;
    }
  });
}

export async function getAssignmentsDB(coursePath: string) {
  return await _getAllDB(coursePath, "assignments");
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

export async function _getAssignmentsByTagsDB(
  db: sqlite3.Database,
  tags: string[]
): Promise<{ assignments: string }[]> {
  try {
    // get assignment ids from the tags table
    console.log("tags:", tags);
    const tagsPlaceholder = tags.map(() => "?").join(",");
    const query = `SELECT assignments FROM tags
        WHERE name IN (${tagsPlaceholder})`;

    return await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(query, tags, (err, rows: any) => {
          if (err) {
            reject(err);
          } else {
            const assignments = rows.map((row: any) => row?.assignments);
            resolve(assignments);
          }
        });
      });
    });
  } catch (err) {
    log.error("Error in _getAssignmentsByTagsDB():", err.message);
    throw err;
  }
}

export async function getFilteredAssignments(
  coursePath: string,
  filters: any
): Promise<CodeAssignmentDatabase[]> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      // prepare the query with the assignment title substring search
      let query = `SELECT assignments.*, 
        instr (assignments.title, ?) titlePosition
        FROM modules RIGHT JOIN assignments 
        ON modules.id = assignments.module WHERE`;
      let ids: any[] = [];

      if (filters?.search.length > 0) {
        ids.push(filters.search);
        query += ` titlePosition > 0`;
      }

      // get assignment ids based on selected tags
      const assignmentIds = filters.tags
        ? await _getAssignmentsByTagsDB(db, filters.tags)
        : [];

      // form the query extension for the assignment ids
      if (assignmentIds?.length > 0) {
        if (filters?.search.length > 0) {
          query += " AND";
        }

        ids = ids.concat(assignmentIds);
        const assignmentPlaceholders = assignmentIds.map(() => "?").join(",");
        query += ` assignments.id IN (${assignmentPlaceholders})`;
      }

      // form the query extension for the modules
      if (filters?.module.length > 0) {
        if (assignmentIds?.length > 0) {
          query += " AND";
        }

        const filterPlaceholders = filters.module.map(() => "?").join(",");
        query += ` modules.name IN (${filterPlaceholders})`;
        ids = ids.concat(filters.module);
      }

      /*if (query.length > 0) {
        query = " WHERE" + query;
      }*/

      return await getAssignmentDB(coursePath, ids, "", query);
    } catch (err) {
      log.error("Error in _getAssignmentsByTagsDB():", err.message);
      throw err;
    }
  });
}

// CRUD Module

export async function addModuleDB(
  coursePath: string,
  module: ModuleData
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
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
                reject(err);
              } else {
                resolve(`Added module '${module.ID}' to database`);
              }
            }
          );
        });
      });
      await _addModuleTagsDB(db, module.tags, module.ID.toString());
      return result;
    } catch (err) {
      log.error("Error in addModuleDB():", err.message);
      throw err;
    }
  });
}

export async function getModuleDB(
  coursePath: string,
  moduleId: number
): Promise<ModuleData> {
  return _execOperationDB(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(
          `SELECT * FROM modules WHERE id = ?`,
          [moduleId],
          (err, row: ModuleDatabase) => {
            if (err) {
              log.error("Error in getModuleDB():", err.message);
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
              resolve(content);
            } else {
              reject(new Error("Could not find module in database."));
            }
          }
        );
      });
    });
  });
}

export async function updateModuleDB(
  coursePath: string,
  module: ModuleData
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getModuleDB(coursePath, module.ID);
      if (!getResult) {
        return {
          error: "Module does not exist in the database, cannot update.",
        };
      }
      const oldModule = getResult;

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
                resolve(`Module '${module.ID}' updated.`);
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

export async function deleteModuleDB(
  coursePath: string,
  moduleID: number
): Promise<string> {
  return _execOperationDB(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getModuleDB(coursePath, moduleID);
      const oldModule = getResult as ModuleData;

      await Promise.all(
        oldModule.tags.map((tag) =>
          _deleteTagDB(db, tag, moduleID.toString(), false)
        )
      );

      const result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(`DELETE FROM modules WHERE id = ?`, [moduleID], (err) => {
            if (err) {
              reject(err.message);
            } else {
              resolve(`Deleted module '${moduleID}' from database`);
            }
          });
        });
      });

      return result;
    } catch (err) {
      log.error("Error in deleteModuleDB():", err.message);
      throw err;
    }
  });
}

export async function getModulesDB(coursePath: string) {
  return await _getAllDB(coursePath, "modules");
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
            resolve({ content: row.count });
          }
        });
      });
    });
  });
}

export async function getModuleTagsDB(coursePath: string) {
  return await _getAllDB(coursePath, "moduleTags");
}
