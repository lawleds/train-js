const { default: validator } = require("validator");
const usersCollection = require("../db").collection("users");

//constructor function. Reusable blueprint to create user objects
let User = function (data) {
  this.data = data;
  this.errors = [];
  /*
  'this', bu fonksiyonu execute eden yere aittir.
   Biz controllerda let user = new User() dediğimizde, constructor func.'ı new çağırıyor, ve bu yeni obje çağırdığı için
   constr. func'ı, 'this' keyword will point towards that new object. Ve bunu da 'let user'a eşitledik. 
   Yani 'this', user'ı işaret etmiş oldu.
  */

  /*
  this.register = function () {
    return "registered";
  };
  */
  //Şimdi bu yöntem çalışıyor, ama worth değil çünkü JS, yaratılan her bir objeye bu methodları kopyalıyor/ekliyor.
};

User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }
  if (typeof this.data.email != "string") {
    this.data.email = "";
  }
  if (typeof this.data.password != "string") {
    this.data.password = "";
  }

  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

User.prototype.validate = function () {
  if (
    this.data.username == "" &&
    validator.isAlphanumeric(this.data.username)
  ) {
    this.errors.push("Username must be provided.");
  }
  if (!validator.isEmail(this.data.email)) {
    this.errors.push("Email must be an email.");
  }
  if (this.data.password == "") {
    this.errors.push("Password must be provided.");
  }
  if (this.data.password.lenght > 0 && this.data.password.lenght < 12) {
    this.errors.push("Password must be at least 12 character.");
  }
};

User.prototype.login = function (callback) {
  this.cleanUp();
  usersCollection.findOne(
    { username: this.data.username },
    (err, attemptedUser) => {
      //Bu fonksiyonu findOne callback olarak çağırıyor
      //eğer ki arrow yapmazsak context değişecek ve 'this' keyword sıkıntıya girecek.
      if (attemptedUser && attemptedUser.password == this.data.password) {
        //mongo kimseyi bulamazsa attempedU boş kalacak
        callback("Congrats")
      }else{
        callback("Invalid username or password")
      }
    }
  );
};

User.prototype.register = function () {
  //Method her objeye kopyalanmayacak, 'User' constructor kullanan her obje buna erişebilecek
  //Step #1: Validate user data
  this.cleanUp();
  this.validate(); //bunu da controllerdaki çağırıyor. user.validate()'ten farkı yok orası için.
  //Step #2: If there are no validation errors, save data into db.
  if (!this.errors.length) {
    usersCollection.insertOne(this.data);
  }
};

module.exports = User;
