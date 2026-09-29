import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { Card, Empty, ErrorBox, Progress, Spinner, btnCls, fmt } from '../components/ui';
import ProjectModal from '../components/ProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | project object

  const load = () => api.get('/projects').then((r) => setProjects(r.data.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const saved = () => { setModal(null); load(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Projects</h1>
        <button className={`${btnCls} flex items-center gap-1`} onClick={() => setModal('new')}><Plus size={16} />New project</button>
      </div>
      <ErrorBox message={error} />
      {!projects ? <Spinner /> : !projects.length ? <Empty text="No projects yet. Create your first one above." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p._id} className="relative hover:border-indigo-300">
              <button
                aria-label="Edit project"
                onClick={() => setModal(p)}
                className="absolute right-3 top-3 text-slate-400 hover:text-indigo-600"
              ><Pencil size={15} /></button>
              <Link to={`/projects/${p._id}`}>
                <div className="flex justify-between pr-6"><h3 className="font-semibold">{p.name}</h3><span className="text-xs capitalize text-slate-500">{p.status}</span></div>
                <p className="mb-3 text-sm text-slate-500">{p.description || 'No description'}</p>
                <Progress value={p.progress} />
                <p className="mt-2 text-xs text-slate-500">{p.progress}% · {p.taskCount} tasks · Due {fmt(p.deadline)}</p>
              </Link>
            </Card>
          ))}
        </div>
      )}
      {modal && (
        <ProjectModal
          project={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={saved}
        />
      )}
    </div>
  );
}
