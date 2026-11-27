const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
require("dotenv").config();

const User = require("./models/User");
const Question = require("./models/Questions")
const Answer = require("./models/Answer")
const Winner = require("./models/Winner")


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

app.get("/", async (req, res) => {
    const calendar_array = Array.from({length: 24}, (_, i) => i + 1);
    const today = new Date().getDate();
    res.render("index", {calendar_array, today})
})

app.get("/calendar/:id", (req, res) =>{

    const token = req.cookies.token;
    if(!token){
        return res.redirect("/registerUser");
    }

    jwt.verify(token, process.env.SECRET_JWT, async (err, payload) =>{
        if(err){
            return res.redirect("/registerUser")
        }

        const id = Number(req.params.id)
        if(!Number.isInteger(id) || id < 1 || id > 24){
            res.status(404).send(("Denne luken finnes ikke! Det finnes bare luker fra 1 til 24"))
        }

        const quiz = await mongoose.connection.db.collection("quizzes").findOne({_id: "christmas-quiz"});
        const question = quiz.questions.find(q => q.id === id);

        const winner = await Winner.findOne({day: id});  
        const get_winner_username = winner ? winner.username : null


    
        res.render("calendar", {id, username: payload.username, q:question, get_winner: get_winner_username})
    });
})
app.get("/answers/:id", async (req, res) =>  {

    const token = req.cookies.token;
    const today = new Date().getDate()

    let id = req.params.id;
    id = Number(id);

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
    const answers = await Answer.find({day: id});


    res.render("answers", {answers, day: id});
    })


})





app.get("/registerUser", (req, res) =>{
    res.render("registerUser");
})


app.get("/dashboard", async (req, res) => {
    const token = req.cookies.token;
    const today = new Date().getDate()
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
        const users = await User.find().select("username email role").lean();
        const answers = await mongoose.connection.db.collection("answers").find().toArray();
        const answers_amount = await Answer.countDocuments()

        res.render("dashboard", { userCount, users, username: user.username, today, answers, answers_amount });
    })
})


app.get("/logout", (req, res) =>{
    res.clearCookie("token");
    res.redirect("/registerUser")
})

app.get("/userguide", (req, res) =>{
    res.render("userguide")
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




app.post("/calendar/:id/:type", async (req, res) =>{
    const {answer} = req.body;

    const day = req.params.id;
    const type = req.params.type;
    const token = req.cookies.token;
    const user = await jwt.decode(token);
    const userId = user.id;
    const username = user.username;

   const answerd = await Answer.findOne({
        student: userId,
        day: day
    });
    

    if(answerd){
        return res.send(`Du kan ikke svare flere ganger enn en gang per luke! Neste luke åpner ${Number(day) + 1} desember`)
    }
    
    if(type === "open" || type === "video") {
        const quiz = await mongoose.connection.db.collection("quizzes").findOne({_id: "christmas-quiz"});
        const question = quiz.questions.find(q => q.id === Number(day));

        const result = await Answer.insertOne({student: userId, username: username, day: day, answer: answer, type: type, question: question.question})
    } else if (type === "mc") {
        const quiz = await mongoose.connection.db.collection("quizzes").findOne({_id: "christmas-quiz"});
        const question = quiz.questions.find(q => q.id === Number(day));

        const correct = answer.trim().toLowerCase() === question.correct_answer.toLowerCase();
        
        const result = await Answer.insertOne({student: userId, username: username, day: Number(day), answer: answer, correct: correct, type: type, question: question.question})
    } 


    res.redirect("/")
})


app.post("/question/:id/:day", async (req, res) =>{
    const {result} = req.body;
    const day = req.params.day;
    const id = req.params.id;
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
    })

    const correct = await Answer.findByIdAndUpdate(
        id,
        {
            correct: result
        }
    )

    res.redirect(`/answers/${day}`)

})


app.post("/winner/:day", async (req, res) =>{
    const day = req.params.day;
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

        let username = user.username;

        const get_right_answers = await Answer.find({correct: true, day: day});

        if(get_right_answers.length === 0){
            return res.redirect(`/answers/${day}`)
        }

        let winner = Math.floor(Math.random() * get_right_answers.length);
        let index = winner.toFixed(0);
        let get_winner = get_right_answers[index]

        let winner_username = get_winner.username
        
        const winner_save = await Winner.insertOne({
            day: day,
            student: get_winner.student,
            username: winner_username
        })
 

        res.redirect(`/answers/${day}`)
    
    })

    
})

app.listen(process.env.PORT);