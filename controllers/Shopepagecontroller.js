const Brands = require("../public/models/brandmodel");
const Categories = require("../public/models/categorymodel");
const Products = require("../public/models/productmodel");

module.exports = {
  getShope: async (req, res, next) => {
    console.log("reachead");
    try {
      let min = req.query.min || 0;
      let max = req.query.max || 5000;
      let queryObj = req.query.qobj || {Price: { $gte: min, $lte: max }};
      let query = Products.find(queryObj).populate('Category').populate('Brand');
      const categorydata = await Categories.find({});
      const brandData = await Brands.find({})
      const productCount = await Products.aggregate([
        {
          $group: {
            _id: '$Category',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryArray'
          }
        },
        {
          $project: {
            _id: 1,
            count: 1,
            category: 1,
            category: { $arrayElemAt: ['$categoryArray.Catname', 0] }
          }
        }
      ])
      let cat = req.query.categories || null;
      let brand = req.query.brands || null;
      let categories = cat?req.query.categories.split(","):null;
      let brands = brand?req.query.brands.split(","):null;

      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 8;
      const skip = (page - 1) * limit;

      query = query.skip(skip).limit(limit);
      
      let products = await query;
      console.log(products);
      if(cat){
        products = products.filter(product => categories.includes(product.Category.Catname))
      }
      if(brand){
        products = products.filter(product => brands.includes(product.Brand.Brandname))
      }
      const docCount = await Products.countDocuments();
      const pagecount = Math.ceil(docCount / limit);

      res.render('user/shopepage', {products: products, err: null, pagecount, docCount, page, skip, categorydata, productCount, brandData})

    } catch (error) {
      const on = "On ShopePage";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
  quickView: async(req, res, next)=>{
    try {
      const pid = req.query.pid;
      const product = await Products.findById(pid);
      res.render('user/quickview', {product})
    } catch (error) {
      const on = "On Quick view";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
};
