// File: src/routes/webhooks.js
const express = require("express");
const stripeService = require("../services/stripeService");
const User = require("../models/User");
const whatsappService = require("../services/whatsappService");

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripeService.constructEvent(req.body, sig);

      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(event.data.object);
          break;
        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(event.data.object);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event.data.object);
          break;
        // Add more event handlers as needed
      }

      res.json({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

async function handlePaymentIntentSucceeded(paymentIntent) {
  const user = await User.findOne({ stripeCustomerId: paymentIntent.customer });
  if (user) {
    user.subscriptionStatus = "active";
    user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    await user.save();

    await whatsappService.sendTemplate(
      user.phoneNumber,
      "payment_succeeded",
      "en_US",
      [{ type: "body", parameters: [{ type: "text", text: user.name }] }]
    );
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  const user = await User.findOne({ stripeCustomerId: paymentIntent.customer });
  if (user) {
    await whatsappService.sendTemplate(
      user.phoneNumber,
      "payment_failed",
      "en_US",
      [{ type: "body", parameters: [{ type: "text", text: user.name }] }]
    );
  }
}

async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  if (user) {
    user.subscriptionStatus = "expired";
    user.subscriptionEndDate = null;
    await user.save();

    await whatsappService.sendTemplate(
      user.phoneNumber,
      "subscription_expired",
      "en_US",
      [{ type: "body", parameters: [{ type: "text", text: user.name }] }]
    );
  }
}

module.exports = router;
