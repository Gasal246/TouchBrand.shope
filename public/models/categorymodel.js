const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CategoriesSchema = new Schema({
  Catname: { type: String, required: true, unique: true },
  Subcat: { type: String,  },
  Dateadded: { type: Date, default: Date.now()}
});

const Categories = mongoose.model('Categories', CategoriesSchema);

module.exports = Categories;

