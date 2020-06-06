const express = require("express");
const validator = require("validator");
const auth = require("../../middlewares/auth/auth.middleware");
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

router.get("/me", auth, async (req, res) => {
	try {
		res.status(200).send(req.user);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.post("/", async ({ body }, res) => {
	try {
		const { name, email, password } = body;
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
		const user = new User(body);
		const token = await user.generateAuthToken();
		await user.save();

		res.status(201).send({ user, token });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.post("/login", async ({ body: { email, password } }, res) => {
	try {
		const user = await User.findByCredentials(email, password);
		const token = await user.generateAuthToken();
		res.status(200).send({ user, token });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.post(
	"/oauth/google",
	async ({ body: { email, name, googleId, profileImage } }, res) => {
		try {
			const foundUser = await User.findOne({ email });
			// User doesn't have an account
			if (!foundUser) {
				const newUser = new User({ googleId, email, name, profileImage });
				const token = await newUser.generateAuthToken();
				res.status(200).send({ user: newUser, token });
				return;
			}
			// User already has an account
			if (!foundUser.googleId) {
				foundUser.googleId = googleId;
				await foundUser.save();
			}
			const token = await foundUser.generateAuthToken();
			res.status(200).send({ user: foundUser, token });
		} catch (err) {
			res.status(500).send(err.message);
		}
	}
);

router.post("/logout", auth, async (req, res) => {
	try {
		const { user } = req;
		user.tokens = user.tokens.filter((token) => token.token !== req.token);
		await user.save();
		res.status(200).send(req.user);
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

router.delete("/:id", async ({ params: { id } }, res) => {
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
