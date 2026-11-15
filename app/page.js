"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "taskflow.tasks.v1";
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const starterTasks = [
  {
    id: "welcome-1",
    title: "Plan your first project",
    description: "Add a few milestones, set realistic dates and keep your progress up to date.",
    startDate: today(),
    dueDate: plusDays(5),
    status: "In progress",
    priority: "High",
    progress: 35,
    createdAt: new Date().toISOString(),
    updates: [{ id: "u1", text: "Welcome to Taskflow. Your task workspace is ready.", date: new Date().toISOString() }]
  },
  {
    id: "welcome-2",
    title: "Review weekly priorities",
    description: "Decide what matters most this week.",
    startDate: today(),
    dueDate: plusDays(2),
    status: "Not started",
    priority: "Medium",
    progress: 0,
    createdAt: new Date().toISOString(),
    updates: []
  },
  {
    id: "welcome-3",
    title: "Ship a small improvement",
    description: "A small completed task builds momentum.",
    startDate: plusDays(-2),
    dueDate: plusDays(-1),
    status: "Done",
    priority: "Low",
    progress: 100,
    createdAt: new Date().toISOString(),
    updates: [{ id: "u3", text: "Marked as complete.", date: new Date().toISOString() }]
  }
];

function prettyDate(value) {
  if (!value) return "No date";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function daysLeft(value) {
  if (!value) return null;
  return Math.ceil((new Date(`${value}T23:59:59`).getTime() - new Date().setHours(0,0,0,0)) / 86400000);
}
function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
}

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [updateText, setUpdateText] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", startDate: today(), dueDate: plusDays(7),
    status: "Not started", priority: "Medium", progress: 0
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) : starterTasks);
    } catch {
      setTasks(starterTasks);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  const selectedTask = tasks.find(t => t.id === selectedId) || null;
  const filteredTasks = useMemo(() => tasks.filter(task => {
    const matchesFilter = filter === "All" || task.status === filter;
    const matchesQuery = `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  }).sort((a,b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")), [tasks, filter, query]);

  const completed = tasks.filter(t => t.status === "Done").length;
  const overall = tasks.length ? Math.round(tasks.reduce((sum,t) => sum + Number(t.progress || 0), 0) / tasks.length) : 0;
  const overdue = tasks.filter(t => t.status !== "Done" && daysLeft(t.dueDate) < 0).length;

  function openNew() {
    setEditingId(null);
    setForm({ title: "", description: "", startDate: today(), dueDate: plusDays(7), status: "Not started", priority: "Medium", progress: 0 });
    setModalOpen(true);
  }
  function openEdit(task) {
    setEditingId(task.id);
    setForm({ title: task.title, description: task.description || "", startDate: task.startDate || "", dueDate: task.dueDate || "", status: task.status, priority: task.priority, progress: task.progress });
    setModalOpen(true);
  }
  function saveTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const progress = form.status === "Done" ? 100 : Number(form.progress);
    if (editingId) {
      setTasks(current => current.map(t => t.id === editingId ? { ...t, ...form, title: form.title.trim(), progress, updates: [...(t.updates || []), { id: makeId(), text: "Task details updated.", date: new Date().toISOString() }] } : t));
    } else {
      const task = { ...form, id: makeId(), title: form.title.trim(), progress, createdAt: new Date().toISOString(), updates: [{ id: makeId(), text: "Task created.", date: new Date().toISOString() }] };
      setTasks(current => [task, ...current]);
      setSelectedId(task.id);
    }
    setModalOpen(false);
  }
  function updateTask(id, patch, message) {
    setTasks(current => current.map(t => t.id === id ? {
      ...t, ...patch,
      updates: message ? [...(t.updates || []), { id: makeId(), text: message, date: new Date().toISOString() }] : (t.updates || [])
    } : t));
  }
  function addUpdate(e) {
    e.preventDefault();
    if (!selectedTask || !updateText.trim()) return;
    updateTask(selectedTask.id, {}, updateText.trim());
    setUpdateText("");
  }
  function deleteTask(id) {
    if (!window.confirm("Delete this task and its update history?")) return;
    setTasks(current => current.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">t</div><span>taskflow</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item active"><span className="nav-icon">▦</span> My tasks <span className="nav-count">{tasks.length}</span></button>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-icon">✦</div>
            <strong>Make progress visible.</strong>
            <p>Small steps add up. Keep your next action clear.</p>
          </div>
          <div className="profile"><div className="avatar">Y</div><div><strong>Your workspace</strong><small>Personal plan</small></div><span className="more">···</span></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>My tasks</strong></div>
          <div className="top-actions"><span className="today-label">{new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</span><div className="top-avatar">Y</div></div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><div className="eyebrow">YOUR OVERVIEW</div><h1>Good things take <em>progress.</em></h1><p>Keep your plans moving, one task at a time.</p></div>
            <button className="primary-button" onClick={openNew}><span>＋</span> New task</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span>Total tasks</span><span className="stat-icon lavender">▦</span></div><div className="stat-value">{tasks.length}</div><div className="stat-foot">Across your workspace</div></div>
            <div className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon mint">✓</span></div><div className="stat-value">{completed}<small> / {tasks.length}</small></div><div className="stat-foot">{tasks.length ? Math.round(completed/tasks.length*100) : 0}% of all tasks</div></div>
            <div className="stat-card"><div className="stat-top"><span>Overall progress</span><span className="stat-icon peach">↗</span></div><div className="stat-value">{overall}<small>%</small></div><div className="mini-track"><span style={{width:`${overall}%`}} /></div></div>
            <div className="stat-card"><div className="stat-top"><span>Overdue</span><span className="stat-icon rose">!</span></div><div className="stat-value">{overdue}</div><div className="stat-foot">{overdue ? "Needs your attention" : "You're all caught up"}</div></div>
          </div>

          <div className="section-heading"><div><h2>Task timeline</h2><p>Your work, ordered by due date.</p></div><div className="view-label"><span className="view-dot" /> Live overview</div></div>
          <div className="task-toolbar">
            <div className="filters">{["All","Not started","In progress","Done"].map(item => <button key={item} className={filter===item?"filter active-filter":"filter"} onClick={()=>setFilter(item)}>{item}{item==="All" && <span>{tasks.length}</span>}</button>)}</div>
            <div className="search-box"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks..." /></div>
          </div>

          <div className="task-layout">
            <div className="task-list">
              {filteredTasks.length === 0 ? <div className="empty-state"><div>✦</div><h3>No tasks found</h3><p>Try another filter or create a new task.</p><button className="text-button" onClick={openNew}>＋ Add your first task</button></div> :
                filteredTasks.map(task => {
                  const left = daysLeft(task.dueDate);
                  return <button key={task.id} className={`task-row ${selectedId===task.id?"selected":""}`} onClick={()=>setSelectedId(task.id)}>
                    <div className={`status-check ${task.status==="Done"?"checked":""}`}>{task.status==="Done"?"✓":""}</div>
                    <div className="task-main"><div className="task-title-line"><strong>{task.title}</strong><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span></div><p>{task.description || "No description added"}</p><div className="task-meta"><span className="date-meta">◷ {prettyDate(task.startDate)} – {prettyDate(task.dueDate)}</span><span className={`status-pill status-${task.status.toLowerCase().replace(" ","-")}`}>{task.status}</span></div></div>
                    <div className="task-progress"><div className="progress-number">{task.progress}%</div><div className="progress-track"><span style={{width:`${task.progress}%`}} /></div><small>{left===null?"No due date":left<0?`${Math.abs(left)}d overdue`:left===0?"Due today":`${left}d left`}</small></div>
                    <span className="row-chevron">›</span>
                  </button>;
                })}
              <button className="add-task-row" onClick={openNew}>＋ <span>Add a task</span></button>
            </div>

            <aside className="detail-panel">
              {selectedTask ? <>
                <div className="detail-top"><span className="detail-label">TASK DETAILS</span><button className="icon-button" onClick={()=>openEdit(selectedTask)} aria-label="Edit task">✎</button></div>
                <h3>{selectedTask.title}</h3><p className="detail-description">{selectedTask.description || "Add a description to give this task more context."}</p>
                <div className="detail-divider" />
                <div className="detail-field"><span>Status</span><select value={selectedTask.status} onChange={e=>updateTask(selectedTask.id,{status:e.target.value,progress:e.target.value==="Done"?100:selectedTask.progress},`Status changed to ${e.target.value}.`)}><option>Not started</option><option>In progress</option><option>Done</option></select></div>
                <div className="detail-field"><span>Priority</span><select value={selectedTask.priority} onChange={e=>updateTask(selectedTask.id,{priority:e.target.value},`Priority changed to ${e.target.value}.`)}><option>Low</option><option>Medium</option><option>High</option></select></div>
                <div className="detail-field"><span>Start date</span><strong>{prettyDate(selectedTask.startDate)}</strong></div>
                <div className="detail-field"><span>Due date</span><strong>{prettyDate(selectedTask.dueDate)}</strong></div>
                <div className="detail-divider" />
                <div className="progress-heading"><strong>Progress</strong><b>{selectedTask.progress}%</b></div>
                <input className="range-input" type="range" min="0" max="100" step="5" value={selectedTask.progress} onChange={e=>updateTask(selectedTask.id,{progress:Number(e.target.value),status:Number(e.target.value)===100?"Done":Number(e.target.value)>0?"In progress":"Not started"})} />
                <div className="range-labels"><span>Just started</span><span>Completed</span></div>
                <div className="detail-divider" />
                <div className="updates-heading"><strong>Activity & updates</strong><span>{(selectedTask.updates||[]).length}</span></div>
                <form className="update-form" onSubmit={addUpdate}><input value={updateText} onChange={e=>setUpdateText(e.target.value)} placeholder="Write an update..." /><button type="submit" disabled={!updateText.trim()}>＋</button></form>
                <div className="updates-list">{(selectedTask.updates||[]).slice().reverse().map(update=><div className="update-item" key={update.id}><div className="update-dot" /><div><p>{update.text}</p><small>{new Date(update.date).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</small></div></div>)}</div>
                <button className="delete-button" onClick={()=>deleteTask(selectedTask.id)}>Delete task</button>
              </> : <div className="detail-empty"><div className="detail-empty-icon">↖</div><h3>Choose a task</h3><p>Select a task to see its dates, progress and activity updates.</p></div>}
            </aside>
          </div>
          <footer>Made for focused work <span>·</span> Your tasks are saved in this browser</footer>
        </div>
      </section>

      {modalOpen && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModalOpen(false);}}><form className="modal" onSubmit={saveTask}>
        <div className="modal-heading"><div><div className="eyebrow">{editingId?"EDIT TASK":"NEW TASK"}</div><h2>{editingId?"Update task":"Create a task"}</h2></div><button type="button" className="icon-button" onClick={()=>setModalOpen(false)}>×</button></div>
        <label>Task name<input autoFocus required maxLength="100" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Prepare project proposal" /></label>
        <label>Description <span className="optional">Optional</span><textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What needs to get done?" /></label>
        <div className="form-two"><label>Start date<input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} /></label><label>Due date<input type="date" value={form.dueDate} min={form.startDate || undefined} onChange={e=>setForm({...form,dueDate:e.target.value})} /></label></div>
        <div className="form-two"><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value,progress:e.target.value==="Done"?100:form.progress})}><option>Not started</option><option>In progress</option><option>Done</option></select></label></div>
        <label className="progress-form-label">Progress <strong>{form.status==="Done"?100:form.progress}%</strong><input type="range" min="0" max="100" step="5" value={form.status==="Done"?100:form.progress} onChange={e=>setForm({...form,progress:Number(e.target.value),status:Number(e.target.value)===100?"Done":Number(e.target.value)>0?"In progress":"Not started"})} /></label>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setModalOpen(false)}>Cancel</button><button className="primary-button" type="submit">{editingId?"Save changes":"Create task"}</button></div>
      </form></div>}
    </main>
  );
}
