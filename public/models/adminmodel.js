const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const Adminschema = new Schema({
  email: { type: String, required: true, unique: true},
  password: { type: String, required: true },
});

const Admin = mongoose.model("admins", Adminschema);

module.exports = Admin;