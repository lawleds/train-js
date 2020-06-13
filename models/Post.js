const postsCollection = require("../db").db().collection("posts");
const ObjectID = require('mongodb').ObjectID

//construction function
let Post = function (data, userid) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
  console.log("burası constructor:" + this.data.title);
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") this.data.title = "";
  if (typeof this.data.body != "string") this.data.body = "";

  //get rid of any bogus properties
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectID(this.userid)
  }; //bunun sayesinde eğer clienttan başka şeyler gelmişse onları görmicez vs.
};

Post.prototype.validate = function () {
  if (this.data.title == "") this.errors.push("Provide a title.");
  if (this.data.body == "") this.errors.push("Provide a post content.");
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    console.log(this.data);

    this.cleanUp();
    this.validate();

    if (!this.errors.length) {
      //save post into db
      postsCollection
        .insertOne(this.data)
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.errors.push("Please try again later.");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

module.exports = Post;
