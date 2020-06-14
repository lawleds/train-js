const Post = require("../models/Post.js");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post");
};

exports.create = function (req, res) {
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(function () {
      res.send("New post created.");
    })
    .catch(function (errors) {
      res.send(errors);
    });
};

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id); //URL parametresi olarak :id demiştik. Ve new yapmadık, fonksiyon uydurduk.
    res.render("single-post-screen", { post: post });
  } catch (error) {
    //eğer ki URL parametresi tamamen alakasız bir şey gelirse buraya düşer
    res.render("404");  
  }
};
