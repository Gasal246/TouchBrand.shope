const Address = require("../public/models/addressmodel");
const Coupons = require("../public/models/couponmodel");
const Products = require("../public/models/productmodel");
const usermodel = require("../public/models/usermodel");
const Wallets = require("../public/models/walletmodel");

module.exports = {
  getCheckout: async (req, res, next) => {
    try {
      const pid = req.query.pid;
      const qty = req.query.qty;
      const coupon = req.query.coupon;
      if (pid) {
        const product = await Products.findById(pid);
        const user = await usermodel.findById(req.cookies.user.id);
        const address = await Address.findOne({ Userid: user._id });
        const wallet = await Wallets.findOne({ Userid: req.cookies.user.id });
        let total = (product.Price - product.Discount) * qty
        let Coupon
        if(coupon){
          Coupon = await Coupons.findOne({ Code: coupon })
          const disc = (Coupon.Discount / 100) * total
          total = total - disc
        }
        res.render("user/checkout", {
          product: product,
          user: user,
          address: address,
          quantity: qty ? parseInt(qty) : 1,
          cart: null,
          wallet, total, coupon: Coupon
        });
      }
    } catch (error) {
      const on = "On Checkout Order";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
};
