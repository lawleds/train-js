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
      req.session.user = { username: user.data.username }; //Request object has new session object that is unique per browser/visitor.
      //Browser'da oluşturulan cookie'nin unique valuesu olur ve bu server memorysindeki session data için bir unique identifier.
      //Bir cookie varsa, her http request'i ile birlikte servera otomatik olarak gönderilir.
      //Server da bunu görür ve bu session valuesunu bildiğine göre doğru bilgiler giren kullanıcı/browser olduğuna güvenebilirim.
      /////////Session data memory'de tutulduğu için her değişiklik sonu yapılan ctrl+s ile server yeniden başlatılıyor ve
      /////////bütün session kayboluyor. Bunun için mongodb'de tutacağız session'ı.

      req.session.save(function () {
        //Yukarıdaki session tanınmlama otomatik olarak save ediyor db'ye aslında. ama biz bunu bu şekilde manuel hale
        //getirdik ki dbye kayıt async, function callback kullanabilelim.
        res.redirect("/");
      });
    })
    .catch(function (e) {
      req.flash("errors", e);
      //req.session.flash.errors = [e]
      req.session.save(function () {
        //flash verisini session'a kaydettik. home functionında data pass
        res.redirect("/");
      });
    });
};

exports.logout = function (req, res) {
  req.session.destroy(function () {
    //db ile uğraştığı için jet gibi olmicak o yüzden callback function. bu paket promise döndürmüyor sadly.
    res.redirect("/");
  });
};

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
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username }); //template render ederken obje olarak data pass edebiliriz
  } else {
    res.render("home-guest", { errors: req.flash("errors") }); //flash package'ı bir koleksiyonu update vs yerine
    //çekmek için kullandığında, remove ediyor kendiliğinden.
  }
};
