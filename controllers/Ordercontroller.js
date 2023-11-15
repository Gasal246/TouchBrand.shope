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
const Sales = require("../public/models/salesmodel");
const Wallets = require("../public/models/walletmodel");
const orderhelper = require("../helpers/orderhelper");
const wallethelper = require("../helpers/wallet");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

module.exports = {
  getOrders: async (req, res, next) => {
    try {
      const orders = await Orders.aggregate([
        {
          $unwind: "$Items" // Split the array into separate documents for each item
        },
        {
          $match: {
            "Items.cancelled": false // Filter only the items with cancelled set to false
          }
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
            Items: { $push: "$Items" } // Reconstruct the items array with cancelled items
          }
        }
      ]).sort({ Orderdate: -1 });
      const cancelled = await Orders.aggregate([
        {
          $unwind: "$Items" // Split the array into separate documents for each item
        },
        {
          $match: {
            "Items.cancelled": true // Filter only the items with cancelled set to true
          }
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
            Items: { $push: "$Items" } // Reconstruct the items array with cancelled items
          }
        }
      ]);
      res.render("admin/orders", { orders: orders, ccount: cancelled.length });
    } catch (error) {
      const on = "On Getting Order data";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
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
      ]);
      console.log(order);
      res.render("admin/vieworder", { order: order });
    } catch (error) {
      const on = "On View Order";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
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
            Shippingcost: productDetails.Shipingcost
          }
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
            Price: product.Price - product.Discount,
            Quantity: req.body.quantity[index],
            Productimg: req.body.pimage[index],
            Shippingcost: product.Shipingcost
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
        landmark: req.body.streetaddress1[1]
      };

      const totalAmount = req.body.totalAmount;

      const orderData = {
        Userid: userId,
        Username: user.Username,
        Items: orderItems,
        Deliveryaddress: deliveryAddress,
        Totalamount: totalAmount,
        Orderdate: new Date()
      };

      const order = await Orders.create(orderData);

      const newSale = new Sales({
        Date: new Date(),
        Userid: userId,
        Orderid: order._id,
        Amount: totalAmount,
        Products: orderItems.map((product) => {
          return product.Productid;
        }),
        Payby: req.body.payby,
        Payment: false
      });

      // UPDATING THE STOKE AFTER SAVING THE ORDER
      for (const item of orderItems) {
        const product = await Products.findById(item.Productid);
        if (!product) {
          const on = "On Saving Order";
          const err = "Product not Found for id " + item.Productid;
          res.redirect("/error?err=" + err + "&on=" + on);
        }
        // Calculate the new stock after the order
        const newStock = product.Stoke - item.Quantity;
        if (newStock < 0) {
          const on = "On Saving Order";
          const err =
            "Not enough stock for the product: " + product.Productname;
          res.redirect("/error?err=" + err + "&on=" + on);
        }
        // Update the stock in the database
        product.Stoke = newStock;
        await product.save();
      }

      // CLEAR THE CART AFTER ODERING FROM CART
      if (isCart == true) {
        await Carts.findOneAndRemove({ Userid: userId });
      }

      // CHECK THE PAYMENT CRITERIA
      const payby = req.body.payby;
      if (payby == "cod") {
        await newSale.save();
        res.json({ codsuccess: true });
      } else if (payby == "wallet") {
        newSale.Payment = true;
        const sale = await newSale.save();
        paymentHelper
          .paybyWallet(userId, totalAmount, order._id)
          .then(async (data) => {
            await orderhelper.recheckOrder(order._id, sale._id);
            res.json({ walletpay: "success" });
          })
          .catch(async (error) => {
            await orderhelper.recheckOrder(order._id, sale._id);
            res.json({ walletpay: "failed" });
          });
      } else {
        paymentHelper
          .generateRazorpay(order._id, totalAmount)
          .then(async (response) => {
            newSale.Payment = true;
            const sale = await newSale.save();
            res.json(response);
          });
      }
    } catch (error) {
      const on = "On Saving Order";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
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
      const on = "On Remove Item Order";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
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
      }else{
        // Save the updated order
        await order.save();
      }
      
      const productId = order.Items[index].Productid
      await Products.findByIdAndUpdate(productId, {$inc:{Stoke: 1}})

      next();
    } catch (error) {
      const on = "On Cancel Order";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
  viewOrderUser: async (req, res) => {
    try {
      const orderId = req.query.id;
      const order = await Orders.findById(orderId);
      res.render("user/vieworder", { order });
    } catch (error) {
      const on = "On View Order";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
  viewCancelledOrders: async (req, res) => {
    try {
      const uid = req.cookies.user.id;
      const theOrders = await Orders.find({Userid: req.cookies.user.id}).populate('Items.Productid').sort({ Orderdate: -1 });
      const corders = theOrders.map(order => {
        order.Items = order.Items.filter(item => item.cancelled);
        return order;
      });
      res.render("user/cancelledorders", { corders });
    } catch (error) {
      const on = "On View Cancelled Orders";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
  updateStatus: async (req, res) => {
    try {
      const oid = req.body.orderid;
      const status = req.body.status;
      if (status == "delivered") {
        await Sales.updateOne({ Orderid: oid }, { $set: { Payment: true } });
        await Orders.findByIdAndUpdate(oid, {
          $set: { Deliverydate: new Date() }
        });
      }
      await Orders.findByIdAndUpdate(oid, {
        $set: { Status: status }
      });
      res.json({ status: true, message: "Status updated" });
    } catch (error) {
      const on = "On Update Order Status";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  deleteOrder: async (req, res) => {
    try {
      const oid = req.params.orderid;
      await Orders.findByIdAndDelete(oid);
      await Sales.findOneAndDelete({ Orderid: oid });
      res.redirect("/admin/orders");
    } catch (error) {
      const on = "On Delete Order";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  viewCancelledOrdersAdmin: async (req, res) => {
    try {
      const uid = req.query.uid;
      const corders = await Orders.aggregate([
        {
          $unwind: "$Items" // Split the array into separate documents for each item
        },
        {
          $match: {
            "Items.cancelled": true // Filter only the items with cancelled set to true
          }
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
            Items: { $push: "$Items" } // Reconstruct the items array with cancelled items
          }
        }
      ]);
      res.render("admin/cancelledorders", { orders: corders });
    } catch (error) {
      const on = "On View Cancelled Order";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  returnItem: async (req, res, next) => {
    try {
      const orderId = req.body.oid;
      const itemId = req.body.pid;
      const order = await Orders.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Find the index of the item to remove
      const itemIndex = order.Items.findIndex(
        (item) => item._id == itemId
      );
      if (itemIndex === -1) {
        throw new Error("Item not found in the order");
      }

      // Create a new order with the removed item
      const returnedItem = order.Items[itemIndex];
      order.Items.splice(itemIndex, 1);
      order.Totalamount -= returnedItem.Price * returnedItem.Quantity;

      const payback = returnedItem.Price * returnedItem.Quantity

      const newOrder = new Orders({
        Userid: order.Userid,
        Username: order.Username,
        Items: [returnedItem], // Create a new order with the removed item
        Orderdate: new Date(),
        Status: "returned",
        Totalamount: payback
      });
      // Save the new order Status == 'returned'
      await newOrder.save();
      
      if(order.Items.length < 1){
        await Orders.findByIdAndRemove(orderId)
      }else{
        // Update the original order
        await order.save();
      }

      // update sales
      // const sale = await Sales.findOne({ Orderid: orderId });
      // const saleItemIndex = sale.Products.findIndex(
      //   (item) => item == returnedItem.Productid
      // );
      // sale.Products.splice(saleItemIndex, 1);
      // sale.Amount -= payback
      // await sale.save()

      const theWallet = await Wallets.findOne({ Userid: req.cookies.user.id })
      console.log(theWallet);
      await wallethelper.transaction('credit', payback, theWallet._id)
      res.json({status: true})
    } catch (error) {
      const on = "On Return Order";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  }
};
