const sortNotesByVideoTime = (notes) => {
	return notes.sort((a, b) => a.videoTime - b.videoTime);
};

module.exports = { sortNotesByVideoTime };
