const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  maSanPham: String,
  tenSanPham: String,
  giaSanPham: String,
  nhaSanXuat: String,
  anhMinhHoa: [String],
  mauSac: String,
  loaiSanPham: String,
  maKhachHang: String,
  tenKhachHang: String,
});
const product = mongoose.model("products", UserSchema);
module.exports = product;
