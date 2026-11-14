const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();


const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", (req, res) => {
    const calendar_array = Array.from({length: 24}, (_, i) => i + 1);
    res.render("index", {calendar_array})
})

app.get("/calendar/:id")


app.listen(process.env.PORT);