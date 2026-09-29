const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const wrap = require('../utils/wrap');
const fail = require('../utils/fail');

const myProjectIds = async (uid) =>
  (await Project.find({ $or: [{ owner: uid }, { members: uid }] }).select('_id')).map((p) => p._id);
const SORTS = ['dueDate', '-dueDate', 'priority', '-createdAt', 'createdAt', 'title'];
const authorize = async (projectId, uid) => {
  const p = await Project.findById(projectId);
  if (!p) return { code: 404, message: 'Project not found' };
  if (!p.owner.equals(uid) && !p.members.some((m) => m.equals(uid))) return { code: 403, message: 'Access denied' };
  return { project: p };
};
const findAuthorized = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return void fail(res, 404, 'Task not found');
  const a = await authorize(task.project, req.user._id);
  if (a.code) return void fail(res, a.code, a.message);
  return { task, project: a.project };
};
const isMember = (project, id) => project.members.some((m) => m.equals(id));
const log = (project, user, message) => Activity.create({ project, user, message }).catch(() => {});

exports.list = wrap(async (req, res) => {
  const { project, status, priority, search, sort, assignedTo } = req.query;
  const ids = await myProjectIds(req.user._id);
  const q = { project: { $in: ids } };
  if (project) q.project = ids.some((i) => i.equals(project)) ? project : null;
  if (status) q.status = status;
  if (priority) q.priority = priority;
  if (assignedTo === 'me') q.assignedTo = req.user._id;
  if (search) q.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const data = await Task.find(q).populate('assignedTo', 'name').populate('project', 'name')
    .sort(SORTS.includes(sort) ? sort : '-createdAt');
  res.json({ success: true, data });
});
exports.stats = wrap(async (req, res) => {
  const ids = await myProjectIds(req.user._id);
  const [projects, tasks] = await Promise.all([
    Project.find({ _id: { $in: ids } }).select('status'),
    Task.find({ project: { $in: ids } }).select('status priority dueDate'),
  ]);
  const count = (key, val) => tasks.filter((t) => t[key] === val).length;
  const now = new Date();
  res.json({ success: true, data: {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: count('status', 'completed'),
    pendingTasks: tasks.length - count('status', 'completed'),
    overdueTasks: tasks.filter((t) => t.status !== 'completed' && t.dueDate && t.dueDate < now).length,
    byStatus: { todo: count('status', 'todo'), 'in-progress': count('status', 'in-progress'), completed: count('status', 'completed') },
    byPriority: { low: count('priority', 'low'), medium: count('priority', 'medium'), high: count('priority', 'high') },
  } });
});
exports.create = wrap(async (req, res) => {
  const { title, project, assignedTo, priority, status, description, dueDate } = req.body;
  if (!title || !title.trim()) return fail(res, 400, 'Title and project are required');
  if (!project) return fail(res, 400, 'Title and project are required');
  const a = await authorize(project, req.user._id);
  if (a.code) return fail(res, a.code, a.message);
  if (assignedTo && !isMember(a.project, assignedTo)) return fail(res, 400, 'Assignee must be a project member');
  const task = await Task.create({ title, project, assignedTo: assignedTo || undefined, priority, status, description, dueDate: dueDate || undefined });
  await log(project, req.user._id, `${req.user.name} created task "${title}"`);
  res.status(201).json({ success: true, data: task });
});
exports.get = wrap(async (req, res) => {
  const r = await findAuthorized(req, res);
  if (r) res.json({ success: true, data: await r.task.populate('assignedTo', 'name') });
});
exports.update = wrap(async (req, res) => {
  const r = await findAuthorized(req, res);
  if (!r) return;
  if (req.body.title !== undefined && !req.body.title.trim()) return fail(res, 400, 'Title cannot be empty');
  if (req.body.assignedTo && !isMember(r.project, req.body.assignedTo)) return fail(res, 400, 'Assignee must be a project member');
  const prevStatus = r.task.status;
  ['title', 'description', 'priority', 'status', 'assignedTo', 'dueDate'].forEach((k) => {
    if (req.body[k] !== undefined) r.task[k] = req.body[k] || undefined;
  });
  await r.task.save();
  if (req.body.status && req.body.status !== prevStatus) {
    await log(r.project._id, req.user._id, `${req.user.name} moved "${r.task.title}" to ${req.body.status}`);
  } else {
    await log(r.project._id, req.user._id, `${req.user.name} updated task "${r.task.title}"`);
  }
  res.json({ success: true, data: r.task });
});
exports.remove = wrap(async (req, res) => {
  const r = await findAuthorized(req, res);
  if (!r) return;
  await r.task.deleteOne();
  await log(r.project._id, req.user._id, `${req.user.name} deleted task "${r.task.title}"`);
  res.json({ success: true, message: 'Task deleted' });
});
