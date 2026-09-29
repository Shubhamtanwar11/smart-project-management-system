export const Card = ({ children, className = '' }) => <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>{children}</div>;
export const ErrorBox = ({ message }) => message ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null;
export const Spinner = () => <p className="p-6 text-center text-slate-500">Loading…</p>;
export const Empty = ({ text }) => <p className="p-6 text-center text-slate-400">{text}</p>;
export const Progress = ({ value }) => <div className="h-2 w-full rounded-full bg-slate-200"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${value}%` }} /></div>;
export const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';
export const btnCls = 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50';
export const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');
