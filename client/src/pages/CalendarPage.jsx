import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { IconChevronLeft, IconChevronRight } from '../components/icons/Icons';
import TaskModal from './TaskModal';
import './CalendarPage.css';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 to 20:00

function formatHour(h) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const { user, getUserById } = useAuth();
  const { getVisibleTasks, getVisibleProjects } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultDeadline, setDefaultDeadline] = useState(null);
  const [defaultDeadlineTime, setDefaultDeadlineTime] = useState(null);

  const visibleTasks    = getVisibleTasks(user?.id, user?.role);
  const visibleProjects = getVisibleProjects(user?.id, user?.role);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date  = currentDate.getDate();
  const months   = t('calendar.months', { returnObjects: true });
  const weekdays = Array.isArray(t('calendar.weekdays', { returnObjects: true }))
    ? t('calendar.weekdays', { returnObjects: true })
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today    = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // ── Week helpers ──────────────────────────────────────────────────────────
  const getStartOfWeek = (d) => {
    const s   = new Date(d);
    const day = s.getDay();
    s.setDate(s.getDate() - day + (day === 0 ? -6 : 1));
    return s;
  };

  const currentWeekStart = getStartOfWeek(currentDate);
  const weekDaysDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeekStart.toDateString()]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigate = (dir) => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + dir, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(year, month, date + dir * 7));
    } else {
      // day view
      setCurrentDate(new Date(year, month, date + dir));
    }
  };

  const goToday = () => setCurrentDate(new Date());

  // ── Month grid ────────────────────────────────────────────────────────────
  const firstDay       = new Date(year, month, 1).getDay();
  const monthStartOff  = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const days           = [];
  for (let i = 0; i < monthStartOff; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isToday = (d) =>
    d && d.getFullYear() === today.getFullYear() &&
    d.getMonth()         === today.getMonth()    &&
    d.getDate()          === today.getDate();

  const dateStr = (d) => d
    ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    : null;

  const getTasksForDateStr = (ds) =>
    visibleTasks.filter(t => t.deadline === ds);

  const handleDayClick = (ds, timeStr = null) => {
    setDefaultDeadline(ds);
    setDefaultDeadlineTime(timeStr);
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleTaskClick = (e, task) => {
    e.stopPropagation();
    setEditingTask(task);
    setDefaultDeadline(null);
    setDefaultDeadlineTime(null);
    setModalOpen(true);
  };

  // Header label
  const headerLabel = () => {
    if (viewMode === 'month') return `${months[month]} ${year}`;
    if (viewMode === 'week')  return `${months[weekDaysDates[0].getMonth()]} ${weekDaysDates[0].getDate()} – ${weekDaysDates[6].getDate()}, ${year}`;
    return `${months[month]} ${String(date).padStart(2,'0')}, ${year}`;
  };

  // Current day date string for "day" view
  const currentDayStr = dateStr(currentDate);

  return (
    <div className="calendar-page">
      <div className="calendar-container glass-card animate-fadeInUp">

        {/* ── Top Header ───────────────────────────────────────────────── */}
        <div className="calendar-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>My Calendar</h2>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {visibleTasks.length} total tasks
            </span>
          </div>
          <div className="calendar-view-toggle">
            {['day', 'week', 'month'].map(v => (
              <button
                key={v}
                className={`view-toggle-btn ${viewMode === v ? 'active' : ''}`}
                onClick={() => setViewMode(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body Wrap ────────────────────────────────────────────────── */}
        <div className="calendar-body-wrap">

          {/* ── Mini sidebar ────────────────────────────────────────── */}
          <div className="calendar-mini-sidebar">
            <div className="mini-calendar">
              <div className="mini-cal-header">
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{months[month]} {year}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" style={{ width:22, height:22 }} onClick={() => setCurrentDate(new Date(year, month-1, 1))}>
                    <IconChevronLeft size={12} />
                  </button>
                  <button className="btn-icon" style={{ width:22, height:22 }} onClick={() => setCurrentDate(new Date(year, month+1, 1))}>
                    <IconChevronRight size={12} />
                  </button>
                </div>
              </div>
              <div className="mini-cal-weekdays">
                {['M','T','W','T','F','S','S'].map((wd,i) => <div key={i}>{wd}</div>)}
              </div>
              <div className="mini-cal-days">
                {days.map((d, i) => {
                  const dObj  = d ? new Date(year, month, d) : null;
                  const isT   = isToday(dObj);
                  const isSel = dObj && dateStr(dObj) === (viewMode === 'day' ? currentDayStr : null);
                  return (
                    <div
                      key={i}
                      className={`mini-cal-day ${d ? 'clickable' : ''} ${isT ? 'mini-cal-today' : ''} ${isSel ? 'mini-cal-selected' : ''}`}
                      onClick={() => {
                        if (d) {
                          setCurrentDate(new Date(year, month, d));
                          setViewMode('day');
                        }
                      }}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mini-cal-checklists">
              <h4 style={{ fontSize: '0.85rem', marginBottom: 8, fontWeight: 600 }}>Projects</h4>
              {visibleProjects.length === 0 && (
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No projects</span>
              )}
              {visibleProjects.slice(0, 5).map(p => (
                <div key={p.id} className="mini-cal-checklist-item">
                  <div className="mini-cal-checklist-dot" style={{ background: p.color }} />
                  <span className="truncate text-xs">{p.name}</span>
                </div>
              ))}
            </div>

            {/* Today's tasks */}
            <div className="mini-cal-checklists" style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: 8, fontWeight: 600 }}>Today</h4>
              {getTasksForDateStr(todayStr).length === 0 && (
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No tasks today</span>
              )}
              {getTasksForDateStr(todayStr).slice(0, 4).map(task => (
                <div
                  key={task.id}
                  className="mini-cal-checklist-item"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => handleTaskClick(e, task)}
                >
                  <div
                    className="mini-cal-checklist-dot"
                    style={{ background: visibleProjects.find(p => p.id === task.projectId)?.color || 'var(--primary-500)' }}
                  />
                  <span className="truncate text-xs">{task.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Main Area ────────────────────────────────────────────── */}
          <div className="calendar-main-area">
            <div className="main-area-header">
              <h3 style={{ fontWeight: 700 }}>{headerLabel()}</h3>
              <div className="main-area-nav">
                <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
                <button className="btn-icon" style={{ width:28, height:28 }} onClick={() => navigate(-1)}>
                  <IconChevronLeft size={13} />
                </button>
                <button className="btn-icon" style={{ width:28, height:28 }} onClick={() => navigate(1)}>
                  <IconChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* ── MONTH VIEW ── */}
            {viewMode === 'month' && (
              <div className="month-view">
                <div className="month-view-weekdays">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(wd => <div key={wd}>{wd}</div>)}
                </div>
                <div className="month-view-grid">
                  {days.map((day, i) => {
                    const dObj = day ? new Date(year, month, day) : null;
                    const ds   = dateStr(dObj);
                    const dayTasks = ds ? getTasksForDateStr(ds) : [];
                    return (
                      <div
                        key={i}
                        className={`month-day ${isToday(dObj) ? 'month-day-today' : ''} ${day ? 'month-day-active' : ''}`}
                        onClick={() => ds && handleDayClick(ds)}
                      >
                        {day && (
                          <>
                            <span className="month-day-num">{day}</span>
                            <div className="month-day-tasks">
                              {dayTasks.slice(0, 3).map(task => {
                                const proj = visibleProjects.find(p => p.id === task.projectId);
                                return (
                                  <div
                                    key={task.id}
                                    className="month-task-pill"
                                    style={{ background: proj ? `${proj.color}30` : 'rgba(59,130,246,0.2)', color: proj?.color || 'var(--primary-400)' }}
                                    onClick={(e) => handleTaskClick(e, task)}
                                  >
                                    <span className="truncate">{task.title}</span>
                                  </div>
                                );
                              })}
                              {dayTasks.length > 3 && (
                                <span className="month-more text-xs">+{dayTasks.length - 3} more</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── WEEK VIEW ── */}
            {viewMode === 'week' && (
              <div className="week-view">
                <div className="week-header-row">
                  <div className="week-tz">UTC</div>
                  {weekDaysDates.map((d, i) => {
                    const isTod = isToday(d);
                    const wdNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
                    return (
                      <div
                        key={i}
                        className={`week-header-cell ${isTod ? 'week-header-today' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setCurrentDate(new Date(d)); setViewMode('day'); }}
                      >
                        <span className="week-header-date">{String(d.getDate()).padStart(2,'0')}</span>
                        <span className="week-header-wd">{wdNames[i]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="week-grid-container">
                  <div className="week-time-col">
                    {HOURS.map(h => (
                      <div key={h} className="week-time-slot">{formatHour(h)}</div>
                    ))}
                  </div>
                  <div className="week-days-grid">
                    {HOURS.map(h => (
                      <div key={`line-${h}`} className="week-grid-line" style={{ top: `${(h - 7) * 80}px` }} />
                    ))}
                    {weekDaysDates.map((dObj, colIndex) => {
                      const ds       = dateStr(dObj);
                      const dayTasks = getTasksForDateStr(ds);
                      return (
                        <div
                          key={colIndex}
                          className="week-day-col"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const hour = Math.floor((e.clientY - rect.top) / 80) + 7;
                            handleDayClick(ds, `${String(Math.max(7, Math.min(20, hour))).padStart(2,'0')}:00`);
                          }}
                        >
                          {dayTasks.map(task => {
                            if (!task.deadlineTime) return null;
                            const [hh, mm] = task.deadlineTime.split(':').map(Number);
                            if (hh < 7 || hh > 20) return null;
                            const top    = (hh - 7) * 80 + (mm / 60) * 80;
                            const proj   = visibleProjects.find(p => p.id === task.projectId);
                            return (
                              <div
                                key={task.id}
                                className="week-task-block"
                                style={{ top: `${top}px`, height: '76px', background: proj?.color || 'var(--primary-500)', color: '#fff' }}
                                onClick={(e) => handleTaskClick(e, task)}
                              >
                                <strong style={{ fontSize: '0.8rem' }}>{task.title}</strong>
                                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>{task.deadlineTime}</span>
                                <div className="week-task-avatars">
                                  {proj?.assignedUserIds?.slice(0,2).map(uid => {
                                    const u = getUserById(uid);
                                    return u ? (
                                      <div key={uid} className="avatar avatar-sm" style={{ width:20, height:20, fontSize:'0.6rem', background:'rgba(0,0,0,0.25)' }}>
                                        {u.name.charAt(0)}
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── DAY VIEW ── */}
            {viewMode === 'day' && (
              <div className="week-view day-view">
                <div className="week-header-row" style={{ gridTemplateColumns: '64px 1fr' }}>
                  <div className="week-tz">UTC</div>
                  <div className={`week-header-cell ${isToday(currentDate) ? 'week-header-today' : ''}`} style={{ cursor: 'default' }}>
                    <span className="week-header-date" style={{ fontSize: '1.4rem' }}>{String(date).padStart(2,'0')}</span>
                    <span className="week-header-wd">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][currentDate.getDay()]}</span>
                  </div>
                </div>
                <div className="week-grid-container">
                  <div className="week-time-col">
                    {HOURS.map(h => (
                      <div key={h} className="week-time-slot">{formatHour(h)}</div>
                    ))}
                  </div>
                  <div className="week-days-grid" style={{ gridTemplateColumns: '1fr' }}>
                    {HOURS.map(h => (
                      <div key={`line-${h}`} className="week-grid-line" style={{ top: `${(h - 7) * 80}px` }} />
                    ))}
                    <div
                      className="week-day-col"
                      style={{ gridColumn: 1 }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const hour = Math.floor((e.clientY - rect.top) / 80) + 7;
                        handleDayClick(currentDayStr, `${String(Math.max(7, Math.min(20, hour))).padStart(2,'0')}:00`);
                      }}
                    >
                      {getTasksForDateStr(currentDayStr).map(task => {
                        if (!task.deadlineTime) return null;
                        const [hh, mm] = task.deadlineTime.split(':').map(Number);
                        if (hh < 7 || hh > 20) return null;
                        const top  = (hh - 7) * 80 + (mm / 60) * 80;
                        const proj = visibleProjects.find(p => p.id === task.projectId);
                        const assignee = getUserById(task.assigneeId);
                        return (
                          <div
                            key={task.id}
                            className="week-task-block day-task-block"
                            style={{ top: `${top}px`, height: '76px', background: proj?.color || 'var(--primary-500)', color: '#fff' }}
                            onClick={(e) => handleTaskClick(e, task)}
                          >
                            <strong style={{ fontSize: '0.85rem' }}>{task.title}</strong>
                            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                              {task.deadlineTime} · {proj?.name || '—'}
                            </span>
                            {assignee && (
                              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>👤 {assignee.name}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          defaultDeadline={defaultDeadline}
          defaultDeadlineTime={defaultDeadlineTime}
          onClose={() => { setModalOpen(false); setEditingTask(null); setDefaultDeadline(null); setDefaultDeadlineTime(null); }}
        />
      )}
    </div>
  );
}
