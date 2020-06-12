const User = require("../models/User.js");

/*
If exporting multiple functions is desired, this is first alternative:
module.exports = {
    login: function(){},
    logout: function(){}
}
*/

//property named 'login' will be added to what's getting exported from this file
exports.login = function (req, res) {
  let user = new User(req.body);
  /*callback function ile login'i beklediğimiz method
    user.login(function(result){
        res.send(result)
    })*/
  //Promise
  user
    .login()
    .then(function (result) {
      //Server stores this session data AND it sends instructions to browser to create a cookie.
      req.session.user = {username: user.data.username}//Request object has new session object that is unique per browser/visitor.
      //Browser'da oluşturulan cookie'nin unique valuesu olur ve bu server memorysindeki session data için bir unique identifier.  
      //Bir cookie varsa, her http request'i ile birlikte servera otomatik olarak gönderilir.
      //Server da bunu görür ve bu session valuesunu bildiğine göre doğru bilgiler giren kullanıcı/browser olduğuna güvenebilirim.
      /////////Session data memory'de tutulduğu için her değişiklik sonu yapılan ctrl+s ile server yeniden başlatılıyor ve
      /////////bütün session kayboluyor. Bunun için mongodb'de tutacağız session'ı.
      res.send(result);
    })
    .catch(function (e) {
      res.send(e);
    });
};

exports.logout = function () {};

exports.register = function (req, res) {
  let user = new User(req.body); //create new object using this as its blueprint
  user.register();
  if (user.errors.length > 0) {
    res.send(user.errors);
  } else {
    res.send("Ty for reg");
  }
};

exports.home = function (req, res) {
  if(req.session.user){
    res.send("Welcome to the actual application")
  }else{
    res.render("home-guest");
  }
};
