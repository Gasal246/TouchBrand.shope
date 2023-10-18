const { request } = require("express");
const Address = require("../public/models/addressmodel");
const Orders = require("../public/models/ordermodel");
const Products = require("../public/models/productmodel");
const usermodel = require("../public/models/usermodel");
const Carts = require("../public/models/cartmodel");
const mongoose = require("mongoose");
const { default: Stripe } = require("stripe");
const { response } = require("../app");
const paymentHelper = require("../helpers/paymentHelper");
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

module.exports = {
  getOrders: async (req, res, next) => {
    try {
      const orders = await Orders.aggregate([
        {
          $unwind: "$Items"  // Split the array into separate documents for each item
        },
        {
          $match: {
            "Items.cancelled": false  // Filter only the items with cancelled set to true
          }
        },
        {
          $group: {
            _id: "$_id",  // Group by order ID
            Userid: { $first: "$Userid" },
            Username: { $first: "$Username" },
            Orderdate: { $first: "$Orderdate" },
            Deliveryaddress: { $first: "$Deliveryaddress" },
            Status: { $first: "$Status" },
            Totalamount: { $first: "$Totalamount" },
            Items: { $push: "$Items" }  // Reconstruct the items array with cancelled items
          }
        }
      ]).sort({ Orderdate: -1 });
      const cancelled = await Orders.aggregate([
        {
          $unwind: "$Items"  // Split the array into separate documents for each item
        },
        {
          $match: {
            "Items.cancelled": true  // Filter only the items with cancelled set to true
          }
        },
        {
          $group: {
            _id: "$_id",  // Group by order ID
            Userid: { $first: "$Userid" },
            Username: { $first: "$Username" },
            Orderdate: { $first: "$Orderdate" },
            Deliveryaddress: { $first: "$Deliveryaddress" },
            Status: { $first: "$Status" },
            Totalamount: { $first: "$Totalamount" },
            Items: { $push: "$Items" }  // Reconstruct the items array with cancelled items
          }
        }
      ])
      res.render("admin/orders", { orders: orders, ccount: cancelled.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  viewOrder: async (req, res, next) => {
    try {
      const order = await Orders.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.query.oid)
          }
        },
        {
          $unwind: "$Items"
        },
        {
          $match: {
            "Items.cancelled": false
          }
        },
        {
          $group: {
            _id: "$_id",
            Userid: { $first: "$Userid" },
            Username: { $first: "$Username" },
            Orderdate: { $first: "$Orderdate" },
            Deliveryaddress: { $first: "$Deliveryaddress" },
            Status: { $first: "$Status" },
            Totalamount: { $first: "$Totalamount" },
            Items: { $push: "$Items" }
          }
        }
      ])
      console.log(order);
      res.render("admin/vieworder", { order: order });
    } catch (error) {
      res.status(400).json(error.message);
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
            Paymet: req.body.payby,
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
            Paymet: req.body.payby,
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
      console.log("ORDER" + order);

      if (isCart == true) {
        await Carts.findOneAndRemove({ Userid: userId });
      }

      const payby = req.body.payby
      if(payby == 'cod'){
        res.json({codsuccess:true});
      }else{
        paymentHelper.generateRazorpay(order._id, order.Totalamount).then((response)=>{
          res.json(response);
        })
      }
      
      // res.redirect("/placeorder");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  removeOrderItem: async (req, res, next) => {
    try {
      const orderId = req.params.id;
      const Ordersid = req.params.oid;
      console.log("orderid : " + orderId, "userid : " + Ordersid);

      const order = await Orders.findById(Ordersid);

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
  cancelOrderItem: async (req, res, next) => {
    try {
      const pid = req.params.id;
      const oid = req.params.oid;

      const order = await Orders.findById(oid);

      const index = order.Items.findIndex((item) => item._id == pid);
      order.Totalamount = order.Totalamount - order.Items[index].Price;
      order.Items[index].cancelled = true;

      if (order.Items.length < 1) {
        await Orders.findByIdAndRemove(oid);
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
  viewCancelledOrders: async (req, res) => {
    try {
      const uid = req.cookies.user.id;
      const corders = await Orders.aggregate([
        {
          $match: {
            Userid: new mongoose.Types.ObjectId(uid), // Convert the user ID to ObjectId type
          },
        },
        {
          $unwind: "$Items", // Split the array into separate documents for each item
        },
        {
          $match: {
            "Items.cancelled": true, // Filter only the items with cancelled set to true
          },
        },
        {
          $group: {
            _id: "$_id", // Group by order ID
            Userid: { $first: "$Userid" },
            Username: { $first: "$Username" },
            Orderdate: { $first: "$Orderdate" },
            Deliveryaddress: { $first: "$Deliveryaddress" },
            Status: { $first: "$Status" },
            Totalamount: { $first: "$Totalamount" },
            Items: { $push: "$Items" }, // Reconstruct the items array with cancelled items
          },
        },
      ]);
      res.render("user/cancelledorders", { corders });
    } catch (error) {
      console.log("cancell Error ", error.message);
    }
  },
  updateStatus: async (req, res) => {
    try {
      await Orders.findByIdAndUpdate(req.params.orderid, {
        $set: { Status: req.params.status },
      });
      res.redirect("/admin/orders");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },
  deleteOrder: async (req, res) => {
    try {
      await Orders.findByIdAndDelete(req.params.orderid);
      res.redirect("/admin/orders");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },
  viewCancelledOrdersAdmin: async (req, res) => {
    try {
      const uid = req.query.uid;
      const corders = await Orders.aggregate([
        {
          $unwind: "$Items", // Split the array into separate documents for each item
        },
        {
          $match: {
            "Items.cancelled": true, // Filter only the items with cancelled set to true
          },
        },
        {
          $group: {
            _id: "$_id", // Group by order ID
            Userid: { $first: "$Userid" },
            Username: { $first: "$Username" },
            Orderdate: { $first: "$Orderdate" },
            Deliveryaddress: { $first: "$Deliveryaddress" },
            Status: { $first: "$Status" },
            Totalamount: { $first: "$Totalamount" },
            Items: { $push: "$Items" }, // Reconstruct the items array with cancelled items
          },
        },
      ]);
      res.render("admin/cancelledorders", { orders: corders });
    } catch (error) {
      console.log("cancell Error ", error.message);
    }
  },
};
