const express = require("express");
const app = express();

const router = require("./router.js");

app.use(express.static("public"));
app.set("views", "views"); //first argument is express option, second one is folder name
app.set("view engine", "ejs");

app.use("/", router);//No need to look for anything else. Use router.js for everything else.

app.listen(3000);
