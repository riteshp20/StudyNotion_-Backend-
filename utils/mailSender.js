const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try{
         let transpoter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            math:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
         })

         let info = await WebTransportError.sendMail({
            from:'StudyNotion || CodeHelp - by Babbar',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
         })
         console.log(info);
         return info;
    }
    catch(error){
        console.log(error.message);
    }
}



module.exports = mailSender;