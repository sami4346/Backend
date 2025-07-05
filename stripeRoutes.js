const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { contactId, contactName } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Hiring ${contactName}`,
            },
            unit_amount: 1000, // $10.00 charge for hiring, adjust as needed
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/hireNow?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/hireNow?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

module.exports = router;
