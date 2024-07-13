import sqlite3 from "sqlite3";
import path from "path";
import {
  CodeAssignmentData,
  CodeAssignmentDatabase,
  ModuleData,
  ModuleDatabase,
} from "../types";
import { isExpanding } from "./assignment";

interface DatabaseResult {
  content?: any;
  message?: string;
  error?: string;
}

// Database connection
function openDB(coursePath: string) {
  const dbPath = path.join(coursePath, "database", "database.db");
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error(err.message);
        reject({ error: err.message });
      } else {
        console.log("Connected to the database.");
        resolve({ content: db });
      }
    });
  });
}

async function closeDB(db: sqlite3.Database) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject({ error: err.message });
      }
      resolve({ message: "Closed the database connection." });
    });
  });
}

/**
 * A wrapper for all db operations. Opens the db, performs
 * the supplied function, and finally closes the db.
 */
async function executeDatabaseOperation(
  coursePath: string,
  operation: (db: sqlite3.Database) => Promise<DatabaseResult>
): Promise<DatabaseResult> {
  let db: sqlite3.Database;

  try {
    const openResult: DatabaseResult = await openDB(coursePath);
    if (openResult?.error) {
      throw new Error(openResult.error);
    }
    db = openResult.content as sqlite3.Database;

    const result = await operation(db);
    if (result?.error) {
      throw new Error(result.error);
    }

    const closeResult: DatabaseResult = await closeDB(db);
    if (closeResult?.error) {
      throw new Error(closeResult.error);
    }
    if (closeResult?.message) {
      console.log(closeResult.message);
    }

    return result;
  } catch (err) {
    console.log("Unexpected error:", err);
    return { error: (err as Error).message };
  }
}

// Database initialization
export async function initDB(coursePath: string): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(
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
          (err: Error) => {
            if (err) {
              reject({ error: err.message });
            }
          }
        );
        db.run(
          `CREATE TABLE IF NOT EXISTS modules (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    tags TEXT,
                    assignments INTEGER,
                    subjects TEXT,
                    letters TEXT,
                    instructions TEXT);`,
          (err: Error) => {
            if (err) {
              reject({ error: err.message });
            }
          }
        );
        db.run(
          `CREATE TABLE IF NOT EXISTS tags (
                    name TEXT PRIMARY KEY,
                    assignments TEXT NOT NULL);`,
          (err: Error) => {
            if (err) {
              reject({ error: err.message });
            }
          }
        );
        db.run(
          `CREATE TABLE IF NOT EXISTS moduleTags (
                      name TEXT PRIMARY KEY,
                      modules TEXT NOT NULL);`,
          (err: Error) => {
            if (err) {
              reject({ error: err.message });
            }
          }
        );
        resolve({ message: "Tables created successfully" });
      });
    });
  });
}

/**
 * Performs 'select * from' for the supplied table, returning the content.
 */
export async function getAll(
  coursePath: string,
  table: string
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`SELECT * FROM ${table}`, (err, rows) => {
          if (err) {
            reject({ error: err.message });
          } else if (rows) {
            const content = rows;
            resolve({ content: content });
          } else {
            reject({ error: `Could not find items in table ${table}.` });
          }
        });
      });
    });
  });
}

// Row counts
export async function getModuleCount(
  coursePath: string
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get("SELECT COUNT(*) AS count FROM modules", (err, row) => {
          if (err) {
            reject({ error: err.message });
          } else {
            resolve({ content: row }); // should it be row.count?
          }
        });
      });
    });
  });
}

export async function getAssignmentCount(
  coursePath: string
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`SELECT COUNT(*) FROM assignments`, (err, count) => {
          if (err) {
            reject({ error: err.message });
          } else {
            resolve({ content: count });
          }
        });
      });
    });
  });
}

// Tags
async function addTag(
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
          if (err) {
            reject({ error: err.message });
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
                    reject({ error: err.message });
                  }
                }
              );
            }
          } else {
            db.run(`INSERT INTO ${table} VALUES (?, ?)`, [tag, id], (err) => {
              if (err) {
                reject({ error: err.message });
              }
            });
          }
          resolve({ message: `Tag '${tag}' added to '${table}' successfully` });
        }
      );
    });
  });
}

async function addAssignmentTags(
  db: sqlite3.Database,
  tags: Array<string>,
  assignmentID: string
): Promise<DatabaseResult> {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        const results = await Promise.all(
          tags.map((tag) => addTag(db, tag, assignmentID))
        );
        resolve({ content: results });
      } catch (err) {
        reject({ error: err.message });
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
            console.log(err.message);
            reject({ error: err.message });
          } else {
            resolve({ content: "Tag updated succesfully." });
          }
        }
      );
    });
  });
}

