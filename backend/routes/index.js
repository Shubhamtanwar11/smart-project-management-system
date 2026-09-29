const router = require('express').Router();
const protect = require('../middleware/auth');
const auth = require('../controllers/auth');
const users = require('../controllers/users');
const projects = require('../controllers/projects');
const tasks = require('../controllers/tasks');

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);
router.route('/users/profile').get(protect, users.getProfile).put(protect, users.updateProfile);
router.route('/projects').get(protect, projects.list).post(protect, projects.create);
router.route('/projects/:id').get(protect, projects.get).put(protect, projects.update).delete(protect, projects.remove);
router.get('/tasks/stats', protect, tasks.stats);
router.route('/tasks').get(protect, tasks.list).post(protect, tasks.create);
router.route('/tasks/:id').get(protect, tasks.get).put(protect, tasks.update).delete(protect, tasks.remove);
module.exports = router;
