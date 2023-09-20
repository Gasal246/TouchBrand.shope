var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("../public/models/productmodel");
const Usercopy = require("../public/models/usermodel");
const Admincopy = require("../public/models/adminmodel");

let uniqueIdentifier = Date.now(); // Declare the variable in the outer scope

const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    const filename = `${uniqueIdentifier}_${file.originalname}`;
    cb(null, filename); // Use the unique file name
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => {
  res.render("admin/login", { error: null });
});

router.post("/adminlogin", async (req, res) => {
  console.log();
  const admin = await Admincopy.find({
    email: req.body.email,
    password: req.body.password,
  });
  if (admin) {
    res.cookie("admin", req.body.email, { maxAge: 36000000, httpOnly: true });
    res.redirect("/admin/dash");
  } else {
    console.log(" ADMIN LOGIN ERROR : ", err);
    res.render("admin/login", { error: "Entered credentials are wrong!!" });
  }
});

router.get("/dash", async (req, res) => {
  if (req.cookies.admin) {
    const userData = await Usercopy.find({});
    res.render("admin/admin");
  } else {
    res.render("admin/login", { error: "Entered credentials are wrong!!" });
  }
});

router.get("/products", async (req, res) => {
  uniqueIdentifier = Date.now();
  const products = await Product.find({});
  res.render("admin/products", { products });
});

router.post("/addproduct", upload.array("images", 8), async (req, res) => {
  const uploadedImages = req.files;
  const imagePaths = [];

  try {
    for (const image of uploadedImages) {
      // Move the uploaded image to the "uploads" folder
      const imagePath = `/uploads/${uniqueIdentifier}_${image.originalname}`;
      imagePaths.push(imagePath);
    }

    // Create a new product entry with the image paths
    const newProduct = new Product({
      Description: req.body.desc,
      Productname: req.body.pname,
      Spec: req.body.specs,
      Category: req.body.category,
      Price: req.body.price,
      Discount: req.body.discount,
      Shipingcost: req.body.scost,
      Stoke: req.body.stoke,
      Imagepath: imagePaths,
      Dateadded: Date.now(),
    });

    await newProduct.save().then((data) => {
      res.redirect("/admin/products");
    });
  } catch (err) {
    // Handle error
    console.error(err);
    // You can send an error response or render an error page as needed
    res.status(500).send("Internal Server Error");
  }
});

router.get("/deleteproduct/:pid", async (req, res) => {
  const productId = req.params.pid;

  try {
    // Find the product by its ID
    const product = await Product.findById(productId);

    // Retrieve the image paths associated with the product
    const imagePaths = product.Imagepath;

    // Delete the product from the database
    await Product.findByIdAndRemove(productId);

    // Delete the associated image files from the "uploads" folder
    imagePaths.forEach((imagePath) => {
      const filePath = path.join(__dirname, "../public", imagePath);

      // Use fs.unlinkSync to remove the file
      fs.unlinkSync(filePath);
    });

    res.redirect("/admin/products"); // Redirect to the product listing page
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/deleteuser/:uid", async (req, res) => {
  const userId = req.params.uid;
  try {
    const user = await Usercopy.findById(userId);
    await Usercopy.findByIdAndRemove(userId);
    res.redirect("/admin/users");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/users", async (req, res) => {
  const users = await Usercopy.find({});
  res.render("admin/users", { users });
});

router.get("/blockuser/:email", async (req, res) => {
  await Usercopy.updateOne(
    { Email: req.params.email },
    { $set: { Blocked: true } }
  );
  res.redirect("/admin/users");
});

router.get("/unblockuser/:email", async (req, res) => {
  await Usercopy.updateOne(
    { Email: req.params.email },
    { $set: { Blocked: false } }
  );
  res.redirect("/admin/users");
});

module.exports = router;
