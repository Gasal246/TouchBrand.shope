const Address = require("../public/models/addressmodel");
const Carts = require("../public/models/cartmodel");
const Coupons = require("../public/models/couponmodel");
const Products = require("../public/models/productmodel");
const usermodel = require("../public/models/usermodel");
const Wallets = require("../public/models/walletmodel");

module.exports = {
  Quantityupdate: async (req, res, next) => {
    let productId = req.params.id;
    const newQuantity = req.body.quantity;
    try {
      const cart = await Carts.findOne({ Userid: req.cookies.user.id });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found." });
      }
      const product = cart.Products.find((p) => p._id == productId);
      const Theproduct = await Products.findById(product.Productid);
      if (newQuantity <= Theproduct.Stoke) {
        if (newQuantity < product.Quantity) {
          await Products.findByIdAndUpdate(product.Productid, {
            $inc: { Stoke: 1 }
          });
        } else if (newQuantity > product.Quantity) {
          await Products.findByIdAndUpdate(product.Productid, {
            $inc: { Stoke: -1 }
          });
        }
        product.Quantity = newQuantity;
        await cart.save();
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      const on = "On Updating Quantity";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
  cartCheckout: async (req, res) => {
    try {
      const user = await usermodel.findById(req.cookies.user.id);
      const address = await Address.findOne({ Userid: user._id });
      const cart = await Carts.findOne({ Userid: user._id }).populate(
        "Products.Productid"
      );
      let total = cart.Products.reduce(
        (total, item) =>
          total +
          (item.Productid.Price - item.Productid.Discount) * item.Quantity,
        0
      );
      const wallet = await Wallets.findOne({ Userid: req.cookies.user.id });
      const coupon = req.query.coupon;
      let Coupon;
      if (coupon) {
        Coupon = await Coupons.findOne({ Code: coupon });
        let disc = (Coupon.Discount / 100) * total;
        total = total - disc;
      }
      res.render("user/checkout", {
        product: null,
        user: user,
        address: address,
        quantity: null,
        cart: cart.Products,
        wallet,
        total,
        coupon: Coupon
      });
    } catch (error) {
      const on = "On Checkout From Cart";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  }
};
