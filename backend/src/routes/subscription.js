// File: src/routes/subscription.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const whatsappService = require('../services/whatsappService');
const googleSheetsService = require('../services/googleSheetsService');

const router = express.Router();

router.post('/upgrade', auth, async (req, res) => {
  try {
    const user = req.user;
    user.subscriptionStatus = 'active';
    user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    await user.save();

    // Sync to Google Sheets
    await googleSheetsService.updateRows(`Users!A${user.rowIndex}:F${user.rowIndex}`, [
      [user.name, user.phoneNumber, user.username, user.email, user.subscriptionStatus, user.subscriptionEndDate]
    ]);

    // Send WhatsApp notification
    await whatsappService.sendTemplate(
      user.phoneNumber,
      'subscription_upgraded',
      'en_US',
      [
        { type: 'body', parameters: [{ type: 'text', text: user.name }] },
        { type: 'body', parameters: [{ type: 'date_time', date_time: { fallback_value: user.subscriptionEndDate.toISOString() } }] }
      ]
    );

    res.json({ message: 'Subscription upgraded successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', auth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      status: user.subscriptionStatus,
      endDate: user.subscriptionEndDate,
      referralScore: user.referralScore
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;