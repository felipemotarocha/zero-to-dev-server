const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	icon: {
		type: String,
		required: true,
	},
});

topicSchema.virtual("videos", {
	ref: "Video",
	localField: "_id",
	foreignField: "topic",
});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;
