import Dexie from 'dexie';

export const db = new Dexie('TaskFlowDB');

db.version(1).stores({
  users:    'id, email, role',
  tasks:    'id, assigneeId, projectId, status, deadline',
  projects: 'id',
  kvstore:  'key',
});

export const DEMO_USERS = [
  { id: 'admin-1',    name: 'Admin User',     email: 'admin@taskflow.com',   password: 'admin123', role: 'admin', avatar: null },
  { id: 'mvp-alice',  name: 'Alice Johnson',  email: 'alice@taskflow.com',   password: 'mvp123',   role: 'mvp',   avatar: null },
  { id: 'mvp-bob',    name: 'Bob Smith',       email: 'bob@taskflow.com',     password: 'mvp123',   role: 'mvp',   avatar: null },
  { id: 'mvp-charlie',name: 'Charlie Davis',  email: 'charlie@taskflow.com', password: 'mvp123',   role: 'mvp',   avatar: null },
];

export const SAMPLE_PROJECTS = [
  { id: 'p1', name: 'Website Redesign',   description: 'Complete website overhaul',            color: '#3b82f6', assignedUserIds: ['mvp-alice', 'mvp-bob'] },
  { id: 'p2', name: 'Mobile App',         description: 'iOS and Android app development',      color: '#8b5cf6', assignedUserIds: ['mvp-alice', 'mvp-charlie'] },
  { id: 'p3', name: 'Marketing Campaign', description: 'Q1 marketing activities',              color: '#10b981', assignedUserIds: ['mvp-bob', 'mvp-charlie'] },
  { id: 'p4', name: 'Data Analytics',     description: 'Analytics dashboard build',            color: '#f59e0b', assignedUserIds: ['mvp-alice', 'mvp-charlie'] },
];

export const SAMPLE_TASKS = [
  { id: 't1',  title: 'Design homepage mockup',        description: 'Create high-fidelity mockup',                    status: 'completed',  priority: 'high',   deadline: '2026-03-10', deadlineTime: '17:00', projectId: 'p1', assigneeId: 'mvp-alice',   isShared: false, attachments: [{ name: 'mockup-v1.fig', url: '#' }], createdAt: '2026-03-01' },
  { id: 't2',  title: 'Implement user authentication', description: 'Set up login and registration flows',            status: 'in_progress',priority: 'high',   deadline: '2026-03-18', deadlineTime: '12:00', projectId: 'p1', assigneeId: 'mvp-bob',     isShared: false, attachments: [], createdAt: '2026-03-02' },
  { id: 't3',  title: 'Create REST API endpoints',     description: 'Build CRUD endpoints for tasks and projects',    status: 'in_progress',priority: 'medium', deadline: '2026-03-20', deadlineTime: '18:00', projectId: 'p1', assigneeId: 'mvp-charlie', isShared: false, attachments: [], createdAt: '2026-03-03' },
  { id: 't4',  title: 'Setup CI/CD pipeline',          description: 'Configure GitHub Actions',                       status: 'pending',    priority: 'medium', deadline: '2026-03-25', deadlineTime: '10:00', projectId: 'p2', assigneeId: 'mvp-alice',   isShared: false, attachments: [], createdAt: '2026-03-04' },
  { id: 't5',  title: 'Design app navigation',         description: 'Create navigation flow and component hierarchy', status: 'completed',  priority: 'high',   deadline: '2026-03-08', deadlineTime: '14:00', projectId: 'p2', assigneeId: 'mvp-charlie', isShared: false, attachments: [{ name: 'nav-flow.pdf', url: '#' }], createdAt: '2026-03-01' },
  { id: 't6',  title: 'Write unit tests',              description: 'Add comprehensive test coverage',                status: 'pending',    priority: 'low',    deadline: '2026-03-28', deadlineTime: '16:00', projectId: 'p2', assigneeId: 'mvp-bob',     isShared: false, attachments: [], createdAt: '2026-03-05' },
  { id: 't7',  title: 'Create social media content',   description: 'Design posts for Instagram and Twitter',         status: 'in_progress',priority: 'medium', deadline: '2026-03-15', deadlineTime: '11:00', projectId: 'p3', assigneeId: 'mvp-bob',     isShared: false, attachments: [], createdAt: '2026-03-02' },
  { id: 't8',  title: 'Email newsletter design',       description: 'Design the monthly newsletter template',         status: 'pending',    priority: 'low',    deadline: '2026-03-22', deadlineTime: '09:00', projectId: 'p3', assigneeId: 'mvp-charlie', isShared: false, attachments: [], createdAt: '2026-03-03' },
  { id: 't9',  title: 'Build analytics dashboard',     description: 'Create interactive charts for KPI tracking',    status: 'in_progress',priority: 'high',   deadline: '2026-03-19', deadlineTime: '15:00', projectId: 'p4', assigneeId: 'mvp-charlie', isShared: false, attachments: [], createdAt: '2026-03-04' },
  { id: 't10', title: 'Database optimization',         description: 'Optimize slow queries and add indexes',          status: 'pending',    priority: 'medium', deadline: '2026-03-30', deadlineTime: '13:00', projectId: 'p4', assigneeId: 'mvp-alice',   isShared: false, attachments: [], createdAt: '2026-03-06' },
  { id: 't11', title: 'Team standup notes',            description: 'Shared document for daily standup',             status: 'in_progress',priority: 'low',    deadline: '2026-03-31', deadlineTime: '09:00', projectId: 'p1', assigneeId: 'mvp-alice',   isShared: true,  attachments: [{ name: 'standup-template.docx', url: '#' }], createdAt: '2026-03-01' },
  { id: 't12', title: 'Performance testing',           description: 'Load test the application',                     status: 'pending',    priority: 'high',   deadline: '2026-03-26', deadlineTime: '10:00', projectId: 'p1', assigneeId: 'mvp-bob',     isShared: false, attachments: [], createdAt: '2026-03-07' },
];

export async function seedDatabase() {
  const userCount = await db.users.count();
  if (userCount === 0) {
    await db.users.bulkPut(DEMO_USERS);
  }
  const projectCount = await db.projects.count();
  if (projectCount === 0) {
    await db.projects.bulkPut(SAMPLE_PROJECTS);
  }
  const taskCount = await db.tasks.count();
  if (taskCount === 0) {
    await db.tasks.bulkPut(SAMPLE_TASKS);
  }
}
