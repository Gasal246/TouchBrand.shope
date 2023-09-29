const Product = require("../public/models/productmodel");
const categoryCopy = require("../public/models/categorymodel");
const cartModel = require("../public/models/cartmodel");

module.exports = {
  loadHome: async (req, res) => {
    const products = await Product.find({});
    const categories = await categoryCopy.find({});
    if (req.cookies.user) {
      let cart = await cartModel.findOne({ Userid: req.cookies.user.id });
      res.render("user/index", {
        cdata: req.cookies.user,
        error: null,
        products,
        categories,
        cart: cart ? cart.Products : null,
      });
    } else {
      res.render("user/index", {
        error: req.query.err ? { form: req.query.err } : "Not logged in ??",
        cdata: null,
        products,
        categories,
        cart: "no",
      });
    }
  },
  addToCart: async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.pid);
      let cart = await cartModel.findOne({ Userid: req.cookies.user.id });

      if (cart) {
        const existingProduct = cart.Products.find(
          (item) => item.Productid.toString() === product._id.toString()
        );

        if (existingProduct) {
          existingProduct.Quantity += 1;
        } else {
          cart.Products.push({
            Productid: product._id,
            Productname: product.Productname,
            Productimg: product.Imagepath[0],
            Price: product.Price - product.Discount,
            Quantity: 1,
          });
          await cart.save();
        }

        await cartModel.updateOne(
          { Userid: req.cookies.user.id, "Products.Productid": product._id },
          { $set: { "Products.$": existingProduct } }
        );
      } else {
        const newcart = new cartModel({
          Userid: req.cookies.user.id,
          Products: [
            {
              Productid: product._id,
              Productname: product.Productname,
              Productimg: product.Imagepath[0],
              Price: product.Price - product.Discount,
              Quantity: 1,
            },
          ],
        });

        await newcart.save();
      }

      // return res.redirect("/");
      next();
    } catch (error) {
      console.log("Cart saving error: ", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
  deleteCartItem: async (req, res, next) => {
    try {
      const productId = req.params.pid;
      let cart = await cartModel.findOne({ Userid: req.cookies.user.id });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found." });
      }
      const productIndex = cart.Products.findIndex(
        (item) => item.Productid.toString() === productId
      );

      cart.Products.splice(productIndex, 1);
      await cart.save();
      next();
    } catch (error) {
      console.log("Error deleting product from cart:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
  getCart: async(req, res) => {
    if(req.cookies.user){
      let cart = await cartModel.findOne({ Userid: req.cookies.user.id });
      res.render('user/cart', { cart: cart ? cart.Products : null })
    }
  },
  productView: async(req, res) => {
    const pid = req.params.pid;
    res.redirect(`/product?pid=${pid}`)
  },
};
