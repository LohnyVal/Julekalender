const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
require("dotenv").config();

const User = require("./models/User")

const mongodb = mongoose.connect(process.env.MONGODB)


const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
    const calendar_array = Array.from({length: 24}, (_, i) => i + 1);
    res.render("index", {calendar_array})
})

app.get("/calendar/:id", (req, res) =>{

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