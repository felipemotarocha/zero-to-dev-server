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
		type: mongoose.Schema.Types.ObjectId,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
	},
});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
