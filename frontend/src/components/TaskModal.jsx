import { useState } from 'react';
import Modal from './Modal';
import { ErrorBox, btnCls, inputCls } from './ui';
import api, { errMsg } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function TaskModal({ projectId, members, task, onClose, onSaved }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    assignedTo: task?.assignedTo?._id || '',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setBusy(true); setError('');
    try {
      if (isEdit) await api.put(`/tasks/${task._id}`, form);
      else await api.post('/tasks', { ...form, project: projectId });
      toast.success(isEdit ? 'Task updated' : 'Task created');
      onSaved();
    } catch (err) {
      const msg = errMsg(err);
      setError(msg);
      toast.error(msg);
    } finally { setBusy(false); }
  };

  return (
    <Modal title={isEdit ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input className={inputCls} placeholder="Task title" value={form.title} onChange={set('title')} required />
        <textarea className={inputCls} placeholder="Description" rows={2} value={form.description} onChange={set('description')} />
        <div className="grid grid-cols-2 gap-2">
          <select className={inputCls} value={form.priority} onChange={set('priority')}>
            {['low', 'medium', 'high'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <select className={inputCls} value={form.status} onChange={set('status')}>
            <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
          </select>
          <select className={inputCls} value={form.assignedTo} onChange={set('assignedTo')}>
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          <input className={inputCls} type="date" value={form.dueDate} onChange={set('dueDate')} />
        </div>
        <ErrorBox message={error} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
          <button className={btnCls} disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}</button>
        </div>
      </form>
    </Modal>
  );
}
