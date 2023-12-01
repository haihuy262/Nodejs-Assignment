const mongoose = require("mongoose");
const { format } = require("date-fns");
const orderSchema = new mongoose.Schema({
  productId: String,
  quantity: String,
  totalPrice: String,
  image: [String],
  productName: String,
  purchaseDate: {
    type: String,
    default: getDateString,
  },
  purchaseTime: {
    type: String,
    default: getTimeString,
  },
});
function getTimeString() {
  const now = new Date();
  return format(now, "HH:mm:ss");
}
function getDateString() {
  const now = new Date();
  return format(now, "dd/MM/yyyy");
}
const order = mongoose.model("orders", orderSchema);
module.exports = order;
