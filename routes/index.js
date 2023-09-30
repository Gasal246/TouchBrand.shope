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
  if (req.cookies.user) {
    Homepagecontroller.addToCart(req, res, next);
    res.redirect("/");
  }else{
    res.redirect("/?err='login to use cart'")
  }
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

router.get("/deletecartitems", async (req, res, next) => {
  Homepagecontroller.deleteallCart(req, res, next);
});

// ######################## PRODUCT CONTROLLERS #####################
const Product = require("../public/models/productmodel");
const Categories = require("../public/models/categorymodel");
const usermodel = require("../public/models/usermodel");
const Address = require("../public/models/addressmodel");
const Carts = require("../public/models/cartmodel");
const Orders = require("../public/models/ordermodel");
const Products = require("../public/models/productmodel");
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
  if (req.cookies.user) {
    Homepagecontroller.addToCart(req, res, next);
    res.redirect(`/product?pid=${req.params.pid}`);
  } else {
    res.redirect("/?err='login to use cart'");
  }
});

// ######################## CHECKOUT CONTROL #####################
router.get("/checkout", async (req, res) => {
  const pid = req.query.pid;
  const qty = req.query.qty;
  if (pid) {
    const product = await Product.findById(pid);
    const user = await usermodel.findById(req.cookies.user.id);
    const address = await Address.findOne({ Userid: user._id });
    res.render("user/checkout", {
      product: product,
      user: user,
      address: address,
      quantity: qty ? qty : null,
      cart: null,
    });
  }
});
router.get("/checkoutitem/:pid", (req, res) => {
  res.redirect(`/checkout?pid=${req.params.pid}`);
});
router.get("/cartcheckout", async (req, res) => {
  const user = await usermodel.findById(req.cookies.user.id);
  const address = await Address.findOne({ Userid: user._id });
  const cart = await Carts.findOne({ Userid: user._id });
  res.render("user/checkout", {
    product: null,
    user: user,
    address: address,
    cart: cart.Products,
  });
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
    const product = cart.Products.find((p) => p._id == productId);
    console.log(product);
    product.Quantity = newQuantity;
    console.log("Product saved");
    await cart.save();
    res.status(200).json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.log("Product NOT saved : " + error.message);
    res.status(500).json({ error: "Error updating quantity" });
  }
});
// ##################### PLACE THE ORDER #####################
router.post('/saveorder', async (req, res) => {
  try {
    const userId = req.cookies.user.id;
    const user = await usermodel.findById(userId);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const productId = req.body.productId;
    let productDetails;
    let orderItems;

    if (typeof productId === 'string') {
      productDetails = await Products.findById(productId);
      if (!productDetails) {
        return res.status(400).json({ message: 'Product not found for ID: ' + productId });
      }
      orderItems = [{
        Paymet: 'pod',
        Productid: productDetails._id,
        Productname: productDetails.Productname,
        Price: productDetails.Price,
        Quantity: req.body.quantity
      }];
    } else if (Array.isArray(productId)) {
      productDetails = await Products.find({ _id: { $in: productId } });
      if (!productDetails) {
        return res.status(400).json({ message: 'Products not found for the given IDs' });
      }
      orderItems = productDetails.map((product) => {
        return {
          Paymet: 'pod',
          Productid: product._id,
          Productname: product.Productname,
          Price: product.Price,
          Quantity: req.body.quantity,
        };
      });
    } else {
      return res.status(400).json({ message: 'Invalid product ID(s) provided' });
    }

    const existingOrder = await Orders.findOne({ Userid: user._id });

    if (existingOrder) {
      // If an order already exists for the user, update it by adding new items
      existingOrder.Shippingcost = 0;
      existingOrder.Items.push(...orderItems);  // Add the new items to the existing order
      existingOrder.Totalamount += orderItems.reduce((total, item) => item.Price * item.Quantity, 0);
      existingOrder.Orderdate = new Date();

      await existingOrder.save();
      return res.redirect('/placeorder');
    }

    // Calculate total amount for the order (Price * Quantity)
    const totalAmount = orderItems.reduce((total, item) => total + item.Price * item.Quantity, 0);

    const orderData = {
      Userid: user._id,
      Username: user.Username,
      Shippingcost: 0,
      Items: orderItems,
      Totalamount: totalAmount,
      Orderdate: new Date(),
    };

    const order = await Orders.create(orderData);

    res.redirect('/placeorder');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get('/placeorder', (req, res) => {
  res.render('user/ordercomplete')
})


module.exports = router;
