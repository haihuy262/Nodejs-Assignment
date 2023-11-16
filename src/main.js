const express = require("express");
const path = require("path");
const user = require("./model/user");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const product = require("./model/product");
const multer = require("multer");
const fs = require("fs");
const imgur = require("imgur");
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
    res.render("ListProducts.ejs", { products });
  } catch (error) {
    console.error("Lỗi khi truy vấn sản phẩm:", error);
    res.status(500).send("Lỗi khi truy vấn sản phẩm");
  }
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

app.post("/editproducts/:productId", async (req, res) => {
  const productId = req.params.productId;
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
    res.redirect("/listproducts");
  } catch (error) {
    console.error(error);
    res.redirect("/listproducts");
  }
});

app.post("/register/user", async (req, res) => {
  console.log(req.body);
  const newUser = new user({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  try {
    const result = await newUser.save();
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng:", error);
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
    cb(null, "D:\\Server Android\\Nodejs-Assignment\\uploads");
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
          tenKhachHang: req.body.tenKhachHang,
        });

        // Save the product to the database
        const result = await newProduct.save();

        // Redirect to the list of products
        res.redirect("/listproducts");
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
