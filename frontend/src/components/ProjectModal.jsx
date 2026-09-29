import { useState } from 'react';
import Modal from './Modal';
import { ErrorBox, btnCls, inputCls } from './ui';
import api, { errMsg } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ProjectModal({ project, onClose, onSaved }) {
  const isEdit = Boolean(project);
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    deadline: project?.deadline ? project.deadline.slice(0, 10) : '',
    status: project?.status || 'active',
    memberEmails: (project?.members || []).map((m) => m.email).filter((e) => e).join(', '),
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Project name is required');
    setBusy(true); setError('');
    const payload = { ...form, memberEmails: form.memberEmails.split(',').map((s) => s.trim()).filter(Boolean) };
    try {
      if (isEdit) await api.put(`/projects/${project._id}`, payload);
      else await api.post('/projects', payload);
      toast.success(isEdit ? 'Project updated' : 'Project created');
      onSaved();
    } catch (err) {
      const msg = errMsg(err);
      setError(msg);
      toast.error(msg);
    } finally { setBusy(false); }
  };

  return (
    <Modal title={isEdit ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input className={inputCls} placeholder="Project name" value={form.name} onChange={set('name')} required />
        <textarea className={inputCls} placeholder="Description" rows={2} value={form.description} onChange={set('description')} />
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} type="date" value={form.deadline} onChange={set('deadline')} />
          {isEdit && (
            <select className={inputCls} value={form.status} onChange={set('status')}>
              <option value="active">Active</option><option value="on-hold">On hold</option><option value="completed">Completed</option>
            </select>
          )}
        </div>
        <input className={inputCls} placeholder="Member emails, comma separated" value={form.memberEmails} onChange={set('memberEmails')} />
        <ErrorBox message={error} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
          <button className={btnCls} disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}</button>
        </div>
      </form>
    </Modal>
  );
}
