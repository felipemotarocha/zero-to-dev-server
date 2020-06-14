const sortVideosAlphabetically = (videos) => {
	return videos.sort(function (a, b) {
		// Since the video titles are "Aula #01", "Aula #02" and so on we are splitting it to only get the class number (01, 02)
		// It's important to know that those class titles are a pattern of the app and you must follow it
		var textA = a.order;
		var textB = b.order;
		return textA < textB ? -1 : textA > textB ? 1 : 0;
	});
};

module.exports = {
	sortVideosAlphabetically,
};
