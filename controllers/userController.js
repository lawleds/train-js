const User = require('../models/User.js')

/*
If exporting multiple functions is desired, this is first alternative:
module.exports = {
    login: function(){},
    logout: function(){}
}
*/

//property named 'login' will be added to what's getting exported from this file
exports.login = function(req, res){
    let user = new User(req.body)
    //callback function ile login'i beklediğimiz method
    user.login(function(result){
        res.send(result)
    })

}

exports.logout = function(){
    
}

exports.register = function(req, res){
    let user = new User(req.body)//create new object using this as its blueprint
    user.register()
    if(user.errors.length > 0){
        res.send(user.errors)
    }else{
        res.send('Ty for reg')
    }
}

exports.home = function(req, res){
    res.render('home-guest')
}




