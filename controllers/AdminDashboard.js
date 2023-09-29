module.exports = {
  getDashboard: async (req, res) => {
    if (req.cookies.admin) {
      res.render("admin/dashboard");
    } else {
      res.render("admin/login", { error: "Entered credentials are wrong!!" });
    }
  },
};
