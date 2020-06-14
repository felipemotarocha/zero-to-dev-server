const express = require("express");
const Topic = require("../../models/topic/topic.model");
const Video = require("../../models/video/video.model");
const { sortVideosAlphabetically } = require("../../utils/video/video.utils");

const router = new express.Router();

router.get("/", async (req, res) => {
	try {
		const topics = await Topic.find({});
		res.status(200).send(topics);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.get("/all/with-videos", async ({ query: { sort } }, res) => {
	try {
		const topics = await Topic.find({});
		const topicsWithVideos = await Promise.all(
			topics.map(async (topic) => {
				await topic.populate("videos").execPopulate();
				if (sort === "alphabetically") {
					return { topic, videos: sortVideosAlphabetically(topic.videos) };
				}
				return { topic, videos: topic.videos };
			})
		);
		res.status(200).send(topicsWithVideos);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.get("/:id/videos", async ({ params: { id }, query: { sort } }, res) => {
	try {
		const topic = await Topic.findById(id);
		if (!topic) {
			throw new Error(
				"This topic does not exist. Change the topic field and try again."
			);
		}
		// Populate will find every Videos which has the "topic" field equal to the received Topic ID
		await topic.populate("videos").execPopulate();

		// Sorting the videos if requested
		if (sort === "alphabetically") {
			const sortedTopicVideos = sortVideosAlphabetically(topic.videos);
			res.status(200).send({ topic, videos: sortedTopicVideos });
			return;
		}

		res.status(200).send({ topic, videos: topic.videos });
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

		// Checking if the requested updates matches with the allowed updates
		// If it matches, then update the field in the database. If not, don't do anything
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
		// Throw an error if the topic wasn't found
		if (!deletedTopic) {
			throw new Error("This topics does not exist.");
		}
		// Deleting the Topic Videos
		const deletedTopicVideos = await Video.find({ topic: id });
		await Video.deleteMany({ topic: id });

		res.status(200).send({ deletedTopic, deletedTopicVideos });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
