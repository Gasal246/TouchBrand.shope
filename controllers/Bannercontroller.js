const Banners = require("../public/models/bannermodel");
const Categories = require("../public/models/categorymodel");
const path = require("path");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const { findByIdAndUpdate } = require("../public/models/productmodel");

module.exports = {
  getBanner: async (req, res) => {
    try {
      const banners = await Banners.find({});
      res.render("admin/banner", { banners });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  getaddBanner: async (req, res) => {
    try {
      let err = req.query.err || null;
      if (err == "existing") {
        err = "The Banner already exists";
      }
      const categories = await Categories.find({});
      res.render("admin/addnewbanner", { categories, err });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  addBanner: async (req, res, uniqueIdentifier) => {
    try {
      const image = req.file;
      const imagePath = `/uploads/banners/${uniqueIdentifier}_${image.originalname}`;
      await Banners.findOne({ Title: req.body.title }).then(async (data) => {
        if (data) {
          const filePath = path.join(__dirname, "../public", imagePath);
          fs.unlinkSync(filePath);
          return res.redirect("/admin/addbanner?err=existing");
        }
        const newBanner = new Banners({
          Title: req.body.title,
          Category: req.body.category,
          Price: req.body.price,
          Image: imagePath,
        });
        await newBanner.save();
        res.redirect("/admin/banner");
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  deleteBanner: async (req, res) => {
    try {
      let bid = req.params.bid;
      const banner = await Banners.findByIdAndDelete(bid);
      const filePath = path.join(__dirname, "../public", banner.Image);
      fs.unlinkSync(filePath);
      res.json({ deleted: true });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  editBannerForm: async (req, res) => {
    try {
      let bid = req.query.bid;
      let err = req.query.err || null;
      const banner = await Banners.findById(bid);
      const categories = await Categories.find({});
      res.render("admin/editbanner", { banner, categories, err });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  editBanner: async (req, res, uniqueIdentifier) => {
    try {
      console.log(req.body);
      const bid = req.params.bid;
      const banner = await Banners.findById(bid);
      let image = banner.Image;
      if (req.file) {
        const filePath = path.join(__dirname, "../public", banner.Image);
        fs.unlinkSync(filePath);
        image = `/uploads/banners/${uniqueIdentifier}_${req.file.originalname}`;
      }
      let editedData = {
        Title: req.body.title,
        Category: req.body.category,
        Image: image,
        Price: req.body.price,
      };
      await Banners.findByIdAndUpdate(bid, {
        $set: editedData,
      });
      res.redirect('/admin/banner')
    } catch (error) {
        res.status(500).json(error.message);
    }
  },
};
