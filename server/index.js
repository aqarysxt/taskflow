import express from 'express';
import cors from 'cors';
import { query, run } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// USERS
app.get('/api/users', async (req, res) => {
  try {
    const users = await query('SELECT * FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { id, name, email, password, role, avatar } = req.body;
  try {
    await run('INSERT INTO users (id, name, email, password, role, avatar) VALUES (?,?,?,?,?,?)', [id, name, email, password, role, avatar]);
    res.json({ id, name, email, role, avatar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const setParts = [];
  const vals = [];
  for (const [k, v] of Object.entries(updates)) {
    if (k !== 'id') {
      setParts.push(`${k} = ?`);
      vals.push(v);
    }
  }
  if (setParts.length === 0) return res.json({ id });
  vals.push(id);
  try {
    await run(`UPDATE users SET ${setParts.join(', ')} WHERE id = ?`, vals);
    res.json({ id, ...updates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROJECTS
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await query('SELECT * FROM projects');
    // parse assignedUserIds
    res.json(projects.map(p => ({
      ...p,
      assignedUserIds: p.assignedUserIds ? JSON.parse(p.assignedUserIds) : []
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  const { id, name, description, color, assignedUserIds } = req.body;
  try {
    await run('INSERT INTO projects (id, name, description, color, assignedUserIds) VALUES (?,?,?,?,?)', 
      [id, name, description, color, JSON.stringify(assignedUserIds || [])]);
    res.json(req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const setParts = [];
  const vals = [];
  for (const [k, v] of Object.entries(updates)) {
    if (k !== 'id') {
      setParts.push(`${k} = ?`);
      vals.push(k === 'assignedUserIds' ? JSON.stringify(v || []) : v);
    }
  }
  if (setParts.length === 0) return res.json({ id });
  vals.push(id);
  try {
    await run(`UPDATE projects SET ${setParts.join(', ')} WHERE id = ?`, vals);
    res.json({ id, ...updates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    await run('DELETE FROM tasks WHERE projectId = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TASKS
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await query('SELECT * FROM tasks');
    res.json(tasks.map(t => ({
      ...t,
      isShared: Boolean(t.isShared),
      attachments: t.attachments ? JSON.parse(t.attachments) : []
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { id, title, description, status, priority, deadline, deadlineTime, projectId, assigneeId, isShared, attachments, createdAt } = req.body;
  try {
    await run(`INSERT INTO tasks (id, title, description, status, priority, deadline, deadlineTime, projectId, assigneeId, isShared, attachments, createdAt) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, 
      [id, title, description, status, priority, deadline, deadlineTime, projectId, assigneeId, isShared ? 1 : 0, JSON.stringify(attachments || []), createdAt]);
    res.json(req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const setParts = [];
  const vals = [];
  for (const [k, v] of Object.entries(updates)) {
    if (k !== 'id') {
      setParts.push(`${k} = ?`);
      let val = v;
      if (k === 'isShared') val = v ? 1 : 0;
      if (k === 'attachments') val = JSON.stringify(v || []);
      vals.push(val);
    }
  }
  if (setParts.length === 0) return res.json({ id });
  vals.push(id);
  try {
    await run(`UPDATE tasks SET ${setParts.join(', ')} WHERE id = ?`, vals);
    res.json({ id, ...updates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
