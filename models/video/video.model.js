const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	videoId: {
		type: String,
	},
	topic: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Topic",
	},
});

videoSchema.pre("save", function (next) {
	// this = video that is being created
	this.videoId = this.url.split("=")[1];
	next();
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
