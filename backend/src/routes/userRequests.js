// File: src/routes/userRequests.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const whatsappService = require('../services/whatsappService');
const googleSheetsService = require('../services/googleSheetsService');

const router = express.Router();

router.post('/report-issue', auth, async (req, res) => {
  try {
    const { issue } = req.body;
    const user = req.user;

    // Add issue to Google Sheets
    await googleSheetsService.appendRows('Issues!A2:D', [
      [new Date().toISOString(), user.username, user.phoneNumber, issue]
    ]);

    // Send WhatsApp notification to admin
    await whatsappService.sendMessage(
      process.env.ADMIN_PHONE_NUMBER,
      `New issue reported by ${user.username} (${user.phoneNumber}):\n${issue}`
    );

    res.json({ message: 'Issue reported successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/make-request', auth, async (req, res) => {
  try {
    const { request } = req.body;
    const user = req.user;

    // Add request to Google Sheets
    const response = await googleSheetsService.appendRows('Requests!A2:E', [
      [new Date().toISOString(), user.username, user.phoneNumber, request, 'Pending']
    ]);

    const requestId = response.updates.updatedRange.split('!')[1].split(':')[0].replace('A', '');

    // Send WhatsApp notification to admin
    await whatsappService.sendMessage(
      process.env.ADMIN_PHONE_NUMBER,
      `New request (ID: ${requestId}) from ${user.username} (${user.phoneNumber}):\n${request}`
    );

    res.json({ message: 'Request submitted successfully', requestId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/requests', auth, async (req, res) => {
  try {
    const user = req.user;
    const requests = await googleSheetsService.getRows('Requests!A2:E');
    const userRequests = requests
      .filter(row => row[1] === user.username)
      .map(row => ({
        id: row[0],
        date: row[0],
        request: row[3],
        status: row[4]
      }));
    res.json(userRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;