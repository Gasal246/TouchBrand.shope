const paymentHelper = require("../helpers/paymentHelper");
const Orders = require("../public/models/ordermodel");

module.exports = {
  verifyThePayment: async (req, res) => {
    try {
      console.log(req.body);
      paymentHelper
        .verifyPayment(req.body)
        .then(async (data) => {
          await Orders.findByIdAndUpdate(data, {
            $set: { Status: 'active' },
          })
          res.json({ status: true, oid: data });
        })
        .catch((err) => {
          res.json({ error: err });
        });
    } catch (error) {
      const on = "On Verify Payment";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  }
};
