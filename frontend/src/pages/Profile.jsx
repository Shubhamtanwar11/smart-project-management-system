import { useState } from 'react';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, ErrorBox, btnCls, inputCls } from '../components/ui';
export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name cannot be empty');
    setBusy(true); setError('');
    try {
      const { data } = await api.put('/users/profile', form);
      setUser(data.user);
      setForm({ ...form, currentPassword: '', newPassword: '' });
      toast.success('Profile updated');
    } catch (err) {
      const msg = errMsg(err);
      setError(msg);
      toast.error(msg);
    } finally { setBusy(false); }
  };
  return (
    <Card className="max-w-md">
      <h1 className="mb-3 text-xl font-bold">Profile</h1>
      <form onSubmit={save} className="space-y-3">
        <p className="text-sm text-slate-500">{user.email}</p>
        <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Name" required />
        <input className={inputCls} type="password" value={form.currentPassword} onChange={set('currentPassword')} placeholder="Current password (to change it)" autoComplete="current-password" />
        <input className={inputCls} type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="New password" autoComplete="new-password" />
        <ErrorBox message={error} />
        <button className={btnCls} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </Card>
  );
}
