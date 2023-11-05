const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const SalesSchema = new Schema({
  Date: { type: Date, required: true },
  Userid: { type: Schema.Types.ObjectId },
  Orderid: { type: Schema.Types.ObjectId },
  Products: [{ type: Schema.Types.ObjectId, required: true,  }],
  Amount: { type: Number, required: true },
  Payby: { type: String, required: true },
  Payment: { type: Boolean }
});

const Sales = mongoose.model('Sales', SalesSchema);

module.exports =  Sales;

