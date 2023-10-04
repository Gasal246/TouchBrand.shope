const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const AddressSchema = new Schema({
  Userid: { type: Schema.Types.ObjectId, required: true, unique: true },
  Firstaddress: {
     City: { type: String, required: true },
     Cname: { type: String, required: true },
     Country: { type: String, required: true },
     Landmark: { type: String, required: true },
     Pincode: { type: Number, required: true },
     Place: { type: String, required: true },
  },
  Secondaddress: {
     City: { type: String },
     Cname: { type: String },
     Country: { type: String},
     Landmark: { type: String},
     Pincode: { type: Number },
     Place: { type: String },
  },
});

const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;
