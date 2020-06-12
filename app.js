const express = require("express");
const session = require("express-session")
const app = express();

//figuration options for how we want to use
let sessionOptions = session({
    secret: "Sth that noone will ever guess",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, //How long the cookie for a session is valid before it expires in milisecond THIS IS ONE DAY
        httpOnly: true
    }
})

app.use(sessionOptions);

const router = require("./router.js");

app.use(express.urlencoded({extended: false}))//takes submitted form data and add it to body of request
app.use(express.json())//takes asynchronous requests data also and add it to body of request 

app.use(express.static("public"));//setting directory for views. make that folder available from root(here)
app.set("views", "views"); //first argument is express option, second one is folder name
app.set("view engine", "ejs");

app.use("/", router);//No need to look for anything else. Use router.js for everything else.

module.exports = app
