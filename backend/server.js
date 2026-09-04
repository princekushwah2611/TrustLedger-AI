const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analyzeRoutes = require('./routes/analyze');
const auditLogRoutes = require('./routes/auditLog');
const approveRoutes = require('./routes/approve');
const askRoutes = require('./routes/ask');
const authRoutes = require('./routes/auth');
const disputeRoutes = require('./routes/dispute');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TrustLedger AI Backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/audit-log', auditLogRoutes);
app.use('/api/approve', approveRoutes);
app.use('/api/ask', askRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dispute', disputeRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TrustLedger AI Backend running on port ${PORT}`);
  });
}

module.exports = app;
