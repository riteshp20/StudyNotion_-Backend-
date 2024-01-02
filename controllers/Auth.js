const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


// sendOTP
exports.sendOTP = async (req, res) => {
    try{
        // fetch email from request ki body
        const {email} = req.body;

        // check if user already exist
        const checkUserPresent = await User.findOne({email});

        // if user already exist , then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }

        // generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated: ", otp);

        // check unique otp or not
        const result = await OTP.findOne({otp: otp});

        while(result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        // create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response successful
        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// signUp
exports.signUp = async (req, res) => {
    try{
        // data fetch from request ki body
        const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body;
        // validate krlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
        }

        // 2 password match krlo
        if(password != confirmPassword){
            return res.status.json({
                success:false,
                message:"Password and confirmPassword Value does not match, please try again",
            });
        }
        // check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status.json({
                success:false,
                message:"User is already registered",
            });
        }

        // find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        if(recentOtp.length == 0){
            return res.status(400).json({
                success:false,
                message:"OTP not found",
            })
        }else if(otp !== recentOtp.otp){
            // Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        // entry create in DB
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
        // return response
        return res.status(200).json({
            success:true,
            message:"User is registered Successfully",
            user,
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered, please try again",
        })
    }
}

// login 
exports.login = async (req, res) =>{
     try{
        // get data from req body
        const {email, password} = await req.body;

        // validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again",
            });
        }
        // user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            })
        }
        // generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            })
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect",
            });
        }
        
     }
     catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure, please try again",
        });
     }
}

// changePassword
exports.changePassword = async (req, res) => {
    try{
        // get data from req body
        // get oldPassword, newPassword, confirmNewPassword
        const {email,oldPassword, newPassword, confirmNewPassword} = req.body;
        // validation
        if(!email || !oldPassword || !newPassword || !confirmNewPassword){
            return res.status(403).json({
                success:false,
                message:"All fields are require, please try again",
            });
        }
        // check user exist or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            });
        }
        // check oldPassword matches or not
        if(await bcrypt.compare(oldPassword, user.password)){
            // update the password
            if(newPassword !== confirmNewPassword){
                return res.status(401).json({
                    success:false,
                    message:"newPassword and confirmNewPassword not matches, please try again",
                });
            }
            else{
                const hashedNewPassword = await bcrypt.hash(newPassword, 10);
                user.password = hashedNewPassword;
            }
            await user.save();

            // return response
            return res.status(200).json({
                success:true,
                message:"Password changed successfully",
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Old password is incorrect",
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while changing old Password, please try again",
        });
    }
}