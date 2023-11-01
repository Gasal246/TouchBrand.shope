const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const SalesSchema = new Schema({
  Date: { type: Date, required: true },
  Userid: { type: Schema.Types.ObjectId },
  Products: [{ type: Schema.Types.ObjectId, required: true,  }],
  Amount: { type: Number, required: true },
  Payby: { type: String, required: true },
});

const Sales = mongoose.model('Sales', SalesSchema);

module.exports =  Sales;

