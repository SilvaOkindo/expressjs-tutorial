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
    profileImage: {
        type: String,
        default: "https://res.cloudinary.com/dgf918fxg/image/upload/v1728818047/samples/people/smiling-man.jpg"
    },

    password: {
        type: mongoose.Schema.Types.String,
        required: true,
    },

})

export const User = mongoose.model("user", userSchema) 

