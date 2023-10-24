const Orders = require("../public/models/ordermodel");
const Products = require("../public/models/productmodel");
const usermodel = require("../public/models/usermodel");

module.exports = {
  getDashboard: async (req, res) => {
    try {
      const productCount = await Products.countDocuments({})
      const totalStock = await Products.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$Stoke" }
          }
        }
      ])
      const userCount = await usermodel.countDocuments({})
      const blockedUsers = await usermodel.countDocuments({ Blocked: true })
      const orderCount = await Orders.countDocuments({
        "Items.cancelled": false,
      })
      console.log(productCount);
      res.render("admin/dashboard", { productCount, totalStoke: totalStock[0].totalStock, userCount, orderCount, blockedUsers});
    } catch (error) {
      res.status(500).json(error.message)
    } 
  },
  renderError: (req, res) => {
    const error = req.query.err || null
    const on = req.query.on || null;
    res.render('admin/errorpage', { error, on })
  }
};