async function deleteFromTags(
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
    const row = (await _getTag(db, name)) as DatabaseResult;
    if (!row.content) {
      throw new Error(row.error);
    }
    let result: DatabaseResult = {};

    if (!row) {
      return { message: `Tag ${name} not in database. No changes made.` };
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

    if (newRow.length !== 0) {
      result = await _updateTag(db, name, newRow);
    } else {
      result = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(`DELETE FROM ${table} WHERE name = ?`, [name], (err) => {
            if (err) {
              reject({ error: err.message });
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
    if (result?.error) {
      throw new Error(result.error);
    } else {
      return result;
    }
  } catch (err) {
    console.error(err);
    return { error: (err as Error).message };
  }
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
            reject({ error: err.message });
          } else if (row) {
            resolve({ content: row.rowKey });
          }
        }
      );
    });
  });
}

async function updateTags(
  db: sqlite3.Database,
  oldTags: string,
  newTags: Array<string>,
  id: string,
  assignment = true
) {
  const oldTagsArray = oldTags.split(",");
  let result: DatabaseResult = {};

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

  try {
    toDelete.every(async (value) => {
      result = await deleteFromTags(db, value, id, assignment);
      if (result?.error) throw new Error(result.error);
      return true;
    });

    toAdd.every(async (value) => {
      result = await addTag(db, value, id, assignment);
      if (result?.error) throw new Error(result.error);
      return true;
    });
  } catch (err) {
    console.error(err);
    return { error: (err as Error).message };
  }
  return { message: "Tags updated." };
}

async function addModuleTags(
  db: sqlite3.Database,
  tags: Array<string>,
  moduleID: string
) {
  let result: DatabaseResult = {};
  result = await new Promise((resolve, reject) => {
    db.serialize(() => {
      tags.some(async (tag) => {
        result = await addTag(db, tag, moduleID, false);
        if (result?.error) {
          reject(result);
          return true;
        } else {
          console.log(result.message);
          return false;
        }
      });
      resolve({ message: "Module tags added." });
    });
  });
  return result;
}

export async function getAllAssignmentTags(coursePath: string) {
  return await getAll(coursePath, "tags");
}

export async function getAllModuleTags(coursePath: string) {
  return await getAll(coursePath, "moduleTags");
}

// Assignment
async function addToAssignments(
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
            reject({ error: err.message });
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

export async function addAssignmentToDatabase(
  coursePath: string,
  assignment: CodeAssignmentData
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, async (db: sqlite3.Database) => {
    // This may need to be changed in the future!!
    const assignmentPath = path.join("assignmentData", assignment.assignmentID);

    let result: DatabaseResult = await addToAssignments(
      db,
      assignmentPath,
      assignment
    );
    if (result?.error) {
      return result;
    } else {
      console.log(result.message);
    }

    result = await addAssignmentTags(
      db,
      assignment.tags,
      assignment.assignmentID
    );
    if (result?.error) {
      return result;
    } else {
      console.log(result.content);
    }
    return result;
  });
}

export async function getAssignmentFromDatabase(
  coursePath: string,
  id: string
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`SELECT * FROM assignments WHERE id = ?`, [id], (err, row) => {
          if (err) {
            reject({ error: err.message });
          } else if (row) {
            const content = row as CodeAssignmentDatabase;
            content.isExpanding = content.isExpanding ? true : false;
            resolve({ content: content });
          } else {
            reject({ error: "Could not find assignment in database." });
          }
        });
      });
    });
  });
}

export async function updateAssignmentToDatabase(
  coursePath: string,
  assignment: CodeAssignmentData
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getAssignmentFromDatabase(
        coursePath,
        assignment.assignmentID
      );
      if (getResult?.error) {
        return getResult;
      } else if (!getResult.content) {
        throw new Error(
          "Assignment does not exist in the database, cannot update."
        );
      }
      const oldAssignment = getResult.content as CodeAssignmentDatabase;

      let sql = `UPDATE assignments SET `;
      const params: any = [];
      let result = {} as DatabaseResult;

      if (oldAssignment.title !== assignment.title) {
        sql += `title = ?,`;
        params.push(assignment.title);
      }
      if (oldAssignment.tags !== assignment.tags.toString()) {
        result = await updateTags(
          db,
          oldAssignment.tags,
          assignment.tags,
          assignment.assignmentID
        );
        if (result?.error) {
          throw new Error(result.error);
        } else {
          console.log(result.message);
        }
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
                reject(err.message);
              } else {
                resolve({
                  message: `Assignment '${assignment.assignmentID}' updated.`,
                });
              }
            });
          });
        });
        if (result?.error) {
          throw new Error(result.error);
        } else {
          console.log(result.message);
        }
      }

      return result;
    } catch (err) {
      return { error: (err as Error).message };
    }
  });
}

