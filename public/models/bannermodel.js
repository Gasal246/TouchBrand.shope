const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const BannerSchema = new Schema({
  Title: {
    type: String,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  Image: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  },
});

const Banners = mongoose.model("Banners", BannerSchema);

module.exports = Banners;
