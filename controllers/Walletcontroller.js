const wallet = require("../helpers/wallet");
const Wallets = require("../public/models/walletmodel");

module.exports = {
  getWallet: async (req, res) => {
    try {
      const wallet = await Wallets.findOne({ Userid: req.query.uid })
      // Arranging the Transactions in most recent first order
      if (wallet && wallet.Transactions) {
        wallet.Transactions.sort((a, b) => b.Transdate - a.Transdate);
      }
      res.render("user/wallet", { wallet });
    } catch (error) {
      const on = "On getting wallet";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
  addToWallet: async (req, res, next) => {
    try {
      const type = req.body.type || null;
      const money = req.body.amount || 0;
      const status = 'credit'
      const walletid = await Wallets.findOne({ Userid: req.cookies.user.id }).then(async(data) => {
          if(data){
              return data._id
          }else{
              const newWallet = new Wallets({
                  Userid: req.cookies.user.id,
                  Balance: 0,
              })
              const wallet = await newWallet.save();
              return wallet._id
          }
      })
      if(type === 'direct'){
          await wallet.transaction(status, money, walletid).then((response) => {
              res.json(response)
          })
      }
    } catch (error) {
      const on = "On adding money to wallet";
      const err = error.message;
      res.redirect("/error?err=" + err + "&on=" + on);
    }
  },
};
