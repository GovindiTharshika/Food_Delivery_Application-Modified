const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const dotenv = require("dotenv");
dotenv.config({
  path: "./config/config.env"
});
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.processPayment = catchAsyncErrors(async (_0x10f77f, _0xd5d944, _0x3ed1f5) => {
  const _0x250b6c = await stripe.paymentIntents.create({
    amount: _0x10f77f.body.amount,
    currency: "inr",
    metadata: {
      integration_check: "accept_a_payment"
    }
  });
  _0xd5d944.status(200).json({
    success: true,
    client_secret: _0x250b6c.client_secret
  });
});
exports.sendStripApi = catchAsyncErrors(async (_0x173f81, _0x381bf3, _0x976b0f) => {
  _0x381bf3.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY
  });
});