const Products = require("../public/models/productmodel")
const Sales = require("../public/models/salesmodel")

module.exports = {
    getDailySales: (date) => {
        return new Promise((resolve, reject) => {
            const theDate = new Date(date)
            const start = new Date(theDate)
            start.setHours(0,0,0,0) // begining of a day
            const end = new Date(theDate)
            end.setHours(23, 59, 59, 999) // end of a day
            Sales.find({ Date:{ $gte: start, $lte: end}, Payment: true}).then((sales)=>{
                resolve(sales)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getWeeklySales: (date) => {
        return new Promise((resolve, reject) => {
            const theDate = new Date(date);
            const start = new Date(theDate);
            const end = new Date(theDate);
            start.setDate(theDate.getDate() - theDate.getDay()); // Start of the current week (Sunday)
            start.setHours(0, 0, 0, 0);
            end.setDate(start.getDate() + 7); // End of the current week (next Sunday)
            end.setHours(23, 59, 59, 999);
    
            Sales.find({ Date: { $gte: start, $lte: end }, Payment: true }).then((sales) => {
                resolve(sales);
            }).catch((err) => {
                reject(err);
            });
        });
    },
    getMonthlySales: (date)=>{
        return new Promise((resolve, reject) => {
            const theDate = new Date(date);
            const year = theDate.getFullYear();
            const month = theDate.getMonth(); // Get the month (0 - 11)
            const start = new Date(year, month, 1, 0, 0, 0, 0); // Start of the month
            const end = new Date(year, month + 1, 1, 0, 0, 0, 0); // Start of the next month
    
            Sales.find({ Date: { $gte: start, $lt: end }, Payment: true }).then((sales) => {
                resolve(sales);
            }).catch((err) => {
                reject(err);
            });
        });
    },
    getYearlySales: (date) => {
        return new Promise((resolve, reject) => {
            const theDate = new Date(date);
            const year = theDate.getFullYear(); // Extract the year from the date
            const start = new Date(`${year}-01-01T00:00:00.000Z`); // Start of the year
            const end = new Date(`${year + 1}-01-01T00:00:00.000Z`); // Start of the next year
    
            Sales.find({ Date: { $gte: start, $lt: end }, Payment: true }).then((sales) => {
                resolve(sales);
            }).catch((err) => {
                reject(err);
            });
        });
    },
    updateStoke: (pid, value)=>{
        return new Promise(async (resolve, reject) => {
            
        })
    }
}