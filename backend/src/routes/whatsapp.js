// File: src/routes/whatsapp.js
const express = require('express');
const whatsappService = require('../services/whatsappService');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/send-message', auth, async (req, res) => {
  try {
    const { to, body } = req.body;
    const result = await whatsappService.sendMessage(to, body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/send-template', auth, async (req, res) => {
  try {
    const { to, templateName, languageCode, components } = req.body;
    const result = await whatsappService.sendTemplate(to, templateName, languageCode, components);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