export async function deleteAssignmentFromDatabase(
  coursePath: string,
  assignmentID: string
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getAssignmentFromDatabase(
        coursePath,
        assignmentID
      );
      if (getResult?.error) {
        throw new Error(getResult.error);
      } else if (!getResult.content) {
        throw new Error(
          `Assignment '${assignmentID}' does not exist in the database, cannot delete.`
        );
      }
      const oldAssignment = getResult.content as CodeAssignmentDatabase;

      oldAssignment.tags.split(",").forEach(async (tag) => {
        const delResult = await deleteFromTags(db, tag, assignmentID);
        if (delResult?.error) {
          throw new Error(delResult.error);
        } else {
          console.log(delResult.message);
        }
      });

      const result: DatabaseResult = await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            `DELETE FROM assignments WHERE id = ?`,
            [assignmentID],
            (err) => {
              if (err) {
                reject(err.message);
              } else {
                resolve({
                  message: `Deleted assignment '${assignmentID}' from database`,
                });
              }
            }
          );
        });
      });

      if (result?.error) {
        throw new Error(result.error);
      } else {
        console.log(result.message);
      }
      return result;
    } catch (err) {
      return { error: (err as Error).message };
    }
  });
}

export async function getAllAssignments(coursePath: string) {
  return await getAll(coursePath, "assignments");
}

// Module
export async function getModuleFromDatabase(
  coursePath: string,
  moduleId: number
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(
          `SELECT * FROM modules WHERE id = ?`,
          [moduleId],
          (err, row: ModuleDatabase) => {
            if (err) {
              reject({ error: err.message });
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
              reject({ error: "Could not find module in database." });
            }
          }
        );
      });
    });
  });
}

export async function addModuleToDatabase(
  coursePath: string,
  module: ModuleData
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, async (db: sqlite3.Database) => {
    let result: DatabaseResult = await new Promise((resolve, reject) => {
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
              reject({ error: err.message });
            } else {
              resolve({
                message: `Added module '${module.ID}' to database`,
              });
            }
          }
        );
      });
    });

    if (!result?.error) {
      result = await addModuleTags(db, module.tags, module.ID.toString());
      return { message: result.message };
    }
    if (result?.error) {
      return { error: result.error };
    }
    return result;
  });
}

export async function updateModuleToDatabase(
  coursePath: string,
  module: ModuleData
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getModuleFromDatabase(coursePath, module.ID);
      if (getResult.error) {
        return getResult;
      } else if (!getResult.content) {
        return {
          error: "Module does not exist in the database, cannot update.",
        };
      }
      const oldModule = getResult.content;
      let sql = `UPDATE modules SET `;
      const params: any = [];
      let result = {} as DatabaseResult;

      if (oldModule.name !== module.name) {
        sql += `name = ?,`;
        params.push(module.name);
      }
      if (oldModule.tags.toString() !== module.tags.toString()) {
        result = await updateTags(
          db,
          oldModule.tags.toString(),
          module.tags,
          module.ID.toString(),
          false
        );
        if (result?.error) {
          return result;
        } else {
          console.log(result.message);
        }
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
                reject({ error: err.message });
              } else {
                resolve({ message: `Module '${module.ID}' updated.` });
              }
            });
          });
        });

        if (result?.error) {
          throw new Error(result.error);
        } else {
          console.log(result.message);
        }
      }

      return result;
    } catch (err) {
      return { error: (err as Error).message };
    }
  });
}

export async function deleteModule(
  coursePath: string,
  moduleID: number
): Promise<DatabaseResult> {
  return executeDatabaseOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getModuleFromDatabase(coursePath, moduleID);
      if (getResult?.error) {
        throw new Error(getResult.error);
      } else if (!getResult.content) {
        throw new Error(
          `Module '${moduleID}' does not exist in the database, cannot delete.`
        );
      }
      const oldModule = getResult.content as ModuleData;

      oldModule.tags.forEach(async (tag) => {
        const delResult = await deleteFromTags(
          db,
          tag,
          moduleID.toString(),
          false
        );
        if (delResult?.error) {
          throw new Error(delResult.error);
        } else {
          console.log(delResult.message);
        }
      });

      const result: DatabaseResult = await new Promise((resolve, reject) => {
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

      if (result?.error) {
        throw new Error(result.error);
      } else {
        console.log(result.message);
      }
      return result;
    } catch (err) {
      return { error: (err as Error).message };
    }
  });
}

export async function getAllModules(coursePath: string) {
  return await getAll(coursePath, "modules");
}
