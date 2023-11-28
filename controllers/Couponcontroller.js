const couponhelper = require("../helpers/couponhelper");
const Coupons = require("../public/models/couponmodel");

module.exports = {
  getCoupan: async (req, res) => {
    try {
      const coupons = await Coupons.find({});
      console.log(coupons);
      res.render("admin/coupons", { coupons });
    } catch (error) {
      const on = "On getting coupan admin page";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  addCoupons: async (req, res) => {
    try {
        const number = req.body.num;
        const discount = req.body.discount;

        const couponsToAdd = [];

        for (let i = 0; i < number; i++) {
          const couponCode = couponhelper.generateCouponCode();
          const coupon = new Coupons({
            Code: couponCode,
            Basedon: req.body.based,
            Discount: discount,
            Status: 'active',
            Addon: new Date(),
            Expiry: req.body.expiry
          });
          couponsToAdd.push(coupon);
        }

        const savedCoupons = await Coupons.insertMany(couponsToAdd);
        res.json(savedCoupons)
    } catch (error) {
      const on = "On adding coupon";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  deleteCoupon: async (req, res) => {
    try {
      const cid = req.body.cid;
      const removed = await Coupons.findByIdAndRemove(cid);
      res.json(removed)
    } catch (error) {
      const on = "On deleting coupon";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  getUserCoupan: async (req, res) => {
    try {
      const ownedCoupons = await Coupons.aggregate([
        {
          $match: {
            Status: 'active' // Filter coupons with Status 'active'
          }
        },
        {
          $sort: { Discount: 1 } // Sort by Discount value in ascending order
        },
        {
          $group: {
            _id: '$Discount',
            coupons: { $push: '$$ROOT' }
          }
        },
        {
          $project: {
            _id: 1,
            coupons: {
              $slice: ['$coupons', 0, 3] // Limit each group to 1-3 items
            }
          }
        },
        {
          $unwind: '$coupons'
        }
      ])
      console.log(ownedCoupons);
      res.render('user/coupons', { oc: ownedCoupons })
    } catch (error) {
      const on = "On getting user side coupon page";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  }
};
