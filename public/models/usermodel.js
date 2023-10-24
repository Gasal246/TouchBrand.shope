const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  Addedon: { type: Date, required: true },
  Username: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Phone: { type: Number, required: true, unique: true},
  Gender: { type: String },
  Dob: { type: Date },
  verifycode:{ type: Number},
  verify: { type: Boolean },
  Blocked: { type: Boolean, default: false }
});

module.exports = mongoose.model("users", UsersSchema);
