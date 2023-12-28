const Tag = require("../models/tags");

// create Tag ka Handler function

exports.createTag = async (req, res) => {
    try{
        // data fetch
        const {name, description} = req.body;
        // validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are require",
            });
        }

        // create entry in DB
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        // return response
        return res.status(200).json({
            success:true,
            message:"Tag Created Successfully",
        });
    }
    catch(error){
        return res.status(500).jso({
            success:false,
            message:error.message,
        });
    }
}

// getAlltags handler function

exports.showAlltags = async (req, res) =>{
    try{
        const allTags = await Tag.find({}, {name:true}, {description:true});

        return res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            allTags,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}