var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("../public/models/productmodel");

let uniqueIdentifier = Date.now();

const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    const filename = `${uniqueIdentifier}_${file.originalname}`;
    cb(null, filename); // Use the unique file name
  },
});

const upload = multer({ storage: storage });

// Controller Imports
const productController = require("../controllers/Productcontroller");
const AdminUsercontroller = require("../controllers/AdminUsercontroller");
const AdminDashboard = require("../controllers/AdminDashboard");
const Categorycontroller = require("../controllers/Categorycontroller");
const usermodel = require("../public/models/usermodel");
const Ordercontroller = require("../controllers/Ordercontroller");
const Orders = require("../public/models/ordermodel");

// ############################### GET INTO DASHBOARD #########################

router.get("/", (req, res) => {
  if (req.cookies.admin) {
    res.render("admin/dashboard");
  } else {
    res.render("admin/login", { error: null });
  }
});

router.post("/adminlogin", async (req, res) => {
  AdminUsercontroller.adminLogin(req, res);
});

router.get("/dash", (req, res) => {
  AdminDashboard.getDashboard(req, res);
});

// ############################ PRODUCTS CONTROL ######################
router.get("/products", async (req, res) => {
  uniqueIdentifier = Date.now();
  productController.getAdminProducts(req, res, uniqueIdentifier);
});

router.post("/addproduct", upload.array("images", 8), async (req, res) => {
  productController.addProduct(req, res, uniqueIdentifier);
});

router.get("/deleteproduct/:pid", async (req, res) => {
  productController.deleteProduct(req, res);
});

router.post(
  "/editproduct/:pid",
  upload.array("images", 8),
  async (req, res) => {
    productController.editProduct(req, res, uniqueIdentifier);
  }
);

router.get("/delproductimg/:imgSrc/:pid", async (req, res) => {
  const imagePath = req.params.imgSrc;
  const productid = req.params.pid;
  const product = await Product.findById(productid);
  try {
    await Product.findByIdAndUpdate(productid, {
      $pull: { Imagepath: imagePath },
    });
    const filePath = path.join(__dirname, "../public", imagePath);
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error removing image path:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// #################################### USER CONTROLS ###########################################
router.get("/deleteuser/:uid", async (req, res) => {
  AdminUsercontroller.deleteUser(req, res);
});

router.get("/users", async (req, res) => {
  AdminUsercontroller.getUsers(req, res);
});

router.get("/blockuser/:email", async (req, res) => {
  AdminUsercontroller.blockUser(req, res);
});

router.get("/unblockuser/:email", async (req, res) => {
  AdminUsercontroller.unblockUser(req, res);
});

router.get('/viewuser', (req, res) => {
  res.render('admin/viewuser')
});

router.get("/showuser/:uid", async(req, res, next) => {
  AdminUsercontroller.viewuser(req, res, next);
});

// ############################## CATEGORY CONTROLL #########################
router.get("/categories", (req, res) => {
  Categorycontroller.getCategory(req, res);
});

router.post("/addcategory", async (req, res) => {
  Categorycontroller.addcategory(req, res);
});

router.post("/editcategory/:catid", async (req, res) => {
  Categorycontroller.editCategory(req, res);
});

router.get("/deletecategory/:catid", async (req, res) => {
  Categorycontroller.deleteCategory(req, res);
});

// ################### ADMIN LOGOUT #################
router.get("/logout", async (req, res) => {
  res.clearCookie("admin");
  res.redirect("/admin");
});

// ################## BANNER CONTROL ################
router.get("/banner", async (req, res) => {
  res.render("admin/banner");
});

// ###################### ORDER CONTROL ################
router.get('/orders', async (req, res, next) => {
  Ordercontroller.getOrders(req, res, next);
})
router.get('/vieworder', async (req, res, next) => {
  Ordercontroller.viewOrder(req, res, next);
})
router.get('/changeorderstatus/:orderid/:status', async (req, res, next) => {
  await Orders.findByIdAndUpdate(req.params.orderid, { $set: {Status: req.params.status} })
  res.redirect('/admin/orders')
})
router.get('/deleteorder/:orderid', async (req, res, next) => {
  await Orders.findByIdAndDelete(req.params.orderid)
  res.redirect('/admin/orders')
})

module.exports = router;
