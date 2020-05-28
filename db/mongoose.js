const mongoose = require("mongoose");

mongoose.connect(
	`mongodb+srv://fmrocha:${process.env.DB_PASSWORD}@zero-to-dev-cluster-laakt.gcp.mongodb.net/test?retryWrites=true&w=majority`,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	}
);
