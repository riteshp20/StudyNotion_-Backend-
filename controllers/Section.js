const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
    try{
        // data fetch
        const {sectionName, courseId} = req.body;
        // data validation
        if(!sectionName || courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        // create section
        const newSection = await Section.create({sectionName});
        // update course with section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                             courseId,
                                             {
                                               $push:{
                                                courseContent:newSection._id,
                                               } 
                                             },
                                             {new:true},
                                            )
        // HW: use populate to replace sections/sub-sections both in the updatedCourseDetails
        // return response
        return res.status(200).json({
            success:true,
            message:"Section create successfully",
            updatedCourseDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section, please try again",
        });
    }
}

// update section
exports.updateSection = async (req, res) => {
    try{

        // data input
        const {sectionName, sectionId} = req.body;
        // data Validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required, please try again",
            });
        }
        // update data
        const updateSectionDetails = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});
        // return response
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
            updateSectionDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update Section, please try again",
            error:error.message,
        });
    }
}

// delete section
exports.deleteSection = async (req, res) => {
    try{
        // data fetch
        // const {sectionId} = req.body.sectionId;
        // get ID - assuming that we are sending ID in params
        const {sectionId} = req.params;
        // data validation
        if(!sectionId){
            return res.status(400).json({
                success:false,
                message:"sectionId is empty, please try again",
            });
        }
        // delete data using findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        // TODO[testing]: do we need to delete the entry from the course schema ??
        // return res
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong, while deleting Section, please try again",
        });
    }
}