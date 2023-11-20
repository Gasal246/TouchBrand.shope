const Product = require("../public/models/productmodel");
const categoryCopy = require("../public/models/categorymodel");
const cartModel = require("../public/models/cartmodel");
const usermodel = require("../public/models/usermodel");
const Banners = require("../public/models/bannermodel");
const Products = require("../public/models/productmodel");
const producthelper = require("../helpers/producthelper");

module.exports = {
  loadHome: async (req, res) => {
    try {
      const populated = await Product.find({}).populate('Category').sort({ Dateadded: -1 })
      const productsByCategory = {};
      populated.forEach((product) => {
        const categoryName = product.Category?product.Category.Catname:'';
        if (!productsByCategory[categoryName]) {
          productsByCategory[categoryName] = [];
        }
  
        // Add the product to the category's list
        productsByCategory[categoryName].push(product);
  
        // Limit each category to 10 products
        if (productsByCategory[categoryName].length > 10) {
          productsByCategory[categoryName].pop();
        }
      });

      let newAdded = await Product.find({}).populate('Category').sort({ Dateadded: -1 }).limit(14) || []
      
      const discountSale = await producthelper.higherstDiscountProduct()
      console.log(discountSale);

      const categories = await categoryCopy.find({});
      const banners = await Banners.find({});
      if (req.cookies.user) {
        let cart = await cartModel.findOne({ Userid: req.cookies.user.id }).populate('Products.Productid')
        await usermodel.findById(req.cookies.user.id).then((data)=>{
          if(data.Blocked == true){
            res.render("user/index", {
              error: req.query.err ? { form: req.query.err } : "Not logged in ??",
              cdata: null,
              Products: productsByCategory, newAdded,
              categories, discountSale,
              banners,
              cart: "no",
            });
          }
        })
        res.render("user/index", {
          cdata: req.cookies.user,
          error: null,
          Products: productsByCategory, newAdded,
          categories, discountSale,
          banners,
          cart: cart ? cart.Products : null,
        });
      } else {
        res.render("user/index", {
          error: req.query.err ? { form: req.query.err } : "Not logged in ??",
          cdata: null,
          Products: productsByCategory, newAdded,
          categories, discountSale: null,
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
      const qty = req.query.qty || 1
      
      if(product.Stoke >= qty){

      product.Stoke -= qty ? parseInt(qty) : 1;
      await product.save();

      if (cart) {
        const existingProduct = cart.Products.find(
          (item) => item.Productid.toString() === product._id.toString()
        );

        if (existingProduct) {
          existingProduct.Quantity += qty ? parseInt(qty) : 1;
        } else {
          cart.Products.push({
            Productid: product._id,
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
      res.json({success: true})
    } else {
      res.json({success: false})
    }
    } catch (error) {
      console.log("Cart saving error: ", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
  deleteCartItem: async (req, res, next) => {
    try {
      const productId = req.body.pid;
      const qty = parseInt(req.body.qty);
      await Products.findByIdAndUpdate(productId, {$inc:{Stoke: qty}})
      let cart = await cartModel.findOne({ Userid: req.cookies.user.id });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found." });
      }
      let productIndex = cart.Products.findIndex(
        (item) => item.Productid.toString() === productId
      );
      cart.Products.splice(productIndex, 1);
      if(cart.Products.length < 1){
        await cartModel.findByIdAndRemove(cart._id)
      }else{
        await cart.save();
      }
      res.json({success: true})
    } catch (error) {
      const on = "On Error deleting product from cart";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
  getCart: async (req, res) => {
    if (req.cookies.user) {
      let cart = await cartModel.findOne({ Userid: req.cookies.user.id }).populate('Products.Productid')
      console.log("Popuated: ", cart);
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
