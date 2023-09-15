var express = require("express");
var router = express.Router();
var Usercopy = require("../public/models/usermodel")
var bcrypt = require('bcrypt')

/* GET home page. */
router.get("/", function (req, res, next) {
  if(req.cookies.user){
    res.render("user/index", {cdata: req.cookies.user});
  }else{
    res.render("user/index");
  }
});
router.get("/registernow", (req, res) => {
  res.render('user/register')
});

router.post('/registeruser', (req, res) => {
  if(req.body.checkbox == 'on'){
    try{
      Usercopy.findOne({Email: req.body.email}).then(async (data)=>{
        if(data){
          console.log('User already registered bro');
        }else{
          const bpassword = await bcrypt.hash(req.body.password, 10)
          const user = new Usercopy({
            Email: req.body.email,
            Username: req.body.uname,
            Password: bpassword,
            Phone: req.body.phone,
            Addedon: Date.now()
          })
          user.save().then((data) => {
            console.log("saved to db"+data)
            const cdata = {
              name: data.Username,
              email: data.Email,
              phone: data.Phone
            }
            res.cookie('user', cdata, {maxAge: 3600000, httpOnly: true})
            res.redirect('/')
          })
          .catch((err) => {
            console.log("ERROR ON SAVING DATA "+err);
          })
        }
      })
    }catch(e){
      console.log("FAIL TO EXECUTE YOUR ROUTE: "+e);
    }
  }
})



module.exports = router;
