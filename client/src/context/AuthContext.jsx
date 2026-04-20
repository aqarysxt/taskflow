import { createContext, useContext, useState, useEffect } from 'react';
const API_BASE = 'http://localhost:5002/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();
        setAllUsers(users);

        const savedId = localStorage.getItem('taskflow-user-id');
        if (savedId) {
          const found = users.find(u => u.id === savedId);
          if (found) {
            setUser({ id: found.id, name: found.name, email: found.email, role: found.role, avatar: found.avatar });
          }
        }
      } catch (err) {
        console.error('Failed to init auth:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const login = async (email, password) => {
    const found = allUsers.find(u => u.email === email && u.password === password);
    if (!found) return false;
    const userData = { id: found.id, name: found.name, email: found.email, role: found.role, avatar: found.avatar };
    setUser(userData);
    localStorage.setItem('taskflow-user-id', found.id);
    return true;
  };

  const register = async (name, email, password) => {
    if (allUsers.find(u => u.email === email)) return false;
    const newUser = { id: crypto.randomUUID(), name, email, password, role: 'mvp', avatar: null };
    try {
      await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      setAllUsers(prev => [...prev, newUser]);
      const userData = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: null };
      setUser(userData);
      localStorage.setItem('taskflow-user-id', newUser.id);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskflow-user-id');
  };

  const updateProfile = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    const full = allUsers.find(u => u.id === updated.id);
    if (full) {
      const updatedFull = { ...full, ...updates };
      try {
        await fetch(`${API_BASE}/users/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        setAllUsers(prev => prev.map(u => u.id === updated.id ? updatedFull : u));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  const getAllUsers = () => allUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar }));

  const addUser = async (userData) => {
    if (allUsers.find(u => u.email === userData.email)) return false;
    const newUser = { id: crypto.randomUUID(), name: userData.name, email: userData.email, password: userData.password || 'mvp123', role: userData.role || 'mvp', avatar: null };
    try {
      await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      setAllUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteUser = async (userId) => {
    if (userId === user?.id) return false;
    try {
      await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    const u = allUsers.find(x => x.id === userId);
    if (!u) return;
    const updated = { ...u, role: newRole };
    try {
      await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      setAllUsers(prev => prev.map(x => x.id === userId ? updated : x));
    } catch (e) {
      console.error(e);
    }
  };

  const getUserById = (userId) => {
    const u = allUsers.find(x => x.id === userId);
    return u ? { id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar } : null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout, updateProfile, getAllUsers, addUser, deleteUser, updateUserRole, getUserById }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
