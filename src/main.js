const express = require("express");
const path = require("path");
const user = require("./model/user");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const product = require("./model/product");
const order = require("./model/order");
const coins = require("./model/coin");
const multer = require("multer");
const fs = require("fs");
const imgur = require("imgur");
const coin = require("./model/coin");
const app = express();
const port = 3000;

mongoose
  .connect("mongodb://localhost:27017/Assignment", {})
  .then(() => {
    console.log("Kết nối tới MongoDB thành công.");
  })
  .catch((err) => {
    console.error("Lỗi khi kết nối tới MongoDB: " + err);
  });

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/login", (req, res) => {
  res.render("Login.ejs");
});

app.get("/register", (req, res) => {
  res.render("Register.ejs");
});

app.get("/addproducts", (req, res) => {
  res.render("AddProducts.ejs");
});

app.get("/listproducts", async (req, res) => {
  try {
    const products = await product.find();
    res.json({ products });
  } catch (error) {
    console.error("Lỗi khi truy vấn sản phẩm:", error);
    res.status(500).send("Lỗi khi truy vấn sản phẩm");
  }
});
app.get("/api/listproducts", async (req, res) => {
  try {
    const products = await product.find();
    res.render("ListProducts", { products });
  } catch (error) {
    console.error("Lỗi khi truy vấn sản phẩm:", error);
    res.status(500).send("Lỗi khi truy vấn sản phẩm");
  }
});

app.get("/api/history", async (req, res) => {
  const orders = await order.find();
  res.json({ orders });
});

app.get("/api/usecoin", async (req, res) => {
  const useCoin = await coin.find();
  res.json({ useCoin });
});

app.get("/homeproducts", (req, res) => {
  res.render("HomeProducts.ejs");
});

app.get("/editproducts/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    // Retrieve the product information based on productId
    const productToEdit = await product.findById(productId);

    if (!productToEdit) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.render("EditProducts.ejs", { productToEdit });
  } catch (error) {
    console.error("Error retrieving product information:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving product information.",
    });
  }
});

// Xử lý yêu cầu HTTP POST tới đường dẫn "/editproducts/:productId"
app.post("/editproducts/:productId", async (req, res) => {
  // Lấy thông tin productId từ tham số của yêu cầu
  const productId = req.params.productId;
  // Lấy thông tin sản phẩm từ dữ liệu trong yêu cầu
  const {
    maSanPham,
    tenSanPham,
    giaSanPham,
    nhaSanXuat,
    anhMinhHoa,
    mauSac,
    loaiSanPham,
    maKhachHang,
    tenKhachHang,
  } = req.body;
  try {
    // Cập nhật thông tin sản phẩm trong cơ sở dữ liệu dựa trên productId
    await product.findByIdAndUpdate(productId, {
      maSanPham,
      tenSanPham,
      giaSanPham,
      nhaSanXuat,
      anhMinhHoa,
      mauSac,
      loaiSanPham,
      maKhachHang,
      tenKhachHang,
    });
    // Chuyển hướng người dùng đến trang "/listproducts" sau khi cập nhật thành công
    res.redirect("/listproducts");
  } catch (error) {
    // Nếu có lỗi, in thông báo lỗi ra console và chuyển hướng người dùng đến trang "/listproducts"
    console.error(error);
    res.redirect("/listproducts");
  }
});

// Xử lý yêu cầu HTTP POST tới đường dẫn "/register/user"
app.post("/register/user", async (req, res) => {
  // In ra nội dung của yêu cầu nhận được
  console.log(req.body);
  // Tạo một đối tượng người dùng mới từ dữ liệu trong yêu cầu
  const newUser = new user({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  try {
    // Lưu đối tượng người dùng mới vào cơ sở dữ liệu và đợi cho đến khi hoàn thành
    const result = await newUser.save();
    // Trả về kết quả thành công dưới dạng JSON
    res.json(result);
  } catch (error) {
    // Nếu có lỗi trong quá trình lưu trữ
    console.error("Lỗi khi đăng ký người dùng:", error);
    // Trả về phản hồi lỗi với mã trạng thái 500 và thông báo lỗi
    res.status(500).json({ error: "Đã xảy ra lỗi khi đăng ký người dùng." });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email in the database
    const existingUser = await user.findOne({ email });

    // Check if the user exists and the password is correct
    if (existingUser && existingUser.password === password) {
      // Redirect to the new page upon successful login
      res.redirect("/homeproducts"); // Replace "/dashboard" with the route you want to redirect to
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi đăng nhập." });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = function (req, file, cb) {
  // Check if the file is an image
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."), false);
  }
  // Continue with validation
  cb(null, true);
};

const limits = {
  fileSize: 1024 * 1024 * 2, // 2 MB
  files: 2, // Allow up to 2 files
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

app.post(
  "/addproducts/product",
  upload.array("anhMinhHoa", 2), // Use upload.array for multiple files
  async (req, res) => {
    try {
      // If files were uploaded, proceed with the logic
      if (req.files && req.files.length > 0) {
        const imgurUploadPromises = req.files.map(async (file) => {
          const filePath = file.path;
          // Upload each file to Imgur
          const imgurUpload = await imgur.uploadFile(filePath);
          // Remove the local file
          fs.unlinkSync(filePath);
          return imgurUpload;
        });

        // Wait for all uploads to complete
        const imgurUploads = await Promise.all(imgurUploadPromises);

        // Update the product with Imgur links
        const newProduct = new product({
          maSanPham: req.body.maSanPham,
          tenSanPham: req.body.tenSanPham,
          giaSanPham: req.body.giaSanPham,
          nhaSanXuat: req.body.nhaSanXuat,
          anhMinhHoa: imgurUploads.map((upload) => upload.link),
          mauSac: req.body.mauSac,
          loaiSanPham: req.body.loaiSanPham,
          maKhachHang: req.body.maKhachHang,
          tenKhachHang: req.body.coin,
        });

        // Save the product to the database
        const result = await newProduct.save();

        // Redirect to the list of products
        res.redirect("/api/listproducts");
      } else {
        // Handle the case when no files are uploaded
        res.status(400).send("No files were uploaded.");
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi khi thêm sản phẩm." });
    }
  }
);

app.post("/api/orders", async (req, res) => {
  const { productId, quantity, totalPrice, image, productName } = req.body;
  const newOrder = new order({
    productId,
    quantity,
    totalPrice,
    image,
    productName,
  });
  const result = await newOrder.save();
  const products = await product.findById(productId);
  if (products) {
    products.maKhachHang -= quantity;
    await products.save();
  }
  res.json(result);
});

app.post("/api/coin", async (req, res) => {
  const { coin } = req.body;
  const newCoin = new coins({
    coin,
  });
  const result = await newCoin.save();
  res.json(result);
});

app.delete("/deleteproduct/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    const result = await product.deleteOne({ _id: productId });

    if (result.deletedCount === 1) {
      res.json({ success: true, message: "Xoá sản phẩm thành công." });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm." });
    }
  } catch (error) {
    console.error("Lỗi khi xoá sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi khi xoá sản phẩm." });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
