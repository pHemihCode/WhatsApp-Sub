// File: src/routes/sheets.js
const express = require('express');
const googleSheetsService = require('../services/googleSheetsService');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/users', auth, async (req, res) => {
  try {
    const rows = await googleSheetsService.getRows('Users!A2:F');
    const users = rows.map(row => ({
      name: row[0],
      phoneNumber: row[1],
      username: row[2],
      email: row[3],
      subscriptionStatus: row[4],
      subscriptionEndDate: row[5]
    }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sync-user', auth, async (req, res) => {
  try {
    const { user } = req.body;
    const values = [
      [user.name, user.phoneNumber, user.username, user.email, user.subscriptionStatus, user.subscriptionEndDate]
    ];
    await googleSheetsService.appendRows('Users!A2:F', values);
    res.json({ message: 'User synced to Google Sheets' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;