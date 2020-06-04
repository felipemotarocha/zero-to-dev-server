const express = require("express");
const Note = require("../../models/note/note.model");
const Video = require('../../models/video/video.model')

const router = new express.Router();

router.get("/", async (req, res) => {
	try {
		const notes = await Note.find({});
		res.status(200).send(notes);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.post("/", async ({ body: { text, videoTime, video, owner } }, res) => {
	try {
        // Checking if the received video exists.
        const noteVideo = await Video.findById(video);
        if (!noteVideo) {
            throw new Error('This video does not exists.')
        }
        
        // Creating the new note.
		const createdNote = new Note(body);
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
		const requestedUpdates = Object.entries(body);

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

router.delete('/:id', ({ params: { id } }, res) => {
    try {
        const noteToDelete = await Note.findByIdAndDelete(id);
        res.status(200).send(noteToDelete);
    } catch (error) {
        res.status(500).send(error.message);
    }
})
