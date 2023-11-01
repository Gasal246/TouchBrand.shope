const statistics = require("../helpers/statistics");
const Orders = require("../public/models/ordermodel");
const Products = require("../public/models/productmodel");
const Sales = require("../public/models/salesmodel");
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

      const currentDate = req.query.date || Date.now()
      // Daily Sales
      let dailySales ={
        revenue: 0,
        count: 0
      }
      await statistics.getDailySales(currentDate).then((sales)=>{
        sales.forEach(sale => {
          dailySales.revenue += sale.Amount
          dailySales.count += sale.Products.length
        });
      })

      // Weekly sales
      let weeklySales ={
        revenue: 0,
        count: 0
      }
      await statistics.getWeeklySales(currentDate).then((sales)=>{
        sales.forEach(sale => {
          weeklySales.revenue += sale.Amount
          weeklySales.count += sale.Products.length
        });
      })

      // Monthly sales
      let monthlySales ={
        revenue: 0,
        count: 0
      }
      await statistics.getMonthlySales(currentDate).then((sales)=>{
        sales.forEach(sale => {
          monthlySales.revenue += sale.Amount
          monthlySales.count += sale.Products.length
        });
      })

      // Yearly sales
      let yearlySales ={
        revenue: 0,
        count: 0
      }
      await statistics.getYearlySales(currentDate).then((sales)=>{
        sales.forEach(sale => {
          yearlySales.revenue += sale.Amount
          yearlySales.count += sale.Products.length
        });
      })
      
      res.render("admin/dashboard", { productCount, totalStoke: totalStock[0].totalStock, userCount, orderCount, blockedUsers, dailySales, weeklySales, monthlySales, yearlySales, currentDate});
    } catch (error) {
      const on = "On Render Dashboard";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    } 
  },
  renderError: (req, res) => {
    const error = req.query.err || null
    const on = req.query.on || null;
    res.render('admin/errorpage', { error, on })
  }
};
