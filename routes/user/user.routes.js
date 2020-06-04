const express = require("express");
const validator = require("validator");
const User = require("../../models/user/user.model");
const Note = require("../../models/note/note.model");

const router = new express.Router();

router.get("/", async (req, res) => {
	try {
		const users = await User.find({});
		res.status(200).send(users);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.post("/", async ({ body: { name, email, password } }, res) => {
	try {
		// Checking if the user email is already being used
		const isEmailUnavailable = await User.findOne({ email });
		if (isEmailUnavailable) {
			throw new Error("This email is already in use. Change it and try again.");
		}

		// Checking if the received email is a valid one
		if (!validator.isEmail(email)) {
			throw new Error("Please insert a valid email and try again.");
		}

		// Creating the user
		const user = new User({ name, email, password });
		await user.save();

		res.status(201).send(user);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.patch("/:id", async ({ body, params: { id } }, res) => {
	try {
		const userToUpdate = await User.findById(id);

		// Setting the allowed updates and taking the requested updates
		const allowedUpdates = ["name", "password"];
		const requestedUpdates = Object.entries(body);

		for (update of requestedUpdates) {
			if (allowedUpdates.includes(update)) {
				userToUpdate[update] = body[update];
			}
		}

		await userToUpdate.save();

		res.status(200).send(userToUpdate);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.delete("/:id", async ({ body, params: { id } }, res) => {
	try {
		const deletedUser = await User.findByIdAndDelete(id);
		// Deleting the user notes
		await Note.deleteMany({ owner: id });

		res.status(200).send(deletedUser);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
