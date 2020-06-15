const { default: validator } = require("validator");
const usersCollection = require("../db").db().collection("users");
const bcrypt = require("bcryptjs");
const md5 = require("md5");

//constructor function. Reusable blueprint to create user objects
let User = function (data, getAvatar) {
  this.data = data;
  this.errors = [];
  if (getAvatar == undefined) {
    getAvatar = false;
  }
  if (getAvatar) this.getAvatar();
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
//Method her objeye kopyalanmayacak, 'User' constructor kullanan her obje buna erişebilecek
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
  return new Promise(async (resolve, reject) => {
    //asağıda await yapabilmek için async
    if (
      this.data.username == "" &&
      !validator.isAlphanumeric(this.data.username)
    ) {
      this.errors.push("Proper username must be provided.");
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
    //if username is unique
    let usernameExists = await usersCollection.findOne({
      username: this.data.username,
    });
    if (usernameExists) this.errors.push("That username is already taken.");

    //if email is unique
    let emailExists = await usersCollection.findOne({
      email: this.data.email,
    });
    if (emailExists) this.errors.push("That email is already taken.");
    resolve();
  });
};

/* Callbackli login
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
*/

//Promise ise;
User.prototype.login = function () {
  return new Promise((resolve, reject) => {
    //arrow function for 'this'
    this.cleanUp();
    /*Bu da bir callback yapısı promise hali var
    usersCollection.findOne({ username: this.data.username },
      (err, attemptedUser) => {   Bu fonksiyonu findOne callback olarak çağırıyor
        ...
        //eğer ki arrow yapmazsak context değişecek ve 'this' keyword sıkıntıya girecek.
        });
    */

    usersCollection
      .findOne({ username: this.data.username }) //bu fonksiyonun promise döndürdüğünü biliyoruz o yüzden .then(...)
      .then((attemptedUser) => {
        if (
          attemptedUser &&
          bcrypt.compareSync(this.data.password, attemptedUser.password)
        ) {
          //mongo kimseyi bulamazsa attempedU boş kalacak
          this.data = attemptedUser; //getAvatar'a email sağlamak için
          this.getAvatar(); //db'de saklamak yerine, ihtiyacımız olduğunda fonksiyonu kullanarak çekeceğiz. Store in memory(user object)
          resolve("Congrats");
        } else {
          //şifre falan yanlışsa ama adam buluşsa
          reject("Invalid username or password");
        }
      })
      .catch((e) => {
        //database error
        reject("Please try again later.");
      });
  });
};
/*          /////////////////////--PROMISE--/////////////////////
pending, resolved, rejected, 
      Promise Neden?
  Birden fazla async eventin sonuçlarını arzu edilen sırada almak istediğimizde nested bir yapıya sahip olmak gerekiyor.
  Manageable ve maintainability olmaktan çıkabilir kod.
  eatOne(function(){
    eatTwo(function(){
      eatThree(function(){
        ...
      });});});

  --Promise - bütün fonksiyonların return new Promise(resolve, reject){'someDBthings'}yaptığı bir koşulda;

  eatOne().then(function(){      ||||    Arrow function yapabilir, tek satır olduğu için return ve süslü parantezler kalkabilir 
    return eatTwo()              ||||      eatOne()
  }).then(function(){            ||||       .then(() => eatTwo())
    return eatThree              ||||       .then(() => eatThree()).catch(() => console.log(e))
  }).catch(function(e){     Geleneksel callback yapısında olduğu gibi her biri için error dinlemeye ihtiyacımız yok.
    console.log(e)          Sona koyulan tek catch yetiyor.
  })THENleri dışarı koyuyoruz çünkü içindeki resolved olmadan diğerine geçmiyor zaten.
          /////////////////////--AWAIT--/////////////////////
    'await' sadece async function içerisinde kullanılan bir keyword.
    eat fonksiyonları yine promise döndürüyorlar.
    Yaptığı şey; bulunduğu fonksiyondan cevap dönene kadar sonraki satıra geçmemesi. 
    Eğer ki error'u yakalamak istiyorsan try-catch içine alınacak.

    async function runActions()
    {
      try{
        await eatOne()
        await eatTwo()
        await eatThree()
      }catch(err){
        console.log(err)
      }
    }
    runActions() //call function

    **Eğer ki sıralamaları önemli değilse ama hepsi bittikten sonra bir işlem yapılmak isteniyorsa;
    await Promise.all([promise1, promise2, promise3, promise4])
*/

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    //Step #1: Validate user data
    this.cleanUp();
    //validation async olduğu için;
    await this.validate(); //bunu da controllerdaki çağırıyor. user.validate()'ten farkı yok orası için.
    //Step #2: If there are no validation errors, save data into db.
    if (!this.errors.length) {
      //hash user password
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await usersCollection.insertOne(this.data);
      this.getAvatar(); //db'de saklamak yerine, ihtiyacımız olduğunda fonksiyonu kullanarak çekeceğiz. Store in memory(user object)
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.prototype.getAvatar = function () {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
  //this.data.avatar değil çünkü this.data constructordan geliyordu bu burada üretildi.
};

User.findByUsername = function (username) {
  return new Promise(function (resolve, reject) {
    if (typeof username != "string") {
      reject();
      return;
    }
    usersCollection
      .findOne({ username: username })
      .then(function (userDoc) {
        if (userDoc) {
          //cleanUp
          userDoc = new User(userDoc, true);
          userDoc = {
            _id: userDoc.data._id,
            username: userDoc.data.username,
            avatar: userDoc.avatar,
          };
          resolve(userDoc);
        } else {
          reject();
        }
      })
      .catch(function () {
        reject();
      });
  });
};

module.exports = User;
