const express = require("express");
const Video = require("../../models/video/video.model");
const Topic = require("../../models/topic/topic.model");
const Note = require("../../models/note/note.model");

const router = new express.Router();

router.get("/", async (req, res) => {
	try {
		const videos = await Video.find({});
		res.status(200).send(videos);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.post(
	"/",
	async ({ body: { title, author, url, order, topic } }, res) => {
		try {
			// Checking if the passed topic already exists in the database.
			// This is important to check because the Video needs to have a valid Topic ID.
			const doesTopicExist = await Topic.findById(topic);
			if (!doesTopicExist) {
				throw new Error(
					"The inserted topic does not exist. Change the topic field and try again."
				);
			}
			// Creating the the new Video
			const createdVideo = new Video({ title, author, url, order, topic });
			await createdVideo.save();
			res.status(200).send(createdVideo);
		} catch (error) {
			res.status(500).send(error.message);
		}
	}
);

router.patch("/:id", async ({ body, params: { id } }, res) => {
	try {
		const videoToUpdate = await Video.findById(id);
		if (!videoToUpdate) {
			throw new Error("This video does not exist.");
		}
		// Setting the allowed updates.
		const allowedUpdates = ["title", "author"];
		const requestedUpdates = Object.keys(body);

		// Checking if the requested updates matches with the allowed updates.
		// If it matches, then update the field in the database. If not, don't do anything.
		for (update of requestedUpdates) {
			if (allowedUpdates.includes(update)) {
				videoToUpdate[update] = body[update];
			}
		}

		await videoToUpdate.save();
		res.status(200).send(videoToUpdate);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.delete("/:id", async ({ params: { id } }, res) => {
	try {
		const videoToDelete = await Video.findByIdAndDelete(id);
		const notesToDelete = await Note.deleteMany({ video: id });
		res
			.status(200)
			.send({ deletedVideo: videoToDelete, deletedNotes: notesToDelete });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
