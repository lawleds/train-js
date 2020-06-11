/*
If exporting multiple functions is desired, this is first alternative:
module.exports = {
    login: function(){},
    logout: function(){}
}
*/

//property named 'login' will be added to what's getting exported from this file
exports.login = function(){
    
}

exports.logout = function(){
    
}

exports.register = function(){

}

exports.home = function(req, res){
    res.render('home-guest')
}




