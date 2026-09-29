import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
import { Card, ErrorBox, Spinner } from '../components/ui';
const Bars = ({ title, data, total }) => (
  <Card>
    <h3 className="mb-3 font-semibold">{title}</h3>
    {Object.entries(data).map(([k, v]) => (
      <div key={k} className="mb-2 text-sm">
        <div className="flex justify-between"><span className="capitalize">{k}</span><span>{v}</span></div>
        <div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${total ? (v / total) * 100 : 0}%` }} /></div>
      </div>
    ))}
  </Card>
);
export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/tasks/stats').then((r) => setS(r.data.data)).catch((e) => setError(errMsg(e))); }, []);
  if (error) return <ErrorBox message={error} />;
  if (!s) return <Spinner />;
  const cards = [['Total Projects', s.totalProjects], ['Active Projects', s.activeProjects], ['Total Tasks', s.totalTasks], ['Completed', s.completedTasks], ['Pending', s.pendingTasks], ['Overdue', s.overdueTasks]];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map(([l, v]) => <Card key={l}><p className="text-sm text-slate-500">{l}</p><p className="text-2xl font-bold">{v}</p></Card>)}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Bars title="Task status" data={s.byStatus} total={s.totalTasks} />
        <Bars title="Priority" data={s.byPriority} total={s.totalTasks} />
      </div>
    </div>
  );
}
