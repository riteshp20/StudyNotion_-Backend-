const User = require("../models/User");
const Profile = require("../models/Profile");

exports.updateProfile = async (req, res) => {
    try{
        // fetch data from req body
        const {gender, dateOfBirth="", about="", contactNumber} = req.body;
        // get user id
        const id = req.user.id;
        // validate data
        if(!gender || !id || !contactNumber){
            return res.status(400).json({
                success:false,
                message:"All fields are required, please try again",
            });
        }
        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        await profileDetails.save();
        // return response
        return res.status(200).json({
            success:true,
            message:"Profile details updated successfully",
            profileDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while updating profile",
            error:error.message,
        });
    }
}

// deleteAccount
// 
exports.deleteAccount = async (req, res) => {
    try{
        // get id
        const id = req.user.id;
        // validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"User not found",
            });
        }
        // delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        // TODO: HW unenroll user from all enrolled courses
        // delete user
        await User.findByIdAndDelete({_id:id});
        // return response
        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while deleting user, please try again",
            error:error.message,
        });
    }
}

exports.getAllUserDetails = async (req, res) => {
    try{
        // get id
        const id = req.user.id;
        // validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        // return response
        return res.status(200).json({
            success:true,
            message:"User Data Fetched Successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}