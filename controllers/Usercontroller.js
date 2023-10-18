const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
var Usercopy = require("../public/models/usermodel");
var AddressCopy = require("../public/models/addressmodel");
var nodemailer = require("nodemailer");
const Orders = require("../public/models/ordermodel");

// Set up nodemailer transporter (configure with your email service)
var transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "gasalgasal246@gmail.com",
    pass: "szglvviqkkjbywad",
  },
});

module.exports = {
  registerUser: async (req, res) => {
    if (req.body.checkbox == "on") {
      try {
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        Usercopy.findOne({ Email: req.body.email.trim() }).then(async (data) => {
          if (data) {
            console.log("User already registered bro");
            res.render("user/index", {
              error: { form: "User already registered.. Login Here." },
              cdata: null,
            });
          } else {
            const bpassword = await bcrypt.hash(req.body.password.trim(), 10);
            const user = new Usercopy({
              Email: req.body.email.trim(),
              Username: req.body.uname,
              Password: bpassword,
              Phone: req.body.phone,
              Addedon: Date.now(),
              verifycode: verificationCode,
            });
            user
              .save()
              .then((data) => {
                console.log("saved to db" + data);
                const cdata = {
                  id: data._id,
                  name: data.Username,
                  email: data.Email,
                  phone: data.Phone,
                };
                res.cookie("user", cdata, { maxAge: 24*60*60*1000, httpOnly: true });
                const mailOptions = {
                  from: "gasalgasal246@gmail.com",
                  to: data.Email,
                  subject: "Account Verification",
                  text: `Your verification code is: ${verificationCode}`,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log("Error sending email: " + error);
                  } else {
                    console.log("Email sent: " + info.response);
                  }
                });
                res.redirect("/verify");
              })
              .catch((err) => {
                console.log("ERROR ON SAVING DATA " + err);
              });
          }
        });
      } catch (e) {
        console.log("FAIL TO EXECUTE YOUR ROUTE: " + e);
      }
    }
  },
  verifyUser: async (req, res) => {
    const verificationCode = req.body.vcode;
    const userEmail = req.cookies.user.email;

    // Check if verification code matches
    const user = await Usercopy.findOne({
      Email: userEmail,
      verifycode: verificationCode,
    });

    if (user) {
      await Usercopy.updateOne(
        { Email: userEmail },
        { $set: { verify: true } }
      );
      res.redirect("/");
    } else {
      res.render("user/verify", {
        error: "Invalid verification code. Please try again.",
        cookies: req.cookies.user,
      });
    }
  },
  resendVerification: async (req, res) => {
    const userEmail = req.params.email;
    // Generate a new verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000);
    // Update user's verification code in the database
    await Usercopy.updateOne(
      { Email: userEmail },
      { $set: { verifycode: newVerificationCode } }
    );
    // Send verification email with the new code
    const mailOptions = {
      from: "gasalgasal246@gmail.com",
      to: userEmail,
      subject: "New Verification Code",
      text: `Your new verification code is: ${newVerificationCode}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email: " + error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.redirect("/verify");
  },
  userLogin: async (req, res) => {
    try {
      Usercopy.findOne({ Email: req.body.email.trim() }).then(async (data) => {
        if (data && (await bcrypt.compare(req.body.password.trim(), data.Password))) {
          if(data.Blocked == true){
            const err = "~ THE SPECIFIED ACCOUND IS BLOCKED BY ADMIN!"
            return res.redirect(`/?err=${err}`)
          }
          const cdata = {
            id: data._id,
            name: data.Username,
            email: data.Email,
            phone: data.Phone,
          };
          res.cookie("user", cdata, { maxAge: 24*60*60*1000, httpOnly: true });
          res.redirect("/");
        } else {
          const err = "~ gmail and password not valid!"
          res.redirect(`/?err=${err}`)
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  getUser: async (req, res) => {
    if (req.cookies.user) {
      try {
        const cancelledOrders = await Orders.find({
          Userid: req.cookies.user.id,
          "Items.cancelled": true
        }).sort({ Orderdate: -1 });
  
        const activeOrders = await Orders.aggregate([
          {
            $match: {
              Userid: new mongoose.Types.ObjectId(req.cookies.user.id)  // Convert the user ID to ObjectId type
            }
          },
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
  
        const address = await AddressCopy.findOne({
          Userid: req.cookies.user.id,
        });
  
        const userdata = await Usercopy.findOne({
          Email: req.cookies.user.email,
        }).then((data) => {
          return {
            name: data.Username,
            phone: data.Phone,
            email: data.Email,
            gender: data.Gender,
            dob: data.Dob,
          };
        });
  
        res.render("user/account", {
          cookies: userdata,
          address: address,
          error: req.query.error ? req.query.error : null,
          cancelledOrders: cancelledOrders,
          activeOrders: activeOrders
        });
      } catch (error) {
        res.status(500).json(error.message);
      }
    } else {
      res.render("user/account", {
        cookies: null,
        address: null,
        error: null,
        order: null
      });
    }
  },
  
  primaryAdrress: async (req, res) => {
    const userid = req.cookies.user.id;
    const data = await AddressCopy.findOne({ Userid: userid });
    const addressData = {
      Userid: userid,
      Firstaddress: {
        Cname: req.body.cname,
        City: req.body.city,
        Country: req.body.country,
        Landmark: req.body.landmark,
        Pincode: req.body.pincode,
        Place: req.body.place,
      },
    };
    if (data) {
      await AddressCopy.updateOne({ Userid: userid }, { $set: addressData });
      res.redirect("/account");
    } else {
      const newAddress = new AddressCopy(addressData);
      await newAddress.save();
      res.redirect("/account");
    }
  },
  secondaryAdress: async (req, res) => {
    const userid = req.cookies.user.id;
    const data = await AddressCopy.findOne({ Userid: userid });
    const addressData = {
      Userid: userid,
      Secondaddress: {
        Cname: req.body.cname,
        City: req.body.city,
        Country: req.body.country,
        Landmark: req.body.landmark,
        Pincode: req.body.pincode,
        Place: req.body.place,
      },
    };
    if (data) {
      await AddressCopy.updateOne({ Userid: userid }, { $set: addressData });
      res.redirect("/account");
    } else {
      const newAddress = new AddressCopy(addressData);
      await newAddress.save();
      res.redirect("/account");
    }
  },
  editProfile: async (req, res, next) => {
    try {
      const user = await Usercopy.findOne({ Email: req.cookies.user.email });
      if (user) {
        if (req.body.currentpass) {
          if (await bcrypt.compare(req.body.currentpass, user.Password)) {
            if (req.body.newpass) {
              const newPass = await bcrypt.hash(req.body.newpass, 10);
              user.Password = newPass;
            }
          } else {
            const err = "Your entered current password is incorrect, ";
            return res.redirect(`/account?error=${err}`);
          }
        }

        await bcrypt.compare(req.body.currentpass, user.Password);

        user.Username = req.body.name;
        user.Email = req.body.email;
        user.Gender = req.body.gender;
        user.Dob = req.body.dob;
        user.Phone = req.body.phone;
        await user.save();
        return res.redirect("/account");
      } else {
        return res.status(404).send("User not found.");
      }
    } catch (error) {
      console.error("Error updating user information:", error);
      res
        .status(500)
        .send("An error occurred while updating user information.");
    }
  },
};
