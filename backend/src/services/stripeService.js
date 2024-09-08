// File: src/services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  async createSubscription(customerId, priceId) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const canceledSubscription = await stripe.subscriptions.del(subscriptionId);
      return canceledSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async listPayments(limit = 100) {
    try {
      const paymentIntents = await stripe.paymentIntents.list({ limit });
      return paymentIntents.data;
    } catch (error) {
      console.error('Error listing payments:', error);
      throw error;
    }
  }

  async refundPayment(paymentIntentId) {
    try {
      const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
      return refund;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  constructEvent(payload, sig) {
    return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }
}

module.exports = new StripeService();