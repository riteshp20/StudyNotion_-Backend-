const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create subSection
exports.createSubSection = async (req, res) => {
    try{
        // data fetch from req body
        const {sectionId, title, timeDuration, description} = req.body;
        // extract file/video
        const video = req.file.videoFile;
        // validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are require, please try again",
            });
        }
        // upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        // create a sub-section
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        });
        // update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate(                                       {_id:sectionId},
                                                {$push:{
                                                        subSection:SubSectionDetails._id,
                                                    }},
                                                {new:true});
        // return response
        return res.status(200).json({
            success:true,
            message:"Sub Section Created Successfully",
            updatedSection,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating subSection, please try again",
            error:error.message,
        });
    }
}

// update sub-section
exports.updateSubSection = async (req, res) => {
    try{
        // data fetch from req body
        const {subSectionId, title, timeDuration, description} = req.body;
        // extract file/video
        const video = req.file ? req.file.videoFile : undefined;
        // data validation
        if(!subSectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are require, please try again",
            });
        }
        // update fields for sub-section
        const updateFields = {};
        if(title) updateFields.title = title;
        if(timeDuration) updateFields.timeDuration = timeDuration;
        if(description) updateFields.description = description;

        if(video){
            uploadVideo = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            updateFields.videoUrl = uploadVideo.secure_url;
        };

        // updated subSection
        const updatedSubSection = await SubSection.findByIdAndUpdate(
                                                    {_id:subSectionId},
                                                    {$set:updateFields},
                                                    {new:true},
        );

        // return response
        return res.status(200).json({
            success:true,
            message:"Subsection updated successfully",
            updatedSubSection,
        });
    }
    catch(error){
        return res.status(500).jons({
            success:false,
            message:"SubSection updation failed, please try again",
            error:error.message,
        });
    }
}

// delete sub-section
exports.deleteSubSection = async (req, res) => {
    try{
        // data fetch from req params
        const subSectionId = req.params.subSectionId;
        // validate data
        if(!subSectionId){
            return res.status(400).json({
                success:false,
                message:"SubSection ID is required for deletion, please try again",
            });
        }

        // delete subSection
        const deleteSubSection = await SubSection.findByIdAndRemove(subSectionId);

        if(!deleteSubSection){
            return res.status(400).json({
                success:false,
                message:"SubSection not found, deletion failed",
            });
        }

        // return response
        return res.status(200).json({
            success:true,
            message:"SubSection deleted successfully",
            deleteSubSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while deleting subSection, please try again",
            error:error.message,
        });
    }
}