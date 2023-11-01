const Address = require("../public/models/addressmodel");
const Products = require("../public/models/productmodel");
const usermodel = require("../public/models/usermodel");
const Wallets = require("../public/models/walletmodel");

module.exports = {
  getCheckout: async (req, res, next) => {
    try {
      const pid = req.query.pid;
      const qty = req.query.qty;
      if (pid) {
        const product = await Products.findById(pid);
        const user = await usermodel.findById(req.cookies.user.id);
        const address = await Address.findOne({ Userid: user._id });
        const wallet = await Wallets.findOne({ Userid: req.cookies.user.id });
        res.render("user/checkout", {
          product: product,
          user: user,
          address: address,
          quantity: qty ? parseInt(qty) : 1,
          cart: null,
          wallet
        });
      }
    } catch (error) {
      const on = "On Checkout Order";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
};
