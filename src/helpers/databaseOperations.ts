import sqlite3 from "sqlite3";
import path from "path";
import { CodeAssignmentData, CodeAssignmentDatabase } from "../types";
import { isExpanding } from "./assignment";

// Database connection
function openDB(coursePath: string) {
  const dbPath = path.join(coursePath, "database", "database.db");
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the database.");
  });
  return db;
}

function closeDB(db: sqlite3.Database) {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Close the database connection.");
  });
}

// Database initialization
export function initDB(coursePath: string) {
  let db = openDB(coursePath);
  db.serialize(() => {
    db.run(
      `CREATE TABLE assignments (
                id TEXT PRIMARY KEY
                type TEXT NOT NULL
                title TEXT NOT NULL
                tags TEXT
                module INTEGER
                position TEXT NOT NULL
                level INTEGER
                isExpanding TEXT NOT NULL
                path TEXT NOT NULL);`,
      (err) => {
        console.log(err.message);
      }
    );
    db.run(
      `CREATE TABLE modules (
                moduleId TEXT PRIMARY KEY
                name TEXT NOT NULL
                tags TEXT
                assignments INTEGER
                subjects TEXT
                letters TEXT
                instructions TEXT);`,
      (err) => {
        console.log(err.message);
      }
    );
    db.run(
      `CREATE TABLE tags (
                name TEXT PRIMARY KEY
                assignments TEXT NOT NULL);`,
      (err) => {
        console.log(err.message);
      }
    );
    db.run(
      `CREATE TABLE moduleTags (
                  name TEXT PRIMARY KEY
                  modules TEXT NOT NULL);`,
      (err) => {
        console.log(err.message);
      }
    );
  });
  closeDB(db);
}

// Tags
function addTag(
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
  db.serialize(() => {
    db.get(
      `SELECT ${key} rowKey FROM ${table} WHERE name = ?`,
      [tag],
      (err, row: { rowKey?: string }) => {
        if (err) {
          console.log(err.message);
        } else if (row) {
          const oldRow = row.rowKey.split(",");
          if (
            !oldRow.filter((value) => {
              return value === id ? true : false;
            })
          ) {
            let newRow = row.rowKey + `,${id}`;
            db.run(
              `UPDATE ${table} SET ${key} = ? WHERE name = ?`,
              [newRow, tag],
              (err) => {
                console.log(err.message);
              }
            );
          }
        } else {
          db.run(`INSERT INTO ${table} VALUES (?, ?)`, [tag, id], (err) => {
            console.log(err.message);
          });
        }
      }
    );
  });
}

function addAssignmentTags(
  db: sqlite3.Database,
  tags: Array<string>,
  assignmentID: string
) {
  db.serialize(() => {
    tags.forEach((tag) => {
      addTag(db, tag, assignmentID);
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
  db.serialize(() => {
    db.run(
      `UPDATE ${table} SET ${key} = ? WHERE name = ?`,
      [newRow, name],
      (err) => {
        console.log(err.message);
      }
    );
  });
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
  if (row) {
    if (row.split(",").includes(id)) {
      let newRow = row
        .split(",")
        .filter((value) => {
          value !== id;
        })
        .toString();
      if (newRow.length !== 0) {
        _updateTag(db, name, newRow);
      } else {
        db.serialize(() => {
          db.run(`DELETE FROM ${table} WHERE name = ?`, [name], (err) => {
            console.log(err.message);
          });
        });
      }
    }
  }
}

function _getTag(
  db: sqlite3.Database,
  name: string,
  assignment = true
): string | null {
  let result: string = null;
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
        } else if (row) {
          result = row.rowKey;
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

  let toDelete: Array<string> = [];
  let toAdd: Array<string> = [];
  oldTagsArray.every((value) => {
    if (!newTags.includes(value)) {
      toDelete.push(value);
    }
  });
  newTags.every((value) => {
    if (!oldTagsArray.includes(value)) {
      toAdd.push(value);
    }
  });

  toDelete.every((value) => {
    deleteFromTags(db, value, id, assignment);
  });

  toAdd.every((value) => {
    addTag(db, value, id, assignment);
  });
}

// Assignment
function addToAssignments(
  db: sqlite3.Database,
  assignmentPath: string,
  assignment: CodeAssignmentData
) {
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
        console.log(err.message);
      }
    );
  });
}

export function addAssignmentToDatabase(
  coursePath: string,
  assignment: CodeAssignmentData
) {
  let db = openDB(coursePath);
  const assignmentPath = path.join("assignmentData", assignment.assignmentID);
  addToAssignments(db, assignmentPath, assignment);
  addAssignmentTags(db, assignment.tags, assignment.assignmentID);
  closeDB(db);
}

export function getAssignmentFromDatabase(
  coursePath: string,
  id: string
): CodeAssignmentDatabase | null {
  let db = openDB(coursePath);
  let result: CodeAssignmentDatabase | null = null;
  db.serialize(() => {
    db.get(`SELECT * FROM assignments WHERE id = ?`, [id], (err, row) => {
      if (err) {
        console.log(err.message);
      } else if (row) {
        result = row as CodeAssignmentDatabase;
        result.isExpanding = result.isExpanding ? true : false;
      } else {
        console.log("Could not find assignment from database.");
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
  const oldAssignment = getAssignmentFromDatabase(
    coursePath,
    assignment.assignmentID
  );
  if (!oldAssignment) {
    throw new Error(
      "Assignment does not exist in the database, cannot update."
    );
  }
  let sql = `UPDATE assignments SET `;
  let params = [];
  let db = openDB(coursePath);
  if (oldAssignment.title !== assignment.title) {
    sql += `title = ?\n`;
    params.push(assignment.title);
  }
  if (oldAssignment.tags !== assignment.tags.toString()) {
    updateTags(
      db,
      oldAssignment.tags,
      assignment.tags,
      assignment.assignmentID
    );
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
    sql += `level = ?`;
    params.push(assignment.level);
  }
  if (oldAssignment.isExpanding !== isExpanding(assignment)) {
    sql += `isExpanding = ?`;
    params.push(isExpanding(assignment) ? 1 : 0);
  }

  if (sql !== `UPDATE assignments SET `) {
    sql += `WHERE id = ?`;
    params.push(assignment.assignmentID);

    db.serialize(() => {
      db.run(sql, params, (err) => {
        console.log(err.message);
      });
    });
  }
  closeDB(db);
}

export function deleteAssignmentFromDatabase(
  coursePath: string,
  assignmentID: string
) {
  const oldAssignment = getAssignmentFromDatabase(coursePath, assignmentID);
  let db = openDB(coursePath);
  oldAssignment.tags.split(",").forEach((tag) => {
    deleteFromTags(db, tag, assignmentID);
  });
  db.serialize(() => {
    db.run(`DELETE FROM assignments WHERE id = ?`, [assignmentID], (err) => {
      console.log(err.message);
    });
  });
}

// Module tags

// Module
