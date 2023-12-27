const mongoose=require("mongoose");

const profileSchema = new mongoose.Schema({
    gender:{
        type:String,
        required:true,
    },
    dateOfBirth:{
        type:string,
        required:true,
    },
    about:{
        type:string,
        trim:true,
    },
    contactNumber:{
        type:Number,
        trim:true,
    }
});

module.exports = mongoose.model("Profile", profileSchema);