const jwt = require("jsonwebtoken");
const User = require("../../models/user/user.model");

const auth = async (req, res, next) => {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

		const user = await User.findOne({
			_id: decoded._id,
			"tokens.token": token,
		});

		if (!user) {
			throw new Error("Please authenticate and try again.");
		}

		// Sending the authenticated user and his token to the route with the middleware
		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		res.status(500).send("Please authenticate and try again.");
	}
};

module.exports = auth;
