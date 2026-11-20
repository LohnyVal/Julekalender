const mongoose = require("mongoose");
const { Schema } = mongoose;

const winnerSchema = new mongoose.Schema({
    day: Number,
    student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

})