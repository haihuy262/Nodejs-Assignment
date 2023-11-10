const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

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

app.get("/editproducts", (req, res) => {
  res.render("EditProducts.ejs");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
