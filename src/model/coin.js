const mongoose = require("mongoose");
const coinSchema = new mongoose.Schema({
  coin: String,
});
const coin = mongoose.model("coins", coinSchema);
module.exports = coin;
