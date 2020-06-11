const express = require("express");
const app = express();

app.use(express.static("public"));
app.set("views", "views"); //first argument is express option, second one is folder name
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("home-guest");
});

app.listen(3000);
