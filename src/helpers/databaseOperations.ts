import sqlite3 from "sqlite3";
import path from "path";
import { CodeAssignmentData } from "../types";
import { isExpanding } from "./assignment";

function openDB(coursePath: string) {
  const dbPath = path.join(coursePath, "database");
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

function addToAssignments(
  db: sqlite3.Database,
  assignmentPath: string,
  assignment: CodeAssignmentData
) {
  db.serialize(() => {
    db.run(
      `INSERT INTO assignments(id, type, title, tags, module, position, level, isExpanding, path) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assignment.assignmentID,
        assignment.assignmentType,
        assignment.title,
        assignment.tags.toString(),
        assignment.module,
        assignment.assignmentNo.toString(),
        assignment.level,
        isExpanding(assignment),
        assignmentPath,
      ],
      (err) => {
        console.log(err.message);
      }
    );
  });
}

function addToTags(db: sqlite3.Database, assignment: CodeAssignmentData) {
  db.serialize(() => {
    assignment.tags.forEach((tag) => {
      db.each(
        `SELECT assignments FROM tags WHERE name = ?`,
        [tag],
        (err, row: { assignment?: string }) => {
          if (err) {
            console.log(err.message);
          } else if (row) {
            let newRow = row.assignment + `,${assignment.assignmentID}`;
            db.run(
              `UPDATE tags SET name = ? WHERE name = ?`,
              [newRow, tag],
              (err) => {
                console.log(err.message);
              }
            );
          } else {
            db.run(
              `INSERT INTO tags VALUES (?, ?)`,
              [tag, assignment.assignmentID],
              (err) => {
                console.log(err.message);
              }
            );
          }
        }
      );
    });
  });
}
