require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const days = (n) => new Date(Date.now() + n * 864e5);
(async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({})]);
  const demo = await User.create({ name: 'Demo User', email: 'demo@example.com', password: 'Demo@123' });
  const teammate = await User.create({ name: 'Alex Teammate', email: 'alex@example.com', password: 'Demo@123' });
  const p1 = await Project.create({ name: 'Website Redesign', description: 'Refresh the marketing site', owner: demo._id, members: [demo._id, teammate._id], deadline: days(20) });
  const p2 = await Project.create({ name: 'Mobile App MVP', description: 'First release of the student app', owner: demo._id, members: [demo._id], deadline: days(45) });
  await Task.insertMany([
    { title: 'Design wireframes', project: p1._id, assignedTo: demo._id, priority: 'high', status: 'completed', dueDate: days(-2) },
    { title: 'Build landing page', project: p1._id, assignedTo: teammate._id, priority: 'medium', status: 'in-progress', dueDate: days(5) },
    { title: 'Fix navbar bug', project: p1._id, assignedTo: demo._id, priority: 'high', status: 'todo', dueDate: days(-1) },
    { title: 'Set up CI', project: p2._id, assignedTo: demo._id, priority: 'low', status: 'todo', dueDate: days(10) },
    { title: 'Auth screens', project: p2._id, assignedTo: demo._id, priority: 'medium', status: 'in-progress', dueDate: days(7) },
  ]);
  console.log('Seeded. Login: demo@example.com / Demo@123');
  await mongoose.disconnect();
})();
