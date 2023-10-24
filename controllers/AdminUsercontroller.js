const Usercopy = require("../public/models/usermodel");
var AddressCopy = require("../public/models/addressmodel");
const usermodel = require("../public/models/usermodel");
const Admin = require("../public/models/adminmodel");

module.exports = {
  getAdmin: async(req, res)=>{
    try {
      res.redirect('/admin/dash')
    } catch (error) {
      const on = "On Get Admin";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  // ADMIN LOGIN CHECK
  adminLogin: async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.body.email , password: req.body.password });
      if(admin){
        res.cookie("admin", admin.email, { maxAge: 24*60*60*1000, httpOnly: true });
        res.redirect('/admin/dash')
      }
      res.render("admin/login", { error: "Invalid Credentials" });
    } catch (error) {
      const on = "On AdminLogin";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
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
    } catch (error) {
      const on = "On Delete user";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
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
        const on = "On Get Block user";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
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
      const on = "On Get Unblock user";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
  viewuser: async (req, res) => {
    try {
      let user = await usermodel.findById(req.params.uid)
      let address = await AddressCopy.findOne({Userid: req.params.uid})
      res.render('admin/viewuser', { user: user,  address: address })
    } catch (error) {
      const on = "On Get ViewUserr";
      const err = error.message;
      res.redirect("/admin/error?err=" + err + "&on=" + on);
    }
  },
};
