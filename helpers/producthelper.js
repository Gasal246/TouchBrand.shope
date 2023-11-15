const Products = require("../public/models/productmodel");

module.exports = {
  higherstDiscountProduct: async () => {
    return new Promise(async (resolve, reject) => {
      const products = await Products.find({});
      let maxDiscountProduct = null;
      let maxDiscountPercentage = 0;

      products.forEach(async (product) => {
        const discountPercentage = (product.Discount / product.Price) * 100;

        // Check if this product has a higher discount than the current maximum
        if (discountPercentage > maxDiscountPercentage) {
          maxDiscountPercentage = discountPercentage;
          maxDiscountProduct = product;
        }
      });

      if (maxDiscountProduct) {
        resolve({
            product: maxDiscountProduct,
            value: maxDiscountPercentage
        })
      }
    });
  }
};
