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
      resolve({ content: "Closed the database connection." });
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
    const db = result.content;

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
        resolve({ content: "Tables created successfully" });
      });
    });
    if (result?.error) {
      throw new Error(result.error);
    }

    result = await closeDB(db);
    if (result?.error) {
      throw new Error(result.error);
    }
    if (result?.content) {
      console.log(result.content);
    }
    return { content: true };
  } catch (err) {
    console.error("Unexpected error:", err);

    return { error: (err as Error).message };
  }
}

// Row counts
export function getModuleCount(coursePath: string) {
  const rValue = openDB(coursePath);
  if (rValue?.error) {
    return rValue;
  }
  let db = rValue.content as sqlite3.Database;
  let result: DatabaseResult = {};
  db.serialize(() => {
    db.get(`SELECT COUNT(*) FROM modules`, (err, count) => {
      if (err) {
        console.log(err.message);
        result.error = err.message;
      } else {
        console.log(count);
        result.content = count as number;
      }
    });
  });
  return result;
}

export function getAssignmentCount(coursePath: string) {
  const rValue = openDB(coursePath);
  if (rValue?.error) {
    return rValue;
  }
  let db = rValue.content as sqlite3.Database;
  let result: DatabaseResult = {};
  db.serialize(() => {
    db.get(`SELECT COUNT(*) FROM assignments`, (err, count) => {
      if (err) {
        console.log(err.message);
        result.error = err.message;
      } else {
        console.log(count);
        result.content = count as number;
      }
    });
  });
  return result;
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
            console.log(err.message);
            reject({ error: err.message });
          } else if (row) {
            const oldRow = row.rowKey.split(",");
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
          resolve({ message: "Tag added successfully" });
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
  let result: DatabaseResult = {};
  db.serialize(() => {
    db.run(
      `UPDATE ${table} SET ${key} = ? WHERE name = ?`,
      [newRow, name],
      (err) => {
        if (err) {
          console.log(err.message);
          result.error = err.message;
        }
      }
    );
  });
  return result?.error ? result : { content: true };
}

function deleteFromTags(
  db: sqlite3.Database,
  name: string,
  id: string,
  assignment = true
) {
  let table = "tags";
  if (!assignment) {
    table = "moduleTags";
  }
  let row = _getTag(db, name);
  if (!row.content) {
    return row;
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
        result = _updateTag(db, name, newRow);
        if (result?.error) {
          return result;
        }
      } else {
        db.serialize(() => {
          db.run(`DELETE FROM ${table} WHERE name = ?`, [name], (err) => {
            if (err) {
              console.log(err.message);
              result.error = err.message;
            }
          });
        });
      }
    }
  }
  return result.error ? result : { content: true };
}

function _getTag(
  db: sqlite3.Database,
  name: string,
  assignment = true
): DatabaseResult {
  let result: DatabaseResult = {};
  let table = "tags";
  let key = "assignments";
  if (!assignment) {
    table = "moduleTags";
    key = "modules";
  }
  db.serialize(() => {
    db.get(
      `SELECT ${key} rowKey FROM ${table} WHERE name = ?`,
      [name],
      (err, row: { rowKey?: string }) => {
        if (err) {
          console.log(err.message);
          result.error = err.message;
        } else if (row) {
          result.content = row.rowKey;
        }
      }
    );
  });
  return result;
}

function updateTags(
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

  toDelete.every((value) => {
    result = deleteFromTags(db, value, id, assignment);
    if (result?.error) return false;
    return true;
  });

  toAdd.every((value) => {
    result = addTag(db, value, id, assignment);
    if (result?.error) return false;
    return true;
  });
  return result;
}

