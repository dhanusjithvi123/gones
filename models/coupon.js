const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({
  couponCode: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  minimumAmount: { type: Number, required: true },
  maximumAmount: { type: Number, required: true },
  discount: { type: Number, required: true },


  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isBlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // adds createdAt and updatedAt fields
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
