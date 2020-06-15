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
    let post = await Post.findSingleById(req.params.id, req.visitorId); //URL parametresi olarak :id demiştik. Ve new yapmadık, fonksiyon uydurduk.
    console.log(post);
    res.render("single-post-screen", { post: post });
  } catch (error) {
    //eğer ki URL parametresi tamamen alakasız bir şey gelirse buraya düşer
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id);
    res.render("edit-post", { post: post });
  } catch {
    res.render("404");
  }
};

exports.edit = function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .update()
    .then((status) => {
      //update succesfully
      //or validation errors(blank title etc.)
      if (status == "success") {
        //post updated in db
        req.flash("success", "Post is updated succesfully")
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`); //template literal
        });
      } else {
        post.errors.forEach(function (error) {
          req.flash("errors", error);
        });
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`); //template literal
        });
      }
    })
    .catch(() => {
      //a post with the requested id doesn't exits
      //or if the current visitor is not the owner of the requested post
      req.flash("errors", "You do not have permission for that action");
      req.session.save(function () {
        res.redirect("/");
      });
    });
};
