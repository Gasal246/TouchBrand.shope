const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
  Userid: { type: Schema.Types.ObjectId, required: true},
  Username: { type: String },
  Items: [
    {
      Paymet: { type: String, required: true },
      Productid: { type: Schema.Types.ObjectId, required: true },
      Productname: { type: String, required: true },
      Price: { type: Number, required: true },
      Quantity: { type: Number, required: true },
      Productimg: { type: String },
      Shippingcost: { type: Number },
      cancelled: { type: Boolean, default: false }
    },
  ],
  Orderdate: { type: Date, required: true },
  Deliverydate: { type: Date, },
  Deliveryaddress: {
    cname: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    streetaddress: { type: String },
    landmark: { type: String },
    pincode: { type: String },
  }, 
  Status: { type: String, required: true, default: "pending" },
  Totalamount: { type: Number, required: true },
});

const Orders = mongoose.model("Orders", OrdersSchema);

module.exports = Orders;
