const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  productId: String,
  quantity: String,
  totalPrice: String,
  image: [String],
  productName: String,
});
const order = mongoose.model("orders", orderSchema);
module.exports = order;
