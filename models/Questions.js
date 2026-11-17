const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
        unique: true,
        min: 1,
        max: 24
    },
    type: {
        type: String,
        enum: ["multiple", "freetext"],
        required: true
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String]
    },
    answer: {
        type: String,
        trim: true
    },
    media: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model("Question", questionSchema);