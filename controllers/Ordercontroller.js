const { request } = require("express");
const Address = require("../public/models/addressmodel");
const Orders = require("../public/models/ordermodel");
const Products = require("../public/models/productmodel");
const usermodel = require("../public/models/usermodel");
const Carts = require("../public/models/cartmodel");

module.exports = {
  getOrders: async (req, res, next) => {
    try {
      const orders = await Orders.find({}).sort({ Orderdate: -1 });
      res.render("admin/orders", { orders: orders });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  viewOrder: async (req, res, next) => {
    try {
      const order = await Orders.findById(req.query.oid);
      res.render("admin/vieworder", { order: order });
    } catch (error) {
      res.status(400).json({ message: "Order not found" });
    }
  },
  saveOrder: async (req, res, next) => {
    console.log(req.body);
    try {
      const userId = req.cookies.user.id;
      const user = await usermodel.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const productId = req.body.productId;
      let productDetails;
      let orderItems;
      let isCart = false;

      if (typeof productId === "string") {
        productDetails = await Products.findById(productId);
        if (!productDetails) {
          return res
            .status(400)
            .json({ message: "Product not found for ID: " + productId });
        }
        orderItems = [
          {
            Paymet: "pod",
            Productid: productDetails._id,
            Productname: productDetails.Productname,
            Price: productDetails.Price - productDetails.Discount,
            Quantity: req.body.quantity,
            Productimg: req.body.pimage,
            Shippingcost: productDetails.Shipingcost,
          },
        ];
      } else if (Array.isArray(productId)) {
        productDetails = await Products.find({ _id: { $in: productId } });
        if (!productDetails) {
          return res
            .status(400)
            .json({ message: "Products not found for the given IDs" });
        }
        isCart = true;
        orderItems = productDetails.map((product, index) => {
          return {
            Paymet: "pod",
            Productid: product._id,
            Productname: product.Productname,
            Price: product.Price,
            Quantity: req.body.quantity[index],
            Productimg: req.body.pimage[index],
            Shippingcost: product.Shipingcost,
          };
        });
      } else {
        return res
          .status(400)
          .json({ message: "Invalid product ID(s) provided" });
      }

      const deliveryAddress = {
        cname: req.body.uname,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
        streetaddress: req.body.streetaddress1[0],
        landmark: req.body.streetaddress1[1],
      };

      // Calculate total amount for the order (Price * Quantity)
      const totalAmount = orderItems.reduce(
        (total, item) => total + item.Price * item.Quantity + item.Shippingcost,
        0
      );

      const orderData = {
        Userid: userId,
        Username: user.Username,
        Items: orderItems,
        Deliveryaddress: deliveryAddress,
        Totalamount: totalAmount,
        Orderdate: new Date(),
      };

      const order = await Orders.create(orderData);

      if(isCart == true){
        await Carts.findOneAndRemove({Userid: userId})
      }

      res.redirect("/placeorder");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  removeOrderItem: async (req, res, next) => {
    try {
      const orderId = req.params.id;
      const Ordersid = req.params.oid;
      console.log("orderid : " + orderId, "userid : " + Ordersid);

      // Find the order and update the Items array
      const order = await Orders.findById(Ordersid);

      // Filter out the item with the given _id
      const index = order.Items.findIndex((item) => item._id == orderId);
      order.Totalamount = order.Totalamount - order.Items[index].Price;

      order.Items = order.Items.filter(
        (item) => item._id.toString() !== orderId
      );

      if (order.Items.length < 1) {
        await Orders.findByIdAndRemove(Ordersid);
      }
      // Save the updated order
      await order.save();

      next();
    } catch (error) {
      console.error("Error removing item:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  viewOrderUser: async (req, res) => {
    try {
      const orderId = req.query.id;
      const order = await Orders.findById(orderId);
      res.render("user/vieworder", { order });
    } catch (error) {
      console.error("Error showing order:", error);
      res.status(500).send("Error showing order");
    }
  },
};
