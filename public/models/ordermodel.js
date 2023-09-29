const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
  Userid: { type: Schema.Types.ObjectId, required: true, unique: true },
  Shippingcost: { type: Number },
  Items: [{
     Paymet: { type: String, required: true, enum: [ 'pod', ' online' ] },
     Productid: { type: Schema.Types.ObjectId, required: true },
     Productname: { type: String, required: true},
     Price: { type: Number, required: true},
     Quantity: { type: Number, required: true},
  }],
  Status: { type: String, required: true, default: 'active' },
  Totalamount: { type: Number, required: true },
  Orderdate: { type: Date, required: true },
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders;

