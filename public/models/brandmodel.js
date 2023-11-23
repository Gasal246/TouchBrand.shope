const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const BrandsSchema = new Schema({
  Brandname:{
    type: String,
    required: true,
    unique: true,
  },
  Image:{
    type: String,
    required: true,
  },
  Categories:[
    { type: Schema.Types.ObjectId, ref:'Categories' }
  ]
});

const Brands = mongoose.model("Brands", BrandsSchema);

module.exports = Brands;
