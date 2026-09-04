const express = require('express');
const router = express.Router();

const DEMO_USERS = [
  {
    id: "usr_01",
    email: "founder@trustledger.ai",
    password: "demo123",
    name: "Prince Singh",
    role: "Founder & CEO",
    initials: "PS",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  },
  {
    id: "usr_02",
    email: "cfo@trustledger.ai",
    password: "demo123",
    name: "Vikram Mehta",
    role: "Chief Financial Officer",
    initials: "VM",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  },
  {
    id: "usr_03",
    email: "auditor@trustledger.ai",
    password: "demo123",
    name: "Ananya Sharma",
    role: "Lead External Auditor",
    initials: "AS",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  }
];

// Flexible Login Endpoint (Allows predefined demo users OR custom email login)
router.post('/login', (req, res) => {
  const { email } = req.body;

  const targetEmail = (email && email.trim()) ? email.trim() : "founder@trustledger.ai";

  // Check if predefined demo user
  let user = DEMO_USERS.find(
    u => u.email.toLowerCase() === targetEmail.toLowerCase()
  );

  // If custom email typed by user, dynamically construct profile
  if (!user) {
    const emailParts = targetEmail.split('@')[0];
    const cleanName = emailParts.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Finance User";
    const initials = cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "FU";

    user = {
      id: `usr_custom_${Date.now()}`,
      email: targetEmail,
      name: cleanName,
      role: "Finance Controller Admin",
      initials: initials,
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    };
  }

  const token = `tl_token_${user.id}_${Date.now()}`;

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      initials: user.initials,
      badgeColor: user.badgeColor
    }
  });
});

// Logout Endpoint
router.post('/logout', (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// Get Current User Endpoint
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(' ')[1];
  const matchedUser = DEMO_USERS.find(u => token.includes(u.id)) || {
    id: "usr_active",
    email: "user@trustledger.ai",
    name: "Prince Singh",
    role: "Founder & CEO",
    initials: "PS",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  };

  res.json({ user: matchedUser });
});

module.exports = router;
