const mongoose = require('mongoose');

mongoose.connect(
	`mongodb+srv://guest:${process.env.GUEST_DB_PASSWORD}@zero-to-dev-cluster-laakt.gcp.mongodb.net/test?retryWrites=true&w=majority`,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	}
);
