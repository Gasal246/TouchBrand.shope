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
const Shopepagecontroller = require("../controllers/Shopepagecontroller");
const paymentHelper = require("../helpers/paymentHelper");
const Paymentcontroller = require("../controllers/Paymentcontroller");
const Walletcontroller = require("../controllers/Walletcontroller");

const { checkUser } = require("../middlewares/checkAuth");

router.get("/", Homepagecontroller.loadHome);

router.get("/registernow", (req, res) => res.render("user/register"));

router.post("/registeruser", Usercontroller.registerUser);

router.get("/verify", (req, res) => res.render("user/verify", { error: null, cookies: req.cookies.user }));

router.post("/verify", Usercontroller.verifyUser);

router.post("/resendVerification/:email", Usercontroller.resendVerification);

router.post("/userlogin", Usercontroller.userLogin);

router.get("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

// ################## ACCOUNT SECTION ROUTES ################
router.get("/account", checkUser, Usercontroller.getUser);

router.post("/primaryaddress", checkUser, Usercontroller.primaryAdrress);

router.post("/secondaryaddress", checkUser, Usercontroller.secondaryAdress);

router.post("/editprofile", checkUser, Usercontroller.editProfile);

// ################## CART CONTROL ################
router.get("/addtocart/:pid", checkUser, Homepagecontroller.addToCart);

router.get("/removefromcart/:pid", checkUser, Homepagecontroller.deleteCartItem);

router.get("/viewcart", checkUser, Homepagecontroller.getCart);

router.get("/deletecartitems", checkUser, Homepagecontroller.deleteallCart);

// ######################## PRODUCT CONTROLLERS #####################
router.get("/product", Productcontroller.getProduct);

router.get("/viewproduct/:pid", Homepagecontroller.productView);

router.put("/updateQuantity/:id", checkUser, Cartcontroller.Quantityupdate);

// ######################## CHECKOUT CONTROL #####################
router.get("/checkout", checkUser, Checkoutcontroller.getCheckout);

router.get("/checkoutitem/:pid", checkUser, (req, res) => res.redirect(`/checkout?pid=${req.params.pid}`));

router.get("/cartcheckout", checkUser, Cartcontroller.cartCheckout);

// ##################### ORDER CONTROLs #####################
router.post('/saveorder', checkUser, Ordercontroller.saveOrder);

router.get('/placeorder', checkUser, (req, res) => res.render('user/ordercomplete'))

router.get('/removeorderitem/:id/:oid', checkUser, Ordercontroller.removeOrderItem);

router.get('/cancelorderitem/:id/:oid', checkUser, Ordercontroller.cancelOrderItem);

router.get('/vieworder', checkUser, Ordercontroller.viewOrderUser);

router.get('/cancelledorders', checkUser, Ordercontroller.viewCancelledOrders)

// ####################### SHOP-PAGE CONTROLS #####################
router.get('/shope', Shopepagecontroller.getShope)
// QuickView
router.get('/quickview', checkUser, Shopepagecontroller.quickView)

// ########################## VERIFY PAYMENT #########################
router.post('/verify-payment', checkUser, Paymentcontroller.verifyThePayment)

// ########################## WALLET #########################
router.get('/wallet', checkUser, Walletcontroller.getWallet)

router.post('/addmoneytowallet', checkUser, Walletcontroller.addToWallet)

// ########################## ERROR WRAPPER #########################
router.get('/error', checkUser, Homepagecontroller.errorPage)

module.exports = router;
