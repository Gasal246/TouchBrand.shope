module.exports = {
    checkAdmin: (req, res, next)=>{
        if(req.cookies.admin){
            next();
        }else{
            res.render("admin/login", { error: null });
        }
    }
}