const Products = require("../public/models/productmodel");

module.exports = {
  getShope: async (req, res, next) => {
    console.log("reachead");
    try {
      let queryObj = req.query.qobj || {};
      let query = Products.find(queryObj);
      let cat = req.query.categories || null;
      let categories = cat?req.query.categories.split(","):null;
      console.log(categories);

      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 8;
      const skip = (page - 1) * limit;

      query = query.skip(skip).limit(limit);

      let products = await query;
      if(cat){
        products = products.filter(product => categories.includes(product.Category))
      }
      console.log(products);
      const docCount = await Products.countDocuments();
      const pagecount = Math.ceil(docCount / limit);
      // if(skip >= docCount){
      //   res.render('user/shope', {products: null, err: "No more pages"})
      // }
      res.render('user/shopepage', {products: products, err: null, pagecount, docCount, page, skip})

    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  quickView: async(req, res, next)=>{
    try {
      const pid = req.query.pid;
      const product = await Products.findById(pid);
      res.render('user/quickview', {product})
    } catch (error) {
      res.status(400)
      console.log(error.message);
    }
  },
};