function addModuleTags(
  db: sqlite3.Database,
  tags: Array<string>,
  moduleID: string
) {
  let result: DatabaseResult = {};
  db.serialize(() => {
    tags.some((tag) => {
      result = addTag(db, tag, moduleID, false);
      if (result?.error) {
        return true;
      } else {
        return false;
      }
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
            console.error(err.message);
            reject({ error: err.message });
          } else {
            resolve({ message: "Assignment inserted successfully" });
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

    const assignmentPath = path.join("assignmentData", assignment.assignmentID);

    result = await addToAssignments(db, assignmentPath, assignment);
    if (result?.error) {
      throw new Error(result.error);
    }

    result = await addAssignmentTags(
      db,
      assignment.tags,
      assignment.assignmentID
    );
    if (result?.error) {
      throw new Error(result.error);
    }

    closeDB(db);

    return { content: true };
  } catch (err) {
    console.error("Unexpected error:", err);

    return { error: (err as Error).message };
  }
}

export function getAssignmentFromDatabase(
  coursePath: string,
  id: string
): DatabaseResult {
  const rValue = openDB(coursePath);
  if (rValue?.error) {
    return rValue;
  }
  let db = rValue.content as sqlite3.Database;
  let result: DatabaseResult = {};
  db.serialize(() => {
    db.get(`SELECT * FROM assignments WHERE id = ?`, [id], (err, row) => {
      if (err) {
        console.log(err.message);
        result.error = err.message;
      } else if (row) {
        result.content = row as CodeAssignmentDatabase;
        result.content.isExpanding = result.content.isExpanding ? true : false;
      } else {
        console.log("Could not find assignment from database.");
        result.error = "Could not find assignment from database.";
      }
    });
  });
  closeDB(db);
  return result;
}

export function updateAssignmentToDatabase(
  coursePath: string,
  assignment: CodeAssignmentData
) {
  const getResult = getAssignmentFromDatabase(
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
  const rValue = openDB(coursePath);
  if (rValue?.error) {
    return rValue;
  }
  let db = rValue.content as sqlite3.Database;
  let error: DatabaseResult = {};
  if (oldAssignment.title !== assignment.title) {
    sql += `title = ?\n`;
    params.push(assignment.title);
  }
  if (oldAssignment.tags !== assignment.tags.toString()) {
    error = updateTags(
      db,
      oldAssignment.tags,
      assignment.tags,
      assignment.assignmentID
    );
    if (error?.error) return error;
  }
  if (oldAssignment.module !== assignment.module) {
    sql += `module = ?\n`;
    params.push(assignment.module);
  }
  if (oldAssignment.position !== assignment.assignmentNo.toString()) {
    sql += `position = ?\n`;
    params.push(assignment.assignmentNo.toString());
  }
  if (oldAssignment.level !== assignment.level) {
    sql += `level = ?\n`;
    params.push(assignment.level);
  }
  if (oldAssignment.isExpanding !== isExpanding(assignment)) {
    sql += `isExpanding = ?\n`;
    params.push(isExpanding(assignment) ? 1 : 0);
  }

  if (sql !== `UPDATE assignments SET `) {
    sql += `WHERE id = ?`;
    params.push(assignment.assignmentID);

    db.serialize(() => {
      db.run(sql, params, (err) => {
        if (err) {
          console.log(err.message);
          error.error = err.message;
        }
      });
    });
  }
  closeDB(db);
  return error?.error ? error : { content: true };
}

export function deleteAssignmentFromDatabase(
  coursePath: string,
  assignmentID: string
) {
  const getResult = getAssignmentFromDatabase(coursePath, assignmentID);
  if (getResult?.error) {
    return getResult;
  } else if (!getResult.content) {
    return {
      error: "Assignment does not exist in the database, cannot update.",
    };
  }
  const oldAssignment = getResult.content as CodeAssignmentDatabase;
  const rValue = openDB(coursePath);
  if (rValue?.error) {
    return rValue;
  }
  let db = rValue.content as sqlite3.Database;
  let result: DatabaseResult = {};
  oldAssignment.tags.split(",").forEach((tag) => {
    deleteFromTags(db, tag, assignmentID);
  });
  db.serialize(() => {
    db.run(`DELETE FROM assignments WHERE id = ?`, [assignmentID], (err) => {
      if (err) {
        console.log(err.message);
        result.error = err.message;
      }
    });
  });
  return result?.error ? result : { content: true };
}

// Module
export function getModuleFromDatabase(coursePath: string, moduleId: number) {
  const rValue = openDB(coursePath);
  if (rValue?.error) {
    return rValue;
  }
  let db = rValue.content as sqlite3.Database;
  let result: DatabaseResult = {};
  db.serialize(() => {
    db.get(
      `SELECT * FROM modules WHERE id = ?`,
      [moduleId],
      (err, row: ModuleDatabase) => {
        if (err) {
          console.log(err.message);
          result.error = err.message;
        } else if (row) {
          result.content = {};
          result.content.ID = row.id;
          result.content.name = row.name;
          result.content.tags = row.tags.split(",");
          result.content.assignments = row.assignments;
          result.content.subjects = row.subjects;
          result.content.letters = row.letters ? true : false;
          result.content.instructions = row.instructions;
        } else {
          console.log("Could not find assignment from database.");
          result.error = "Could not find assignment from database.";
        }
      }
    );
  });
  closeDB(db);
  return result;
}

export function addModuleToDatabase(coursePath: string, module: ModuleData) {
  const rValue = openDB(coursePath);
  if (rValue?.error) {
    return rValue;
  }
  let db = rValue.content as sqlite3.Database;
  let result: DatabaseResult = {};
  db.serialize(() => {
    db.run(
      `INSERT INTO modules(id, name, tags, assignments, subjects, letters, instructions) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          console.log(err.message);
          result.error = err.message;
        }
      }
    );
    if (!result?.error) {
      result = addModuleTags(db, module.tags, module.ID.toString());
    }
  });
  return result?.error ? result : { content: true };
}

export function updateModuleToDatabase(coursePath: string, module: ModuleData) {
  const getResult = getModuleFromDatabase(coursePath, module.ID);
  if (getResult.error) {
    return getResult;
  } else if (!getResult.content) {
    return {
      error: "Module does not exist in the database, cannot update.",
    };
  }
  const oldModule = getResult.content;
  let result: DatabaseResult = {};
  let sql = `UPDATE modules SET `;
  let params = [];
  const rValue = openDB(coursePath);
  if (rValue?.error) {
    return rValue;
  }
  let db = rValue.content as sqlite3.Database;
  if (oldModule.name !== module.name) {
    sql += `name = ?\n`;
    params.push(module.name);
  }
  if (oldModule.tags.toString() !== module.tags.toString()) {
    result = updateTags(
      db,
      oldModule.tags.toString(),
      module.tags,
      module.ID.toString(),
      false
    );
    if (result?.error) return result;
  }
  if (oldModule.assignments !== module.assignments) {
    sql += `assignments = ?\n`;
    params.push(module.assignments);
  }
  if (oldModule.subjects !== module.subjects) {
    sql += `subjects = ?\n`;
    params.push(module.subjects);
  }
  if (oldModule.letters !== module.letters) {
    sql += `letters = ?\n`;
    params.push(module.letters ? 1 : 0);
  }
  if (oldModule.instructions !== module.instructions) {
    sql += `instructions = ?\n`;
    params.push(module.instructions);
  }

  if (sql !== `UPDATE assignments SET `) {
    sql += `WHERE id = ?`;
    params.push(module.ID);

    db.serialize(() => {
      db.run(sql, params, (err) => {
        if (err) {
          console.log(err.message);
          result.error = err.message;
        }
      });
    });
  }
  closeDB(db);
  return result?.error ? result : { content: true };
}

export function deleteModule(coursePath: string, moduleID: number) {
  const getResult = getModuleFromDatabase(coursePath, moduleID);
  if (getResult?.error) {
    return getResult;
  } else if (!getResult.content) {
    return {
      error: "Assignment does not exist in the database, cannot update.",
    };
  }
  const oldModule = getResult.content as ModuleData;
  let result: DatabaseResult = {};
  const rValue = openDB(coursePath);
  if (rValue?.error) {
    return rValue;
  }
  let db = rValue.content as sqlite3.Database;
  oldModule.tags.forEach((tag) => {
    deleteFromTags(db, tag, moduleID.toString());
  });
  db.serialize(() => {
    db.run(`DELETE FROM modules WHERE id = ?`, [moduleID], (err) => {
      if (err) {
        console.log(err.message);
        result.error = err.message;
      }
    });
  });
  return result?.error ? result : { content: true };
}
