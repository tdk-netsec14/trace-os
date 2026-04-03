// Local Express server for the Trace OS backend API.
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
require('./db/database');

dotenv.config();

const healthRoute = require('./routes/health');
const activityRoute = require('./routes/activity');
const contextRoute = require('./routes/context');
const searchRoute = require('./routes/search');
const decisionsRoute = require('./routes/decisions');
const focusRoute = require('./routes/focus');
const standupRoute = require('./routes/standup');
const adminRoute = require('./routes/admin');

const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 500
}));

app.use('/api/health', healthRoute);
app.use('/api/activity', activityRoute);
app.use('/api/context', contextRoute);
app.use('/api/search', searchRoute);
app.use('/api/decisions', decisionsRoute);
app.use('/api/focus', focusRoute);
app.use('/api/standup', standupRoute);
app.use('/api/admin', adminRoute);

app.use((error, request, response, next) => {
  response.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.error(`Trace OS server running on port ${PORT}`);
});
