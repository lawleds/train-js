const postsCollection = require("../db").db().collection("posts");
const ObjectID = require("mongodb").ObjectID;
const User = require("./User");

//construction function
let Post = function (data, userid) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") this.data.title = "";
  if (typeof this.data.body != "string") this.data.body = "";

  //get rid of any bogus properties
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectID(this.userid),
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

Post.reusablePostQuery = function (uniqueOperations, visitorId) {
  return new Promise(async function (resolve, reject) {
    //concat returns new array, joins them.
    let aggOperations = uniqueOperations.concat([
      {
        $lookup: {
          //looking up documents from another collection
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDocument",
        },
      },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          authodId: "$author", //mongodb'de eğer $ koyarsan, bu öylesine değil, fieldın adı.
          author: { $arrayElemAt: ["$authorDocument", 0] }, //authorDocument array'inin ilk elementini döndürüyor
          //(yani bilgiler olan ilk objesi)
        },
      },
    ]);
    //let post = await postsCollection.findOne({ _id: new ObjectID(id) }) aggregate is great when performing multiple operations
    let posts = await postsCollection.aggregate(aggOperations).toArray(); //returns data makes sense for mongodb, not for JS so .toArray()

    //clean up author property in each post obj.
    posts = posts.map(function (post) {
      post.isVisitorOwner = post.authodId.equals(visitorId);
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true), //sonuna bir .avatar gelmeliydi
      };
      return post;
    });
    resolve(posts);
  });
};

//In JS, function is an object, so we can add properties or function to a function.(Post is a function beginning of the page)
//OOP approach gerekli değil burada o yüzden prototype'a eklemek gerekli değil.
Post.findSingleById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      //kullanıcıdan gelen veriyle databasele yapacağımız her interaksiyonda, verinin sadece bir string olduğundan emin ol.
      //object olup malicious attack dönmesin.
      reject();
      return;
    }

    //Buradaki aggregatei, operasyonun için tanımlayacak şekilde üstteki fonksiyona aktardık.
    let posts = await Post.reusablePostQuery(
      [{ $match: { _id: new ObjectID(id) } }],
      visitorId
    );

    if (posts.length) {
      console.log(posts[0]);
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function (authodId) {
  return Post.reusablePostQuery([
    { $match: { author: authodId } },
    { $sort: { createdDate: -1 } }, //createdDate 1 for asc. -1 for desc.
  ]);
};

module.exports = Post;
