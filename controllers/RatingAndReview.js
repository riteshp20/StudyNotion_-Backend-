const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

// createRating
exports.createRating = async (req, res) =>{
    try{
        // get user id
        const userId = req.user.id;
        // fetchData from req body
        const {rating, review, courseId} = req.body;
        // check if user is enrolled or not
        const courseDetails = await Course.findOne(
                                    {_id:userId,
                                        studentsEnrolled:{$elemMatch: {$eq: userId}},
                                    });
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"Student is not enrolled in the course",
            });
        }
        // check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                user:userId,
                                                course:courseId,
                                            });
        if(alreadyReviewed) {
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the User",
            });
        }
        // create rating and review
        const ratingReview = await RatingAndReview.create({
                                        rating, review,
                                        course:courseId,
                                        user:userId, 
                                    });
        // update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push: {
                                            ratingAndReviews:ratingReview._id,
                                        }
                                    },
                                    {new:true});
        console.log(updatedCourseDetails);
        // return response
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Rating and Reviewed is failed, please try again",
            error:error.message,
        });
    }
}

// getAverageRating
exports.getAverageRating = async (req, res) => {
    try{
        // get courseId
        const courseId = req.body.courseId;
        // calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg:"$rating"},
                }
            }
        ])

        // return response
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            });
        }
        else{
            return res.status(200).json({
                success:true,
                message:"Average Rating is 0, no rating given till now",
                averageRating,
            });
        }
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Average Rating is failed, please try again",
            error:error.message,
        });
    }
}

// getAllRating
exports.getAllRating = async (req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                .sort({rating: "desc"})
                                .populate({
                                    path:"course",
                                    select:"firstName lastName email image",
                                })
                                .populate({
                                    path:"course",
                                    select:"courseName",
                                })
                                .exec();
        
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching all reviews, please try again",
            error:error.message,
        });
    }
}