const express = require("express");
const path = require("path");
const user = require("./model/user");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

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

app.get("/listproducts", (req, res) => {
  res.render("ListProducts.ejs");
});

app.get("/homeproducts", (req, res) => {
  res.render("HomeProducts.ejs");
});

app.get("/editproducts", (req, res) => {
  res.render("EditProducts.ejs");
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
  const email = req.body.email;
  const password = req.body.password;

  const users = await user.findOne({ email: email, password: password });

  if (users) {
    res.send("Đăng nhập thành công");
  } else {
    res.status(400).json({ message: "Wrong account or password" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
