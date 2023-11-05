const Products = require("../public/models/productmodel");

module.exports = {
    resultLoader: async (req, res) => {
        try {
            const ITEMS_PER_PAGE = 8
            const term = req.query.term;
            const page = +req.query.page || 1; // Get the page from the query parameters, default to page 1
        
            const regex = new RegExp(term, 'i');
            const totalItems = await Products.countDocuments({
              $or: [{ Productname: regex }, { Category: regex }],
            });
            const results = await Products.find({
              $or: [{ Productname: regex }, { Category: regex }],
            })
              .skip((page - 1) * ITEMS_PER_PAGE)
              .limit(ITEMS_PER_PAGE);
        
            res.render('user/result', {
              results,
              totalItems,
              searchTerm: term,
              currentPage: page,
              totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
          } catch (error) {
            const on = "On Search Processing...";
            const err = error.message;
            res.redirect("/error?err=" + err + "&on=" + on);
          }
    }
}