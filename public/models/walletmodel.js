const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const WalletsSchema = new Schema({
  Balance: { type: Number, required: true },
  Userid: { type: Schema.Types.ObjectId, required: true },
  Transactions: [{
     Amount: { type: Number },
     Transdate: { type: Date },
     Status: { type: String },
  }],
});

const Wallets = mongoose.model('Wallets', WalletsSchema);

module.exports = Wallets;

