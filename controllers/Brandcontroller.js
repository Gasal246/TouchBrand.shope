const Brands = require("../public/models/brandmodel");
const Categories = require("../public/models/categorymodel");
const path = require("path");
const fs = require("fs");
const { isNull } = require("util");

module.exports = {
  getBrandsAdmin: async (req, res) => {
    try {
      let err = req.query.err || null
      const brands = await Brands.find({}).populate('Categories')
      const categories = await Categories.find({});
      res.render("admin/brands", { brands, err, categories });
    } catch (error) {
      const on = "On getting brands admin";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  addBrand: async (req, res, uniqueIdentifier) => {
    try {
      const image = req.file;
      const imagePath = `/uploads/brands/${uniqueIdentifier}_${image.originalname}`;
      await Brands.findOne({ Brandname: req.body.brandName}).then(async (data)=>{
        if (data) {
          const filePath = path.join(__dirname, "../public", imagePath);
          fs.unlinkSync(filePath);
          return res.redirect("/admin/addbrand?err=Brand Already Exist");
        }
        const newBrand = new Brands({
          Brandname: req.body.brandName,
          Categories: req.body.categories,
          Image: imagePath
        })
        await newBrand.save()
        res.redirect('/admin/brand')
      })
    } catch (error) {
      const on = "On adding brands admin";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  addBrandGet: async (req, res) => {
    try {
      let err = req.query.err || null
      const categories = await Categories.find({})
      res.render('admin/addbrand', { categories, err });
    } catch (error) {
      const on = "On gettig add brands admin";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  deleteBrand: async (req, res) => {
    try {
      let bid = req.params.bid;
      const brand = await Brands.findByIdAndDelete(bid);
      const filePath = path.join(__dirname, "../public", brand.Image);
      fs.unlinkSync(filePath);
      res.json({ deleted: true });
    } catch (error) {
      const on = "On Deleting Brand";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  getEditBrand: async (req, res)=>{
    try {
      let err = req.query.err || null
      const brand = await Brands.findById(req.params.bid)
      const categories = await Categories.find({})
      res.render('admin/editBrand', { brand, categories, err })
    } catch (error) {
      const on = "On Getting Editing Brand";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  editBrand: async(req, res, uniqueIdentifier)=>{
    try {
      const bid = req.params.bid;
      const brand = await Brands.findById(bid);
      let image = brand.Image;
      if (req.file) {
        const filePath = path.join(__dirname, "../public", brand.Image);
        fs.unlinkSync(filePath);
        image = `/uploads/brands/${uniqueIdentifier}_${req.file.originalname}`;
      }
      let editedData = {
        Brandname: req.body.brandName,
        Categories: req.body.categories,
        Image: image,
      };
      await Brands.findByIdAndUpdate(bid, {
        $set: editedData,
      });
      res.redirect('/admin/brand')
    } catch (error) {
      const on = "On Editing Brand";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  }
};
