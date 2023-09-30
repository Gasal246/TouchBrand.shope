const Orders = require("../public/models/ordermodel")
const usermodel = require("../public/models/usermodel")

module.exports= {
    getOrders: async(req, res, next)=>{
        const orders = await Orders.find({})
        res.render("admin/orders", { orders: orders });
    },
}