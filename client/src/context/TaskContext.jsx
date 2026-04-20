import { createContext, useContext, useState, useEffect } from 'react';
const API_BASE = 'http://localhost:5002/api';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [tRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/tasks`),
          fetch(`${API_BASE}/projects`)
        ]);
        const [t, p] = await Promise.all([tRes.json(), pRes.json()]);
        setTasks(t);
        setProjects(p);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const getVisibleTasks = (userId, role) => {
    if (role === 'admin') return tasks;
    return tasks.filter(t => t.assigneeId === userId || t.isShared);
  };

  const getVisibleProjects = (userId, role) => {
    if (role === 'admin') return projects;
    // MVPs see projects they are assigned to
    return projects.filter(p => p.assignedUserIds?.includes(userId));
  };

  const addTask = async (task) => {
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
      status: task.status || 'pending',
      attachments: task.attachments || [],
      isShared: task.isShared || false,
      deadlineTime: task.deadlineTime || '12:00',
    };
    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      setTasks(prev => [newTask, ...prev]);
    } catch (e) {
      console.error(e);
    }
    return newTask;
  };

  const updateTask = async (id, updates) => {
    const existing = tasks.find(t => t.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    try {
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch(e) { console.error(e); }
  };

  const addProject = async (project) => {
    const newProject = { ...project, id: crypto.randomUUID(), assignedUserIds: project.assignedUserIds || [] };
    try {
      await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      setProjects(prev => [newProject, ...prev]);
    } catch(e) { console.error(e); }
    return newProject;
  };

  const updateProject = async (id, updates) => {
    const existing = projects.find(p => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    try {
      await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    } catch(e) { console.error(e); }
  };

  const deleteProject = async (id) => {
    try {
      await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.projectId !== id));
    } catch(e) { console.error(e); }
  };

  const getTasksByProject = (projectId) => tasks.filter(t => t.projectId === projectId);
  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const getStats = (userId, role) => {
    const visible = getVisibleTasks(userId, role);
    return {
      total: visible.length,
      completed: visible.filter(t => t.status === 'completed').length,
      inProgress: visible.filter(t => t.status === 'in_progress').length,
      pending: visible.filter(t => t.status === 'pending').length,
      overdue: visible.filter(t => {
        if (t.status === 'completed') return false;
        return new Date(t.deadline) < new Date();
      }).length,
    };
  };

  return (
    <TaskContext.Provider value={{
      tasks, projects, loaded,
      getVisibleTasks, getVisibleProjects, getStats,
      addTask, updateTask, deleteTask,
      addProject, updateProject, deleteProject,
      getTasksByProject, getTasksByStatus
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};
