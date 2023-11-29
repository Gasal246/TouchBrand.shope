
const Razorpay = require('razorpay');
const Wallets = require('../public/models/walletmodel');
const wallet = require('./wallet');
const Orders = require('../public/models/ordermodel');
var instance = new Razorpay({
  key_id: 'rzp_test_gL0J7DIqai39TQ',
  key_secret: 'w384loH3yO6KUXL2Sp9q06FL',
});
instance.payments.all({
  from: '2023-08-01',
  to: '2023-08-20'
}).then((response) => {
  // handle success
}).catch((error) => {
  // handle error
})

module.exports = {
    generateRazorpay: async (oid, amount) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: amount*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: oid
              };
              instance.orders.create(options, function(err, order) {
                console.log("New Order : "+order);
                resolve(order);
              });
        })
    },
    verifyPayment: async (details)=>{
      return new Promise((resolve, reject) => {
        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256', 'w384loH3yO6KUXL2Sp9q06FL')
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
        hmac = hmac.digest('hex')
        if(hmac == details['payment[razorpay_signature]']){
          resolve({oid:details['order[receipt]'], tid:details['payment[razorpay_payment_id]']})
        }else{
          reject(error)
        }
      })
    },
    paybyWallet: async (uid, amount, oid)=>{
      return new Promise((resolve, reject) =>{
        Wallets.findOne({ Userid: uid }).then(async(data)=>{
          if(data.Balance >= amount){
            await wallet.transaction('debit', amount, data._id).then(async (udata)=>{
              await Orders.findByIdAndUpdate(oid, {$set:{Status: 'active'}})
              resolve(udata);
            })
          }else{
            reject("Insufficiant Balance in wallet ")
          }
        })
      })
    }
}