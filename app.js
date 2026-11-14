const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const mongodb = mongoose.connect(process.env.MONGODB)


const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", (req, res) => {
    const calendar_array = Array.from({length: 24}, (_, i) => i + 1);
    res.render("index", {calendar_array})
})

app.get("/calendar/:id", (req, res) =>{
    const id = Number(req.params.id)
    if(!Number.isInteger(id) || id < 1 || id > 24){
        res.status(404).send(("Denne luken finnes ikke! Det finnes bare luker fra 1 til 24"))
    }

    res.render("calendar", {id})
})


app.listen(process.env.PORT);