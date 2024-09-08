// File: src/routes/payment.js
const express = require('express');
const auth = require('../middleware/auth');
const stripeService = require('../services/stripeService');
const User = require('../models/User');
const whatsappService = require('../services/whatsappService');
const googleSheetsService = require('../services/googleSheetsService');

const router = express.Router();

router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const amount = 2000; // $20.00 in cents
    const paymentIntent = await stripeService.createPaymentIntent(amount);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripeService.confirmPaymentIntent(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
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
        'payment_confirmed',
        'en_US',
        [
          { type: 'body', parameters: [{ type: 'text', text: user.name }] },
          { type: 'body', parameters: [{ type: 'date_time', date_time: { fallback_value: user.subscriptionEndDate.toISOString() } }] }
        ]
      );

      res.json({ message: 'Payment confirmed and subscription upgraded' });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
