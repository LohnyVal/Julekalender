const express = require("express");
const mongoose = require("mongoose");


const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", (req, res) => {
    res.render("index")
})



app.listen(process.env.PORT);