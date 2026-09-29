import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { Card, Empty, ErrorBox, Progress, Spinner, btnCls, fmt, inputCls } from '../components/ui';
import TaskModal from '../components/TaskModal';
import ActivityFeed from '../components/ActivityFeed';
import { useToast } from '../context/ToastContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [p, setP] = useState(null);
  const [q, setQ] = useState({ search: '', status: '' });
  const [error, setError] = useState('');
  const [taskModal, setTaskModal] = useState(null); // null | 'new' | task object
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(
    () => api.get(`/projects/${id}`).then((r) => setP(r.data.data)).catch((e) => setError(errMsg(e))),
    [id]
  );
  useEffect(() => { load(); }, [load]);

  if (!p) return error ? <ErrorBox message={error} /> : <Spinner />;

  const tasks = p.tasks.filter(
    (t) => t.title.toLowerCase().includes(q.search.toLowerCase()) && (!q.status || t.status === q.status)
  );

  const setStatus = async (task, status) => {
    setBusyId(task._id);
    try {
      await api.put(`/tasks/${task._id}`, { status });
      toast.success('Task status updated');
      await load();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusyId(null); }
  };
  const removeTask = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setBusyId(task._id);
    try { await api.delete(`/tasks/${task._id}`); toast.success('Task deleted'); await load(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusyId(null); }
  };
  const removeProject = async () => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try { await api.delete(`/projects/${id}`); toast.success('Project deleted'); nav('/projects'); }
    catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{p.name}</h1>
          <p className="text-sm text-slate-500">{p.description || 'No description'}</p>
        </div>
        <button onClick={removeProject} className="flex shrink-0 items-center gap-1 text-sm text-red-600 hover:underline">
          <Trash2 size={14} />Delete project
        </button>
      </div>

      <Card>
        <Progress value={p.progress} />
        <p className="mt-2 text-sm text-slate-500">
          {p.progress}% complete · {p.taskCount} tasks · Deadline {fmt(p.deadline)} · Team: {p.members.map((m) => m.name).join(', ')}
        </p>
      </Card>

      <ErrorBox message={error} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Tasks</h2>
            <button className={`${btnCls} flex items-center gap-1`} onClick={() => setTaskModal('new')}>
              <Plus size={16} />New task
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className={inputCls} placeholder="Search tasks" value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value })} />
            <select className={`${inputCls} sm:w-48`} value={q.status} onChange={(e) => setQ({ ...q, status: e.target.value })}>
              <option value="">All statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {!p.tasks.length ? (
            <Empty text="No tasks yet. Add the first one above." />
          ) : !tasks.length ? (
            <Empty text="No tasks match your search." />
          ) : (
            <Card className="divide-y divide-slate-100 p-0">
              {tasks.map((t) => (
                <div key={t._id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium ${t.status === 'completed' ? 'text-slate-400 line-through' : ''}`}>{t.title}</p>
                    <p className="text-xs capitalize text-slate-500">{t.priority} priority · {t.assignedTo?.name || 'Unassigned'} · Due {fmt(t.dueDate)}</p>
                  </div>
                  <select
                    className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                    value={t.status}
                    disabled={busyId === t._id}
                    onChange={(e) => setStatus(t, e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button aria-label="Edit task" onClick={() => setTaskModal(t)} className="text-slate-400 hover:text-indigo-600"><Pencil size={16} /></button>
                  <button aria-label="Delete task" disabled={busyId === t._id} onClick={() => removeTask(t)} className="text-slate-400 hover:text-red-600 disabled:opacity-50"><Trash2 size={16} /></button>
                </div>
              ))}
            </Card>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Recent activity</h2>
          <Card><ActivityFeed items={p.activity} /></Card>
        </div>
      </div>

      {taskModal && (
        <TaskModal
          projectId={id}
          members={p.members}
          task={taskModal === 'new' ? null : taskModal}
          onClose={() => setTaskModal(null)}
          onSaved={() => { setTaskModal(null); load(); }}
        />
      )}
    </div>
  );
}
