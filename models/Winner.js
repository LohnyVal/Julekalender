const mongoose = require("mongoose");
const { Schema } = mongoose;

const winnerSchema = new mongoose.Schema({
    day: Number,
    student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    username: String

})

module.exports = mongoose.model("Winner", winnerSchema)