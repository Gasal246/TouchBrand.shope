const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const CartsSchema = new Schema({
  Products: [
    {
      Productid: { type: Schema.Types.ObjectId, ref:'Products', required: true },
      Dateadded: { type: Date, default: Date.now()},
      Price: { type: Number, required: true },
      Quantity: { type: Number, required: true },
    },
  ],
  Userid: { type: Schema.Types.ObjectId, required: true, unique: true },
});

const Carts = mongoose.model("Carts", CartsSchema);

module.exports = Carts;
