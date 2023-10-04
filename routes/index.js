var express = require("express");
var router = express.Router();

const Usercontroller = require("../controllers/Usercontroller");
const Homepagecontroller = require("../controllers/Homepagecontroller");
const Cartcontroller = require("../controllers/Cartcontroller");
const Productcontroller = require("../controllers/Productcontroller");
const Checkoutcontroller = require("../controllers/Checkoutcontroller");
const Ordercontroller = require("../controllers/Ordercontroller");

const Product = require("../public/models/productmodel");
const Categories = require("../public/models/categorymodel");
const usermodel = require("../public/models/usermodel");
const Address = require("../public/models/addressmodel");
const Carts = require("../public/models/cartmodel");
const Orders = require("../public/models/ordermodel");
const Products = require("../public/models/productmodel");

router.get("/", Homepagecontroller.loadHome);

router.get("/registernow", (req, res) => {
  res.render("user/register");
});

router.post("/registeruser", Usercontroller.registerUser);

router.get("/verify", (req, res) => {
  res.render("user/verify", { error: null, cookies: req.cookies.user });
});

router.post("/verify", Usercontroller.verifyUser);

router.post("/resendVerification/:email", Usercontroller.resendVerification);

router.post("/userlogin", Usercontroller.userLogin);

router.get("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

// ################## ACCOUNT SECTION ROUTES ################
router.get("/account", Usercontroller.getUser);

router.post("/primaryaddress", Usercontroller.primaryAdrress);

router.post("/secondaryaddress", Usercontroller.secondaryAdress);

router.post("/editprofile", Usercontroller.editProfile);

// ################## CART CONTROL ################
router.get("/addtocart/:pid", Homepagecontroller.addToCart);

router.get("/removefromcart/:pid", Homepagecontroller.deleteCartItem);

router.get("/viewcart", Homepagecontroller.getCart);

router.get("/deletecartitems", Homepagecontroller.deleteallCart);

// ######################## PRODUCT CONTROLLERS #####################
router.get("/product", Productcontroller.getProduct);

router.get("/viewproduct/:pid", Homepagecontroller.productView);

router.put("/updateQuantity/:id", Cartcontroller.Quantityupdate);

// ######################## CHECKOUT CONTROL #####################
router.get("/checkout", Checkoutcontroller.getCheckout);

router.get("/checkoutitem/:pid", (req, res) => {
  res.redirect(`/checkout?pid=${req.params.pid}`);
});

router.get("/cartcheckout", Cartcontroller.cartCheckout);

// ##################### ORDER CONTROLs #####################
router.post('/saveorder', Ordercontroller.saveOrder);

router.get('/placeorder', (req, res) => {
  res.render('user/ordercomplete')
})

router.get('/removeorderitem/:id/:oid', Ordercontroller.removeOrderItem);

router.get('/vieworder', Ordercontroller.viewOrderUser);

// ####################### SHOP-PAGE CONTROLS #####################
router.get('/shope', (req, res) => {
  res.render('user/shopepage')
})

module.exports = router;
