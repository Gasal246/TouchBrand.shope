const Orders = require("../public/models/ordermodel");
const Sales = require("../public/models/salesmodel");

module.exports = {
    recheckOrder: (oid, sid)=>{
        return new Promise(async (resolve, reject)=>{
            const order = await Orders.findById(oid)
            if(order.Status == 'pending'){
                await Orders.findByIdAndRemove(oid);
                await Sales.findByIdAndRemove(sid);
                resolve({status: true})
            }else{
                resolve({status: false})
            }
        })
    }
}