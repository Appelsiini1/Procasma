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
        console.error("Error in openDB():", err);
        reject(err);
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
        console.error("Error in closeDB():", err);
        reject(err);
      }
      resolve({ message: "Closed the database connection." });
    });
  });
}

/**
 * A wrapper for all db operations. Opens the db, performs
 * the supplied function, and finally closes the db. Catches
 * an error returned by the supplied function.
 */
async function execDBOperation(
  coursePath: string,
  operation: (db: sqlite3.Database) => Promise<DatabaseResult>
): Promise<DatabaseResult> {
  let db: sqlite3.Database;

  try {
    const openResult: DatabaseResult = await openDB(coursePath);
    db = openResult.content as sqlite3.Database;

    const result = await operation(db);

    const closeResult: DatabaseResult = await closeDB(db);
    if (closeResult?.message) {
      console.log(closeResult.message);
    }

    return result;
  } catch (err) {
    console.error("Error in execDBOperation():", err);
    return { error: (err as Error).message };
  }
}

// Database initialization
export async function initDB(coursePath: string): Promise<DatabaseResult> {
  return execDBOperation(coursePath, async (db: sqlite3.Database) => {
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
                console.error("Error in initDB():", err);
                throw err;
              }
            });
          })
        )
      );

      return { message: "Tables created successfully" };
    } catch (err) {
      console.error("Error in initDB():", err);
      return err;
    }
  });
}

/**
 * Performs 'select * from' for the supplied table, returning the content.
 */
export async function getAll(
  coursePath: string,
  table: string
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`SELECT * FROM ${table}`, (err, rows) => {
          if (err) {
            console.error("Error in getAll():", err);
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

// Row counts
export async function getModuleCount(
  coursePath: string
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get("SELECT COUNT(*) AS count FROM modules", (err, row) => {
          if (err) {
            console.error("Error in getModuleCount():", err);
            reject(err);
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
  return execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`SELECT COUNT(*) FROM assignments`, (err, count) => {
          if (err) {
            console.error("Error in getAssignmentCount():", err);
            reject(err);
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
            console.error("Error in addTag():", err);
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
                    console.error("Error in addTag():", err);
                    reject(err);
                  }
                  resolve({
                    message: `Tag '${tag}' updated in '${table}' successfully`,
                  });
                }
              );
            }
          } else {
            db.run(`INSERT INTO ${table} VALUES (?, ?)`, [tag, id], (err) => {
              if (err) {
                console.error("Error in addTag():", err);
                reject(err);
              }
              resolve({
                message: `Tag '${tag}' added to '${table}' successfully`,
              });
            });
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
            console.error("Error in _getTag():", err);
            reject(err);
          } else if (row) {
            resolve({ content: row.rowKey });
          }
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
        console.error("Error in addAssignmentTags():", err);
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
            console.error("Error in _updateTag():", err);
            reject(err);
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

    let result: DatabaseResult = {};
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
    console.error("Error in deleteFromTags():", err);
    return err;
  }
}

async function updateTags(
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
      toDelete.map((value) => deleteFromTags(db, value, id, assignment))
    );

    await Promise.all(toAdd.map((value) => addTag(db, value, id, assignment)));

    return { message: "Tags updated." };
  } catch (err) {
    console.error("Error in updateTags():", err);
    return err;
  }
}

async function addModuleTags(
  db: sqlite3.Database,
  tags: Array<string>,
  moduleID: string
) {
  return await new Promise((resolve, reject) => {
    db.serialize(() => {
      const promises = tags.map((tag) => addTag(db, tag, moduleID, false));

      Promise.all(promises)
        .then(() => resolve({ message: "Module tags added." }))
        .catch((err) => reject(err));
    });
  });
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
            console.error("Error in addToAssignments():", err);
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
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      // This may need to be changed in the future!!
      const assignmentPath = path.join(
        "assignmentData",
        assignment.assignmentID
      );

      let result: DatabaseResult = await addToAssignments(
        db,
        assignmentPath,
        assignment
      );

      result = await addAssignmentTags(
        db,
        assignment.tags,
        assignment.assignmentID
      );
      return result;
    } catch (err) {
      console.error("Error in addAssignmentToDB():", err);
      return err;
    }
  });
}

export async function getAssignmentFromDB(
  coursePath: string,
  id: string
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`SELECT * FROM assignments WHERE id = ?`, [id], (err, row) => {
          if (err) {
            console.error("Error in getAssignmentFromDB():", err);
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
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, async (db: sqlite3.Database) => {
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
      console.error("Error in updateAssignmentInDB():", err);
      return err;
    }
  });
}

export async function deleteAssignmentFromDB(
  coursePath: string,
  assignmentID: string
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getAssignmentFromDB(coursePath, assignmentID);
      if (!getResult.content) {
        throw new Error(
          `Assignment '${assignmentID}' does not exist in the database, cannot delete.`
        );
      }
      const oldAssignment = getResult.content as CodeAssignmentDatabase;

      await Promise.all(
        oldAssignment.tags
          .split(",")
          .map((tag) => deleteFromTags(db, tag, assignmentID))
      );

      const result: DatabaseResult = await new Promise((resolve, reject) => {
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
      console.error("Error in deleteAssignmentFromDB():", err);
      return err;
    }
  });
}

export async function getAllAssignments(coursePath: string) {
  return await getAll(coursePath, "assignments");
}

// Module
export async function getModuleFromDB(
  coursePath: string,
  moduleId: number
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, (db: sqlite3.Database) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(
          `SELECT * FROM modules WHERE id = ?`,
          [moduleId],
          (err, row: ModuleDatabase) => {
            if (err) {
              console.error("Error in getModuleFromDB():", err);
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

export async function addModuleToDB(
  coursePath: string,
  module: ModuleData
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      await new Promise((resolve, reject) => {
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
                console.error("Error in addModuleToDB():", err);
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
      const result: DatabaseResult = await addModuleTags(
        db,
        module.tags,
        module.ID.toString()
      );
      return { message: result.message };
    } catch (err) {
      console.error("Error in addModuleToDB():", err);
      return err;
    }
  });
}

export async function updateModuleInDB(
  coursePath: string,
  module: ModuleData
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, async (db: sqlite3.Database) => {
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
      console.error("Error in updateModuleInDB():", err);
      return err;
    }
  });
}

export async function deleteModule(
  coursePath: string,
  moduleID: number
): Promise<DatabaseResult> {
  return execDBOperation(coursePath, async (db: sqlite3.Database) => {
    try {
      const getResult = await getModuleFromDB(coursePath, moduleID);
      if (!getResult.content) {
        throw new Error(
          `Module '${moduleID}' does not exist in the database, cannot delete.`
        );
      }
      const oldModule = getResult.content as ModuleData;

      await Promise.all(
        oldModule.tags.map((tag) =>
          deleteFromTags(db, tag, moduleID.toString(), false)
        )
      );

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

      return result;
    } catch (err) {
      console.error("Error in deleteModule():", err);
      return err;
    }
  });
}

export async function getAllModules(coursePath: string) {
  return await getAll(coursePath, "modules");
}
