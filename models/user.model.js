const mongoose = require("mongoose");
const validator = require("validator");
const roles = require("../Utilities/roles");

const baseOptions = {
    discriminatorKey: "role", // Key to differentiate models
    collection: "User", // All models use the same collection
};

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxLenth: [50, "User name must be at most 50 characters"],
        },
        email: {
            type: String,
            required: true,
            validate: [validator.isEmail, "Not valid email"],
        },
        phonenumber: {
            type: String,
            required: true,
            validate: [
                (value) => validator.isMobilePhone(value, "ar-EG"),
                (props) => `${props.value} is not a valid mobile number`,
            ],
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: [roles.Student, roles.Instructor, roles.Admin],
            default: roles.Student,
        },
    },
    baseOptions
);

module.exports = mongoose.model("User", userSchema);
