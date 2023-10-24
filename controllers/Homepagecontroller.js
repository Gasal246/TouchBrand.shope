const Product = require("../public/models/productmodel");
const categoryCopy = require("../public/models/categorymodel");
const cartModel = require("../public/models/cartmodel");
const usermodel = require("../public/models/usermodel");
const Banners = require("../public/models/bannermodel");

module.exports = {
  loadHome: async (req, res) => {
    try {
      const products = await Product.find({});
      const categories = await categoryCopy.find({});
      const banners = await Banners.find({});
      if (req.cookies.user) {
        let cart = await cartModel.findOne({ Userid: req.cookies.user.id });
        await usermodel.findById(req.cookies.user.id).then((data)=>{
          if(data.Blocked == true){
            res.render("user/index", {
              error: req.query.err ? { form: req.query.err } : "Not logged in ??",
              cdata: null,
              products,
              categories,
              banners,
              cart: "no",
            });
          }
        })
        res.render("user/index", {
          cdata: req.cookies.user,
          error: null,
          products,
          categories,
          banners,
          cart: cart ? cart.Products : null,
        });
      } else {
        res.render("user/index", {
          error: req.query.err ? { form: req.query.err } : "Not logged in ??",
          cdata: null,
          products,
          categories,
          banners,
          cart: "no",
        });
      }
    } catch (error) {
      console.log("Loding Home error: ", error);
      return res.status(500).json({ message: "Internal error." });
    }
  },
  addToCart: async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.pid);
      let cart = await cartModel.findOne({ Userid: req.cookies.user.id });
      const qty = req.query.qty
      if (cart) {
        const existingProduct = cart.Products.find(
          (item) => item.Productid.toString() === product._id.toString()
        );

        if (existingProduct) {
          existingProduct.Quantity += qty ? parseInt(qty) : 1;
        } else {
          cart.Products.push({
            Productid: product._id,
            Productname: product.Productname,
            Productimg: product.Imagepath[0],
            Price: product.Price - product.Discount,
            Quantity: qty ? parseInt(qty) : 1,
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
  getCart: async (req, res) => {
    if (req.cookies.user) {
      let cart = await cartModel.findOne({ Userid: req.cookies.user.id });
      res.render("user/cart", { cart: cart ? cart.Products : null });
    }
  },
  deleteallCart: async (req, res, next) => {
    const userid = req.cookies.user.id;

    try {
      const cart = await cartModel.findOne({ Userid: userid });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Set the Products array to an empty array
      cart.Products = [];

      // Save the updated cart
      await cart.save();

      res.redirect("/viewcart");
    } catch (error) {
      console.error("Error deleting products:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  productView: async (req, res) => {
    const pid = req.params.pid;
    res.redirect(`/product?pid=${pid}`);
  },
  errorPage: async (req, res) => {
    const error = req.query.err || null
    const on = req.query.on || null;
    res.render('user/errorpage', { error, on })
  }
};
