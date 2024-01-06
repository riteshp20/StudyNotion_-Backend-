const Course = require("../models/Course");
const Tag = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// createCourse handler function
exports.createCourse = async (req, res) => {
    try{
        // fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: ", instructorDetails);
        // TODO: Verify that userId and instructorDetails._id are same or different ?

        if(!instructorDetails) {
            return res.ststus(404).json({
                success:false,
                message:"Instructor Details not found",
            });
        }

        // check given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails) {
            return res.status(404).json({
                success:false,
                message:"Tag Details not found",
            });
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });

        // add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        )

        // update the TAG ka schema
        // TODO: HW

        // return response
        return res.status(200).json({
            success:true,
            message:"Course created successfully",
            data:newCourse,
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Failed to create Course",
            error:error.message,
        }); 
    }
};


// getAllCourses handler function
exports.showAllCourses = async (req, res) => {
    try{
        // TODO: change the below statement incrementally
        const allCourses = await Course.find({}, {
            courseName:true,
            price:true,
            thumbnail:true,
            ratingAndReviews:true,
            studentsEnrolled:true,})
            .populate("instructor")
            .exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:true,
            message:"Cannot Fetch course data",
            error:error.message,
        });
    }
}

// get courseDetails
exports.getCourseDetails = async (req, res) => {
    try{
        // get course id from req body
        const {courseId} = req.body;
        // find course details
        const courseDetails = await Course.find(
                                    {_id:courseId})
                                    .populate(
                                        {
                                            path:"instructor",
                                            populate:{
                                                path:"additionalDetails",
                                            },
                                        }
                                    )
                                    .pipulate("category")
                                    .pipulate("ratingAndReviews")
                                    .populate(
                                        {
                                            path:"courseContent",
                                            populate:{
                                                path:"section",
                                                populate:{
                                                    path:"subSection",
                                                },
                                            }
                                        }
                                    )
                                    .exec();
            // validation
            if(!courseDetails){
                return res.status(400).json({
                    success:false,
                    message:`Could not find the course with ${courseId}`,
                });
            }
            // return response
            return res.status(200).json({
                success:true,
                message:"Course Details fetched successfully",
                data:courseDetails,
            });

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching courseDeatails",
            error:error.message,
        });
    }
}