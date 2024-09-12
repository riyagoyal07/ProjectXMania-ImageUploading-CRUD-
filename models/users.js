const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type: String,
        required:true,
    },
    image: {
        type:String,
        required:true,
    },
    created:{
        type:Date,
        required : true,
        default:Date.now,
    },
});
const User = mongoose.model('User',userSchema);
module.exports= User;