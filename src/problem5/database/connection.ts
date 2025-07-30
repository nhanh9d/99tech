import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../../data/problem5.db');

// Create database instance
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create resources table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS resources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          price REAL NOT NULL CHECK(price >= 0),
          quantity INTEGER NOT NULL CHECK(quantity >= 0),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Resources table created or already exists');

            // Create trigger to update the updated_at column
            db.run(
              `
            CREATE TRIGGER IF NOT EXISTS update_resources_timestamp 
            AFTER UPDATE ON resources
            FOR EACH ROW
            BEGIN
              UPDATE resources SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
          `,
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          }
        }
      );
    });
  });
};

// Promisified database methods
export const runQuery = (sql: string, params: any[] = []): Promise<{ changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};

export const getQuery = <T>(
  sql: string,
  params: any[] = []
): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
};

export const allQuery = <T>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};
