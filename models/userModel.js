const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add the user name"]
    },
    email: {
        type: String,
        required: [true, "please add the email address"],
        // every time unique email address, no user can enter same email id
        unique : [true, "Email address already taken"],
    },
    password: {
        type: String,
        required: [true, "Please add the user password"]
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User",userSchema);