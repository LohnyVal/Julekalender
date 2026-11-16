const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true
    },
    question: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    options: {
        type: [String],

    },
    answer: {
        type: String,
        required: true
    }

})



module.exports = mongoose.model("Questions", userSchema)