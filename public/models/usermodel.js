const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const UsersSchema = new Schema({
  Addedon: { type: Date, required: true },
  Username: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Phone: { type: Number, required: true, unique: true},
  Phone2: { type: Number },
  Gender: { type: String },
  Dob: { type: Date },
  verifycode:{ type: Number},
  verify: { type: Boolean },
  Blocked: { type: Boolean }
});

module.exports = mongoose.model("users", UsersSchema);
