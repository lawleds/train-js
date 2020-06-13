const express = require("express");
//require iki şey yapar
//	1)it executes said file
//	2)it returnes w/e file exports ve eşitlediğimiz değerde tutar
const router = express.Router();
const userController = require("./controllers/userController.js");
const postController = require("./controllers/postController.js");

//user routes
router.get("/", userController.home);

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

//post routes
router.get("/create-post", userController.mustBeLoggedIn, postController.viewCreateScreen);//checking if user logged in

router.get("/*", function (req, res) {
  res.send("Böyle bir şey yok.");
});

module.exports = router;
