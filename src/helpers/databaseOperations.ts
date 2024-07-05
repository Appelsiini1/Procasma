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

// Database initialization
export async function initDB(coursePath: string) {
  try {
    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;

    result = await new Promise((resolve, reject) => {
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
    if (result?.error) {
      throw new Error(result.error);
    }

    result = await closeDB(db);
    if (result?.error) {
      throw new Error(result.error);
    }
    if (result?.message) {
      console.log(result.message);
    }
    return { content: true };
  } catch (err) {
    console.error("Unexpected error:", err);

    return { error: (err as Error).message };
  }
}

// Row counts
export async function getModuleCount(coursePath: string) {
  try {
    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;
    result = await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`SELECT COUNT(*) FROM modules`, (err, count) => {
          if (err) {
            reject({ error: err.message });
          } else {
            resolve({ content: count });
          }
        });
      });
    });
    if (result?.error) {
      throw new Error(result.error);
    } else {
      console.log(result.content);
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

export async function getAssignmentCount(coursePath: string) {
  try {
    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;
    result = await new Promise((resolve, reject) => {
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
    if (result?.error) {
      throw new Error(result.error);
    } else {
      console.log(result.content);
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
          console.log(row);
          if (err) {
            console.log(err.message);
            reject({ error: err.message });
          } else if (row) {
            const oldRow = row.rowKey.split(",");
            console.log(oldRow);
            if (
              !oldRow.filter((value) => {
                return value === id ? true : false;
              })
            ) {
              const newRow = row.rowKey + `,${id}`;
              db.run(
                `UPDATE ${table} SET ${key} = ? WHERE name = ?`,
                [newRow, tag],
                (err) => {
                  if (err) {
                    console.log(err.message);
                    reject({ error: err.message });
                  }
                }
              );
            }
          } else {
            db.run(`INSERT INTO ${table} VALUES (?, ?)`, [tag, id], (err) => {
              if (err) {
                console.log(err.message);
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
) {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        const results = await Promise.all(
          tags.map((tag) => addTag(db, tag, assignmentID))
        );
        resolve(results);
      } catch (error) {
        reject(error);
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
    let row = (await _getTag(db, name)) as DatabaseResult;
    if (!row.content) {
      throw new Error(row.error);
    }
    let result: DatabaseResult = {};

    if (row) {
      if (row.content.split(",").includes(id)) {
        let newRow = row.content
          .split(",")
          .filter((value: string) => {
            value !== id;
          })
          .toString();
        if (newRow.length !== 0) {
          result = await _updateTag(db, name, newRow);
          if (result?.error) {
            throw new Error(result.error);
          }
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
      } else {
        return {
          message: `${
            assignment ? "Assignment" : "Module"
          } '${id}' not in tag '${name}', no changes made to database`,
        };
      }
    } else {
      return { message: `Tag ${name} not in database. No changes made.` };
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

  let toDelete: Array<string> = [];
  let toAdd: Array<string> = [];
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
) {
  try {
    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content;

    // This may need to be changed in the future!!
    const assignmentPath = path.join("assignmentData", assignment.assignmentID);

    result = await addToAssignments(db, assignmentPath, assignment);
    if (result?.error) {
      throw new Error(result.error);
    } else {
      console.log(result.message);
    }

    result = await addAssignmentTags(
      db,
      assignment.tags,
      assignment.assignmentID
    );
    if (result?.error) {
      throw new Error(result.error);
    } else {
      console.log(result.message);
    }

    const closeResult: DatabaseResult = await closeDB(db);
    if (closeResult?.error) {
      throw new Error(closeResult.error);
    }
    if (closeResult?.message) {
      console.log(closeResult.message);
    }

    return { content: true };
  } catch (err) {
    console.error("Unexpected error:", err);

    return { error: (err as Error).message };
  }
}

export async function getAssignmentFromDatabase(
  coursePath: string,
  id: string
): Promise<DatabaseResult> {
  try {
    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;
    result = await new Promise((resolve, reject) => {
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

export async function updateAssignmentToDatabase(
  coursePath: string,
  assignment: CodeAssignmentData
) {
  try {
    const getResult = await getAssignmentFromDatabase(
      coursePath,
      assignment.assignmentID
    );
    if (getResult?.error) {
      return getResult;
    } else if (!getResult.content) {
      return {
        error: "Assignment does not exist in the database, cannot update.",
      };
    }
    const oldAssignment = getResult.content as CodeAssignmentDatabase;

    let sql = `UPDATE assignments SET `;
    let params = [];
    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;

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

    const closeResult: DatabaseResult = await closeDB(db);
    if (closeResult?.error) {
      throw new Error(closeResult.error);
    }
    if (closeResult?.message) {
      console.log(closeResult.message);
    }

    return { content: true };
  } catch (err) {
    console.log("Unexpected error:", err);
    return { error: (err as Error).message };
  }
}

export async function deleteAssignmentFromDatabase(
  coursePath: string,
  assignmentID: string
) {
  try {
    const getResult = await getAssignmentFromDatabase(coursePath, assignmentID);
    if (getResult?.error) {
      throw new Error(getResult.error);
    } else if (!getResult.content) {
      throw new Error(
        `Assignment '${assignmentID}' does not exist in the database, cannot delete.`
      );
    }
    const oldAssignment = getResult.content as CodeAssignmentDatabase;

    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;

    oldAssignment.tags.split(",").forEach(async (tag) => {
      const delResult = await deleteFromTags(db, tag, assignmentID);
      if (delResult?.error) {
        throw new Error(delResult.error);
      } else {
        console.log(delResult.message);
      }
    });
    result = await new Promise((resolve, reject) => {
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
    const closeResult: DatabaseResult = await closeDB(db);
    if (closeResult?.error) {
      throw new Error(closeResult.error);
    }
    if (closeResult?.message) {
      console.log(closeResult.message);
    }
    return { content: true };
  } catch (err) {
    console.log("Unexpected error:", err);
    return { error: (err as Error).message };
  }
}

// Module
export async function getModuleFromDatabase(
  coursePath: string,
  moduleId: number
) {
  try {
    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;
    result = await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(
          `SELECT * FROM modules WHERE id = ?`,
          [moduleId],
          (err, row: ModuleDatabase) => {
            if (err) {
              reject({ error: err.message });
            } else if (row) {
              const content: any = {};
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

export async function addModuleToDatabase(
  coursePath: string,
  module: ModuleData
) {
  try {
    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;

    result = await new Promise((resolve, reject) => {
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
              resolve({ message: `Added module '${module.ID}' to database` });
            }
          }
        );
      });
    });
    if (!result?.error) {
      result = await addModuleTags(db, module.tags, module.ID.toString());
      if (result?.error) {
        throw new Error(result.error);
      } else {
        console.log(result.message);
      }
    } else {
      throw new Error(result.error);
    }
    const closeResult: DatabaseResult = await closeDB(db);
    if (closeResult?.error) {
      throw new Error(closeResult.error);
    }
    if (closeResult?.message) {
      console.log(closeResult.message);
    }
    return { content: true };
  } catch (err) {
    console.log("Unexpected error:", err);
    return { error: (err as Error).message };
  }
}

export async function updateModuleToDatabase(
  coursePath: string,
  module: ModuleData
) {
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
    let params = [];

    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;

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

    const closeResult: DatabaseResult = await closeDB(db);
    if (closeResult?.error) {
      throw new Error(closeResult.error);
    }
    if (closeResult?.message) {
      console.log(closeResult.message);
    }

    return { content: true };
  } catch (err) {
    console.log("Unexpected error:", err);
    return { error: (err as Error).message };
  }
}

export async function deleteModule(coursePath: string, moduleID: number) {
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

    let result: DatabaseResult = await openDB(coursePath);

    if (result?.error) {
      throw new Error(`Failed to open database: ${result.error}`);
    }
    const db = result.content as sqlite3.Database;

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
    result = await new Promise((resolve, reject) => {
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
    const closeResult: DatabaseResult = await closeDB(db);
    if (closeResult?.error) {
      throw new Error(closeResult.error);
    }
    if (closeResult?.message) {
      console.log(closeResult.message);
    }
    return { content: true };
  } catch (err) {
    console.log("Unexpected error:", err);
    return { error: (err as Error).message };
  }
}
