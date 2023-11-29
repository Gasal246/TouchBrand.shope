const paymentHelper = require("../helpers/paymentHelper");
const Orders = require("../public/models/ordermodel");

module.exports = {
  verifyThePayment: async (req, res) => {
    try {
      paymentHelper
        .verifyPayment(req.body)
        .then(async (data) => {
          await Orders.findByIdAndUpdate(data.oid, {
            $set: { Status: 'active', Transactionid: data.tid },
          })
          res.json({ status: true, oid: data.oid });
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
