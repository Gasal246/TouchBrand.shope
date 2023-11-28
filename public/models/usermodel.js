const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  Addedon: { type: Date, default: new Date},
  Username: { type: String,},
  Email: { type: String, unique: true },
  Password: { type: String, },
  Phone: { type: Number, unique: true},
  Gender: { type: String },
  Dob: { type: Date },
  verifycode:{ type: Number},
  verify: { type: Boolean },
  Blocked: { type: Boolean, default: false },
});

module.exports = mongoose.model("users", UsersSchema);
