const mongoose = require("mongoose");
var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("../public/models/productmodel");
const Admincopy = require("../public/models/adminmodel");
const Categories = require("../public/models/categorymodel");

// ###########################################################################################

module.exports = {
  // GET PRODUCT
  getAdminProducts: async (req, res, uniqueIdentifier) => {
    try {
      const products = await Product.find({}).populate('Category')
      console.log(products[0]);
      if (req.cookies.admin) {
        res.render("admin/products", { products });
      } else {
        res.render("admin/login", {
          error: "Entered credentials are wrong!!"
        });
      }
    } catch (error) {
      const on = "On Getting productpage";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  //  ADD PRODUCT
  getAddProduct: async (req, res) => {
    try {
      const categories = await Categories.find({});
      console.log("Categories: " + categories);
      res.render("admin/addproduct", { categories });
    } catch (error) {
      const on = "On rendering addproduct Page";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  addProduct: async (req, res, uniqueIdentifier) => {
    try {
      const uploadedImages = req.files;
      const imagePaths = [];
      for (const image of uploadedImages) {
        const imagePath = `/uploads/${uniqueIdentifier}_${image.originalname}`;
        imagePaths.push(imagePath);
      }
      const subcategories = req.body.subcategory.split(",");
      const newProduct = new Product({
        Description: req.body.desc,
        Productname: req.body.pname,
        Spec: req.body.specs,
        Category: req.body.category,
        SubCategory: subcategories,
        Price: req.body.price,
        Discount: req.body.discount,
        Shipingcost: req.body.scost,
        Stoke: req.body.stoke,
        Imagepath: imagePaths,
        Dateadded: Date.now()
      });
      await newProduct.save().then((data) => {
        return res.redirect("/admin/products");
      });
    } catch (error) {
      const on = "On Add Product";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
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
    } catch (error) {
      const on = "On Delete Product";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },

  getEditProduct: async (req, res) => {
    try {
      const pid = req.query.id;
      let product;
      const categories = await Categories.find({});
      if (pid) {
        product = await Product.findById(pid).populate('Category')
      } 
      console.log(product);
      res.render("admin/editproduct", { product, categories });
    } catch (error) {
      const on = "On Geting Edit Product page";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },

  //   EDIT THE PRODUCT
  editProduct: async (req, res, uniqueIdentifier) => {
    try {
      const uploadedImages = req.files;
      console.log(uploadedImages);
      const productId = req.params.pid;
      const theproduct = await Product.findById(productId);
      const imagePaths = theproduct.Imagepath;
      for (const image of uploadedImages) {
        const imagePath = `/uploads/${uniqueIdentifier}_${image.originalname}`;
        imagePaths.push(imagePath);
      }

      const subcategories = req.body.subcategory.split(",");

      const editedData = {
        Description: req.body.desc,
        Productname: req.body.pname,
        Spec: req.body.specs,
        Category: req.body.category,
        SubCategory: req.body.subcategory,
        Price: req.body.price,
        Discount: req.body.discount,
        Shipingcost: req.body.scost,
        Stoke: req.body.stoke,
        Imagepath: imagePaths
      };
      await Product.findByIdAndUpdate(productId, {
        $set: editedData
      });
      res.redirect("/admin/products");
    } catch (error) {
      const on = "On Edit Product";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },

  getProduct: async (req, res, next) => {
    try {
      const pid = req.query.pid;
      if (pid) {
        const product = await Product.findById(pid);
        const category = await Categories.findOne({
          Catname: product.Category
        });
        res.render("user/product", { product: product, category: category });
      }
    } catch (error) {
      const on = "On Finding product";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },

  deleteImage: async (req, res, next) => {
    const imagePath = req.params.imgSrc;
    const productid = req.params.pid;
    const product = await Product.findById(productid);
    try {
      await Product.findByIdAndUpdate(productid, {
        $pull: { Imagepath: imagePath }
      });
      const filePath = path.join(__dirname, "../public", imagePath);
      fs.unlinkSync(filePath);
      res.redirect(`/admin/editproduct?pid=${productid}`);
    } catch (error) {
      const on = "On Removing image path";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  }
};
