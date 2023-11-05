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
    let filename = `${uniqueIdentifier}_${file.originalname}`;
    cb(null, filename); // Use the unique file name
  },
});

const bannerStorage = multer.diskStorage({
  destination: "public/uploads/banners",
  filename: (req, file, cb) => {
    let filename = `${uniqueIdentifier}_${file.originalname}`;
    cb(null, filename); // Use the unique file name
  },
});

const upload = multer({ storage: storage });
const bannerUpload = multer({ storage: bannerStorage });

// Controller Imports
const productController = require("../controllers/Productcontroller");
const AdminUsercontroller = require("../controllers/AdminUsercontroller");
const AdminDashboard = require("../controllers/AdminDashboard");
const Categorycontroller = require("../controllers/Categorycontroller");
const usermodel = require("../public/models/usermodel");
const Ordercontroller = require("../controllers/Ordercontroller");
const Orders = require("../public/models/ordermodel");
const Categories = require("../public/models/categorymodel");
const Productcontroller = require("../controllers/Productcontroller");
const sharp = require("sharp");
const checkAuth = require("../middlewares/checkAuth");
const Bannercontroller = require("../controllers/Bannercontroller");
const Couponcontroller = require("../controllers/Couponcontroller");

// ############################### GET INTO DASHBOARD #########################
router.get("/", checkAuth.checkAdmin, AdminUsercontroller.getAdmin);

router.post("/adminlogin", AdminUsercontroller.adminLogin);

router.get("/dash", checkAuth.checkAdmin, AdminDashboard.getDashboard);

// ############################ PRODUCTS CONTROL ######################
router.get("/products", async (req, res) => {
  uniqueIdentifier = Date.now();
  productController.getAdminProducts(req, res, uniqueIdentifier);
});

router.get('/addproduct', checkAuth.checkAdmin, Productcontroller.getAddProduct)

router.post("/addproduct", upload.array("images", 8), async (req, res) => {
  productController.addProduct(req, res, uniqueIdentifier);
});

router.get("/deleteproduct/:pid", checkAuth.checkAdmin, productController.deleteProduct);

router.get('/editproduct', checkAuth.checkAdmin, Productcontroller.getEditProduct)

router.post(
  "/editproduct/:pid", checkAuth.checkAdmin,
  upload.array("images", 8),
  async (req, res) => {
    productController.editProduct(req, res, uniqueIdentifier);
  }
);

router.get("/delproductimg/:imgSrc/:pid", Productcontroller.deleteImage);

// #################################### USER CONTROLS ###########################################
router.get("/deleteuser/:uid",checkAuth.checkAdmin, AdminUsercontroller.deleteUser);

router.get("/users",checkAuth.checkAdmin, AdminUsercontroller.getUsers);

router.get("/blockuser/:email",checkAuth.checkAdmin, AdminUsercontroller.blockUser);

router.get("/unblockuser/:email",checkAuth.checkAdmin, AdminUsercontroller.unblockUser);

router.get('/viewuser',checkAuth.checkAdmin, (req, res) => res.render('admin/viewuser'));

router.get("/showuser/:uid",checkAuth.checkAdmin, AdminUsercontroller.viewuser);

// ############################## CATEGORY CONTROLL #########################
router.get("/categories",checkAuth.checkAdmin, Categorycontroller.getCategory);

router.post("/addcategory",checkAuth.checkAdmin, Categorycontroller.addcategory);

router.post("/editcategory/:catid",checkAuth.checkAdmin, Categorycontroller.editCategory);

router.get("/deletecategory/:catid",checkAuth.checkAdmin, Categorycontroller.deleteCategory);

// ################### ADMIN LOGOUT #################
router.get("/logout", async (req, res) => {
  res.clearCookie("admin");
  res.redirect("/admin");
});

// ################## BANNER CONTROL ################
router.get("/banner", checkAuth.checkAdmin, async (req, res) => {
  uniqueIdentifier = Date.now();
  Bannercontroller.getBanner(req, res)
});

router.get('/addbanner', checkAuth.checkAdmin, Bannercontroller.getaddBanner);

router.post('/addbanner', bannerUpload.single('Image'), (req, res)=>{
  Bannercontroller.addBanner(req, res, uniqueIdentifier)
});

router.get('/deletebanner/:bid',checkAuth.checkAdmin, Bannercontroller.deleteBanner)

router.get('/editbanner',checkAuth.checkAdmin, Bannercontroller.editBannerForm)

router.post('/editbanner/:bid', bannerUpload.single('Image'), (req, res)=>{
  Bannercontroller.editBanner(req, res, uniqueIdentifier)
})

// ###################### ORDER CONTROL ################
router.get('/orders',checkAuth.checkAdmin, Ordercontroller.getOrders)

router.get('/vieworder',checkAuth.checkAdmin, Ordercontroller.viewOrder)

router.post('/changeorderstatus',checkAuth.checkAdmin, Ordercontroller.updateStatus)

router.get('/deleteorder/:orderid',checkAuth.checkAdmin, Ordercontroller.deleteOrder)

router.get('/cancelledorders',checkAuth.checkAdmin, Ordercontroller.viewCancelledOrdersAdmin)

// ####################### COUPON CONTROL ###################
router.get('/coupon',checkAuth.checkAdmin, Couponcontroller.getCoupan)

router.post('/addcoupons', checkAuth.checkAdmin, Couponcontroller.addCoupons)

router.post('/deletecoupons', checkAuth.checkAdmin, Couponcontroller.deleteCoupon)

// ###################### ERROR PAAGE #########
router.get('/error', AdminDashboard.renderError)

module.exports = router;
