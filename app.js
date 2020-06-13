const express = require("express");
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)//this is a blueprint for
const flash = require("connect-flash");
const app = express();

//figuration options for how we want to use
let sessionOptions = session({
    secret: "Sth that noone will ever guess",
    store: new MongoStore({client: require('./db')}),//Default olarak memory. Bunu yapmak yeterli olacak connect-mongo direkt 
    resave: false,                                   //olarak session açtığın yerde database'e session collection'ı koyup dolduruyor.
    saveUninitialized: false,                        //ve db'deki _id fieldı ile browserdaki cookie id eşleşiyor bu şekilde iletişim.
    cookie: {         //connect.sid in browser       //ve bu ayarları falan da tutuyor cookienin bitişini, verdiğimiz user değerini..
        maxAge: 1000 * 60 * 60 * 24, //How long the cookie for a session is valid before it expires in milisecond THIS IS ONE DAY
        httpOnly: true
    }
})

app.use(sessionOptions);
app.use(flash());

//routerdan önce çalışacak buraya koyduk diye. middleware.
app.use(function(req, res, next){
    res.locals.user = req.session.user//res.locals is an object that will be available within ejs templates
    next()
})

const router = require("./router.js");

app.use(express.urlencoded({extended: false}))//takes submitted form data and add it to body of request
app.use(express.json())//takes asynchronous requests data also and add it to body of request 

app.use(express.static("public"));//setting directory for views. make that folder available from root(here)
app.set("views", "views"); //first argument is express option, second one is folder name
app.set("view engine", "ejs");

app.use("/", router);//No need to look for anything else. Use router.js for everything else.

module.exports = app
