const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CouponsSchema = new Schema({
  Code: { type: String, required: true, unique: true },
  Discount: { type: Number, required: true },
  Status: { type: String },
  Addon: { type: Date },
});

const Coupons = mongoose.model('Coupons', CouponsSchema);

module.exports = Coupons;

