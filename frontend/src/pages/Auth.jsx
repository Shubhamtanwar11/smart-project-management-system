import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import { Card, ErrorBox, btnCls, inputCls } from '../components/ui';
import { useToast } from '../context/ToastContext';
export default function Auth({ register = false }) {
  const { user, login, register: signUp } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await (register ? signUp(form) : login(form));
      toast.success(register ? 'Account created' : 'Welcome back');
      nav('/');
    } catch (err) {
      const msg = errMsg(err);
      setError(msg);
      toast.error(msg);
    } finally { setBusy(false); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-4 text-xl font-bold">{register ? 'Create account' : 'Sign in'}</h1>
        <form onSubmit={submit} className="space-y-3">
          {register && <input className={inputCls} placeholder="Name" value={form.name} onChange={set('name')} required />}
          <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
          <input className={inputCls} type="password" placeholder="Password (min 6)" value={form.password} onChange={set('password')} required />
          <ErrorBox message={error} />
          <button className={`${btnCls} w-full`} disabled={busy}>{busy ? 'Please wait…' : register ? 'Register' : 'Login'}</button>
        </form>
        <p className="mt-3 text-center text-sm text-slate-500">
          {register ? <Link to="/login" className="text-indigo-600">Have an account? Sign in</Link> : <Link to="/register" className="text-indigo-600">No account? Register</Link>}
        </p>
      </Card>
    </div>
  );
}
