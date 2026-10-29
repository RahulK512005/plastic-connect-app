require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const createTables = require('./models/schema');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/transactions', require('./routes/transactions'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await createTables();
  } catch (err) {
    console.warn('DB not available:', err.message);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

if (process.env.VERCEL === undefined) {
  startServer();
}

module.exports = app;
