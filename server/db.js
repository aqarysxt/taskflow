import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    // initialize tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      avatar TEXT
    )`, (err) => {
        if (!err) {
            // Seed users if empty
            db.get("SELECT count(*) as count FROM users", (err, row) => {
                if (row.count === 0) {
                    const insert = "INSERT INTO users (id, name, email, password, role, avatar) VALUES (?,?,?,?,?,?)";
                    db.run(insert, ["admin-1", "Admin User", "admin@taskflow.com", "admin123", "admin", null]);
                    db.run(insert, ["mvp-alice", "Alice Johnson", "alice@taskflow.com", "mvp123", "mvp", null]);
                    db.run(insert, ["mvp-bob", "Bob Smith", "bob@taskflow.com", "mvp123", "mvp", null]);
                    db.run(insert, ["mvp-charlie", "Charlie Davis", "charlie@taskflow.com", "mvp123", "mvp", null]);
                }
            });
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      color TEXT,
      assignedUserIds TEXT
    )`, (err) => {
        if (!err) {
            db.get("SELECT count(*) as count FROM projects", (err, row) => {
                if (row.count === 0) {
                    const insert = "INSERT INTO projects (id, name, description, color, assignedUserIds) VALUES (?,?,?,?,?)";
                    db.run(insert, ["p1", "Website Redesign", "Complete website overhaul", "#3b82f6", JSON.stringify(["mvp-alice", "mvp-bob"])]);
                    db.run(insert, ["p2", "Mobile App", "iOS and Android app development", "#8b5cf6", JSON.stringify(["mvp-alice", "mvp-charlie"])]);
                    db.run(insert, ["p3", "Marketing Campaign", "Q1 marketing activities", "#10b981", JSON.stringify(["mvp-bob", "mvp-charlie"])]);
                    db.run(insert, ["p4", "Data Analytics", "Analytics dashboard build", "#f59e0b", JSON.stringify(["mvp-alice", "mvp-charlie"])]);
                }
            });
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      status TEXT,
      priority TEXT,
      deadline TEXT,
      deadlineTime TEXT,
      projectId TEXT,
      assigneeId TEXT,
      isShared INTEGER,
      attachments TEXT,
      createdAt TEXT
    )`, (err) => {
        if (!err) {
            db.get("SELECT count(*) as count FROM tasks", (err, row) => {
                if (row.count === 0) {
                    const insert = `INSERT INTO tasks (id, title, description, status, priority, deadline, deadlineTime, projectId, assigneeId, isShared, attachments, createdAt)
                                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
                    db.run(insert, ['t1', 'Design homepage mockup', 'Create high-fidelity mockup', 'completed', 'high', '2026-03-10', '17:00', 'p1', 'mvp-alice', 0, JSON.stringify([{ name: 'mockup-v1.fig', url: '#' }]), '2026-03-01']);
                    db.run(insert, ['t2', 'Implement user authentication', 'Set up login and registration flows', 'in_progress', 'high', '2026-03-18', '12:00', 'p1', 'mvp-bob', 0, JSON.stringify([]), '2026-03-02']);
                    db.run(insert, ['t3', 'Create REST API endpoints', 'Build CRUD endpoints for tasks and projects', 'in_progress', 'medium', '2026-03-20', '18:00', 'p1', 'mvp-charlie', 0, JSON.stringify([]), '2026-03-03']);
                    db.run(insert, ['t4', 'Setup CI/CD pipeline', 'Configure GitHub Actions', 'pending', 'medium', '2026-03-25', '10:00', 'p2', 'mvp-alice', 0, JSON.stringify([]), '2026-03-04']);
                    db.run(insert, ['t5', 'Design app navigation', 'Create navigation flow and component hierarchy', 'completed', 'high', '2026-03-08', '14:00', 'p2', 'mvp-charlie', 0, JSON.stringify([{ name: 'nav-flow.pdf', url: '#' }]), '2026-03-01']);
                    db.run(insert, ['t6', 'Write unit tests', 'Add comprehensive test coverage', 'pending', 'low', '2026-03-28', '16:00', 'p2', 'mvp-bob', 0, JSON.stringify([]), '2026-03-05']);
                    db.run(insert, ['t7', 'Create social media content', 'Design posts for Instagram and Twitter', 'in_progress', 'medium', '2026-03-15', '11:00', 'p3', 'mvp-bob', 0, JSON.stringify([]), '2026-03-02']);
                    db.run(insert, ['t8', 'Email newsletter design', 'Design the monthly newsletter template', 'pending', 'low', '2026-03-22', '09:00', 'p3', 'mvp-charlie', 0, JSON.stringify([]), '2026-03-03']);
                    db.run(insert, ['t9', 'Build analytics dashboard', 'Create interactive charts for KPI tracking', 'in_progress', 'high', '2026-03-19', '15:00', 'p4', 'mvp-charlie', 0, JSON.stringify([]), '2026-03-04']);
                    db.run(insert, ['t10', 'Database optimization', 'Optimize slow queries and add indexes', 'pending', 'medium', '2026-03-30', '13:00', 'p4', 'mvp-alice', 0, JSON.stringify([]), '2026-03-06']);
                    db.run(insert, ['t11', 'Team standup notes', 'Shared document for daily standup', 'in_progress', 'low', '2026-03-31', '09:00', 'p1', 'mvp-alice', 1, JSON.stringify([{ name: 'standup-template.docx', url: '#' }]), '2026-03-01']);
                    db.run(insert, ['t12', 'Performance testing', 'Load test the application', 'pending', 'high', '2026-03-26', '10:00', 'p1', 'mvp-bob', 0, JSON.stringify([]), '2026-03-07']);
                }
            });
        }
    });

  }
});

// Create promises wrappers
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};
