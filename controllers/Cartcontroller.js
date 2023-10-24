const Address = require("../public/models/addressmodel");
const Carts = require("../public/models/cartmodel");
const usermodel = require("../public/models/usermodel");

module.exports = {
  Quantityupdate: async (req, res, next) => {
    let productId = req.params.id;
    console.log(productId);
    const newQuantity = req.body.quantity;
    try {
      const cart = await Carts.findOne({ Userid: req.cookies.user.id });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found." });
      }
      const product = cart.Products.find((p) => p._id == productId);
      console.log(product);
      product.Quantity = newQuantity;
      console.log("Product saved");
      await cart.save();
      res.status(200).json({ message: "Quantity updated successfully" });
    } catch (error) {
      const on = "On Updating Quantity";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
  cartCheckout: async (req, res) => {
    console.log(req.body);
    try {
      const user = await usermodel.findById(req.cookies.user.id);
      const address = await Address.findOne({ Userid: user._id });
      const cart = await Carts.findOne({ Userid: user._id });
      res.render("user/checkout", {
        product: null,
        user: user,
        address: address,
        cart: cart.Products,
      });
    } catch (error) {
      const on = "On Checkout From Cart";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
};
