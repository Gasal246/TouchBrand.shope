const Product = require("../public/models/productmodel");
const categoryCopy = require("../public/models/categorymodel");
const cartModel = require("../public/models/cartmodel");
const usermodel = require("../public/models/usermodel");
const Banners = require("../public/models/bannermodel");
const Products = require("../public/models/productmodel");

module.exports = {
  loadHome: async (req, res) => {
    try {
      const Products = await Product.aggregate([
        {
          $group: {
            _id: "$Category",
            products: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            category: "$_id",
            products: {
              $slice: ["$products", 10], // Limit to 10 products per category
            },
          },
        },
      ]);
      const categories = await categoryCopy.find({});
      const banners = await Banners.find({});
      if (req.cookies.user) {
        let cart = await cartModel.findOne({ Userid: req.cookies.user.id });
        await usermodel.findById(req.cookies.user.id).then((data)=>{
          if(data.Blocked == true){
            res.render("user/index", {
              error: req.query.err ? { form: req.query.err } : "Not logged in ??",
              cdata: null,
              Products,
              categories,
              banners,
              cart: "no",
            });
          }
        })
        res.render("user/index", {
          cdata: req.cookies.user,
          error: null,
          Products,
          categories,
          banners,
          cart: cart ? cart.Products : null,
        });
      } else {
        res.render("user/index", {
          error: req.query.err ? { form: req.query.err } : "Not logged in ??",
          cdata: null,
          Products,
          categories,
          banners,
          cart: "no",
        });
      }
    } catch (error) {
      const on = "On Homepage render";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
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
      const on = "On Deleting all Cart Products";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
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
  },
  searchControl: async (req, res)=>{
    try {
      const term = req.body.q
      res.redirect('/result?term=' + term)
    } catch (error) {
      const on = "On Search Proccessing...";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  }
};
