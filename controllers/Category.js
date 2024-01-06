const Tag = require("../models/Category");

// create Tag ka Handler function

exports.createCategory = async (req, res) => {
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
        const categoryDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);

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

exports.showAllcategory = async (req, res) =>{
    try{
        const allCategory = await Tag.find({}, {name:true}, {description:true});

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

// categoryPageDetails

exports.categoryPageDetails = async (req, res) => {
	try {
        // get categoryId
		const { categoryId } = req.body;

		// Get courses for the specified category
		const selectedCategory = await Category.findById(categoryId)
			                            .populate("courses")
			                            .exec();
		console.log(selectedCategory);
		// Handle the case when the category is not found
		if (!selectedCategory) {
			console.log("Category not found.");
			return res
				.status(404)
				.json({ success: false, message: "Category not found" });
		}
		// Handle the case when there are no courses
		if (selectedCategory.courses.length === 0) {
			console.log("No courses found for the selected category.");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
		}

		const selectedCourses = selectedCategory.courses;

		// Get courses for other categories
		const categoriesExceptSelected = await Category.find({
			_id: { $ne: categoryId },
		}).populate("courses");
		let differentCourses = [];
		for (const category of categoriesExceptSelected) {
			differentCourses.push(...category.courses);
		}

		// Get top-selling courses across all categories
		const allCategories = await Category.find().populate("courses");
		const allCourses = allCategories.flatMap((category) => category.courses);
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);

		res.status(200).json({
			selectedCourses: selectedCourses,
			differentCourses: differentCourses,
			mostSellingCourses: mostSellingCourses,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};