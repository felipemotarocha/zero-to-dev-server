const express = require("express");
const Note = require("../../models/note/note.model");
const Video = require("../../models/video/video.model");
const auth = require("../../middlewares/auth/auth.middleware");
const { sortNotesByVideoTime } = require("../../utils/note/note.utils");

const router = new express.Router();

router.get("/", async (req, res) => {
	try {
		const notes = await Note.find({});
		res.status(200).send(notes);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.get("/my-notes", auth, async ({ user, query: { video, sort } }, res) => {
	try {
		// Getting the user notes
		await user.populate("notes").execPopulate();

		// Filtering the user notes using the received video ID
		// Only sends the notes of that specific video
		if (video) {
			const videoNotes = user.notes.filter((note) => note.video === video);
			if (sort == "true") {
				const sortedVideoNotes = sortNotesByVideoTime(videoNotes);
				return res.status(200).send(sortedVideoNotes);
			}
			return res.status(200).send(videoNotes);
		}

		res.status(200).send(user.notes);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.post("/", auth, async ({ body, user }, res) => {
	try {
		const { videoId } = body;
		// Checking if the received video exists.
		const noteVideo = await Video.findOne({ video: videoId });
		if (!noteVideo) {
			throw new Error("This video does not exists.");
		}

		// Creating the new note.
		const createdNote = new Note({
			...body,
			owner: user._id,
		});
		await createdNote.save();

		res.status(201).send(createdNote);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.patch("/:id", async ({ body, params: { id } }, res) => {
	try {
		const noteToUpdate = await Note.findById(id);

		// Setting the allowed updates.
		const allowedUpdates = ["text"];
		// Taking the requested updates
		const requestedUpdates = Object.keys(body);

		// Doing the updates
		for (update of requestedUpdates) {
			if (allowedUpdates.includes(update)) {
				noteToUpdate[update] = body[update];
			}
		}

		await noteToUpdate.save();
		res.status(200).send(noteToUpdate);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.delete("/:id", async ({ params: { id } }, res) => {
	try {
		const noteToDelete = await Note.findByIdAndDelete(id);
		res.status(200).send(noteToDelete);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
