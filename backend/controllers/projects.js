const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const wrap = require('../utils/wrap');
const fail = require('../utils/fail');

const memberIds = async (emails = []) =>
  (await User.find({ email: { $in: emails.map((e) => e.trim().toLowerCase()) } }).select('_id')).map((u) => u._id);
const progress = (tasks) => ({
  taskCount: tasks.length,
  progress: tasks.length ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100) : 0,
});
const canView = (p, uid) => p.members.some((m) => m._id.equals(uid)) || p.owner._id.equals(uid);
const log = (project, user, message) => Activity.create({ project, user, message }).catch(() => {});

exports.list = wrap(async (req, res) => {
  const projects = await Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] })
    .populate('owner members', 'name email').sort('-createdAt').lean();
  const tasks = await Task.find({ project: { $in: projects.map((p) => p._id) } }).select('project status').lean();
  const data = projects.map((p) => ({ ...p, ...progress(tasks.filter((t) => t.project.equals(p._id))) }));
  res.json({ success: true, data });
});
exports.create = wrap(async (req, res) => {
  const { name, description, deadline, memberEmails } = req.body;
  if (!name) return fail(res, 400, 'Project name is required');
  const members = [...new Set([req.user._id, ...(await memberIds(memberEmails))].map(String))];
  const p = await Project.create({ name, description, deadline: deadline || undefined, owner: req.user._id, members });
  await log(p._id, req.user._id, `${req.user.name} created the project`);
  res.status(201).json({ success: true, data: p });
});
exports.get = wrap(async (req, res) => {
  const p = await Project.findById(req.params.id).populate('owner members', 'name email');
  if (!p) return fail(res, 404, 'Project not found');
  if (!canView(p, req.user._id)) return fail(res, 403, 'Access denied');
  const [tasks, activity] = await Promise.all([
    Task.find({ project: p._id }).populate('assignedTo', 'name').sort('-createdAt').lean(),
    Activity.find({ project: p._id }).populate('user', 'name').sort('-createdAt').limit(10).lean(),
  ]);
  res.json({ success: true, data: { ...p.toObject(), ...progress(tasks), tasks, activity } });
});
exports.update = wrap(async (req, res) => {
  const p = await Project.findById(req.params.id);
  if (!p) return fail(res, 404, 'Project not found');
  if (!p.owner.equals(req.user._id)) return fail(res, 403, 'Only the owner can edit this project');
  const { name, description, deadline, status, memberEmails } = req.body;
  if (name !== undefined) { if (!name.trim()) return fail(res, 400, 'Project name cannot be empty'); p.name = name; }
  if (description !== undefined) p.description = description;
  if (deadline !== undefined) p.deadline = deadline || undefined;
  if (status !== undefined) p.status = status;
  if (memberEmails) p.members = [...new Set([p.owner, ...(await memberIds(memberEmails))].map(String))];
  await p.save();
  await log(p._id, req.user._id, `${req.user.name} updated the project`);
  res.json({ success: true, data: p });
});
exports.remove = wrap(async (req, res) => {
  const p = await Project.findById(req.params.id);
  if (!p) return fail(res, 404, 'Project not found');
  if (!p.owner.equals(req.user._id)) return fail(res, 403, 'Only the owner can delete this project');
  await Promise.all([Task.deleteMany({ project: p._id }), Activity.deleteMany({ project: p._id })]);
  await p.deleteOne();
  res.json({ success: true, message: 'Project deleted' });
});
