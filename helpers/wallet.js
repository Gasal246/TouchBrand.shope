const Wallets = require("../public/models/walletmodel");

module.exports = {
  transaction: async (type, amount, wid) => {
    return new Promise(async (resolve, reject) => {
      const wallet = await Wallets.findById(wid);
      const money = parseInt(amount, 10);
      let transactions = wallet.Transactions || [];
      let balance = wallet.Balance;
      if (type === "credit") {
        const transaction = {
          Amount: money,
          Transdate: Date.now(),
          Status: "credit"
        };
        transactions.push(transaction);
        balance = wallet.Balance + money;
      } else {
        const transaction = {
          Amount: money,
          Transdate: Date.now(),
          Status: "debit"
        };
        transactions.push(transaction);
        balance = wallet.Balance - money;
      }
      const data = {
        Balance: balance,
        Transactions: transactions
      }
      const updatedData = await Wallets.findByIdAndUpdate(wid, { $set:data })
      resolve(updatedData)
    });
  }
};
