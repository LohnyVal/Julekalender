const mongoose = require("mongoose");
const { Schema } = mongoose;

const answerSchema = new mongoose.Schema({
    day: Number,
    answer: String,
    username: String,
    type: String,
    question: String,
    student: {
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    correct: {
        type: Boolean,
        required: false
    }
})


const answer = mongoose.model("Answer", answerSchema);

module.exports = answer;