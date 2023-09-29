const mongoose = require("mongoose");
var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("../public/models/productmodel");
const Admincopy = require("../public/models/adminmodel");

// ###########################################################################################

module.exports = {
  // GET PRODUCT
  getAdminProducts: async (req, res, uniqueIdentifier) => {
    const products = await Product.find({});
    if (req.cookies.admin) {
      res.render("admin/products", { products });
    } else {
      res.render("admin/login", {
        error: "Entered credentials are wrong!!",
      });
    }
  },

  //  ADD PRODUCT
  addProduct: async (req, res, uniqueIdentifier) => {
    const uploadedImages = req.files;
    const imagePaths = [];

    try {
      for (const image of uploadedImages) {
        const imagePath = `/uploads/${uniqueIdentifier}_${image.originalname}`;
        imagePaths.push(imagePath);
      }

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
        return res.redirect("/admin/products");
      });
    } catch (err) {
      // Handle error
      console.error(err);
      // You can send an error response or render an error page as needed
      return res.status(500).send("Internal Server Error");
    }
  },

  //   DELETE PRODUCT
  deleteProduct: async (req, res) => {
    const productId = req.params.pid;
    try {
      const product = await Product.findById(productId);
      const imagePaths = product.Imagepath;

      await Product.findByIdAndRemove(productId);

      imagePaths.forEach((imagePath) => {
        const filePath = path.join(__dirname, "../public", imagePath);
        fs.unlinkSync(filePath);
      });

      return res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //   EDIT THE PRODUCT
  editProduct: async (req, res, uniqueIdentifier) => {
    const uploadedImages = req.files;
    console.log(uploadedImages);
    const productId = req.params.pid;
    const theproduct = await Product.findById(productId);
    const imagePaths = theproduct.Imagepath;
    for (const image of uploadedImages) {
      const imagePath = `/uploads/${uniqueIdentifier}_${image.originalname}`;
      imagePaths.push(imagePath);
    }
    console.log(uploadedImages);

    const editedData = {
      Description: req.body.desc,
      Productname: req.body.pname,
      Spec: req.body.specs,
      Category: req.body.category,
      Price: req.body.price,
      Discount: req.body.discount,
      Shipingcost: req.body.scost,
      Stoke: req.body.stoke,
      Imagepath: imagePaths,
    };

    try {
      await Product.findByIdAndUpdate(productId, {
        $set: editedData,
      });
      res.redirect("/admin/products");
    } catch (err) {
      console.log("Error on updating the data : " + err);
    }
  },
  
};
