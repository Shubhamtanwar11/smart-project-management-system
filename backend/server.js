require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) { console.error('Set MONGO_URI and JWT_SECRET in .env'); process.exit(1); }
connectDB().then(() => app.listen(process.env.PORT || 5000, () => console.log('API running'))).catch((e) => { console.error(e.message); process.exit(1); });
