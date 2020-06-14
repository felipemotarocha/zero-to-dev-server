const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	videoTime: {
		type: Number,
		required: true,
	},
	video: {
		type: String,
		required: true,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
