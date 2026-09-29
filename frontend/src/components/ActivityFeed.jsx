import { Empty } from './ui';
const timeAgo = (d) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  const units = [[86400, 'd'], [3600, 'h'], [60, 'm']];
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return `${s}s ago`;
};
export default function ActivityFeed({ items }) {
  if (!items?.length) return <Empty text="No activity yet." />;
  return (
    <ul className="space-y-2 text-sm">
      {items.map((a) => (
        <li key={a._id} className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
          <span className="text-slate-700">{a.message}</span>
          <span className="shrink-0 text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}
