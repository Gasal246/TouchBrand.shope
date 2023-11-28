const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CouponsSchema = new Schema({
  Basedon: { type: String },
  Code: { type: String, required: true, unique: true },
  Discount: { type: Number, required: true },
  Status: { type: String, enum: [ 'active', ' used' ] },
  Addon: { type: Date },
  Expiry: { type: Date },
});

const Coupons = mongoose.model('Coupons', CouponsSchema);

module.exports = Coupons;

