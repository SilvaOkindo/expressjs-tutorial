import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
    },
    age: {
        type: mongoose.Schema.Types.Number,
        required: true
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
})

export const User = mongoose.model("user", userSchema) 

