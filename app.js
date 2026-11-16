const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
require("dotenv").config();

const User = require("./models/User");


const mongodb = mongoose.connect(process.env.MONGODB)


const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

app.use((req, res, next) =>{
    res.locals.loggedIn = false;
    res.locals.currentUser = null
    const token = req.cookies.token;
    if(!token){
        return next()
    }

    jwt.verify(token, process.env.SECRET_JWT, (err, payload) =>{
        if(!err){
            res.locals.loggedIn = true;
            res.locals.currentUser = payload.username
        }
        return next()
    })
})

app.get("/", (req, res) => {
    const calendar_array = Array.from({length: 24}, (_, i) => i + 1);
    const today = new Date().getDate();
    res.render("index", {calendar_array, today})
})

app.get("/calendar/:id", (req, res) =>{

    const day = Number(req.params.id);
    const today = new Date().getDate();

    if(day < today){
        return res.send("Kan ikke åpne tidligere uker!")
    }
    if(day > today){
        return res.send("Kan ikke åpne fremtidige luker")
    }

    const token = req.cookies.token;
    if(!token){
        return res.redirect("/registerUser");
    }

    jwt.verify(token, process.env.SECRET_JWT, (err, payload) =>{
        if(err){
            return res.redirect("/registerUser")
        }
        const id = Number(req.params.id)
        if(!Number.isInteger(id) || id < 1 || id > 24){
            res.status(404).send(("Denne luken finnes ikke! Det finnes bare luker fra 1 til 24"))
        }
    
        res.render("calendar", {id, username: payload.username})
    });
})


app.get("/registerUser", (req, res) =>{
    res.render("registerUser");
})


app.get("/dashboard", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/")
    }

    jwt.verify(token, process.env.SECRET_JWT, async (err, payload) => {
        if (err) {
            return res.redirect("/")
        }

        const user = await User.findById(payload.id).select("username role");
        if (!user) {
            return res.redirect("/");
        }

        if(user.role !== "teacher"){
            return res.redirect("/")
        }
       const userCount = await User.countDocuments({role: {$ne: "teacher"}});

        res.render("dashboard", { userCount, username: user.username.slice(0,-3) })
    })
})


app.get("/logout", (req, res) =>{
    res.clearCookie("token");
    res.redirect("/registerUser")
})


app.post("/registerUser", async (req, res) =>{
    const {email} = req.body;

    if(!email || !email.includes("@afk")){
        return res.status(400).send("Du kan ikke skrive en mail uten @afk! Prøv igjen!")
    }

    const get_username_by_email = email.trim().toLowerCase();
    const username = get_username_by_email.split("@")[0];

    const user = await User.findOneAndUpdate(
        {email: get_username_by_email},
        {$setOnInsert: {username}},
        {upsert: true, new: true}
    )


    const token = jwt.sign(
        {id: user._id, username: user.username}, process.env.SECRET_JWT,
        {expiresIn: "30d"}
    )

    res.cookie("token", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000
    })


    res.redirect("/")
})



app.listen(process.env.PORT);