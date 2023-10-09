const Usercopy = require("../public/models/usermodel");
const Admincopy = require("../public/models/adminmodel");
var AddressCopy = require("../public/models/addressmodel");
const usermodel = require("../public/models/usermodel");

module.exports = {
  // ADMIN LOGIN CHECK
  adminLogin: async (req, res) => {
    console.log();
    const admin = await Admincopy.find({
      email: req.body.email,
      password: req.body.password,
    });
    if (admin) {
      res.cookie("admin", req.body.email, { maxAge: 24*60*60*1000, httpOnly: true });
      return res.redirect("/admin/dash");
    } else {
      console.log(" ADMIN LOGIN ERROR : ", err);
      return res.render("admin/login", {
        error: "Entered credentials are wrong!!",
      });
    }
  },
  // GET USERS
  getUsers: async (req, res) => {
    const users = await Usercopy.find({});
    return res.render("admin/users", { users });
  },
  // DELETE USER
  deleteUser: async (req, res) => {
    const userId = req.params.uid;
    try {
      await Usercopy.findByIdAndRemove(userId);
      return res.redirect("/admin/users");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  },
  //   BLOCK AND UNBLOCK USER
  blockUser: async (req, res) => {
    try {
      await Usercopy.updateOne(
        { Email: req.params.email },
        { $set: { Blocked: true } }
        );
        res.redirect("/admin/users");
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    },
    unblockUser: async (req, res) => {
    try {
      await Usercopy.updateOne(
        { Email: req.params.email },
        { $set: { Blocked: false } }
      );
      res.redirect("/admin/users");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },
  viewuser: async (req, res) => {
    try {
      let user = await usermodel.findById(req.params.uid)
      let address = await AddressCopy.findOne({Userid: req.params.uid})
      res.render('admin/viewuser', { user: user,  address: address })
    } catch (error) {
      console.log(error.message);
    }
  },
};
