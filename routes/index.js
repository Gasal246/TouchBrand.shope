var express = require("express");
var router = express.Router();

const Usercontroller = require("../controllers/Usercontroller");
const Homepagecontroller = require("../controllers/Homepagecontroller");

router.get("/", async (req, res, next) => {
  Homepagecontroller.loadHome(req, res);
});

router.get("/registernow", (req, res) => {
  res.render("user/register");
});

router.post("/registeruser", (req, res) => {
  Usercontroller.registerUser(req, res);
});

router.get("/verify", (req, res) => {
  res.render("user/verify", { error: null, cookies: req.cookies.user });
});

router.post("/verify", async (req, res) => {
  Usercontroller.verifyUser(req, res);
});

router.post("/resendVerification/:email", async (req, res) => {
  Usercontroller.resendVerification(req, res);
});

router.post("/userlogin", (req, res) => {
  Usercontroller.userLogin(req, res);
});

router.get("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

// ################## ACCOUNT SECTION ROUTES ################
router.get("/account", async (req, res) => {
  Usercontroller.getUser(req, res);
});

router.post("/primaryaddress", async (req, res) => {
  Usercontroller.primaryAdrress(req, res);
});

router.post("/secondaryaddress", async (req, res) => {
  Usercontroller.secondaryAdress(req, res);
});

router.post("/editprofile", async (req, res, next) => {
  Usercontroller.editProfile(req, res, next);
});

// ################## CART CONTROL ################
router.get("/addtocarthome/:pid", (req, res, next) => {
  Homepagecontroller.addToCart(req, res, next);
  res.redirect("/");
});

router.get("/removefromcarthome/:pid", (req, res, next) => {
  Homepagecontroller.deleteCartItem(req, res, next);
  res.redirect("/");
});

router.get("/removefromcartcart/:pid", (req, res, next) => {
  Homepagecontroller.deleteCartItem(req, res, next);
  res.redirect("/viewcart");
});

router.get("/viewcart", (req, res) => {
  Homepagecontroller.getCart(req, res);
});

// ######################## PRODUCT CONTROLLERS #####################
const Product = require("../public/models/productmodel");
const Categories = require("../public/models/categorymodel");
const usermodel = require("../public/models/usermodel");
const Address = require("../public/models/addressmodel");
const Carts = require("../public/models/cartmodel");
router.get("/product", async (req, res) => {
  const pid = req.query.pid;
  if (pid) {
    const product = await Product.findById(pid);
    const category = await Categories.findOne({ Catname: product.Category });
    res.render("user/product", { product: product, category: category });
    console.log("category : ", category);
  }
});
router.get("/viewproduct/:pid", (req, res) => {
  Homepagecontroller.productView(req, res);
});
router.get("/addtocartproduct/:pid", (req, res, next) => {
  Homepagecontroller.addToCart(req, res, next);
  res.redirect(`/product?pid=${req.params.pid}`);
});

// ######################## CHECKOUT CONTROL #####################
router.get("/checkout", async (req, res) => {
  const pid = req.query.pid;
  if (pid) {
    const product = await Product.findById(pid);
    const user = await usermodel.findById(req.cookies.user.id);
    const address = await Address.findOne({ Userid: user._id });
    res.render("user/checkout", {
      product: product,
      user: user,
      address: address,
    });
  }
});
router.get("/checkoutitem/:pid", (req, res) => {
  res.redirect(`/checkout?pid=${req.params.pid}`);
});
router.post("/checkoutproduct", async (req, res) => {
  console.log(req.body);
});
// ######################## Quantity Update #####################
router.put("/updateQuantity/:id", async (req, res) => {
  let productId = req.params.id;
  console.log(productId);
  const newQuantity = req.body.quantity;
  try {
    const cart = await Carts.findOne({ Userid: req.cookies.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }
    const product = cart.Products.find((p)=> p._id == productId )
    console.log(product);
    product.Quantity = newQuantity
    console.log("Product saved");
    await cart.save();
    res.status(200).json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.log("Product NOT saved : "+ error.message);
    res.status(500).json({ error: "Error updating quantity" });
  }
});

module.exports = router;
