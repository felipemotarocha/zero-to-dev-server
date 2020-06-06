const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
	},
	profileImage: {
		type: String,
	},
	googleId: {
		type: String,
	},
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
});

userSchema.virtual("notes", {
	ref: "Note",
	localField: "_id",
	foreignField: "owner",
});

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });

	// Checking if the user was found.
	if (!user) {
		throw new Error(
			"An error occurred in trying to login. Check the data and try again."
		);
	}

	// Checking if password is valid.
	const isValidPassword = await bcrypt.compare(password, user.password);
	if (!isValidPassword) {
		throw new Error(
			"An error occurred in triying to login. Check the data and try again."
		);
	}

	return user;
};

userSchema.methods.generateAuthToken = async function () {
	// this = user

	// Creating the token using the secret key
	const token = jwt.sign(
		{ _id: this._id.toString() },
		process.env.JWT_SECRET_KEY
	);

	// Adding the generated token to the user tokens array
	this.tokens = this.tokens.concat({ token });
	await this.save();

	return token;
};

userSchema.pre("save", async function (next) {
	// this = user that is being saved.

	// Checking if the user password has more than 7 characters
	// Note: the user just has a password if he is not signing in with Google
	if (!this.googleId && this.password.length < 7) {
		throw new Error("The password must contain at least 7 characters.");
	}

	// If the password has more than 7 characters, proceed with the hashing
	// Checking if password is being modified.
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 8);
	}

	next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
