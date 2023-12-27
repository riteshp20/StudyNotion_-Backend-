const User = require("../models/User");
const mailSender = require("../utils/mailSender");

// resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try{
        // get email from req body
        const email = req.body.email;
        // check user for this email, email validation
        if(!email){
            return res.status(500).json({
                success:false,
                message:"email is empty, please enter email and try again",
            });
        }
//to check user is register or not
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(500).json({
                success:false,
                message:"User is not registered, please registered first",
            })
        }
        // generate token
        // update user by adding token and expiration time
        // create url
        // send mail containing the url
        // return response
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:""
        })
    }
}





// resetPassword