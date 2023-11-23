const mongoose = require("mongoose");
const { isNumber } = require("razorpay/dist/utils/razorpay-utils");

const { Schema, ObjectId } = mongoose;

const ProductsSchema = new Schema({
  Description: { type: String, required: true },
  Productname: { type: String, required: true },
  Spec: { type: String, required: true },
  Dateadded: { type: Date, required: true },
  Category: { type: Schema.Types.ObjectId, ref:'Categories', required: true },
  Brand: { type: Schema.Types.ObjectId, ref:'Brands', required: true },
  SubCategory: [{ type: String, required: true }],
  Price: { type: Number, required: true },
  Discount: { type: Number },
  Shipingcost: { type: Number },
  Stoke: { type: Number, required: true },
  Imagepath: [{ type: String, required: true }],
});

const Products = mongoose.model("Products", ProductsSchema);

module.exports = Products;