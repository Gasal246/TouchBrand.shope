module.exports = {
    generateCouponCode:()=>{
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let couponCode = '';
        for (let i = 0; i < 8; i++) {
          couponCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return couponCode;
      }
      
}