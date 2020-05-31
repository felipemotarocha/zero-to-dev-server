const express = require("express");
const Topic = require("../../models/topic/topic.model");
const Video = require("../../models/video/video.model");

const router = new express.Router();

router.get("/", async (req, res) => {
	try {
		const topics = await Topic.find({});
		res.status(200).send(topics);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.get("/:id/videos", async ({ params: { id } }, res) => {
	try {
		const topic = await Topic.findById(id);
		if (!topic) {
			throw new Error(
				"This topic does not exist. Change the topic field and try again."
			);
		}
		// Populate will find every Videos which has the "topic" field equal to the received Topic ID.
		await topic.populate("videos").execPopulate();

		// Sorting the videos.
		// We are doing that because in the Front-End we need to show the videos in the order the user needs to watch them.
		const sortedTopicVideos = topic.videos.sort(function (a, b) {
			// Since the video titles are "Aula #01", "Aula #02" and so on we are splitting it to only get the class number (01, 02).
			// It's important to know that those classes titles are a pattern and you must use it to don't break the app.
			var textA = a.title.split("#")[1];
			var textB = b.title.split("#")[1];
			return textA < textB ? -1 : textA > textB ? 1 : 0;
		});

		res.status(200).send(sortedTopicVideos);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.post("/", async ({ body: { title, image } }, res) => {
	try {
		// Checking if the topic already exists in the database.
		const existentTopic = await Topic.findOne({ title });
		if (existentTopic) {
			throw new Error("This topic already exists in the database.");
		}
		// Creating the Topic.
		const createdTopic = new Topic({ title, image });
		await createdTopic.save();
		res.status(200).send(createdTopic);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.patch("/:id", async ({ body, params }, res) => {
	try {
		const topicToUpdate = await Topic.findById(params.id);
		if (!topicToUpdate) {
			throw new Error("This topic does not exist.");
		}
		// Setting the allowed updates.
		const allowedUpdates = ["title"];
		const requestedUpdates = Object.keys(body);

		// Checking if the requested updates matches with the allowed updates.
		// If it matches, then update the field in the database. If not, don't do anything.
		for (update of requestedUpdates) {
			if (allowedUpdates.includes(update)) {
				topicToUpdate[update] = body[update];
			}
		}

		await topicToUpdate.save();
		res.status(200).send(topicToUpdate);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.delete("/:id", async ({ params: { id } }, res) => {
	try {
		const deletedTopic = await Topic.findByIdAndDelete(id);
		// Throw an error if the topic wasn't found.
		if (!deletedTopic) {
			throw new Error("This topics does not exist.");
		}
		// Deleting the Topic Videos.
		const deletedTopicVideos = await Video.find({ topic: id });
		await Video.deleteMany({ topic: id });

		res.status(200).send({ deletedTopic, deletedTopicVideos });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
